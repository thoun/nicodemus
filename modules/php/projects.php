<?php

trait ProjectTrait {

    function machinesToCompleteColorProject(object $project, array $playerMachines, object $machine) {

        $machines = [];
        foreach($project->colors as $color => $number) {
            $machinesOfColor = array_values(array_filter($playerMachines, function($m) use ($color) { return $m->type == $color; }));
            if (count($machinesOfColor) < $number) {
                return null;
            }
            $machines = array_merge($machines, $machinesOfColor);
        }

        foreach($machines as $m) {
            if ($m->id == $machine->id) {
                return $machines;
            }
        }

        return null;
    }

    function machinesToCompletePointProject(object $project, array $playerMachines, object $machine) {
        $machines = [];
        if ($project->points == 0) {
            $groups = [];
            foreach ($playerMachines as $machine) {
                $groups[$machine->points][] = $machine;
            }

            foreach($groups as $type => $group) {
                if (count($group) >= 2 && $this->array_some($group, function($m) use ($machine) { return $m->id == $machine->id; })) {
                    $machines = array_merge($machines, $group);
                }
            }
        } else {
            $machines = array_values(array_filter($playerMachines, function($m) use ($project) { return $m->points == $project->points; }));
            if (count($machines) < 2) {
                return null;
            }
        } 

        foreach($machines as $m) {
            if ($m->id == $machine->id) {
                return $machines;
            }
        }

        return null;       
    }

    function machinesToCompleteResourceProject(object $project, array $playerMachines, object $machine) {

        $machines = [];
        foreach($project->resources as $resource => $number) {
            $machinesOfResource = array_values(array_filter($playerMachines, function($m) use ($resource) { return $m->produce == $resource; }));
            if (count($machinesOfResource) < $number) {
                return null;
            }
            $machines = array_merge($machines, $machinesOfResource);
        }

        foreach($machines as $m) {
            if ($m->id == $machine->id) {
                return $machines;
            }
        }

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
