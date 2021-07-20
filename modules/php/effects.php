<?php

trait EffectTrait {

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

    function addResourcesFromCombination(int $playerId, array $combination) {
        if (count($combination) == 2 && $combination[0] == $combination[1]) {
            $this->addResource($playerId, 2, $combination[0]);
        } else {
            foreach($combination as $selectedResource) {
                $this->addResource($playerId, 1, $selectedResource);
            }
        }
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

    function applyTransformationEffect(int $playerId, object $machine, object $context) {
        if ($machine->subType < 4) {
            return "selectMachine";
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
                if ($context->selectedCardId !== null) {
                    $this->projects->moveCard($context->selectedCardId, 'player', $playerId);
                    $this->projects->shuffle('deck');
                    self::notifyAllPlayers('addWorkshopProjects', '', [
                        'playerId' => $playerId,
                        'projects' => [$this->getProjectFromDb($this->projects->getCard($context->selectedCardId))],
                    ]);
                } else {
                    return "selectProject";
                }
                break;
            case 2: 
                if ($context->mimicCardId !== null) {
                    $copiedMachine = $this->getMachineFromDb($this->machines->getCard($context->mimicCardId));
                    return $this->applyMachineEffect($playerId, $copiedMachine, $context);
                } else {
                    return "selectMachine";
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
}
