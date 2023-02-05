/** @param {NS} ns **/

import { NS } from ".@ns"
import { Solution } from "../sol/solutionBase.js";

//incomplete
export async function main(ns: NS) {
	ns.print("running");
	var inputs = [["123",6]];
	ns.print(`initialised inputs: ${inputs}`);
	var outputs = [["1+2+3", "1*2*3"]];
	ns.print(`initialised outputs: ${outputs}`);
	var solver = new ValidMathExpressions(ns, true);
	ns.print("initialised solver");
	var testResult = solver.test(inputs, outputs);
	ns.print("retrieved test result");
	ns.print(testResult);
}

export class ValidMathExpressions extends Solution {

    constructor(ns: NS, debugMode: boolean = false) {
		super(ns, debugMode);
	}

	determine(input: any[]): Array<string> {
		this.log("determining");
		var inputString : string = input[0];
		var inputValue : number = input[1];
		var candidates: Array<string> = this.generate(inputString);
		var solutions: Array<string> = this.validate(candidates, inputValue);
		
		this.log("solved?");
		return solutions;
	}

	generate(inputString: string): string[] {
		this.log("generating");
		this.log(inputString);
		var operations = ["+", "-", "*", ""];
		var candidateSets: Array<Array<string>> = [[inputString.substring(0, 1)]];
		var start = inputString.substring(0, 1);
		for (var index : number = 0; index < inputString.length - 1; index++) {
			this.log("index: " + index);
			candidateSets.push([]);
			for (var operator of operations) {
				for (var candidate of candidateSets[index]) {
					var newCandidate = candidate + operator + inputString.substring(index + 1, index + 2)
					this.log("new candidate:" + newCandidate);
					candidateSets[index+1].push(newCandidate);
				}
			}
		}

		return candidateSets[candidateSets.length-1];
	}

	validate(candidates: Array<string>, inputValue: number): Array<string> {
		this.log("validating");
		var solutions: string[] = [];
		for (var candidate of candidates) {
			if (eval(candidate) == inputValue) solutions.push(candidate)
		}
		return solutions;
	}
}