<?php

class Payment {
    public /* array */ $remainingCost;
    public /* array */ $jokers;
    public /* int */ $remainingJokers;

    public function __construct(array $remainingCost, int $remainingJokers, array $jokers = []) {
        $this->remainingCost = $remainingCost;
        $this->jokers = $jokers;
        $this->remainingJokers = $remainingJokers;
    }

    public function flatten() {
        $remainingCost = [];
        foreach($this->remainingCost as $resource => $number) {
            for ($i=0; $i<$number; $i++) {
                $remainingCost[] = $resource;
            }
        }
        $this->remainingCost = $remainingCost;
    }
}
?>