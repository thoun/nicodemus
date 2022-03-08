<?php

trait StateTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */

    function stSelectProject() {
        $remainingProjectsInDeck = intval($this->projects->countCardInLocation('deck'));

        if ($remainingProjectsInDeck == 0) {
            $this->gamestate->nextState('refillHand');
        }
    }

    function stRefillHand() {
        $playerId = self::getActivePlayerId();

        $remainingCardsInDeck = intval($this->machines->countCardInLocation('deck'));
        $machineCountInHand = intval($this->machines->countCardInLocation('hand', $playerId));
        $cardNumberToRefill = 5 - $machineCountInHand;


        
        if ($remainingCardsInDeck < $cardNumberToRefill && intval(self::getGameStateValue(LAST_TURN)) == 0) {
            // no more cards in deck, end turn
            self::setGameStateValue(LAST_TURN, 1);
            self::notifyAllPlayers('lastTurn', clienttranslate("There is not enough machines left on the deck, it's last turn !"), [
                'playerId' => $playerId,
                'player_name' => self::getActivePlayerName(),
            ]);
        }

        if ($remainingCardsInDeck > 0 && $machineCountInHand < 5) {

            $machines = $this->getMachinesFromDb($this->machines->pickCards(min($remainingCardsInDeck, $cardNumberToRefill), 'deck', $playerId));

            $this->notifAddHandMachines($playerId, $machines, 0);
        }

        $this->gamestate->nextState('nextPlayer');
    }

    function stCompleteProjects() {         

        $playerId = self::getActivePlayerId();

        $completeProjectsData = $this->getGlobalVariable(COMPLETED_PROJECTS);

        $discardedMachines = [];
        $discardedProjects = [];

        foreach ($completeProjectsData as $completeProjectData) {
            $project = $completeProjectData->project;
            $discardedProjects[] = $project;
            $this->incPlayerScore($playerId, $project->points);

            self::incStat($project->points, 'pointsWithCompletedProjects');
            self::incStat($project->points, 'pointsWithCompletedProjects', $playerId);

            $machinesToCompleteProject = $completeProjectData->machines;
            $discardedMachines = array_merge($discardedMachines, $machinesToCompleteProject);

            self::notifyAllPlayers('removeProject', clienttranslate('${player_name} completes project ${projectImage}'), [
                'playerId' => $playerId,
                'player_name' => self::getActivePlayerName(),
                'project' => $project,
                'projectImage' => $this->getUniqueId($project),
                'discardedMachines' => $machinesToCompleteProject,
            ]);
        }
        $this->machines->moveCards(array_map(function($machine) { return $machine->id; }, $discardedMachines), 'discard', $playerId);
        $this->projects->moveCards(array_map(function($project) { return $project->id; }, $discardedProjects), 'discard', $playerId);

        $projectsNumber = count($completeProjectsData);
        self::incStat($projectsNumber, 'completedProjects');
        self::incStat($projectsNumber, 'completedProjects', $playerId);

        
        self::notifyAllPlayers('discardPlayerMachines', '', [
            'machines' => $discardedMachines,
        ]);
        
        $this->gamestate->nextState('nextPlayer');
    }

    function stNextPlayer() {     
        $playerId = self::getActivePlayerId();

        self::incStat(1, 'turnsNumber');
        self::incStat(1, 'turnsNumber', $playerId);

        $this->clearTableRowIfNecessary();
        $this->checkPlayerWorkshopMachinesLimit($playerId);

        if (intval(self::getGameStateValue(LAST_TURN)) == 1 && $playerId != $this->getFirstPlayerId()) {
            $this->gamestate->nextState('endGame');
        } else {
            $this->activeNextPlayer();
        
            $playerId = self::getActivePlayerId();
            self::giveExtraTime($playerId);

            $this->gamestate->nextState('nextPlayer');
        }
    }

    function stGameEnd() {
        $charcoaliumPerPlayer = array_values(self::getCollectionFromDb("SELECT player_id, COALESCE(`resources`.charcoalium_count, 0) as charcoalium FROM `player` left outer join (SELECT card_location_arg, count(*) as `charcoalium_count` FROM `resource` where `card_type` = 0 and `card_location` = 'player' group by card_location_arg) as  `resources` on `player`.player_id = `resources`.card_location_arg"));
        $charcoaliumEquality = intval($charcoaliumPerPlayer[0]['charcoalium']) == intval($charcoaliumPerPlayer[1]['charcoalium']);
        $signForUpdate = $charcoaliumEquality ? '>' : '=';

        $sqlUpdateScoreAux = "UPDATE `player`, (SELECT card_location_arg as `player_id`, count(*) as `count` FROM `resource` where `card_type` $signForUpdate 0 and `card_location` = 'player' group by card_location_arg) AS `src` SET `player`.`player_score_aux` = `src`.`count` WHERE `player`.`player_id` = `src`.`player_id`";
        self::DbQuery($sqlUpdateScoreAux);

        parent::stGameEnd();
    }
}
