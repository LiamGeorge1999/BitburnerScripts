import { Util } from "../Utils"
import {NS} from "../../NetscriptDefinitions"

export function autocomplete(data: {servers: string[], txts: string[], scripts: string[], flags: string[]}, args: string[]) {
    return [...data.servers]; // This script autocompletes the list of servers.
}

export async function main(ns: NS) {
    ns.disableLog("scan");
    //ns.tail();
    var input = ns.args[0];
    if (!input || typeof(input) != "string") {
        ns.tprint("Please provide path.");
    }

    if (typeof(input) == "string"){
        var util = new Util(ns);
        Util.jump(ns, input);
    }
}