import {NS} from "/NetscriptDefinitions"
/** @param {NS} ns **/
export async function main(ns: NS) {
	var script = ns.args[0];
	var target = ns.args[1];
	var killscripts = (ns.args[2] == "true" || ns.args[1] == undefined);
	if (script == undefined) {
		script = "tutorialHack.js";
	} else {
		script = script.toString();
	}
	if (target == undefined) {
		target = "";
	} else {
		target = target.toString();
	}
	ns.tail();
	for (var hostname of ns.getPurchasedServers()){
		if (killscripts) {
			ns.killall(hostname);
			ns.tprint("killing all processes on "+ hostname);
		}
		ns.print(`spare ram on ${hostname} = ${ns.nFormat(ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)*1000000000, '0.000ib')}`)
		var threads = Math.floor((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname))/ns.getScriptRam(script));
		if (threads) {
			await ns.scp(script, hostname);
			ns.tprint("Executing " + threads + " instances of " + script + " on " + hostname);
			await ns.exec(script, hostname, threads, target);
		}
	}

}