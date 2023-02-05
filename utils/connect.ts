import {Util} from "../Utils"
import {NS} from "../NetscriptDefinitions.js"

// export function autocomplete(data, args) {
//     return [...data.servers];
// }

/** @param {.NS} ns **/
export async function main(ns: NS) {
    //ns.tail();

    //ns.tprint(await getConnectString(ns, ns.args[0]));
    var input = ns.args[0];
    if (typeof(input) == "string"){
        connect(ns, input);
    }
}

export async function connect(ns: NS, target: string) {
    Util.runTerminalCommand(await getConnectString(ns, target) + (ns.args[1]==undefined? "":"; backdoor"));
}

/** Gets a string that, if ran in the terminal, will connect to the provided target.
 * @param {.NS} ns?		
 * @param {Util} util
 * @param {String} server		The server to connect to.
**/
export async function getConnectString(ns: NS, server: string) {
	let util = new Util(ns);
    let serverPaths = Util.findConnectionPaths();
    return "Failed to find server."
}