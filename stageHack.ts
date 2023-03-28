import { Util } from "./Utils"
import { NS, Player, Server } from "../NetscriptDefinitions";
/** @param {.NS} ns **/

export class StageInfo {
	public endWait: number;
	public threads: number;

	constructor(endWait: number, threads: number) {
		this.endWait = endWait;
		this.threads = threads;
	}
}
var minDelay = 200;
export async function main(ns: NS) {
	var util = new Util(ns);
	//ns.atExit((params) => { 
	//	await ns.scp("/utils/cleanSlate.js", ns.getHostname());
	//	ns.exec("/utils/cleanSlate.js", ns.getHostname());
	//});
	ns.disableLog("ALL");
	ns.run("StageLogReader.js");
	ns.tail("StageLogReader.js");
	ns.run("hackMonitor.js");
	ns.tail("hackMonitor.js");
	//findOptimalTarget() is not async
	var target: string = ns.args[0]?.toString() || util.findOptimalTarget() || "joesguns";
	var hosts = ns.scan("home").filter((serverName) => { return serverName.includes("hacknet-server-") });
	var server: Server = ns.getServer(target);
	ns.rm("Stages.txt");
	ns.rm("stageLog.txt");
	await ns.write("Stages.txt", `TARGET: ${server.hostname} - MAX MONEY: ${ns.formatNumber(server.moneyMax)}\n`);
	ns.clearLog();
	var setupReturn = await setupStaging(ns, server, hosts);
	var lastFinish = setupReturn.lastFinish;
	server = setupReturn.server;
	var prevServer;
	var secondWeakenReturn: StageInfo = new StageInfo(setupReturn.wait, Math.ceil((ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target)) / ns.weakenAnalyze(1)));
	var secondWeakenTimeStamp = Date.now();
	ns.print(`target selected: ${target}`);
	var loops = 0;
	while (true) {
		await ns.sleep(10);
		//TODO: Consider that ns.getHackTime() etc. may be running after a hack or grow script and therefore not be for min security
		server = validateServer(ns, server);
		//ns.print(`[WARNING] Hack calc params: Available: $${server.moneyAvailable} / Total: $${server.moneyMax}`)
		ns.print(`[INFO] LOOP: hack - money = ${ns.nFormat(100 * (server.moneyAvailable / server.moneyMax), "0.00")}%`)
		prevServer = { ...server };
		ns.print(`LOOP: hack - minEndWait = ${secondWeakenReturn} - (${Date.now()} - ${secondWeakenTimeStamp}) = ${secondWeakenReturn.endWait - (Date.now() - secondWeakenTimeStamp)}`)
		var hackReturn: StageInfo = await stageHack(ns, { ...server }, hosts, secondWeakenReturn.endWait - (Date.now() - secondWeakenTimeStamp));
		var hacktimeStamp = Date.now();
		server.moneyAvailable -= ns.hackAnalyze(target) * hackReturn.threads * server.moneyAvailable;
		server.hackDifficulty += ns.hackAnalyzeSecurity(hackReturn.threads);
		ns.print(`LOOP: Hack finishes in          ${hackReturn.endWait}ms at ${localeHHMMSS(hackReturn.endWait, true)}: hackreturn: [${hackReturn}], money left: ${ns.nFormat(100 * (server.moneyAvailable / server.moneyMax), "0.00")}%, security: ${server.minDifficulty}+${ns.nFormat(server.hackDifficulty - server.minDifficulty, "0.00")}`);
		server = validateServer(ns, server);
		if (hackReturn.threads != 0) { await logStage(ns, "hack.js", hackReturn, hacktimeStamp, lastFinish, prevServer, server); }
		lastFinish = hacktimeStamp + hackReturn.endWait;

		ns.print(`[INFO] LOOP: Stage weaken 1 - security = ${server.minDifficulty}+${ns.nFormat(server.hackDifficulty - server.minDifficulty, "0.00")}`)
		prevServer = { ...server };
		var firstWeakenReturn: StageInfo = await stageWeaken(ns, { ...server }, hosts, hackReturn.endWait - (Date.now() - hacktimeStamp));
		var firstWeakenTimeStamp = Date.now();
		server.hackDifficulty -= ns.weakenAnalyze(firstWeakenReturn.threads);
		ns.print(`LOOP: First weaken finishes in  ${firstWeakenReturn.endWait}ms at ${localeHHMMSS(firstWeakenReturn.endWait, true)}: firstWeakenReturn: [${firstWeakenReturn}], security: ${server.minDifficulty}+${ns.nFormat(server.hackDifficulty - server.minDifficulty, "0.00")}`);
		server = validateServer(ns, server);
		if (firstWeakenReturn.threads != 0) { await logStage(ns, "weaken.js", firstWeakenReturn, firstWeakenTimeStamp, lastFinish, prevServer, server); }
		lastFinish = firstWeakenTimeStamp + firstWeakenReturn.endWait;

		ns.print(`[INFO] LOOP: Stage grow - money = ${ns.nFormat(100 * (server.moneyAvailable / server.moneyMax), "0.00")}%`)
		prevServer = { ...server };
		var growReturn: StageInfo = await stageGrow(ns, { ...server }, hosts, firstWeakenReturn.endWait - (Date.now() - firstWeakenTimeStamp));
		var growTimeStamp = Date.now();
		server.moneyAvailable = server.moneyMax;
		server.hackDifficulty += ns.growthAnalyzeSecurity(growReturn.threads);
		ns.print(`LOOP: grow finishes in          ${growReturn.endWait}ms at ${localeHHMMSS(growReturn.endWait, true)}: growReturn: [${growReturn}], money: ${ns.nFormat(100 * (server.moneyAvailable / server.moneyMax), "0.00")}%, security: ${server.minDifficulty}+${ns.nFormat(server.hackDifficulty - server.minDifficulty, "0.00")}`);
		server = validateServer(ns, server);
		if (growReturn.threads != 0) { await logStage(ns, "grow.js", growReturn, growTimeStamp, lastFinish, prevServer, server); }
		lastFinish = growTimeStamp + growReturn.endWait;

		ns.print(`[INFO] LOOP: Stage weaken 2 - security = ${server.minDifficulty}+${ns.nFormat(server.hackDifficulty - server.minDifficulty, "0.00")}`)
		prevServer = { ...server };
		secondWeakenReturn = await stageWeaken(ns, { ...server }, hosts, growReturn.endWait - (Date.now() - growTimeStamp));
		secondWeakenTimeStamp = Date.now();
		server.hackDifficulty -= ns.weakenAnalyze(secondWeakenReturn.threads);
		ns.print(`LOOP: Second weaken finishes in ${secondWeakenReturn.endWait}ms at ${localeHHMMSS(secondWeakenReturn.endWait, true)}: secondWeakenReturn: [${secondWeakenReturn}], security: ${server.minDifficulty}+${ns.nFormat(server.hackDifficulty - server.minDifficulty, "0.00")}`);
		server = validateServer(ns, server);
		if (secondWeakenReturn.threads != 0) { await logStage(ns, "weaken.js",secondWeakenReturn, secondWeakenTimeStamp, lastFinish, prevServer, server); }
		lastFinish = secondWeakenTimeStamp + secondWeakenReturn.endWait;
		loops++;
		if (loops>=10 && false) {
			return 0;
		}
	}

	return null;
}

