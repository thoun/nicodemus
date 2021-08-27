<?php

require_once(__DIR__.'/objects/machine.php');
require_once(__DIR__.'/objects/project.php');
require_once(__DIR__.'/objects/resource.php');
require_once(__DIR__.'/objects/apply-effect-context.php');
require_once(__DIR__.'/objects/complete-project.php');

trait ActionTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    //////////// 
    
    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in nicodemus.action.php)
    */
    
    public function playMachine(int $id) {
        self::checkAction('playMachine'); 
        
        $playerId = intval(self::getActivePlayerId());

        $selectableMachines = $this->getSelectableMachinesForChooseAction($playerId);
        if (!$this->array_some($selectableMachines, function ($m) use ($id) { return $m->id == $id; })) {
            throw new BgaUserException("This machine cannot be played");
        }

        $freeTableSpot = $this->countMachinesOnTable() + 1;
        $this->machines->moveCard($id, 'table', $freeTableSpot);
        self::setGameStateValue(PLAYED_MACHINE, $id);

        $machine = $this->getMachineFromDb($this->machines->getCard($id));

        self::notifyAllPlayers('machinePlayed', clienttranslate('${player_name} plays ${machine_type} machine ${machineImage}'), [
            'playerId' => $playerId,
            'player_name' => self::getActivePlayerName(),
            'machine' => $machine,
            'machine_type' => $this->getColorName($machine->type),
            'machineImage' => $this->getUniqueId($machine),
        ]);

        self::incStat(1, 'playedMachines');
        self::incStat(1, 'playedMachines', $playerId);

        $this->gamestate->nextState('choosePlayAction');
    }
  	
    public function repairMachine(int $id, object $payment) {
        self::checkAction('repairMachine'); 
        
        $playerId = intval(self::getActivePlayerId());

        $selectableMachines = $this->getSelectableMachinesForChooseAction($playerId);
        if (!$this->array_some($selectableMachines, function ($m) use ($id) { return $m->id == $id; })) {
            throw new BgaUserException("This machine cannot be repaired");
        }

        $machine = $this->getMachineFromDb($this->machines->getCard($id));

        $canSpend = $this->getCanSpend($playerId);
        $tableMachines = $this->getMachinesFromDb($this->machines->getCardsInLocation('table'));

        $cost = $this->getMachineCost($machine, $tableMachines);
        if (!$this->canPay($canSpend, $cost)) {
            throw new BgaUserException('Not enough resources');
        }

        $costForPlayer = $this->getMachineCostForPlayerBeforeJoker($playerId, $machine, $tableMachines);

        $machineSpot = $machine->location_arg;
        // place charcoalium on cards
        if (array_key_exists(0, $costForPlayer)) {
            for ($i=1; $i<=$costForPlayer[0]; $i++) {
                $this->removeResource($playerId, 1, 0, $machineSpot + $i);
            }
        }
        // pay other resources
        /*for ($i=1; $i<=3; $i++) {
            if (array_key_exists($i, $costForPlayer)) {
                $this->removeResource($playerId, $costForPlayer[$i], $i);
            }
        }*/
        // handle jokers
        $remainingCost = [
            0 => 0,
            1 => 0,
            2 => 0,
            3 => 0,
        ];
        foreach($payment->remainingCost as $resource) {
            $remainingCost[$resource]++;
        }
        for ($i=1; $i<=3; $i++) {
            $this->removeResource($playerId, $remainingCost[$i], $i);
        }        

        self::setGameStateValue(PLAYED_MACHINE, $id);
        $this->machines->moveCard($id, 'player', $playerId);

        $this->incPlayerScore($playerId, $machine->points);

        $machineResources = $this->getResourcesFromDb($this->resources->getCardsInLocation('machine', $id));
        $this->moveResources($playerId, 0, $machineResources);

        self::notifyAllPlayers('machineRepaired', clienttranslate('${player_name} repairs ${machine_type} machine ${machineImage}'), [
            'playerId' => $playerId,
            'player_name' => self::getActivePlayerName(),
            'machine' => $machine,
            'machine_type' => $this->getColorName($machine->type),
            'machineSpot' => $machineSpot,
            'machineImage' => $this->getUniqueId($machine),
        ]);

        self::incStat(1, 'repairedMachines');
        self::incStat(1, 'repairedMachines', $playerId);

        self::incStat($machine->points, 'pointsWithRepairedMachines');
        self::incStat($machine->points, 'pointsWithRepairedMachines', $playerId);
        
        $this->removeEmptySpaceFromTable();

        $this->gamestate->nextState(count($this->getCompleteProjects($playerId, $machine)) > 0 ? 'chooseProject' : 'nextPlayer');
    }

    public function getCharcoalium() {
        self::checkAction('getCharcoalium'); 
        
        $playerId = self::getActivePlayerId();

        $machine = $this->getMachineFromDb($this->machines->getCard(self::getGameStateValue(PLAYED_MACHINE)));

        $this->addResource($playerId, $machine->points, 0);

        self::notifyAllPlayers('machinePlayedGetCharcoalium', clienttranslate('${player_name} gains ${charcoalium} charcoalium(s) with played machine'), [
            'playerId' => $playerId,
            'player_name' => self::getActivePlayerName(),
            'charcoalium' => $machine->points,
        ]);

        self::incStat(1, 'playedMachinesForCharcoalium');
        self::incStat(1, 'playedMachinesForCharcoalium', $playerId);

        $this->gamestate->nextState('refillHand');
    }
  	
    public function getResource(int $resource) {
        self::checkAction('getResource'); 
        
        $playerId = self::getActivePlayerId();

        $machine = $this->getMachineFromDb($this->machines->getCard(self::getGameStateValue(PLAYED_MACHINE)));

        if (($machine->produce == 9 && ($resource < 1 || $resource > 3)) || ($machine->produce != 9 && $machine->produce != $resource)) {
            throw new BgaUserException("Machine doesn't produce this resource");
        }

        $this->addResource($playerId, 1, $resource);

        self::notifyAllPlayers('machinePlayedGetResource', clienttranslate('${player_name} gains 1 ${resourceName} with played machine'), [
            'playerId' => $playerId,
            'player_name' => self::getActivePlayerName(),
            'resourceName' => $this->getResourceName($resource),
            'resourceType' => $resource,
            'i18n' => ['resourceName'],
        ]);

        self::incStat(1, 'playedMachinesForResource');
        self::incStat(1, 'playedMachinesForResource', $playerId);

        $this->gamestate->nextState('refillHand');
    }
  	
    public function applyEffect() {
        self::checkAction('applyEffect'); 
        
        $playerId = self::getActivePlayerId();

        $machine = $this->getMachineFromDb($this->machines->getCard(self::getGameStateValue(PLAYED_MACHINE)));

        $context = new ApplyEffectContext();
        $this->setGlobalVariable(APPLY_EFFECT_CONTEXT, $context);

        $transition = $this->applyMachineEffect($playerId, $machine, $context);

        self::notifyAllPlayers('machinePlayedApplyEffect', clienttranslate('${player_name} chooses to apply effect of played machine'), [
            'playerId' => $playerId,
            'player_name' => self::getActivePlayerName(),
        ]);

        self::incStat(1, 'playedMachinesForWithEffect');
        self::incStat(1, 'playedMachinesForWithEffect', $playerId);

        $this->gamestate->nextState($transition != null ? $transition : 'refillHand');
    }

    public function selectProjects(array $ids) {   

        $playerId = self::getActivePlayerId();     

        // security check
        $machine = $this->getMachineFromDb($this->machines->getCard(self::getGameStateValue(PLAYED_MACHINE)));
        $completeProjects = $this->getCompleteProjects($playerId, $machine);
        foreach($ids as $id) {
            if (!$this->array_some($completeProjects, function ($p) use ($id) { return $p->id == $id; })) {
                throw new BgaUserException("Selected project cannot be completed");
            }
        }

        $projects = $this->getProjectsFromDb($this->projects->getCards($ids));

        $playerMachines = $this->getMachinesFromDb($this->machines->getCardsInLocation('player', $playerId));

        $discardedMachines = [];

        $completeProjectsData = [];

        $canAutoResolveProjects = true;
        foreach ($projects as $project) {
            $machinesToCompleteProject = $this->machinesToCompleteProject($project, $playerMachines, $machine);
            $machinesNumberToCompleteProject = $this->machinesNumberToCompleteProject($project);

            $completeProjectsData[] = new CompleteProject($project, $machine, $machinesToCompleteProject, $machinesNumberToCompleteProject);

            if (count($machinesToCompleteProject) > $machinesNumberToCompleteProject) {
                $canAutoResolveProjects = false;
            }
        }

        // if it's only "2 equals machines" project, it's useless to ask player which to discard
        if (count($completeProjectsData) == 1 && $completeProjectsData[0]->project->type == 2 && $completeProjectsData[0]->project->subType == 0 && count($completeProjectsData[0]->machines) > $completeProjectsData[0]->machinesNumber) {
            $completeProjectsData[0]->machines = array_slice($completeProjectsData[0]->machines, 0, $completeProjectsData[0]->machinesNumber);
            $canAutoResolveProjects = true;
        }

        $this->setGlobalVariable(COMPLETED_PROJECTS, $completeProjectsData);

        $this->gamestate->nextState($canAutoResolveProjects ? 'completeProjects' : 'chooseProjectDiscardedMachine');
    }

    public function skipSelectProjects() {
        self::checkAction('skipSelectProjects'); 

        $this->gamestate->nextState('nextPlayer');
    }

    public function selectMachine(int $id) {
        self::checkAction('selectMachine'); 
        
        $playerId = self::getActivePlayerId();

        $selectableMachines = $this->selectableMachinesForEffect();
        if (!$this->array_some($selectableMachines, function ($m) use ($id) { return $m->id == $id; })) {
            throw new BgaUserException("This machine cannot be selected for effect");
        }

        $machine = $this->getMachineForEffect();

        $context = $this->getApplyEffectContext();
        if ($machine->type == 4 && $machine->subType) {
            $context->mimicCardId = $id;
        } else {
            $context->selectedCardId = $id;
        }
        $this->setGlobalVariable(APPLY_EFFECT_CONTEXT, $context);

        $transition = $this->applyMachineEffect($playerId, $machine, $context);

        $this->gamestate->nextState($transition != null ? $transition : 'refillHand');
    }

    public function selectProject(int $id) {
        self::checkAction('selectProject'); 

        $projects = $this->getProjectsFromDb($this->projects->getCardsInLocation('projectSelection'));
        if (!$this->array_some($projects, function ($p) use ($id) { return $p->id == $id; })) {
            throw new BgaUserException("Selected project cannot be added to workshop");
        }
        
        $playerId = self::getActivePlayerId();

        $machine = $this->getMachineForEffect();

        $context = $this->getApplyEffectContext();
        $context->selectedCardId = $id;
        $this->setGlobalVariable(APPLY_EFFECT_CONTEXT, $context);

        $transition = $this->applyMachineEffect($playerId, $machine, $context);

        $this->gamestate->nextState($transition != null ? $transition : 'refillHand');
    }

    public function selectResource(array $resourcesTypes) {
        self::checkAction('selectResource'); 

        $possibleCombinations = $this->getSelectResourceCombinations();
        if (!$this->array_some($possibleCombinations, function ($comb) use ($resourcesTypes) { return $this->array_identical($comb, $resourcesTypes); })) {
            throw new BgaUserException("Resource(s) cannot be selected");
        }
        
        $playerId = self::getActivePlayerId();

        $machine = $this->getMachineForEffect();

        $context = $this->getApplyEffectContext();
        $context->selectedResources = $resourcesTypes;
        $this->setGlobalVariable(APPLY_EFFECT_CONTEXT, $context);

        $transition = $this->applyMachineEffect($playerId, $machine, $context);

        $this->gamestate->nextState($transition != null ? $transition : 'refillHand');
    }

    public function selectExchange(int $from, int $to) {
        self::checkAction('selectExchange'); 
        
        $playerId = self::getActivePlayerId();

        $possibleExchanges = $this->getPossibleExchanges($playerId);
        if (!$this->array_some($possibleExchanges, function ($possibleExchange) use ($from, $to) { return $possibleExchange->from == $from && $possibleExchange->to == $to; })) {
            throw new BgaUserException("Exchange cannot be selected");
        }

        $machine = $this->getMachineForEffect();

        $this->removeResource($playerId, 1, $from);
        $this->addResource($playerId, 1, $to);

        $context = $this->getApplyEffectContext();
        $context->exchanges += 1;
        $this->setGlobalVariable(APPLY_EFFECT_CONTEXT, $context);

        $transition = $this->applyMachineEffect($playerId, $machine, $context);
        
        self::notifyAllPlayers('selectExchangeNotif', clienttranslate('${player_name} exchanges ${resourceFromName} to get ${resourceToName}'), [
            'playerId' => $playerId,
            'player_name' => self::getActivePlayerName(),
            'resourceFromName' => $this->getResourceName($from),
            'resourceFromType' => $from,
            'resourceToName' => $this->getResourceName($to),
            'resourceToType' => $to,
        ]);

        $this->gamestate->nextState($transition != null ? $transition : 'refillHand');
    }

    public function skipExchange() {
        self::checkAction('skipExchange'); 

        $this->gamestate->nextState('refillHand');
    }

    public function discardSelectedMachines(array $completeProjectsParameter) {
        self::checkAction('discardSelectedMachines'); 

        $completeProjects = $this->getGlobalVariable(COMPLETED_PROJECTS);

        foreach ($completeProjects as &$project) {
            // we only keep $selectedMachinesIds from parameter
            $completeProjectParameter = $this->array_find($completeProjectsParameter, function ($cp) use ($project) { return $cp->project->id == $project->project->id; });
            if ($completeProjectParameter == null) {
                throw new BgaUserException("Missing project informations");
            }
            
            $selectedMachinesIds = $completeProjectParameter->selectedMachinesIds;
            if (count($selectedMachinesIds) != $project->machinesNumber) {
                throw new BgaUserException("Should select $project->machinesNumber, but only selected ".count($selectedMachinesIds));
            }
            if (!$this->array_some($selectedMachinesIds, function ($id) use ($project) { return $project->mandatoryMachine->id == $id; })) {
                throw new BgaUserException("Last played machine should be on selection");
            }

            // we update machines linked to project with selectedMachinesIds
            $project->machines = array_values(array_filter($project->machines, function($machine) use ($selectedMachinesIds) {
                return $this->array_some($selectedMachinesIds, function($id) use ($machine) {  return $machine->id == $id; });
            }));
        }

        $this->setGlobalVariable(COMPLETED_PROJECTS, $completeProjects);

        $this->gamestate->nextState('completeProjects');
    }
}
