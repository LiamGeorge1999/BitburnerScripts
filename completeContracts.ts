import { Util } from "../Utils.js"
import {NS} from "./NetscriptDefinitions"

import { ArrayJumpingGame } from "/sol/ArrayJumpingGame.js";
import { ValidMathExpressions } from "/sol/findAllValidMathExpressions.js";
import { Solution } from "/sol/solutionBase.js";


/** @param {NS} ns **/
export async function main(ns: NS) {
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
				ns.print(`${target}/${file}\n${ns.codingcontract.getContractType(file, target)}\n${ns.codingcontract.getData(file, target)}\n\n`);
				solve(ns, file, target);
				count++;
			}
		}
		if (count) {
			ns.print(`[WARN] There are ${count} contacts found and left uncompleted.`);
		}
		await ns.sleep(60000);
	}


}
/** Finds the paths of all nodes.
 * @param {NS} ns			
 * @param {String} file			The name of the contract file.
 * @param {String} target		The hostname of the server that the contract is on.
**/
async function solve(ns: NS, file: string, hostname: string) {
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

	var problems: Map<string, Solution> = new Map<string, Solution>([
		["Array Jumping Game", new ArrayJumpingGame(ns)],
		["Find All Valid Math Expressions", new ValidMathExpressions(ns)]
	]);

	let type = ns.codingcontract.getContractType(file, hostname);
	let solver = problems.get(type);
	if (solver) {
		var experience = getExperience(ns);
		if (experience) {
			var input = ns.codingcontract.getData(file, hostname);
			var answer = solver.determine();
			if (!experience[type]) {
				experience[type] = {}
			}
			if (!experience[type][input]){
				experience[type][input] = {}
			}
			var memory = experience[type][input];
			if (memory.indexOf(answer) == -1) {
				var result = ns.codingcontract.attempt(answer, file, hostname);
				memory[answer] = !!result
				if (result) {
					ns.print(result);
				}
			}
			else {
				if (memory[answer]) {
					ns.print("remembered answer, attempting contract");
					result = ns.codingcontract.attempt(answer, file, hostname);

				} else {
					ns.print(`Failed ${type} with input ${input} and result ${answer}.`);
				}
			}
			ns.write("Experience.txt", JSON.stringify(experience), "w");
		} else {
			ns.print("failed to recall memories from Experience.txt");
		}
	} else {
		ns.print("Solver not found.");
	}
	// var solverIndex = types.indexOf(ns.codingcontract.getContractType(file, target));
	// if (solverIndex == -1) { return; }
	// ns.exec(solvers[solverIndex], "home", 1, file, target);

}

function attempt(ns: NS, answer: any, file: string, hostname: string) {
	var result = ns.codingcontract.attempt(answer, file, hostname)
	if (result) {
		ns.print(`[SUCCESS] ${result}`);
	} else {
		ns.print(`[WARN] Failed ${ns.codingcontract.getContractType(file, hostname)} with input ${JSON.stringify(ns.codingcontract.getData(file, hostname))} and result ${answer}.`)
	}

}

function getExperience(ns: NS): any {
	try { 
		if (!ns.fileExists("Experience.txt")) ns.write("Experience.txt", "", "w");
		let readValue = ns.read("Experience.txt");
		let readJSON = JSON.parse(readValue);
		return readJSON;
	}
	catch (e) {
		ns.print(e);
		return undefined;
	}
}