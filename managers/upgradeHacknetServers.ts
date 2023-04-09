import { getTimeString } from "../lib/clock";
import { HashUpgrade } from "../lib/HashUpgrade";
import { TableMaker } from "../lib/tableMaker.js";
import {NS} from "../../NetscriptDefinitions";

function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
    return Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];
}

function enumValues<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
    return Object.values(obj).filter(k => Number.isNaN(+k)) as K[];
}

export async function main(ns: NS) {
    ns.clearLog();
    ns.disableLog("sleep");
    ns.disableLog("scan");

    while (await ns.sleep(100)) {
        ns.clearLog();

        while(ns.hacknet.purchaseNode() != -1){ ns.toast("Purchased hacknet node!") };

        var printTable: string[][] = [["Index", "Level", "RAM", "Cores", "Cache"]];
        var bestUpgradeServerIndex: number = -1;
        var bestUpgradeType: string = "";
        var bestUpgradeHashRatePerDollar: number = 0;
        var canAffordAll: boolean = true;
        for (var hacknetServerNumber of ns.scan("home").filter((serverName) => { return serverName.includes("hacknet-server-") }).map((serverName) => { return serverName.substring("hacknet-server-".length)})) {
            var hacknetServerIndex = Number.parseInt(hacknetServerNumber);
            var stats = ns.hacknet.getNodeStats(hacknetServerIndex);
            var canAffordAll: boolean = true;

            canAffordAll = true ||(ns.hacknet.getRamUpgradeCost(hacknetServerIndex, 1) < ns.getPlayer().money || stats.ram == 8192)
                        && (ns.hacknet.getLevelUpgradeCost(hacknetServerIndex, 1) < ns.getPlayer().money || stats.level == 300)
                        && (ns.hacknet.getCoreUpgradeCost(hacknetServerIndex, 1) < ns.getPlayer().money || stats.cores == 128);
            
            var ramHashPerDollar = (ns.formulas.hacknetServers.hashGainRate(stats.level, 0, stats.ram*2, stats.cores)-ns.formulas.hacknetServers.hashGainRate(stats.level, 0, stats.ram, stats.cores)) / ns.hacknet.getRamUpgradeCost(hacknetServerIndex, 1);
            var levelHashPerDollar = (ns.formulas.hacknetServers.hashGainRate(stats.level+1, 0, stats.ram, stats.cores)-ns.formulas.hacknetServers.hashGainRate(stats.level, 0, stats.ram, stats.cores)) / ns.hacknet.getLevelUpgradeCost(hacknetServerIndex, 1);
            var coreHashPerDollar = (ns.formulas.hacknetServers.hashGainRate(stats.level, 0, stats.ram, stats.cores+1)-ns.formulas.hacknetServers.hashGainRate(stats.level, 0, stats.ram, stats.cores)) / ns.hacknet.getCoreUpgradeCost(hacknetServerIndex, 1);
            if (canAffordAll && !(stats.ram>8*(1024)) && ramHashPerDollar > bestUpgradeHashRatePerDollar) {
                bestUpgradeServerIndex = hacknetServerIndex;
                bestUpgradeType = "RAM";
                bestUpgradeHashRatePerDollar = ramHashPerDollar;
            }

            if (canAffordAll && !(stats.level == 300) && levelHashPerDollar > bestUpgradeHashRatePerDollar) {
                bestUpgradeServerIndex = hacknetServerIndex;
                bestUpgradeType = "LEVEL";
                bestUpgradeHashRatePerDollar = levelHashPerDollar;
            }

            if (canAffordAll && !(stats.cores == 128) && coreHashPerDollar > bestUpgradeHashRatePerDollar) {
                bestUpgradeServerIndex = hacknetServerIndex;
                bestUpgradeType = "CORE";
                bestUpgradeHashRatePerDollar = coreHashPerDollar;
            }
            var levelSuffix: string = "";
            var ramSuffix: string = "";
            var coreSuffix: string = "";
            var cacheSuffix: string = "";
            if (canAffordAll) {
                if (bestUpgradeType == "LEVEL") {
                    ns.hacknet.upgradeLevel(bestUpgradeServerIndex, 1);
                    levelSuffix = "+1"
                } else if (bestUpgradeType == "RAM") {
                    ns.hacknet.upgradeRam(bestUpgradeServerIndex, 1);
                    ramSuffix = "*2"
                } else if (bestUpgradeType == "CORE") {
                    ns.hacknet.upgradeCore(bestUpgradeServerIndex, 1);
                    coreSuffix = "+1"
                } else if (ns.hacknet.getCacheUpgradeCost(hacknetServerIndex, 1) < ns.getPlayer().money) {
                    ns.hacknet.upgradeCache(hacknetServerIndex, 1);
                    cacheSuffix = "+1"
                }
            }
            printTable.push([hacknetServerIndex.toString(), 
                            stats.level.toString() + levelSuffix, 
                            stats.ram.toString() + ramSuffix, 
                            stats.cores.toString() + coreSuffix, 
                            (stats.cache || 0).toString() + cacheSuffix]);
        }
        ns.print(TableMaker.makeTable(printTable));
    }
}