import { Util } from "../Utils.js"
import {Server, Player, NS} from "/NetscriptDefinitions"

/** @param {.NS} ns **/
export async function main(ns: NS) {
    let res = getOptimalExpGrindTarget(ns);
    ns.tprint(`[INFO] Optimal server for exp grinding: ${res.server} @ ${res.value * 1000} exp/s`);
    
}

/** @param {.NS} ns **/
export function getOptimalExpGrindTarget(ns: NS) {
    let util = new Util(ns);
    const servers = util.findAllServers();
    let optimalServer = "";
    let currentOptimalMetricValue = 0;
    let optimalExpGain = 0;
    for (let server of servers) {
        const weakenTime = ns.getWeakenTime(server)
        const expGain = calculateExpGain(ns, ns.getServer(server), ns.getPlayer());
        let metricValue = weakenTime / expGain;
        ns.print(`${server} - ${Math.ceil(weakenTime)/1000}s, ${expGain} exp, ${metricValue} metric`);
        if (metricValue > currentOptimalMetricValue && ns.hasRootAccess(server)) {
            optimalServer = server;
            currentOptimalMetricValue = metricValue;
            optimalExpGain = expGain;
        }
    }
    return {server : optimalServer, value : currentOptimalMetricValue, exp : optimalExpGain};
}

	/** Finds the paths of all nodes. *Use ns.nFormat() instead.*
	 * @param {NS} ns		        
	 * @param {Server} server		The server being hacked.
	 * @param {Player} player?		The player hacking the Server.
	 * @returns {int}			The exp gained by player from hacking server.
	**/
function calculateExpGain(ns: NS, server: Server, player: Player) {
    if (player == undefined) {
        player = ns.getPlayer()
    }
    const baseExpGain = 3;
    const diffFactor = 0.3;
    if (server.baseDifficulty == null) {
      server.baseDifficulty = server.hackDifficulty;
    }
    let expGain = baseExpGain;
    expGain += server.baseDifficulty * diffFactor;
    return expGain;
}