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
  	
    public function repairMachine() {
        self::setAjaxMode();

        $id = self::getArg("id", AT_posint, true);
        $payment = json_decode(base64_decode(self::getArg("payment", AT_base64, true)));

        $this->game->repairMachine($id, $payment);

        self::ajaxResponse();
    }
  	
    public function getCharcoalium() {
        self::setAjaxMode();

        $this->game->getCharcoalium();

        self::ajaxResponse();
    }
  	
    public function getResource() {
        self::setAjaxMode();

        $resource = self::getArg("resource", AT_posint, true);

        $this->game->getResource($resource);

        self::ajaxResponse();
    }
  	
    public function applyEffect() {
        self::setAjaxMode();

        $this->game->applyEffect();

        self::ajaxResponse();
    }

    public function selectProjects() {
        self::setAjaxMode();     

        $projectsIds = self::getArg( "ids", AT_numberlist, true );
        $this->game->selectProjects(array_map(function($idStr) { return intval($idStr); }, explode(',', $projectsIds)));

        self::ajaxResponse();
    }

    public function skipSelectProjects() {
        self::setAjaxMode();

        $this->game->skipSelectProjects();

        self::ajaxResponse();
    }

    public function selectMachine() {
        self::setAjaxMode();     

        $id = self::getArg("id", AT_posint, true);
        $this->game->selectMachine($id);

        self::ajaxResponse();
    }

    public function selectProject() {
        self::setAjaxMode();     

        $id = self::getArg("id", AT_posint, true);
        $this->game->selectProject($id);

        self::ajaxResponse();
    }

    public function selectResource() {
        self::setAjaxMode();     

        $resourcesTypes = self::getArg("resourcesTypes", AT_numberlist, true);
        $this->game->selectResource(array_map(function($idStr) { return intval($idStr); }, explode(',', $resourcesTypes)));

        self::ajaxResponse();
    }

    public function selectExchange() {
        self::setAjaxMode();     

        $from = self::getArg("from", AT_posint, true);
        $to = self::getArg("to", AT_posint, true);
        $this->game->selectExchange($from, $to);

        self::ajaxResponse();
    }

    public function skipExchange() {
        self::setAjaxMode();     

        $this->game->skipExchange();

        self::ajaxResponse();
    }
  }
