<?php

trait DebugUtilTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////

    function debugSetup() {
        //self::DbQuery("UPDATE card SET `card_location_arg` = card_location_arg + 200 where `card_type` = 117");
        //$this->addResource(2343492, 4, 0);
        $this->debugAddResources(2343492, 3);
        $this->debugAddResources(2343493, 2);
        $this->debugSetMachineInHand(2343492, 22);
        $this->debugSetMachineInTable(11);
        $this->debugSetMachineInTable(12);

        // Activate first player must be commented in setup if this is used
        $this->gamestate->changeActivePlayer(2343492);
    }

    private function debugAddResources(int $playerId, int $number) {
        for ($i=0; $i<=3; $i++) {
            $this->addResource($playerId, $number, $i);
        }

    }

    private function debugSetMachineInTable($cardType) {
        $card = $this->getMachineFromDb(array_values($this->machines->getCardsOfType(floor($cardType / 10) + ($cardType % 10)))[0]);
        $this->machines->moveCard($card->id, 'table', $this->countMachinesOnTable() + 1);
    }

    private function debugSetMachineInHand($playerId, $cardType) {
        $card = $this->getMachineFromDb(array_values($this->machines->getCardsOfType(floor($cardType / 10) + ($cardType % 10)))[0]);
        $this->machines->moveCard($card->id, 'hand', $playerId);
    }

    private function debugSetMachineInWorkshop($playerId, $cardType) {
        $card = $this->getMachineFromDb(array_values($this->machines->getCardsOfType(floor($cardType / 10) + ($cardType % 10)))[0]);
        $this->machines->moveCard($card->id, 'player', $playerId);
    }

    private function debugSetProjectInTable($cardType, $position = 1) {
        $card = $this->getProjectFromDb(array_values($this->projects->getCardsOfType(floor($cardType / 10) + ($cardType % 10)))[0]);
        $this->projects->moveCard($card->id, 'table', $position);
    }

    private function debugSetProjectInWorkshop($playerId, $cardType) {
        $card = $this->getProjectFromDb(array_values($this->projects->getCardsOfType(floor($cardType / 10) + ($cardType % 10)))[0]);
        $this->projects->moveCard($card->id, 'player', $playerId);
    }
}