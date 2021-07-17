
-- ------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- Nicodemus implementation : © <Your name here> <Your email address here>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-- -----

-- dbmodel.sql

-- This is the file where you are describing the database schema of your game
-- Basically, you just have to export from PhpMyAdmin your table structure and copy/paste
-- this export here.
-- Note that the database itself and the standard tables ("global", "stats", "gamelog" and "player") are
-- already created and must not be created here

-- Note: The database schema is created from this file when the game starts. If you modify this file,
--       you have to restart a game to see your changes in database.

-- Example 1: create a standard "card" table to be used with the "Deck" tools (see example game "hearts"):

CREATE TABLE IF NOT EXISTS `machine` (
   `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
   `card_type` int(1) NOT NULL,
   `card_type_arg` int(1) NOT NULL,
   `card_location` varchar(20) NOT NULL,
   `card_location_arg` int(11),
   PRIMARY KEY (`card_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `project` (
   `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
   `card_type` int(1) NOT NULL,
   `card_type_arg` int(1) NOT NULL,
   `card_location` varchar(20) NOT NULL,
   `card_location_arg` int(11),
   PRIMARY KEY (`card_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `resource` (
   `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
   `card_type` int(1) NOT NULL,
   `card_type_arg` int(1),
   `card_location` varchar(20) NOT NULL,
   `card_location_arg` int(11),
   PRIMARY KEY (`card_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;