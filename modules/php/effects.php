<?php

require_once(__DIR__.'/objects/exchange.php');

trait EffectTrait {

    function canApplyEffect(int $playerId, object $machine) {
        if ($machine->type == 2) {
            switch ($machine->subType) {
                case 1: return intval($this->machines->countCardInLocation('hand', $playerId)) >= 1;
                case 2: case 3: case 5: return $this->countMachinesOnTable() >= 2;
                case 4: 
                    for ($i=0; $i<=3; $i++) {
                        if (count($this->getResources($i, $playerId)) > 0) {
                            return true;
                        }
                    }
                    return false;
            }
        } else if ($machine->type == 4 && $machine->subType == 2) {
            return $this->countMachinesOnTable() >= 2;
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

    function discardPreviousMachineForResources(object $context, int $playerId) {
        $machines = $this->getMachinesFromDb($this->machines->getCardsInLocation(
            $playerId == 0 ? 'table' : 'hand', 
            $playerId == 0 ? null : $playerId, 
            'location_arg'
        ));
        if (count($machines) < 2) {
            throw new Error("No previous machine");
        }
        if ($context->selectedCardId == null && count($machines) == ($playerId == 0 ? 2 : 1)) {
            $context->selectedCardId = $machine[0];
        } 
        if ($context->selectedCardId != null) {
            if (count($context->selectedResources) > 0) {
                $discardedMachine = $machines[count($machines) - 2];
                $this->addResourcesFromCombination($playerId, $context->selectedResources);
                $this->machines->moveCard($discardedMachine->id, 'discard');
                self::notifyAllPlayers('discardTableMachines', '', [
                    'machines' => [$discardedMachine],
                ]);
                return null;
            } else {
                return "selectResource";
            }
        } else {
            return 'selectMachine';
        }
    }

    function applyTransformationEffect(int $playerId, object $machine, object $context) {
        if ($machine->subType < 4) {
            return "selectMachine";
        }

        switch ($machine->subType) {
            case 1: 
                return $this->discardPreviousMachineForResources($context, $playerId);
            case 2: 
                return $this->discardPreviousMachineForResources($context, 0);
            case 3: 
                $this->addResource($playerId, 1, 0);
                return $this->discardPreviousMachineForResources($context, 0);                
            case 4: 
                if ($context->exchanges < 3) {
                    return "selectExchange";
                } else {
                    return null;
                }
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
                        return null;
                    } else {
                        return "selectResource";
                    }
                } else {
                    throw new Error("No previous machine");
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

    function getPossibleExchanges(int $playerId) {
        $possibleExchanges = [];
        for ($i=0; $i<=3; $i++) {
            if (count($this->getResources($i, $playerId)) > 0) {
                if ($i == 0) {
                    $possibleExchanges[] = new Exchange(0, 1);
                    $possibleExchanges[] = new Exchange(0, 2);
                    $possibleExchanges[] = new Exchange(0, 3);
                } else {
                    $possibleExchanges[] = new Exchange($i, 0);
                }
            }
        }
        
        return $possibleExchanges;
    }
}
