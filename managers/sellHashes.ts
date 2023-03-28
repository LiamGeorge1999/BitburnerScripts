import { getTimeString } from "../lib/clock";
import { HashUpgrade } from "../lib/HashUpgrade";
import {NS} from "../../NetscriptDefinitions";

export function autocomplete(data: {servers: string[], txts: string[], scripts: string[], flags: string[]}, args: string[]) {
    return [...enumKeys(HashUpgrade)]; // This script autocompletes the list of servers.
}

function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
    return Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];
}

export async function main(ns: NS) {
    ns.clearLog();
    ns.disableLog("sleep");
    var upgrade: HashUpgrade = HashUpgrade.SellForMoney;
    if (ns.args[0] && typeof(ns.args[0]) == "string" && enumKeys(HashUpgrade).some((val) => { return val == ns.args[0].toString() })) {
        upgrade = HashUpgrade[enumKeys(HashUpgrade).find((val) => { return val == ns.args[0].toString() }) || "SellForMoney"]
    }
    ns.print(`Upgrade is ${upgrade}!`);
    while (await ns.sleep(100)){
        while (ns.hacknet.spendHashes(upgrade)) { 
            ns.print(`${getTimeString()}: bought ${upgrade}!`);

        };
    }
}