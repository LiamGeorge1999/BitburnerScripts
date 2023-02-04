import { TableMaker } from "../lib/tableMaker.js"
import { Util } from "../Utils"
import { GangGenInfo, GangMemberInfo, GangOtherInfo, NS } from "../NetscriptDefinitions"

const ascensionThreshhold = 1.6;
const refreshRate = 100; //in ms

var ticksPerSec = 5;
var reduceWanted = false;
var warfareScore = 0;

enum GangMemberStatuses {
	Unassigned = "Unassigned",
	MugPeople = "Mug People",
	DealDrugs = "Deal Drugs",
	StrongarmCivilians = "Strongarm Civilians",
	RunACon = "Run A Con",
	ArmedRobbery = "Armed Robbery",
	TraffickIllegalArms = "Traffick Illegal Arms",
	ThreatenAndBlackmail = "Threaten & Blackmail",
	HumanTrafficking = "Human Trafficking",
	Terrorism = "Terrorism",
	VigilanteJustice = "Vigilante Justice",
	TrainCombat = "Train Combat",
	TrainHacking = "Train Hacking",
	TrainCharisma = "Train Charisma",
	TerritoryWarfare = "Territory Warfare",
}

/** @param {NS} ns **/
export async function main(ns: NS) {
	//ns.tail();
	ns.disableLog("sleep");
	ns.disableLog("gang.setMemberTask");
	ns.disableLog("getServerMoneyAvailable");
	var startingMoney = ns.getServerMoneyAvailable("home");
	while (await ns.sleep(refreshRate)) {
		ns.clearLog();
		printStats(ns, startingMoney);
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
			break;
		}

	}
}

function evaluateEquipment(ns: NS, members: string[], equipmentName: string) {
		if (ns.gang.getEquipmentCost(equipmentName)*members.length < 0.01 * ns.getPlayer().money) {
			for (var member of members) {
				var memberInfo = ns.gang.getMemberInformation(member);
				if (memberInfo.upgrades.indexOf(equipmentName) == -1 && memberInfo.augmentations.indexOf(equipmentName) == -1){
					ns.gang.purchaseEquipment(member, equipmentName);
				}
			}
		}
}

function recruitMember(ns: NS) {
	while (ns.gang.canRecruitMember() && ns.gang.recruitMember(`gm${ns.gang.getMemberNames().length}`)) {
		ns.toast(`[GANG] recuited new gang member`, "success")
	}
}

