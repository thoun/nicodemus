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

        $freeTableSpot = $this->getAvailableMachineSpot();
        $this->machines->moveCard($id, 'table', $freeTableSpot);
        self::setGameStateValue(PLAYED_MACHINE, $id);

        $machine = $this->getMachineFromDb($this->machines->getCard($id));

        self::notifyAllPlayers('machinePlayed', clienttranslate('${player_name} plays ${machine_name} machine'), [
            'playerId' => $playerId,
            'player_name' => self::getActivePlayerName(),
            'machine' => $machine,
            'machine_name' => $this->getColorName($machine->type),
        ]);

        $this->gamestate->nextState('choosePlayAction');
    }
  	
    public function repairMachine(int $id) {
        self::checkAction('repairMachine'); 
        
        $playerId = intval(self::getActivePlayerId());

        $machine = $this->getMachineFromDb($this->machines->getCard($id));

        $canSpend = $this->getCanSpend($playerId);
        $tableMachines = $this->getMachinesFromDb($this->machines->getCardsInLocation('table'));

        $machineSpot = $machine->location_arg;
        $cost = $this->getMachineCost($machine, $tableMachines);
        if (!$this->canPay($canSpend, $cost)) {
            throw new Error('Not enough resources');
        }

        $costForPlayer = $this->getMachineCostForPlayerBeforeJoker($playerId, $machine, $tableMachines);

        // TODO handle jokers

        for ($i=0; $i<=3; $i++) {
            if (array_key_exists($i, $costForPlayer)) {
                $this->removeResource($playerId, $costForPlayer[$i], $i);
            }
        }

        self::setGameStateValue(PLAYED_MACHINE, $id);
        $this->machines->moveCard($id, 'player', $playerId);

        $this->incPlayerScore($playerId, $machine->points);

        self::notifyAllPlayers('machineRepaired', clienttranslate('${player_name} repairs ${machine_name} machine'), [
            'playerId' => $playerId,
            'player_name' => self::getActivePlayerName(),
            'machine' => $machine,
            'machine_name' => $this->getColorName($machine->type),
            'machineSpot' => $machineSpot,
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

        $this->gamestate->nextState('refillHand');
    }
  	
    public function applyEffect() {
        self::checkAction('applyEffect'); 
        
        $playerId = self::getActivePlayerId();

        $machine = $this->getMachineFromDb($this->machines->getCard(self::getGameStateValue(PLAYED_MACHINE)));


        $context = new ApplyEffectContext();
        $this->setGlobalVariable(APPLY_EFFECT_CONTEXT, $context);

        $transition = $this->applyMachineEffect($playerId, $machine, $context);

        $this->gamestate->nextState($transition != null ? $transition : 'refillHand');
    }

    public function selectProjects(array $ids) {

        $projects = $this->getProjectsFromDb($this->projects->getCards($ids));

        foreach ($projects as $project) {
            $this->incPlayerScore($playerId, $project->points);

            // TODO remove project
            // TODO remove associated machines
        }
        // TODO notif

        $this->gamestate->nextState('nextPlayer');
    }

    public function selectMachine(int $id) {
        self::checkAction('selectMachine'); 
        
        $playerId = self::getActivePlayerId();

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
        
        $playerId = self::getActivePlayerId();

        $machine = $this->getMachineFromDb($this->machines->getCard(self::getGameStateValue(PLAYED_MACHINE)));

        $context = $this->getApplyEffectContext();
        $context->selectedResources = $resourcesTypes;
        $this->setGlobalVariable(APPLY_EFFECT_CONTEXT, $context);

        $transition = $this->applyMachineEffect($playerId, $machine, $context);

        $this->gamestate->nextState($transition != null ? $transition : 'refillHand');
    }

    public function selectExchange(array $exchanges) {
        self::checkAction('selectExchange'); 
        
        $playerId = self::getActivePlayerId();

        $machine = $this->getMachineFromDb($this->machines->getCard(self::getGameStateValue(PLAYED_MACHINE)));

        $context = $this->getApplyEffectContext();
        $context->exchanges = $exchanges;
        $this->setGlobalVariable(APPLY_EFFECT_CONTEXT, $context);

        $transition = $this->applyMachineEffect($playerId, $machine, $context);

        $this->gamestate->nextState($transition != null ? $transition : 'refillHand');
    }
}
