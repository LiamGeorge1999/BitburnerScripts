import {Util} from "../Utils"
import {NS} from "../../NetscriptDefinitions"

/** @param {NS} ns **/
export async function main(ns: NS) {
	var util = new Util(ns);
	ns.tprint(`optimal target: ${util.findOptimalTarget()}`);
}