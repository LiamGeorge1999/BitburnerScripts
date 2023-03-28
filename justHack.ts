import {NS} from "../NetscriptDefinitions"

export async function main(ns: NS) {
    const target = typeof ns.args[0] == "string" ? ns.args[0] : "joesguns";
    await ns.hack(target);
}