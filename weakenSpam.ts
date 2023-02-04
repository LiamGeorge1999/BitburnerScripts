import { Util } from "./Utils"
import {NS} from "./NetscriptDefinitions"
import { getOptimalExpGrindTarget } from "./expGrindTargetFinder.js"
/** @param {.NS} ns **/
export async function main(ns: NS) {
    ns.disableLog("ALL");
    let util = new Util(ns);
    const optimus = getOptimalExpGrindTarget(ns);
    const target = optimus.server;
    while (true) {
        await ns.sleep(100);
        const threads = await util.flood("weaken.js", ns.getPurchasedServers(), false, target);
        await ns.sleep(ns.getWeakenTime(target));
        ns.print(`[SUCCESS] Gained ${optimus.exp * threads} from weakening ${target}`);
    }
}