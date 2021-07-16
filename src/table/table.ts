class Table {
    private stocks: Stock[] = [];

    constructor(
        private game: NicodemusGame, 
        machines: Machine[],
    ) {
        let html = `<div>`;
        for (let i=0; i<2; i++) {
            html += `<div id="row${i}" class="row"></div>`;
        }
        html += `</div>`;

        dojo.place(html, 'table');

        for (let i=0; i<2; i++) {
            this.stocks[i] = new ebg.stock() as Stock;
            this.stocks[i].setSelectionAppearance('class');
            this.stocks[i].selectionClass = 'no-visible-selection';
            this.stocks[i].create(this.game, $(`row${i}`), MACHINE_WIDTH, MACHINE_HEIGHT);
            this.stocks[i].setSelectionMode(1);
            //this.stocks[i].onItemCreate = dojo.hitch(this, 'setupNewLordCard'); 
            dojo.connect(this.stocks[i], 'onChangeSelection', this, () => this.onMachineSelectionChanged(this.stocks[i].getSelectedItems()));
        }
        setupMachineCards(this.stocks);

        machines.forEach(machine => this.stocks[0].addToStockWithId(getUniqueId(machine), ''+machine.id));
        console.log(machines, this.stocks[0]);
    }

    public onMachineSelectionChanged(items: any) {
        if (items.length == 1) {
            const card = items[0];
            this.game.repairMachine(card.id);
        }
    }
}