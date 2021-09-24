class DiscardedMachineSelector {
    public machineStocks: Stock[] = [];

    //public onDiscardedMachinesSelectionChanged: (completeProjects: CompleteProject[]) => any;

    constructor(
        private game: NicodemusGame, 
        private completeProjects: CompleteProject[]) {

        let html = `<div id="discarded-machines-selector" class="whiteblock">`;
        completeProjects.forEach(completeProject => {
            html += `
            <div class="complete-project">
                <div class="project-infos">
                    <div class="project project${PROJECTS_IDS.indexOf(getUniqueId(completeProject.project))}">${this.game.showColorblindIndications ? getColorBlindProjectHtml(getUniqueId(completeProject.project)) : ''}</div>
                    <div><span id="discarded-machines-selector-${completeProject.project.id}-counter" class="machine-counter">1</span> / ${completeProject.machinesNumber}</div>
                </div>
                <div id="discarded-machines-selector-${completeProject.project.id}-machines" class="machines"></div>
            </div>`;
        });
        html += `</div>`;

        dojo.place(html, 'myhand-wrap', 'before');

        // machines
        completeProjects.forEach(completeProject => {
            const projectId = completeProject.project.id;
            this.machineStocks[projectId] = new ebg.stock() as Stock;
            this.machineStocks[projectId].setSelectionAppearance('class');
            this.machineStocks[projectId].selectionClass = 'selected';
            this.machineStocks[projectId].create(this.game, $(`discarded-machines-selector-${projectId}-machines`), MACHINE_WIDTH, MACHINE_HEIGHT);
            this.machineStocks[projectId].setSelectionMode(2);
            this.machineStocks[projectId].centerItems = true;
            this.machineStocks[projectId].onItemCreate = (cardDiv: HTMLDivElement, type: number) => setupMachineCard(game, cardDiv, type);
            dojo.connect(this.machineStocks[projectId], 'onChangeSelection', this, (_, item_id: string) => this.onMachineSelectionChanged(projectId, item_id));
        });

        setupMachineCards(this.machineStocks);

        completeProjects.forEach(completeProject => {
            const projectId = completeProject.project.id;
            completeProject.machines.forEach(machine => this.machineStocks[projectId].addToStockWithId(getUniqueId(machine), ''+machine.id));
            completeProject.selectedMachinesIds = [completeProject.mandatoryMachine.id];

            this.machineStocks[projectId].selectItem(''+completeProject.mandatoryMachine.id);
            dojo.addClass(`discarded-machines-selector-${projectId}-machines_item_${completeProject.mandatoryMachine.id}`, 'disabled');
        });
    }

    public destroy() {
        dojo.destroy('discarded-machines-selector');
    }

    private onMachineSelectionChanged(projectId: number, itemId: string) {
        const completeProject = this.completeProjects.find(cp => cp.project);

        // can't deselect mandatory machine
        if (Number(itemId) === completeProject.mandatoryMachine.id) {
            this.machineStocks[projectId].selectItem(itemId);
            return;
        }

        const selected = dojo.hasClass(`discarded-machines-selector-${projectId}-machines_item_${itemId}`, 'selected');
        if (selected) {
            this.machineStocks.forEach(stock => {
                if (stock.items.some(item => item.id === itemId)) {
                    stock.selectItem(itemId);
                }
            });
        } else {
            this.machineStocks.forEach(stock => {
                if (stock.items.some(item => item.id === itemId)) {
                    stock.unselectItem(itemId);
                }
            });
        }

        this.updateCounters();
    }

    private updateCounters() {
        this.completeProjects.forEach(completeProject => {
            const projectId = completeProject.project.id;
            completeProject.selectedMachinesIds = this.machineStocks[projectId].getSelectedItems().map(item => Number(item.id));
            document.getElementById(`discarded-machines-selector-${projectId}-counter`).innerHTML = ''+completeProject.selectedMachinesIds.length;
            const validProject = completeProject.machinesNumber == completeProject.selectedMachinesIds.length;
            const validWarningProject = completeProject.machinesNumber < completeProject.selectedMachinesIds.length;
            dojo.toggleClass(`discarded-machines-selector-${projectId}-counter`, 'valid', validProject);
            dojo.toggleClass(`discarded-machines-selector-${projectId}-counter`, 'validWarning', validWarningProject);
        });

        //this.onDiscardedMachinesSelectionChanged?.(this.completeProjects);
        const allValidSelection = this.completeProjects.every(cp => cp.machinesNumber <= cp.selectedMachinesIds.length);
        dojo.toggleClass('selectProjectDiscardedMachine-button', 'disabled', !allValidSelection);
    }

    public getCompleteProjects() {
        return this.completeProjects;
    }
}