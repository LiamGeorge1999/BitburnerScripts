import {Util} from "../Utils";
import {NS} from ".@ns"

/** @param {NS} ns **/
export async function main(ns: NS) {
    if (typeof ns.args[0] == "string") {
        var util = new Util(ns);
        util.ownServer(ns.args[0]);
    }
}
