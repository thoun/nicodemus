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
var LOCATIONS_UNIQUE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
var LOCATIONS_GUILDS_IDS = [100, 101];
var MACHINE_WIDTH = 190;
var MACHINE_HEIGHT = 190;
var LOCATION_WIDTH = 186.24;
var LOCATION_HEIGHT = 124;
function getUniqueId(object) {
    return object.type * 10 + object.subType;
}
function setupMachineCards(machineStocks) {
    var cardsurl = g_gamethemeurl + "img/cards.jpg";
    machineStocks.forEach(function (lordStock) {
        return MACHINES_IDS.forEach(function (lordType, index) {
            return lordStock.addItemType(lordType, 0, cardsurl, index);
        });
    });
}
function setupLocationCards(locationStocks) {
    var cardsurl = g_gamethemeurl + "img/locations.jpg";
    locationStocks.forEach(function (locationStock) {
        LOCATIONS_UNIQUE_IDS.forEach(function (id, index) {
            return locationStock.addItemType(id, 0, cardsurl, 1 + index);
        });
    });
}
function getGuildName(guild) {
    var guildName = null;
    switch (guild) {
        case 1:
            guildName = _('Farmer');
            break;
        case 2:
            guildName = _('Military');
            break;
        case 3:
            guildName = _('Merchant');
            break;
        case 4:
            guildName = _('Politician');
            break;
        case 5:
            guildName = _('Mage');
            break;
    }
    return guildName;
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
        case 100:
            message = guild ?
                dojo.string.substitute(_("At the end of the game, this Location is worth as many IP as your most influential ${guild_name} Lord."), { guild_name: getGuildName(guild) }) :
                _("At the end of the game, this Location is worth as many IP as your most influential Lord of the indicated color.");
            break;
        case 101:
            message = guild ?
                dojo.string.substitute(_("At the end of the game, this Location is worth 1 IP + a bonus of 1 IP per ${guild_name} Lord present in your Senate Chamber."), { guild_name: getGuildName(guild) }) :
                _("At the end of the game, this Location is worth 1 IP + a bonus of 1 IP per Lord of the indicated color present in your Senate Chamber.");
            break;
    }
    return message;
}
function getLordTooltip(typeWithGuild) {
    var type = Math.floor(typeWithGuild / 10);
    var guild = typeWithGuild % 10;
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
    if (message) {
        message += "<br/><br/>" + dojo.string.substitute(_("Guild : ${guild_name}"), { guild_name: getGuildName(guild) });
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
    function Table(game, machines) {
        var _this = this;
        this.game = game;
        this.stocks = [];
        var html = "<div>";
        for (var i = 0; i < 2; i++) {
            html += "<div id=\"row" + i + "\" class=\"row\"></div>";
        }
        html += "</div>";
        dojo.place(html, 'table');
        var _loop_1 = function (i) {
            this_1.stocks[i] = new ebg.stock();
            this_1.stocks[i].setSelectionAppearance('class');
            this_1.stocks[i].selectionClass = 'no-visible-selection';
            this_1.stocks[i].create(this_1.game, $("row" + i), MACHINE_WIDTH, MACHINE_HEIGHT);
            this_1.stocks[i].setSelectionMode(1);
            //this.stocks[i].onItemCreate = dojo.hitch(this, 'setupNewLordCard'); 
            dojo.connect(this_1.stocks[i], 'onChangeSelection', this_1, function () { return _this.onMachineSelectionChanged(_this.stocks[i].getSelectedItems()); });
        };
        var this_1 = this;
        for (var i = 0; i < 2; i++) {
            _loop_1(i);
        }
        setupMachineCards(this.stocks);
        machines.forEach(function (machine) { return _this.stocks[0].addToStockWithId(getUniqueId(machine), '' + machine.id); });
        console.log(machines, this.stocks[0]);
    }
    Table.prototype.onMachineSelectionChanged = function (items) {
        if (items.length == 1) {
            var card = items[0];
            this.game.repairMachine(card.id);
        }
    };
    return Table;
}());
var PlayerTable = /** @class */ (function () {
    function PlayerTable(game, player) {
        this.game = game;
        this.playerId = Number(player.id);
        /*let html = `<div id="player-table-wrapper-${this.playerId}" class="player-table-wrapper">
        <div id="player-table-${this.playerId}" class="player-table" style="border-color: #${player.color};">`;
        for (let i=1; i<=5; i++) {
            html += `<div id="player-table-${this.playerId}-line${i}" class="line" style="top: ${10 + 70*(i-1)}px; width: ${69*i - 5}px;"></div>`;
        }
        html += `<div id="player-table-${this.playerId}-line0" class="floor line"></div>`;
        html += `<div id="player-table-${this.playerId}-wall" class="wall ${this.game.isVariant() ? 'grayed-side' : 'colored-side'}"></div>`;
        if (this.game.isVariant()) {
            for (let i=1; i<=5; i++) {
                html += `<div id="player-table-${this.playerId}-column${i}" class="column" style="left: ${384 + 69*(i-1)}px; width: ${64}px;"></div>`;
            }
            html += `<div id="player-table-${this.playerId}-column0" class="floor column"></div>`;
        }
        html += `    </div>
        
            <div class="player-name" style="color: #${player.color};">${player.name}</div>
            <div class="player-name dark">${player.name}</div>
        </div>`;

        dojo.place(html, 'table');

        for (let i=0; i<=5; i++) {
            document.getElementById(`player-table-${this.playerId}-line${i}`).addEventListener('click', () => this.game.selectLine(i));
        }
        if (this.game.isVariant()) {
            for (let i=0; i<=5; i++) {
                document.getElementById(`player-table-${this.playerId}-column${i}`).addEventListener('click', () => this.game.selectColumn(i));
            }
        }

        for (let i=0; i<=5; i++) {
            const tiles = player.lines.filter(tile => tile.line === i);
            this.placeTilesOnLine(tiles, i);
        }

        this.placeTilesOnWall(player.wall);*/
    }
    return PlayerTable;
}());
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
        this.table = new Table(this, gamedatas.tableMachines);
        //this.createPlayerTables(gamedatas);
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
            case 'chooseTile':
                this.onEnteringChooseTile();
                break;
            /*case 'chooseLine':
                this.onEnteringChooseLine(args.args);
                break;*/
        }
    };
    /*private setGamestateDescription(property: string = '') {
        const originalState = this.gamedatas.gamestates[this.gamedatas.gamestate.id];
        this.gamedatas.gamestate.description = `${originalState['description' + property]}`;
        this.gamedatas.gamestate.descriptionmyturn = `${originalState['descriptionmyturn' + property]}`;
        (this as any).updatePageTitle();
    }*/
    Nicodemus.prototype.onEnteringChooseTile = function () {
        if (this.isCurrentPlayerActive()) {
            dojo.addClass('factories', 'selectable');
        }
    };
    /*onEnteringChooseLine(args: EnteringChooseLineArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            args.lines.forEach(i => dojo.addClass(`player-table-${this.getPlayerId()}-line${i}`, 'selectable'));
        }
    }

    onEnteringChooseColumn(args: EnteringChooseColumnArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            const playerId = this.getPlayerId();
            this.getPlayerTable(playerId).setColumnTop(args.line);
            args.columns[playerId].forEach(i => dojo.addClass(`player-table-${this.getPlayerId()}-column${i}`, 'selectable'));
        }
    }*/
    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    Nicodemus.prototype.onLeavingState = function (stateName) {
        log('Leaving state: ' + stateName);
        switch (stateName) {
            case 'chooseTile':
                this.onLeavingChooseTile();
                break;
            /*case 'chooseLine':
                this.onLeavingChooseLine();
                break;
            case 'chooseColumn':
                this.onLeavingChooseColumn();
                break;*/
        }
    };
    Nicodemus.prototype.onLeavingChooseTile = function () {
        dojo.removeClass('factories', 'selectable');
    };
    /*onLeavingChooseLine() {
        for (let i=0; i<=5; i++) {
            dojo.removeClass(`player-table-${this.getPlayerId()}-line${i}`, 'selectable');
        }
    }

    onLeavingChooseColumn() {
        for (let i=1; i<=5; i++) {
            dojo.removeClass(`player-table-${this.getPlayerId()}-column${i}`, 'selectable');
        }
        dojo.removeClass(`player-table-${this.getPlayerId()}-line0`, 'selectable');
    }*/
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
                        var _loop_2 = function (i) {
                            this_2.addActionButton('getResource-button', _('Get resource') + formatTextIcons(" ([resource" + i + "])"), function () { return _this.getResource(i); });
                        };
                        var this_2 = this;
                        for (var i = 1; i <= 3; i++) {
                            _loop_2(i);
                        }
                    }
                    else {
                        this.addActionButton('getResource-button', _('Get resource') + formatTextIcons(" ([resource" + choosePlayActionArgs_1.resource + "])"), function () { return _this.getResource(choosePlayActionArgs_1.resource); });
                    }
                    this.addActionButton('applyEffect-button', _('Apply effect'), function () { return _this.applyEffect(); });
                    break;
                case 'chooseProject':
                    this.addActionButton('selectProjects-button', _('Complete projects'), function () { return _this.selectProjects([]); });
                    this.addActionButton('skipProjects-button', _('Skip'), function () { return _this.selectProjects([]); }, null, null, 'red');
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
        this.playerMachineHand.create(this, $('mymachines'), MACHINE_WIDTH, MACHINE_HEIGHT);
        this.playerMachineHand.setSelectionMode(1);
        this.playerMachineHand.setSelectionAppearance('class');
        this.playerMachineHand.selectionClass = 'selected';
        this.playerMachineHand.centerItems = true;
        //this.playerMachineHand.onItemCreate = (card_div: HTMLDivElement, card_type_id: number) => this.mowCards.setupNewCard(this, card_div, card_type_id); 
        dojo.connect(this.playerMachineHand, 'onChangeSelection', this, function () { return _this.onPlayerMachineHandSelectionChanged(_this.playerMachineHand.getSelectedItems()); });
        setupMachineCards([this.playerMachineHand]);
        machines.forEach(function (machine) { return _this.playerMachineHand.addToStockWithId(getUniqueId(machine), '' + machine.id); });
    };
    Nicodemus.prototype.onPlayerMachineHandSelectionChanged = function (items) {
        if (items.length == 1) {
            var card = items[0];
            this.playMachine(card.id);
        }
    };
    /*public getZoom() {
        return this.zoom;
    }

    public setAutoZoom() {
        const zoomWrapperWidth = document.getElementById('zoom-wrapper').clientWidth;
        const factoryWidth = this.factories.getWidth();
        let newZoom = this.zoom;
        while (newZoom > ZOOM_LEVELS[0] && zoomWrapperWidth/newZoom < factoryWidth) {
            newZoom = ZOOM_LEVELS[ZOOM_LEVELS.indexOf(newZoom) - 1];
        }
        // zoom will also place player tables. we call setZoom even if this method didn't change it because it might have been changed by localStorage zoom
        this.setZoom(newZoom);
    }

    private setZoom(zoom: number = 1) {
        this.zoom = zoom;
        localStorage.setItem(LOCAL_STORAGE_ZOOM_KEY, ''+this.zoom);
        const newIndex = ZOOM_LEVELS.indexOf(this.zoom);
        dojo.toggleClass('zoom-in', 'disabled', newIndex === ZOOM_LEVELS.length - 1);
        dojo.toggleClass('zoom-out', 'disabled', newIndex === 0);

        const div = document.getElementById('table');
        const hands: HTMLDivElement[] = Array.from(document.getElementsByClassName('hand')) as HTMLDivElement[];
        if (zoom === 1) {
            div.style.transform = '';
            div.style.margin = '';
            hands.forEach(hand => {
                hand.style.transform = '';
                hand.style.margin = '';
            });
        } else {
            div.style.transform = `scale(${zoom})`;
            div.style.margin = `0 ${ZOOM_LEVELS_MARGIN[newIndex]}% ${(1-zoom)*-100}% 0`;
            hands.forEach(hand => {
                hand.style.transform = `scale(${zoom})`;
                hand.style.margin = `0 ${ZOOM_LEVELS_MARGIN[newIndex]}% 0 0`;
            });
        }

        document.getElementById('zoom-wrapper').style.height = `${div.getBoundingClientRect().height}px`;
    }

    public zoomIn() {
        if (this.zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]) {
            return;
        }
        const newIndex = ZOOM_LEVELS.indexOf(this.zoom) + 1;
        this.setZoom(ZOOM_LEVELS[newIndex]);
    }

    public zoomOut() {
        if (this.zoom === ZOOM_LEVELS[0]) {
            return;
        }
        const newIndex = ZOOM_LEVELS.indexOf(this.zoom) - 1;
        this.setZoom(ZOOM_LEVELS[newIndex]);
    }

    public isVariant(): boolean {
        return this.gamedatas.variant;
    }

    public getPlayerId(): number {
        return Number((this as any).player_id);
    }

    private getPlayerColor(playerId: number): string {
        return this.gamedatas.players[playerId].color;
    }

    private getPlayerTable(playerId: number): PlayerTable {
        return this.playersTables.find(playerTable => playerTable.playerId === playerId);
    }

    private incScore(playerId: number, incScore: number) {
        (this as any).scoreCtrl[playerId]?.incValue(incScore);
    }

    public placeTile(tile: Tile, destinationId: string, left?: number, top?: number, zIndex?: number): Promise<boolean> {
        //this.removeTile(tile);
        //dojo.place(`<div id="tile${tile.id}" class="tile tile${tile.type}" style="left: ${left}px; top: ${top}px;"></div>`, destinationId);
        const tileDiv = document.getElementById(`tile${tile.id}`);
        if (tileDiv) {
            if (zIndex) {
                tileDiv.style.zIndex = ''+zIndex;
            }
            return slideToObjectAndAttach(this, tileDiv, destinationId, left, top);
        } else {
            dojo.place(`<div id="tile${tile.id}" class="tile tile${tile.type}" style="${left !== undefined ? `left: ${left}px;` : ''}${top !== undefined ? `top: ${top}px;` : ''}${zIndex ? `z-index: ${zIndex}px;` : ''}"></div>`, destinationId);
            return Promise.resolve(true);
        }
        
    }*/
    Nicodemus.prototype.createPlayerPanels = function (gamedatas) {
        var _this = this;
        Object.values(gamedatas.players).forEach(function (player) {
            var playerId = Number(player.id);
            // first player token
            /*if (gamedatas.firstPlayerTokenPlayerId === playerId) {
                dojo.place(`<div id="player_board_${player.id}_firstPlayerWrapper" class="firstPlayerWrapper"></div>`, `player_board_${player.id}`);
            }*/
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
        });
        this.addTooltipHtmlToClass('charcoalium-counter', _("Charcoalium"));
        this.addTooltipHtmlToClass('wood-counter', _("Wood"));
        this.addTooltipHtmlToClass('copper-counter', _("Copper"));
        this.addTooltipHtmlToClass('crystal-counter', _("Crystal"));
    };
    /*private createPlayerTables(gamedatas: NicodemusGamedatas) {
        const players = Object.values(gamedatas.players).sort((a, b) => a.playerNo - b.playerNo);
        const playerIndex = players.findIndex(player => Number(player.id) === Number((this as any).player_id));
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;

        orderedPlayers.forEach(player =>
            this.createPlayerTable(gamedatas, Number(player.id))
        );
    }

    private createPlayerTable(gamedatas: NicodemusGamedatas, playerId: number) {
        this.playersTables.push(new PlayerTable(this, gamedatas.players[playerId]/_*, gamedatas.playersTables[playerId]*_/));
    }

    public removeTile(tile: Tile, fadeOut?: boolean) {
        if (document.getElementById(`tile${tile.id}`)) {
            fadeOut ?
                (this as any).fadeOutAndDestroy(`tile${tile.id}`) :
                dojo.destroy(`tile${tile.id}`);
        }
    }

    public removeTiles(tiles: Tile[], fadeOut?: boolean) {
        tiles.forEach(tile => this.removeTile(tile, fadeOut));
    }*/
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
    /*placeFirstPlayerToken(playerId: number) {
        const firstPlayerToken = document.getElementById('firstPlayerToken');
        if (firstPlayerToken) {
            slideToObjectAndAttach(this, firstPlayerToken, `player_board_${playerId}_firstPlayerWrapper`);
        } else {
            dojo.place('<div id="firstPlayerToken" class="tile tile0"></div>', `player_board_${playerId}_firstPlayerWrapper`);

            (this as any).addTooltipHtml('firstPlayerToken', _("First Player token. Player with this token will start the next turn"));
        }
    }

    
    private setHandHeight(playerId: number) {
        const playerHandDiv = document.getElementById(`player-hand-${playerId}`);
        playerHandDiv.style.height = `unset`;
        playerHandDiv.style.height = `${playerHandDiv.getBoundingClientRect().height}px`;
    }*/
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
        /*['factoriesFilled', ANIMATION_MS],
        ['tilesSelected', ANIMATION_MS],
        ['tilesPlacedOnLine', ANIMATION_MS],
        ['placeTileOnWall', SCORE_MS],
        ['emptyFloorLine', SCORE_MS],
        ['endScore', SCORE_MS],
        ['firstPlayerToken', 1],*/
        ];
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_" + notif[0]);
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
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