/** Validates server values.
 * @param {.NS} ns 
 * @param {Server} server		The target server.
 * @returns {Server}			The target server, with any impossible values corrected.
**/
export function validateServer(ns: NS, server: Server): Server {
	server.hackDifficulty = Math.max(server.hackDifficulty, server.minDifficulty);
	server.moneyAvailable = Math.max(server.moneyAvailable, 0);
	server.moneyAvailable = Math.min(server.moneyAvailable, server.moneyMax);
	return server;
}

/** Maxes money and mins security for staging.
 * @param {.NS} ns 
 * @param {Server} server		The target whose security to weaken.
 * @param {string[]} hosts		The servers onwhich to host stages.
 * @returns {[number, Server]}	The minimum wait time of following stages, followed by the server state to result from the setup stages.
**/
export async function setupStaging(ns: NS, server: Server, hosts: string[]): Promise<{wait: number, server: Server, lastFinish: number}> {

	for (var host of hosts) {
		await ns.scp(["hack.js", "weaken.js", "grow.js"], "home", host);
	}
	ns.clearLog();
	var lastFinish = new Date().getTime();
	server = validateServer(ns, server);
	var prevServer;

	ns.print(`[INFO] SETUP: weaken 1 - security = ${server.minDifficulty}+${ns.nFormat(server.hackDifficulty - server.minDifficulty, "0.00")}`);
	prevServer = { ...server };
	var firstWeakenReturn = await stageWeaken(ns, { ...server }, hosts, 0, true);
	var firstWeakenTimeStamp = Date.now();
	server.hackDifficulty -= ns.weakenAnalyze(firstWeakenReturn.threads);
	ns.print(`SETUP: First weaken finishes in ${firstWeakenReturn.endWait}ms`)
	server = validateServer(ns, server);
	if (firstWeakenReturn.threads != 0) { await logStage(ns, "weaken.js", firstWeakenReturn, firstWeakenTimeStamp, lastFinish, prevServer, server); }
	lastFinish = firstWeakenTimeStamp + firstWeakenReturn.endWait;
	await ns.sleep(firstWeakenReturn.endWait);

	ns.print(`[INFO] SETUP: grow - money = ${ns.nFormat(100 * (server.moneyAvailable / server.moneyMax), "0.00")}%`)
	prevServer = { ...server };
	var growReturn = await stageGrow(ns, { ...server }, hosts, firstWeakenReturn.endWait, true);
	var growTimeStamp = Date.now();
	server.moneyAvailable = server.moneyMax;
	server.hackDifficulty += ns.growthAnalyzeSecurity(growReturn.threads);
	ns.print(`SETUP: grow finishes in         ${growReturn.endWait}ms`)
	server = validateServer(ns, server);
	if (growReturn.threads != 0) { await logStage(ns, "grow.js", growReturn, growTimeStamp, lastFinish, prevServer, server); }
	lastFinish = growTimeStamp + growReturn.endWait;
	await ns.sleep(growReturn.endWait);

	ns.print(`[INFO] SETUP: weaken 2 - security = ${server.minDifficulty}+${ns.nFormat(server.hackDifficulty - server.minDifficulty, "0.00")}`)
	prevServer = { ...server };
	var secondWeakenReturn = await stageWeaken(ns, { ...server }, hosts, growReturn.endWait, true);
	var secondWeakenTimeStamp = Date.now();
	server.hackDifficulty -= ns.weakenAnalyze(secondWeakenReturn.threads);
	ns.print(`SETUP: Second weaken finishes in ${secondWeakenReturn.endWait}ms`)
	server = validateServer(ns, server);
	if (secondWeakenReturn.threads != 0) { await logStage(ns, "weaken.js", secondWeakenReturn, secondWeakenTimeStamp, lastFinish, prevServer, server); }
	lastFinish = secondWeakenTimeStamp + secondWeakenReturn.endWait;
	await ns.sleep(secondWeakenReturn.endWait);

	return {wait: 0, server, lastFinish};
}


