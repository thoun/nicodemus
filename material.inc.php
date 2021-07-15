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

require_once( 'modules/php/objects/project.php' );

//ProjectCard($points, $colors = null, $machinePoints = null, $carbonium = null, $wood = null, $copper = null, $crystal = null)
$this->PROJECTS = [
  // colors
  11 => new ProjectCard(1, [1 => 2]),
  12 => new ProjectCard(1, [2 => 2]),
  13 => new ProjectCard(3, [3 => 2]),
  14 => new ProjectCard(3, [4 => 2]),
  10 => new ProjectCard(5, [1 => 1, 2 => 1, 3 => 1, 4 => 1]),

  // points
  20 => new ProjectCard(2, null, 0),
  21 => new ProjectCard(3, null, 1),
  22 => new ProjectCard(2, null, 2),
  23 => new ProjectCard(1, null, 3),

  // resources
  31 => new ProjectCard(2, null, null, 1, 1, 0, 0),
  32 => new ProjectCard(2, null, null, 1, 0, 1, 0),
  33 => new ProjectCard(2, null, null, 1, 0, 0, 1),
  34 => new ProjectCard(2, null, null, 2, 0, 0, 0),
  35 => new ProjectCard(2, null, null, 0, 2, 0, 0),
  36 => new ProjectCard(2, null, null, 0, 0, 2, 0),
  37 => new ProjectCard(3, null, null, 0, 0, 0, 2),
  38 => new ProjectCard(3, null, null, 0, 1, 1, 1),
];