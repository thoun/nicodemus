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
            'charcoalium' => $machine->points,
            'resource' => $machine->produce,
            'machine' => $machine,
        ];
    }

    function argSelectCard() {
        $machine = $this->getMachineForEffect();

        // TODO
        return [

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
            // TODO list possibilities from discarded machine
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