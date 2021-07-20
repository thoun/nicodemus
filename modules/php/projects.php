<?php

trait ProjectTrait {

    function machinesToCompleteColorProject(object $project, array $playerMachines, object $machine) {

        //$project->colors
        
        // TODO

        return null;
    }

    function machinesToCompletePointProject(object $project, array $playerMachines, object $machine) {

        //$project->colors
        
        // TODO

        return null;
    }

    function machinesToCompleteResourceProject(object $project, array $playerMachines, object $machine) {
        
        // TODO

        return null;
    }


    function machinesToCompleteProject(object $project, array $playerMachines, object $machine) {
        switch ($project->type) {
            case 1: return $this->machinesToCompleteColorProject($project, $playerMachines, $machine);
            case 2: return $this->machinesToCompletePointProject($project, $playerMachines, $machine);
            case 3: return $this->machinesToCompleteResourceProject($project, $playerMachines, $machine);
        }
    }

    function getCompleteProjects(int $playerId, object $machine) {
        $playerMachines = $this->getMachinesFromDb($this->machines->getCardsInLocation('player', $playerId));

        $projects = array_merge(
            $this->getProjectsFromDb($this->projects->getCardsInLocation('player', $playerId)),
            $this->getProjectsFromDb($this->projects->getCardsInLocation('table'))
        );

        $completeProjects = [];

        foreach($projects as $project) {
            if ($this->machinesToCompleteProject($project, $playerMachines, $machine) != null) {
                $completeProjects[] = $project;
            }
        }

        return $completeProjects;
    }
}
