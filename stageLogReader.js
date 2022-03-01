import { makeTable } from "/lib/tableMaker.js"
/** @param {import(".").NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");

    ns.tail();
    while(true) {
        var stageInfos = 
        [["Script", 
        "initSec", 
        "start", 
        "delay", 
        // "p dur", 
        // "t dur", 
        "diff", 
        "end", 
        "result"]];
        for (let line of ns.read("stageLog.txt").split("\n")) {
            if (line !=""){
                var row = [];
                for (let datum of line.split(",")) {
                    row.push(datum);
                }
                stageInfos.push(row);
            }
        }
        ns.clearLog();
        ns.print(makeTable(stageInfos));
        await ns.sleep(100);
    }
}