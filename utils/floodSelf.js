import {Util} from "Utils.js"
/** @param {NS} ns **/
export async function main(ns) {
	ns.tprint("FLOOD IN DEVELOPMENT")
	var util = new Util(ns);
	await util.flood("tutorialHack.js", ["home"], false, util.findOptimalTarget());
}