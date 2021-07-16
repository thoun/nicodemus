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
    playerNo: number;
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
    getPlayerId(): number;
    repairMachine(id: number): void;
}

interface ChoosePlayActionArgs {
    charcoalium: number;
    resource: number;
}

interface ChooseProjectArgs {
    completeProjects: Project[];
}

interface NotifMachinePlayedArgs {
    playerId: number;
    machine: Machine;
}