import {Util} from "Utils.js"
/** @param {NS} ns **/
export async function main(ns) {
	var util = new Util(ns);
	var files = util.findAllFiles();
	var count = 0;
	for (var file of files) {
		if (ns.args[0]==undefined ||  -1 != file[1].toUpperCase().indexOf(ns.args[0].toUpperCase())){
		ns.tprint(file[1] + " at " + file[0]);
		count++;
		}
	}
	ns.tprint(`found ${count} files${ns.args[0] == undefined ? "": " matching grep \"" + ns.args[0] + "\""}.`)
}