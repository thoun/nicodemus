class Table {

    constructor(
        private game: NicodemusGame, 
    ) {
        /*const factoriesDiv = document.getElementById('factories');

        const radius = 175 + factoryNumber*25;
        const halfSize = radius + FACTORY_RADIUS;
        const size = `${halfSize*2}px`;
        factoriesDiv.style.width = size;
        factoriesDiv.style.height = size;

        let html = `<div>`;
        html += `<div id="factory0" class="factory-center"></div>`;
        for (let i=1; i<=factoryNumber; i++) {
            const angle = (i-1)*Math.PI*2/factoryNumber; // in radians
            const left = radius*Math.sin(angle);
            const top = radius*Math.cos(angle);
            
            html += `<div id="factory${i}" class="factory" style="left: ${halfSize-FACTORY_RADIUS+left}px; top: ${halfSize-FACTORY_RADIUS-top}px;"></div>`;
        }
        html += `</div>`;

        dojo.place(html, 'factories');

        this.fillFactories(factories);*/
    }
}