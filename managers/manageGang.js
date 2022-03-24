import { makeTable } from "/lib/tableMaker.js"
/** @param {NS} ns **/
var reduceWanted = false;
export async function main(ns) {
	//ns.tail();
	ns.disableLog("sleep");
	ns.disableLog("gang.setMemberTask");
	ns.disableLog("getServerMoneyAvailable");
	var startingMoney = ns.getServerMoneyAvailable("home");
	while (true) {
		await ns.sleep(100);
		ns.clearLog();
		var members = ns.gang.getMemberNames();
		var gangInfo = ns.gang.getGangInformation();
		printStats(ns, members, gangInfo, startingMoney);
		while (ns.gang.canRecruitMember() && ns.gang.recruitMember(`gm${ns.gang.getMemberNames().length}`)) {
			ns.toast(`[GANG] recuited new gang member`, "success")
		}
		//considerAscension(ns, gangInfo);
		//determineReduceWanted(ns, gangInfo);
		workMembers(ns, members, gangInfo);
		trainMembers(ns, members, gangInfo);
	}
}

/** Ascends, where sensible.
 * @param {NS} ns
 * @param {GangGenInfo} gangInfo	The gang information, as returned by ns.gang.getGangInformation()
**/
export function considerWarfare(ns, gangInfo) {
	var otherGangInfos = ns.gang.getOtherGangInformation();
	var warfareScore = 0; 
	for (var otherGang of otherGangInfos) {
		warfareScore += otherGangInfos[otherGang].territory/(0.5-ns.gang.getChanceToWinClash(otherGang))
	}
}

/** Ascends, where sensible.
 * @param {NS} ns
 * @param {String[]} members 			The list of members
 * @param {GangGenInfo} gangInfo	The gang information, as returned by ns.gang.getGangInformation()
**/
export function considerAscension(ns, members, gangInfo) {
	for (var member of members) {
		if (getAscensionMetric(ns, gangInfo, member) > 1.6) {
			ns.gang.ascendMember(member);
		}
	}
}

/** Gets a geometric average of all of a member's multiplier gains were they to be ascended, or finds the.
 * @param {NS} ns
 * @param {GangGenInfo} gangInfo		The gang information, as returned by ns.gang.getGangInformation()
 * @param {String} memberInfo			The gang member's name
**/
export function getAscensionMetric(ns, gangInfo, member) {
	var attributes;
	if (ns.fileExists("Formulas.exe")) {
		var memberInfo = ns.gang.getMemberInformation(member);
		if (gangInfo.isHacking) {
			attributes = [memberInfo.hack_asc_points, memberInfo.cha_asc_points];
		} else {
			attributes = [memberInfo.str_asc_points, memberInfo.def_asc_points, memberInfo.dex_asc_points, memberInfo.agi_asc_points, memberInfo.cha_asc_points]
		}
		for (var i in attributes) {
			attributes[i] = ns.formulas.gang.ascensionMultiplier(attributes[i]);
		}
	}
	else {
		var ascendedMemberInfo = ns.gang.getAscensionResult(member)
		if (gangInfo.isHacking) {
			attributes = [ascendedMemberInfo.hack, ascendedMemberInfo.cha];
		} else {
			attributes = [ascendedMemberInfo.str, ascendedMemberInfo.def, ascendedMemberInfo.dex, ascendedMemberInfo.agi, ascendedMemberInfo.cha]
		}
	}
	return geometricMean(...attributes);
}

/** Sets gang members to work.
 * @param {number[]} ...numbers	The numbers of which to find the geometric mean
 * @returns {number} 			The geometric mean of the inputted numbers
**/
export function geometricMean(...numbers) {
	var product = 1;
	for (var number of numbers) {
		product = product * number;
	}
	return Math.pow(product, 1 / numbers.length);
}

/** Sets gang members to work.
 * @param {NS} ns
 * @param {GangGenInfo} gangInfo	The gang information, as returned by ns.gang.getGangInformation()
**/
export function determineReduceWanted(ns, gangInfo) {
	if (!reduceWanted && (1 - gangInfo.wantedPenalty) * 100 > 10 && gangInfo.wantedLevel > 2) {
		reduceWanted = true;
	}
	else if (reduceWanted && gangInfo.wantedLevel == 1) {
		reduceWanted = false;
	}
}

