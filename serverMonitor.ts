import {Util} from "./Utils"
import {NS} from "./NetscriptDefinitions"

/** @param {NS} ns **/
export async function main(ns: NS) {
	ns.tail();
	ns.disableLog("sleep");
	var util = new Util(ns);
	var input = ns.args[0];
	if (typeof(input) != "string") {
		ns.tprint("Input must be a server name (string).");
		return
	}
	while (true) {
		await ns.sleep(100);
		var server = ns.getServer(input ?? util.findOptimalTarget());
		ns.clearLog();
		ns.print(`Name: ${server.hostname}`)
		ns.print(`Money: ${ns.nFormat(server.moneyAvailable, "$0.00a")}/${ns.nFormat(server.moneyMax, "$0.00a")}`)
		ns.print(`Security: ${ns.nFormat(server.hackDifficulty, "0.00")}/${ns.nFormat(server.minDifficulty, "0.00")}`)
		ns.print(`Growth rate: ${server.serverGrowth}`)
	}
}