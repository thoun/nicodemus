<?php

require_once(__DIR__.'/objects/machine.php');
require_once(__DIR__.'/objects/project.php');
require_once(__DIR__.'/objects/carbonium.php');
require_once(__DIR__.'/objects/resource.php');

trait ActionTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    //////////// 
    
        /*
            Each time a player is doing some game action, one of the methods below is called.
            (note: each method below must match an input method in nicodemus.action.php)
        */
    
        /*
        
        Example:
    
        function playCard( $card_id )
        {
            // Check that this is the player's turn and that it is a "possible action" at this game state (see states.inc.php)
            self::checkAction( 'playCard' ); 
            
            $player_id = self::getActivePlayerId();
            
            // Add your game logic to play a card there 
            ...
            
            // Notify all players about the card played
            self::notifyAllPlayers( "cardPlayed", clienttranslate( '${player_name} plays ${card_name}' ), array(
                'player_id' => $player_id,
                'player_name' => self::getActivePlayerName(),
                'card_name' => $card_name,
                'card_id' => $card_id
            ) );
              
        }
        
        */

    
    public function playMachine(int $id) {
        self::checkAction('playMachine'); 
        
        $playerId = self::getActivePlayerId();

        $freeTableSpot = 1; // TODO
        $this->machines->moveCard($id, 'table', $freeTableSpot);

        self::setGameStateValue(PLAYED_MACHINE, $id);

        self::notifyAllPlayers('machinePlayed', clienttranslate('${player_name} plays ${card_name}'), [
            'playerId' => $playerId,
            'player_name' => self::getActivePlayerName(),
            'machine' => $this->getMachineFromDb($this->machines->getCard($id)),
        ]);

        $this->gamestate->nextState('choosePlayAction');
    }
  	
    public function fixMachine(int $id) {
        self::checkAction('fixMachine'); 
        
        $playerId = self::getActivePlayerId();

        $this->machines->moveCard($id, 'player', $playerId);

        self::notifyAllPlayers('machineFixed', clienttranslate('${player_name} fixes ${card_name}'), [
            'playerId' => $playerId,
            'player_name' => self::getActivePlayerName(),
            'machine' => $this->getMachineFromDb($this->machines->getCard($id)),
        ]);
        
        // TODO

        $this->gamestate->nextState(true ? 'chooseProject' : 'nextPlayer');
    }

    public function getCarbonium() {
        self::checkAction('getCarbonium'); 
        
        $playerId = self::getActivePlayerId();

        $machine = $this->getMachineFromDb($this->machines->getCard(self::getGameStateValue(PLAYED_MACHINE)));

        // TODO getCarbonium

        $this->gamestate->nextState('nextPlayer');
    }
  	
    public function getResource() {
        self::checkAction('getResource'); 
        
        $playerId = self::getActivePlayerId();

        $machine = $this->getMachineFromDb($this->machines->getCard(self::getGameStateValue(PLAYED_MACHINE)));

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
}
