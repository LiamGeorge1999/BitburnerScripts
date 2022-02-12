/** @param {NS} ns **/
import { Util } from "Utils.js"
export async function main(ns) {
	var util = new Util(ns);
	ns.tprint("---- finding paths - search term: " + ns.args[0] + " ----");
	var serverPaths = await util.findConnectionPaths("home", [], [], "\\");
	ns.tprint("---- paths found = " + serverPaths.length + " ----")
	for (var serverPath of serverPaths) {
		if (ns.args[0] == undefined || serverPath[1].toUpperCase().indexOf(ns.args[0].toUpperCase()) != -1) {
			ns.tprint("server: " + serverPath[1] + " - Path: " + serverPath[0]);
		}
	}
}