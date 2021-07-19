class Table {
    private projectStocks: Stock[] = [];
    public machineStocks: Stock[] = [];

    public onProjectSelectionChanged: (selectedProjectsIds: number[]) => any;

    constructor(
        private game: NicodemusGame, 
        players: NicodemusPlayer[],
        projects: Project[],
        machines: Machine[],
        resources: Resource[][],
    ) {
        let html = '';

        // points
        players.forEach(player =>
            html += `<div id="player-${player.id}-point-marker" class="point-marker ${player.color.startsWith('00') ? 'blue' : 'red'}"></div>`
        );
        dojo.place(html, 'table');
        players.forEach(player => this.setPoints(Number(player.id), Number(player.score), true));

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
            this.projectStocks[i].onItemCreate = (cardDiv: HTMLDivElement, type: number) => setupProjectCard(game, cardDiv, type);
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
            const left = (firstRow ? 204 : 0) + (i-(firstRow ? 1 : 6)) * 204;
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
            this.machineStocks[i].onItemCreate = (cardDiv: HTMLDivElement, type: number) => setupMachineCard(game, cardDiv, type);
            dojo.connect(this.machineStocks[i], 'onChangeSelection', this, () => this.onMachineSelectionChanged(this.machineStocks[i].getSelectedItems()));
        }
        setupMachineCards(this.machineStocks);

        for (let i=1; i<=10; i++) {
            machines.filter(machine => machine.location_arg == i).forEach(machine => this.machineStocks[i].addToStockWithId(getUniqueId(machine), ''+machine.id));
        }

        // resources
        for (let i=0; i<=3; i++) {
            const resourcesToPlace = resources[i];
            this.addResources(i, resourcesToPlace);
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

    public setPoints(playerId: number, points: number, firstPosition = false) {
        const markerDiv = document.getElementById(`player-${playerId}-point-marker`);

        const top = points % 2 ? 40 : 52;
        const left = 16 + points*46.2;

        if (firstPosition) {
            markerDiv.style.top = `${top}px`;
            markerDiv.style.left = `${left}px`;
        } else {
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
    }

    public machinePlayed(playerId: number, machine: Machine) {
        const fromHandId = `my-machines_item_${machine.id}`;
        const from = document.getElementById(fromHandId) ? fromHandId : `player-icon-${playerId}`;
        this.machineStocks[machine.location_arg].addToStockWithId(getUniqueId(machine), ''+machine.id, from);
        dojo.addClass(`table-machine-spot-${machine.location_arg}_item_${machine.id}`, 'selected');
    }

    private getDistance(p1: Partial<PlacedTokens>, p2: Partial<PlacedTokens>): number {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    }

    private getPlaceOnCard(placed: PlacedTokens[]): Partial<PlacedTokens> {
        const newPlace = {
            x: Math.random() * 228 + 16,
            y: Math.random() * 38 + 16,
        };
        let protection = 0;
        while (protection < 1000 && placed.some(place => this.getDistance(newPlace, place) < 32)) {
            newPlace.x = Math.random() * 228 + 16;
            newPlace.y = Math.random() * 38 + 16;
            protection++;
        }

        return newPlace;
    }

    public addResources(type: number, resources: Resource[]) {
        const divId = `table-resources${type}`;
        const div = document.getElementById(divId);
        if (!div) {
            return;
        }
        const placed: PlacedTokens[] = div.dataset.placed ? JSON.parse(div.dataset.placed) : [];

        // add tokens
        resources.filter(resource => !placed.some(place => place.resourceId == resource.id)).forEach(resource => {
            const newPlace = this.getPlaceOnCard(placed);
            placed.push({
                ...newPlace, 
                resourceId: resource.id,
            } as PlacedTokens);

            const resourceDivId = `resource${type}-${resource.id}`;
            const resourceDiv = document.getElementById(`resource${type}-${resource.id}`);
            if (resourceDiv) {
                const originDiv = resourceDiv.parentElement;
                const originPlaced: PlacedTokens[] = originDiv.dataset.placed ? JSON.parse(originDiv.dataset.placed) : [];
                originDiv.dataset.placed = JSON.stringify(originPlaced.filter(place => place.resourceId != resource.id));

                slideToObjectAndAttach(resourceDiv, divId, newPlace.x, newPlace.y);
            } else {
                let html = `<div id="${resourceDivId}"
                    class="cube resource${type} aspect${resource.id % (type == 0 ? 8 : 4)}" 
                    style="left: ${newPlace.x - 16}px; top: ${newPlace.y - 16}px;"
                ></div>`;
                dojo.place(html, divId);
            }
        });

        div.dataset.placed = JSON.stringify(placed);
    }
}