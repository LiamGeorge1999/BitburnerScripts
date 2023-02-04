import {Util} from "../Utils.js";
import {NS} from "../NetscriptDefinitions"

/** @param {NS} ns **/
export async function main(ns: NS) {
    if (typeof ns.args[0] == "string") {
        var util = new Util(ns);
        util.ownServer(ns.args[0]);
    }
}
