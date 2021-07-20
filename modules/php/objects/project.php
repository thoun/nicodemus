<?php

class ProjectCard {
    public /*int*/ $points;
    public /*array*/ $colors;
    public /*int*/ $machinePoints;
    public /*array*/ $resources;
  
  
    public function __construct(int $points, $colors = null, $machinePoints = null, $resources = null) {
        $this->points = $points;
        $this->colors = $colors;
        $this->machinePoints = $machinePoints;
        $this->resources = $resources;
    } 
}

class Project extends ProjectCard {
    public $id;
    public $location;
    public $location_arg;
    public $type; // 1 = color, 2 = points, 3 = resource
    public $subType;
    // for color : 0 = one of each, 1 = blue, 2 = purple, 3 = red, 4 = yellow
    // for points : 0 = 2 indentical, else points
    // for resource : 1 = ca+wo, 2 = ca+co, 3 = ca+cr, 4 = 2*ca, 5 = 2*wo, 6 = 2*co, 7 = 2*cr, 8 = wo+co+cr

    public function __construct(array $dbCard, array $PROJECTS) {
        $this->id = intval($dbCard['id']);
        $this->location = $dbCard['location'];
        $this->location_arg = intval($dbCard['location_arg']);
        $this->type = intval($dbCard['type']);
        $this->subType = intval($dbCard['type_arg']);

        $projectCard = $PROJECTS[$this->type * 10 + $this->subType];
        $this->points = $projectCard->points;
        $this->colors = $projectCard->colors;
        $this->machinePoints = $projectCard->machinePoints;   
        $this->resources = $projectCard->resources;   
    } 
}
?>