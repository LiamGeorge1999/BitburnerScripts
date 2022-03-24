import {Util} from "Utils.js"
/** @param {import(".").NS} ns **/
export async function main(ns) {
	var util = new Util(ns);
	var hackedAll = false;
	while (!hackedAll) {
		hackedAll = true;
		var targets = ["CSEC","I.I.I.I","avmnite-02h", "run4theh111z"];
		var completedTargets = [];
		for (let target of targets) {
			var hackingLevel = ns.getHackingLevel();
			//ns.print(`[INFO] targets = ${targets}`);
			if (ns.getServerRequiredHackingLevel(target) < hackingLevel && util.ownServer(target)) {
				ns.tprint(`=== ${target} ready for Backdoor ===`);
				completedTargets.push(target);
				ns.run("connect.js", 1, target, true);
				await ns.sleep(Math.ceil(ns.getHackTime(target)));
				util.runTerminalCommand("home");
			} else {
				hackedAll = false;
			}
		}
		for (let completedTarget of completedTargets) {
			targets.splice(targets.indexOf(completedTarget), 1);
		}
		await ns.sleep(10000);
	}
	return 0;
}