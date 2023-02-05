import {Util} from "../Utils";
import {NS} from ".@ns"

/** @param {NS} ns **/
export async function main(ns: NS) {
	var util = new Util(ns);
	var targets = util.findAllServers();
	for (var target of targets) {
		util.ownServer(target);
		await ns.sleep(20);
	}
	
}