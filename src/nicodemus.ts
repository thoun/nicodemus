declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

declare const board: HTMLDivElement;

const ANIMATION_MS = 500;
/*const SCORE_MS = 1500;

const ZOOM_LEVELS = [0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
const ZOOM_LEVELS_MARGIN = [-300, -166, -100, -60, -33, -14, 0];
const LOCAL_STORAGE_ZOOM_KEY = 'Nicodemus-zoom';*/

const isDebug = window.location.host == 'studio.boardgamearena.com';
const log = isDebug ? console.log.bind(window.console) : function () { };

class Nicodemus implements NicodemusGame {
    private gamedatas: NicodemusGamedatas;
    private charcoaliumCounters: Counter[] = [];
    private woodCounters: Counter[] = [];
    private copperCounters: Counter[] = [];
    private crystalCounters: Counter[] = [];
    private helpDialog: any;

    private playerMachineHand: Stock;
    private table: Table;
    private playersTables: PlayerTable[] = [];

    public zoom: number = 1;

    public clickAction: 'play' | 'select' = 'play';

    constructor() {    
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

    public setup(gamedatas: NicodemusGamedatas) {
        log( "Starting game setup" );
        
        this.gamedatas = gamedatas;

        log('gamedatas', gamedatas);

        this.createPlayerPanels(gamedatas);
        this.setHand(gamedatas.handMachines);
        this.table = new Table(this, Object.values(gamedatas.players), gamedatas.tableProjects, gamedatas.tableMachines, gamedatas.resources);
        this.table.onProjectSelectionChanged = selectProjectsIds => {
            dojo.toggleClass('selectProjects-button', 'disabled', !selectProjectsIds.length);
            dojo.toggleClass('skipProjects-button', 'disabled', !!selectProjectsIds.length);
        };
        this.createPlayerTables(gamedatas);

        this.addHelp();

        this.setupNotifications();

        log( "Ending game setup" );
    }

    ///////////////////////////////////////////////////
    //// Game & client states

    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    public onEnteringState(stateName: string, args: any) {
        log( 'Entering state: '+stateName , args.args );

        switch (stateName) {
            case 'chooseAction':
                this.clickAction = 'play';
                this.onEnteringStateChooseAction(args.args as ChooseActionArgs);
                break;
            case 'choosePlayAction':
                this.onEnteringStateChoosePlayAction(args.args as ChoosePlayActionArgs);
                break;
            case 'selectMachine':
                this.clickAction = 'select';
                this.onEnteringStateSelectMachine(args.args as SelectMachineArgs);
            case 'chooseProject':
                if((this as any).isCurrentPlayerActive()) {
                    this.table.setProjectSelectable(true);
                }
                break;
        }
    }

    private onEnteringStateChooseAction(args: ChooseActionArgs) {
        if((this as any).isCurrentPlayerActive()) {
            this.setHandSelectable(true);
            this.table.setMachineSelectable(true);

            args.disabledMachines.forEach(machine => dojo.addClass(`table-machine-spot-${machine.location_arg}_item_${machine.id}`, 'disabled'));
        }
    }

    private onEnteringStateChoosePlayAction(args: ChoosePlayActionArgs) {
        dojo.addClass(`table-machine-spot-${args.machine.location_arg}_item_${args.machine.id}`, 'selected');
    }
    
    private onEnteringStateSelectMachine(args: SelectMachineArgs) {
        const stocks = this.getMachineStocks();
        stocks.forEach(stock => stock.items
            .filter(item => !args.selectableMachines.some(machine => machine.id === Number(item.id)))
            .forEach(item => dojo.addClass(`${stock.container_div.id}_item_${item.id}`, 'disabled'))
        );
        stocks.forEach(stock => stock.setSelectionMode(1));
    }

    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

        switch (stateName) {
            case 'chooseAction':
                this.onLeavingChooseAction();
                break;
            case 'choosePlayAction':
                this.onLeavingChoosePlayAction();
                break;
            case 'selectMachine':
                this.clickAction = 'select';
                this.onLeavingStateSelectMachine();
            case 'chooseProject':
                this.table.setProjectSelectable(false);
                break;
        }
    }

    onLeavingChooseAction() {
        this.setHandSelectable(false);
        this.table.setMachineSelectable(false);
        dojo.query('.stockitem').removeClass('disabled');
    }

    onLeavingChoosePlayAction() {
        dojo.query('.stockitem').removeClass('selected');
    }
    
