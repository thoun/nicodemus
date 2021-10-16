<?php

require_once(__DIR__.'/objects/machine.php');
require_once(__DIR__.'/objects/project.php');
require_once(__DIR__.'/objects/resource.php');

trait UtilTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////

    function getUniqueId(object $card) {
        return $card->type * 10 + $card->subType;
    }

    function array_find(array $array, callable $fn) {
        foreach ($array as $value) {
            if($fn($value)) {
                return $value;
            }
        }
        return null;
    }

    function array_some(array $array, callable $fn) {
        foreach ($array as $value) {
            if($fn($value)) {
                return true;
            }
        }
        return false;
    }
    
    function array_every(array $array, callable $fn) {
        foreach ($array as $value) {
            if(!$fn($value)) {
                return false;
            }
        }
        return true;
    }

    function array_identical(array $a1, array $a2) {
        if (count($a1) != count($a2)) {
            return false;
        }
        for ($i=0;$i<count($a1);$i++) {
            if ($a1[$i] != $a2[$i]) {
                return false;
            }
        }
        return true;
    }

    function setGlobalVariable(string $name, /*object|array*/ $obj) {
        /*if ($obj == null) {
            throw new \BgaSystemException('Global Variable null');
        }*/
        $jsonObj = json_encode($obj);
        self::DbQuery("INSERT INTO `global_variables`(`name`, `value`)  VALUES ('$name', '$jsonObj') ON DUPLICATE KEY UPDATE `value` = '$jsonObj'");
    }

    function getGlobalVariable(string $name, $asArray = null) {
        $json_obj = self::getUniqueValueFromDB("SELECT `value` FROM `global_variables` where `name` = '$name'");
        if ($json_obj) {
            $object = json_decode($json_obj, $asArray);
            return $object;
        } else {
            return null;
        }
    }

    function deleteGlobalVariable(string $name) {
        self::DbQuery("DELETE FROM `global_variables` where `name` = '$name'");
    }

    function getApplyEffectContext() {
        return $this->getGlobalVariable(APPLY_EFFECT_CONTEXT);
    }

    function clearEffectContext() {
        $this->deleteGlobalVariable(APPLY_EFFECT_CONTEXT);
    }

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

        //12 charcoaliums & 24 resources : 8 wood, 8 copper, 8 crystal        
        $resources = [
            [ 'type' => 0, 'type_arg' => null, 'nbr' => 12 ],
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
                $this->addResource($playerId, 2, 0);
            } else {
                $this->addResource($playerId, 1, 0);
                $this->addResource($playerId, 1, 1);
            }
        }
    }

    function getRemainingMachines() {
        return $this->machines->countCardInLocation('deck');
    }

    function getRemainingProjects() {
        return $this->projects->countCardInLocation('deck');
    }

    function getMachineFromDb($dbObject) {
        if (!$dbObject || !array_key_exists('id', $dbObject)) {
            throw new BgaSystemException("machine doesn't exists ".json_encode($dbObject));
        }
        return new Machine($dbObject, $this->MACHINES);
    }

    function getMachinesFromDb(array $dbObjects) {
        return array_map(function($dbObject) { return $this->getMachineFromDb($dbObject); }, array_values($dbObjects));
    }

    function getMachinesWithResourcesFromDb(array $dbObjects) {
        $machines = $this->getMachinesFromDb($dbObjects);
    
        foreach($machines as &$machine) {
            $machine->resources = $this->getResourcesFromDb($this->resources->getCardsInLocation('machine', $machine->id));
        }

        return $machines;
    }

    function getProjectFromDb($dbObject) {
        if (!$dbObject || !array_key_exists('id', $dbObject)) {
            throw new BgaSystemException("project doesn't exists ".json_encode($dbObject));
        }
        return new Project($dbObject, $this->PROJECTS);
    }

    function getProjectsFromDb(array $dbObjects) {
        return array_map(function($dbObject) { return $this->getProjectFromDb($dbObject); }, array_values($dbObjects));
    }

    function getResourceFromDb($dbObject) {
        if (!$dbObject || !array_key_exists('id', $dbObject)) {
            throw new BgaSystemException("resource doesn't exists ".json_encode($dbObject));
        }
        return new Resource($dbObject);
    }

    function getResourcesFromDb(array $dbObjects) {
        return array_map(function($dbObject) { return $this->getResourceFromDb($dbObject); }, array_values($dbObjects));
    }

    function countMachinesOnTable() {
        return intval($this->machines->countCardInLocation('table'));
    }

    function getResources(int $type, int $playerId) { // or 0 for table
        if ($playerId == 0) {
            return $this->getResourcesFromDb($this->resources->getCardsOfTypeInLocation($type, null, 'table'));
        } else {
            return $this->getResourcesFromDb($this->resources->getCardsOfTypeInLocation($type, null, 'player', $playerId));
        }
    }

    function addResource(int $playerId, int $number, int $type, $fromOpponent = false) {
        $tableResources = $this->getResources($type, 0);
        $availableOnTable = count($tableResources);
        $movedResources = null;

        if ($fromOpponent) {
            $opponentId = $this->getOpponentId($playerId);
            $opponentResources = $this->getResources($type, $opponentId);
            $movedResources = array_slice($opponentResources, 0, min($number, count($opponentResources)));
        } else if ($availableOnTable >= $number) {
            $resources = $this->getResources($type, 0);
            $movedResources = array_slice($tableResources, 0, $number);
        } else {
            $takeOnOpponent = $number - $availableOnTable;
            $opponentId = $this->getOpponentId($playerId);
            $opponentResources = $this->getResources($type, $opponentId);
            $movedFromOpponent = array_slice($opponentResources, 0, min($takeOnOpponent, count($opponentResources)));
            $movedResources = array_merge($tableResources, $movedFromOpponent);
        }

        $this->moveResources($playerId, $type, $movedResources);
    }

    function moveResources(int $playerId, int $type, array $resources) {
        $resourcesIds = array_map(function ($r) { return $r->id; }, $resources);
        $this->resources->moveCards($resourcesIds, 'player', $playerId);

        $opponentId = $this->getOpponentId($playerId);

        $count = count($this->getResources($type, $playerId));
        self::notifyAllPlayers('addResources', '', [
            'playerId' => $playerId,
            'resourceType' => $type,
            'resources' => $this->getResourcesFromDb($this->resources->getCards($resourcesIds)),
            'count' => $count,
            'opponentId' => $opponentId,
            'opponentCount' => count($this->getResources($type, $opponentId)),
        ]);

        $collectedStat = $this->COLLECTED_STAT_BY_TYPE[$type];
        self::incStat($count, $collectedStat);
        self::incStat($count, $collectedStat, $playerId);
    }

    function removeResource(int $playerId, int $number, int $type, $tableSpotDestination = null) {
        $playerResources = $this->getResources($type, $playerId);
        $movedIds = array_map(function ($r) { return $r->id; }, array_slice($playerResources, 0, min($number, count($playerResources))));
        $machineId = 0;
        if ($tableSpotDestination != null) {
            $machineId = $this->getMachinesFromDb($this->machines->getCardsInLocation('table', $tableSpotDestination))[0]->id;
        }
        $this->resources->moveCards($movedIds, $tableSpotDestination == null ? 'table' : 'machine', $machineId);
        $movedResources = $this->getResourcesFromDb($this->resources->getCards($movedIds));

        self::notifyAllPlayers('removeResources', '', [
            'playerId' => $playerId,
            'resourceType' => $type,
            'resources' => $movedResources,
            'count' => count($this->getResources($type, $playerId)),
        ]);
    }

    function countPlayerResources(int $playerId) {
        return intval(self::getUniqueValueFromDB("SELECT count(*) FROM `resource` where `card_location` = 'player' and `card_location_arg` = $playerId and `card_type` > 0"));
    }
    

    function getPlayerName(int $playerId) {
        return self::getUniqueValueFromDb("SELECT player_name FROM player WHERE player_id = $playerId");
    }

    function getPlayerScore(int $playerId) {
        return intval(self::getUniqueValueFromDB("SELECT player_score FROM player where `player_id` = $playerId"));
    }

    function incPlayerScore(int $playerId, int $incScore) {
        self::DbQuery("UPDATE player SET player_score = player_score + $incScore WHERE player_id = $playerId");

        if ($this->getMaxPlayerScore() >= 20) {
            self::setGameStateValue(LAST_TURN, 1);            
            self::notifyAllPlayers('lastTurn', clienttranslate('${player_name} reaches 20 points, it\'s last turn !'), [
                'playerId' => $playerId,
                'player_name' => $this->getPlayerName($playerId),
            ]);
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

    function getEnglishResourceName(int $type) {
        $resourceName = null;
        switch ($type) {
            case 0: $resourceName = 'charcoalium'; break;
            case 1: $resourceName = 'wood'; break;
            case 2: $resourceName = 'copper'; break;
            case 3: $resourceName = 'crystal'; break;
        }
        return $resourceName;
    }

    function getResourceName(int $type) {
        $resourceName = null;
        switch ($type) {
            case 0: $resourceName = _('charcoalium'); break;
            case 1: $resourceName = _('wood'); break;
            case 2: $resourceName = _('copper'); break;
            case 3: $resourceName = _('crystal'); break;
        }
        return $resourceName;
    }

    function clearTableRowIfNecessary() {
        if (intval($this->machines->countCardInLocation('table')) < 10) {
            return;
        }

        $machines = $this->getMachinesWithResourcesFromDb($this->machines->getCardsInLocation('table'));

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
            $charcoaliums = $this->getResourcesFromDb($this->resources->getCardsInLocation('machine', $machine->id));
            $this->resources->moveAllCardsInLocation('machine', 'table', $machine->id);
            foreach($charcoaliums as &$charcoalium) {
                $charcoalium->location = 'table';
            }
            $removedCharcoaliums = $removedCharcoaliums + $charcoaliums;
        }

        foreach($row1machines as &$machine) {
            $this->machines->moveCard($machine->id, 'discard');
        }

        $movedRow2machines = [];
        foreach($row2machines as &$machine) {
            $originalSpot = $machine->location_arg;
            $machine->location_arg -= 5;
            $movedRow2machines[$originalSpot] = $machine;
            $this->machines->moveCard($machine->id, 'table', $machine->location_arg);
        }

        self::notifyAllPlayers('discardTableMachines', '', [
            'machines' => $row1machines,
            'removedCharcoaliums' => $removedCharcoaliums,
        ]);

        self::notifyAllPlayers('tableMove', '', [
            'moved' => $movedRow2machines,
        ]);
    }

    function removeEmptySpaceFromTable() {
        $machines = $this->getMachinesWithResourcesFromDb($this->machines->getCardsInLocation('table', null, 'location_arg'));

        $moved = [];

        $lastSpot = 0;
        foreach($machines as &$machine) {
            if ($machine->location_arg > $lastSpot + 1) {
                $moved[$machine->location_arg] = $machine;
                $machine->location_arg = $lastSpot + 1;
                $this->machines->moveCard($machine->id, 'table', $machine->location_arg);
            }
            $lastSpot = $machine->location_arg;
        }

        if (count($moved) > 0) {
            self::notifyAllPlayers('tableMove', '', [
                'moved' => $moved,
            ]);
        }
    }

    function checkPlayerWorkshopMachinesLimit(int $playerId) {
        $machines = $this->getMachinesFromDb($this->machines->getCardsInLocation('player', $playerId));

        if (count($machines) <= 3) {
            return;
        }

        $lastMachineId = intval(self::getGameStateValue(PLAYED_MACHINE));
        $discardedMachines = [];
        foreach($machines as $machine) {
            if ($machine->id != $lastMachineId) {
                $discardedMachines[] = $machine;
                $this->machines->moveCard($machine->id, 'discard');
            }
        }

        self::notifyAllPlayers('discardPlayerMachines', '', [
            'machines' => $discardedMachines,
        ]);
    }

    function getProducedResources(int $playerId) {
        $produced = [0, 0, 0, 0];

        $playerMachines = $this->getMachinesFromDb($this->machines->getCardsInLocation('player', $playerId));

        foreach($playerMachines as $machine) {
            if (array_key_exists($machine->produce, $produced)) {
                $produced[$machine->produce] += 1;
            } else {
                $produced[$machine->produce] = 1;
            }
        }

        return $produced;
    }

    function getPlayerResources(int $playerId) {
        $playerResources = [0, 0, 0, 0];
        for ($i=0; $i<=3; $i++) {
            $playerResources[$i] += count($this->getResources($i, $playerId));
        }
        return $playerResources;
    }

    function getCanSpend(int $playerId) {
        $canSpend = $this->getProducedResources($playerId);
        $playerResources = $this->getPlayerResources($playerId);
        for ($i=0; $i<=3; $i++) {
            $canSpend[$i] += $playerResources[$i];
        }
        return $canSpend;
    }

    function getMachineCost(object $machine, array $tableMachines) {
        $machinesAfter = 0;

        foreach($tableMachines as $tableMachine) {
            if ($tableMachine->location_arg > $machine->location_arg) {
                $machinesAfter++;
            }
        }

        $cost = [$machinesAfter, 0, 0, 0];

        for ($i=1; $i<=3; $i++) {
            if (array_key_exists($i, $machine->cost)) {
                $cost[$i] = $machine->cost[$i];
            }
        }

        return $cost;
    }

    function getMachineCostForPlayerBeforeJoker(int $playerId, object $machine, array $tableMachines) {
        $producedResources = $this->getProducedResources($playerId);
        $cost = $this->getMachineCost($machine, $tableMachines);

        for ($i=0; $i<=3; $i++) {
            if (array_key_exists($i, $cost)) {
                $cost[$i] -= $producedResources[$i];
            }
        }

        return $cost;
    }
    
    function canPay(array $canSpend, array $cost) {
        $remainingCost = $cost; // shallow copy
        for ($i=0; $i<=3; $i++) {
            if ($remainingCost[$i] > $canSpend[$i]) {
                $remainingCost[$i] -= $canSpend[$i];
            } else {
                $remainingCost[$i] = 0;
            }
        }

        if ($remainingCost[0] > 0) {
            return false;
        }

        // joker
        $jokers = array_key_exists(9, $canSpend) ? $canSpend[9] : 0;
        for ($i=1; $i<=3; $i++) {
            if ($remainingCost[$i] > 0 && $jokers > 0) {
                $spentJokers = min($jokers, $remainingCost[$i]);
                $remainingCost[$i] -= $spentJokers;
                $jokers -= $spentJokers;
            }
        }

        for ($i=1; $i<=3; $i++) {
            if ($remainingCost[$i] > 0) {
                return false;
            }
        }

        return true;
    }
}
