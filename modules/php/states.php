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
            self::notifyAllPlayers('lastTurn', clienttranslate('${player_name} reaches 20 points, it\'s last turn !'), [
                'playerId' => $playerId,
                'player_name' => self::getActivePlayerName(),
            ]);
        }

        if ($remainingCardsInDeck > 0) {

            $machines = $this->getMachinesFromDb($this->machines->pickCards(min($remainingCardsInDeck, $cardNumberToRefill), 'deck', $playerId));

            self::notifyPlayer($playerId, 'addMachinesToHand', '', [
                'machines' => $machines,
                'from' => 0,
            ]);
        }

        $this->gamestate->nextState('nextPlayer');
    }

    function stCompleteProjects() {         

        $playerId = self::getActivePlayerId();     

        // security check
        // TODO

        $completeProjectsData = $this->getGlobalVariable(COMPLETED_PROJECTS);

        $discardedMachines = [];
        $dicardedProjects = [];

        foreach ($completeProjectsData as $completeProjectData) {
            $project = $completeProjectData->project;
            $dicardedProjects[] = $project;
            $this->incPlayerScore($playerId, $project->points);

            // TODO handle discarded machine choice (when 3 blue machines for example)
            $machinesToCompleteProject = $completeProjectData->machines;
            $discardedMachines = array_merge($discardedMachines, $machinesToCompleteProject);

            self::notifyAllPlayers('removeProject', clienttranslate('${player_name} completes project ${projectImage}'), [
                'playerId' => $playerId,
                'player_name' => self::getActivePlayerName(),
                'project' => $project,
                'projectImage' => $this->getUniqueId($project),
            ]);
        }
        $this->machines->moveCards(array_map(function($machine) { return $machine->id; }, $discardedMachines), 'discard');
        $this->projects->moveCards(array_map(function($project) { return $project->id; }, $dicardedProjects), 'discard');

        
        self::notifyAllPlayers('discardPlayerMachines', '', [
            'machines' => $discardedMachines,
        ]);
        
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
        $sqlCharcoaliumPerPlayer = "SELECT player_id, COALESCE(`resources`.charcoalium_count, 0) as charcoalium FROM `player` left outer join (SELECT card_location_arg, count(*) as `charcoalium_count` FROM `resource` where `card_type` = 0 and `card_location` = 'player' group by card_location_arg) as  `resources` on `player`.player_id = `resources`.card_location_arg";
        $charcoaliumPerPlayer = array_values(self::getCollectionFromDb("SELECT player_id, COALESCE(`resources`.charcoalium_count, 0) as charcoalium FROM `player` left outer join (SELECT card_location_arg, count(*) as `charcoalium_count` FROM `resource` where `card_type` = 0 and `card_location` = 'player' group by card_location_arg) as  `resources` on `player`.player_id = `resources`.card_location_arg"));
        $charcoaliumEquality = intval($charcoaliumPerPlayer[0]['charcoalium']) == intval($charcoaliumPerPlayer[1]['charcoalium']);
        $signForUpdate = $charcoaliumEquality ? '>' : '=';

        $sqlUpdateScoreAux = "UPDATE `player`, (SELECT card_location_arg as `player_id`, count(*) as `count` FROM `resource` where `card_type` $signForUpdate 0 and `card_location` = 'player' group by card_location_arg) AS `src` SET `player`.`player_score_aux` = `src`.`count` WHERE `player`.`player_id` = `src`.`player_id`";
        self::DbQuery($sqlUpdateScoreAux);

        parent::stGameEnd();
    }
}
