import {Util} from "Utils.js"
/** @param {NS} ns **/
export async function main(ns) {
	var util = new Util(ns);
	var script = "tutorialHack.js";
	var hosts = ns.getPurchasedServers();
	var target = util.findOptimalTarget();
	for (var host of hosts) {
		if (await ns.scp(script, "home", host)) {
			ns.exec(script, host, Math.floor(ns.getServerMaxRam(host)/ns.getScriptRam(script, host)), target);
		}
	}

}