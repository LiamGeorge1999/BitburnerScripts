/** @param {import(".").NS} ns **/
export class Util {
	static ns;

	/**
	 * @param {import(".").NS} _ns
	**/
	constructor(_ns) {
		this.ns = _ns;
	}

	/** Find the target from whom money can be extracted fastest at minimum security.
	 * @returns {String}	The target from whom money can be extracted fastest at minimum security.
	**/
	findOptimalTarget() {
		var targets = this.findAllServers();
		var maxMoneyPerSecurity = 0;
		var optimalTarget = "";
		for (var i = 0; i < targets.length; i++) {
			var target = targets[i];
			var moneyPerSecurity = this.ns.getServerMaxMoney(target) / this.ns.getServerMinSecurityLevel(target);
			if (moneyPerSecurity > maxMoneyPerSecurity && this.ns.hasRootAccess(target) && this.ns.getServerRequiredHackingLevel(target) < this.ns.getHackingLevel()) {
				maxMoneyPerSecurity = moneyPerSecurity;
				optimalTarget = target;
			}
		}
		return optimalTarget;
	}

	/** Finds the paths of all nodes.
	 * @param {String} host?		The point at which to begin connection paths. Defaults to "home".
	 * @param {String} serverPaths?	The array of paths to nodes who have already been found.
	 * @param {String} servers?		The array of nodes which have already been found.
	 * @param {String} path?		The path of the node parent to the current node.
	 * @returns {String[]}			An array of paths to all nodes.
	**/
	findConnectionPaths(host = "home", serverPaths = [], servers = [], path = "") {
		var newpath = path + "\\" + host;
		//this.ns.tprint("path: " + newpath);
		if (!servers.includes(host)) {
			serverPaths.push([newpath, host]);
			servers.push(host)
			var neighbours = this.ns.scan(host);
			for (var neighbour of neighbours) {
				serverPaths = this.findConnectionPaths(neighbour, serverPaths, servers, newpath);
			}
		}
		return serverPaths;
	}

	/** Finds the paths and directories of all files.
	 * @returns {String[]}			An array of paths and directories of all files.
	**/
	findAllFiles() {
		var serverPaths = this.findConnectionPaths();
		var files = [];
		for (var serverPath of serverPaths) {
			var serverFiles = this.ns.ls(serverPath[1]);
			for (var serverFile of serverFiles) {
				files.push([serverPath[0], serverFile]);
			}
		}
		return files;
	}

	/** Finds an array of all server names.
	 * @returns {String[]}			An array of all server names.
	**/
	findAllServers() {
		var targets = this.ns.scan("home");
		for (var target of targets) {
			var newTargets = this.ns.scan(target);
			for (var newt of newTargets) {
				if (!targets.includes(newt)) {
					targets.push(newt);
				}
			}
		}
		return targets;
	}

	/** Runs all available port hacks on the provided target, and then nukes if possible.
	 * @param {String} target		The target server.
	**/
	ownServer(target) {
		var target = target || this.ns.getHostname();
		var ports = 0;
		if (this.ns.fileExists("BruteSSH.exe", "home")) {
			this.ns.brutessh(target);
			ports += 1;
		}
		if (this.ns.fileExists("FTPCrack.exe", "home")) {
			this.ns.ftpcrack(target);
			ports += 1;
		}
		if (this.ns.fileExists("relaySMTP.exe", "home")) {
			this.ns.relaysmtp(target);
			ports += 1;
		}
		if (this.ns.fileExists("HTTPWorm.exe", "home")) {
			this.ns.httpworm(target);
			ports += 1;
		}
		if (this.ns.fileExists("SQLInject.exe", "home")) {
			this.ns.sqlinject(target);
			ports += 1;
		}
		var requiredPorts = this.ns.getServerNumPortsRequired(target);
		if (requiredPorts < ports + 1) {
			this.ns.tprint((this.ns.nuke(target) ? "" : "un") + "successfully owned " + target + " with " + ports + " vs " + requiredPorts + " ports.");
		}
	}

	/** Finds the paths of all nodes. *Use ns.nFormat() instead.*
	 * @deprecated
	 * @param {number} cost3		The number to format.
	 * @param {number} type?		The style inwhich to format the number.
	 * @returns {String}			The formatted number.
	**/
	numberToString(cost3, type = -1) {
		var cost = cost3;
		var order3 = 0;
		var order = 0;
		let orders = [[" ", "thousand", "million", "billion", "Trillion", "quadrillion", "Quintillion", "sextillion", "Septillion"],
		[" ", "k", "m", "b", "T", "q", "Q", "s", "S",],
		["GB", "TB", "PB", "YB"]];

		while (cost3 > 1000) {
			cost3 = cost3 / 1000;
			order3 += 1;
		}
		while (cost > 10) {
			cost = cost / 10;
			order += 1;
		}
		var trail = ""
		if (type > -1) {
			return cost3 + orders[type][order3];
		} else if (type == -1) {
			if (order3 > 0 && Number.isInteger(order3)) {
				return cost3 + "e" + (3 * order3);
			}
		} else {
			if (order > 0 && Number.isInteger(order)) {
				return cost + "e" + order;
			}
		}
		return cost;
	}
	//TODO: Fix flood
	/** Runs as many threads of the provided scripts on the indicated targets as their RAM can hold.
	 * @param {String} script			The script withwhich to flood the targets.
	 * @param {String[]} [hosts]		The hosts of the flood. Defaults to the list of purchased servers.
	 * @param {Boolean} [clean]			Determines whether or not to run ns.killall() against the hosts.
	 * @param {...String[]} [args]		The arguments to pass to the script.
	**/
	async flood(script, hosts = this.ns.getPurchasedServers(), clean = false, ...args) {
		if (!Array.isArray(args)) {
			this.ns.print(`Arrayifying args from ${args} to ${[args]}`)
			args = [args];
		}
		this.ns.print(`Flooding ${script} on [${hosts.length == 0 ? "" : hosts.join("\", \"")}],${clean ? "" : " not"} wiping targets, with [${args.length == 0 ? "" : args.join("\", \"")}] as args`)
		for (var target of hosts) {
			if (clean) {
				this.ns.print(`Killing all on ${target}`)
				var processes = this.ns.ps(target);
				for (var process of processes) {
					this.ns.print(process);
					if (process.filename != "floodSelf.js") { this.ns.kill(process.pid); }
				}
			}
			this.ns.print(`scp start`);
			var transfer = await this.ns.scp(script, "home", target);
			this.ns.print(`scp finished`);
			if (target == "home" || transfer) {
				this.ns.print(`flooding ${target}`);
				this.ns.print(`RAM = ${this.ns.getServerMaxRam(target)} - ${this.ns.getServerUsedRam(target)} = ${this.ns.getServerMaxRam(target) - this.ns.getServerUsedRam(target)}`)
				var threads = Math.floor((this.ns.getServerMaxRam(target) - this.ns.getServerUsedRam(target)) / this.ns.getScriptRam(script, target));

				this.ns.print(`${transfer ? "" : "Un"}Successfully moved ${script} to run on ${target} with ${threads} threads and args = ["${args.join("\", \"")}"], with PID ${this.ns.exec(script, target, threads, ...args)}`)
			} else {
				this.ns.print(`failed to flood ${target}`);
			}
			await this.ns.sleep(10);
		}
	}

	/** Kills all running processes on all purchased servers.
	**/
	killAllServers() {
		var hosts = this.ns.getPurchasedServers();
		for (var host of hosts) {
			this.ns.killall(host);
		}
	}

}