/** Stage a weaken run.
 * @param {.NS} ns 
 * @param {Server} server	The target whose security to weaken.
 * @param {string[]} hosts			The servers onwhich to host stages.
 * @param {number} [minimumEndWait]	The minimum time before the stage is allowed to end.
 * @returns {number[]}				An array containing the number of milliseconds until the stage finishes, followed by the number of threads used.
**/
export async function stageWeaken(ns: NS, server: Server, hosts: string[], minimumEndWait: number = 0, setup: boolean = false): Promise<StageInfo> {
	var threads = Math.ceil((server.hackDifficulty - server.minDifficulty) / ns.weakenAnalyze(1));
	if (threads == 0) {
		ns.print(`No threads needed, security already at minimum.`);
		return {endWait: 0, threads: 0};
	}
	var duration = ns.getWeakenTime(server.hostname);
	if (ns.fileExists("Formulas.exe")) {
		var tempServer = { ...server };
		if (!setup) { tempServer.hackDifficulty = tempServer.minDifficulty };
		duration = ns.formulas.hacking.weakenTime(tempServer, ns.getPlayer());
		ns.print(`weaken duration = ${duration / 1000}s`)
	}
	var waitDifference = Math.max(0, 200 + minimumEndWait - duration);
	ns.print(`waitDifference: ${waitDifference}`);
	ns.print(`Weakening ${server.hostname} for ${duration / 1000}s after ${minimumEndWait / 1000}s for total of ${(duration + minimumEndWait)/1000}s with ${threads} threads.`);

	while (!stage(ns, "weaken.js", hosts, server.hostname, threads, waitDifference, duration)) {
		ns.print(`Not enough threads available, stage abandoned for re-attempt in 10 seconds.`)
		await ns.sleep(10000);
	}
	var endWait = duration + Math.max(waitDifference, 20);
	ns.print(`EndWait return: ${endWait}`);
	return {endWait, threads};
}

