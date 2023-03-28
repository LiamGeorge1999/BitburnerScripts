import {NS} from "../NetscriptDefinitions"
/** @param {.NS} ns **/
export async function main(ns: NS) {
    if (!ns.args[0] || !ns.args[1]) { 
        ns.print(`[ERROR] FATAL ERROR: NULL (FALSEY) ARGS: ${ns.args.join(",")}`);
        ns.exit();
    }
    ns.print(`Args: "${ns.args.join("\", \"")}"`);
    await logToFile(ns, ns.args[0].toString(), ns.args[1].toString());
}

export async function logToFile(ns: NS, filename: string, data: string) {
    return await ns.write(filename, data);
}

export function logToPort(ns: NS, portNumber: number, data: string) {
    return ns.tryWritePort(portNumber, data);
}