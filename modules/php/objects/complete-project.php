<?php

class CompleteProject {
    public $project;
    public $mandatoryMachine;
    public $otherMachines;
    public $machinesNumber;

    public function __construct(object $project, object $machine, array $machines, int $machinesNumber) {
        $this->project = $project;
        $this->mandatoryMachine = $machine;
        $this->machines = $machines;
        $this->machinesNumber = $machinesNumber;
    } 
}
?>