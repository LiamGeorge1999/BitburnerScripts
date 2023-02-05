import {Util} from "./Utils"
import {NS} from ".@ns"
/** @param {NS} ns **/
export async function main(ns: NS) {
	var util = new Util(ns);
	let maxExponent = 20;

	for (var i = 0; i < maxExponent+1; i++) {
		var ram = Math.pow(2, i);
		var cost = util.numberToString(ns.getPurchasedServerCost(ram), 1);
		ns.tprint("Price for server with " + ram + "GB (order "+ i + ") of RAM = " + (cost));
			await (ns.sleep(1));
	}
}