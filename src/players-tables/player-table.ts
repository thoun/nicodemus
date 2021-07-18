class PlayerTable {
    public playerId: number;
    public machineStock: Stock;

    constructor(
        private game: NicodemusGame, 
        player: NicodemusPlayer,
        side: 'left' | 'right') {

        this.playerId = Number(player.id);

        const color = player.color.startsWith('00') ? 'blue' : 'red';

        let html = `
        <div id="player-table-${this.playerId}" class="player-table whiteblock ${side}">
            <div class="name-column ${color} ${side}">
                <div class="player-name">${player.name}</div>
                <div class="player-icon ${color}"></div>
            </div>
            <div class="gradient ${color} ${side}"></div>
            <div id="player-table-${this.playerId}-machines" class="machines"></div>
        </div>`;

        dojo.place(html, 'playerstables');

        this.machineStock = new ebg.stock() as Stock;
        this.machineStock.setSelectionAppearance('class');
        this.machineStock.selectionClass = 'selected';
        this.machineStock.create(this.game, $(`player-table-${this.playerId}-machines`), MACHINE_WIDTH, MACHINE_HEIGHT);
        this.machineStock.setSelectionMode(0);
        this.machineStock.centerItems = true;
        this.machineStock.onItemCreate = (cardDiv: HTMLDivElement, type: number) => setupMachineCard(game, cardDiv, type);
        //dojo.connect(this.machineStock, 'onChangeSelection', this, () => this.onMachineSelectionChanged(this.machineStocks[i].getSelectedItems()));
        setupMachineCards([this.machineStock]);

        player.machines.forEach(machine => this.machineStock.addToStockWithId(getUniqueId(machine), ''+machine.id));
    }

    public setResource(type: number, number: number) {
        // TODO
    }
}