<?php

declare(strict_types=1);

namespace Bga\Games\Nicodemus\States;

use Bga\GameFramework\StateType;
use Nicodemus;

const ST_END_GAME = 99;

class EndScore extends \Bga\GameFramework\States\GameState
{

    function __construct(
        protected Nicodemus $game,
    ) {
        parent::__construct($game,
            id: 98,
            type: StateType::GAME,
        );
    }

    public function onEnteringState() {
        $charcoaliumPerPlayer = array_values($this->game->getCollectionFromDb("SELECT player_id, COALESCE(`resources`.charcoalium_count, 0) as charcoalium FROM `player` left outer join (SELECT card_location_arg, count(*) as `charcoalium_count` FROM `resource` where `card_type` = 0 and `card_location` = 'player' group by card_location_arg) as  `resources` on `player`.player_id = `resources`.card_location_arg"));
        $charcoaliumEquality = intval($charcoaliumPerPlayer[0]['charcoalium']) == intval($charcoaliumPerPlayer[1]['charcoalium']);
        $signForUpdate = $charcoaliumEquality ? '>' : '=';

        $sqlUpdateScoreAux = "UPDATE `player`, (SELECT card_location_arg as `player_id`, count(*) as `count` FROM `resource` where `card_type` $signForUpdate 0 and `card_location` = 'player' group by card_location_arg) AS `src` SET `player`.`player_score_aux` = `src`.`count` WHERE `player`.`player_id` = `src`.`player_id`";
        $this->game->DbQuery($sqlUpdateScoreAux);

        return ST_END_GAME;
    }
}