/** Sets gang members to work.
 * @param {NS} ns
 * @param {String[]} members 			The list of members
 * @param {GangGenInfo} gangInfo	The gang information, as returned by ns.gang.getGangInformation()
 * @param {Boolean} overrideTasks?		Whether or not to override currently assigned tasks (excepting "Unassigned")
**/
export function workMembers(ns, members, gangInfo, overrideTasks = true) {
	if (!overrideTasks) members = members.filter((member) => {
		return ns.gang.getMemberInformation(member).task == "Unassigned";
	});
	var idleMembers = [];
	for (var member of members) {
		gangInfo = ns.gang.getGangInformation();
		if (reduceWanted) {
			ns.gang.setMemberTask(member, "Vigilante Justice");
		}
		//else if (gangInfo.moneyGainRate < (1 * Math.pow(10, 6)) || (true))
		else {
			if (ns.fileExists("Formulas.exe")) {
				for (var task of ns.gang.getTaskNames()) {
					var currentTaskStats = ns.gang.getTaskStats(ns.gang.getMemberInformation(member).task);
					if (ns.formulas.gang.moneyGain(gangInfo, member, ns.gang.getTaskStats(task)) > ns.formulas.gang.moneyGain(gangInfo, member, currentTaskStats)) {
						ns.gang.setMemberTask(member, task);
					}
				}
			} else {
				ns.gang.setMemberTask(member, "Human Trafficking");
			}
		 } //else {
		// 	ns.gang.setMemberTask(member, "Territory Warfare");
		// }
		if (ns.gang.getMemberInformation(member).task == "Unassigned") {
			idleMembers.push(member);
		}
	}

}

/** Sets gang members to training, where sensible.
 * @param {NS} ns
 * @param {String[]} members 			The list of members
 * @param {GangGenInfo} gangInfo	The gang information, as returned by ns.gang.getGangInformation()
 * @param {Boolean} overrideTasks?		Whether or not to override currently assigned tasks (excepting "Unassigned")
**/
export function trainMembers(ns, members, gangInfo, overrideTasks = true) {
	if (!overrideTasks) members = members.filter((member) => {
		return ns.gang.getMemberInformation(member).task == "Unassigned";
	});
	for (var member of members) {
		var memberInformation = ns.gang.getMemberInformation(member);
		if (!gangInfo.isHacking) {
			//ns.print(`${member}: 70*fullmult: ${70 * memberInformation.agi_asc_mult * memberInformation.agi_mult}, ascMult: ${memberInformation.agi_asc_mult}, mult: ${memberInformation.agi_mult}`)
			if (memberInformation.cha / (memberInformation.cha_asc_mult * memberInformation.cha_mult) < 50) {
				ns.gang.setMemberTask(member, "Train Charisma")
			}
			if (memberInformation.agi / (memberInformation.agi_asc_mult * memberInformation.agi_mult) < 50) {
				ns.gang.setMemberTask(member, "Train Combat")
			}
		} else {
			if (memberInformation.hack / (memberInformation.hack_asc_mult * memberInformation.hack_mult) < 50) {
				ns.gang.setMemberTask(member, "Train Hacking")
			}
		}
	}
}
/** prints gang and member stats.
 * @param {NS} ns
 * @param {String[]} members 			The list of members
 * @param {GangGenInfo} gangInfo	The gang information, as returned by ns.gang.getGangInformation()
**/
export function printStats(ns, members, gangInfo, startingMoney) {

	ns.print(`money gained: ${ns.nFormat(ns.getServerMoneyAvailable("home") - startingMoney, "0.000a")}`)
	ns.print(`money gain rate: ${ns.nFormat(gangInfo.moneyGainRate, "0.000a")}`)
	ns.print(`wanted level:  ${gangInfo.wantedLevel}`);
	ns.print(`wanted penalty percentage: -${(1 - gangInfo.wantedPenalty) * 100}%`);
	ns.print(`power: ${gangInfo.power}`)
	ns.print(localeHHMMSS());

	ns.print(getMemberTable(ns, members, gangInfo));
}
/** prints a table of member information.
 * @param {NS} ns
 * @param {String[]} members 			The list of members
 * @param {GangGenInfo} gangInfo	The gang information, as returned by ns.gang.getGangInformation()
**/
export function getMemberTable(ns, members, gangInfo) {
	var printTable = [gangInfo.isHacking ? ["Member", "Task", "AscMult", "Res", "Hack", "Cha"] : ["Member", "Task", "AscMet", "Res", "Str", "Def", "Dex", "Agi", "Cha"]];

	for (var member of members) {
		var ascensionMetric = getAscensionMetric(ns, gangInfo, member);
		var memberInfo = ns.gang.getMemberInformation(member);
		printTable.push(gangInfo.isHacking ? [member, memberInfo.task.slice(Math.max(0, memberInfo.task.indexOf(' '))), ascensionMetric ? ascensionMetric.toPrecision(3) : "null", memberInfo.earnedRespect ? memberInfo.earnedRespect.toPrecision(3) : "0", memberInfo.hack, memberInfo.cha] : [member, memberInfo.task, ascensionMetric ? ascensionMetric.toPrecision(3) : "null", memberInfo.earnedRespect ? memberInfo.earnedRespect.toPrecision(3) : "0", memberInfo.str, memberInfo.def, memberInfo.dex, memberInfo.agi, memberInfo.cha]);
	}
	return makeTable(printTable);
}

/** retrieves the current time, or the time after ms milliseconds have passed.
 * @param {number} ms?			A number of milliseconds to add to the current time.
 * @return {String}
**/
export function localeHHMMSS(ms = 0) {
	if (!ms) {
		ms = new Date().getTime()
	}
	return new Date(ms).toLocaleTimeString()
}