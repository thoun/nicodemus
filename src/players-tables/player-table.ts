class PlayerTable {
    public playerId: number;

    constructor(
        private game: NicodemusGame, 
        player: NicodemusPlayer) {

        this.playerId = Number(player.id);

        /*let html = `<div id="player-table-wrapper-${this.playerId}" class="player-table-wrapper">
        <div id="player-table-${this.playerId}" class="player-table" style="border-color: #${player.color};">`;
        for (let i=1; i<=5; i++) {
            html += `<div id="player-table-${this.playerId}-line${i}" class="line" style="top: ${10 + 70*(i-1)}px; width: ${69*i - 5}px;"></div>`;
        }
        html += `<div id="player-table-${this.playerId}-line0" class="floor line"></div>`;
        html += `<div id="player-table-${this.playerId}-wall" class="wall ${this.game.isVariant() ? 'grayed-side' : 'colored-side'}"></div>`;
        if (this.game.isVariant()) {
            for (let i=1; i<=5; i++) {
                html += `<div id="player-table-${this.playerId}-column${i}" class="column" style="left: ${384 + 69*(i-1)}px; width: ${64}px;"></div>`;
            }
            html += `<div id="player-table-${this.playerId}-column0" class="floor column"></div>`;
        }
        html += `    </div>
        
            <div class="player-name" style="color: #${player.color};">${player.name}</div>
            <div class="player-name dark">${player.name}</div>
        </div>`;

        dojo.place(html, 'table');

        for (let i=0; i<=5; i++) {
            document.getElementById(`player-table-${this.playerId}-line${i}`).addEventListener('click', () => this.game.selectLine(i));
        }
        if (this.game.isVariant()) {
            for (let i=0; i<=5; i++) {
                document.getElementById(`player-table-${this.playerId}-column${i}`).addEventListener('click', () => this.game.selectColumn(i));
            }
        }

        for (let i=0; i<=5; i++) {
            const tiles = player.lines.filter(tile => tile.line === i);
            this.placeTilesOnLine(tiles, i);
        }

        this.placeTilesOnWall(player.wall);*/
    }
}