import { NS } from "../../NetscriptDefinitions"
import { Solution } from "./solutionBase";

export async function main(ns: NS) {

	ns.clearLog();
	ns.tail();
	var solver = new SubArrayWithMaximumSum(ns, true);
	if (ns.args[0] && typeof(ns.args[0]) == "string") {
		var input = JSON.parse(ns.args[0]);
		ns.print(`using args as input: ${input}`);
		JSON.stringify(solver.determine(input));
		return
	}
}


export class SubArrayWithMaximumSum extends Solution {

	constructor(ns: NS, debugMode: boolean) {
		SubArrayWithMaximumSum.contractName = "Subarray with Maximum Sum";
		super(ns, debugMode);
	}

	determine(input: Array<number>): Array<number> {
		this.log("determining");
		var input : Array<number> = input;
		var candidates: Array<{subArray: Array<number>, sum: number}> = this.generate(input);
		var solution: Array<number> = candidates.sort((a, b) => {return a.sum - b.sum}).pop()?.subArray || [];
		
		this.log(`solved? ${JSON.stringify(solution)}`);
		return solution;
	}

	generate(input: Array<number>): Array<{subArray: Array<number>, sum: number}> {
		var subarraySums: Array<{subArray: Array<number>, sum: number}> = [];
		for (var i = 0; i < input.length - 1; i++) {
			for (var j = i; j < input.length; j++) {
				var subArray = input.slice(i, j+1);
				var sum = this.sum(subArray);
				subarraySums.push({subArray, sum});
			}
		}
		return subarraySums;
	}

	sum(numbers: Array<number>): number {
		var total = 0;
		for (var number of numbers) {
			total+=number;
		}
		return total;
	}

}