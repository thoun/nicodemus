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
    
    function argChooseProject() {

        $machine = $this->getMachineFromDb($this->machines->getCard(self::getGameStateValue(PLAYED_MACHINE)));

        $completeProjects = $this->getCompleteProjects($machine);
    
        return [
            'completeProjects' => $completeProjects,
        ];
    }  
}