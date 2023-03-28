import { TableMaker } from "../lib/tableMaker.js"
import { Util } from "../Utils"
import { GangGenInfo, GangMemberInfo, GangOtherInfo, NS } from "../../NetscriptDefinitions"
import { GangMemberTask } from "../lib/GangMemberTask.js"

const ascensionThreshhold = 1.25;
const refreshRate = 100; //in ms
const trainingThreshhold = 75;

var ticksPerSec = 5;
var moneyMade = 0;
var lastTimestamp = new Date().getTime();
var reduceWanted = false;
var warfareScore = 0;
var wageWar = false;
var preprint: string[] = [];
var postprint: string[] = [];
var startingMoney: number;

/** @param {NS} ns **/
export async function main(ns: NS) {
	//ns.tail();
	ns.disableLog("sleep");
	ns.disableLog("gang.setMemberTask");
	ns.disableLog("getServerMoneyAvailable");
	startingMoney = ns.getPlayer().money;
	while (await ns.sleep(refreshRate)) {
		ns.clearLog();
		moneyMade += ns.gang.getGangInformation().moneyGainRate*((new Date().getTime() - lastTimestamp)/1000);
		printStats(ns);
		considerEquipment(ns);
		recruitMember(ns);
		considerAscension(ns, ns.gang.getMemberNames());
		warfareScore = considerWarfare(ns);
		workMembers(ns);
		considerReduceWanted(ns);
		trainMembers(ns);
	}
}

function considerEquipment(ns: NS) {
	let members = ns.gang.getMemberNames();
	for (var equipmentName of ns.gang.getEquipmentNames()) {
		//ns.print(ns.gang.getEquipmentType(equipmentName));
		switch (ns.gang.getEquipmentType(equipmentName)){
		case "Weapon":
			evaluateEquipment(ns, members, equipmentName);
			break;
		case "Armor":
			evaluateEquipment(ns, members, equipmentName);
			break;
		case "Vehicle":
			evaluateEquipment(ns, members, equipmentName);
			break;
		case "Augmentation":
			evaluateEquipment(ns, members, equipmentName);
			break;
		case "Rootkit":
			evaluateEquipment(ns, members, equipmentName, 0.1);
			break;
		}

	}
}
function evaluateEquipment(ns: NS, members: string[], equipmentName: string, valueModifier: number = 1) {
		if (ns.gang.getEquipmentCost(equipmentName)*members.length < 0.1 * ns.getPlayer().money * valueModifier || ns.gang.getEquipmentCost(equipmentName) < 10 * ns.gang.getGangInformation().moneyGainRate) {
			for (var member of members) {
				var memberInfo = ns.gang.getMemberInformation(member);
				if (memberInfo.upgrades.indexOf(equipmentName) == -1 && memberInfo.augmentations.indexOf(equipmentName) == -1){
					ns.gang.purchaseEquipment(member, equipmentName);
				}
			}
		}
}

function recruitMember(ns: NS) {
	var names = ns.gang.getMemberNames();
	var nameNumber: number = 0;
	for (var name of names) if (parseInt(name.substring(2)) >= nameNumber) nameNumber = parseInt(name.substring(2)) + 1
	while (ns.gang.canRecruitMember() && ns.gang.recruitMember(`gm${nameNumber}`)) {
		ns.toast(`[GANG] recuited new gang member`, "success");
	}
}

function considerWarfare(ns: NS) {
    let util = new Util(ns);
	let gangInfo: GangGenInfo = ns.gang.getGangInformation();
	var otherGangInfos: GangOtherInfo = ns.gang.getOtherGangInformation();
	var warfareScores: any = {};
	var scores: number[] = [];

	var columns = ["Gang", "Territory", "Power", "War Score"];
	var rows = [columns]

	if (gangInfo.territory == 1) {
		return 0;
	}

	for (var gangName in otherGangInfos) {
		if (gangName != ns.gang.getGangInformation().faction) {
			var score = otherGangInfos[gangName].territory * (ns.gang.getChanceToWinClash(gangName)-0.5) + 1;
			//if (score != 1) { ns.print(`warfare score for ${gangName} - ${score}`); }
			var territory = otherGangInfos[gangName].territory;
			if (territory) rows.push([gangName, ns.formatPercent(territory) + "", ns.formatNumber(ns.gang.getOtherGangInformation()[gangName].power), ns.formatNumber(score)])
			scores.push(score);
		}
	}
	// var scores = [];
	// for (var score of warfareScores) {
	// 	scores.push(score);
	// }

	postprint.push("\n" + TableMaker.makeTable(rows));

	return Util.geometricMean(...scores);
}

