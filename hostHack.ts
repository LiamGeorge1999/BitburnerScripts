import { Util } from "../Utils.js"
import {NS} from "/NetscriptDefinitions"
/** @param {.NS} ns **/
export async function main(ns: NS) {
	var util = new Util(ns);
	ns.disableLog("ALL");
	while (true) {
		var hosts =  ns.getPurchasedServers().concat(ns.args[1] == undefined ? [] : ns.args[1].toString().split("|"));
		var killall = ns.args[2].toString()=="true" ?? hosts.indexOf("home") == -1;
		var target = ns.args[0].toString() ?? util.findOptimalTarget() ?? "joesguns";
		var moneyThresh = ns.getServerMaxMoney(target) * 0.9;
		var securityThresh = ns.getServerMinSecurityLevel(target) + 5;
		//ns.tprint(`Time =  + ${localeHHMMSS()} --- weaken: ${ns.getWeakenTime(target)} grow: ${ns.getGrowTime(target)} hack: ${ns.getHackTime(target)}`);
		var wait = 0;
		if (ns.getServerSecurityLevel(target) > securityThresh) {
			await util.flood("weaken.js", hosts, killall, target, "0", "0");
			wait = ns.getWeakenTime(target)
		} else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
			await util.flood("grow.js", hosts, killall, target, "0", "0");
			wait = ns.getGrowTime(target);
		} else {
			await util.flood("hack.js", hosts, killall, target, "0", "0");
			wait = ns.getHackTime(target)
		}
		ns.print(`waiting for ${Math.floor(wait/3600000)}:${Math.floor((wait%3600000)/60000)}:${Math.round((wait%60000)/1000)} until ${localeHHMMSS(wait)}`)
		await ns.sleep( wait > 5000 ? wait - 4000 : 1000);
	}

}

export function localeHHMMSS(ms = 0, includeMilliseconds = false) {
	var now = new Date().getTime();
	if (!ms) {
		return new Date(now).toLocaleTimeString()
	}
	return new Date(ms + now).toLocaleTimeString() + (includeMilliseconds ? "." + new Date(ms + now).getMilliseconds() : "");
}