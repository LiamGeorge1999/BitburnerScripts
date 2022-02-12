import {Util} from "Utils.js"
/** @param {NS} ns **/
export async function main(ns) {
	ns.tail();
	ns.disableLog("sleep");
	var util = new Util(ns);
	while (true) {
		await ns.sleep(100);
		var server = ns.getServer(ns.args[0] ?? util.findOptimalTarget());
		ns.clearLog();
		ns.print(`Name: ${server.hostname}`)
		ns.print(`Money: ${ns.nFormat(server.moneyAvailable, "$0.00a")}/${ns.nFormat(server.moneyMax, "$0.00a")}`)
		ns.print(`Security: ${ns.nFormat(server.hackDifficulty, "0.00")}/${ns.nFormat(server.minDifficulty, "0.00")}`)
		ns.print(`Growth rate: ${server.serverGrowth}`)
	}
}