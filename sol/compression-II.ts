import { NS } from "../../NetscriptDefinitions"
import { Solution } from "./solutionBase";

export class CompressionLimpelZivDeEncoding extends Solution {

	constructor(ns: NS, debugMode: boolean) {
		CompressionLimpelZivDeEncoding.contractName = "Compression II: LZ Decompression";
		super(ns, debugMode);
	}

    determine(ns: NS, input: string) {
        var inputIndex: number = 0;

        var stateIsRecall: boolean = false;
        var plainText: string = "";
        while (inputIndex < input.length) {
            var runLength: number = Number.parseInt(input[inputIndex]);
            if (runLength != 0) {
                if (!stateIsRecall) {
                    var {newPlainText, newInputIndex} = this.decodeVerbatim(input, plainText, inputIndex, runLength);
                    plainText = newPlainText;
                    inputIndex = newInputIndex;
                } else {
                    var {newPlainText, newInputIndex} = this.decodeRecall(input, plainText, inputIndex, runLength);
                    plainText = newPlainText;
                    inputIndex = newInputIndex;
                }
            }
            inputIndex++;
            stateIsRecall = !stateIsRecall;
        }

        return plainText;
    }

    decodeVerbatim(input: string, plainText: string, inputIndex: number, runLength: number) {
        this.log(`Verbatim run: input: "${input}"; plainText: "${plainText}"; inputIndex: ${inputIndex}; runLength: ${runLength}`);
        for (var i = 0; i < runLength; i++) {
            plainText += input[inputIndex + 1];
            inputIndex++;
        } 
        this.log(`Verbatim output: plainText: "${plainText}", inputIndex: ${inputIndex}`);
        return {"newPlainText": plainText, "newInputIndex": inputIndex};
    }

    
    decodeRecall(input: string, plainText: string, inputIndex: number, runLength: number) {
        
        inputIndex++;
        var recallIndex = plainText.length - Number.parseInt(input[inputIndex]);
        for (var i = 0; i < runLength; i++) {
            plainText += plainText[recallIndex + i];
        }
        
        return {"newPlainText": plainText, "newInputIndex": inputIndex};
    }

    // decodeVerbatim(input: string, inputIndex: string, plainText: string) {


    //     return plainText;
    // }
}