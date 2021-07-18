<?php

require_once(__DIR__.'/objects/machine.php');
require_once(__DIR__.'/objects/project.php');
require_once(__DIR__.'/objects/resource.php');

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

        $machineSpot = null;
        $canSpend = $this->getCanSpend($playerId);
        $tableMachines = $this->getMachinesFromDb($this->machines->getCardsInLocation('table'));
        foreach($tableMachines as $tableMachine) {
            if ($tableMachine->id == $machine->id) {
                $machineSpot = $machine->location_arg;
                $cost = $this->getMachineCost($tableMachine, $tableMachines);
                if (!$this->canPay($canSpend, $cost)) {
                    throw new Error('Not enough resources');
                }
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

        $this->gamestate->nextState(count($this->getCompleteProjects($machine)) > 0 ? 'chooseProject' : 'nextPlayer');
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

        // TODO applyEffect

        $this->gamestate->nextState('refillHand');
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
}
