/** @param {import(".").NS} ns **/
export async function main(ns) {
    let num = ns.args[0]==undefined ? 0 : ns.args[0];
	if (await ns.prompt("Delete all servers?")) {
		for (var name in ns.getPurchasedServers()){
			ns.killall(name)
			ns.deleteServer(name);
			ns.tprint("deleted server " + name)
		}
	}
}