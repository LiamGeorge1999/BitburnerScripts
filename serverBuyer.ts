import { Util } from "./Utils"
import {GangGenInfo, GangMemberInfo, GangOtherInfo, NS} from "NetscriptDefinitions"
/** @param {NS} ns **/
export async function main(ns: NS) {
	ns.clearLog();
	const GiB = 1024^3;
	var util = new Util(ns);
	let maxExponent = 20;
	var cost: number;
	var i = maxExponent;
	if (await ns.prompt("Delete current servers?")) {
		for (var server of ns.getPurchasedServers()) {
			ns.killall(server);
			ns.deleteServer(server);
			await ns.sleep(50);
		}
	}
	var ram = Math.pow(2, i);
	do {
		ns.print(`exponent = ${i}`);
		ram = Math.pow(2, i);
		ns.print(`ram = ${ram}`);
		ns.tprint(`$${ns.nFormat(ns.getPurchasedServerCost(ram), "0.00a")} vs $${ns.nFormat(ns.getServerMoneyAvailable("home"), "0.00a")}`);
		await ns.sleep(20);
		i--;
	} while (( i > 0 && ns.getPurchasedServerCost(ram) > ns.getServerMoneyAvailable("home") ) );
	i++;
	cost = ns.getPurchasedServerCost(ram);
	ns.print(`Cost = ${cost}`);
	//@ts-ignore
	//ram = isNumeric(ns.args[1]) ? ram : ns.args[1];
	
	var j = ns.getPurchasedServers().length;
	var script = "tutorialHack.ns"
	var threads = Math.floor(ram / ns.getScriptRam(script));
	
	var cost: number = ns.getPurchasedServerCost(ram);
	if (!await ns.prompt("RAM = " + ram +
		" Order = " + i +
		"  --- Confirm money amount is greater than " + util.numberToString(cost, 1))) {
		ns.tprint("Script execution stopped.")
		return false;
	}

	while (j < ns.getPurchasedServerLimit()) {
		await (ns.sleep(50));
		//ns.tprint("Current cost for server with " + ram + "GB of RAM is " + cost);

		if (ns.getServerMoneyAvailable("home") > cost) {

			if (await ns.prompt("buy server with " + ns.nFormat(ram*GiB, '0.000ib') + " of RAM for " + ns.nFormat(cost, '($0.00a)') + "?")) {
				var hostname = ns.purchaseServer("s" + j, ram);
				ns.tprint("Purchased server with " + ns.nFormat(ram*GiB, '0.000ib') + " of RAM for " + ns.nFormat(cost, '($0.00a)') + ".");
				++j;
			} else {
				ns.tprint("Script execution stopped. Please run again when cost is managable.");
				return true;
			}
		} else {
			await ns.sleep(5000);
		}
	}
	if (await ns.prompt("Boot " + script + " on all purchased servers?")) {
		ns.exec("bootAll.js", "home");
	}
	return true;
}

function isNumeric(n: any): boolean {
	return !isNaN(parseFloat(n)) && isFinite(n);
  }