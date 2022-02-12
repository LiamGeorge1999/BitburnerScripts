/** @param {NS} ns **/
export async function main(ns) {

	var input = ns.codingcontract.getData(ns.args[0], ns.args[1]);
	
	if (!input) { ns.tprint("mergeOverlappingIntervals.js recieved bad inputs."); ns.exit(); }
	var intervals = input;
	// var intervals = [
	// 	[25, 28], 
	// 	[6, 16], 
	// 	[9, 10], 
	// 	[24, 25], 
	// 	[4, 12], 
	// 	[25, 26], 
	// 	[14, 20], 
	// 	[6, 7], 
	// 	[19, 24], 
	// 	[15, 24], 
	// 	[4, 5], 
	// 	[8, 13], 
	// 	[25, 34], 
	// 	[18, 20], 
	// 	[4, 12], 
	// 	[14, 24], 
	// 	[4, 10], 
	// 	[20, 24], 
	// 	[9, 16], 
	// 	[15, 23]];
	var overlaps = true;

	while (overlaps) {
		// ns.tprint(overlaps + " Working solution: [" + intervals.join("], [") + "]");

		var newIntervals = [];
		var clean = []
		overlaps = false;

		for (var i = 0; i < intervals.length; i++) {
			clean.push(true);
		}

		for (var i = 0; i < intervals.length; i++) {
			for (var j = 0; j < intervals.length; j++) {
				if (i != j && intervals[i][0] <= intervals[j][0] && intervals[i][1] >= intervals[j][0] && clean[i] && clean[j]) {
					var newinterval = [Math.min(intervals[i][0], intervals[j][0]), Math.max(intervals[i][1], intervals[j][1])];
					// ns.tprint("[" + intervals[i] + "] intersects with [" + intervals[j] + "] becoming [" + newinterval + "]");
					overlaps = true;
					newIntervals.push(newinterval);
					clean[i] = false;
					clean[j] = false;
				}
			}
		}
		for (var i = 0; i < intervals.length; i++) {
			if (clean[i]) {
				newIntervals.push(intervals[i]);
			}
		}
		intervals = newIntervals;
		await ns.sleep(5);
	}
	intervals.sort((a, b) => {
		return a[0] - b[0];
	})
	if (ns.args[0] && ns.args[1]) {
		// ns.tprint(`server: ${ns.args[1]} file: ${ns.args[0]} attempts: ${ns.codingcontract.getNumTriesRemaining(ns.args[0],ns.args[1])}`);
		// ns.tprint("result: " + intervals);
		var ans = ns.codingcontract.attempt(intervals, ns.args[0], ns.args[1])
		ns.tprint(ans);
	}

	// ns.tprint("result: [" + intervals.join("], [") + "]");
}