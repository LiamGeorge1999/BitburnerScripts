
import { TableMaker } from "../lib/tableMaker.js";
import { NS } from "../../NetscriptDefinitions";

var stockHistory: Map<String, Array<number>> = new Map();
var historyLength: number = 0;
var memoryCapacity = 20;

export async function main(ns: NS) {
    while(await ns.sleep(100)) {
        recordHistory(ns);
        for (var stock of ns.stock.getSymbols()) {
            if (getRecentPriceAverage(stock) != -1) {
                //do stocks
            }
        }
    }
    
}




function recordHistory(ns: NS) {
    for (var stock of ns.stock.getSymbols()) {
        var history = stockHistory.get(stock) || [];
        var price = ns.stock.getAskPrice(stock);
        if (price != history[history.length]) {
            if (historyLength < memoryCapacity) history.push(price);
            else history[historyLength%memoryCapacity] = price;
            historyLength++;
        }
        stockHistory.set(stock, history);
    }
}

function getRecentPriceAverage(stock: string): number {
    return getMeanAverage(stockHistory.get(stock)) || -1;
}

function getMeanAverage(numbers?: Array<number>): number {
    if (!numbers) return 0;
    var sum = 0;
    for (var num of numbers) sum += num;
    if (!sum) return sum;
    return sum/numbers.length;
}