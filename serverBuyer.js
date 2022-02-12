import { Util } from "Utils.js"
/** @param {NS} ns **/
export async function main(ns) {
	var util = new Util(ns);
	let maxExponent = 20;
	var ram;
	var cost;
	var i = maxExponent;
	if (await ns.prompt("Delete current servers?")) {
		for (var server of ns.getPurchasedServers()) {
			ns.killall(server);
			ns.deleteServer(server);
			await ns.sleep(50);
		}
	}

	while ( i > 0 && ns.getPurchasedServerCost(ram) > ns.getServerMoneyAvailable("home") ) {
		ram = Math.pow(2, i);
		ns.tprint(`${util.numberToString(ns.getPurchasedServerCost(ram), 1)} vs ${util.numberToString(ns.getServerMoneyAvailable("home"), 1)}`);
		await ns.sleep(20);
		i--;
	}
	i++;
	cost = ns.getPurchasedServerCost(ram);
	ram = ns.args[1] == undefined ? ram : ns.args[1];
	
	var j = ns.getPurchasedServers().length;
	var script = "tutorialHack.ns"
	var threads = Math.floor(ram / ns.getScriptRam(script));
	
	var cost = ns.getPurchasedServerCost(ram);
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

			if (await ns.prompt("buy server with " + util.numberToString(ram, 2) + " of RAM for " + util.numberToString(cost) + "?")) {
				var hostname = ns.purchaseServer("s" + j, ram);
				ns.tprint("Purchased server with " + util.numberToString(ram, 2) + " of RAM for " + util.numberToString(cost) + ".");
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
		ns.exec("bootAll.js");
	}
}