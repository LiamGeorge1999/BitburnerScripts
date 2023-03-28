import {NS} from "../../NetscriptDefinitions"
import { getTimeString } from "../clock.js";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    ns.tail;
    while (await ns.sleep(1000)) {
        ns.tail();
        ns.clearLog();
        ns.print(getTimeString());
        ns.print(`Karma: ${ns.formatNumber(heartbreak(ns))}`);
    }
}

function heartbreak(ns: NS): number {
    // @ts-ignore
    return ns.heart.break()
}