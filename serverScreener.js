import { Util } from "Utils.js"
import { makeTable } from "/lib/tableMaker.js"
/** @param {import(".").NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");
    let util = new Util(ns);

    ns.tail();
    while(true) {
        let servers = util.findAllServers().sort((a, b) => {return a.moneyMax-b.moneyMax});
        var serverInfos = [["hostname", "security", "money", "growth", "able"]]
        for(let hostname of servers) {
            let server = ns.getServer(hostname);
            var serverInfo = []
            serverInfo.push(server.hostname);
            serverInfo.push(`${server.minDifficulty}+${server.hackDifficulty-server.minDifficulty}`);
            serverInfo.push(`${ns.nFormat(server.moneyAvailable, "0.00a")}/${ns.nFormat(server.moneyMax, "0.00a")}`);
            serverInfo.push(`${server.serverGrowth}`);
            serverInfo.push(`${server.openPortCount>=server.numOpenPortsRequired && server.requiredHackingSkill <= ns.getPlayer().hacking}`);
            if (server.moneyMax>0) {
                serverInfos.push(serverInfo);
            }
        }
        ns.clearLog();
        ns.print(makeTable(serverInfos));
        await ns.sleep(100);
    }
}