import { Util } from "./Utils"
import { File } from "./lib/file.js";
import {NS} from "../NetscriptDefinitions"

import { Solution } from "./sol/solutionBase";
import { ArrayJumpingGame } from "./sol/ArrayJumpingGame";
import { ValidMathExpressions } from "./sol/findAllValidMathExpressions";
import { SubArrayWithMaximumSum } from "./sol/subarrayWithMaximumSum";
import { EncryptionCeasarCipher } from "./sol/encryption-I.js";
import { EncryptionVigenèreCipher } from "./sol/encryption-II.js";
import { CompressionRunLengthEncoding } from "./sol/compression-I.js";
import { CompressionLimpelZivDeEncoding } from "./sol/compression-II.js";


export type Newable<T> = { new (...args: any[]): T; };
/** @param {NS} ns **/
export async function main(ns: NS) {
	ns.clearLog();
	ns.tail();
	ns.disableLog("scan");
	ns.disableLog("sleep");
	ns.disableLog("codingcontract.attempt");
	ns.clearLog();
	var util = new Util(ns);

	ns.print("initialising problem solvers");
	var problems: Map<string, Solution> = new Map<string, Solution>()
	
	problems.set(ArrayJumpingGame.contractName, new ArrayJumpingGame(ns, false));
	//problems.set(ValidMathExpressions.contractName, new ValidMathExpressions(ns, true)); //generator needs work
	problems.set(SubArrayWithMaximumSum.contractName, new SubArrayWithMaximumSum(ns, false));
	problems.set(EncryptionCeasarCipher.contractName, new EncryptionCeasarCipher(ns, false)); //complete
	problems.set(EncryptionVigenèreCipher.contractName, new EncryptionVigenèreCipher(ns, false)); //complete
	problems.set(CompressionRunLengthEncoding.contractName, new CompressionRunLengthEncoding(ns, false)); //complete
	problems.set(CompressionLimpelZivDeEncoding.contractName, new CompressionLimpelZivDeEncoding(ns, false)); //complete

	ns.print(`made ${problems.size} solvers`);

	if (problems.size != 6) {
		ns.print("[WARN] failure to initialise problem set.");
		return;
	}

	await (ns.sleep(100));

	while (true) {
		var count = 0;
		var contracts =  await Util.runForFiles(ns, ".cct", solveIgnore, problems);
		// for (var contract of contracts) {
		// 	//ns.print(target);
			
		// 	count++;
		// }
		// if (count) {
		// 	ns.print(`[WARN] There are ${count} contacts found and left uncompleted.`);
		// }
		await ns.sleep(60000);
	}
}

async function solveIgnore(ns: NS, file: File, problems: Map<string, Solution>): Promise<void> {
	await ns.sleep(1000);
	await solve(ns, file.fileName, file.hostName, problems);
}

/** Finds the paths of all nodes.
 * @param {NS} ns			
 * @param {String} file			The name of the contract file.
 * @param {String} target		The hostname of the server that the contract is on.
**/
async function solve(ns: NS, file: string, hostname: string, problems: Map<string, Solution>): Promise<void> {

	ns.print(`\n\n${hostname}/${file}\n${ns.codingcontract.getContractType(file, hostname)}\n${ns.codingcontract.getData(file, hostname)}`);

	ns.print(`found ${problems.size} solvers`);
	await ns.sleep(10);
	ns.print("getting contract type...");
	let type = ns.codingcontract.getContractType(file, hostname);

	ns.print(`Checking for ${type} solver...`);
	let solver = problems.get(type);
	
	if (solver && solver["determine"]) {
		ns.print(`${type} found!`);
		var experience = getExperience(ns);

		if (experience) {
			ns.print(`Experience found!`);
			var input = ns.codingcontract.getData(file, hostname);

			ns.print(`input: ${input}`);
			try {ns.print(`JSONified input = ${JSON.stringify(input)}`)} 
			//@ts-ignore
			catch(e) {ns.alert(e.message)}
			//ns.print(`attempting solver ${solver["determine"]}`);

			ns.print("determining answer...");
			var answer = await solver.determine(ns, input);

			ns.print(`answer for ${type} with input ${JSON.stringify(input)} deduced as ${JSON.stringify(answer)}`);
			if (!experience[type]) {
				experience[type] = {}
			}
			if (!experience[type][input]){
				experience[type][input] = {}
			}

			let memory = experience[type][input][answer];

			if (memory === false) {
				ns.print(`Found failed attempt at ${type} with input ${JSON.stringify(input)} and result ${JSON.stringify(answer)}.`);
				return;

			} else if (memory === true) {
				ns.print(`remembered correct answer, attempting contract.`);
				result = attempt(ns, answer, file, hostname);

				if (result) ns.print(`[SUCCESS] ${result}`);
				else ns.print([`[ERROR] Worrying failure! Remembered correct answer was wrong!`]);
				ns.print("correcting experience...");
				experience[type][input][answer] = !!result;

			} else {
				ns.print(`No experience found for ${type} with input ${JSON.stringify(input)} and result ${JSON.stringify(answer)}.`);
				var result = attempt(ns, answer, file, hostname);

				ns.print("adding result to experience...");
				experience[type][input][answer] = !!result;
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

	return;
}

function attempt(ns: NS, answer: any, file: string, hostname: string) {
	if (!ns.fileExists(file, hostname)) return;
	var type = ns.codingcontract.getContractType(file, hostname);
	var result = ns.codingcontract.attempt(answer, file, hostname);
	if (result) {
		ns.print(`[SUCCESS] ${result}`);
	} else {
		ns.print(`[WARN] Failed ${type} with input ${JSON.stringify(ns.codingcontract.getData(file, hostname))} and result ${JSON.stringify(answer)}.`);
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