import { NS } from "../../NetscriptDefinitions"
import { Solution } from "./solutionBase";

export class EncryptionCeasarCipher extends Solution {

	constructor(ns: NS, debugMode: boolean) {
		EncryptionCeasarCipher.contractName = "Encryption I: Caesar Cipher";
		super(ns, debugMode);
	}

    determine(ns: NS, input: [plaintext: string, leftShift: number]) {
        var plaintext = input[0].toUpperCase();
        var leftShift = input[1];
        this.log(`input: plaintext: "${plaintext}"; leftShift: ${leftShift}`);
        var output = "";
        for (var char of plaintext) {
            
            output += EncryptionCeasarCipher.ceaserShift(char, leftShift);
        }
        this.log(`output: ${output}`);
        return output;
    }
    
    static ceaserShift(inputChar: string, leftShift: number): string {
        var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        return alphabet.indexOf(inputChar) == -1 ? inputChar : alphabet.at((alphabet.indexOf(inputChar) - leftShift) % 26) || "";
    }
}