/** Ascends, where sensible.
 * @param {NS} ns
**/
function considerWarfare(ns: NS) {
    let util = new Util(ns);
	let gangInfo: GangGenInfo = ns.gang.getGangInformation();
	var otherGangInfos: GangOtherInfo = ns.gang.getOtherGangInformation();
	var warfareScores: any = {};
	var scores: number[] = [];

	var columns = ["Gang", "Power", "War Score"]
	var rows = [columns]

	ns.print(" ");

	for (var gangName in otherGangInfos) {
		if (gangName != "Slum Snakes") {
			var score = otherGangInfos[gangName].territory * (ns.gang.getChanceToWinClash(gangName)-0.5) + 1;
			//if (score != 1) { ns.print(`warfare score for ${gangName} - ${score}`); }
			rows.push([gangName, ns.nFormat(ns.gang.getOtherGangInformation()[gangName].power, '0.00a'), ns.nFormat(score, '0.00a')])
			scores.push(score);
		}
	}
	// var scores = [];
	// for (var score of warfareScores) {
	// 	scores.push(score);
	// }

	ns.print(TableMaker.makeTable(rows));

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
	if (ns.fileExists("Formulas.exe") && false) {
		var memberInfo: GangMemberInfo = ns.gang.getMemberInformation(member);
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
		if (ascendedMemberInfo) {
			if (gangInfo.isHacking) {
				attributes = [ascendedMemberInfo.hack, ascendedMemberInfo.cha];
			} else {
				attributes = [ascendedMemberInfo.str, ascendedMemberInfo.def, ascendedMemberInfo.dex, ascendedMemberInfo.agi, ascendedMemberInfo.cha]
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
	else if (gangInfo.wantedLevel == 1) {
		reduceWanted = false;
	}

	if (reduceWanted) {
		let members: string[] = ns.gang.getMemberNames();
		for (var member of members) {
			ns.gang.setMemberTask(member, GangMemberStatuses.VigilanteJustice);
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
		return ns.gang.getMemberInformation(member).task == GangMemberStatuses.Unassigned;
	});
	var idleMembers: string[] = [];
	for (var member of members) {
		gangInfo = ns.gang.getGangInformation();
		if (ns.fileExists("Formulas.exe")) {
			for (var task of ns.gang.getTaskNames()) {
				var memberInfo: GangMemberInfo = ns.gang.getMemberInformation(member);
				var currentTaskStats = ns.gang.getTaskStats(memberInfo.task);
				if (ns.formulas.gang.moneyGain(gangInfo, memberInfo, ns.gang.getTaskStats(task)) > ns.formulas.gang.moneyGain(gangInfo, memberInfo, currentTaskStats)) {
					ns.gang.setMemberTask(member, task);
				}
			}
		} else {
			ns.gang.setMemberTask(member, GangMemberStatuses.StrongarmCivilians);
		}
		if (ns.gang.getMemberInformation(member).task == GangMemberStatuses.Unassigned) {
			idleMembers.push(member);
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
		return ns.gang.getMemberInformation(member).task == GangMemberStatuses.Unassigned;
	});
	for (var member of members) {
		var memberInformation = ns.gang.getMemberInformation(member);
		if (!gangInfo.isHacking) {
			//ns.print(`${member}: 70*fullmult: ${70 * memberInformation.agi_asc_mult * memberInformation.agi_mult}, ascMult: ${memberInformation.agi_asc_mult}, mult: ${memberInformation.agi_mult}`)
			if (memberInformation.cha / (memberInformation.cha_asc_mult * memberInformation.cha_mult) < 50) {
				ns.gang.setMemberTask(member, GangMemberStatuses.TrainCharisma);
			}
			if (memberInformation.agi / (memberInformation.agi_asc_mult * memberInformation.agi_mult) < 50) {
				ns.gang.setMemberTask(member, GangMemberStatuses.TrainCombat);
			}
		} else {
			if (memberInformation.hack / (memberInformation.hack_asc_mult * memberInformation.hack_mult) < 50) {
				ns.gang.setMemberTask(member, GangMemberStatuses.TrainHacking);
			}
		}
	}
}

/** prints gang and member stats.
 * @param {NS} ns
 * @param {number} startingMoney money held on script start
**/
function printStats(ns: NS, startingMoney: number) {
	let members: string[] = ns.gang.getMemberNames();
	let gangInfo: GangGenInfo = ns.gang.getGangInformation();
	ns.print(`money gained: $${ns.nFormat(ns.getServerMoneyAvailable("home") - startingMoney, "0.000a")} @ $${ns.nFormat(gangInfo.moneyGainRate*ticksPerSec, "0.000a")}/s`);
	ns.print(`wanted level:  ${ns.nFormat(gangInfo.wantedLevel, "0.0a")} ${reduceWanted ? "(reducing)" : ""} @ ${ns.nFormat(gangInfo.wantedLevelGainRate*ticksPerSec, "0.00a")}/s`);
	ns.print(`wanted penalty percentage: -${ns.nFormat((1 - gangInfo.wantedPenalty) * 100, "0.0a")}%`);
	ns.print(`Respect: ${ns.nFormat(gangInfo.respect, "0.000a")} @ ${ns.nFormat(gangInfo.respectGainRate, "0.000a")}/s`)
	ns.print(`power: ${ns.nFormat(gangInfo.power, "0.0a")}`);
	ns.print(`warfare score: ${ns.nFormat(warfareScore, "0.00a")}`);
	ns.print(`${localeHHMMSS()} - bonus time: ${ns.nFormat(ns.gang.getBonusTime()/1000, "00:00:00")}`);

	//TODO: Print price of all combat/hacking augs/rootkits per member

	//livePrint.push(`Full aug price per member: ${}`);

	ns.print(getMemberTable(ns));
}


/** prints a table of member information.
 * @param {NS} ns
**/
function getMemberTable(ns: NS): string {
	let members: string[] = ns.gang.getMemberNames();
	let gangInfo: GangGenInfo = ns.gang.getGangInformation();
	var printTable: any[][] = [gangInfo.isHacking ? ["Member", "Task", "LMult", "AscMet", "Res", "Hack", "Cha"] : ["Member", "Task", "LMult", "AscMet", "Res", "Str", "Def", "Dex", "Agi", "Cha"]];
	
	for (var member of members) {
		var ascensionMetric = getAscensionMetric(ns, member);
		var memberInfo = ns.gang.getMemberInformation(member);
		var memberMults = gangInfo.isHacking ? [memberInfo.hack_mult, memberInfo.cha_mult] : [memberInfo.agi_mult, memberInfo.str_mult, memberInfo.def_mult, memberInfo.dex_mult, memberInfo.cha_mult];
		printTable.push(gangInfo.isHacking ? 
							[member, 
								memberInfo.task.slice(Math.max(0, memberInfo.task.indexOf(' '))), 
								ascensionMetric ? ascensionMetric.toPrecision(3) : "null",
								Util.geometricMean(memberMults),
								memberInfo.earnedRespect ? memberInfo.earnedRespect.toPrecision(3) : "0", 
								memberInfo.hack, memberInfo.cha] 
							: [member, 
								memberInfo.task, 
								ascensionMetric ? ascensionMetric.toPrecision(3) : "null",
								Util.geometricMean(memberMults),
								memberInfo.earnedRespect ? memberInfo.earnedRespect.toPrecision(3) : "0", 
								memberInfo.str, 
								memberInfo.def, 
								memberInfo.dex, 
								memberInfo.agi, 
								memberInfo.cha
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