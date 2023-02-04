import { Solution } from "../sol/solutionBase.js";
import {NS} from "../NetscriptDefinitions";

/** @param {NS} ns **/
export async function main(ns: NS) {
	//var input = [0,6,3,7,0,2,6,7,7,7,9,10,3,2,2,3,7,8,10,0,9]
	//var input = [8, 6, 5, 0, 1, 1, 0, 8, 0, 8, 10, 4, 1, 5]

	var filename = ns.args[0].toString();
	var hostname = ns.args[1].toString();

	if (!filename || !hostname) {
		ns.print(`File name ${filename} not found on hostname ${hostname}.`);
	}

	var input = ns.args[0] && ns.args[1] ? ns.codingcontract.getData(filename, hostname) : undefined;
	//var input = ns.codingcontract.getData(ns.args[0], ns.args[1]);
	if (!input) { ns.tprint(`${ns.getScriptName()} recieved bad inputs.`); ns.exit(); }

	var solution: Solution = new ArrayJumpingGame(ns);

	var result = await solution.determine(ns, input);
	ns.tprint(`Input: [${input}] Result: ${result}`);
	if (result) {
		// ns.tprint(`server: ${ns.args[1]} file: ${ns.args[0]} attempts: ${ns.codingcontract.getNumTriesRemaining(ns.args[0],ns.args[1])}`);
		// ns.tprint("result: " + intervals);
		ns.prompt(`Attempt to solve ${ns.codingcontract.getContractType(filename, hostname)} with input ${input} and answer ${result}?`);
		ns.tprint(ns.codingcontract.attempt(result, filename, hostname));
	}
}

export class ArrayJumpingGame extends Solution {
	async determine(ns : NS, input: Array<number>) {
		var pos = 0;
		var lastpos=0;
		while (pos<input.length-2) {
			await ns.sleep(10);
			var movement = input[pos];
			for (var i = 1; i<=movement; i++) {
				if (input[pos+i]>movement-i) {
					pos+=i;
				}
			}
			if (pos+movement >= input.length-1) {
				return 1;
			}
			if (pos == lastpos) {
				return 0;
			}
		}
		return null;
	}
}