<?php

require_once(__DIR__.'/objects/machine.php');
require_once(__DIR__.'/objects/project.php');
require_once(__DIR__.'/objects/resource.php');
require_once(__DIR__.'/objects/apply-effect-context.php');

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

        $this->gamestate->nextState('choosePlayAction');
    }
  	
    public function repairMachine(int $id) {
        self::checkAction('repairMachine'); 
        
        $playerId = intval(self::getActivePlayerId());

        $machine = $this->getMachineFromDb($this->machines->getCard($id));

        $canSpend = $this->getCanSpend($playerId);
        $tableMachines = $this->getMachinesFromDb($this->machines->getCardsInLocation('table'));

        $cost = $this->getMachineCost($machine, $tableMachines);
        if (!$this->canPay($canSpend, $cost)) {
            throw new Error('Not enough resources');
        }

        $costForPlayer = $this->getMachineCostForPlayerBeforeJoker($playerId, $machine, $tableMachines);

        // TODO handle jokers

        $machineSpot = $machine->location_arg;
        // place charcoalium on cards
        if (array_key_exists(0, $costForPlayer)) {
            for ($i=1; $i<=$costForPlayer[0]; $i++) {
                $this->removeResource($playerId, 1, 0, $machineSpot + $i);
            }
        }
        // pay other resources
        for ($i=1; $i<=3; $i++) {
            if (array_key_exists($i, $costForPlayer)) {
                $this->removeResource($playerId, $costForPlayer[$i], $i);
            }
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
        
        $this->removeEmptySpaceFromTable();
        
        $this->checkPlayerWorkshopMachinesLimit($playerId);

        $this->gamestate->nextState(count($this->getCompleteProjects($playerId, $machine)) > 0 ? 'chooseProject' : 'nextPlayer');
    }

    public function getCharcoalium() {
        self::checkAction('getCharcoalium'); 
        
        $playerId = self::getActivePlayerId();

        $machine = $this->getMachineFromDb($this->machines->getCard(self::getGameStateValue(PLAYED_MACHINE)));

        $this->addResource($playerId, $machine->points, 0);

        self::notifyAllPlayers('machinePlayedGetCharcoalium', clienttranslate('${player_name} wins ${charcoalium} charcoalium(s) with played machine'), [
            'playerId' => $playerId,
            'player_name' => self::getActivePlayerName(),
            'charcoalium' => $machine->points,
        ]);

        $this->gamestate->nextState('refillHand');
    }
  	
    public function getResource(int $resource) {
        self::checkAction('getResource'); 
        
        $playerId = self::getActivePlayerId();

        $machine = $this->getMachineFromDb($this->machines->getCard(self::getGameStateValue(PLAYED_MACHINE)));

        if (($machine->produce == 9 && ($resource < 1 || $resource > 3)) || ($machine->produce != 9 && $machine->produce != $resource)) {
            throw new Error("Machine doesn't produce this resource");
        }

        $this->addResource($playerId, 1, $resource);

        self::notifyAllPlayers('machinePlayedGetResource', clienttranslate('${player_name} wins 1 ${resourceName} with played machine'), [
            'playerId' => $playerId,
            'player_name' => self::getActivePlayerName(),
            'resourceName' => $this->getResourceName($resource),
            'resourceType' => $resource,
        ]);

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

        $this->gamestate->nextState($transition != null ? $transition : 'refillHand');
    }

    public function selectProjects(array $ids) {   

        $playerId = self::getActivePlayerId();     

        // security check
        $machine = $this->getMachineFromDb($this->machines->getCard(self::getGameStateValue(PLAYED_MACHINE)));
        $completeProjects = $this->getCompleteProjects($playerId, $machine);
        foreach($ids as $id) {
            if (!$this->array_some($completeProjects, function ($p) use ($id) { return $p->id == $id; })) {
                throw new Error("Selected project cannot be completed");
            }
        }

        $projects = $this->getProjectsFromDb($this->projects->getCards($ids));

        $playerMachines = $this->getMachinesFromDb($this->machines->getCardsInLocation('player', $playerId));

        $discardedMachines = [];

        foreach ($projects as $project) {
            $machinesToCompleteProject = $this->machinesToCompleteProject($project, $playerMachines, $machine);

            $this->incPlayerScore($playerId, $project->points);

            $discardedMachines = array_merge($discardedMachines, $machinesToCompleteProject);
        }
        $this->machines->moveCards(array_map(function($machine) { return $machine->id; }, $discardedMachines), 'discard');
        $this->projects->moveCards($ids, 'discard');

        
        self::notifyAllPlayers('discardPlayerMachines', '', [
            'machines' => $discardedMachines,
        ]);

        self::notifyAllPlayers('removeProjects', clienttranslate('${player_name} completes ${number} project(s)'), [
            'playerId' => $playerId,
            'player_name' => self::getActivePlayerName(),
            'projects' => $projects,
            'number' => count($projects),
        ]);

        // TODO handle discarded machine choice (when 3 blue machines for example)

        $this->gamestate->nextState('nextPlayer');
    }

    public function selectMachine(int $id) {
        self::checkAction('selectMachine'); 
        
        $playerId = self::getActivePlayerId();

        $selectableMachines = $this->getSelectableMachinesForChooseAction($playerId);
        if (!$this->array_some($selectableMachines, function ($m) use ($id) { return $m->id == $id; })) {
            throw new Error("Selected machine cannot be player or repaired");
        }

        $machine = $this->getMachineFromDb($this->machines->getCard(self::getGameStateValue(PLAYED_MACHINE)));

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

        $projects = $this->getProjectsFromDb($this->projects->getCardsOnTop(2, 'deck'));
        if (!$this->array_some($projects, function ($p) use ($id) { return $p->id == $id; })) {
            throw new Error("Selected project cannot be added to workshop");
        }
        
        $playerId = self::getActivePlayerId();

        $machine = $this->getMachineFromDb($this->machines->getCard(self::getGameStateValue(PLAYED_MACHINE)));

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
            throw new Error("Resource(s) cannot be selected");
        }
        
        $playerId = self::getActivePlayerId();

        $machine = $this->getMachineFromDb($this->machines->getCard(self::getGameStateValue(PLAYED_MACHINE)));

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
            throw new Error("Exchange cannot be selected");
        }

        $machine = $this->getMachineFromDb($this->machines->getCard(self::getGameStateValue(PLAYED_MACHINE)));

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
}
