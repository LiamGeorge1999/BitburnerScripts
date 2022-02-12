import { Util } from "Utils.js"
/** @param {NS} ns **/
export async function main(ns) {
	var util = new Util(ns);

	while (true) {
		var hosts = ns.getPurchasedServers();
		var date = Date.now()
		var target = ns.args[0] || util.findOptimalTarget() || "joesguns";

		var moneyThresh = ns.getServerMaxMoney(target) * 0.9;
		var securityThresh = ns.getServerMinSecurityLevel(target) + 5;
		//ns.tprint(`Time =  + ${localeHHMMSS()} --- weaken: ${ns.getWeakenTime(target)} grow: ${ns.getGrowTime(target)} hack: ${ns.getHackTime(target)}`);
		var wait = 0;
		if (ns.getServerSecurityLevel(target) > securityThresh) {
			await util.flood("weaken.js", hosts, true, target);
			wait = ns.getWeakenTime(target)
		} else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
			await util.flood("grow.js", hosts, true, target);
			wait = ns.getGrowTime(target);
		} else {
			await util.flood("hack.js", hosts, true, target);
			wait = ns.getHackTime(target)
		}
		//ns.tprint(`waiting until ${localeHHMMSS(wait)}`)
		await ns.sleep(wait || 1000);
	}

}

export function localeHHMMSS(ms = 0) {
	return new Date(ms || new Date().getTime()).toLocaleTimeString()
}