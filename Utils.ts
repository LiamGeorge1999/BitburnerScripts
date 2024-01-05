import { File } from "./lib/file.js";
import {NS} from "../NetscriptDefinitions"
/** @param {NS} ns **/
export class Util {
	static ns: NS;

	/**
	 * @param {NS} _ns
	 * @returns {Util}
	**/
	constructor(_ns: NS) {
		Util.ns = _ns;
	}
	
	quit() {
		Util.ns.exit()
	}
	
	/** Finds the paths of all nodes.
	 * @param {String} command		The command to run in the terminal.
	**/
	public static runTerminalCommand(command: string) {
		// Acquire a reference to the terminal text field
		const terminalInput = document.getElementById("terminal-input");
		if (terminalInput) {
			// Acquire a reference to the terminal text field
			// Set the value to the command you want to run.
			// @ts-ignore
			terminalInput.value = command;

			// Get a reference to the React event handler.
			// @ts-ignore
			const handler = Object.keys(terminalInput)[1];

			// Perform an onChange event to set some internal values.
			// @ts-ignore
			terminalInput[handler].onChange({target:terminalInput});

			// Simulate an enter press
			// @ts-ignore
			terminalInput[handler].onKeyDown({key:'Enter',preventDefault:()=>null});
		}
	}

	static jump(ns: NS, input: string) {
		if (input.indexOf("\\") != -1){
            for (var name of input.split("\\")) {
                Util.runTerminalCommand(`connect ${name}`);
            }
        } else {
            var serverPaths = Util.findConnectionPaths(ns, ns.getServer().hostname);
            
            for (var serverPath of serverPaths) {
                if (serverPath[1].toUpperCase().indexOf(input.toUpperCase()) != -1) {
                    for (var name of serverPath[0].split("\\")) {
                        var command = `connect ${name}`;
                        Util.runTerminalCommand(command);
                    }
                    return
                }
            }
        }
	}

