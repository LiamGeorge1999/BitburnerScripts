import { Util } from "Utils.js"
/** @param {import(".").NS} ns **/
export async function main(ns) {
	var util = new Util(ns);
	//ns.atExit((params) => { 
	//	await ns.scp("/utils/cleanSlate.js", ns.getHostname());
	//	ns.exec("/utils/cleanSlate.js", ns.getHostname());
	//});
	ns.rm("Stages.txt");
	ns.disableLog("ALL");
	//findOptimalTarget() is not async
	var target = ns.args[0] || util.findOptimalTarget() || "joesguns";
	var hosts = ns.getPurchasedServers();
	var server = ns.getServer(target);
	ns.rm("Stages.txt");
	await ns.write("Stages.txt", `TARGET: ${server.hostname}\n`);

	ns.clearLog();
	var setupReturn = await setupStaging(ns, server, hosts);
	var lastFinish = setupReturn[2];
	server = setupReturn[1];
	var secondWeakenReturn = [setupReturn[0], Math.ceil((ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target)) / ns.weakenAnalyze(1))];
	var secondWeakenTimeStamp = Date.now();
	ns.print(`target selected: ${target}`);
	while (true) {
		await ns.sleep(10);
		//TODO: Consider that ns.getHackTime() etc. may be running after a hack or grow script and therefore not be for min security
		server = validateServer(ns, server);
		//ns.print(`[WARNING] Hack calc params: Available: $${server.moneyAvailable} / Total: $${server.moneyMax}`)
		ns.print(`[INFO] LOOP: hack - money = ${ns.nFormat(100 * (server.moneyAvailable / server.moneyMax), "0.00")}%`)
		ns.print(`LOOP: hack - minEndWait = ${secondWeakenReturn} - (${Date.now()} - ${secondWeakenTimeStamp}) = ${secondWeakenReturn[0] - (Date.now() - secondWeakenTimeStamp)}`)
		var hackReturn = await stageHack(ns, server, hosts, secondWeakenReturn[0] - (Date.now() - secondWeakenTimeStamp));
		var hacktimeStamp = Date.now();
		server.moneyAvailable -= ns.hackAnalyze(target) * hackReturn[1] * server.moneyAvailable;
		server.hackDifficulty += ns.hackAnalyzeSecurity(hackReturn[1]);
		ns.tprint(`LOOP: Hack finishes in          ${hackReturn[0]}ms at ${localeHHMMSS(hackReturn[0], true)}: hackreturn: [${hackReturn}], money left: ${ns.nFormat(100 * (server.moneyAvailable / server.moneyMax), "0.00")}%, security: ${server.minDifficulty}+${ns.nFormat(server.hackDifficulty - server.minDifficulty, "0.00")}`);
		server = validateServer(ns, server);
		if (hackReturn[1] != 0) { await ns.write("Stages.txt", `${"hack.js"},${hackReturn[1]},${localeHHMMSS(hackReturn[0], true)},${hacktimeStamp + hackReturn[0] - lastFinish},${server.minDifficulty}+${ns.nFormat(server.hackDifficulty - server.minDifficulty, "0.00")},${ns.nFormat(100 * (server.moneyAvailable / server.moneyMax), "0.00")}%\n`); }
		lastFinish = hacktimeStamp + hackReturn[0];

		ns.print(`[INFO] LOOP: Stage weaken 1 - security = ${server.minDifficulty}+${ns.nFormat(server.hackDifficulty - server.minDifficulty, "0.00")}`)
		var firstWeakenReturn = await stageWeaken(ns, server, hosts, hackReturn[0] - (Date.now() - hacktimeStamp));
		var firstWeakenTimeStamp = Date.now();
		server.hackDifficulty -= ns.weakenAnalyze(firstWeakenReturn[1]);
		ns.tprint(`LOOP: First weaken finishes in  ${firstWeakenReturn[0]}ms at ${localeHHMMSS(firstWeakenReturn[0], true)}: firstWeakenReturn: [${firstWeakenReturn}], security: ${server.minDifficulty}+${ns.nFormat(server.hackDifficulty - server.minDifficulty, "0.00")}`);
		server = validateServer(ns, server);
		if (firstWeakenReturn[1] != 0) { await ns.write("Stages.txt", `${"weaken.js"},${firstWeakenReturn[1]},${localeHHMMSS(firstWeakenReturn[0], true)},${firstWeakenTimeStamp + firstWeakenReturn[0] - lastFinish},${server.minDifficulty}+${ns.nFormat(server.hackDifficulty - server.minDifficulty, "0.00")},${ns.nFormat(100 * (server.moneyAvailable / server.moneyMax), "0.00")}%\n`); }
		lastFinish = firstWeakenTimeStamp + firstWeakenReturn[0];

		ns.print(`[INFO] LOOP: Stage grow - money = ${ns.nFormat(100 * (server.moneyAvailable / server.moneyMax), "0.00")}%`)
		var growReturn = await stageGrow(ns, server, hosts, firstWeakenReturn[0] - (Date.now() - firstWeakenTimeStamp));
		var growTimeStamp = Date.now();
		server.moneyAvailable = server.moneyMax;
		server.hackDifficulty += ns.growthAnalyzeSecurity(growReturn[1]);
		ns.tprint(`LOOP: grow finishes in          ${growReturn[0]}ms at ${localeHHMMSS(growReturn[0], true)}: growReturn: [${growReturn}], money: ${ns.nFormat(100 * (server.moneyAvailable / server.moneyMax), "0.00")}%, security: ${server.minDifficulty}+${ns.nFormat(server.hackDifficulty - server.minDifficulty, "0.00")}`);
		server = validateServer(ns, server);
		if (growReturn[1] != 0) { await ns.write("Stages.txt", `${"grow.js"},${growReturn[1]},${localeHHMMSS(growReturn[0], true)},${growTimeStamp + growReturn[0] - lastFinish},${server.minDifficulty}+${ns.nFormat(server.hackDifficulty - server.minDifficulty, "0.00")},${ns.nFormat(100 * (server.moneyAvailable / server.moneyMax), "0.00")}%\n`); }
		lastFinish = growTimeStamp + growReturn[0];

		ns.print(`[INFO] LOOP: Stage weaken 2 - security = ${server.minDifficulty}+${ns.nFormat(server.hackDifficulty - server.minDifficulty, "0.00")}`)
		secondWeakenReturn = await stageWeaken(ns, server, hosts, growReturn[0] - (Date.now() - growTimeStamp));
		secondWeakenTimeStamp = Date.now();
		server.hackDifficulty -= ns.weakenAnalyze(secondWeakenReturn[1]);
		ns.tprint(`LOOP: Second weaken finishes in ${secondWeakenReturn[0]}ms at ${localeHHMMSS(secondWeakenReturn[0], true)}: secondWeakenReturn: [${secondWeakenReturn}], security: ${server.minDifficulty}+${ns.nFormat(server.hackDifficulty - server.minDifficulty, "0.00")}`);
		server = validateServer(ns, server);
		if (secondWeakenReturn[1] != 0) { await ns.write("Stages.txt", `${"weaken.js"},${secondWeakenReturn[1]},${localeHHMMSS(secondWeakenReturn[0], true)},${secondWeakenTimeStamp + secondWeakenReturn[0] - lastFinish},${server.minDifficulty}+${ns.nFormat(server.hackDifficulty - server.minDifficulty, "0.00")},${ns.nFormat(100 * (server.moneyAvailable / server.moneyMax), "0.00")}%\n`); }
		lastFinish = secondWeakenTimeStamp + secondWeakenReturn[0];

		return 0;
	}

	return null;
}
/** Validates server values.
 * @param {import(".").NS} ns 
 * @param {Server} server		The target server.
 * @returns {Server}			The target server, with any impossible values corrected.
**/
export function validateServer(ns, server) {
	server.hackDifficulty = Math.max(server.hackDifficulty, server.minDifficulty);
	server.moneyAvailable = Math.max(server.moneyAvailable, 0);
	server.moneyAvailable = Math.min(server.moneyAvailable, server.moneyMax);
	return server;
}

