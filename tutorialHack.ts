
import {NS} from "../NetscriptDefinitions"
/** @param {NS} ns **/
export async function main(ns: NS) {

	var target = ns.args[0] == undefined ? "joesguns" : ns.args[0].toString();

	// Defines how much money a server should have before we hack it
	// In this case, it is set to 75% of the server's max money
	var moneyThresh = ns.getServerMaxMoney(target) * 0.9;

	// Defines the maximum security level the target server can
	// have. If the target's security level is higher than this,
	// we'll weaken it before doing anything else
	var securityThresh = ns.getServerMinSecurityLevel(target) + 5;
	ns.tprint(`hacking ${target}`)
	// Infinite loop that continously hacks/grows/weakens the target server
	while (true) {
		ns.print("Time: " + localeHHMMSS());
		if (ns.getServerSecurityLevel(target) > securityThresh) {
			// If the server's security level is above our threshold, weaken it
			await ns.weaken(target);
		} else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
			// If the server's money is less than our threshold, grow it
			await ns.grow(target);
		} else {
			// Otherwise, hack it
			await ns.hack(target);
		}
	}
}
/* Returns a string representing the time of day.
 * @param {number} [ms=0]	The number of milliseconds to add to the current time.
 * @returns {String}		A string representing the time of day.
**/
export function localeHHMMSS(ms = 0) {
	var now = new Date().getTime();
	if (!ms) {
		return new Date(now).toLocaleTimeString()
	}
	return new Date(ms + now).toLocaleTimeString()
}