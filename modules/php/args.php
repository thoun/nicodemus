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