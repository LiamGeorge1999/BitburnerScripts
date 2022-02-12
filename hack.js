/** @param {NS} ns **/
export async function main(ns) {
	await ns.sleep(ns.args[1] || 20);
	ns.tprint(`hacked ${ns.args[0]} for ${await ns.hack(ns.args[0])}`);
}