class Table {
    private projectStocks: Stock[] = [];
    private machineStocks: Stock[] = [];

    public onProjectSelectionChanged: (selectedProjectsIds: number[]) => any;

    constructor(
        private game: NicodemusGame, 
        players: NicodemusPlayer[],
        projects: Project[],
        machines: Machine[],
    ) {
        let html = '';

        // points
        players.forEach(player =>
            html += `<div id="player-${player.id}-point-marker" class="point-marker ${player.color.startsWith('00') ? 'blue' : 'red'}"></div>`
        );
        dojo.place(html, 'table');
        players.forEach(player => this.setPoints(Number(player.id), Number(player.score)));

        // projects

        html = '';
        for (let i=1; i<=6; i++) {
            html += `<div id="table-project-${i}" class="table-project-stock" style="left: ${181 * (i-1)}px"></div>`;
        }

        dojo.place(html, 'table-projects');

        for (let i=1; i<=6; i++) {
            this.projectStocks[i] = new ebg.stock() as Stock;
            this.projectStocks[i].setSelectionAppearance('class');
            this.projectStocks[i].selectionClass = 'selected';
            this.projectStocks[i].create(this.game, $(`table-project-${i}`), PROJECT_WIDTH, PROJECT_HEIGHT);
            this.projectStocks[i].setSelectionMode(0);
            //this.projectStocks[i].onItemCreate = dojo.hitch(this, 'setupNewLordCard'); 
            dojo.connect(this.projectStocks[i], 'onChangeSelection', this, () => this._onProjectSelectionChanged());
        }

        setupProjectCards(this.projectStocks);

        for (let i=1; i<=6; i++) {
            projects.filter(project => project.location_arg == i).forEach(project => this.projectStocks[i].addToStockWithId(getUniqueId(project), ''+project.id));
        }

        // machines

        html = `<div class="machines">`;
        for (let i=1; i<=10; i++) {
            const firstRow = i<=5;
            const left = (firstRow ? 204 : 0) + (i-1) * 204;
            const top = firstRow ? 0 : 210;
            html += `<div id="table-machine-spot-${i}" class="machine-spot" style="left: ${left}px; top: ${top}px"></div>`;
        }
        html += `<div id="machine-deck" class="stockitem"></div></div>`;

        dojo.place(html, 'table');

        for (let i=1; i<=10; i++) {
            this.machineStocks[i] = new ebg.stock() as Stock;
            this.machineStocks[i].setSelectionAppearance('class');
            this.machineStocks[i].selectionClass = 'selected';
            this.machineStocks[i].create(this.game, $(`table-machine-spot-${i}`), MACHINE_WIDTH, MACHINE_HEIGHT);
            this.machineStocks[i].setSelectionMode(0);
            //this.stocks[i].onItemCreate = dojo.hitch(this, 'setupNewLordCard'); 
            dojo.connect(this.machineStocks[i], 'onChangeSelection', this, () => this.onMachineSelectionChanged(this.machineStocks[i].getSelectedItems()));
        }
        setupMachineCards(this.machineStocks);

        for (let i=1; i<=10; i++) {
            machines.filter(machine => machine.location_arg == i).forEach(machine => this.machineStocks[i].addToStockWithId(getUniqueId(machine), ''+machine.id));
        }
    }

    public getSelectedProjectsIds(): number[] {
        const selectedIds = [];

        for (let i=1; i<=6; i++) {
            selectedIds.push(...this.projectStocks[i].getSelectedItems().map(item => Number(item.id)));
        }

        return selectedIds;
    }

    private _onProjectSelectionChanged() {
        this.onProjectSelectionChanged?.(this.getSelectedProjectsIds());
    }

    public onMachineSelectionChanged(items: any) {
        if (items.length == 1) {
            const card = items[0];
            this.game.repairMachine(card.id);
        }
    }

    public setProjectSelectable(selectable: boolean) {
        this.projectStocks.forEach(stock => stock.setSelectionMode(selectable ? 2 : 0));
        if (!selectable) {
            this.projectStocks.forEach(stock => stock.unselectAll());
        }
    }

    public setMachineSelectable(selectable: boolean) {
        this.machineStocks.forEach(stock => stock.setSelectionMode(selectable ? 1 : 0));
        if (!selectable) {
            this.machineStocks.forEach(stock => stock.unselectAll());
        }
    }

    public setPoints(playerId: number, points: number) {
        const markerDiv = document.getElementById(`player-${playerId}-point-marker`);

        markerDiv.style.top = `${points % 2 ? 40 : 52}px`;
        markerDiv.style.left = `${16 + points*46.2}px`;
    }
}