/** Ascends, where sensible.
 * @param {NS} ns
 * @param {String[]} members 			The list of members
**/
function considerAscension(ns: NS, members: string[]) {
	for (var member of members) {
		if (getAscensionMetric(ns, member) > ascensionThreshhold) {
			ns.gang.ascendMember(member);
			ns.toast(`Ascended gang member: ${member}!`)
		}
	}
}

/** Gets a geometric average of all of a member's multiplier gains were they to be ascended, or finds the.
 * @param {NS} ns
 * @param {String} memberInfo			The gang member's name
**/
function getAscensionMetric(ns: NS, member: string): number {
    let util = new Util(ns);
	let gangInfo: GangGenInfo = ns.gang.getGangInformation();
	var attributes: number[] = [];
	var currentAscensionPoints: number[] = [];
	var currentAscensionMults: number[] = [];
	if (ns.fileExists("Formulas.exe")) {
		var memberInfo: GangMemberInfo = ns.gang.getMemberInformation(member);
		if (gangInfo.isHacking) {
			attributes = [memberInfo.hack_exp, memberInfo.cha_exp];
			currentAscensionPoints = [memberInfo.hack_asc_points, memberInfo.cha_asc_points];
			currentAscensionMults = [memberInfo.hack_asc_mult, memberInfo.cha_asc_mult];
		} else {
			attributes = [memberInfo.str_exp, memberInfo.def_exp, memberInfo.dex_exp, memberInfo.agi_exp, memberInfo.cha_exp];
			currentAscensionPoints = [memberInfo.str_asc_points, memberInfo.def_asc_points, memberInfo.dex_asc_points, memberInfo.agi_asc_points, memberInfo.cha_asc_points];
			currentAscensionMults = [memberInfo.str_asc_mult, memberInfo.def_asc_mult, memberInfo.dex_asc_mult, memberInfo.agi_asc_mult, memberInfo.cha_asc_mult];
		}
		for (var i in attributes) {
			attributes[i] = ns.formulas.gang.ascensionPointsGain(attributes[i]) + currentAscensionPoints[i];
			attributes[i] = ns.formulas.gang.ascensionMultiplier(attributes[i]) / currentAscensionMults[i];
		}
	}
	else {
		var ascendedMemberInfo = ns.gang.getAscensionResult(member)
		if (ascendedMemberInfo) {
			if (gangInfo.isHacking) {
				attributes = [ascendedMemberInfo.hack, ascendedMemberInfo.cha];
			} else {
				attributes = [ascendedMemberInfo.str, ascendedMemberInfo.def, ascendedMemberInfo.dex, ascendedMemberInfo.agi, ascendedMemberInfo.cha];
			}
		}
	}
	return Util.geometricMean(...attributes);
}

/** Determines whether or not to reduce the wanted level of the gang.
 * @param {NS} ns
**/
function considerReduceWanted(ns: NS) {
	let gangInfo: GangGenInfo = ns.gang.getGangInformation();
	if ((1 - gangInfo.wantedPenalty) * 100 > 10 && gangInfo.wantedLevel > 2) {
		reduceWanted = true;
	}
	if ((1 - gangInfo.wantedPenalty) * 100 <= 1.5 || gangInfo.wantedLevel < 1.5) {
		reduceWanted = false;
	}

	if (reduceWanted) {
		let members: string[] = ns.gang.getMemberNames();
		for (var member of members) {
			ns.gang.setMemberTask(member, GangMemberTask.VigilanteJustice);
		}
	}
}

