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

        $canSpend = $this->getProducedResources($playerId);
        for ($i=0; $i<=3; $i++) {
            $canSpend[$i] += count($this->getResources($i, $playerId));
        }

        $tableMachines = $this->getMachinesFromDb($this->machines->getCardsInLocation('table'));

        $disabledIds = [];

        foreach($tableMachines as $machine) {
            $cost = $this->getMachineCost($machine, $tableMachines);
            //die('canPay '.json_encode($this->canPay($canSpend, $cost)).' canSpend='.json_encode($canSpend).' cost='.json_encode($cost));
            if (!$this->canPay($canSpend, $cost)) {
                $disabledIds[] = $machine->id;
            }
        }
    
        return [
            'disabledIds' => $disabledIds,
        ];
    }

    function argChoosePlayAction() {

        $machine = $this->getMachineFromDb($this->machines->getCard(self::getGameStateValue(PLAYED_MACHINE)));
    
        return [
            'charcoalium' => $machine->points,
            'resource' => $machine->produce,
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