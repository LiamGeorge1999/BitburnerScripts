/** @param {import(".").NS} ns **/
export async function main(ns) {
	await ns.sleep(ns.args[1] || 20);
	ns.tprint(`grew ${ns.args[0]} for ${await ns.grow(ns.args[0])} mult`);
}