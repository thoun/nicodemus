<?php

class Machine {
    public $id;
    public $location;
    public $location_arg;
    public $type;

    public function __construct($dbCard) {
        $this->id = intval($dbCard['id']);
        $this->location = $dbCard['location'];
        $this->location_arg = intval($dbCard['location_arg']);
        $this->type = intval($dbCard['type']);
    } 
}
?>