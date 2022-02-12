import {Util} from "Utils.js"
/** @param {NS} ns **/
export async function main(ns) {
	var util = new Util(ns);
	ns.tprint(`optimal target: ${util.findOptimalTarget()}`);
}