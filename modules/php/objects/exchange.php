<?php

class Exchange {
    public $from;
    public $to;

    public function __construct($from, $to) {
        $this->from = $from;
        $this->to = $to;
    } 
}
?>