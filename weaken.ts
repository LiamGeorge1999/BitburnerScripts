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
	await ns.sleep(delay || 20);
	let hackDifficulty = ns.getServerSecurityLevel(serverName);
	let startDate = new Date();
	let res = await ns.weaken(serverName);
	let endDate = new Date();
	//ns.tprint(`weakened ${serverName} by ${res}`);
	let start = startDate.valueOf();
	let end = endDate.valueOf();
	if (delay && lastFinish) {
		ns.exec("logWriter.js", "home", 1, "stageLog.txt",
			`${["weaken.js",
			Math.round(hackDifficulty), 
			startDate.toLocaleTimeString() + `.${startDate.getMilliseconds()}`, 
			Math.floor(delay), 
			//Math.floor(lastFinish), 
			//Math.floor((end - start)), 
			Math.floor((end - start) - lastFinish), 
			endDate.toLocaleTimeString() + `.${endDate.getMilliseconds()}`, 
			ns.nFormat(res, "0.00")].join(",")}\n`);
	}
}