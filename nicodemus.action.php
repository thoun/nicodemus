<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Nicodemus implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 * 
 * nicodemus.action.php
 *
 * Nicodemus main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *       
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/nicodemus/nicodemus/myAction.html", ...)
 *
 */
  
  
  class action_nicodemus extends APP_GameAction { 
    // Constructor: please do not modify
   	public function __default() {
  	    if (self::isArg( 'notifwindow')) {
            $this->view = "common_notifwindow";
  	        $this->viewArgs['table'] = self::getArg("table", AT_posint, true);
  	    } else {
            $this->view = "nicodemus_nicodemus";
            self::trace("Complete reinitialization of board game");
      }
  	} 
  	
    public function playMachine() {
        self::setAjaxMode();

        $id = self::getArg("id", AT_posint, true);

        $this->game->playMachine($id);

        self::ajaxResponse();
    }
  	
    public function fixMachine() {
        self::setAjaxMode();

        $id = self::getArg("id", AT_posint, true);

        $this->game->fixMachine($id);

        self::ajaxResponse();
    }
  	
    public function getCarbonium() {
        self::setAjaxMode();

        $this->game->getCarbonium();

        self::ajaxResponse();
    }
  	
    public function getResource() {
        self::setAjaxMode();

        $this->game->getResource();

        self::ajaxResponse();
    }
  	
    public function applyEffect() {
        self::setAjaxMode();

        $this->game->applyEffect();

        self::ajaxResponse();
    }

  }
