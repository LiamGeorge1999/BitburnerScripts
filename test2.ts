import {NS} from "NetscriptDefinitions"
/** @param {NS} ns **/
export async function main(ns: NS) {
    ns.tprint(typeof ns.args[0]);
}