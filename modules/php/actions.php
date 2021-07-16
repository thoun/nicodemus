<?php

require_once(__DIR__.'/objects/machine.php');
require_once(__DIR__.'/objects/project.php');
require_once(__DIR__.'/objects/charcoalium.php');
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
        
        $playerId = self::getActivePlayerId();

        $freeTableSpot = 1; // TODO
        $this->machines->moveCard($id, 'table', $freeTableSpot);

        self::setGameStateValue(PLAYED_MACHINE, $id);

        self::notifyAllPlayers('machinePlayed', clienttranslate('${player_name} plays ${machine_name}'), [
            'playerId' => $playerId,
            'player_name' => self::getActivePlayerName(),
            'machine' => $this->getMachineFromDb($this->machines->getCard($id)),
            'machine_name' => 'TODO',
        ]);

        $this->gamestate->nextState('choosePlayAction');
    }
  	
    public function repairMachine(int $id) {
        self::checkAction('repairMachine'); 
        
        $playerId = self::getActivePlayerId();

        $this->machines->moveCard($id, 'player', $playerId);

        self::notifyAllPlayers('machineRepaired', clienttranslate('${player_name} repairs ${machine_name}'), [
            'playerId' => $playerId,
            'player_name' => self::getActivePlayerName(),
            'machine' => $this->getMachineFromDb($this->machines->getCard($id)),
            'machine_name' => 'TODO',
        ]);
        
        // TODO

        $this->gamestate->nextState(true ? 'chooseProject' : 'nextPlayer');
    }

    public function getCharcoalium() {
        self::checkAction('getCharcoalium'); 
        
        $playerId = self::getActivePlayerId();

        $machine = $this->getMachineFromDb($this->machines->getCard(self::getGameStateValue(PLAYED_MACHINE)));

        $this->addCharcoalium($playerId, $machine->points);
        // TODO notif

        $this->gamestate->nextState('nextPlayer');
    }
  	
    public function getResource(int $resource) {
        self::checkAction('getResource'); 
        
        $playerId = self::getActivePlayerId();

        $machine = $this->getMachineFromDb($this->machines->getCard(self::getGameStateValue(PLAYED_MACHINE)));

        if (($machine->produce == 9 && ($resource < 1 || $resource > 3)) || ($machine->produce != 9 && $machine->produce != $resource)) {
            throw new Error("Machine doesn't produce this resource");
        }

        // TODO getResource

        $this->gamestate->nextState('nextPlayer');
    }
  	
    public function applyEffect() {
        self::checkAction('applyEffect'); 
        
        $playerId = self::getActivePlayerId();

        $machine = $this->getMachineFromDb($this->machines->getCard(self::getGameStateValue(PLAYED_MACHINE)));

        // TODO applyEffect

        $this->gamestate->nextState('nextPlayer');
    }

    public function selectProjects(array $ids) {
        // TODO

        $this->gamestate->nextState('nextPlayer');
    }
}
