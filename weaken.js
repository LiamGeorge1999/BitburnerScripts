/** @param {import(".").NS} ns **/
export async function main(ns) {
	await ns.sleep(ns.args[1] || 20);
	ns.tprint(`weakened ${ns.args[0]} by ${await ns.weaken(ns.args[0])}`);
}