	/** Find the target from whom money can be extracted fastest at minimum security.
	 * @returns {String}	The target from whom money can be extracted fastest at minimum security.
	**/
	findOptimalTarget() {
		var targets = this.findAllServers();
		var maxMetric = 0;
		var optimalTarget = "";
		for (var i = 0; i < targets.length; i++) {
			var target = targets[i];
			var metric = Util.ns.getServerMaxMoney(target) / Util.ns.getServerMinSecurityLevel(target);
			if (metric > maxMetric && Util.ns.hasRootAccess(target) && Util.ns.getServerRequiredHackingLevel(target) < Util.ns.getHackingLevel()) {
				maxMetric = metric;
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
	static findConnectionPaths(ns: NS, host : string = "home", serverPaths: string[][] = [], servers: string[]= [], path: string = "") {
		var newpath = path + "\\" + host;
		//Util.ns.tprint("path: " + newpath);
		if (!servers.includes(host)) {
			serverPaths.push([newpath, host]);
			servers.push(host)
			var neighbours = ns.scan(host);
			for (var neighbour of neighbours) {
				serverPaths = Util.findConnectionPaths(ns, neighbour, serverPaths, servers, newpath);
			}
		}
		return serverPaths;
	}

	static async runForFiles(ns: NS, grep: string, fn: (ns: NS, file: File, ...params: any) => Promise<void>, ...params: any) {
		ns.print(`grep: ${grep}`);
		var files = Util.findAllFiles(ns);
		ns.print(`[INFO] considering ${files.length} files!`);
		for (var file of files) {
			if (file.fileName.toUpperCase().includes(grep.toUpperCase())) {
				await fn(ns, file, ...params);
			}
		}
	}

	static searchForFiles(ns: NS, grep: string) {
		ns.print(`grep: ${grep}`);
		var files = Util.findAllFiles(ns);
		ns.print(`[INFO] searching ${files.length} files!`);
		return files.filter((file) => { return file.fileName.toUpperCase().includes(grep.toUpperCase()); });
	}

	/** Finds the paths and directories of all files.
	 * @returns {String[]}			An array of paths and directories of all files.
	**/
	static findAllFiles(ns: NS): File[] {
		var serverPaths = Util.findConnectionPaths(ns);
		var files: File[] = [];
		for (var serverPath of serverPaths) {
			for (var serverFile of ns.ls(serverPath[1])) {
				files.push(new File(serverPath[0], serverFile));
			}
		}
		return files;
	}

	/** Finds an array of all server names.
	 * @returns {String[]}			An array of all server names.
	**/
	findAllServers() {
		var targets = Util.ns.scan("home");
		for (var target of targets) {
			var newTargets = Util.ns.scan(target);
			for (var newt of newTargets) {
				if (!targets.includes(newt)) {
					targets.push(newt);
				}
			}
		}
		return targets;
	}

	async ownServer(ns: NS, target: string) {
		var ports = 0;
		if (ns.fileExists("BruteSSH.exe", "home")) {
			ns.brutessh(target);
			ports += 1;
		}
		if (ns.fileExists("FTPCrack.exe", "home")) {
			ns.ftpcrack(target);
			ports += 1;
		}
		if (ns.fileExists("relaySMTP.exe", "home")) {
			ns.relaysmtp(target);
			ports += 1;
		}
		if (ns.fileExists("HTTPWorm.exe", "home")) {
			ns.httpworm(target);
			ports += 1;
		}
		if (ns.fileExists("SQLInject.exe", "home")) {
			ns.sqlinject(target);
			ports += 1;
		}
		var requiredPorts = ns.getServerNumPortsRequired(target);
		if (requiredPorts < ports + 1) {
			ns.nuke(target);
			await this.backdoor(ns, target);
			ns.tprint((ns.hasRootAccess(target) ? "" : "un") + "successfully owned " + target + " with " + ports + " vs " + requiredPorts + " ports.");
			return true;
		} else {
			ns.tprint(`Not enough ports open on ${target} (${ports} < ${requiredPorts})`);
		}
		return false;
	}

	async backdoor(ns: NS, target: string) {
		var host = ns.getServer().hostname;
		var util = new Util(ns);
		Util.jump(ns, target);
		Util.runTerminalCommand("backdoor");
		await ns.sleep(ns.getHackTime(target));
		Util.jump(ns, host);
	}

	/** Formats a number. *Use ns.nFormat() instead.*
	 * @deprecated
	 * @param {number} cost3		The number to format.
	 * @param {number} type?		The style inwhich to format the number.
	 * @returns {String}			The formatted number.
	**/
	numberToString(cost3: number, type: number = -1) {
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
	async flood(ns: NS, script: string, hosts: string[] = Util.ns.getPurchasedServers(), clean: boolean = false, ...args: (string | number | boolean)[]) {
		if (!Array.isArray(args)) {
			ns.print(`Arrayifying args from ${args} to ${[args]}`)
			args = [args];
		}
		let threadTotal = 0;
		ns.print(`Flooding ${script} on [${hosts.length != 0 ? "" : hosts.join(", ")}],${clean ? "" : " not"} wiping targets, with [${args.length == 0 ? "" : args.join(", ")}] as args`)
		for (var host of hosts) {
			if (clean) {
				ns.print(`Killing all on ${host}`)
				var processes = ns.ps(host);
				for (var process of processes) {
					ns.print(process);
					if (process.filename != "floodSelf.js") { ns.kill(process.pid); }
				}
			}
			ns.print(`scp start`);
			var transfer = await ns.scp(script, host, "home");
			ns.print(`scp finished`);
			if (host == "home" || transfer) {
				ns.print(`flooding ${host}`);
				ns.print(`RAM = ${ns.getServerMaxRam(host)} - ${ns.getServerUsedRam(host)} = ${ns.getServerMaxRam(host) - ns.getServerUsedRam(host)}`)
				var threads = Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / ns.getScriptRam(script, host));
				if (threads > 0) {
					ns.print(`${transfer ? "" : "Un"}Successfully moved ${script} to run on ${host} with ${threads} threads and args = ["${args.join("\", \"")}"], with PID ${ns.exec(script, host, threads, ...args)}`)
					threadTotal += threads;
				} else {
					ns.print(`threadcount = 0`);
				}
			} else {
				throw new Error(`failed to scp to ${host}`);
			}
			await ns.sleep(10);
		}
		return threadTotal;
	}

	/** Kills all running processes on all purchased servers.
	**/
	killAllServers() {
		var hosts = Util.ns.getPurchasedServers();
		for (var host of hosts) {
			Util.ns.killall(host);
		}
	}

	

	/** finds geometric mean of provided numbers.
	 * @param {number[]} ...numbers	The numbers of which to find the geometric mean
	 * @returns {number} 			The geometric mean of the inputted numbers
	**/
	static geometricMean(...numbers: any[]): number {
		var product = 1;
		for (var number of numbers) {
			product = product * number;
		}
		return Math.pow(product, 1 / numbers.length);
	}

}