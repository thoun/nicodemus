<?php

class Charcoalium {
    public $id;
    public $location;
    public $location_arg;

    public function __construct($dbCard) {
        $this->id = intval($dbCard['id']);
        $this->location = $dbCard['location'];
        $this->location_arg = intval($dbCard['location_arg']);
    } 
}
?>