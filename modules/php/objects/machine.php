<?php

class MachineCard {
    public /*int*/ $points;
  
    public function __construct(int $points) {
        $this->points = $points;
    } 
}

class Machine extends MachineCard {
    public $id;
    public $location;
    public $location_arg;
    public $type; // color : 1 = blue, 2 = purple, 3 = red, 4 = yellow
    public $subType; // index (1-based) on rulebook

    public function __construct($dbCard, $MACHINES) {
        $this->id = intval($dbCard['id']);
        $this->location = $dbCard['location'];
        $this->location_arg = intval($dbCard['location_arg']);
        $this->type = intval($dbCard['type']);
        $this->subType = intval($dbCard['type_arg']);

        $machineCard = $MACHINES[$this->type * 10 + $this->subType];
        $this->points = $machineCard->points;
    } 
}
?>