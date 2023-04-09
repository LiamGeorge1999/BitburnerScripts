import { BladeburnerActionCategories, BladeBurnerGeneralActions, BladeBurnerContractsActions, BladeBurnerOperationsActions } from "../lib/BladeburnerActions.js";
import { TableMaker } from "../lib/tableMaker.js";
import { NS } from "../../NetscriptDefinitions";

const BladeburnerActions = {...BladeBurnerGeneralActions, ...BladeBurnerContractsActions, ...BladeBurnerOperationsActions}

export async function main(ns: NS) {
    while (await ns.sleep(100)) {
        var currentLevel = ns.bladeburner.getActionCurrentLevel(BladeburnerActionCategories.Contracts, BladeburnerActions.Tracking);
        while (currentLevel > 1 && ns.bladeburner.getActionEstimatedSuccessChance("Contracts", "Tracking")[0] < 1) ns.bladeburner.setActionLevel("Contracts", "Tracking", currentLevel-1);
        if (getStamina(ns).currentStamina < 0.7 * getStamina(ns).maxStamina) ns.bladeburner.startAction("General", "Hyperbolic Regeneration Chamber");
        else if (ns.bladeburner.getActionEstimatedSuccessChance)
    }
    
}

function startAction(ns: NS, category: BladeburnerActionCategories, action: BladeBurnerGeneralActions | BladeBurnerContractsActions | BladeBurnerOperationsActions, level?: number) {
    if (ns.bladeburner.getCurrentAction().name != action) {
        if (level) ns.bladeburner.setActionLevel(category, action, level);
        ns.bladeburner.startAction(category, action);
    }
}


function getStamina(ns: NS): {currentStamina: number, maxStamina: number} {
    var staminaRes = ns.bladeburner.getStamina()
    return {currentStamina: staminaRes[0], maxStamina: staminaRes[1]};
}