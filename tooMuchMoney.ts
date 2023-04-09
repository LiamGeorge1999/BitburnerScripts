
import {NS} from "../NetscriptDefinitions"

export async function main(ns: NS) {
    ns.disableLog("sleep");
    while (!ns.getPlayer().factions.includes("Sector-12")){
        ns.clearLog();
        if (ns.singularity.checkFactionInvitations().includes("Sector-12")) ns.singularity.joinFaction("Sector-12");
        else ns.print("awaiting invite..."); 
        await ns.sleep(100);
    }
    ns.print("in Sector-12");
    while (!ns.corporation.bribe("Sector-12", Math.floor(ns.getPlayer().money/10))) { 
        ns.print("failed to bribe Sector-12"); 
        await ns.sleep(1000); 
    };

    ns.print("bribed Sector-12");
    var bought = false;
    while (ns.singularity.purchaseAugmentation("Sector-12", "NeuroFlux Governor") && bought) {
        ns.print("bought nflx");
        bought = true;
        await ns.sleep(100);
    }
    ns.print("cannot buy nflx");
    ns.singularity.installAugmentations(ns.getScriptName());
}