/** Stage a grow run.
 * @param {.NS} ns 
 * @param {Server} server	The target whose security to weaken.
 * @param {string[]} hosts			The servers onwhich to host stages.
 * @param {number} [minimumEndWait]	The minimum time before the stage is allowed to end.
 * @returns {number[]}				An array containing the number of milliseconds until the stage finishes, followed by the number of threads used.
**/
export async function stageGrow(ns: NS, server: Server, hosts: string[], minimumEndWait: number = 0, setup: boolean = false): Promise<StageInfo> {
	var threads = Math.ceil(ns.growthAnalyze(server.hostname, server.moneyMax / (server.moneyAvailable || 1)));
	if (threads == 0) {
		ns.print(`No threads needed, money already at maximum.`);
		return {endWait: 0, threads: 0};
	}
	var duration = ns.getGrowTime(server.hostname);
	if (ns.fileExists("Formulas.exe")) {
		var tempServer = { ...server };
		if (!setup) { tempServer.hackDifficulty = tempServer.minDifficulty };
		duration = ns.formulas.hacking.growTime(tempServer, ns.getPlayer());
		ns.print(`grow duration = ${duration / 1000}s`)
	}
	var waitDifference = Math.max(0, 200 + minimumEndWait - duration);
	ns.print(`waitDifference: ${waitDifference}`);
	ns.print(`Growing ${server.hostname} for ${duration / 1000}s after ${minimumEndWait / 1000}s with ${threads} threads.`);

	while (!stage(ns, "grow.js", hosts, server.hostname, threads, waitDifference, duration)) {
		ns.print(`Not enough threads available, stage abandoned for re-attempt in 10 seconds.`)
		await ns.sleep(10000);
	}
	var endWait = duration + Math.max(waitDifference, 20);
	ns.print(`EndWait return: ${endWait}`);
	return {endWait, threads};
}

/** Stage a hack run.
 * @param {.NS} ns 
 * @param {Server} server	The target whose security to weaken.
 * @param {string[]} hosts			The servers onwhich to host stages.
 * @param {number} [minimumEndWait]	The minimum time before the stage is allowed to end.
 * @returns {number[]}				An array containing the number of milliseconds until the stage finishes, followed by the number of threads used.
**/
export async function stageHack(ns: NS, server: Server, hosts: string[], minimumEndWait: number = 0, setup: boolean = false): Promise<StageInfo> {
	ns.print(`hackthread calc vals: hostname: ${server.hostname}, security: ${server.hackDifficulty}, money to max: $${server.moneyMax - server.moneyAvailable}`)
	var threads = Math.ceil(hackAnalyzeThreads(ns, server, Math.floor(server.moneyAvailable / 2)));
	if (threads == 0) {
		ns.print(`No threads needed, money already at or below 50%`);
		return {endWait: 0, threads: 0};
	}
	if (threads == -1) {
		ns.print(`[ERROR] hackAnalyzeThreads handed an amount of money less than 0 or greater than available: avaiable: ${ns.nFormat(server.moneyAvailable, "0.00a")} / ${ns.nFormat(server.moneyMax, "0.00a")} serverdetails: name: ${server.hostname}, getServer: ${ns.getServer(server.hostname)}`);
		return {endWait: 0, threads: 0};
	}
	//Magic number 590?
	var duration = ns.getHackTime(server.hostname);
	if (ns.fileExists("Formulas.exe")) {
		var tempServer = { ...server };
		if (!setup) { tempServer.hackDifficulty = tempServer.minDifficulty };
		duration = ns.formulas.hacking.hackTime(tempServer, ns.getPlayer());
		ns.print(`hack duration = ${duration / 1000}s`)
	}
	var waitDifference = Math.max(0, 200 + minimumEndWait - duration);
	ns.print(`waitDifference: ${waitDifference}`);
	ns.print(`Hacking ${server.hostname} for ${duration / 1000}s after ${minimumEndWait / 1000}s with ${threads} threads.`);

	while (!stage(ns, "hack.js", hosts, server.hostname, threads, waitDifference, duration)) {
		ns.print(`Not enough threads available, stage abandoned for re-attempt in 10 seconds.`);
		await ns.sleep(10000);
	}
	var endWait = duration + Math.max(waitDifference, 20);
	ns.print(`EndWait return: ${endWait}`);
	return {endWait, threads};
}

