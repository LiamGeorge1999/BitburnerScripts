import { NS } from "../../NetscriptDefinitions"
import { Solution } from "./solutionBase";

/** @param {NS} ns **/
export async function main(ns: NS) {
	ns.clearLog();
	ns.tail();
	var solver = new ArrayJumpingGame(ns, true);
	if (ns.args[0] && typeof(ns.args[0]) == "string") {
		var input = JSON.parse(ns.args[0]);
		ns.print(`using args as input: ${input}`);
		var res = JSON.stringify(await solver.determine(input));
		ns.print(res);
		return null;
	}
}

export class ArrayJumpingGame extends Solution {

	constructor(ns: NS, debugMode: boolean) {
		ArrayJumpingGame.contractName = "Array Jumping Game";
		super(ns, debugMode);
	}

	async determine(input: Array<number>) {
		if (this.debugMode) this.log(`[INFO]: input = ${input}`);
		if (input.length == 0) return true
		var pos = 0;
		var lastpos = 0;
		var range = 0;
		for (var index = 0; index < input.length; index++) {
			var boost = input[index];
			this.log(`index: ${index} range: ${range} boost: ${boost}`);
			if (boost > range) {
				range = boost;
			}
			if (range == 0 && index != input.length - 1) return 0;
			range--;
		}
		return 1;
	}
}