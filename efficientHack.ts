
import {NS} from "../NetscriptDefinitions"
import { getTimeString } from "@/clock.js";
export async function main(ns: NS) {
    ns.disableLog("ALL");
    ns.clearLog();
	var target = ns.args[0] == undefined ? "joesguns" : ns.args[0].toString();
    
	//var threads: number = ns.args[1] && (typeof ns.args[1] == "number") == undefined ? 1 : Number(ns.args[1]);


	var moneyThresh = ns.getServerMaxMoney(target) * 0.9;

	var securityThresh = ns.getServerMinSecurityLevel(target) + 5;
	//ns.tprint(`hacking ${target}`);
    ns.print(`target: ${target}`);

	while (true) {
        const server = ns.getServer(target);
		ns.print("Time: " + getTimeString());
        var script: string;
        var duration: number;
		if (ns.getServerSecurityLevel(target) > securityThresh) {
			script = "justWeaken.js"
            duration = ns.getWeakenTime(target) + 200;
		} else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
			script = "justGrow.js"
            duration = ns.getGrowTime(target) + 200;
		} else {
			script = "justHack.js"
            duration = ns.getHackTime(target) + 200;
		}
        var threads = Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home"))/ns.getScriptRam(script));
        var processID = ns.run(script, threads, target);
        //ns.tail(processID);
        ns.print(`ran ${script} at ${target} with ${threads} threads for ${ns.tFormat(duration, false)} until ${getTimeString(duration)}\n`);
        await ns.sleep(duration);
	}

}
