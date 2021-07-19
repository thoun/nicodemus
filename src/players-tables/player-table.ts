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
                <div id="player-icon-${this.playerId}" class="player-icon ${color}"></div>
            </div>
            <div class="player-resources ${side}">
                <div id="player${this.playerId}-resources0" class="top"></div>
                <div id="player${this.playerId}-resources1"></div>
                <div id="player${this.playerId}-resources2"></div>
                <div id="player${this.playerId}-resources3"></div>
            </div>
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

        // resources
        for (let i=0; i<=3; i++) {
            const resourcesToPlace = player.resources[i];
            this.addResources(i, resourcesToPlace);
        }
    }

    private getDistance(p1: Partial<PlacedTokens>, p2: Partial<PlacedTokens>): number {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    }

    private getPlaceOnCard(placed: PlacedTokens[], type: number): Partial<PlacedTokens> {
        const xMaxShift = type ? 28 : 148;
        const yMaxShift = type ? 66 : 28;
        const newPlace = {
            x: Math.random() * xMaxShift + 16,
            y: Math.random() * yMaxShift + 16,
        };
        let protection = 0;
        while (protection < 1000 && placed.some(place => this.getDistance(newPlace, place) < 32)) {
            newPlace.x = Math.random() * xMaxShift + 16;
            newPlace.y = Math.random() * yMaxShift + 16;
            protection++;
        }

        return newPlace;
    }

    public addResources(type: number, resources: Resource[]) {
        const divId = `player${this.playerId}-resources${type}`;
        const div = document.getElementById(divId);
        if (!div) {
            return;
        }
        const placed: PlacedTokens[] = div.dataset.placed ? JSON.parse(div.dataset.placed) : [];

        // add tokens
        resources.filter(resource => !placed.some(place => place.resourceId == resource.id)).forEach(resource => {
            const newPlace = this.getPlaceOnCard(placed, type);
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

    public addWorkshopProjects(projects: Project[]) {
        // TODO
        //projects.forEach(project => this.playerProjectHand.addToStockWithId(getUniqueId(project), ''+project.id));
    }
}