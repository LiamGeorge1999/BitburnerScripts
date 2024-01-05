import { Util } from "@/Utils.js";
import { NS } from "NetscriptDefinitions";


export async function main(ns: NS) {
    while (true) {
        while ((ns.getServer("joesguns").hackDifficulty || 0) > (ns.getServer("joesguns").minDifficulty || 0)) {
            var server = ns.getServer("joesguns");
            var weakenThreads = Math.ceil(((server.hackDifficulty || 0) - (server.minDifficulty || 0)) / ns.weakenAnalyze(1));
            ns.scp("justWeaken.js", "s0");
            ns.exec("justWeaken.js", "s0", weakenThreads);
            await ns.sleep(Math.min(ns.getWeakenTime("joesguns"), 100));
        }
        var ramPerThread = ns.getScriptRam("justGrow.js");
        for (var host of new Util(ns).findAllServers()) {
            var freeRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
            var threads = Math.floor(freeRam/ramPerThread);
            ns.scp("justGrow.js", host);
            ns.exec("justGrow.js", host, threads || 1);
            await ns.sleep(Math.min(ns.getGrowTime("joesguns"), 100));
        }
        await ns.sleep(100);
    }
}