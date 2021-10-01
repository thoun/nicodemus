<?php

trait DebugUtilTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////

    function debugSetup() {
        global $g_config;
        if (!$g_config['debug_from_chat']) { 
            return;
        } 

        //self::DbQuery("UPDATE card SET `card_location_arg` = card_location_arg + 200 where `card_type` = 117");
        //$this->debugSetPlayerPoints(2343492, 19);
        $this->debugAddResources(2343492, 4);
        $this->debugAddResources(2343493, 4);
        //$this->debugSetMachineInHand(2343492, 1, 5);
        //$this->debugSetMachineInHand(2343492, 4, 1, 1);
        //$this->machines->moveAllCardsInLocation('deck', 'discard');
        //$this->debugClearTable();
        //$this->debugSetMachineInTable(4, 2);
        //$this->debugSetMachineInTable(1, 5, 1);
        //$this->debugSetMachineInTable(3, 2);
        //$this->debugSetMachineInTable(4, 2, 1);
        //$this->debugSetMachineInTable(3, 1);
        //$this->debugSetCharcoaliumInTable(5, 2);
        //$this->debugSetMachineInTable(3, 3);
        //$this->debugSetMachineInWorkshop(2343492, 4, 2, 1);
        //$this->debugSetMachineInWorkshop(2343492, 3, 1);

        /*$this->debugSetProjectInWorkshop(2343492, 1, 1);
        $this->debugSetProjectInWorkshop(2343492, 2, 1);
        $this->debugSetProjectInWorkshop(2343492, 2, 2);
        $this->debugSetProjectInWorkshop(2343492, 2, 3);
        $this->debugSetProjectInWorkshop(2343492, 3, 3);*/
        //$this->removeResource(2343493, 2, 0);
        //$this->removeResource(2343493, 2, 1);

        //$this->machines->pickCardsForLocation(39, 'deck', 'discard');

        /*$this->debugReplaceHand(2343492, [
            [2, 1, 0],
            [2, 5, 0]
        ]);*/

        // Activate first player must be commented in setup if this is used
        $this->gamestate->changeActivePlayer(2343492);
    }

    private function debugSetPlayerPoints(int $playerId, int $score) {
        self::DbQuery("UPDATE player SET `player_score` = $score where `player_id` = $playerId");
    }

    private function debugSetPoints(int $score) {
        self::DbQuery("UPDATE player SET `player_score` = $score");
    }

    private function debugAddResources(int $playerId, int $number, int $type = -1) {
        if ($type == -1) {
            for ($i=0; $i<=3; $i++) {
                $this->addResource($playerId, $number, $i);
            }
        } else {
            $this->addResource($playerId, $number, $type);
        }
    }

    private function debugClearTable() {
        $this->machines->moveAllCardsInLocation('table', 'discard');
    }

    private function debugGetMachineByTypes($type, $subType, $index = 0) {
        return $this->getMachinesFromDb($this->machines->getCardsOfType($type, $subType))[$index];
    }

    private function debugSetMachineInTable($type, $subType, $index = 0) {
        $card = $this->debugGetMachineByTypes($type, $subType, $index);
        $this->machines->moveCard($card->id, 'table', $this->countMachinesOnTable() + 1);
    }

    private function debugSetMachineInHand($playerId, $type, $subType, $index = 0) {
        $card = $this->debugGetMachineByTypes($type, $subType, $index);
        $this->machines->moveCard($card->id, 'hand', $playerId);
    }

    private function debugSetMachineInWorkshop($playerId, $type, $subType, $index = 0) {
        $card = $this->debugGetMachineByTypes($type, $subType, $index);
        $this->machines->moveCard($card->id, 'player', $playerId);
    }

    private function debugGetProjectByTypes($type, $subType) {
        return $this->getProjectsFromDb($this->projects->getCardsOfType($type, $subType))[0];
    }

    private function debugSetProjectInTable($type, $subType, $position = 1) {
        $card = $this->debugGetProjectByTypes($type, $subType);
        $this->projects->moveCard($card->id, 'table', $position);
    }

    private function debugSetProjectInWorkshop($playerId, $type, $subType) {
        $card = $this->debugGetProjectByTypes($type, $subType);
        $this->projects->moveCard($card->id, 'player', $playerId);
    }

    private function debugSetCharcoaliumInTable(int $spot, int $number) {
        $machine = $this->getMachinesWithResourcesFromDb($this->machines->getCardsInLocation('table', null, 'location_arg'))[$spot - 1];

        $resources = $this->getResources(0, 0);
        $movedIds = array_map(function ($r) { return $r->id; }, array_slice($resources, 0, $number));
        $this->resources->moveCards($movedIds, 'machine', $machine->id);
    }

    
    private function debugReplaceHand(int $playerId, $newHand) {
        $this->machines->moveAllCardsInLocation('hand', 'discard', $playerId);
        foreach($newHand as $card) {
            $this->debugSetMachineInHand($playerId, $card[0], $card[1], $card[2]);
        }
    }
}