/** Sets gang members to work.
 * @param {NS} ns
 * @param {Boolean} overrideTasks?		Whether or not to override currently assigned tasks (excepting "Unassigned")
**/
//TODO: consider a variety of jobs and choose from them based on whether the respect gain is a higher percentage of current respect than money gain is a percentage of current money (or some such func.)
function workMembers(ns: NS, overrideTasks = true) {
	let members: string[] = ns.gang.getMemberNames();
	let gangInfo: GangGenInfo = ns.gang.getGangInformation();
	if (!overrideTasks) members = members.filter((member: any) => {
		return ns.gang.getMemberInformation(member).task == GangMemberTask.Unassigned;
	});
	var idleMembers: string[] = [];
	for (var member of members) {
		gangInfo = ns.gang.getGangInformation();
		if (wageWar) {
			ns.gang.setMemberTask(member, GangMemberTask.TerritoryWarfare);
		} else if (ns.getPlayer().money > (10^20)) {
			ns.gang.setMemberTask(member, GangMemberTask.Terrorism);
		} else if (ns.fileExists("Formulas.exe")) {
			for (var task of ns.gang.getTaskNames()) {
				var memberInfo: GangMemberInfo = ns.gang.getMemberInformation(member);
				var currentTaskStats = ns.gang.getTaskStats(memberInfo.task);
				if (ns.formulas.gang.moneyGain(gangInfo, memberInfo, ns.gang.getTaskStats(task)) > ns.formulas.gang.moneyGain(gangInfo, memberInfo, currentTaskStats)) {
					ns.gang.setMemberTask(member, task);
				}
			}
		} else {
			postprint.push(`Defaulted ${member} to ${GangMemberTask.ArmedRobbery}.`);
			ns.gang.setMemberTask(member, GangMemberTask.ArmedRobbery);
		}
		if (warfareScore > 1.1) {
			ns.gang.setMemberTask(member, GangMemberTask.TerritoryWarfare);
		}
	}

}

/** Sets gang members to training, where sensible.
 * @param {NS} ns
 * @param {Boolean} overrideTasks?		Whether or not to override currently assigned tasks (excepting "Unassigned")
**/
function trainMembers(ns: NS, overrideTasks = true) {
	let members: string[] = ns.gang.getMemberNames();
	let gangInfo: GangGenInfo = ns.gang.getGangInformation();
	if (!overrideTasks) members = members.filter((member: any) => {
		return ns.gang.getMemberInformation(member).task == GangMemberTask.Unassigned;
	});
	for (var member of members) {
		var memberInformation = ns.gang.getMemberInformation(member);
		if (!gangInfo.isHacking) {
			//ns.print(`${member}: 70*fullmult: ${70 * memberInformation.agi_asc_mult * memberInformation.agi_mult}, ascMult: ${memberInformation.agi_asc_mult}, mult: ${memberInformation.agi_mult}`)
			if (memberInformation.cha / (memberInformation.cha_asc_mult * memberInformation.cha_mult) < trainingThreshhold) {
				ns.gang.setMemberTask(member, GangMemberTask.TrainCharisma);
			}
			if (memberInformation.agi / (memberInformation.agi_asc_mult * memberInformation.agi_mult) < trainingThreshhold) {
				ns.gang.setMemberTask(member, GangMemberTask.TrainCombat);
			}
		} else {
			if (memberInformation.hack / (memberInformation.hack_asc_mult * memberInformation.hack_mult) < trainingThreshhold) {
				ns.gang.setMemberTask(member, GangMemberTask.TrainHacking);
			}
		}
	}
}

