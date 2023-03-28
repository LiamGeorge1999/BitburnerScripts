
import { NS } from "../NetscriptDefinitions";
import { Util } from "./Utils";
import { File } from "./lib/file";
import { TableMaker } from "./lib/tableMaker";

var debugMode = false;
var nsPrinter: NS;

export async function main(ns: NS) {
    nsPrinter = ns;
    ns.clearLog()
    var files: File[] = Util.searchForFiles(ns, ".cct");
    ns.print(`${files.length} contracts found!`);

	var grep = ns.args[0] || "";
	if (typeof(grep) != "string") {
		grep = grep.toString();
	}

    debugMode = !!ns.args[1];
    printDebug(`[INFO] GREP: ${grep}`);

    var cutoff = 60;
    if (ns.args[2] && typeof(ns.args[2]) == "number") {
        cutoff = Math.max(ns.args[2], 0);
    }

    
    var contractTypes: string[] = [];
    var printTable: string[][] = [["Server name", "File Name", "Type", "data"]];
    for (var file of files.sort((a, b) => { return (a.fileName < b.fileName)? -1 : +1 })) {
        printDebug(`considering ${file.fileName} on ${file.hostName}`);
        var contractType = ns.codingcontract.getContractType(file.fileName, file.hostName);
        printDebug(`contract type: ${contractType}`);
        if (contractType.toUpperCase().includes(grep.toUpperCase())) {
            printDebug(`[SUCCESS] FOUND CANDIDATE ${file.fileName} on ${file.hostName}`);
            tprintDebug(`${file.hostName}:${file.fileName}:${contractType} - \n${JSON.stringify(ns.codingcontract.getData(file.fileName, file.hostName))}`);
            printTable.push([file.hostName, file.fileName, contractType, JSON.stringify(ns.codingcontract.getData(file.fileName, file.hostName)).substring(0, cutoff)]);
            if (!contractTypes.includes(contractType)) contractTypes.push(contractType);
        } else {
            //ns.print(`contract ${file.fileName} on ${file.hostName} is of the wrong type.`);
        }
    }
    ns.tprint(`\n${TableMaker.makeTable(printTable, false, false)}`);
    ns.tprint(`Found ${files.length} contract files matching grep "${grep}" including the following types: \n    ${contractTypes.sort().join("\n    ")}`);
}

function printDebug(message: string) {
    if (debugMode) nsPrinter.print(message);
}

function tprintDebug(message: string) {
    if (debugMode) nsPrinter.tprint(message);
}