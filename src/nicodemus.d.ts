interface Resource {
    id: number;
    type: number;
    location: string;
    location_arg: number;
}

interface Payment {
    remainingCost: number[];
    jokers: number[];
}

interface Machine {
    id: number;
    type: number;
    subType: number;
    location: string;
    location_arg: number;
    points: number;
    produce: number;
    resources?: Resource[];
    payments?: Payment[];
}

interface Project {
    id: number;
    type: number;
    subType: number;
    location: string;
    location_arg: number;
}

interface CompleteProject {    
    project: Project;
    mandatoryMachine: Machine;
    machines: Machine[];
    machinesNumber: number;
    selectedMachinesIds?: number[];
}

interface PlacedTokens {
    resourceId?: number;
    x: number;
    y: number;
}

interface NicodemusPlayer extends Player {
    playerNo: number;
    machines: Machine[];
    projects: Project[];

    discardedProjects: Project[];
    discardedMachines: Machine[];

    resources: Resource[][];

    handMachinesCount: number;
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
    remainingMachines: number;
    remainingProjects: number;

    endTurn: boolean;
}

interface NicodemusGame extends Game {
    getPlayerId(): number;
    getOpponentId(playerId: number): number;
    getPlayerScore(playerId: number): number;
    machineClick(id: number, from: 'hand' | 'table', payments?: Payment[]): void;
    setTooltip(id: string, html: string): void;
}

interface ChooseActionArgs {
    selectableMachines: Machine[];
}

interface ChoosePlayActionArgs {
    machine: Machine;
    canApplyEffect: boolean;
}

interface SelectMachineArgs {
    selectableMachines: Machine[];
}

interface SelectResourceArgs {
    possibleCombinations: number[][];
}

interface SelectProjectArgs {
    projects: Project[];
    remainingProjects?: number;
}

interface Exchange {
    from: number;
    to: number;
}

interface SelectExchangeArgs {
    number: number;
    possibleExchanges: Exchange[];
}

interface ChooseProjectDiscardedMachineArgs {
    completeProjects: CompleteProject[];
}

interface NotifMachinePlayedArgs {
    playerId: number;
    machine: Machine;
    handMachinesCount: number;
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

interface NotifAddMachinesToHandArgs {
    playerId: number;
    machines?: Machine[];
    from: number;
    remainingMachines: number;
    handMachinesCount: number;
}

interface NotifRemovedCharcoaliumFromMachineArgs {
    removedCharcoaliums: Resource[];
}

interface NotifDiscardHandMachinesArgs {
    playerId: number;
    machines?: Machine[];
    handMachinesCount: number;
}

interface NotifDiscardTableMachinesArgs {
    machines: Machine[];
    removedCharcoaliums: Resource[];
}

interface NotifAddWorkshopProjectsArgs {
    playerId: number;
    projects: Project[];
}

interface NotifRemoveProjectArgs {
    playerId: number;
    project: Project;
    discardedMachines: Machine[];
}

interface NotifCancelMachinePlayedArgs extends NotifMachinePlayedArgs {
    machineSpot: number;
}