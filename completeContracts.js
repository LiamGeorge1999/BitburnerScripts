import { Util } from "Utils.js"
/** @param {NS} ns **/
export async function main(ns) {
	ns.tail();
	ns.disableLog("scan");
	ns.disableLog("sleep");
	ns.clearLog();
	var util = new Util(ns);
	var targets = util.findAllServers();
	//ns.print(targets);
	while (true) {
		var count = 0;
		for (var target of targets) {
			//ns.print(target);
			var files = ns.ls(target, ".cct");
			for (var file of files) {
				await ns.sleep(10);
				ns.print(`${target} - ${file} - ${ns.codingcontract.getContractType(file, target)}
				\n${ns.codingcontract.getData(file, target)}\n\n\n`);
				solve(ns, file, target);
				count++;
			}
		}
		if (count) {
			ns.print(`[WARNING] There are ${count} contacts found and left uncompleted.`);
		}
		await ns.sleep(60000);
	}


}
/** Finds the paths of all nodes.
 * @param {NS} ns			
 * @param {String} file			The name of the contract file.
 * @param {String} target		The hostname of the server that the contract is on.
**/
export async function solve(ns, file, target) {
	var types = [
		"Minimum Path Sum in a Triangle",
		"Merge Overlapping Intervals",
		"Array Jumping Game",
		"Subarray with Maximum Sum",
		"Algorithmic Stock Trader I",
		"Algorithmic Stock Trader II",
		"Algorithmic Stock Trader III",
		"Algorithmic Stock Trader IV"
	]
	var solvers = [
		"/sol/minimumPathSum.js",
		"/sol/mergeOverlappingIntervals.js",
		"/sol/arrayJumpingGame.js",
		"/sol/subarrayWithMaximumSum.js",
		"/sol/algorithmicStockTrader.js",
		"/sol/algorithmicStockTrader.js",
		"/sol/algorithmicStockTrader.js",
		"/sol/algorithmicStockTrader.js"
	]
	var solverIndex = types.indexOf(ns.codingcontract.getContractType(file, target));
	if (solverIndex == -1) { return null; }
	ns.exec(solvers[solverIndex], "home", 1, file, target);

}