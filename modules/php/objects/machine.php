<?php

class MachineCard {
    public /*int*/ $points;
    public /*int*/ $produce; // 0 = carbonium, 1 = wood, 2 = copper, 3 = crystal, 9 = *
    public /*array*/ $cost;
  
    public function __construct(int $points, int $produce, array $cost) {
        $this->points = $points;
        $this->produce = $produce;
        $this->cost = $cost;
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
        $this->produce = $machineCard->produce;
        $this->cost = $machineCard->cost;
    } 
}
?>