<?php

require_once(__DIR__.'/objects/machine.php');
require_once(__DIR__.'/objects/project.php');
require_once(__DIR__.'/objects/charcoalium.php');
require_once(__DIR__.'/objects/resource.php');

trait UtilTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////

    function getMaxPlayerScore() {
        return intval(self::getUniqueValueFromDB("SELECT max(player_score) FROM player"));
    }

    function getFirstPlayerId() {
        return intval(self::getGameStateValue(FIRST_PLAYER));
    }
    function getOpponentId(int $playerId) {
        return intval(self::getUniqueValueFromDB("SELECT player_id FROM player WHERE player_id <> $playerId"));
    }

    function setupCards() {
        // 56 machine cards    
        $machines = [];
        foreach(array_keys($this->MACHINES) as $projectId) {
            $type = floor($projectId / 10);
            $machines[] = [ 'type' => $type, 'type_arg' => $projectId % 10, 'nbr' => $type == 3 ? 2 : 4 ];
        }
        $this->machines->createCards($machines, 'deck');
        $this->machines->shuffle('deck');
        
        //17 project tiles
        $projects = [];
        foreach(array_keys($this->PROJECTS) as $projectId) {
            $projects[] = [ 'type' => floor($projectId / 10), 'type_arg' => $projectId % 10, 'nbr' => 1 ];
        }
        $this->projects->createCards($projects, 'deck');
        $this->projects->shuffle('deck');

        //12 charcoaliums       
        $charcoaliums = [
            [ 'type' => 0, 'type_arg' => null, 'nbr' => 12 ],
        ];
        $this->charcoaliums->createCards($charcoaliums, 'table');

        //24 resources : 8 wood, 8 copper, 8 crystal        
        $resources = [
            [ 'type' => 1, 'type_arg' => null, 'nbr' => 8 ],
            [ 'type' => 2, 'type_arg' => null, 'nbr' => 8 ],
            [ 'type' => 3, 'type_arg' => null, 'nbr' => 8 ],
        ];
        $this->resources->createCards($resources, 'table');
    }

    function setInitialCardsAndResources(array $players) {
        // set table and players machines
        $this->machines->pickCardForLocation('deck', 'table', 1); 
        foreach($players as $playerId => $player) {
            $this->machines->pickCardsForLocation(5, 'deck', 'hand', $playerId);
        }

        // set table projects
        for ($i=1; $i<=6; $i++) {
            $this->projects->pickCardForLocation('deck', 'table', $i);
        }

        // set initial resources
        foreach($players as $playerId => $player) {
            if ($this->getFirstPlayerId() == $playerId) {
                $this->addCharcoalium($playerId, 2);
            } else {
                $this->addCharcoalium($playerId, 1);
                $this->addResource($playerId, 1, 1);
            }
        }
    }

    function getMachineFromDb($dbObject) {
        if (!$dbObject || !array_key_exists('id', $dbObject)) {
            throw new Error("machine doesn't exists ".json_encode($dbObject));
        }
        return new Machine($dbObject, $this->MACHINES);
    }

    function getMachinesFromDb(array $dbObjects) {
        return array_map(function($dbObject) { return $this->getMachineFromDb($dbObject); }, array_values($dbObjects));
    }

    function getProjectFromDb($dbObject) {
        if (!$dbObject || !array_key_exists('id', $dbObject)) {
            throw new Error("project doesn't exists ".json_encode($dbObject));
        }
        return new Project($dbObject, $this->PROJECTS);
    }

    function getProjectsFromDb(array $dbObjects) {
        return array_map(function($dbObject) { return $this->getProjectFromDb($dbObject); }, array_values($dbObjects));
    }

    function getCharcoaliumFromDb($dbObject) {
        if (!$dbObject || !array_key_exists('id', $dbObject)) {
            throw new Error("charcoalium doesn't exists ".json_encode($dbObject));
        }
        return new Charcoalium($dbObject);
    }

    function getCharcoaliumsFromDb(array $dbObjects) {
        return array_map(function($dbObject) { return $this->getCharcoaliumFromDb($dbObject); }, array_values($dbObjects));
    }

    function getResourceFromDb($dbObject) {
        if (!$dbObject || !array_key_exists('id', $dbObject)) {
            throw new Error("resource doesn't exists ".json_encode($dbObject));
        }
        return new Resource($dbObject);
    }

    function getResourcesFromDb(array $dbObjects) {
        return array_map(function($dbObject) { return $this->getResourceFromDb($dbObject); }, array_values($dbObjects));
    }

    function getAvailableMachineSpot() {
        return intval($this->machines->countCardInLocation('table')) + 1;
    }

    function getCharcoaliums() {
        $result = [
            0 => $this->getCharcoaliumsFromDb($this->charcoaliums->getCardsInLocation('table')),
        ];

        $players = $this->loadPlayersBasicInfos();
        foreach(array_keys($players) as $playerId) {
            $result[$playerId] = $this->getCharcoaliumsFromDb($this->charcoaliums->getCardsInLocation('player', $playerId));
        }

        return $result;
    }


    function getResources(int $type) {
        $result = [
            0 => $this->getResourcesFromDb($this->resources->getCardsOfTypeInLocation($type, null, 'table')),
        ];

        $players = $this->loadPlayersBasicInfos();
        foreach(array_keys($players) as $playerId) {
            $result[$playerId] = $this->getResourcesFromDb($this->resources->getCardsOfTypeInLocation($type, null, 'player', $playerId));
        }

        return $result;
    }
    
    function addCharcoalium(int $playerId, int $number) {
        $availableOnTable = intval($this->charcoaliums->countCardInLocation('table'));
        
        if ($availableOnTable >= $number) {
            $this->charcoaliums->pickCardsForLocation($number, 'table', 'player', $playerId);
        } else {
            $this->charcoaliums->pickCardsForLocation($availableOnTable, 'table', 'player', $playerId);
            $takeOnOpponent = $number - $availableOnTable;
            $opponentId = $this->getOpponentId($playerId);
            $opponentCharcoaliums = $this->getCharcoaliumsFromDb($this->charcoaliums->getCardsInLocation('player', $opponentId));
            $this->charcoaliums->moveCards(array_map(function ($r) { return $r->id; }, array_slice($opponentCharcoaliums, 0, min($takeOnOpponent, count($opponentCharcoaliums)))), 'player', $playerId);
        }

        self::notifyAllPlayers('charcoaliums', '', [
            'charcoaliums' => $this->getCharcoaliums(),
        ]);
    }

    function addResource(int $playerId, int $number, int $type) {
        $tableResources = $this->getResourcesFromDb($this->resources->getCardsOfTypeInLocation($type, null, 'table'));
        $availableOnTable = count($tableResources);
        
        if ($availableOnTable >= $number) {
            $resources = $this->getResourcesFromDb($this->resources->getCardsOfTypeInLocation($type, null, 'table'));
            $this->resources->moveCards(array_map(function ($r) { return $r->id; }, array_slice($tableResources, 0, $number)), 'player', $playerId);
        } else {
            $this->resources->moveCards(array_map(function ($r) { return $r->id; }, $tableResources), 'player', $playerId);
            $takeOnOpponent = $number - $availableOnTable;
            $opponentId = $this->getOpponentId($playerId);
            $opponentResources = $this->getResourcesFromDb($this->resources->getCardsOfTypeInLocation($type, null, 'player', $opponentId));
            $this->resources->moveCards(array_map(function ($r) { return $r->id; }, array_slice($opponentResources, 0, min($takeOnOpponent, count($opponentResources)))), 'player', $playerId);
        }

        self::notifyAllPlayers('resources', '', [
            'resourceType' => $type,
            'resources' => $this->getResources($type),
        ]);
    }

    function removeCharcoalium(int $playerId, int $number) {
        $playerCharcoaliums = $this->getCharcoaliumsFromDb($this->charcoaliums->getCardsInLocation('player', $playerId));
        $this->charcoaliums->moveCards(array_map(function ($r) { return $r->id; }, array_slice($playerCharcoaliums, 0, min($number, count($playerCharcoaliums)))), 'table');

        self::notifyAllPlayers('charcoaliums', '', [
            'charcoaliums' => $this->getCharcoaliums(),
        ]);
    }

    function removeResource(int $playerId, int $number, int $type) {
        $playerResources = $this->getResourcesFromDb($this->resources->getCardsOfTypeInLocation($type, null, 'player', $playerId));
        $this->resources->moveCards(array_map(function ($r) { return $r->id; }, array_slice($playerResources, 0, min($number, count($playerResources)))), 'table');

        self::notifyAllPlayers('resources', '', [
            'resourceType' => $type,
            'resources' => $this->getResources($type),
        ]);
    }

    function getPlayerScore(int $playerId) {
        return intval(self::getUniqueValueFromDB("SELECT player_score FROM player where `player_id` = $playerId"));
    }

    function incPlayerScore(int $playerId, int $incScore) {
        self::DbQuery("UPDATE player SET player_score = player_score + $incScore WHERE player_id = $playerId");

        if ($this->getMaxPlayerScore() >= 20) {
            self::setGameStateValue(LAST_TURN, 1);
        }

        self::notifyAllPlayers('points', '', [
            'playerId' => $playerId,
            'points' => $this->getPlayerScore($playerId),
        ]);
    }

    function getColorName(int $type) {
        $colorName = null;
        switch ($type) {
            case 1: $colorName = _('Production'); break;
            case 2: $colorName = _('Transformation'); break;
            case 3: $colorName = _('Attack'); break;
            case 4: $colorName = _('Special'); break;
        }
        return $colorName;
    }

    function getCompleteProjects(object $machine) {
        return [];
    }

    function clearTableRowIfNecessary() {
        if (intval($this->machines->countCardInLocation('table')) < 10) {
            return;
        }

        $machines = $this->getMachinesFromDb($this->machines->getCardsInLocation('table'));

        $row1machines = [];
        $row2machines = [];
        $removedCharcoaliums = [];

        foreach($machines as $machine) {
            if ($machine->location_arg > 5) {
                $row2machines[] = $machine;
            } else {
                $row1machines[] = $machine;
            }
        }

        foreach($row1machines as &$machine) {
            //$charcoaliums = $this->getCharcoaliumsFromDb($this->charcoaliums->getCardsInLocation('machine', $machine->id);
            $charcoaliums = $this->getCharcoaliumsFromDb($this->charcoaliums->moveAllCardsInLocation('machine', 'table', $machine->id));
            $removedCharcoaliums = $removedCharcoaliums + $charcoaliums;
        }

        foreach($row1machines as &$machine) {
            $this->charcoaliums->moveCard($machine->id, 'discard');
        }
        foreach($row2machines as &$machine) {
            $this->charcoaliums->moveCard($machine->id, 'table', $machine->location_arg - 5);
        }
        
        // TODO notif
    }

    function removeEmptySpaceFromTable() {
        $machines = $this->getMachinesFromDb($this->machines->getCardsInLocation('table'));
        /*usort(function($a, $b) {
            if ($a->location_arg == $b->location_arg) {
                return 0;
            }
            return $b->location_arg - $a->location_arg;
        }, $machines);*/
        //die('test '.json_encode($machines));

        $lastSpot = 0;
        foreach($machines as &$machine) {
            if ($machine->location_arg > $lastSpot + 1) {
                $machine->location_arg = $lastSpot + 1;
                $this->machines->moveCard($machine->id, 'table', $machine->location_arg);
            }
            $lastSpot = $machine->location_arg;
        }
        // TODO notif
    }

    function checkPlayerWorkshopMachinesLimit(int $playerId) {
        $machines = $this->getMachinesFromDb($this->machines->getCardsInLocation('player', $playerId));

        if (count($machines) <= 3) {
            return;
        }

        $lastMachineId = intval(self::getGameStateValue(PLAYED_MACHINE));
        foreach($machines as $machine) {
            if ($machine->id != $lastMachineId) {
                $this->machines->moveCard($machine->id, 'discard');
            }
        }
        // TODO notif
    }
}
