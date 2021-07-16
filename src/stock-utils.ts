/*declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

declare const board: HTMLDivElement;*/

const MACHINES_IDS = [
  // blue
  11,
  12,
  13,
  14,
  15,

  // purple
  21,
  22,
  23,
  24,
  25,

  // red
  31,
  32,
  33,
  34,

  // yellow
  41,
  42,
];

const PROJECTS_IDS = [
  // colors
  10,
  11,
  12,
  13,
  14,

  // points
  20,
  21,
  22,
  23,

  // resources
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
];

const MACHINE_WIDTH = 190;
const MACHINE_HEIGHT = 190;

const PROJECT_WIDTH = 134;
const PROJECT_HEIGHT = 93;

function getUniqueId(object: { type: number, subType: number }): number {
    return object.type * 10 + object.subType;
}

function setupMachineCards(machineStocks: Stock[]) {
    const cardsurl = `${g_gamethemeurl}img/cards.jpg`;

    machineStocks.forEach(machineStock => 
            MACHINES_IDS.forEach((cardId, index) =>
                machineStock.addItemType(
                    cardId, 
                    0, 
                    cardsurl, 
                    index
                )
        )
    );
}

function setupProjectCards(projectStocks: Stock[]) {
    const cardsurl = `${g_gamethemeurl}img/projects.jpg`;

    projectStocks.forEach(projectStock => {

        PROJECTS_IDS.forEach((cardId, index) =>
            projectStock.addItemType(
                cardId, 
                0, 
                cardsurl, 
                index
            )
        );
    });
}

function getLocationTooltip(typeWithGuild: number) {
    const type = Math.floor(typeWithGuild / 10);
    const guild = typeWithGuild % 10;
    let message = null;
    switch (type) {
        case 1: message = _("At the end of the game, this Location is worth 7 IP."); break;
        case 2: message = _("Immediately gain 1 Pearl. At the end of the game, this Location is worth 5 IP."); break;
        case 3: message = _("Immediately gain 2 Pearls. At the end of the game, this Location is worth 4 IP."); break;
        case 4: message = _("Immediately gain 3 Pearls. At the end of the game, this Location is worth 3 IP."); break;
        case 5: message = _("At the end of the game, this Location is worth 1 IP per silver key held in your Senate Chamber, regardless of whether or not it has been used to take control of a Location."); break;
        case 6: message = _("At the end of the game, this Location is worth 2 IP per gold key held in your Senate Chamber, regardless of whether or not it has been used to take control of a Location."); break;
        case 7: message = _("At the end of the game, this Location is worth 1 IP per pair of Pearls in your possession."); break;
        case 8: message = _("At the end of the game, this Location is worth 2 IP per Location in your control."); break;
        case 9: message = _("Until your next turn, each opponent MUST only increase the size of their Senate Chamber by taking the first Lord from the deck. At the end of the game, this Location is worth 3 IP."); break;
        case 10: message = _("Until your next turn, each opponent MUST only increase the size of their Senate Chamber by taking first 2 Lords from the deck. Adding one to their Senate Chamber and discarding the other. At the end of the game, this Location is worth 3 IP."); break;
        case 11: message = _("Immediately replace all the discarded Lords in to the Lord deck and reshuffle. At the end of the game, this Location is worth 3 IP."); break;
        case 12: message = _("Immediately replace all the available Locations to the Location deck and reshuffle. At the end of the game, this Location is worth 3 IP."); break;
        case 13: message = _("Until the end of the game, to take control of a Location, only 2 keys are needed, irrespective of their type. At the end of the game, this Location is worth 3 IP."); break;
        case 14: message = _("Until the end of the game, when you take control of a Location, you choose this location from the Location deck (No longer from the available Locations). The deck is then reshuffled. At the end of the game, this Location is worth 3 IP."); break;
    }
    return message;
}

function getLordTooltip(typeWithGuild: number) {
    const type = Math.floor(typeWithGuild / 10);
    let message = null;
    switch (type) {
        case 1: message = _("When this Lord is placed in the Senate Chamber, two Lords in this Chamber (including this one) can be swapped places, except those with keys."); break;
        case 2: message = _("This Lord gives you 1 silver key."); break;
        case 3: message = _("This Lord gives you 1 gold key."); break;
        case 4: message = _("This Lord gives you 2 Pearls."); break;
        case 5: message = _("This Lord gives you 1 Pearl."); break;
        case 6: message = _("When this Lord is placed in the Senate Chamber, the top Lord card is taken from the Lord deck and placed in the corresponding discard pile."); break;
    }
    return message;
}

function moveToAnotherStock(sourceStock: Stock, destinationStock: Stock, uniqueId: number, cardId: string) {
    if (sourceStock === destinationStock) {
        return;
    }
    
    const sourceStockItemId = `${sourceStock.container_div.id}_item_${cardId}`;
    if (document.getElementById(sourceStockItemId)) {        
        destinationStock.addToStockWithId(uniqueId, cardId, sourceStockItemId);
        sourceStock.removeFromStockById(cardId);
    } else {
        console.warn(`${sourceStockItemId} not found in `, sourceStock);
        destinationStock.addToStockWithId(uniqueId, cardId, sourceStock.container_div.id);
    }
}