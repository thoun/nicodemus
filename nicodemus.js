function slideToObjectAndAttach(object, destinationId, posX, posY) {
    var destination = document.getElementById(destinationId);
    if (destination.contains(object)) {
        return Promise.resolve(true);
    }
    return new Promise(function (resolve) {
        var originalZIndex = Number(object.style.zIndex);
        object.style.zIndex = '10';
        var objectCR = object.getBoundingClientRect();
        var destinationCR = destination.getBoundingClientRect();
        var deltaX = destinationCR.left - objectCR.left + (posX !== null && posX !== void 0 ? posX : 0);
        var deltaY = destinationCR.top - objectCR.top + (posY !== null && posY !== void 0 ? posY : 0);
        //object.id == 'tile98' && console.log(object, destination, objectCR, destinationCR, destinationCR.left - objectCR.left, );
        object.style.transition = "transform 0.5s ease-in";
        object.style.transform = "translate(" + deltaX + "px, " + deltaY + "px)";
        var transitionend = function () {
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
function getMachineTooltip(type) {
    switch (type) {
        // blue
        case 11: return _("Earn 1 wood for each machine on the Bric-a-brac with wood in its production zone, including this one.");
        case 12: return _("Earn 1 charcoalium for each machine on the Bric-a-brac with charcoalium in its production zone, including this one.");
        case 13: return _("Earn 1 copper for each machine on the Bric-a-brac with copper in its production zone, including this one.");
        case 14: return _("Earn 1 crystal for each machine on the Bric-a-brac with crystal in its production zone, including this one.");
        case 15: return formatTextIcons(_("Choose a type of resource ([resource1]|[resource2]|[resource3]). Earn 1 resource of this type for each machine on the Bric-a-brac with the [resource9] symbol in its production zone, including this one."));
        // purple
        case 21: return _("Discard a machine from your hand and earn 2 resources of your choice from those needed to repair it.");
        case 22: return _("Discard 1 of the last 3 machines added to the Bric-a-brac before this one and earn 1 resource of your choice from those needed to repair it.");
        case 23: return _("Discard 1 of the last 2 machines added to the Bric-a-brac before this one and earn 1 resource of your choice from those needed to repair it and 1 charcoalium.");
        case 24: return _("You can exchange 1 charcoalium for 1 resource of your choice from the reserve and/or vice versa, up to three times total.");
        case 25: return _("Discard the last machine added to the Bric-a-brac before this one and earn 2 resources of your choice from those needed to repair it.");
        // red
        case 31: return _("Steal from your opponent 1 charcoalium and 1 machine taken randomly from their hand.");
        case 32: return _("Steal from your opponent 1 resource of your choice and 1 machine taken randomly from their hand.");
        case 33: return _("Your opponent must randomly discard all but 2 machines from their hand and return 2 charcoalium to the reserve.");
        case 34: return _("Your opponent must return 2 resources of your choice to the reserve.");
        // yellow
        case 41: return _("Draw 2 of the unused project tiles. Choose 1 to place face up in your workshop and return the other to the box. Only you can complete the project in your workshop.");
        case 42: return _("Copy the effect of 1 machine from the Bric-a-brac of your choice.");
    }
    return null;
}
function setupMachineCard(game, cardDiv, type) {
    game.addTooltipHtml(cardDiv.id, getMachineTooltip(type));
}
function getProjectTooltip(type) {
    switch (type) {
        // colors
        case 10:
        case 11:
        case 12:
        case 13: return _("You must have at least 2 machines of the indicated color in your workshop.");
        case 14: return _("You must have at least 1 machine of each color in your workshop.");
        // points
        case 20:
        case 21:
        case 22: return _("You must have at least 2 machines worth the indicated number of victory points in your workshop.");
        case 23: return _("You must have at least 2 identical machines in your workshop.");
        // resources
        case 31:
        case 32:
        case 33:
        case 34:
        case 35:
        case 36:
        case 37:
        case 38: return formatTextIcons(_("You must have machines in your workshop that have the indicated resources and/or charcoalium in their production zones. [resource9] resources do not count towards these objectives."));
    }
    return null;
}
function setupProjectCard(game, cardDiv, type) {
    game.addTooltipHtml(cardDiv.id, getProjectTooltip(type));
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var Table = /** @class */ (function () {
    function Table(game, players, projects, machines, resources) {
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
        players.forEach(function (player) { return _this.setPoints(Number(player.id), Number(player.score), true); });
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
            this.projectStocks[i].onItemCreate = function (cardDiv, type) { return setupProjectCard(game, cardDiv, type); };
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
            var left = (firstRow ? 204 : 0) + (i - (firstRow ? 1 : 6)) * 204;
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
            this_1.machineStocks[i].onItemCreate = function (cardDiv, type) { return setupMachineCard(game, cardDiv, type); };
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
        // resources
        for (var i = 0; i <= 3; i++) {
            var resourcesToPlace = resources[i];
            this.addResources(i, resourcesToPlace);
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
    Table.prototype.setPoints = function (playerId, points, firstPosition) {
        if (firstPosition === void 0) { firstPosition = false; }
        var markerDiv = document.getElementById("player-" + playerId + "-point-marker");
        var top = points % 2 ? 40 : 52;
        var left = 16 + points * 46.2;
        if (firstPosition) {
            markerDiv.style.top = top + "px";
            markerDiv.style.left = left + "px";
        }
        else {
            dojo.fx.slideTo({
                node: markerDiv,
                top: top,
                left: left,
                delay: 0,
                duration: ANIMATION_MS,
                easing: dojo.fx.easing.cubicInOut,
                unit: "px"
            }).play();
        }
    };
    Table.prototype.machinePlayed = function (playerId, machine) {
        var fromHandId = "my-machines_item_" + machine.id;
        var from = document.getElementById(fromHandId) ? fromHandId : "player-icon-" + playerId;
        this.machineStocks[machine.location_arg].addToStockWithId(getUniqueId(machine), '' + machine.id, from);
        dojo.addClass("table-machine-spot-" + machine.location_arg + "_item_" + machine.id, 'selected');
    };
    Table.prototype.getDistance = function (p1, p2) {
        return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
    };
    Table.prototype.getPlaceOnCard = function (placed) {
        var _this = this;
        var newPlace = {
            x: Math.random() * 228 + 16,
            y: Math.random() * 38 + 16,
        };
        var protection = 0;
        while (protection < 1000 && placed.some(function (place) { return _this.getDistance(newPlace, place) < 32; })) {
            newPlace.x = Math.random() * 228 + 16;
            newPlace.y = Math.random() * 38 + 16;
            protection++;
        }
        return newPlace;
    };
    Table.prototype.addResources = function (type, resources) {
        var _this = this;
        var divId = "table-resources" + type;
        var div = document.getElementById(divId);
        if (!div) {
            return;
        }
        var placed = div.dataset.placed ? JSON.parse(div.dataset.placed) : [];
        // add tokens
        resources.filter(function (resource) { return !placed.some(function (place) { return place.resourceId == resource.id; }); }).forEach(function (resource) {
            var newPlace = _this.getPlaceOnCard(placed);
            placed.push(__assign(__assign({}, newPlace), { resourceId: resource.id }));
            var resourceDivId = "resource" + type + "-" + resource.id;
            var resourceDiv = document.getElementById("resource" + type + "-" + resource.id);
            if (resourceDiv) {
                var originDiv = resourceDiv.parentElement;
                var originPlaced = originDiv.dataset.placed ? JSON.parse(originDiv.dataset.placed) : [];
                originDiv.dataset.placed = JSON.stringify(originPlaced.filter(function (place) { return place.resourceId != resource.id; }));
                slideToObjectAndAttach(resourceDiv, divId, newPlace.x, newPlace.y);
            }
            else {
                var html = "<div id=\"" + resourceDivId + "\"\n                    class=\"cube resource" + type + " aspect" + resource.id % (type == 0 ? 8 : 4) + "\" \n                    style=\"left: " + (newPlace.x - 16) + "px; top: " + (newPlace.y - 16) + "px;\"\n                ></div>";
                dojo.place(html, divId);
            }
        });
        div.dataset.placed = JSON.stringify(placed);
    };
    return Table;
}());
var PlayerTable = /** @class */ (function () {
    function PlayerTable(game, player, side) {
        var _this = this;
        this.game = game;
        this.playerId = Number(player.id);
        var color = player.color.startsWith('00') ? 'blue' : 'red';
        var html = "\n        <div id=\"player-table-" + this.playerId + "\" class=\"player-table whiteblock " + side + "\">\n            <div class=\"name-column " + color + " " + side + "\">\n                <div class=\"player-name\">" + player.name + "</div>\n                <div class=\"player-icon " + color + "\"></div>\n            </div>\n            <div class=\"player-resources " + side + "\">\n                <div id=\"player" + this.playerId + "-resources0\" class=\"top\"></div>\n                <div id=\"player" + this.playerId + "-resources1\"></div>\n                <div id=\"player" + this.playerId + "-resources2\"></div>\n                <div id=\"player" + this.playerId + "-resources3\"></div>\n            </div>\n            <div id=\"player-table-" + this.playerId + "-machines\" class=\"machines\"></div>\n        </div>";
        dojo.place(html, 'playerstables');
        this.machineStock = new ebg.stock();
        this.machineStock.setSelectionAppearance('class');
        this.machineStock.selectionClass = 'selected';
        this.machineStock.create(this.game, $("player-table-" + this.playerId + "-machines"), MACHINE_WIDTH, MACHINE_HEIGHT);
        this.machineStock.setSelectionMode(0);
        this.machineStock.centerItems = true;
        this.machineStock.onItemCreate = function (cardDiv, type) { return setupMachineCard(game, cardDiv, type); };
        //dojo.connect(this.machineStock, 'onChangeSelection', this, () => this.onMachineSelectionChanged(this.machineStocks[i].getSelectedItems()));
        setupMachineCards([this.machineStock]);
        player.machines.forEach(function (machine) { return _this.machineStock.addToStockWithId(getUniqueId(machine), '' + machine.id); });
        // resources
        for (var i = 0; i <= 3; i++) {
            var resourcesToPlace = player.resources[i];
            this.addResources(i, resourcesToPlace);
        }
    }
    PlayerTable.prototype.getDistance = function (p1, p2) {
        return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
    };
    PlayerTable.prototype.getPlaceOnCard = function (placed, type) {
        var _this = this;
        var xMaxShift = type ? 28 : 148;
        var yMaxShift = type ? 82 : 44;
        var newPlace = {
            x: Math.random() * xMaxShift + 16,
            y: Math.random() * yMaxShift + 16,
        };
        var protection = 0;
        while (protection < 1000 && placed.some(function (place) { return _this.getDistance(newPlace, place) < 32; })) {
            newPlace.x = Math.random() * xMaxShift + 16;
            newPlace.y = Math.random() * yMaxShift + 16;
            protection++;
        }
        return newPlace;
    };
    PlayerTable.prototype.addResources = function (type, resources) {
        var _this = this;
        var divId = "player" + this.playerId + "-resources" + type;
        var div = document.getElementById(divId);
        if (!div) {
            return;
        }
        var placed = div.dataset.placed ? JSON.parse(div.dataset.placed) : [];
        // add tokens
        resources.filter(function (resource) { return !placed.some(function (place) { return place.resourceId == resource.id; }); }).forEach(function (resource) {
            var newPlace = _this.getPlaceOnCard(placed, type);
            placed.push(__assign(__assign({}, newPlace), { resourceId: resource.id }));
            var resourceDivId = "resource" + type + "-" + resource.id;
            var resourceDiv = document.getElementById("resource" + type + "-" + resource.id);
            if (resourceDiv) {
                var originDiv = resourceDiv.parentElement;
                var originPlaced = originDiv.dataset.placed ? JSON.parse(originDiv.dataset.placed) : [];
                originDiv.dataset.placed = JSON.stringify(originPlaced.filter(function (place) { return place.resourceId != resource.id; }));
                slideToObjectAndAttach(resourceDiv, divId, newPlace.x, newPlace.y);
            }
            else {
                var html = "<div id=\"" + resourceDivId + "\"\n                    class=\"cube resource" + type + " aspect" + resource.id % (type == 0 ? 8 : 4) + "\" \n                    style=\"left: " + (newPlace.x - 16) + "px; top: " + (newPlace.y - 16) + "px;\"\n                ></div>";
                dojo.place(html, divId);
            }
        });
        div.dataset.placed = JSON.stringify(placed);
    };
    PlayerTable.prototype.addWorkshopProjects = function (projects) {
        // TODO
        //projects.forEach(project => this.playerProjectHand.addToStockWithId(getUniqueId(project), ''+project.id));
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
        log("Starting game setup");
        this.gamedatas = gamedatas;
        log('gamedatas', gamedatas);
        this.createPlayerPanels(gamedatas);
        this.setHand(gamedatas.handMachines);
        this.table = new Table(this, Object.values(gamedatas.players), gamedatas.tableProjects, gamedatas.tableMachines, gamedatas.resources);
        this.table.onProjectSelectionChanged = function (selectProjectsIds) {
            dojo.toggleClass('selectProjects-button', 'disabled', !selectProjectsIds.length);
            dojo.toggleClass('skipProjects-button', 'disabled', !!selectProjectsIds.length);
        };
        this.createPlayerTables(gamedatas);
        this.setupNotifications();
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
                this.onEnteringStateChooseAction(args.args);
                break;
            case 'choosePlayAction':
                this.onEnteringStateChoosePlayAction(args.args);
                break;
            case 'chooseProject':
                if (this.isCurrentPlayerActive()) {
                    this.table.setProjectSelectable(true);
                }
                break;
        }
    };
    Nicodemus.prototype.onEnteringStateChooseAction = function (args) {
        if (this.isCurrentPlayerActive()) {
            this.setHandSelectable(true);
            this.table.setMachineSelectable(true);
            args.disabledMachines.forEach(function (machine) { return dojo.addClass("table-machine-spot-" + machine.location_arg + "_item_" + machine.id, 'disabled'); });
        }
    };
    Nicodemus.prototype.onEnteringStateChoosePlayAction = function (args) {
        dojo.addClass("table-machine-spot-" + args.machine.location_arg + "_item_" + args.machine.id, 'selected');
    };
    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    Nicodemus.prototype.onLeavingState = function (stateName) {
        log('Leaving state: ' + stateName);
        switch (stateName) {
            case 'chooseAction':
                this.onLeavingChooseAction();
                break;
            case 'choosePlayAction':
                this.onLeavingChoosePlayAction();
                break;
            case 'chooseProject':
                this.table.setProjectSelectable(false);
                break;
        }
    };
    Nicodemus.prototype.onLeavingChooseAction = function () {
        this.setHandSelectable(false);
        this.table.setMachineSelectable(false);
        dojo.query('.stockitem').removeClass('disabled');
    };
    Nicodemus.prototype.onLeavingChoosePlayAction = function () {
        dojo.query('.stockitem').removeClass('selected');
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
                            this_2.addActionButton("getResource" + i + "-button", _('Get resource') + formatTextIcons(" ([resource" + i + "])"), function () { return _this.getResource(i); });
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
                    this.addTooltipHtml('applyEffect-button', getMachineTooltip(getUniqueId(choosePlayActionArgs_1.machine)));
                    break;
                case 'selectResource':
                    var selectResourceArgs = args;
                    selectResourceArgs.possibleCombinations.forEach(function (combination, index) {
                        return _this.addActionButton("selectResourceCombination" + index + "-button", formatTextIcons(combination.map(function (type) { return "[resource" + type + "]"; }).join('')), function () { return _this.selectResource(combination); });
                    });
                    break;
                case 'selectProject':
                    var selectProjectArgs = args;
                    selectProjectArgs.projects.forEach(function (project) {
                        return _this.addActionButton("selectProject" + project.id + "-button", 'TODO' + project.id, function () { return _this.selectProject(project.id); });
                    });
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
        this.playerMachineHand.onItemCreate = function (cardDiv, type) { return setupMachineCard(_this, cardDiv, type); };
        dojo.connect(this.playerMachineHand, 'onChangeSelection', this, function () { return _this.onPlayerMachineHandSelectionChanged(_this.playerMachineHand.getSelectedItems()); });
        setupMachineCards([this.playerMachineHand]);
        machines.forEach(function (machine) { return _this.playerMachineHand.addToStockWithId(getUniqueId(machine), '' + machine.id); });
        var player = Object.values(this.gamedatas.players).find(function (player) { return Number(player.id) === _this.getPlayerId(); });
        if (player) {
            var color = player.color.startsWith('00') ? 'blue' : 'red';
            dojo.addClass('my-hand-label', color);
        }
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
            charcoaliumCounter.setValue(player.resources[0].length);
            _this.charcoaliumCounters[playerId] = charcoaliumCounter;
            var woodCounter = new ebg.counter();
            woodCounter.create("wood-counter-" + playerId);
            woodCounter.setValue(player.resources[1].length);
            _this.woodCounters[playerId] = woodCounter;
            var copperCounter = new ebg.counter();
            copperCounter.create("copper-counter-" + playerId);
            copperCounter.setValue(player.resources[2].length);
            _this.copperCounters[playerId] = copperCounter;
            var crystalCounter = new ebg.counter();
            crystalCounter.create("crystal-counter-" + playerId);
            crystalCounter.setValue(player.resources[3].length);
            _this.crystalCounters[playerId] = crystalCounter;
            if (player.playerNo == 1) {
                dojo.place("<div id=\"player-icon-first-player\" class=\"player-icon first-player\"></div>", "player_board_" + player.id);
                _this.addTooltipHtml('player-icon-first-player', _("First player"));
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
    Nicodemus.prototype.selectResource = function (resourcesTypes) {
        if (!this.checkAction('selectResource')) {
            return;
        }
        this.takeAction('selectResource', {
            resourcesTypes: resourcesTypes.join(',')
        });
    };
    Nicodemus.prototype.selectProject = function (id) {
        if (!this.checkAction('selectProject')) {
            return;
        }
        this.takeAction('selectProject', {
            id: id
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
    Nicodemus.prototype.setResourceCount = function (playerId, resource, number) {
        var counters = [this.charcoaliumCounters, this.woodCounters, this.copperCounters, this.crystalCounters];
        counters[resource][playerId].toValue(number);
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
            ['machineRepaired', ANIMATION_MS],
            ['tableMove', ANIMATION_MS],
            ['handRefill', ANIMATION_MS],
            ['points', 1],
            ['addResources', ANIMATION_MS],
            ['removeResources', ANIMATION_MS],
            ['discardHandMachines', ANIMATION_MS],
            ['discardTableMachines', ANIMATION_MS],
            ['addWorkshopProjects', ANIMATION_MS],
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
    Nicodemus.prototype.notif_machineRepaired = function (notif) {
        moveToAnotherStock(this.table.machineStocks[notif.args.machineSpot], this.getPlayerTable(notif.args.playerId).machineStock, getUniqueId(notif.args.machine), '' + notif.args.machine.id);
    };
    Nicodemus.prototype.notif_tableMove = function (notif) {
        var _this = this;
        Object.keys(notif.args.moved).forEach(function (key) {
            var originalSpot = Number(key);
            var machine = notif.args.moved[key];
            moveToAnotherStock(_this.table.machineStocks[originalSpot], _this.table.machineStocks[machine.location_arg], getUniqueId(machine), '' + machine.id);
        });
    };
    Nicodemus.prototype.notif_handRefill = function (notif) {
        var _this = this;
        notif.args.machines.forEach(function (machine) { return _this.playerMachineHand.addToStockWithId(getUniqueId(machine), '' + machine.id); });
    };
    Nicodemus.prototype.notif_addWorkshopProjects = function (notif) {
        this.getPlayerTable(notif.args.playerId).addWorkshopProjects(notif.args.projects);
    };
    Nicodemus.prototype.notif_points = function (notif) {
        this.setPoints(notif.args.playerId, notif.args.points);
    };
    Nicodemus.prototype.notif_addResources = function (notif) {
        this.setResourceCount(notif.args.playerId, notif.args.resourceType, notif.args.count);
        this.setResourceCount(notif.args.opponentId, notif.args.resourceType, notif.args.opponentCount);
        this.getPlayerTable(notif.args.playerId).addResources(notif.args.resourceType, notif.args.resources);
    };
    Nicodemus.prototype.notif_removeResources = function (notif) {
        this.setResourceCount(notif.args.playerId, notif.args.resourceType, notif.args.count);
        this.table.addResources(notif.args.resourceType, notif.args.resources);
    };
    Nicodemus.prototype.notif_discardHandMachines = function (notif) {
        var _this = this;
        notif.args.machines.forEach(function (machine) { return _this.playerMachineHand.removeFromStockById('' + machine.id); });
    };
    Nicodemus.prototype.notif_discardTableMachines = function (notif) {
        var _this = this;
        notif.args.machines.forEach(function (machine) { return _this.table.machineStocks[machine.location_arg].removeFromStockById('' + machine.id); });
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