/** Maxes money and mins security for staging.
 * @param {import(".").NS} ns 
 * @param {Server} server		The target whose security to weaken.
 * @param {String[]} hosts		The servers onwhich to host stages.
 * @returns {[number, Server]}	The minimum wait time of following stages, followed by the server state to result from the setup stages.
**/
export async function setupStaging(ns, server, hosts) {

	for (var host of hosts) {
		await ns.scp(["hack.js", "weaken.js", "grow.js"], "home", host);
	}
	ns.clearLog();
	var lastFinish = 0;
	server = validateServer(ns, server);
	ns.print(`[INFO] SETUP: weaken 1 - security = ${server.minDifficulty}+${ns.nFormat(server.hackDifficulty - server.minDifficulty, "0.00")}`);
	var firstWeakenReturn = await stageWeaken(ns, server, hosts);
	var firstWeakenTimeStamp = Date.now();
	server.hackDifficulty -= ns.weakenAnalyze(firstWeakenReturn[1]);
	ns.tprint(`SETUP: First weaken finishes in ${firstWeakenReturn[0]}ms`)
	server = validateServer(ns, server);
	if (firstWeakenReturn[1] != 0) { await ns.write("Stages.txt", `${"weaken.js"},${firstWeakenReturn[1]},${localeHHMMSS(firstWeakenReturn[0], true)},${firstWeakenReturn[0]},${server.minDifficulty}+${ns.nFormat(server.hackDifficulty - server.minDifficulty, "0.00")},${ns.nFormat(100 * (server.moneyAvailable / server.moneyMax), "0.00")}%\n`); }
	lastFinish = firstWeakenTimeStamp + firstWeakenReturn[0];

	ns.print(`[INFO] SETUP: grow - money = ${ns.nFormat(100 * (server.moneyAvailable / server.moneyMax), "0.00")}%`)
	var growReturn = await stageGrow(ns, server, hosts, firstWeakenReturn[0]);
	var growTimeStamp = Date.now();
	server.moneyAvailable = server.moneyMax;
	server.hackDifficulty += ns.growthAnalyzeSecurity(growReturn[1]);
	ns.tprint(`SETUP: grow finishes in         ${growReturn[0]}ms`)
	server = validateServer(ns, server);
	if (growReturn[1] != 0) { await ns.write("Stages.txt", `${"grow.js"},${growReturn[1]},${localeHHMMSS(growReturn[0], true)},${growTimeStamp + growReturn[0] - lastFinish},${server.minDifficulty}+${ns.nFormat(server.hackDifficulty - server.minDifficulty, "0.00")},${ns.nFormat(100 * (server.moneyAvailable / server.moneyMax), "0.00")}%\n`); }
	lastFinish = growTimeStamp + growReturn[0];

	ns.print(`[INFO] SETUP: weaken 2 - security = ${server.minDifficulty}+${ns.nFormat(server.hackDifficulty - server.minDifficulty, "0.00")}`)
	var secondWeakenReturn = await stageWeaken(ns, server, hosts, growReturn[0]);
	var secondWeakenTimeStamp = Date.now();
	server.hackDifficulty -= ns.weakenAnalyze(secondWeakenReturn[1]);
	ns.tprint(`SETUP: Second weaken finishes in ${secondWeakenReturn[0]}ms`)
	server = validateServer(ns, server);
	if (secondWeakenReturn[1] != 0) { await ns.write("Stages.txt", `${"weaken.js"},${secondWeakenReturn[1]},${localeHHMMSS(secondWeakenReturn[0], true)},${secondWeakenTimeStamp + secondWeakenReturn[0] - lastFinish},${server.minDifficulty}+${ns.nFormat(server.hackDifficulty - server.minDifficulty, "0.00")},${ns.nFormat(100 * (server.moneyAvailable / server.moneyMax), "0.00")}%\n`); }
	lastFinish = secondWeakenTimeStamp + secondWeakenReturn[0];

	return [(Math.max(firstWeakenReturn[0] ?? 0, growReturn[0] ?? 0, secondWeakenReturn[0] ?? 0, 10)), server, lastFinish];
}


