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

interface Resource {
    id: number;
    type: number;
    location: string;
    location_arg: number;
}

interface PlacedTokens {
    resourceId: number;
    x: number;
    y: number;
}

interface NicodemusPlayer extends Player {
    playerNo: number;
    machines: Machine[];
    projects: Project[];
    resources: Resource[][];
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
    resources: Resource[][];
}

interface NicodemusGame extends Game {
    getPlayerId(): number;
    repairMachine(id: number): void;
}

interface ChooseActionArgs {
    disabledMachines: Machine[];
}

interface ChoosePlayActionArgs {
    charcoalium: number;
    resource: number;
    machine: Machine;
}

interface ChooseProjectArgs {
    completeProjects: Project[];
}

interface NotifMachinePlayedArgs {
    playerId: number;
    machine: Machine;
}

interface NotifMachineRepairedArgs {
    playerId: number;
    machine: Machine;
    machineSpot: number;
}

interface NotifTableMoveArgs {
    moved: { [originalSpot: number]: Machine };
}

interface NotifPointsArgs {
    playerId: number;
    points: number;
}

interface NotifResourcesArgs {
    playerId: number;
    resourceType: number;
    resources: Resource[];
    count: number;
    opponentId: number;
    opponentCount: number;
}

interface NotifHandRefillArgs {
    machines: Machine[];
}