import {Util} from "../Utils.js"
import {NS} from "../NetscriptDefinitions"
/** @param {NS} ns **/
export async function main(ns: NS) {
	var util = new Util(ns);
	var files = util.findAllFiles();
	var count = 0;
	var input = ns.args[0];
	var szInput: string;
	if (typeof(input) != "string") {
		szInput = input.toString();
	} else {
		szInput = input;
	}
	for (var file of files) {
		if (ns.args[0]==undefined ||  -1 != file[1].toUpperCase().indexOf(szInput.toUpperCase())){
		ns.tprint(file[1] + " at " + file[0]);
		count++;
		}
	}
	ns.tprint(`found ${count} files${ns.args[0] == undefined ? "": " matching grep \"" + ns.args[0] + "\""}.`)
}