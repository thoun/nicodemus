<?php

require_once(__DIR__.'/objects/machine.php');
require_once(__DIR__.'/objects/project.php');
require_once(__DIR__.'/objects/carbonium.php');
require_once(__DIR__.'/objects/resource.php');

trait UtilTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////

    function getMaxPlayerScore() {
        return intval(self::getUniqueValueFromDB("SELECT max(player_score) FROM player"));
    }

    function setup() {
        //TODO 56 machine cards    
        /*$carboniums = [];
        $carboniums[] = [ 'type' => 0, 'type_arg' => null, 'nbr' => 1 ];
        for ($color=1; $color<=5; $color++) {
            $carboniums[] = [ 'type' => $color, 'type_arg' => null, 'nbr' => 20 ];
        }
        $this->carboniums->createCards($cards, 'deck');
        $this->carboniums->shuffle('deck');*/
        
        //17 project tiles
        $projects = [];
        foreach(array_keys($this->PROJECTS) as $projectId) {
            $projects[] = [ 'type' => floor($projectId / 10), 'type_arg' => $projectId % 10, 'nbr' => 1 ];
        }
        $this->projects->createCards($projects, 'deck');
        $this->projects->shuffle('deck');

        //12 carboniums       
        $carboniums = [
            [ 'type' => 0, 'type_arg' => null, 'nbr' => 12 ],
        ];
        $this->carboniums->createCards($carboniums, 'table');

        //24 resources : 8 wood, 8 copper, 8 crystal        
        $resources = [
            [ 'type' => 1, 'type_arg' => null, 'nbr' => 8 ],
            [ 'type' => 2, 'type_arg' => null, 'nbr' => 8 ],
            [ 'type' => 3, 'type_arg' => null, 'nbr' => 8 ],
        ];
        $this->resources->createCards($resources, 'table');
    }

    function getMachineFromDb($dbObject) {
        if (!$dbObject || !array_key_exists('id', $dbObject)) {
            throw new Error("machine doesn't exists ".json_encode($dbObject));
        }
        return new Machine($dbObject, $this->MACHINES);
    }

    function getMachinesFromDb(array $dbObjects) {
        return array_map(function($dbObject) { return $this->getMachineFromDb($dbObject); }, array_values($dbObjects));
    }

    function getProjectFromDb($dbObject) {
        if (!$dbObject || !array_key_exists('id', $dbObject)) {
            throw new Error("project doesn't exists ".json_encode($dbObject));
        }
        return new Project($dbObject, $this->PROJECTS);
    }

    function getProjectsFromDb(array $dbObjects) {
        return array_map(function($dbObject) { return $this->getProjectFromDb($dbObject); }, array_values($dbObjects));
    }

    function getCarboniumFromDb($dbObject) {
        if (!$dbObject || !array_key_exists('id', $dbObject)) {
            throw new Error("carbonium doesn't exists ".json_encode($dbObject));
        }
        return new Carbonium($dbObject);
    }

    function getCarboniumsFromDb(array $dbObjects) {
        return array_map(function($dbObject) { return $this->getCarboniumFromDb($dbObject); }, array_values($dbObjects));
    }

    function getResourceFromDb($dbObject) {
        if (!$dbObject || !array_key_exists('id', $dbObject)) {
            throw new Error("resource doesn't exists ".json_encode($dbObject));
        }
        return new Resource($dbObject);
    }

    function getResourcesFromDb(array $dbObjects) {
        return array_map(function($dbObject) { return $this->getResourceFromDb($dbObject); }, array_values($dbObjects));
    }
}