    private onLeavingStateSelectMachine() {
        const stocks = this.getMachineStocks();
        stocks.forEach(stock => stock.items
            .forEach(item => dojo.removeClass(`${stock.container_div.id}_item_${item.id}`, 'disabled'))
        );
        stocks.forEach(stock => stock.setSelectionMode(0));
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {
        if((this as any).isCurrentPlayerActive()) {
            switch (stateName) {                
                case 'choosePlayAction': 
                    const choosePlayActionArgs = args as ChoosePlayActionArgs;
                    (this as any).addActionButton('getCharcoalium-button', _('Get charcoalium') + formatTextIcons(` (${choosePlayActionArgs.machine.points} [resource0])`), () => this.getCharcoalium());
                    if (choosePlayActionArgs.machine.produce == 9) {
                        for (let i=1; i<=3; i++) {
                            (this as any).addActionButton(`getResource${i}-button`, _('Get resource') + formatTextIcons(` ([resource${i}])`), () => this.getResource(i));
                        }
                    } else {
                        (this as any).addActionButton('getResource-button', _('Get resource') + formatTextIcons(` ([resource${choosePlayActionArgs.machine.produce}])`), () => this.getResource(choosePlayActionArgs.machine.produce));
                        if (choosePlayActionArgs.machine.produce == 0) {
                            dojo.removeClass('getResource-button', 'bgabutton_blue');
                            dojo.addClass('getResource-button', 'bgabutton_gray');
                        }
                    }
                    (this as any).addActionButton('applyEffect-button', _('Apply effect') + ` <div class="effect effect${MACHINES_IDS.indexOf(getUniqueId(choosePlayActionArgs.machine))}"></div>`, () => this.applyEffect());
                    if (!choosePlayActionArgs.canApplyEffect) {
                        dojo.addClass('applyEffect-button', 'disabled');
                    }
                    (this as any).addTooltipHtml('applyEffect-button', getMachineTooltip(getUniqueId(choosePlayActionArgs.machine)));
                    break;

                case 'selectResource':
                    const selectResourceArgs = args as SelectResourceArgs;
                    selectResourceArgs.possibleCombinations.forEach((combination, index) => 
                        (this as any).addActionButton(`selectResourceCombination${index}-button`, formatTextIcons(combination.map(type => `[resource${type}]`).join('')), () => this.selectResource(combination))
                    );
                    break;

                case 'selectProject':
                    const selectProjectArgs = args as SelectProjectArgs;
                    selectProjectArgs.projects.forEach(project => 
                        (this as any).addActionButton(`selectProject${project.id}-button`, `<div class="project project${PROJECTS_IDS.indexOf(getUniqueId(project))}"></div>`, () => this.selectProject(project.id))
                    );
                    break;

                case 'selectExchange':
                    const selectExchangeArgs = args as SelectExchangeArgs;
                    selectExchangeArgs.possibleExchanges.forEach((possibleExchange, index) => 
                        (this as any).addActionButton(`selectExchange${index}-button`, formatTextIcons(`[resource${possibleExchange.from}] &#x21E8; [resource${possibleExchange.to}]`), () => this.selectExchange(possibleExchange))
                    );
                    (this as any).addActionButton('skipExchange-button', _('Skip'), () => this.skipExchange(), null, null, 'red');
                    break;

                case 'chooseProject':
                    (this as any).addActionButton('selectProjects-button', _('Complete projects'), () => this.selectProjects(this.table.getSelectedProjectsIds()));
                    (this as any).addActionButton('skipProjects-button', _('Skip'), () => this.selectProjects([]), null, null, 'red');
                    dojo.toggleClass('selectProjects-button', 'disabled', !this.table.getSelectedProjectsIds().length);
                    dojo.toggleClass('skipProjects-button', 'disabled', !!this.table.getSelectedProjectsIds().length);
                    break;
            }
        }
    }    

    ///////////////////////////////////////////////////
    //// Utility methods


    ///////////////////////////////////////////////////

    public setHand(machines: Machine[]) {
        this.playerMachineHand = new ebg.stock() as Stock;
        this.playerMachineHand.create(this, $('my-machines'), MACHINE_WIDTH, MACHINE_HEIGHT);
        this.playerMachineHand.setSelectionMode(1);            
        this.playerMachineHand.setSelectionAppearance('class');
        this.playerMachineHand.selectionClass = 'selected';
        this.playerMachineHand.centerItems = true;
        this.playerMachineHand.onItemCreate = (cardDiv: HTMLDivElement, type: number) => setupMachineCard(this, cardDiv, type);
        dojo.connect(this.playerMachineHand, 'onChangeSelection', this, () => this.onPlayerMachineHandSelectionChanged(this.playerMachineHand.getSelectedItems()));

        setupMachineCards([this.playerMachineHand]);

        machines.forEach(machine => this.playerMachineHand.addToStockWithId(getUniqueId(machine), ''+machine.id));

        const player = Object.values(this.gamedatas.players).find(player => Number(player.id) === this.getPlayerId());
        if (player) {
            const color = player.color.startsWith('00') ? 'blue' : 'red';
            dojo.addClass('my-hand-label', color);
        }
    }
    
    private getMachineStocks() {
        return [this.playerMachineHand, ...this.table.machineStocks.slice(1), ...this.playersTables.map(pt => pt.machineStock)];
    }

    public setHandSelectable(selectable: boolean) {
        this.playerMachineHand.setSelectionMode(selectable ? 1 : 0);
    }

    public onPlayerMachineHandSelectionChanged(items: any) {
        if (items.length == 1) {
            const card = items[0];
            this.machineClick(card.id, 'hand');
        }
    }

    public getPlayerId(): number {
        return Number((this as any).player_id);
    }

    private getPlayerTable(playerId: number): PlayerTable {
        return this.playersTables.find(playerTable => playerTable.playerId === playerId);
    }

    private createPlayerPanels(gamedatas: NicodemusGamedatas) {

        Object.values(gamedatas.players).forEach(player => {
            const playerId = Number(player.id);     

            // charcoalium & resources counters
            dojo.place(`<div class="counters">
                <div id="charcoalium-counter-wrapper-${player.id}" class="charcoalium-counter">
                    <div class="icon charcoalium"></div> 
                    <span id="charcoalium-counter-${player.id}"></span>
                </div>
            </div>
            <div class="counters">
                <div id="wood-counter-wrapper-${player.id}" class="wood-counter">
                    <div class="icon wood"></div> 
                    <span id="wood-counter-${player.id}"></span>
                </div>
                <div id="copper-counter-wrapper-${player.id}" class="copper-counter">
                    <div class="icon copper"></div> 
                    <span id="copper-counter-${player.id}"></span>
                </div>
                <div id="crystal-counter-wrapper-${player.id}" class="crystal-counter">
                    <div class="icon crystal"></div> 
                    <span id="crystal-counter-${player.id}"></span>
                </div>
            </div>`, `player_board_${player.id}`);

            const charcoaliumCounter = new ebg.counter();
            charcoaliumCounter.create(`charcoalium-counter-${playerId}`);
            charcoaliumCounter.setValue(player.resources[0].length);
            this.charcoaliumCounters[playerId] = charcoaliumCounter;

            const woodCounter = new ebg.counter();
            woodCounter.create(`wood-counter-${playerId}`);
            woodCounter.setValue(player.resources[1].length);
            this.woodCounters[playerId] = woodCounter;

            const copperCounter = new ebg.counter();
            copperCounter.create(`copper-counter-${playerId}`);
            copperCounter.setValue(player.resources[2].length);
            this.copperCounters[playerId] = copperCounter;

            const crystalCounter = new ebg.counter();
            crystalCounter.create(`crystal-counter-${playerId}`);
            crystalCounter.setValue(player.resources[3].length);
            this.crystalCounters[playerId] = crystalCounter;

            if (player.playerNo == 1) {
                dojo.place(`<div id="player-icon-first-player" class="player-icon first-player"></div>`, `player_board_${player.id}`);
                (this as any).addTooltipHtml('player-icon-first-player', _("First player"));
            }
        });

        (this as any).addTooltipHtmlToClass('charcoalium-counter', _("Charcoalium"));
        (this as any).addTooltipHtmlToClass('wood-counter', _("Wood"));
        (this as any).addTooltipHtmlToClass('copper-counter', _("Copper"));
        (this as any).addTooltipHtmlToClass('crystal-counter', _("Crystal"));
    }

    private createPlayerTables(gamedatas: NicodemusGamedatas) {
        const players = Object.values(gamedatas.players).sort((a, b) => a.playerNo - b.playerNo);
        const playerIndex = players.findIndex(player => Number(player.id) === Number((this as any).player_id));
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;

        orderedPlayers.forEach((player, index) => 
            this.createPlayerTable(gamedatas, Number(player.id), index ? 'right' : 'left')
        );
    }

    private createPlayerTable(gamedatas: NicodemusGamedatas, playerId: number, side: 'left' | 'right') {
        this.playersTables.push(new PlayerTable(this, gamedatas.players[playerId], side));
    }

    public machineClick(id: number, from: 'hand' | 'table') {
        if (this.clickAction === 'select') {
            this.selectMachine(id);
        } else if (this.clickAction === 'play') {
            if (from === 'hand') {
                this.playMachine(id);
            } else if (from === 'table') {
                this.repairMachine(id);
            }
        }
    }

    private playMachine(id: number) {
        if(!(this as any).checkAction('playMachine')) {
            return;
        }

        this.takeAction('playMachine', {
            id
        });
    }

    private repairMachine(id: number) {
        if(!(this as any).checkAction('repairMachine')) {
            return;
        }

        this.takeAction('repairMachine', {
            id
        });
    }

    public getCharcoalium() {
        if(!(this as any).checkAction('getCharcoalium')) {
            return;
        }

        this.takeAction('getCharcoalium');
    }

    public getResource(resource: number) {
        if(!(this as any).checkAction('getResource')) {
            return;
        }

        this.takeAction('getResource', {
            resource
        });
    }

    public applyEffect() {
        if(!(this as any).checkAction('applyEffect')) {
            return;
        }

        this.takeAction('applyEffect');
    }

    private selectProjects(ids: number[]) {
        if(!(this as any).checkAction('selectProjects')) {
            return;
        }

        this.takeAction('selectProjects', { 
            ids: ids.join(',')
        });
    }

    public selectResource(resourcesTypes: number[]) {
        if(!(this as any).checkAction('selectResource')) {
            return;
        }

        this.takeAction('selectResource', { 
            resourcesTypes: resourcesTypes.join(',')
        });
    }

    public selectMachine(id: number) {
        if(!(this as any).checkAction('selectMachine')) {
            return;
        }

        this.takeAction('selectMachine', {
            id
        });
    }

    public selectProject(id: number) {
        if(!(this as any).checkAction('selectProject')) {
            return;
        }

        this.takeAction('selectProject', {
            id
        });
    }

    public selectExchange(exchange: Exchange) {
        if(!(this as any).checkAction('selectExchange')) {
            return;
        }

        this.takeAction('selectExchange', exchange);
    }

    public skipExchange() {
        if(!(this as any).checkAction('skipExchange')) {
            return;
        }

        this.takeAction('skipExchange');
    }

    public takeAction(action: string, data?: any) {
        data = data || {};
        data.lock = true;
        (this as any).ajaxcall(`/nicodemus/nicodemus/${action}.html`, data, this, () => {});
    }
    
    private setPoints(playerId: number, points: number) {
        (this as any).scoreCtrl[playerId]?.toValue(points);
        this.table.setPoints(playerId, points);
    }
    
    private setResourceCount(playerId: number, resource: number, number: number) {
        const counters = [this.charcoaliumCounters, this.woodCounters, this.copperCounters, this.crystalCounters];
        counters[resource][playerId].toValue(number);
    }

    private addHelp() {
        dojo.place(`<button id="nicodemus-help-button">?</button>`, 'left-side');
        dojo.connect( $('nicodemus-help-button'), 'onclick', this, () => this.showHelp());
    }

    private showHelp() {
        if (!this.helpDialog) {
            this.helpDialog = new ebg.popindialog();
            this.helpDialog.create( 'nicodemusHelpDialog' );
            this.helpDialog.setTitle( _("Cards help") );
            
            var html = `<div id="help-popin">
                <h1>${_("Machines effects")}</h1>
                <div id="help-machines" class="help-section">
                    <table>`;
                MACHINES_IDS.forEach((number, index) => html += `<tr><td><div id="machine${index}" class="machine"></div></td><td>${getMachineTooltip(number)}</td></tr>`);
                html += `</table>
                </div>
                <h1>${_("Projects")}</h1>
                <div id="help-projects" class="help-section">
                    <table><tr><td class="grid">`;
                PROJECTS_IDS.slice(1, 5).forEach((number, index) => html += `<div id="project${index + 1}" class="project"></div>`);
                html += `</td><td>${getProjectTooltip(11)}</td></tr>
                <tr><td><div id="project0" class="project"></div></td><td>${getProjectTooltip(10)}</td></tr><tr><td class="grid">`;
                PROJECTS_IDS.slice(6, 9).forEach((number, index) => html += `<div id="project${index + 6}" class="project"></div>`);
                html += `</td><td>${getProjectTooltip(21)}</td></tr>
                <tr><td><div id="project5" class="project"></div></td><td>${getProjectTooltip(20)}</td></tr><tr><td class="grid">`;
                PROJECTS_IDS.slice(9).forEach((number, index) => html += `<div id="project${index + 9}" class="project"></div>`);
                html += `</td><td>${getProjectTooltip(31)}</td></tr></table>
                </div>
            </div>`;
            
            // Show the dialog
            this.helpDialog.setContent(html);
        }

        this.helpDialog.show();
    }

    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications

    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your nicodemus.game.php file.

    */
    setupNotifications() {
        //log( 'notifications subscriptions setup' );

        const notifs = [
            ['machinePlayed', ANIMATION_MS],
            ['machineRepaired', ANIMATION_MS],
            ['tableMove', ANIMATION_MS],
            ['handRefill', ANIMATION_MS],
            ['points', 1],
            ['addResources', ANIMATION_MS],
            ['removeResources', ANIMATION_MS],
            ['discardHandMachines', ANIMATION_MS],
            ['discardPlayerMachines', ANIMATION_MS],
            ['discardTableMachines', ANIMATION_MS],
            ['removeProjects', ANIMATION_MS],
            ['addWorkshopProjects', ANIMATION_MS],
        ];

        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, `notif_${notif[0]}`);
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }

