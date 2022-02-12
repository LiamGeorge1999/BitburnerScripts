import {Util} from "Utils.js";
/** @param {NS} ns **/
export async function main(ns) {
	var util = new Util(ns);
	var targets = util.findAllServers();
	for (var target of targets) {
		util.ownServer(target);
	}

}