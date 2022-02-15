import { makeTable } from "/lib/tableMaker.js"
/** @param {import(".").NS} ns **/
export async function main(ns) {
	
	ns.disableLog("ALL");
	ns.tail();
	var columns = ["Script","threads","End Time","TimeDiff","Difficulty","Money"];
	while(true) {
		await ns.sleep(100);
		var data = ns.read("Stages.txt").split("\n");
		var rows = [columns];
		for (var i = 0; i<data.length; i++){
			var newRow = data[i].split(",");
			// var minTime = new Date(rows[i][2]);
			// ns.tprint("min: " + minTime.toLocaleTimeString())
			// var finTime = new Date(newRow[2]);
			// ns.tprint("fin: " + finTime.toLocaleTimeString())
			// //ns.tprint("ORDERED: " + String(finTime < minTime));
			// newRow.push(String(finTime.getTime()-minTime.getTime()));
			rows.push(newRow);
		}
		ns.clearLog();
		ns.print(makeTable(rows));
	}

}