/** Stage a weaken run.
 * @param {import(".").NS} ns 
 * @param {Server} server	The target whose security to weaken.
 * @param {String[]} hosts			The servers onwhich to host stages.
 * @param {number} [minimumEndWait]	The minimum time before the stage is allowed to end.
 * @returns {number[]}				An array containing the number of milliseconds until the stage finishes, followed by the number of threads used.
**/
export async function stageWeaken(ns, server, hosts, minimumEndWait = 0) {
	var threads = Math.ceil((server.hackDifficulty - server.minDifficulty) / ns.weakenAnalyze(1));
	if (threads == 0) {
		ns.print(`No threads needed, security already at minimum.`);
		return [0, 0];
	}
	var duration = ns.getWeakenTime(server.hostname);
	if (ns.fileExists("Formulas.exe")) {
		duration = ns.formulas.hacking.weakenTime(server, ns.getPlayer());
		ns.print(`weaken duration = ${duration / 1000}s`)
	}
	var waitDifference = Math.max(0, 200 + minimumEndWait - duration);
	ns.print(`waitDifference: ${waitDifference}`);
	ns.print(`Weakening ${server.hostname} for ${duration / 1000}s after ${minimumEndWait / 1000}s for total of ${duration + minimumEndWait}s with ${threads} threads.`);

	while (!stage(ns, "weaken.js", hosts, server.hostname, threads, waitDifference)) {
		ns.print(`Not enough threads available, stage abandoned for re-attempt in 10 seconds.`)
		await ns.sleep(10000);
	}
	var endWait = duration + Math.max(waitDifference, 20);
	ns.print(`EndWait return: ${endWait}`);
	return [endWait, threads];
}

