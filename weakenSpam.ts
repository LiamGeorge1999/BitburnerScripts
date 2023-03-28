import { Util } from "./Utils"
import {NS} from "../NetscriptDefinitions"
import { calculateExpGain, getOptimalExpGrindTarget } from "./expGrindTargetFinder.js"
/** @param {.NS} ns **/
export async function main(ns: NS) {
    ns.disableLog("ALL");
    let util = new Util(ns);
    const optimus = ns.args[0] ? {server: ns.args[0].toString(), value: null, exp: calculateExpGain(ns, ns.getServer(ns.args[0].toString()), ns.getPlayer()) } : getOptimalExpGrindTarget(ns);
    const target = optimus.server;
    while (true) {
        await ns.sleep(100);
        const threads = await util.flood(ns, "weaken.js", ns.getPurchasedServers(), false, target);
        var wait = ns.getWeakenTime(target);
        ns.print(`waiting ${ns.tFormat(wait, true)}`);
        await ns.sleep(wait);
        ns.print(`[SUCCESS] Gained ${optimus.exp * threads} from weakening ${target}`);
    }
}