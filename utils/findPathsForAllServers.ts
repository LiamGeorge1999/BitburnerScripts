/** @param {NS} ns **/
import { Util } from "../Utils.js"
import {NS} from "../NetscriptDefinitions"

/** @param {NS} ns **/
export async function main(ns: NS) {
	var input = ns.args[0];
	var szInput: string;
	if (typeof(input) != "string") {
		szInput = input.toString();
	} else {
		szInput = input;
	}
	ns.tprint("---- finding paths - search term: " + szInput + " ----");
	var serverPaths = Util.findConnectionPaths("home", [], [], "\\");
	ns.tprint("---- paths found = " + serverPaths.length + " ----")
	for (var serverPath of serverPaths) {
		if (ns.args[0] == undefined || serverPath[1].toUpperCase().indexOf(szInput.toUpperCase()) != -1) {
			ns.tprint("server: " + serverPath[1] + " - Path: " + serverPath[0]);
		}
	}
}