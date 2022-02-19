/** @param {import(".").NS} ns **/
export async function main(ns) {
	await ns.sleep(ns.args[1] || 20);
	let startDate = new Date();
	let res = await ns.hack(ns.args[0]);
	let endDate = new Date();
	ns.tprint(`hacked ${ns.args[0]} for $${ns.nFormat(res, "0.00a")}`);
	let start = startDate.valueOf();
	let end = endDate.valueOf();
	ns.exec("logWriter.js", "home", 1, "stageLog.txt", 
		`${["hack.js",
		ns.args[0], 
		startDate.toLocaleTimeString(), 
		Math.floor(ns.args[1]), 
		Math.floor(ns.args[2]), 
		Math.floor(end - start), 
		Math.floor((end - start) - ns.args[2]), 
		endDate.toLocaleTimeString(), 
		ns.nFormat(res, "0.00a")].join(",")}\n`);
}