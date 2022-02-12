/** @param {NS} ns **/
export async function main(ns) {

	//var input = [-2, -1, 1, 1, 1, 1, 9, -7, 3, -6, 0, 7, 6, 5, 9, 6, 9, -8, -10, 2, 4, -10, -8, 9, -3, -4, 1, 4, -6, -10, 5, -10, 0, 10, 3, 1, 9, -2]
	var input = ns.codingcontract.getData(ns.args[0], ns.args[1]);

	if (!input) { ns.tprint("mergeOverlappingIntervals.js recieved bad inputs."); ns.exit(); }

	var subarraySums = [];
	for (var i = 0; i < input.length - 1; i++) {
		for (var j = i; j < input.length; j++) {
			subarraySums.push(sum(input.slice(i, j+1)));
		}
	}
	var result = Math.max(...subarraySums);
	
	if (ns.args[0] && ns.args[1]) {
		ns.tprint(`server: ${ns.args[1]} file: ${ns.args[0]} attempts: ${ns.codingcontract.getNumTriesRemaining(ns.args[0],ns.args[1])}`);
		// ns.tprint("result: " + result);
		var ans = ns.codingcontract.attempt(result, ns.args[0], ns.args[1])
		ns.tprint(ans);
	}
	ns.tprint(`input: ${input}\nResult: ${result}`);
}

export function sum(numbers){
	var total = 0;
	for (var number of numbers) {
		total+=number;
	}
	return total;
}