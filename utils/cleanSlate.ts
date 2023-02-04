import {Util} from "../Utils"
import {NS} from "../NetscriptDefinitions"
/** @param {NS} ns **/
export async function main(ns: NS) {
	var util = new Util(ns);
	ns.rm("Stages.txt");
	util.killAllServers();
}