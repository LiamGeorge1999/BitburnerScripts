/** @param {NS} ns **/
export async function main(ns) {
	//var stockPattern = [152, 37, 196, 49, 199, 100, 137, 39, 94, 118, 164, 162, 193, 113, 153, 136, 137, 47, 108, 186, 193, 64, 57, 141, 169, 132, 110, 163];
	ns.disableLog("sleep");
	ns.clearLog();
	var input = ns.codingcontract.getData(ns.args[0], ns.args[1]);
	var contractType = ns.codingcontract.getContractType(ns.args[0], ns.args[1]);
	var k = 0;
	var stockPattern = [0];


	if (contractType == "Algorithmic Stock Trader I") {
		k = 1;
		stockPattern = input;
	}
	if (contractType == "Algorithmic Stock Trader II") {
		k = input.length;
		stockPattern = input;
		return null;
	}
	if (contractType == "Algorithmic Stock Trader III") {
		k = 2;
		stockPattern = input;
		return null;
	}
	if (contractType == "Algorithmic Stock Trader IV") {
		k = input[0];
		stockPattern = input[1];
		return null;
	}
	ns.tprint(`\n\nServer: ${ns.args[1]} file: ${ns.args[0]}`);
	ns.tprint(`contract type: ${contractType}\ninput: ${input}\nk = ${k}, stockPattern = ${stockPattern}`);

	var result = await solveStocks(ns, k, stockPattern);
}

/** Finds the paths of all nodes.
 * @param {NS} ns			
 * @param {number} k				The maximum number of trades allowed.
 * @param {number[]} stockPattern	The stock pattern to be clipped.
 * @returns {number}				The greatest profit that can be made from stockPattern holding at most one stock at a time in k trades.
**/
export async function solveStocks(ns, k, stockPattern) {
	ns.tprint(`pattern at start: ${stockPattern}`);
	stockPattern = reduceStockPattern(ns, stockPattern);
	ns.tprint(`tightened stock pattern: ${stockPattern}`)
	stockPattern = clipStockPattern(ns, stockPattern);
	ns.tprint(`clipped stock pattern: ${stockPattern}`)
	await enumerateTradeSetSpace(ns, k, stockPattern)

}

/** Finds the paths of all nodes.
 * @param {NS} ns			
 * @param {number} k				The maximum number of trades allowed.
 * @param {number[]} stockPattern	The stock pattern to be clipped.
 * @returns {number}				The greatest profit that can be made from stockPattern holding at most one stock at a time in k trades.
**/
export async function enumerateTradeSetSpace(ns, k, stockPattern) {
	var trades = [];
	for (var i = 0; i < stockPattern.length - 1; i++) {
		for (var j = i + 1; j < stockPattern.length; j++) {
			trades.push([i, j]);
		}
	}
	ns.print(`trades possible: [${trades.join("], [")}]`);
	var tradeSets = [];
	for (var trade of trades) {
		tradeSets.push([trade]);
	}
	var newTradeSetFound = true;
	var loopCount = 1;
	while (newTradeSetFound) {
		await ns.sleep(10);
		newTradeSetFound = false;
		for (var tradeSet of tradeSets) {
			await ns.sleep(10);
			var addableTrades = trades.filter((value, index, array) => {
				//ns.print(`considering [${value.join(",")}] against [${tradeSet.join("], [")}]`)
				return tradeSet.every((trade, index, array) => {return trade[0] > value[1] || trade[1] < value[0];});
			});
			ns.print(`found ${addableTrades.length} addable trades against [${tradeSet.join("], [")}]`);
			for (var addableTrade of addableTrades) {
				var newTradeSet = tradeSet.concat(addableTrade);
				if (!tradeSets.includes(newTradeSet)) {
					newTradeSetFound = true;
					tradeSets.push(newTradeSet);
				}
			}
		}
		ns.print(`Loop ${loopCount}: tradeSets: ${tradeSets.length} sets`);
		loopCount++;
	}
	ns.tprint(`tradeSets found: [${tradeSets.join("], [")}]`);
}

/** Finds the paths of all nodes.
 * @param {NS} ns			
 * @param {number[]} stockPattern	The stock pattern to be clipped.
 * @returns {number[]}				The input stock pattern with any unusable values removed from the middle.
**/
export function reduceStockPattern(ns, stockPattern) {
	if (stockPattern.length < 3) { return stockPattern }
	for (var i = 1; i < stockPattern.length - 1; i++) {
		if (stockPattern[i - 1] <= stockPattern[i] && stockPattern[i] <= stockPattern[i + 1] || stockPattern[i - 1] >= stockPattern[i] && stockPattern[i] >= stockPattern[i + 1]) {
			stockPattern.splice(i, 1);
			ns.tprint(`pattern after removing point ${i}: ${stockPattern}`);
			i--;
		}
	}
	return stockPattern;
}

/** Finds the paths of all nodes.
 * @param {NS} ns			
 * @param {number[]} stockPattern	The stock pattern to be clipped.
 * @returns {number[]}				The input stock pattern with any unusable values removed from the start and end.
**/
export function clipStockPattern(ns, stockPattern) {
	return clipStockPatternEnd(ns, clipStockPatternStart(ns, stockPattern));
}

/** Finds the paths of all nodes.
 * @param {NS} ns			
 * @param {number[]} stockPattern	The stock pattern to be clipped.
 * @returns {number[]}				The input stock pattern with any unusable values removed from the start.
**/
export function clipStockPatternStart(ns, stockPattern) {
	ns.tprint(`pattern to be clipped: ${stockPattern}`);
	if (stockPattern[0] > stockPattern[1]) {
		stockPattern.splice(0, 1);
		return clipStockPatternStart(ns, stockPattern);
	}
	return stockPattern;
}

/** Finds the paths of all nodes.
 * @param {NS} ns			
 * @param {number[]} stockPattern	The stock pattern to be clipped.
 * @returns {number[]}				The input stock pattern with any unusable values removed from the end.
**/
export function clipStockPatternEnd(ns, stockPattern) {
	if (stockPattern[stockPattern.length - 2] > stockPattern[stockPattern.length - 1]) {
		ns.tprint(`pattern to be clipped: ${stockPattern}`);
		stockPattern.splice(stockPattern.length - 1, 1);
		return clipStockPatternEnd(ns, stockPattern);
	}
	return stockPattern;
}