import { Util } from "../Utils.js"
import {NS} from "../NetscriptDefinitions"
/** @param {NS} ns **/
export async function main(ns: NS) {

    ns.disableLog("scan");
    //ns.tail();
    var input = ns.args[0];
    if (!input || typeof(input) != "string") {
        ns.tprint("Please provide path.");
    }

    if (typeof(input) == "string"){
        var util = new Util(ns);
        util.jump(input);
    }
}