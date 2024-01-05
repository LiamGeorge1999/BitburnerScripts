import { NS } from "../../NetscriptDefinitions"
import { Solution } from "./solutionBase";

export class CompressionRunLengthEncoding extends Solution {

	constructor(ns: NS, debugMode: boolean) {
		CompressionRunLengthEncoding.contractName = "Compression I: RLE Compression";
		super(ns, debugMode);
	}

    determine(ns: NS, input: string) {
        var index: number = 0;
        var output: string = "";

        var runLength: number = 0;
        var lastLetter: string = "";
        while (index < input.length) {
            var currentLetter = input[index];
            if (!lastLetter) {
                runLength++;
            }
            else if (lastLetter == currentLetter) {
                runLength++;
            }
            else {
                output += "" + runLength + lastLetter;
                runLength = 1;
            }

            if (runLength == 9) {
                output += runLength + lastLetter;
                runLength = 0;
                currentLetter = "";
            }

            lastLetter = currentLetter;
            index++;
        }
        output += runLength + lastLetter;
        return output;
    }
}