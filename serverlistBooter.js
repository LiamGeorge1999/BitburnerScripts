/** @param {NS} ns **/
export async function main(ns) {
	var script = ns.args[0];
	var killscripts = (ns.args[1] == "true" || ns.args[1] == undefined);
	if (script == undefined) {
		script = "tutorialHack.script";
	}
	for (var i = 0; i<25; i++){
		var hostname = "s"+i;
		if (killscripts) {
			ns.killall(hostname);
			ns.tprint("killing all processes on "+ hostname);
		}
		var threads = Math.floor((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname))/ns.getScriptRam(script));
		await ns.scp(script, hostname);
		ns.tprint("Executing " + threads + " instances of " + script + " on " + hostname);
		await ns.exec(script, hostname, threads);
	}

}