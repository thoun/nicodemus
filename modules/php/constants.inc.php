<?php

/*
 * State constants
 */
define('ST_BGA_GAME_SETUP', 1);

define('ST_PLAYER_CHOOSE_ACTION', 10);

define('ST_PLAYER_CHOOSE_PLAY_ACTION', 20);

define('ST_PLAYER_SELECT_RESOURCE', 30);
define('ST_PLAYER_SELECT_EXCHANGE', 31);
define('ST_PLAYER_SELECT_MACHINE', 32);
define('ST_PLAYER_SELECT_PROJECT', 33);

define('ST_PLAYER_CHOOSE_PROJECT', 60);
define('ST_PLAYER_CHOOSE_PROJECT_DISCARDED_MACHINE', 61);
define('ST_COMPLETE_PROJECTS', 65);

define('ST_REFILL_HAND', 85);

define('ST_NEXT_PLAYER', 90);

define('ST_END_GAME', 99);
define('END_SCORE', 100);

/*
 * Variables
 */
define('FIRST_PLAYER', 'FIRST_PLAYER');
define('PLAYED_MACHINE', 'PLAYED_MACHINE');
define('LAST_TURN', 'LAST_TURN');

/*
 * Global variables
 */
define('APPLY_EFFECT_CONTEXT', 'ApplyEffectContext');
define('COMPLETED_PROJECTS', 'CompletedProjects');
?>
