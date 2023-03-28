import { Util } from "./Utils"
import {NS} from "../NetscriptDefinitions"

import { ArrayJumpingGame } from "./sol/ArrayJumpingGame";
import { ValidMathExpressions } from "./sol/findAllValidMathExpressions";
import { Solution } from "./sol/solutionBase";
import { SubArrayWithMaximumSum } from "./sol/subarrayWithMaximumSum";

export type Newable<T> = { new (...args: any[]): T; };
/** @param {NS} ns **/
export async function main(ns: NS) {
	ns.clearLog();
	ns.tail();
	ns.disableLog("scan");
	ns.disableLog("sleep");
	ns.clearLog();
	var util = new Util(ns);
	while (true) {
		var count = 0;
		var contracts = Util.searchForFiles(ns, ".cct");
		for (var contract of contracts) {
			//ns.print(target);
			await ns.sleep(10);
			ns.print(`\n\n${contract.hostName}/${contract.fileName}\n${ns.codingcontract.getContractType(contract.fileName, contract.hostName)}\n${ns.codingcontract.getData(contract.fileName, contract.hostName)}`);
			var success = await solve(ns, contract.fileName, contract.hostName);
			count++;
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
async function solve(ns: NS, file: string, hostname: string): Promise<boolean> {

	var problems: Map<string, Solution> = new Map<string, Solution>([
		[ArrayJumpingGame.contractName, new ArrayJumpingGame(ns, true)],
		[ValidMathExpressions.contractName, new ValidMathExpressions(ns, true)],
		[SubArrayWithMaximumSum.contractName, new SubArrayWithMaximumSum(ns, true)]
	]);
	let type = ns.codingcontract.getContractType(file, hostname);
	ns.print(`Checking for ${type} solver`);
	let solver = problems.get(type);
	if (solver && solver["determine"]) {
		ns.print(`${type} found!`);
		var experience = getExperience(ns);
		if (experience) {
			ns.print(`Experience found: ${JSON.stringify(experience)}`);
			var input = ns.codingcontract.getData(file, hostname);
			ns.print(`input: ${input}`);
			try {ns.print(`JSONified input = ${JSON.stringify(input)}`)} 
			//@ts-ignore
			catch(e) {ns.alert(e.message)}
			//ns.print(`attempting solver ${solver["determine"]}`);
			var answer = await solver.determine(ns, input);
			ns.print(`answer for ${type} with input ${input} deduced as ${answer}`);
			if (!experience[type]) {
				experience[type] = {}
			}
			if (!experience[type][input]){
				experience[type][input] = {}
			}

			let memory = experience[type][input][answer];

			if (memory === false) {
				ns.print(`Found failed attempt at ${type} with input ${input} and result ${answer}.`);
				return false;

			} else if (memory === true) {
				ns.print(`remembered correct answer, attempting contract.`);
				result = attempt(ns, answer, file, hostname);
				if (result) ns.print(`[SUCCESS] ${result}`);
				else ns.print([`[ERROR] Worrying failure! Remembered correct answer was wrong!`]);
				experience[type][input][answer] = !!result;

			} else {
				ns.print(`No experience found for ${type} with input ${input} and result ${answer}.`);
				var result = attempt(ns, answer, file, hostname);
				experience[type][input][answer] = !!result;
				if (result) {
					ns.print(result);
					return true;
				}
				else {
					return false;
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

	return false;
}

function attempt(ns: NS, answer: any, file: string, hostname: string) {
	var result = ns.codingcontract.attempt(answer, file, hostname);
	if (result) {
		ns.print(`[SUCCESS] ${result}`);
	} else {
		ns.print(`[WARN] Failed ${ns.codingcontract.getContractType(file, hostname)} with input ${JSON.stringify(ns.codingcontract.getData(file, hostname))} and result ${answer}.`);
	}
	return result;
}

function getExperience(ns: NS): any {
	try { 
		if (!ns.fileExists("Experience.txt")) ns.write("Experience.txt", "", "w");
		let readValue = ns.read("Experience.txt");
		let readJSON = JSON.parse(readValue);
		return readJSON;
	}
	catch (e) {
		ns.print(`[ERROR] ${e}`);
		return undefined;
	}
}