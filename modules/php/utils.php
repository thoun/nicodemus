<?php

require_once(__DIR__.'/objects/machine.php');
require_once(__DIR__.'/objects/project.php');
require_once(__DIR__.'/objects/resource.php');

trait UtilTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////

    function setGlobalVariable(string $name, /*object|array*/ $obj) {
        /*if ($obj == null) {
            throw new \Error('Global Variable null');
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

        $opponentId = $this->getOpponentId($playerId);
        $movedResources = null;

        if ($fromOpponent) {
            $opponentResources = $this->getResources($type, $opponentId);
            $movedFromOpponentIds = array_map(function ($r) { return $r->id; }, array_slice($opponentResources, 0, min($number, count($opponentResources))));
            $this->resources->moveCards($movedFromOpponentIds, 'player', $playerId);
            $movedResources = $this->getResourcesFromDb($this->resources->getCards($movedFromOpponentIds));
        } else if ($availableOnTable >= $number) {
            $resources = $this->getResources($type, 0);
            $movedIds = array_map(function ($r) { return $r->id; }, array_slice($tableResources, 0, $number));
            $this->resources->moveCards($movedIds, 'player', $playerId);
            $movedResources = $this->getResourcesFromDb($this->resources->getCards($movedIds));
        } else {
            $movedFromTableIds = array_map(function ($r) { return $r->id; }, $tableResources);
            $this->resources->moveCards($movedFromTableIds, 'player', $playerId);
            $takeOnOpponent = $number - $availableOnTable;
            $opponentResources = $this->getResources($type, $opponentId);
            $movedFromOpponentIds = array_map(function ($r) { return $r->id; }, array_slice($opponentResources, 0, min($takeOnOpponent, count($opponentResources))));
            $this->resources->moveCards($movedFromOpponentIds, 'player', $playerId);
            $movedResources = $this->getResourcesFromDb($this->resources->getCards(array_merge($movedFromTableIds, $movedFromOpponentIds)));
        }

        self::notifyAllPlayers('addResources', '', [
            'playerId' => $playerId,
            'resourceType' => $type,
            'resources' => $movedResources,
            'count' => count($this->getResources($type, $playerId)),
            'opponentId' => $opponentId,
            'opponentCount' => count($this->getResources($type, $opponentId)),
        ]);
    }

    function removeResource(int $playerId, int $number, int $type) {
        $playerResources = $this->getResources($type, $playerId);
        $movedIds = array_map(function ($r) { return $r->id; }, array_slice($playerResources, 0, min($number, count($playerResources))));
        $this->resources->moveCards($movedIds, 'table');
        $movedResources = $this->getResourcesFromDb($this->resources->getCards($movedIds));

        self::notifyAllPlayers('removeResources', '', [
            'playerId' => $playerId,
            'resourceType' => $type,
            'resources' => $movedResources,
            'count' => count($this->getResources($type, $playerId)),
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
            $charcoaliums = $this->getResourcesFromDb($this->resources->moveAllCardsInLocation('machine', 'table', $machine->id));
            $removedCharcoaliums = $removedCharcoaliums + $charcoaliums;
        }

        foreach($row1machines as &$machine) {
            $this->machines->moveCard($machine->id, 'discard');
        }
        foreach($row2machines as &$machine) {
            $this->machines->moveCard($machine->id, 'table', $machine->location_arg - 5);
        }
        
        // TODO notif
    }

    function removeEmptySpaceFromTable() {
        $machines = $this->getMachinesFromDb($this->machines->getCardsInLocation('table', null, 'location_arg'));

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
        foreach($machines as $machine) {
            if ($machine->id != $lastMachineId) {
                $this->machines->moveCard($machine->id, 'discard');
            }
        }
        // TODO notif
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

    function getCanSpend(int $playerId) {
        $canSpend = $this->getProducedResources($playerId);
        for ($i=0; $i<=3; $i++) {
            $canSpend[$i] += count($this->getResources($i, $playerId));
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

    function countProducedResourceOnTable(int $type) {
        $count = 0;
        $tableMachines = $this->getMachinesFromDb($this->machines->getCardsInLocation('table'));
        foreach($tableMachines as $tableMachine) {
            if ($tableMachine->produce == $type) {
                $count++;
            }
        }
        return $count;
    }

    function applyProductionEffect(int $playerId, object $machine, object $context) {
        switch ($machine->subType) {
            case 1: $this->addResource($playerId, $this->countProducedResourceOnTable(1), 1); break;
            case 2: $this->addResource($playerId, $this->countProducedResourceOnTable(0), 0); break;
            case 3: $this->addResource($playerId, $this->countProducedResourceOnTable(2), 2); break;
            case 4: $this->addResource($playerId, $this->countProducedResourceOnTable(3), 3); break;
            case 5: 
                if (count($context->selectedResources) == 1) {
                    $this->addResource($playerId, $this->countProducedResourceOnTable(9), $context->selectedResources[0]);
                } else {
                    return "selectResource";
                }
                break;
        }
        return null;
    }

    function addResourcesFromCombination(int $playerId, array $combination) {
        if (count($combination) == 2 && $combination[0] == $combination[1]) {
            $this->addResource($playerId, 2, $combination[0]);
        } else {
            foreach($combination as $selectedResource) {
                $this->addResource($playerId, 1, $selectedResource);
            }
        }
    }

    function applyTransformationEffect(int $playerId, object $machine, object $context) {
        if ($machine->subType < 4) {
            return "selectCard";
        }

        switch ($machine->subType) {
            case 1: break;
            case 2: break;
            case 3: break;
            case 4: 
                // TODO exchange
                break;
            case 5: 
                $machines = $this->getMachinesFromDb($this->machines->getCardsInLocation('table', null, 'location_arg'));
                if (count($machines) > 1) {
                    if (count($context->selectedResources) > 0) {
                        $discardedMachine = $machines[count($machines) - 2];
                        $this->addResourcesFromCombination($playerId, $context->selectedResources);
                        $this->machines->moveCard($discardedMachine->id, 'discard');
                        self::notifyAllPlayers('discardTableMachines', '', [
                            'machines' => [$discardedMachine],
                        ]);

                    } else {
                        return "selectResource";
                    }
                } else {
                    // TOCHECK no effect ?
                }
                break;
        }
        return null;
    }

    function stealCard(int $playerId, int $opponentId) {
        $opponentMachines = $this->getMachinesFromDb($this->machines->getCardsInLocation('hand', $opponentId));
        $stolenMachine = $opponentMachines[bga_rand(1, count($opponentMachines)) - 1];
        $this->machines->moveCard($stolenMachine->id, 'hand', $playerId);
        self::notifyPlayer($opponentId, 'discardHandMachines', '', [
            'machines' => [$stolenMachine],
        ]);
        self::notifyPlayer($playerId, 'handRefill', '', [
            'machines' => [$stolenMachine],
        ]);
    }

    function applyAttackEffect(int $playerId, object $machine, object $context) {
        $opponentId = $this->getOpponentId($playerId);

        switch ($machine->subType) {
            case 1: 
                // steal charcoalium
                $this->addResource($playerId, 1, 0, true);

                // steal a card
                $this->stealCard($playerId, $opponentId);
                break;

            case 2: 
                if (count($context->selectedResources) == 1) {
                    $resourceType = $context->selectedResources[0];
                    $this->addResource($playerId, 1, $resourceType, true);

                    // steal a card
                    $this->stealCard($playerId, $opponentId);
                } else {
                    return "selectResource";
                }
                break;

            case 3: 
                // opponent discard all machines but 2
                $opponentMachines = $this->getMachinesFromDb($this->machines->getCardsInLocation('hand', $opponentId));
                $discardedMachines = [];
                while (count($opponentMachines) > 2) {
                    $discardedMachine = $opponentMachines[bga_rand(1, count($opponentMachines)) - 1];
                    $discardedMachines[] = $discardedMachine;
                    $this->machines->moveCard($discardedMachine->id, 'discard');
                    $opponentMachines = $this->getMachinesFromDb($this->machines->getCardsInLocation('hand', $opponentId));
                }
                if (count($discardedMachines) > 0) {
                    self::notifyPlayer($opponentId, 'discardHandMachines', '', [
                        'machines' => $discardedMachines,
                    ]);
                }

                // opponent discard 2 charcoaliums
                $this->removeResource($opponentId, 2, 0); 

                break;

            case 4:    
                // oppponent discard 2 chosen resources             
                if (count($context->selectedResources) > 0) {
                    if (count($context->selectedResources) == 2 && $context->selectedResources[0] == $context->selectedResources[1]) {
                        $this->removeResource($opponentId, 2, $context->selectedResources[0]);
                    } else {
                        foreach($context->selectedResources as $selectedResource) {
                            $this->removeResource($opponentId, 1, $selectedResource);
                        }
                    }
                } else {
                    return "selectResource";
                }
                break;
        }
        return null;
    }

    function applySpecialEffect(int $playerId, object $machine, object $context) {
        switch ($machine->subType) {
            case 1: 
                // TODO 
                break;
            case 2: 
                if ($context->selectedCardId !== null) {
                    $copiedMachine = $this->getMachineFromDb($this->machines->getCard($context->selectedCardId));
                    return $this->applyMachineEffect($playerId, $copiedMachine, $context);
                } else {
                    return "selectResource";
                }
                break;
        }
        return null;
    }

    function applyMachineEffect(int $playerId, object $machine, object $context) {
        switch ($machine->type) {
            case 1: return $this->applyProductionEffect($playerId, $machine, $context);
            case 2: return $this->applyTransformationEffect($playerId, $machine, $context);
            case 3: return $this->applyAttackEffect($playerId, $machine, $context);
            case 4: return $this->applySpecialEffect($playerId, $machine, $context);
        }
    }

    function getMachineForEffect() {
        $context = $this->getApplyEffectContext();

        return $this->getMachineFromDb($this->machines->getCard(
            $context->mimicCardId !== null ?
                $context->mimicCardId :
                self::getGameStateValue(PLAYED_MACHINE)
        ));
    }
    
    function getTwoResourcesCombinations(array $cost) {
        $possibleCombinations = [];

        foreach($cost as $type1 => $number) {
            if ($number >= 1) {                
                foreach($cost as $type2 => $number) {
                    if (($number >= 1 && $type2 > $type1) || ($number >= 2 && $type2 == $type1)) {
                        $possibleCombinations[] = [$type1, $type2];
                    }
                }
            }
        }

        if (count($possibleCombinations) == 0) {
            // if it's not possible to take 2, we take one
            return $this->getOneResourceCombinations($cost);
        } else {            
            return $possibleCombinations;
        }
    }
    
    function getOneResourceCombinations(array $cost) {
        $possibleCombinations = [];

        foreach($cost as $type => $number) {
            if ($number >= 1) {
                $possibleCombinations[] = [$type];
            }
        }

        return $possibleCombinations;
    }
}
