import {Util} from "../Utils"
import {NS} from ".@ns"

/** @param {NS} ns **/
export async function main(ns: NS) {
	ns.tprint("FLOOD IN DEVELOPMENT")
	var util = new Util(ns);
	await util.flood("tutorialHack.js", ["home"], false, util.findOptimalTarget());
}