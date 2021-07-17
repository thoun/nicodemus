function slideToObjectAndAttach(game, object, destinationId, posX, posY) {
    var destination = document.getElementById(destinationId);
    if (destination.contains(object)) {
        return Promise.resolve(true);
    }
    return new Promise(function (resolve) {
        var originalZIndex = Number(object.style.zIndex);
        object.style.zIndex = '10';
        var objectCR = object.getBoundingClientRect();
        var destinationCR = destination.getBoundingClientRect();
        var deltaX = destinationCR.left - objectCR.left + (posX !== null && posX !== void 0 ? posX : 0) * game.getZoom();
        var deltaY = destinationCR.top - objectCR.top + (posY !== null && posY !== void 0 ? posY : 0) * game.getZoom();
        //object.id == 'tile98' && console.log(object, destination, objectCR, destinationCR, destinationCR.left - objectCR.left, );
        object.style.transition = "transform 0.5s ease-in";
        object.style.transform = "translate(" + deltaX / game.getZoom() + "px, " + deltaY / game.getZoom() + "px)";
        var transitionend = function () {
            console.log('ontransitionend', object, destination);
            object.style.top = posY !== undefined ? posY + "px" : 'unset';
            object.style.left = posX !== undefined ? posX + "px" : 'unset';
            object.style.position = (posX !== undefined || posY !== undefined) ? 'absolute' : 'relative';
            object.style.zIndex = originalZIndex ? '' + originalZIndex : 'unset';
            object.style.transform = 'unset';
            object.style.transition = 'unset';
            destination.appendChild(object);
            object.removeEventListener('transitionend', transitionend);
            resolve(true);
        };
        object.addEventListener('transitionend', transitionend);
    });
}
/*declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

declare const board: HTMLDivElement;*/
var MACHINES_IDS = [
    // blue
    11,
    12,
    13,
    14,
    15,
    // purple
    21,
    22,
    23,
    24,
    25,
    // red
    31,
    32,
    33,
    34,
    // yellow
    41,
    42,
];
var PROJECTS_IDS = [
    // colors
    10,
    11,
    12,
    13,
    14,
    // points
    20,
    21,
    22,
    23,
    // resources
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
];
var MACHINE_WIDTH = 190;
var MACHINE_HEIGHT = 190;
var PROJECT_WIDTH = 134;
var PROJECT_HEIGHT = 93;
function getUniqueId(object) {
    return object.type * 10 + object.subType;
}
function setupMachineCards(machineStocks) {
    var cardsurl = g_gamethemeurl + "img/cards.jpg";
    machineStocks.forEach(function (machineStock) {
        return MACHINES_IDS.forEach(function (cardId, index) {
            return machineStock.addItemType(cardId, 0, cardsurl, index);
        });
    });
}
function setupProjectCards(projectStocks) {
    var cardsurl = g_gamethemeurl + "img/projects.jpg";
    projectStocks.forEach(function (projectStock) {
        PROJECTS_IDS.forEach(function (cardId, index) {
            return projectStock.addItemType(cardId, 0, cardsurl, index);
        });
    });
}
function getLocationTooltip(typeWithGuild) {
    var type = Math.floor(typeWithGuild / 10);
    var guild = typeWithGuild % 10;
    var message = null;
    switch (type) {
        case 1:
            message = _("At the end of the game, this Location is worth 7 IP.");
            break;
        case 2:
            message = _("Immediately gain 1 Pearl. At the end of the game, this Location is worth 5 IP.");
            break;
        case 3:
            message = _("Immediately gain 2 Pearls. At the end of the game, this Location is worth 4 IP.");
            break;
        case 4:
            message = _("Immediately gain 3 Pearls. At the end of the game, this Location is worth 3 IP.");
            break;
        case 5:
            message = _("At the end of the game, this Location is worth 1 IP per silver key held in your Senate Chamber, regardless of whether or not it has been used to take control of a Location.");
            break;
        case 6:
            message = _("At the end of the game, this Location is worth 2 IP per gold key held in your Senate Chamber, regardless of whether or not it has been used to take control of a Location.");
            break;
        case 7:
            message = _("At the end of the game, this Location is worth 1 IP per pair of Pearls in your possession.");
            break;
        case 8:
            message = _("At the end of the game, this Location is worth 2 IP per Location in your control.");
            break;
        case 9:
            message = _("Until your next turn, each opponent MUST only increase the size of their Senate Chamber by taking the first Lord from the deck. At the end of the game, this Location is worth 3 IP.");
            break;
        case 10:
            message = _("Until your next turn, each opponent MUST only increase the size of their Senate Chamber by taking first 2 Lords from the deck. Adding one to their Senate Chamber and discarding the other. At the end of the game, this Location is worth 3 IP.");
            break;
        case 11:
            message = _("Immediately replace all the discarded Lords in to the Lord deck and reshuffle. At the end of the game, this Location is worth 3 IP.");
            break;
        case 12:
            message = _("Immediately replace all the available Locations to the Location deck and reshuffle. At the end of the game, this Location is worth 3 IP.");
            break;
        case 13:
            message = _("Until the end of the game, to take control of a Location, only 2 keys are needed, irrespective of their type. At the end of the game, this Location is worth 3 IP.");
            break;
        case 14:
            message = _("Until the end of the game, when you take control of a Location, you choose this location from the Location deck (No longer from the available Locations). The deck is then reshuffled. At the end of the game, this Location is worth 3 IP.");
            break;
    }
    return message;
}
function getLordTooltip(typeWithGuild) {
    var type = Math.floor(typeWithGuild / 10);
    var message = null;
    switch (type) {
        case 1:
            message = _("When this Lord is placed in the Senate Chamber, two Lords in this Chamber (including this one) can be swapped places, except those with keys.");
            break;
        case 2:
            message = _("This Lord gives you 1 silver key.");
            break;
        case 3:
            message = _("This Lord gives you 1 gold key.");
            break;
        case 4:
            message = _("This Lord gives you 2 Pearls.");
            break;
        case 5:
            message = _("This Lord gives you 1 Pearl.");
            break;
        case 6:
            message = _("When this Lord is placed in the Senate Chamber, the top Lord card is taken from the Lord deck and placed in the corresponding discard pile.");
            break;
    }
    return message;
}
function moveToAnotherStock(sourceStock, destinationStock, uniqueId, cardId) {
    if (sourceStock === destinationStock) {
        return;
    }
    var sourceStockItemId = sourceStock.container_div.id + "_item_" + cardId;
    if (document.getElementById(sourceStockItemId)) {
        destinationStock.addToStockWithId(uniqueId, cardId, sourceStockItemId);
        sourceStock.removeFromStockById(cardId);
    }
    else {
        console.warn(sourceStockItemId + " not found in ", sourceStock);
        destinationStock.addToStockWithId(uniqueId, cardId, sourceStock.container_div.id);
    }
}
function formatTextIcons(rawText) {
    return rawText
        .replace(/\[resource0\]/ig, '<span class="icon charcoalium"></span>')
        .replace(/\[resource1\]/ig, '<span class="icon wood"></span>')
        .replace(/\[resource2\]/ig, '<span class="icon copper"></span>')
        .replace(/\[resource3\]/ig, '<span class="icon crystal"></span>')
        .replace(/\[resource9\]/ig, '<span class="icon joker"></span>');
}
var Table = /** @class */ (function () {
    function Table(game, players, projects, machines) {
        var _this = this;
        this.game = game;
        this.projectStocks = [];
        this.machineStocks = [];
        var html = '';
        // points
        players.forEach(function (player) {
            return html += "<div id=\"player-" + player.id + "-point-marker\" class=\"point-marker " + (player.color.startsWith('00') ? 'blue' : 'red') + "\"></div>";
        });
        dojo.place(html, 'table');
        players.forEach(function (player) { return _this.setPoints(Number(player.id), Number(player.score)); });
        // projects
        html = '';
        for (var i = 1; i <= 6; i++) {
            html += "<div id=\"table-project-" + i + "\" class=\"table-project-stock\" style=\"left: " + 181 * (i - 1) + "px\"></div>";
        }
        dojo.place(html, 'table-projects');
        for (var i = 1; i <= 6; i++) {
            this.projectStocks[i] = new ebg.stock();
            this.projectStocks[i].setSelectionAppearance('class');
            this.projectStocks[i].selectionClass = 'selected';
            this.projectStocks[i].create(this.game, $("table-project-" + i), PROJECT_WIDTH, PROJECT_HEIGHT);
            this.projectStocks[i].setSelectionMode(0);
            //this.projectStocks[i].onItemCreate = dojo.hitch(this, 'setupNewLordCard'); 
            dojo.connect(this.projectStocks[i], 'onChangeSelection', this, function () { return _this._onProjectSelectionChanged(); });
        }
        setupProjectCards(this.projectStocks);
        var _loop_1 = function (i) {
            projects.filter(function (project) { return project.location_arg == i; }).forEach(function (project) { return _this.projectStocks[i].addToStockWithId(getUniqueId(project), '' + project.id); });
        };
        for (var i = 1; i <= 6; i++) {
            _loop_1(i);
        }
        // machines
        html = "<div class=\"machines\">";
        for (var i = 1; i <= 10; i++) {
            var firstRow = i <= 5;
            var left = (firstRow ? 204 : 0) + (i - 1) * 204;
            var top_1 = firstRow ? 0 : 210;
            html += "<div id=\"table-machine-spot-" + i + "\" class=\"machine-spot\" style=\"left: " + left + "px; top: " + top_1 + "px\"></div>";
        }
        html += "<div id=\"machine-deck\" class=\"stockitem\"></div></div>";
        dojo.place(html, 'table');
        var _loop_2 = function (i) {
            this_1.machineStocks[i] = new ebg.stock();
            this_1.machineStocks[i].setSelectionAppearance('class');
            this_1.machineStocks[i].selectionClass = 'selected';
            this_1.machineStocks[i].create(this_1.game, $("table-machine-spot-" + i), MACHINE_WIDTH, MACHINE_HEIGHT);
            this_1.machineStocks[i].setSelectionMode(0);
            //this.stocks[i].onItemCreate = dojo.hitch(this, 'setupNewLordCard'); 
            dojo.connect(this_1.machineStocks[i], 'onChangeSelection', this_1, function () { return _this.onMachineSelectionChanged(_this.machineStocks[i].getSelectedItems()); });
        };
        var this_1 = this;
        for (var i = 1; i <= 10; i++) {
            _loop_2(i);
        }
        setupMachineCards(this.machineStocks);
        var _loop_3 = function (i) {
            machines.filter(function (machine) { return machine.location_arg == i; }).forEach(function (machine) { return _this.machineStocks[i].addToStockWithId(getUniqueId(machine), '' + machine.id); });
        };
        for (var i = 1; i <= 10; i++) {
            _loop_3(i);
        }
    }
    Table.prototype.getSelectedProjectsIds = function () {
        var selectedIds = [];
        for (var i = 1; i <= 6; i++) {
            selectedIds.push.apply(selectedIds, this.projectStocks[i].getSelectedItems().map(function (item) { return Number(item.id); }));
        }
        return selectedIds;
    };
    Table.prototype._onProjectSelectionChanged = function () {
        var _a;
        (_a = this.onProjectSelectionChanged) === null || _a === void 0 ? void 0 : _a.call(this, this.getSelectedProjectsIds());
    };
    Table.prototype.onMachineSelectionChanged = function (items) {
        if (items.length == 1) {
            var card = items[0];
            this.game.repairMachine(card.id);
        }
    };
    Table.prototype.setProjectSelectable = function (selectable) {
        this.projectStocks.forEach(function (stock) { return stock.setSelectionMode(selectable ? 2 : 0); });
        if (!selectable) {
            this.projectStocks.forEach(function (stock) { return stock.unselectAll(); });
        }
    };
    Table.prototype.setMachineSelectable = function (selectable) {
        this.machineStocks.forEach(function (stock) { return stock.setSelectionMode(selectable ? 1 : 0); });
        if (!selectable) {
            this.machineStocks.forEach(function (stock) { return stock.unselectAll(); });
        }
    };
    Table.prototype.setPoints = function (playerId, points) {
        var markerDiv = document.getElementById("player-" + playerId + "-point-marker");
        markerDiv.style.top = (points % 2 ? 40 : 52) + "px";
        markerDiv.style.left = 16 + points * 46.2 + "px";
    };
    Table.prototype.machinePlayed = function (playerId, machine) {
        var fromHandId = "my-machines_item_" + machine.id;
        var from = document.getElementById(fromHandId) ? fromHandId : "player-icon-" + playerId;
        this.machineStocks[machine.location_arg].addToStockWithId(getUniqueId(machine), '' + machine.id, from);
    };
    return Table;
}());
var PlayerTable = /** @class */ (function () {
    function PlayerTable(game, player, side) {
        var _this = this;
        this.game = game;
        this.playerId = Number(player.id);
        var color = player.color.startsWith('00') ? 'blue' : 'red';
        var html = "\n        <div id=\"player-table-" + this.playerId + "\" class=\"player-table whiteblock " + side + "\">\n            <div class=\"name-column " + color + " " + side + "\">\n                <div class=\"player-name\">" + player.name + "</div>\n                <div class=\"player-icon " + color + "\"></div>\n            </div>\n            <div class=\"gradient " + color + " " + side + "\"></div>\n            <div id=\"player-table-" + this.playerId + "-machines\" class=\"machines\"></div>\n        </div>";
        dojo.place(html, 'playerstables');
        this.machineStock = new ebg.stock();
        this.machineStock.setSelectionAppearance('class');
        this.machineStock.selectionClass = 'selected';
        this.machineStock.create(this.game, $("player-table-" + this.playerId + "-machines"), MACHINE_WIDTH, MACHINE_HEIGHT);
        this.machineStock.setSelectionMode(0);
        this.machineStock.centerItems = true;
        //this.stocks[i].onItemCreate = dojo.hitch(this, 'setupNewLordCard'); 
        //dojo.connect(this.machineStock, 'onChangeSelection', this, () => this.onMachineSelectionChanged(this.machineStocks[i].getSelectedItems()));
        setupMachineCards([this.machineStock]);
        player.machines.forEach(function (machine) { return _this.machineStock.addToStockWithId(getUniqueId(machine), '' + machine.id); });
    }
    PlayerTable.prototype.setResource = function (type, number) {
        // TODO
    };
    return PlayerTable;
}());
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var ANIMATION_MS = 500;
/*const SCORE_MS = 1500;

const ZOOM_LEVELS = [0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
const ZOOM_LEVELS_MARGIN = [-300, -166, -100, -60, -33, -14, 0];
const LOCAL_STORAGE_ZOOM_KEY = 'Nicodemus-zoom';*/
var isDebug = window.location.host == 'studio.boardgamearena.com';
var log = isDebug ? console.log.bind(window.console) : function () { };
var Nicodemus = /** @class */ (function () {
    function Nicodemus() {
        this.charcoaliumCounters = [];
        this.woodCounters = [];
        this.copperCounters = [];
        this.crystalCounters = [];
        this.playersTables = [];
        this.zoom = 1;
        /*const zoomStr = localStorage.getItem(LOCAL_STORAGE_ZOOM_KEY);
        if (zoomStr) {
            this.zoom = Number(zoomStr);
        } */
    }
    /*
        setup:

        This method must set up the game user interface according to current game situation specified
        in parameters.

        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)

        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */
    Nicodemus.prototype.setup = function (gamedatas) {
        // ignore loading of some pictures
        /*(this as any).dontPreloadImage('eye-shadow.png');
        (this as any).dontPreloadImage('publisher.png');
        [1,2,3,4,5,6,7,8,9,10].filter(i => !Object.values(gamedatas.players).some(player => Number((player as any).mat) === i)).forEach(i => (this as any).dontPreloadImage(`playmat_${i}.jpg`));
*/
        log("Starting game setup");
        this.gamedatas = gamedatas;
        log('gamedatas', gamedatas);
        this.createPlayerPanels(gamedatas);
        this.setHand(gamedatas.handMachines);
        this.table = new Table(this, Object.values(gamedatas.players), gamedatas.tableProjects, gamedatas.tableMachines);
        this.table.onProjectSelectionChanged = function (selectProjectsIds) {
            dojo.toggleClass('selectProjects-button', 'disabled', !selectProjectsIds.length);
            dojo.toggleClass('skipProjects-button', 'disabled', !!selectProjectsIds.length);
        };
        this.createPlayerTables(gamedatas);
        this.setupNotifications();
        /*document.getElementById('zoom-out').addEventListener('click', () => this.zoomOut());
        document.getElementById('zoom-in').addEventListener('click', () => this.zoomIn());

        (this as any).onScreenWidthChange = () => this.setAutoZoom();

        */
        log("Ending game setup");
    };
    ///////////////////////////////////////////////////
    //// Game & client states
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    Nicodemus.prototype.onEnteringState = function (stateName, args) {
        log('Entering state: ' + stateName, args.args);
        switch (stateName) {
            case 'chooseAction':
                if (this.isCurrentPlayerActive()) {
                    this.setHandSelectable(true);
                    this.table.setMachineSelectable(true);
                }
                break;
            case 'chooseProject':
                if (this.isCurrentPlayerActive()) {
                    this.table.setProjectSelectable(true);
                }
                break;
        }
    };
    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    Nicodemus.prototype.onLeavingState = function (stateName) {
        log('Leaving state: ' + stateName);
        switch (stateName) {
            case 'chooseAction':
                this.setHandSelectable(false);
                this.table.setMachineSelectable(false);
                break;
            case 'chooseProject':
                this.table.setProjectSelectable(false);
                break;
        }
    };
    Nicodemus.prototype.onLeavingChooseTile = function () {
        dojo.removeClass('factories', 'selectable');
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    Nicodemus.prototype.onUpdateActionButtons = function (stateName, args) {
        var _this = this;
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'choosePlayAction':
                    var choosePlayActionArgs_1 = args;
                    this.addActionButton('getCharcoalium-button', _('Get charcoalium') + formatTextIcons(" (" + choosePlayActionArgs_1.charcoalium + " [resource0])"), function () { return _this.getCharcoalium(); });
                    if (choosePlayActionArgs_1.resource == 9) {
                        var _loop_4 = function (i) {
                            this_2.addActionButton('getResource-button', _('Get resource') + formatTextIcons(" ([resource" + i + "])"), function () { return _this.getResource(i); });
                        };
                        var this_2 = this;
                        for (var i = 1; i <= 3; i++) {
                            _loop_4(i);
                        }
                    }
                    else {
                        this.addActionButton('getResource-button', _('Get resource') + formatTextIcons(" ([resource" + choosePlayActionArgs_1.resource + "])"), function () { return _this.getResource(choosePlayActionArgs_1.resource); });
                        if (choosePlayActionArgs_1.resource == 0) {
                            dojo.removeClass('getResource-button', 'bgabutton_blue');
                            dojo.addClass('getResource-button', 'bgabutton_gray');
                        }
                    }
                    this.addActionButton('applyEffect-button', _('Apply effect'), function () { return _this.applyEffect(); });
                    break;
                case 'chooseProject':
                    this.addActionButton('selectProjects-button', _('Complete projects'), function () { return _this.selectProjects(_this.table.getSelectedProjectsIds()); });
                    this.addActionButton('skipProjects-button', _('Skip'), function () { return _this.selectProjects([]); }, null, null, 'red');
                    dojo.toggleClass('selectProjects-button', 'disabled', !this.table.getSelectedProjectsIds().length);
                    dojo.toggleClass('skipProjects-button', 'disabled', !!this.table.getSelectedProjectsIds().length);
                    break;
            }
        }
    };
    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////
    Nicodemus.prototype.setHand = function (machines) {
        var _this = this;
        this.playerMachineHand = new ebg.stock();
        this.playerMachineHand.create(this, $('my-machines'), MACHINE_WIDTH, MACHINE_HEIGHT);
        this.playerMachineHand.setSelectionMode(1);
        this.playerMachineHand.setSelectionAppearance('class');
        this.playerMachineHand.selectionClass = 'selected';
        this.playerMachineHand.centerItems = true;
        //this.playerMachineHand.onItemCreate = (card_div: HTMLDivElement, card_type_id: number) => this.mowCards.setupNewCard(this, card_div, card_type_id); 
        dojo.connect(this.playerMachineHand, 'onChangeSelection', this, function () { return _this.onPlayerMachineHandSelectionChanged(_this.playerMachineHand.getSelectedItems()); });
        setupMachineCards([this.playerMachineHand]);
        machines.forEach(function (machine) { return _this.playerMachineHand.addToStockWithId(getUniqueId(machine), '' + machine.id); });
    };
    Nicodemus.prototype.setHandSelectable = function (selectable) {
        this.playerMachineHand.setSelectionMode(selectable ? 1 : 0);
    };
    Nicodemus.prototype.onPlayerMachineHandSelectionChanged = function (items) {
        if (items.length == 1) {
            var card = items[0];
            this.playMachine(card.id);
        }
    };
    Nicodemus.prototype.getPlayerId = function () {
        return Number(this.player_id);
    };
    Nicodemus.prototype.getPlayerTable = function (playerId) {
        return this.playersTables.find(function (playerTable) { return playerTable.playerId === playerId; });
    };
    Nicodemus.prototype.createPlayerPanels = function (gamedatas) {
        var _this = this;
        Object.values(gamedatas.players).forEach(function (player) {
            var playerId = Number(player.id);
            // charcoalium & resources counters
            dojo.place("<div class=\"counters\">\n                <div id=\"charcoalium-counter-wrapper-" + player.id + "\" class=\"charcoalium-counter\">\n                    <div class=\"icon charcoalium\"></div> \n                    <span id=\"charcoalium-counter-" + player.id + "\"></span>\n                </div>\n            </div>\n            <div class=\"counters\">\n                <div id=\"wood-counter-wrapper-" + player.id + "\" class=\"wood-counter\">\n                    <div class=\"icon wood\"></div> \n                    <span id=\"wood-counter-" + player.id + "\"></span>\n                </div>\n                <div id=\"copper-counter-wrapper-" + player.id + "\" class=\"copper-counter\">\n                    <div class=\"icon copper\"></div> \n                    <span id=\"copper-counter-" + player.id + "\"></span>\n                </div>\n                <div id=\"crystal-counter-wrapper-" + player.id + "\" class=\"crystal-counter\">\n                    <div class=\"icon crystal\"></div> \n                    <span id=\"crystal-counter-" + player.id + "\"></span>\n                </div>\n            </div>", "player_board_" + player.id);
            var charcoaliumCounter = new ebg.counter();
            charcoaliumCounter.create("charcoalium-counter-" + playerId);
            charcoaliumCounter.setValue(player.charcoalium);
            _this.charcoaliumCounters[playerId] = charcoaliumCounter;
            var woodCounter = new ebg.counter();
            woodCounter.create("wood-counter-" + playerId);
            woodCounter.setValue(player.wood);
            _this.woodCounters[playerId] = woodCounter;
            var copperCounter = new ebg.counter();
            copperCounter.create("copper-counter-" + playerId);
            copperCounter.setValue(player.copper);
            _this.copperCounters[playerId] = copperCounter;
            var crystalCounter = new ebg.counter();
            crystalCounter.create("crystal-counter-" + playerId);
            crystalCounter.setValue(player.crystal);
            _this.crystalCounters[playerId] = crystalCounter;
            if (player.playerNo == 1) {
                dojo.place("<div id=\"player-icon-" + player.id + "\" class=\"player-icon first-player\"></div>", "player_board_" + player.id);
            }
        });
        this.addTooltipHtmlToClass('charcoalium-counter', _("Charcoalium"));
        this.addTooltipHtmlToClass('wood-counter', _("Wood"));
        this.addTooltipHtmlToClass('copper-counter', _("Copper"));
        this.addTooltipHtmlToClass('crystal-counter', _("Crystal"));
    };
    Nicodemus.prototype.createPlayerTables = function (gamedatas) {
        var _this = this;
        var players = Object.values(gamedatas.players).sort(function (a, b) { return a.playerNo - b.playerNo; });
        var playerIndex = players.findIndex(function (player) { return Number(player.id) === Number(_this.player_id); });
        var orderedPlayers = playerIndex > 0 ? __spreadArray(__spreadArray([], players.slice(playerIndex)), players.slice(0, playerIndex)) : players;
        orderedPlayers.forEach(function (player, index) {
            return _this.createPlayerTable(gamedatas, Number(player.id), index ? 'right' : 'left');
        });
    };
    Nicodemus.prototype.createPlayerTable = function (gamedatas, playerId, side) {
        this.playersTables.push(new PlayerTable(this, gamedatas.players[playerId], side));
    };
    Nicodemus.prototype.playMachine = function (id) {
        if (!this.checkAction('playMachine')) {
            return;
        }
        this.takeAction('playMachine', {
            id: id
        });
    };
    Nicodemus.prototype.repairMachine = function (id) {
        if (!this.checkAction('repairMachine')) {
            return;
        }
        this.takeAction('repairMachine', {
            id: id
        });
    };
    Nicodemus.prototype.getCharcoalium = function () {
        if (!this.checkAction('getCharcoalium')) {
            return;
        }
        this.takeAction('getCharcoalium');
    };
    Nicodemus.prototype.getResource = function (resource) {
        if (!this.checkAction('getResource')) {
            return;
        }
        this.takeAction('getResource', {
            resource: resource
        });
    };
    Nicodemus.prototype.applyEffect = function () {
        if (!this.checkAction('applyEffect')) {
            return;
        }
        this.takeAction('applyEffect');
    };
    Nicodemus.prototype.selectProjects = function (ids) {
        if (!this.checkAction('selectProjects')) {
            return;
        }
        this.takeAction('selectProjects', {
            ids: ids.join(',')
        });
    };
    Nicodemus.prototype.takeAction = function (action, data) {
        data = data || {};
        data.lock = true;
        this.ajaxcall("/nicodemus/nicodemus/" + action + ".html", data, this, function () { });
    };
    Nicodemus.prototype.setPoints = function (playerId, points) {
        var _a;
        (_a = this.scoreCtrl[playerId]) === null || _a === void 0 ? void 0 : _a.toValue(points);
        this.table.setPoints(playerId, points);
    };
    Nicodemus.prototype.setResource = function (playerId, resource, number) {
        if (playerId == 0) {
        }
        else {
            var counters = [this.charcoaliumCounters, this.woodCounters, this.copperCounters, this.crystalCounters];
            counters[resource][playerId].toValue(number);
            this.getPlayerTable(playerId).setResource(resource, number);
        }
    };
    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications
    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your nicodemus.game.php file.

    */
    Nicodemus.prototype.setupNotifications = function () {
        //log( 'notifications subscriptions setup' );
        var _this = this;
        var notifs = [
            ['machinePlayed', ANIMATION_MS],
            ['points', 1],
            ['resources', 1],
        ];
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_" + notif[0]);
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    };
    Nicodemus.prototype.notif_machinePlayed = function (notif) {
        this.playerMachineHand.removeFromStockById('' + notif.args.machine.id);
        this.table.machinePlayed(notif.args.playerId, notif.args.machine);
    };
    Nicodemus.prototype.notif_points = function (notif) {
        this.setPoints(notif.args.playerId, notif.args.points);
    };
    Nicodemus.prototype.notif_resources = function (notif) {
        var _this = this;
        Object.keys(notif.args.resources).forEach(function (key) { return _this.setResource(Number(key), notif.args.resourceType, notif.args.resources[key].length); });
    };
    Nicodemus.prototype.getMachineColor = function (color) {
        switch (color) {
            case 1: return '#006fa1';
            case 2: return '#702c91';
            case 3: return '#a72c32';
            case 4: return '#c48b10';
        }
        return null;
    };
    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    Nicodemus.prototype.format_string_recursive = function (log, args) {
        try {
            if (log && args && !args.processed) {
                // Representation of the color of a card
                if (typeof args.machine_name == 'string' && args.machine_name[0] != '<') {
                    args.machine_name = "<strong style=\"color: " + this.getMachineColor(args.machine.type) + "\">" + args.machine_name + "</strong>";
                }
            }
        }
        catch (e) {
            console.error(log, args, "Exception thrown", e.stack);
        }
        return this.inherited(arguments);
    };
    return Nicodemus;
}());
define([
    "dojo", "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock"
], function (dojo, declare) {
    return declare("bgagame.nicodemus", ebg.core.gamegui, new Nicodemus());
});