    notif_machinePlayed(notif: Notif<NotifMachinePlayedArgs>) {        
        this.playerMachineHand.removeFromStockById(''+notif.args.machine.id);
        this.table.machinePlayed(notif.args.playerId, notif.args.machine);
    }

    notif_machineRepaired(notif: Notif<NotifMachineRepairedArgs>) {
        moveToAnotherStock(
            this.table.machineStocks[notif.args.machineSpot], 
            this.getPlayerTable(notif.args.playerId).machineStock, 
            getUniqueId(notif.args.machine), 
            ''+notif.args.machine.id
        );
    }

    notif_tableMove(notif: Notif<NotifTableMoveArgs>) {
        Object.keys(notif.args.moved).forEach(key => {
            const originalSpot = Number(key);
            const machine = notif.args.moved[key];

            moveToAnotherStock(
                this.table.machineStocks[originalSpot], 
                this.table.machineStocks[machine.location_arg], 
                getUniqueId(machine), 
                ''+machine.id
            );
        });
    }

    notif_handRefill(notif: Notif<NotifHandRefillArgs>) {
        let from = undefined;
        if (notif.args.from === 0) {
            from = 'machine-deck';
        } else if (notif.args.from > 0) {
            from = `player-icon-${from}`;
        }
        notif.args.machines.forEach(machine => this.playerMachineHand.addToStockWithId(getUniqueId(machine), ''+machine.id, from));
    }

