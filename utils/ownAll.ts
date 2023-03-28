import {Util} from "../Utils";
import {NS} from "../../NetscriptDefinitions"

/** @param {NS} ns **/
export async function main(ns: NS) {
	var util = new Util(ns);
	var targets = util.findAllServers();
	for (var target of targets) {
		await util.ownServer(ns, target);
		await ns.sleep(20);
	}
	
}