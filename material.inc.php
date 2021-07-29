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
 * material.inc.php
 *
 * Nicodemus game material description
 *
 * Here, you can describe the material of your game with PHP variables.
 *   
 * This file is loaded in your game logic class constructor, ie these variables
 * are available everywhere in your game logic code.
 *
 */

require_once('modules/php/objects/machine.php');
require_once('modules/php/objects/project.php');

$this->MACHINES = [
  // blue
  11 => new MachineCard(1, 1, [2 => 1, 3 => 1]),
  12 => new MachineCard(1, 0, [1 => 2]),
  13 => new MachineCard(2, 2, [2 => 1, 3 => 2]),
  14 => new MachineCard(2, 3, [2 => 2, 3 => 1]),
  15 => new MachineCard(3, 9, [1 => 3, 2 => 1]),

  // purple
  21 => new MachineCard(1, 9, [1 => 1, 2 => 1]),
  22 => new MachineCard(1, 3, [1 => 2]),
  23 => new MachineCard(2, 2, [2 => 2, 3 => 1]),
  24 => new MachineCard(2, 1, [1 => 2, 3 => 1]),
  25 => new MachineCard(3, 0, [1 => 1, 2 => 1, 3 => 2]),

  // red
  31 => new MachineCard(1, 3, [1 => 1, 3 => 1]),
  32 => new MachineCard(2, 2, [1 => 1, 2 => 1, 3 => 1]),
  33 => new MachineCard(3, 0, [1 => 1, 3 => 3]),
  34 => new MachineCard(3, 1, [1 => 1, 2 => 3]),

  // yellow
  41 => new MachineCard(3, 1, [1 => 2, 3 => 2]),
  42 => new MachineCard(3, 0, [2 => 3, 3 => 1]),
];

$this->PROJECTS = [
  // colors
  10 => new ProjectCard(5, [1 => 1, 2 => 1, 3 => 1, 4 => 1]),
  11 => new ProjectCard(1, [1 => 2]),
  12 => new ProjectCard(1, [2 => 2]),
  13 => new ProjectCard(3, [3 => 2]),
  14 => new ProjectCard(3, [4 => 2]),

  // points
  20 => new ProjectCard(2, null, 0),
  21 => new ProjectCard(3, null, 1),
  22 => new ProjectCard(2, null, 2),
  23 => new ProjectCard(1, null, 3),

  // resources
  31 => new ProjectCard(2, null, null, [0 => 1, 1 => 1]),
  32 => new ProjectCard(2, null, null, [0 => 1, 2 => 1]),
  33 => new ProjectCard(2, null, null, [0 => 1, 3 => 1]),
  34 => new ProjectCard(2, null, null, [0 => 2]),
  35 => new ProjectCard(2, null, null, [1 => 2]),
  36 => new ProjectCard(2, null, null, [2 => 2]),
  37 => new ProjectCard(3, null, null, [3 => 2]),
  38 => new ProjectCard(3, null, null, [1 => 1, 2 => 1, 3 => 1]),
];

$this->COLLECTED_STAT_BY_TYPE = [
  0 => "collectedCharcoalium",
  1 => "collectedWood",
  2 => "collectedCopper",
  3 => "collectedCrystal",
];