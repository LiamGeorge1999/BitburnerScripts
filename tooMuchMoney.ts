
import {NS} from "../NetscriptDefinitions"

export async function main(ns: NS) {
    ns.disableLog("sleep");
    while (!ns.getPlayer().factions.includes("CyberSec")){
        ns.clearLog();
        if (ns.singularity.checkFactionInvitations().includes("CyberSec")) ns.singularity.joinFaction("CyberSec");
        else ns.print("awaiting invite..."); 
        await ns.sleep(100);
    }
    ns.print("in cybersec");
    while (!ns.corporation.bribe("CyberSec", Math.floor(ns.getPlayer().money/10))) { 
        ns.print("failed to bribe CyberSec"); 
        await ns.sleep(1000); 
    };

    ns.print("bribed CyberSec");
    var bought = false;
    while (ns.singularity.purchaseAugmentation("CyberSec", "NeuroFlux Governor") && bought) {
        ns.print("bought nflx");
        bought = true;
        await ns.sleep(100);
    }
    ns.print("cannot buy nflx");
    ns.singularity.installAugmentations(ns.getScriptName());
}