    notif_addWorkshopProjects(notif: Notif<NotifAddWorkshopProjectsArgs>) {
        this.getPlayerTable(notif.args.playerId).addWorkshopProjects(notif.args.projects);
    }

    notif_points(notif: Notif<NotifPointsArgs>) {
        this.setPoints(notif.args.playerId, notif.args.points);
    }

    notif_addResources(notif: Notif<NotifResourcesArgs>) {
        this.setResourceCount(notif.args.playerId, notif.args.resourceType, notif.args.count);
        this.setResourceCount(notif.args.opponentId, notif.args.resourceType, notif.args.opponentCount);

        this.getPlayerTable(notif.args.playerId).addResources(notif.args.resourceType, notif.args.resources);
    }

    notif_removeResources(notif: Notif<NotifResourcesArgs>) {
        this.setResourceCount(notif.args.playerId, notif.args.resourceType, notif.args.count);

        this.table.addResources(notif.args.resourceType, notif.args.resources);
    }

    notif_discardHandMachines(notif: Notif<NotifDiscardMachinesArgs>) {
        notif.args.machines.forEach(machine => this.playerMachineHand.removeFromStockById(''+machine.id));
    }

    notif_discardPlayerMachines(notif: Notif<NotifDiscardMachinesArgs>) {
        notif.args.machines.forEach(machine => this.getPlayerTable(machine.location_arg).machineStock.removeFromStockById(''+machine.id));
    }

    notif_discardTableMachines(notif: Notif<NotifDiscardMachinesArgs>) {
        notif.args.machines.forEach(machine => this.table.machineStocks[machine.location_arg].removeFromStockById(''+machine.id));
    }

    notif_removeProjects(notif: Notif<any>) {
        console.log('TODO');
    }
    
    private getMachineColor(color: number) {
        switch (color) {
            case 1: return '#006fa1';
            case 2: return '#702c91';
            case 3: return '#a72c32';
            case 4: return '#c48b10';
        }
        return null;
    }

    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    public format_string_recursive(log: string, args: any) {
        try {
            if (log && args && !args.processed) {
                // Representation of the color of a card
                if (typeof args.machine_name == 'string' && args.machine_name[0] != '<') {
                    args.machine_name = `<strong style="color: ${this.getMachineColor(args.machine.type)}">${args.machine_name}</strong>`;
                }
            }
        } catch (e) {
            console.error(log,args,"Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }
}