/** prints gang and member stats.
 * @param {NS} ns
 * @param {number} startingMoney money held on script start
**/
function printStats(ns: NS) {
	let members: string[] = ns.gang.getMemberNames();
	let gangInfo: GangGenInfo = ns.gang.getGangInformation();
	preprint.push(`money gained: $${ns.formatNumber(ns.getPlayer().money - startingMoney)} @ $${ns.formatNumber(gangInfo.moneyGainRate*ticksPerSec)}/s`);
	preprint.push(`wanted level:  ${ns.formatNumber(gangInfo.wantedLevel)} ${reduceWanted ? "(reducing)" : ""} @ ${ns.formatNumber(gangInfo.wantedLevelGainRate*ticksPerSec)}/s`);
	preprint.push(`wanted penalty percentage: -${ns.formatNumber((1 - gangInfo.wantedPenalty))}%`);
	preprint.push(`Respect: ${ns.formatNumber(gangInfo.respect)} @ ${ns.formatNumber(gangInfo.respectGainRate)}/s`)
	preprint.push(`power: ${ns.formatNumber(gangInfo.power)}`);
	preprint.push(`warfare score: ${ns.formatNumber(warfareScore)}`);
	preprint.push(`${localeHHMMSS()} - bonus time: ${ns.tFormat(ns.gang.getBonusTime()/1000)}`);
	preprint.push(`Threshholds: Ascension: ${ascensionThreshhold} - Training: ${trainingThreshhold}`);

	//TODO: Print price of all combat/hacking augs/rootkits per member

	//livePrint.push(`Full aug price per member: ${}`);
	ns.print(preprint.join("\n"));
	ns.print(getMemberTable(ns));
	ns.print(postprint.join("\n"));
	preprint = [];
	postprint = [];
}


/** prints a table of member information.
 * @param {NS} ns
**/
function getMemberTable(ns: NS): string {
	let members: string[] = ns.gang.getMemberNames();
	let gangInfo: GangGenInfo = ns.gang.getGangInformation();
	var printTable: any[][] = [gangInfo.isHacking ? ["Member", "Task", "AscMet", "Mult", "Rspct", "Hack", "Cha"] : ["Member", "Task", "AscMet", "Mult", "Rspct", "Str", "Def", "Dex", "Agi", "Cha"]];
	
	for (var member of members) {
		var ascensionMetric = getAscensionMetric(ns, member);
		var memberInfo = ns.gang.getMemberInformation(member);
		var memberMults = gangInfo.isHacking ? [memberInfo.hack_mult * memberInfo.hack_asc_mult, 
													memberInfo.cha_mult * memberInfo.cha_asc_mult] 
												: 
												[memberInfo.agi_mult * memberInfo.agi_asc_mult, 
													memberInfo.str_mult * memberInfo.str_asc_mult, 
													memberInfo.def_mult * memberInfo.def_asc_mult, 
													memberInfo.dex_mult * memberInfo.dex_asc_mult, 
													memberInfo.cha_mult * memberInfo.cha_asc_mult];
		printTable.push(gangInfo.isHacking ? 
							[member, 
								memberInfo.task, 
								ascensionMetric && !Number.isNaN(ascensionMetric) ? ascensionMetric.toPrecision(3) : "null",
								ns.formatNumber(Util.geometricMean(...memberMults)),
								memberInfo.earnedRespect ? ns.formatNumber(memberInfo.earnedRespect) : "0", 
								ns.formatNumber(memberInfo.hack), 
								ns.formatNumber(memberInfo.cha)
							] 
							: [member, 
								memberInfo.task, 
								ascensionMetric ? ascensionMetric.toPrecision(3) : "null",
								ns.formatNumber(Util.geometricMean(...memberMults)),
								memberInfo.earnedRespect ? ns.formatNumber(memberInfo.earnedRespect) : "0", 
								ns.formatNumber(memberInfo.str), 
								ns.formatNumber(memberInfo.def), 
								ns.formatNumber(memberInfo.dex), 
								ns.formatNumber(memberInfo.agi), 
								ns.formatNumber(memberInfo.cha)
							]);
	}
	return TableMaker.makeTable(printTable);
}

/** retrieves the current time, or the time after ms milliseconds have passed.
 * @param {number} ms?			A number of milliseconds to add to the current time.
 * @return {String}
**/
function localeHHMMSS(ms: number = 0): string {
	if (!ms) {
		ms = new Date().getTime()
	}
	return new Date(ms).toLocaleTimeString()
}