/** Stage a grow run.
 * @param {import(".").NS} ns 
 * @param {Server} server	The target whose security to weaken.
 * @param {String[]} hosts			The servers onwhich to host stages.
 * @param {number} [minimumEndWait]	The minimum time before the stage is allowed to end.
 * @returns {number[]}				An array containing the number of milliseconds until the stage finishes, followed by the number of threads used.
**/
export async function stageGrow(ns, server, hosts, minimumEndWait = 0) {
	var threads = Math.ceil(ns.growthAnalyze(server.hostname, server.moneyMax / (server.moneyAvailable || 1)));
	if (threads == 0) {
		ns.print(`No threads needed, money already at maximum.`);
		return [0, 0];
	}
	var duration = ns.getGrowTime(server.hostname);
	if (ns.fileExists("Formulas.exe")) {
		duration = ns.formulas.hacking.growTime(server, ns.getPlayer());
		ns.print(`grow duration = ${duration / 1000}s`)
	}
	var waitDifference = Math.max(0, 200 + minimumEndWait - duration);
	ns.print(`waitDifference: ${waitDifference}`);
	ns.print(`Growing ${server.hostname} for ${duration / 1000}s after ${minimumEndWait / 1000}s with ${threads} threads.`);

	while (!stage(ns, "grow.js", hosts, server.hostname, threads, waitDifference)) {
		ns.print(`Not enough threads available, stage abandoned for re-attempt in 10 seconds.`)
		await ns.sleep(10000);
	}
	var endWait = duration + Math.max(waitDifference, 20);
	ns.print(`EndWait return: ${endWait}`);
	return [endWait, threads];
}

/** Stage a hack run.
 * @param {import(".").NS} ns 
 * @param {Server} server	The target whose security to weaken.
 * @param {String[]} hosts			The servers onwhich to host stages.
 * @param {number} [minimumEndWait]	The minimum time before the stage is allowed to end.
 * @returns {number[]}				An array containing the number of milliseconds until the stage finishes, followed by the number of threads used.
**/
export async function stageHack(ns, server, hosts, minimumEndWait = 0) {
	ns.print(`hackthread calc vals: hostname: ${server.hostname}, security: ${server.hackDifficulty}, money to max: $${server.moneyMax - server.moneyAvailable}`)
	var threads = Math.ceil(hackAnalyzeThreads(ns, server, Math.floor(server.moneyAvailable / 2)));
	if (threads == 0) {
		ns.print(`No threads needed, money already at or below 50%`);
		return [0, 0];
	}
	if (threads == -1) {
		ns.print(`[ERROR] hackAnalyzeThreads handed an amount of money less than 0 or greater than available: avaiable: ${ns.nFormat(server.moneyAvailable, "0.00a")} / ${ns.nFormat(server.moneyMax, "0.00a")} serverdetails: name: ${server.hostname}, getServer: ${ns.getServer(server.hostname)}`);
		return [0, 0];
	}
	var duration = ns.getHackTime(server.hostname);
	if (ns.fileExists("Formulas.exe")) {
		duration = ns.formulas.hacking.hackTime(server, ns.getPlayer());
		ns.print(`hack duration = ${duration / 1000}s`)
	}
	var waitDifference = Math.max(0, 200 + minimumEndWait - duration);
	ns.print(`waitDifference: ${waitDifference}`);
	ns.print(`Hacking ${server.hostname} for ${duration / 1000}s after ${minimumEndWait / 1000}s with ${threads} threads.`);

	while (!stage(ns, "hack.js", hosts, server.hostname, threads, waitDifference)) {
		ns.print(`Not enough threads available, stage abandoned for re-attempt in 10 seconds.`)
		await ns.sleep(10000);
	}
	var endWait = duration + Math.max(waitDifference, 20);
	ns.print(`EndWait return: ${endWait}`);
	return [endWait, threads];
}

