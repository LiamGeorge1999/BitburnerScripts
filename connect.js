import {Util} from "Utils.js"

export function autocomplete(data, args) {
    return [...data.servers];
}

/** @param {import(".").NS} ns **/
export async function main(ns) {
    //ns.tail();
	let util = new Util(ns);

    //ns.tprint(await getConnectString(ns, ns.args[0]));
    
    util.runTerminalCommand(await getConnectString(ns, util, ns.args[0]) + (ns.args[1]==undefined? "":"; backdoor"));
}

/** Finds the paths of all nodes.
 * @param {import(".").NS} ns?		
 * @param {Util} util
 * @param {String} server		The server to connect to.
**/
export async function getConnectString(ns, util, server) {
    let serverPaths = util.findConnectionPaths();
	for (var serverPath of serverPaths) {
        ns.print(`0: ${serverPath[0]} 1: ${serverPath[1]}`);
        if (serverPath[1] == ns.args[0]) {
            ns.print(`[INFO] Server found: ${serverPath}`);
            while (serverPath[0][0] == "\\") {
                ns.print(`[INFO] ${serverPath[0]}`);
                serverPath[0] = serverPath[0].slice(1);
            }
            ns.print(`[INFO] Pre-Replace: ${serverPath[0]}`);
            return serverPath[0].replaceAll("\\", "; connect ");
        }
    }
    return "Failed to find server."
}