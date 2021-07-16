interface Machine {
    id: number;
    type: number;
    subType: number;
    location: string;
    location_arg: number;
}

interface Project {
    id: number;
    type: number;
    subType: number;
    location: string;
    location_arg: number;
}

interface NicodemusPlayer extends Player {
    machines: Machine[];
    projects: Project[];
    charcoalium: number;
    wood: number;
    copper: number;
    crystal: number;
}

/**
 * Your game interfaces
 */

interface NicodemusGamedatas {
    current_player_id: string;
    decision: {decision_type: string};
    game_result_neutralized: string;
    gamestate: Gamestate;
    gamestates: { [gamestateId: number]: Gamestate };
    neutralized_player_id: string;
    notifications: {last_packet_id: string, move_nbr: string}
    playerorder: (string | number)[];
    players: { [playerId: number]: NicodemusPlayer };
    tablespeed: string;

    // Add here variables you set up in getAllDatas
    handMachines: Machine[];
    tableMachines: Machine[];
    tableProjects: Project[];
    charcoalium: number;
    wood: number;
    copper: number;
    crystal: number;
}

interface NicodemusGame extends Game {
    repairMachine(id: number): void;
}

interface ChoosePlayActionArgs {
    charcoalium: number;
    resource: number;
}

interface EnteringChooseColumnArgs {
    line: number;
    columns: { [playerId: number]: number[] };
}

/*interface NotifFirstPlayerTokenArgs {
    playerId: number;
}

interface NotifFactoriesFilledArgs {
    factories: { [factoryId: number]: Tile[] };
}

interface NotifTilesSelectedArgs {
    playerId: number;
    selectedTiles: Tile[];
    discardedTiles: Tile[];
    fromFactory: boolean;
}

interface NotifTilesPlacedOnLineArgs {
    playerId: number;
    line: number;
    placedTiles: Tile[];
    discardedTiles: Tile[];
}

interface WallTilePointDetail {
    points: number;
    rowTiles: Tile[];
    columnTiles: Tile[];
}

interface PlacedTileOnWall {
    placedTile: Tile;
    discardedTiles: Tile[];
    pointsDetail: WallTilePointDetail;
}

interface NotifPlaceTileOnWallArgs {
    completeLines: { [playerId: number]: PlacedTileOnWall };
}

interface FloorLine {
    points: number;
    tiles: Tile[];
}

interface NotifEmptyFloorLineArgs {
    floorLines: { [playerId: number]: FloorLine };
}

interface EndScoreTiles {
    tiles: Tile[];
    points: number;
}

interface NotifEndScoreArgs {
    scores: { [playerId: number]: EndScoreTiles };
}

interface PlacedTile {
    x: number;
    y: number;
}*/