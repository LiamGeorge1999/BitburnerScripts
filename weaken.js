/** @param {import(".").NS} ns **/
export async function main(ns) {
	await ns.sleep(ns.args[1] || 20);
	let hackDifficulty = ns.getServerSecurityLevel(ns.args[0]);
	let startDate = new Date();
	let res = await ns.weaken(ns.args[0]);
	let endDate = new Date();
	//ns.tprint(`weakened ${ns.args[0]} by ${res}`);
	let start = startDate.valueOf();
	let end = endDate.valueOf();
	if (ns.args[1] && ns.args[2]) {
		ns.exec("logWriter.js", "home", 1, "stageLog.txt",
			`${["weaken.js",
			Math.round(hackDifficulty), 
			startDate.toLocaleTimeString() + `.${startDate.getMilliseconds()}`, 
			Math.floor(ns.args[1]), 
			//Math.floor(ns.args[2]), 
			//Math.floor((end - start)), 
			Math.floor((end - start) - ns.args[2]), 
			endDate.toLocaleTimeString() + `.${endDate.getMilliseconds()}`, 
			ns.nFormat(res, "0.00")].join(",")}\n`);
	}
}