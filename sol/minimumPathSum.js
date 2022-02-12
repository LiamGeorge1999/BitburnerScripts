/** @param {NS} ns **/
export async function main(ns) {

	var input = ns.codingcontract.getData(ns.args[0], ns.args[1]);
	
	if (!input) { ns.tprint("minimumPathSum.js recieved bad inputs."); ns.exit(); }

	// 	var input = [
	//              [3],
	//             [1,9],
	//            [2,9,6],
	//           [9,9,9,5],
	//          [4,9,8,7,5],
	//         [2,9,7,9,1,9],
	//        [7,5,4,1,6,2,6],
	//       [9,6,8,5,6,6,3,5],
	//      [6,4,3,1,7,7,6,6,2],
	//     [9,3,6,1,7,8,1,1,3,2],
	//    [1,3,8,7,1,1,2,8,6,7,3],
	//   [4,1,6,2,2,3,5,5,3,1,5,1]
	// ];
	var costs = [
		[input[0][0]],
		[input[0][0] + input[1][0],
		input[0][0] + input[1][1]]
	];
	// ns.tprint("input values; " + input[0][0] + ", " + input[1][0] + ", " + input[1][1]);
	// ns.tprint("Cost values; " + input[0][0] + ", " + (input[0][0] + input[1][0]) + ", " + (input[0][0] + input[1][1]));
	// ns.tprint("Costs before fleshing: " + costs.toString());
	//flesh out depth of costs
	for (var i = costs.length; i < input.length; i++) {
		var costSet = [];
		for (j = 0; j < i; j++) {
			costSet.push(999);
		}
		// ns.tprint("adding to Costs: " + costs.length + ": " + costSet.toString());
		costs.push(costSet);
	}
	for (var i = 2; i < input.length; i++) {
		for (var j = 0; j < i; j++) {
			var cost = 999;
			let node = input[i][j];
			let left = costs[i - 1][j - 1];
			let right = costs[i - 1][j];
			let leftPlusNode = left + node;
			let rightPlusNode = right + node;
			// ns.tprint("at " + i + "," + j + ": nodevalue = " + node + " left = " + left + " right = " + right);
			if (left == undefined) {
				cost = rightPlusNode;
				// ns.tprint("at " + i + "," + j + ": Forced Right " + cost);
			} else if (right == undefined) {
				cost = leftPlusNode;
				// ns.tprint("at " + i + "," + j + ": Forced Left " + cost);
			} else {
				cost = Math.min(leftPlusNode, rightPlusNode);
				// ns.tprint("Selected " + (cost == leftPlusNode ? "Left " : "Right ") + cost);
			}
			costs[i][j] = cost;
		}

	}
	var resultrow = costs[costs.length - 1];
	for (i = 0; i < costs.length; i++) {
		// ns.tprint("Costs: " + i + ": " + costs[i].toString());
	}
	// ns.tprint("result row: " + resultrow);
	var result = 999;
	for (var i = 0; i < resultrow.length; i++) {
		result = (result > resultrow[i]) ? resultrow[i] : result;
	}
	if (ns.args[0] && ns.args[1]) {
		// ns.tprint(`server: ${ns.args[1]} file: ${ns.args[0]}`);
		// ns.tprint("result: " + result);
		var ans = ns.codingcontract.attempt(result, ns.args[0], ns.args[1])
		// ns.tprint(ans);
	}
	// ns.tprint("result: " + result);
}