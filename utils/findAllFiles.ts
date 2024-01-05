import {NS} from "../../NetscriptDefinitions"
import {Util} from "../Utils"
/** @param {NS} ns **/
export async function main(ns: NS) {
	var grep = ns.args[0];
	if (typeof(grep) != "string") {
		grep = grep.toString();
	}
	var files = Util.searchForFiles(ns, grep);
	for (var file of files) {
		ns.tprint(file.fileName + " at " + file.serverPath);
	}
	ns.tprint(`found ${files.length} files${ns.args[0] == undefined ? "": " matching grep \"" + ns.args[0] + "\""}.`)
}