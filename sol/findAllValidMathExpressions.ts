import { NS } from "../../NetscriptDefinitions"
import { Solution } from "./solutionBase";
import { ExpressionEvaluator } from "../lib/expressionEvaluator.js";

export async function main(ns: NS) {
	ns.clearLog();
	ns.tail();
	var solver = new ValidMathExpressions(ns, true);
	var numberSet: string;
	if (ns.args[0] && typeof(ns.args[0]) == "string") {
		numberSet = ns.args[0];
	} else if (ns.args[0] && typeof(ns.args[0]) == "number") {
		numberSet = ns.args[0].toString();
	} else {
		return false;
	}

	var input = JSON.parse(numberSet);
	ns.print(`using args as input: ${input}`);
	JSON.stringify(solver.determine(ns, input));
}

export class ValidMathExpressions extends Solution {

	constructor(ns: NS, debugMode: boolean) {
		ValidMathExpressions.contractName = "Find All Valid Math Expressions";
		super(ns, debugMode);
	}

	determine(ns: NS, input: any[]): Array<string> {
		this.log("determining");
		var inputString : string = input[0].toString();
		var inputValue : number = input[1];
		var candidates: Array<string> = this.generate(inputString);
		var solutions: Array<string> = candidates.filter((candidate) => {return this.validate(candidate, inputValue)});
		
		this.log(`solved? ${JSON.stringify(solutions)}`);
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

	validate(candidate: string, inputValue: number): boolean {
		this.log(`validating ${candidate}`);
		var valid = ExpressionEvaluator.evaluate(candidate) == inputValue;
		this.log(`${valid? "pass":"fail"}: ${candidate} ${valid? "=":"!"}= ${inputValue}`);
		return valid;
	}

}