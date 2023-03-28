import {Util} from "../Utils"
import {NS} from "../../NetscriptDefinitions"

/** @param {NS} ns **/
export async function main(ns: NS) {
	ns.tprint("FLOOD IN DEVELOPMENT")
	var util = new Util(ns);
	await util.flood(ns, "justGrow.js", [ns.getServer().hostname || "home"], false, "foodnstuff");
}