/** Stage a Hack, Grow or Weaken run. Assumes the first arg handed to the script will be interpreted as a waiting period before starting the hack/weaken/grow command.
 * @param {import(".").NS} ns 
 * @param {String} script	The script to stage.
 * @param {String[]} hosts	The servers onwhich to host stages.
 * @param {String} target	The target whose money to hack.
 * @param {String} threads	The threads required to meet the desired result.
 * @param {number} wait		The minimum time before the stage is allowed to end.
 * @returns {Boolean}		Whether the stage was successfully set up.
**/
export function stage(ns, script, hosts, target, threads, wait) {
	ns.print(`staging ${script} against ${target}, on ${hosts.length} hosts, with a target of ${threads} threads and an initial wait of ${wait / 1000}s.`)
	var totalThreads = 0;
	var serverThreads = [];
	for (var host of hosts) {
		var threadCount = Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / ns.getScriptRam(script, "home"));
		serverThreads.push([host, threadCount]);
		totalThreads += threadCount;
		//ns.print(`Threads available on ${host} = ${threadCount}`);
	}
	//ns.print(`total threads available for ${script} = ${totalThreads}`)
	if (totalThreads > threads) {
		for (var serverThread of serverThreads) {
			if (serverThread[1] > 0) {
				var instanceThreads = Math.min(serverThread[1], threads);
				//ns.print(`Attempting to host ${script} on ${serverThread[0]} with ${instanceThreads} threads as a min of [${serverThread[1]}, ${threads}].`)
				ns.exec(script, serverThread[0], instanceThreads, target, wait);
				threads -= instanceThreads;
			} //else { ns.print(`No threads left on ${serverThread[0]}`) }
			if (threads < 1) {
				ns.print(`Stage built, threadcount achieved.`)
				return true;
			}
		}
	} else {
		return false;
	}

}

/* Returns a string representing the time of day.
 * @param {number} [ms=0]	The number of milliseconds to add to the current time.
 * @returns {String}		A string representing the time of day.
**/
export function localeHHMMSS(ms = 0, includeMilliseconds = false) {
	var now = new Date().getTime();
	if (!ms) {
		return new Date(now).toLocaleTimeString()
	}
	return new Date(ms + now).toLocaleTimeString() + (includeMilliseconds ? "." + new Date(ms + now).getMilliseconds() : "");
}

/** Finds the threads needed to hack a given amount of a server's money.
 * @param {import(".").NS} ns 
 * @param {Server} server			The server to be hacked.
 * @param {number} hackAmount		The amount of money to be hacked.
 * @returns {number}				Threads required to hack hackAmount from server.
**/
export function hackAnalyzeThreads(ns, server, hackAmount) {

	// Check argument validity
	if (server.hostname == undefined) {
		ns.print("[ERROR] Cannot be executed on this server.");
		return -1;
	}
	if (isNaN(hackAmount)) {
		ns.print("[ERROR] Invalid hackAmount argument passed into hackAnalyzeThreads: ${hackAmount}. Must be numeric.");
	}

	if (hackAmount < 0 || hackAmount > server.moneyAvailable) {
		return -1;
	} else if (hackAmount === 0) {
		return 0;
	}
	const percentHacked = calculatePercentMoneyHacked(server, ns.getPlayer());

	return hackAmount / Math.floor(server.moneyAvailable * percentHacked);
}


export function calculatePercentMoneyHacked(server, player) {
	// Adjust if needed for balancing. This is the divisor for the final calculation
	const balanceFactor = 240;

	const difficultyMult = (100 - server.hackDifficulty) / 100;
	const skillMult = (player.hacking - (server.requiredHackingSkill - 1)) / player.hacking;
	const percentMoneyHacked = (difficultyMult * skillMult * player.hacking_money_mult) / balanceFactor;
	if (percentMoneyHacked < 0) {
		return 0;
	}
	if (percentMoneyHacked > 1) {
		return 1;
	}

	return percentMoneyHacked;
}
