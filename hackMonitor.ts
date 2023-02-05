import { TableMaker } from "./lib/tableMaker.js"
import {NS} from "./NetscriptDefinitions"
/** @param {.NS} ns **/
export async function main(ns: NS) {
	//@ts-ignore
	ns.tprint(ns.heart.break());
	ns.disableLog("ALL");
	ns.tail();
	let columns = ["Script","threads","End Time","dt","PrevDif","Difficulty","PrevMon","Money"];
	while(true) {
		var preamble = "";
		await ns.sleep(100);
		let data = ns.read("Stages.txt").split("\n");
		var rows = [columns];
		for (var i = 0; i<data.length; i++){
			var newRow = data[i].split(",");
			if (newRow.length>1) {
				// var minTime = new Date(rows[i][2]);
				// ns.tprint("min: " + minTime.toLocaleTimeString())
				// var finTime = new Date(newRow[2]);
				// ns.tprint("fin: " + finTime.toLocaleTimeString())
				// //ns.tprint("ORDERED: " + String(finTime < minTime));
				// newRow.push(String(finTime.getTime()-minTime.getTime()));
				rows.push(newRow);
			}
			else { preamble += newRow }
		}
		ns.clearLog();
		ns.print(preamble);
		ns.print(TableMaker.makeTable(rows));
	}

}