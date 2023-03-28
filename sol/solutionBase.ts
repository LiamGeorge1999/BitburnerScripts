import { NS } from "../../NetscriptDefinitions";

export abstract class Solution {

    ns: NS;
	debugMode: Boolean;
    public static contractName: string;

    constructor(ns: NS, debugMode = false) {
        this.ns = ns;
		this.debugMode = debugMode;
    }


    abstract determine(...inputs : any): any;

    test(inputs: Array<any>, outputs: Array<any>) {
        
        if (inputs.length != outputs.length) {
            return false;
        }
        for (var index: number = 0; index < inputs.length; index++) {
            var input = inputs[index];
            var output = outputs[index];
            var answer = this.determine(input);
            
            if (JSON.stringify(answer) != JSON.stringify(output)) {
                return `[WARN] got ${answer} instead of ${output} from input ${input}`;
            }
        }
        return true;
    }

    log(message: string) {
        if (this.debugMode) this.ns.print(message);
    }
}