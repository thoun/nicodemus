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
        $playerId = self::getActivePlayerId();

        $remainingCardsInDeck = intval($this->machines->countCardInLocation('deck'));
        $machineCountInHand = intval($this->machines->countCardInLocation('hand', $playerId));
        $cardNumberToRefill = 5 - $machineCountInHand;


        
        if ($remainingCardsInDeck < $cardNumberToRefill) {
            // no more cards in deck, end turn
            self::setGameStateValue(LAST_TURN, 1);
        }

        if ($remainingCardsInDeck > 0) {

            $machines = $this->getMachinesFromDb($this->machines->pickCards(min($remainingCardsInDeck, $cardNumberToRefill), 'deck', $playerId));

            self::notifyPlayer($playerId, 'addMachinesToHand', '', [
                'machines' => $machines,
            ]);
        }

        $this->gamestate->nextState('nextPlayer');
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
