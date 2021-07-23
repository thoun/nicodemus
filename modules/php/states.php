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

    function stGameEnd() {
        $players = $this->getPlayers(true);

        $sqlCharcoaliumPerPlayer = "SELECT player_id, COALESCE(`resources`.charcoalium_count, 0) as charcoalium FROM `player` left outer join (SELECT card_location_arg, count(*) as `charcoalium_count` FROM `resource` where `card_type` = 0 and `card_location` = 'player' group by card_location_arg) as  `resources` on `player`.player_id = `resources`.card_location_arg";
        $charcoaliumPerPlayer = array_values(self::getCollectionFromDb("SELECT player_id, COALESCE(`resources`.charcoalium_count, 0) as charcoalium FROM `player` left outer join (SELECT card_location_arg, count(*) as `charcoalium_count` FROM `resource` where `card_type` = 0 and `card_location` = 'player' group by card_location_arg) as  `resources` on `player`.player_id = `resources`.card_location_arg"));
        $charcoaliumEquality = intval($sqlCharcoaliumPerPlayer[0]['charcoalium']) == intval($sqlCharcoaliumPerPlayer[1]['charcoalium']);
        $signForUpdate = $charcoaliumEquality ? '>' : '=';

        $sqlUpdateScoreAux = "UPDATE `player`, (SELECT card_location_arg as `player_id`, count(*) as `count` FROM `resource` where `card_type` $signForUpdate 0 and `card_location` = 'player' group by card_location_arg) AS `src` SET `player`.`player_score_aux` = `src`.`count` WHERE `player`.`player_id` = `src`.`player_id`";
        self::DbQuery($sqlUpdateScoreAux);

        parent::stGameEnd();
    }
}
