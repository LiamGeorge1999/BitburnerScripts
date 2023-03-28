import {Util} from "../Utils";
import {NS} from "../../NetscriptDefinitions"
import { getTimeString } from "../lib/clock.js";
//import {autocomplete} from "../lib/autocomplete.js"

export function autocomplete(data: {servers: string[], txts: string[], scripts: string[], flags: string[]}, args: string[]) {
    return [...data.servers]; // This script autocompletes the list of servers.
}
export async function main(ns: NS) {
    if (typeof ns.args[0] == "string") {
        var util = new Util(ns);
        util.ownServer(ns, ns.args[0]);
    }
}
