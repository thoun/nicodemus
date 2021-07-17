<?php

class Resource {
    public $id;
    public $location;
    public $location_arg;
    public $type; // 0 charcoalium, 1 wood, 2 copper, 3 crystal

    public function __construct($dbCard) {
        $this->id = intval($dbCard['id']);
        $this->location = $dbCard['location'];
        $this->location_arg = intval($dbCard['location_arg']);
        $this->type = intval($dbCard['type']);
    } 
}
?>