/** @param {import(".").NS} ns **/
export async function main(ns) {
	await ns.sleep(ns.args[1] || 20);
	ns.tprint(`hacked ${ns.args[0]} for $${ns.nFormat(await ns.hack(ns.args[0]), "0.00a")}`);
}