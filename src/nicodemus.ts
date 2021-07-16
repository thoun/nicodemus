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

    private playerMachineHand: Stock;
    private table: Table;
    private playersTables: PlayerTable[] = [];

    public zoom: number = 1;

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
        // ignore loading of some pictures
        /*(this as any).dontPreloadImage('eye-shadow.png');
        (this as any).dontPreloadImage('publisher.png');
        [1,2,3,4,5,6,7,8,9,10].filter(i => !Object.values(gamedatas.players).some(player => Number((player as any).mat) === i)).forEach(i => (this as any).dontPreloadImage(`playmat_${i}.jpg`));
*/
        log( "Starting game setup" );
        
        this.gamedatas = gamedatas;

        log('gamedatas', gamedatas);

        this.createPlayerPanels(gamedatas);
        this.setHand(gamedatas.handMachines);
        this.table = new Table(this, Object.values(gamedatas.players), gamedatas.tableProjects, gamedatas.tableMachines);
        this.table.onProjectSelectionChanged = selectProjectsIds => {
            dojo.toggleClass('selectProjects-button', 'disabled', !selectProjectsIds.length);
            dojo.toggleClass('skipProjects-button', 'disabled', !!selectProjectsIds.length);
        };
        this.createPlayerTables(gamedatas);

        this.setupNotifications();

        /*document.getElementById('zoom-out').addEventListener('click', () => this.zoomOut());
        document.getElementById('zoom-in').addEventListener('click', () => this.zoomIn());

        (this as any).onScreenWidthChange = () => this.setAutoZoom();

        */

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
                if((this as any).isCurrentPlayerActive()) {
                    this.setHandSelectable(true);
                    this.table.setMachineSelectable(true);
                }
                break;
            case 'chooseProject':
                if((this as any).isCurrentPlayerActive()) {
                    this.table.setProjectSelectable(true);
                }
                break;
        }
    }

    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

        switch (stateName) {
            case 'chooseAction':
                this.setHandSelectable(false);
                this.table.setMachineSelectable(false);
                break;
            case 'chooseProject':
                this.table.setProjectSelectable(false);
                break;
        }
    }

    onLeavingChooseTile() {
        dojo.removeClass('factories', 'selectable');
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {
        if((this as any).isCurrentPlayerActive()) {
            switch (stateName) {                
                case 'choosePlayAction': 
                    const choosePlayActionArgs = args as ChoosePlayActionArgs;
                    (this as any).addActionButton('getCharcoalium-button', _('Get charcoalium') + formatTextIcons(` (${choosePlayActionArgs.charcoalium} [resource0])`), () => this.getCharcoalium());
                    if (choosePlayActionArgs.resource == 9) {
                        for (let i=1; i<=3; i++) {
                            (this as any).addActionButton('getResource-button', _('Get resource') + formatTextIcons(` ([resource${i}])`), () => this.getResource(i));
                        }
                    } else {
                        (this as any).addActionButton('getResource-button', _('Get resource') + formatTextIcons(` ([resource${choosePlayActionArgs.resource}])`), () => this.getResource(choosePlayActionArgs.resource));
                        if (choosePlayActionArgs.resource == 0) {
                            dojo.removeClass('getResource-button', 'bgabutton_blue');
                            dojo.addClass('getResource-button', 'bgabutton_gray');
                        }
                    }
                    (this as any).addActionButton('applyEffect-button', _('Apply effect'), () => this.applyEffect());
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
        //this.playerMachineHand.onItemCreate = (card_div: HTMLDivElement, card_type_id: number) => this.mowCards.setupNewCard(this, card_div, card_type_id); 
        dojo.connect(this.playerMachineHand, 'onChangeSelection', this, () => this.onPlayerMachineHandSelectionChanged(this.playerMachineHand.getSelectedItems()));

        setupMachineCards([this.playerMachineHand]);

        machines.forEach(machine => this.playerMachineHand.addToStockWithId(getUniqueId(machine), ''+machine.id));
    }

    public setHandSelectable(selectable: boolean) {
        this.playerMachineHand.setSelectionMode(selectable ? 1 : 0);
    }

    public onPlayerMachineHandSelectionChanged(items: any) {
        if (items.length == 1) {
            const card = items[0];
            this.playMachine(card.id);
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
            charcoaliumCounter.setValue(player.charcoalium);
            this.charcoaliumCounters[playerId] = charcoaliumCounter;

            const woodCounter = new ebg.counter();
            woodCounter.create(`wood-counter-${playerId}`);
            woodCounter.setValue(player.wood);
            this.woodCounters[playerId] = woodCounter;

            const copperCounter = new ebg.counter();
            copperCounter.create(`copper-counter-${playerId}`);
            copperCounter.setValue(player.copper);
            this.copperCounters[playerId] = copperCounter;

            const crystalCounter = new ebg.counter();
            crystalCounter.create(`crystal-counter-${playerId}`);
            crystalCounter.setValue(player.crystal);
            this.crystalCounters[playerId] = crystalCounter;

            if (player.playerNo == 1) {
                dojo.place(`<div id="player-icon-${player.id}" class="player-icon first-player"></div>`, `player_board_${player.id}`);
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

    public playMachine(id: number) {
        if(!(this as any).checkAction('playMachine')) {
            return;
        }

        this.takeAction('playMachine', {
            id
        });
    }

    public repairMachine(id: number) {
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

    public selectProjects(ids: number[]) {
        if(!(this as any).checkAction('selectProjects')) {
            return;
        }

        this.takeAction('selectProjects', { 
            ids: ids.join(',')
        });
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
    
    private setCharcoalium(playerId: number, number: number) {
        if (playerId == 0) {

        } else {
            this.charcoaliumCounters[playerId].toValue(number);
            this.getPlayerTable(playerId).setCharcoalium(number);
        }
    }
    
    private setResource(playerId: number, resource: number, number: number) {
        if (playerId == 0) {

        } else {
            const counters = [null, this.woodCounters, this.copperCounters, this.crystalCounters];
            counters[resource][playerId].toValue(number);
            this.getPlayerTable(playerId).setResource(resource, number);
        }
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
            ['points', 1],
            ['charcoaliums', 1],
            ['resources', 1],
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

    notif_points(notif: Notif<NotifPointsArgs>) {
        this.setPoints(notif.args.playerId, notif.args.points);
    }

    notif_charcoaliums(notif: Notif<NotifCharcoaliumsArgs>) {
        Object.keys(notif.args.charcoaliums).forEach(key => this.setCharcoalium(Number(key), notif.args.charcoaliums[key].length));
    }

    notif_resources(notif: Notif<NotifResourcesArgs>) {
        Object.keys(notif.args.resources).forEach(key => this.setResource(Number(key), notif.args.resourceType, notif.args.resources[key].length));
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