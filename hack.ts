import {NS} from "/NetscriptDefinitions"

/** @param {.NS} ns **/
export async function main(ns: NS) {
	var input = ns.args[0];
	var serverName: string;
	if (typeof(input) == "string") {
		serverName = input;
	} else {
		serverName = input.toString();
	}
	var delay = ns.args[1];
	if (typeof(delay) != "number") {
		return
	}
	var lastFinish = ns.args[2];
	if (typeof(lastFinish) != "number") {
		return
	}
	delay = delay - 590;
	await ns.sleep((delay || 20));
	let hackDifficulty = ns.getServerSecurityLevel(serverName);
	let startDate = new Date();
	let res = await ns.hack(serverName);
	let endDate = new Date();
	ns.tprint(`hacked ${serverName} for $${ns.nFormat(res, "0.00a")}`);
	let start = startDate.valueOf();
	let end = endDate.valueOf();
	ns.exec("logWriter.js", "home", 1, "stageLog.txt", 
		`${["hack.js",
		Math.round(hackDifficulty), 
		startDate.toLocaleTimeString(), 
		Math.floor(delay), 
		//Math.floor(lastFinish), 
		//Math.floor(end - start), 
		Math.floor((end - start) - lastFinish), 
		endDate.toLocaleTimeString(), 
		ns.nFormat(res, "0.00a")].join(",")}\n`);
}