import { NS } from "../../NetscriptDefinitions"
import { Solution } from "./solutionBase";

export class EncryptionVigenèreCipher extends Solution {

	constructor(ns: NS, debugMode: boolean) {
		EncryptionVigenèreCipher.contractName = "Encryption II: Vigenère Cipher";
		super(ns, debugMode);
	}

    determine(ns: NS, input: [plaintext: string, keyword: string]) {
        var plaintext = input[0].toUpperCase();
        var keyword = input[1];
        this.log(`input: plaintext: "${plaintext}"; keyword: "${keyword}"`);
        var output = "";
        for (var i = 0; i < plaintext.length; i++) {
            var inputChar = plaintext[i];
            var keywordChar = keyword[i % keyword.length];
            output += EncryptionVigenèreCipher.vigenèreShift(inputChar, keywordChar);
        }
        this.log(`output: ${output}`);
        return output;
    }
    
    static vigenèreShift(inputChar: string, keywordChar: string): string {
        var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        return alphabet.indexOf(inputChar) == -1 ? inputChar : alphabet.at((alphabet.indexOf(inputChar) + alphabet.indexOf(keywordChar)) % 26) || "";
    }
}