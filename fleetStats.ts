
import { TableMaker } from "./lib/tableMaker.js"
import {NS} from "./NetscriptDefinitions"
/** @param {.NS} ns **/
export async function main(ns: NS) {
    ns.disableLog("ALL");
    ns.tail();
    while(true) {
        let servers = ns.getPurchasedServers();
        var serverInfos = [["host", "Used", "Free", "Total"]];
        for(let hostname of servers) {
            let server = ns.getServer(hostname);
            var serverInfo: string[] = []
            serverInfo.push(server.hostname);
            serverInfo.push(`${ns.nFormat(server.ramUsed*1024*1024*1024, "0.00ib")}`);
            serverInfo.push(`${ns.nFormat((server.maxRam-server.ramUsed)*1024*1024*1024, "0.00ib")}`);
            serverInfo.push(`${ns.nFormat(server.maxRam*1024*1024*1024, "0.00ib")}`);
            serverInfos.push(serverInfo);
        }
        ns.clearLog();
        ns.print(TableMaker.makeTable(serverInfos));
        await ns.sleep(100);
    }
}