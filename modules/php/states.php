<?php

trait StateTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */

    function stRefillHand() {
        if (intval($this->machines->countCardInLocation('deck')) > 0) {
            $machine = $this->getMachineFromDb($this->machines->pickCard('deck', $playerId));
            // TODO notif
        } else {
            // no more cards in deck, end turn
            self::setGameStateValue(LAST_TURN, 1);
        }
    }

    function stNextPlayer() {
        $this->clearTableRowIfNecessary();

        if (intval(self::getGameStateValue(LAST_TURN)) == 1 && self::getActivePlayerId() != $this->getFirstPlayerId()) {
            $this->gamestate->nextState('endGame');
        } else {
            $this->activeNextPlayer();
        
            $playerId = self::getActivePlayerId();
            self::giveExtraTime($playerId);

            $this->gamestate->nextState('nextPlayer');
        }
    }
}
