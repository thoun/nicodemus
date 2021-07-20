<?php

trait ArgsTrait {
    
//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */
    
    function argChooseAction() {
        $playerId = self::getActivePlayerId();

        $canSpend = $this->getCanSpend($playerId);

        $tableMachines = $this->getMachinesFromDb($this->machines->getCardsInLocation('table'));

        $disabledMachines = [];

        foreach($tableMachines as $machine) {
            $cost = $this->getMachineCost($machine, $tableMachines);
            if (!$this->canPay($canSpend, $cost)) {
                $disabledMachines[] = $machine;
            }
        }
    
        return [
            'disabledMachines' => $disabledMachines,
        ];
    }

    function argChoosePlayAction() {

        $machine = $this->getMachineFromDb($this->machines->getCard(self::getGameStateValue(PLAYED_MACHINE)));
    
        return [
            'machine' => $machine,
        ];
    }

    function argSelectMachine() {
        $playerId = self::getActivePlayerId();

        $machine = $this->getMachineForEffect();

        $selectableMachines = null;

        if ($machine->type == 2) {
            if ($machine->subType == 1) {
                $selectableMachines = $this->getMachinesFromDb($this->machines->getCardsInLocation('hand', $playerId));
            } else {
                $tableMachines = $this->getMachinesFromDb($this->machines->getCardsInLocation('table'));

                if ($machine->subType == 2 || $machine->subType == 3) {
                    $sliceSize = $machine->subType == 2 ? 3 : 2;
                    $start = max(0, count($tableMachines) - 1 - $sliceSize);
                    $end = count($tableMachines) - 1;
                    if ($end > $start) {
                        $selectableMachines = array_slice($tableMachines, $start, $end - $start);
                    }
                }
            }
        } else if ($machine->type == 4 && $machine->subType == 2) {
            $tableMachines = $this->getMachinesFromDb($this->machines->getCardsInLocation('table'));
            $selectableMachines = array_slice($tableMachines, 0, count($tableMachines) - 1);
        }

        if ($selectableMachines == null) {
            throw new Error("Impossible to determinate cards to select");
        }

        return [
            'selectableMachines' => $selectableMachines,
        ];
    }

    function argSelectProject() {
        $projects = $this->getProjectsFromDb($this->projects->getCardsOnTop(2, 'deck'));

        return [
            'projects' => $projects,
        ];
    }

    function argSelectResource() {
        $machine = $this->getMachineForEffect();
        $machineType = $machine->type*10 + $machine->subType;
        $possibleCombinations = null;

        if ($machine->type == 1 && $machine->subType == 5) {
            $possibleCombinations = [[1], [2], [3]];
        } else if ($machine->type == 2) {
            $context = $this->getApplyEffectContext();
            $discardedMachine = $this->getMachineFromDb($this->machines->getCard($context->selectedCardId));

            if ($machine->subType == 1 || $machine->subType == 5) {
                $possibleCombinations = $this->getTwoResourcesCombinations($discardedMachine->cost);
            } else {                
                $possibleCombinations = $this->getOneResourceCombinations($discardedMachine->cost);
            }
        } else if ($machine->type == 3) {
            $playerId = self::getActivePlayerId();
            $opponentId = $this->getOpponentId($playerId);            

            $canSpend = [];
            for ($i=1; $i<=3; $i++) {
                $canSpend[$i] = count($this->getResources($i, $opponentId));
            }

            if ($machine->subType == 4) {
                $possibleCombinations = $this->getTwoResourcesCombinations($canSpend);
            } else {                
                $possibleCombinations = $this->getOneResourceCombinations($canSpend);
            }
        }

        if ($possibleCombinations == null) {
            throw new Error("Impossible to determinate resources to select");
        }

        return [
            'possibleCombinations' => $possibleCombinations,
        ];
    }

    function argSelectExchange() {
        // TODO
        return [

        ];
    }
    
    function argChooseProject() {

        $machine = $this->getMachineFromDb($this->machines->getCard(self::getGameStateValue(PLAYED_MACHINE)));

        $completeProjects = $this->getCompleteProjects($machine);
    
        return [
            'completeProjects' => $completeProjects,
        ];
    }
}