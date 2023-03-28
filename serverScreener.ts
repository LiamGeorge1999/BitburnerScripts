import { Util } from "./Utils"
import { TableMaker } from "./lib/tableMaker.js"
import {NS} from "../NetscriptDefinitions"
/** @param {.NS} ns **/
export async function main(ns: NS) {
    ns.disableLog("ALL");
    let util = new Util(ns);

    ns.tail();
    while(true) {
        let servers = util.findAllServers().sort((a, b) => {return ns.getServer(a).moneyMax-ns.getServer(b).moneyMax});
        var serverInfos = [["hostname", "security", "money", "growth", "metric", "able"]]
        for(let hostname of servers) {
            let server = ns.getServer(hostname);
            var serverInfo = []
            serverInfo.push(server.hostname);
            serverInfo.push(`${server.minDifficulty}+${server.hackDifficulty-server.minDifficulty}`);
            serverInfo.push(`${ns.formatNumber(server.moneyAvailable)}/${ns.formatNumber(server.moneyMax)}`);
            serverInfo.push(`${server.serverGrowth}`);
            serverInfo.push(`${ns.formatNumber(server.serverGrowth*server.moneyMax/server.minDifficulty)}`);
            serverInfo.push(`${server.openPortCount>=server.numOpenPortsRequired && server.requiredHackingSkill <= ns.getPlayer().skills.hacking}`);
            if (server.moneyMax>0) {
                serverInfos.push(serverInfo);
            }
        }
        ns.clearLog();
        ns.print(TableMaker.makeTable(serverInfos));
        await ns.sleep(1000);
    }
}