/** Stage a Hack, Grow or Weaken run. Assumes the first arg handed to the script will be interpreted as a waiting period before starting the hack/weaken/grow command.
 * @param {.NS} ns 
 * @param {string} script		The script to stage.
 * @param {string[]} hosts		The servers onwhich to host stages.
 * @param {string} target		The target whose money to hack.
 * @param {number} threads		The threads required to meet the desired result.
 * @param {number} wait			The minimum time before the stage is allowed to end.
 * @param {number} duration		The (predicted) time taken by the nominal function in the script.
 * @returns {Boolean}			Whether the stage was successfully set up.
**/
export function stage(ns: NS, script: string, hosts: string[], target: string, threads: number, wait: number, duration: number): boolean {
	ns.print(`staging ${script} against ${target}, on ${hosts.length} hosts, with a target of ${threads} threads and an initial wait of ${wait / 1000}s.`)
	let isWeaken = script == "Weaken.js";
	var totalThreads = 0;
	var serverThreads: {host: string, threadCount: number}[] = [];
	for (var host of hosts) {
		var threadCount = Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / ns.getScriptRam(script, "home"));
		serverThreads.push({host, threadCount});
		totalThreads += threadCount;
		//ns.print(`Threads available on ${host} = ${threadCount}`);
	}
	//ns.print(`total threads available for ${script} = ${totalThreads}`)
	if (totalThreads > threads && isWeaken) {
		for (var serverThread of serverThreads) {
			if (serverThread.threadCount > 0) {
				var instanceThreads = Math.min(serverThread.threadCount, threads);
				//ns.print(`Attempting to host ${script} on ${serverThread.host} with ${instanceThreads} threads as a min of [${serverThread.threadCount}, ${threads}].`);
				if (!ns.fileExists(script, serverThread.host)) ns.scp(script, serverThread.host);
				ns.exec(script, serverThread.host, instanceThreads, target, wait, duration);
				threads -= instanceThreads;
			} //else { ns.print(`No threads left on ${serverThread.host}`) }
			if (threads < 1) {
				//ns.print(`Stage built, threadcount achieved.`)
				return true;
			}
		}
	}
	else if (!isWeaken) {
		for (var serverThread of serverThreads) {
			if (serverThread.threadCount>threads) {
				if (!ns.fileExists(script, serverThread.host)) ns.scp(script, serverThread.host);
				ns.exec(script, serverThread.host, threads, target, wait, duration);
				ns.print(`Stage built, threadcount achieved.`)
				return true;
			}
		}
	
	}
		return false;
}

/* Returns a string representing the time of day.
 * @param {number} [ms=0]	The number of milliseconds to add to the current time.
 * @returns {String}		A string representing the time of day.
**/
export function localeHHMMSS(ms = 0, includeMilliseconds = false): string {
	var now = new Date().getTime();
	if (!ms) {
		return new Date(now).toLocaleTimeString()
	}
	return new Date(ms + now).toLocaleTimeString() + (includeMilliseconds ? "." + new Date(ms + now).getMilliseconds() : "");
}

/** Finds the threads needed to hack a given amount of a server's money.
 * @param {.NS} ns 
 * @param {Server} server			The server to be hacked.
 * @param {number} hackAmount		The amount of money to be hacked.
 * @returns {number}				Threads required to hack hackAmount from server.
**/
export function hackAnalyzeThreads(ns: NS, server: Server, hackAmount: number): number {

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


export function calculatePercentMoneyHacked(server: Server, player: Player): number {
	// Adjust if needed for balancing. This is the divisor for the final calculation
	const balanceFactor = 240;

	const difficultyMult = (100 - server.hackDifficulty) / 100;
	const skillMult = (player.skills.hacking - (server.requiredHackingSkill - 1)) / player.skills.hacking;
	const percentMoneyHacked = (difficultyMult * skillMult * player.mults.hacking_money) / balanceFactor;
	if (percentMoneyHacked < 0) {
		return 0;
	}
	if (percentMoneyHacked > 1) {
		return 1;
	}

	return percentMoneyHacked;
}


/** Wrapper function for ns.write to more easily determine parameters.
 * @param {.NS} ns 
 * @param {String} script			The script staged.
 * @param {number[]} lastReturn		The return of the previous staging function, depicting [duration, threads].
 * @param {number} lastTimeStamp	The time at which the staging process for this stage began.
 * @param {number} lastFinish		The time the previous stage will finish.
 * @param {Server} prevServer		The server before being hacked.
 * @param {Server} server			The server after being hacked.
 * @returns {number}				Threads required to hack hackAmount from server.
**/
export async function logStage(ns: NS, script: string, lastReturn: {endWait: number, threads: number}, lastTimeStamp: number, lastFinish: number, prevServer: Server, server: Server) {
	await ns.write("Stages.txt",[
									script,
									lastReturn.threads.toString(),
									localeHHMMSS(lastReturn.endWait, true),
									ns.formatNumber(Math.round(lastTimeStamp + lastReturn.endWait - lastFinish)),
									`${prevServer.minDifficulty}+${ns.formatNumber(prevServer.hackDifficulty-prevServer.minDifficulty)}`,
									`${server.minDifficulty}+${ns.formatNumber(server.hackDifficulty-server.minDifficulty)}`,
									ns.formatNumber((prevServer.moneyAvailable / prevServer.moneyMax)),
									ns.formatNumber((server.moneyAvailable / server.moneyMax))
								].join(",") + "\n");
}