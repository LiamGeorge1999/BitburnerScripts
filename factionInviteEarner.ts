import {Util} from "./Utils"
import {NS} from "../NetscriptDefinitions"

export async function main(ns: NS) {
	var hackedAll = false;
	var host = ns.getServer().hostname;
	while (!hackedAll) {
		hackedAll = true;
		var targets = ["CSEC","I.I.I.I","avmnite-02h", "run4theh111z"];
		var completedTargets: string[] = [];
        var util = new Util(ns);
		for (let target of targets) {
			var hackingLevel = ns.getHackingLevel();
			//ns.print(`[INFO] targets = ${targets}`);
			if (ns.getServerRequiredHackingLevel(target) < hackingLevel && await util.ownServer(ns, target)) {

				//await ns.sleep(Math.ceil(ns.getHackTime(target)));
				util.jump(host);
				completedTargets.push(target);
				ns.run("connect.js", 1, target, true);
				Util.runTerminalCommand("home");
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