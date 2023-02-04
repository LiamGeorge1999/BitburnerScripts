/** @param {NS} ns **/
import {NS} from "/NetscriptDefinitions"

export async function main(ns: NS) {
	ns.disableLog("sleep");
	while (true) {
		ns.clearLog()
		ns.print(localeHHMMSS());
		//ns.print(localeHHMMSS(3600000))
		await ns.sleep(50)
	}
}

/* Returns a string representing the time of day.
 * @param {number} [ms=0]	The number of milliseconds to add to the current time.
 * @returns {String}		A string representing the time of day.
**/
export function localeHHMMSS(ms: number = 0) {
	var now = new Date().getTime();
	if (!ms) {
		return new Date(now).toLocaleTimeString()
	}
	return new Date(ms + now).toLocaleTimeString()
}