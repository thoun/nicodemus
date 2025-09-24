<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Nicodemus implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 * 
 * states.inc.php
 *
 * Nicodemus game states description
 *
 */

use Bga\GameFramework\GameStateBuilder;

/*
   Game state machine is a tool used to facilitate game developpement by doing common stuff that can be set up
   in a very easy way from this configuration file.

   Please check the BGA Studio presentation about game state to understand this, and associated documentation.

   Summary:

   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: self::checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).
*/

//    !! It is not a good idea to modify this file when a game is running !!

require_once("modules/php/constants.inc.php");

$basicGameStates = [
    ST_BGA_GAME_SETUP => GameStateBuilder::gameSetup(ST_PLAYER_CHOOSE_ACTION)->build(),

    ST_NEXT_PLAYER => [
        "name" => "nextPlayer",
        "description" => "",
        "type" => "game",
        "action" => "stNextPlayer",
        "transitions" => [
            "nextPlayer" => ST_PLAYER_CHOOSE_ACTION, 
            "endGame" => ST_END_SCORE,
        ],
    ],
   
    ST_END_SCORE => GameStateBuilder::endScore()->build(),
];


$playerActionsGameStates = [

    ST_PLAYER_CHOOSE_ACTION => [
        "name" => "chooseAction",
        "description" => clienttranslate('${actplayer} must play or repair a machine'),
        "descriptionmyturn" => clienttranslate('${you} must play or repair a machine'),
        "type" => "activeplayer",
        "args" => "argChooseAction",
        "possibleactions" => [ 
            "playMachine",
            "repairMachine",
        ],
        "transitions" => [
            "choosePlayAction" => ST_PLAYER_CHOOSE_PLAY_ACTION,
            "chooseProject" => ST_PLAYER_CHOOSE_PROJECT,
            "nextPlayer" => ST_NEXT_PLAYER,
            "zombiePass" => ST_NEXT_PLAYER,
        ]
    ],

    ST_PLAYER_CHOOSE_PLAY_ACTION => [
        "name" => "choosePlayAction",
        "description" => clienttranslate('${actplayer} must choose an action for played card'),
        "descriptionmyturn" => clienttranslate('${you} must choose an action for played card'),
        "type" => "activeplayer",        
        "args" => "argChoosePlayAction",
        "possibleactions" => [ 
            "getCharcoalium",
            "getResource",
            "applyEffect",
            "cancel",
        ],
        "transitions" => [
            "selectResource" => ST_PLAYER_SELECT_RESOURCE,
            "selectMachine" => ST_PLAYER_SELECT_MACHINE,
            "selectProject" => ST_PLAYER_SELECT_PROJECT,
            "selectExchange" => ST_PLAYER_SELECT_EXCHANGE,
            "refillHand" => ST_REFILL_HAND,
            "cancel" => ST_PLAYER_CHOOSE_ACTION,
            "zombiePass" => ST_NEXT_PLAYER,
        ]
    ],

    ST_PLAYER_SELECT_MACHINE => [
        "name" => "selectMachine",
        "description" => clienttranslate('${actplayer} must choose a machine for effect ${machineEffect}'),
        "descriptionmyturn" => clienttranslate('${you} must choose a machine for effect ${machineEffect}'),
        "type" => "activeplayer",        
        "args" => "argSelectMachine",
        "possibleactions" => [ 
            "selectMachine",
        ],
        "transitions" => [
            "selectMachine" => ST_PLAYER_SELECT_MACHINE,
            "selectProject" => ST_PLAYER_SELECT_PROJECT,
            "selectResource" => ST_PLAYER_SELECT_RESOURCE,
            "selectExchange" => ST_PLAYER_SELECT_EXCHANGE,
            "refillHand" => ST_REFILL_HAND,
            "zombiePass" => ST_NEXT_PLAYER,
        ]
    ],

    ST_PLAYER_SELECT_PROJECT => [
        "name" => "selectProject",
        "description" => clienttranslate('${actplayer} must choose a project for effect ${machineEffect}'),
        "descriptionmyturn" => clienttranslate('${you} must choose a project for effect ${machineEffect}'),
        "type" => "activeplayer",
        "action" => "stSelectProject",     
        "args" => "argSelectProject",
        "possibleactions" => [ 
            "selectProject",
        ],
        "transitions" => [
            "refillHand" => ST_REFILL_HAND,
            "zombiePass" => ST_NEXT_PLAYER,
        ]
    ],

    ST_PLAYER_SELECT_RESOURCE => [
        "name" => "selectResource",
        "description" => clienttranslate('${actplayer} must choose resource(s) for effect ${machineEffect}'),
        "descriptionmyturn" => clienttranslate('${you} must choose resource(s) for effect ${machineEffect}'),
        "type" => "activeplayer",        
        "args" => "argSelectResource",
        "possibleactions" => [ 
            "selectResource",
            "cancel",
        ],
        "transitions" => [
            "refillHand" => ST_REFILL_HAND,
            "cancelPlayAction" => ST_PLAYER_CHOOSE_PLAY_ACTION,
            "cancelSelectMachine" => ST_PLAYER_SELECT_MACHINE,
            "zombiePass" => ST_NEXT_PLAYER,
        ]
    ],

    ST_PLAYER_SELECT_EXCHANGE => [
        "name" => "selectExchange",
        "description" => clienttranslate('${actplayer} can exchange resource/charcoalium (${number}/3)'),
        "descriptionmyturn" => clienttranslate('${you} can exchange resource/charcoalium (${number}/3)'),
        "type" => "activeplayer",        
        "args" => "argSelectExchange",
        "possibleactions" => [ 
            "selectExchange",
            "skipExchange",
        ],
        "transitions" => [
            "selectExchange" => ST_PLAYER_SELECT_EXCHANGE,
            "refillHand" => ST_REFILL_HAND,
            "zombiePass" => ST_NEXT_PLAYER,
        ]
    ],

    ST_PLAYER_CHOOSE_PROJECT => [
        "name" => "chooseProject",
        "description" => clienttranslate('${actplayer} can select complete project(s)'),
        "descriptionmyturn" => clienttranslate('${you} can select complete project(s)'),
        "type" => "activeplayer",
        "args" => "argChooseProject",
        "possibleactions" => [ 
            "selectProjects",
            "skipSelectProjects",
        ],
        "transitions" => [
            "nextPlayer" => ST_NEXT_PLAYER, // for skip
            "chooseProjectDiscardedMachine" => ST_PLAYER_CHOOSE_PROJECT_DISCARDED_MACHINE,
            "completeProjects" => ST_COMPLETE_PROJECTS,
            "zombiePass" => ST_NEXT_PLAYER,
        ]
    ],

    ST_PLAYER_CHOOSE_PROJECT_DISCARDED_MACHINE => [
        "name" => "chooseProjectDiscardedMachine",
        "description" => clienttranslate('${actplayer} must choose machines to discard for completed project(s)'),
        "descriptionmyturn" => clienttranslate('${you} must choose machines to discard for completed project(s)'),
        "type" => "activeplayer",
        "args" => "argChooseProjectDiscardedMachine",
        "possibleactions" => [ 
            "discardSelectedMachines",
        ],
        "transitions" => [
            "completeProjects" => ST_COMPLETE_PROJECTS,
            "zombiePass" => ST_NEXT_PLAYER,
        ]
    ],


];


$gameGameStates = [
    ST_REFILL_HAND => [
        "name" => "refillHand",
        "description" => "",
        "type" => "game",
        "action" => "stRefillHand",
        "transitions" => [ 
            "nextPlayer" => ST_NEXT_PLAYER,
        ],
    ],

    ST_COMPLETE_PROJECTS =>  [
        "name" => "completeProjects",
        "description" => "",
        "type" => "game",
        "action" => "stCompleteProjects",
        "transitions" => [ 
            "nextPlayer" => ST_NEXT_PLAYER,
            "zombiePass" => ST_NEXT_PLAYER,
        ],
    ],
];
 
$machinestates = $basicGameStates + $playerActionsGameStates + $gameGameStates;
