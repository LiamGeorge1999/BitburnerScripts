import {Util} from "Utils.js"
/** @param {NS} ns **/
export async function main(ns) {
	var util = new Util(ns);
	while (true) {
		var hackingLevel = ns.getHackingLevel();
		var targets = ["CSEC","I.I.I.I","avmnite-02h", "run4theh111z"];
		for (var i in targets) {
			if (util.ownServer(targets[i])) {
				targets.splice(i,1);
				ns.tprint(`=== ${targets[i]} ready for Backdoor ===`);
			}
		}

		await ns.sleep(60000);
	}
}