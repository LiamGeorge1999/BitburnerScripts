//import { Util } from "Utils"
import {Server, Player, NS} from "/NetscriptDefinitions"
/** @param {NS} ns **/
export async function main(ns: NS) {
	//@ts-ignore
	//ns.tprint(`Karma = ${ns.heart.break()}`)


	//ns.tprint(hackAnalyzeThreads(ns, "alpha-ent", 8*1000000000));

	//ns.singularity.applyToCompany("MegaCorp", ns.singularity.getCurrentWork().name);

	return null;

	ns.rm("Test.txt");
	await ns.write("Test.txt", ["Item 1", "Item 2", "Item 3"].join("\n"));
	ns.tprint(ns.read("Test.txt"));

	return null;
	while (true) {
		await ns.sleep(100);
		ns.clearLog();
		//ns.print(ns.gang.getOtherGangInformation())
		//@ts-ignore
		ns.print(ns.heart.break());
	}

	return null;


	// for (var member of ns.gang.getMemberNames()) {
	// 	ns.tprint(`wanted penalty${ns.gang.getGangInformation().wantedPenalty}`);
	// 	var memberInformation = ns.gang.getMemberInformation(member);
	// 	var ascensionResult = ns.gang.getAscensionResult(member);

	// 	ns.tprint(`member: ${member} mult: ${memberInformation.cha_asc_mult}  asc Mult: ${memberInformation.cha_mult}`);

	// 	//ns.tprint(`member: ${member} skill: str level: ${memberInformation.str} ascMult: ${memberInformation.str_asc_mult} Mult: ${memberInformation.str_mult}`);
	// 	//ns.tprint(`member: ${member} skill: def level: ${memberInformation.def} ascMult: ${memberInformation.def_asc_mult} Mult: ${memberInformation.def_mult}`);
	// 	//ns.tprint(`member: ${member} skill: dex level: ${memberInformation.dex} ascMult: ${memberInformation.dex_asc_mult} Mult: ${memberInformation.dex_mult}`);
	// 	//ns.tprint(`member: ${member} skill: agi level: ${memberInformation.agi} ascMult: ${memberInformation.agi_asc_mult} Mult: ${memberInformation.agi_mult}`);
	// 	//ns.tprint(`member: ${member} skill: cha level: ${memberInformation.cha} ascMult: ${memberInformation.cha_asc_mult} Mult: ${memberInformation.cha_mult}`);
	// 	//ns.tprint(`member: ${member} skill: hack level: ${memberInformation.hack} ascMult: ${memberInformation.hack_asc_mult} Mult: ${memberInformation.hack_mult}`);
	// }

	// ns.tprint(`karma: ${ns.heart.break()}`)
	// return null;

	// var util = new Util(ns);
	// var target = util.findOptimalTarget();

	// ns.tprint(`Times needing to weaken/grow/hack ${target} to get to level ${ns.args[0]} = ${(ns.formulas.skills.calculateExp(ns.args[0], 1)
	// 		- ns.getPlayer().hacking_exp) / ns.getPlayer().hacking_exp_mult}`)


	// return null;

	// var targets = findAllServers();
	// var maxMoneyPerSecurity = 0;
	// var optimalTarget = "";
	// for (var i = 0; i < targets.length; i++) {
	// 	var target = targets[i];
	// 	var moneyPerSecurity = ns.getServerMaxMoney(target) / ns.getServerMinSecurityLevel(target);
	// 	if (moneyPerSecurity > maxMoneyPerSecurity && ns.hasRootAccess(target) && ns.getServerRequiredHackingLevel(target) < ns.getHackingLevel()) {
	// 		maxMoneyPerSecurity = moneyPerSecurity;
	// 		optimalTarget = target;
	// 	}
	// }
	// return optimalTarget;

}

/** Stage a hack run.
 * @param {NS} ns 
 * @param {Server} server			The target whose money to steal.
 * @param {String} hostname			The servers onwhich to host stages.
 * @param {number} hackAmount		The amount of money intended to be hacked.
 * @returns {number[]}				An array containing the number of milliseconds until the stage finishes, followed by the number of threads used.
**/
export function hackAnalyzeThreads(ns: NS, hostname: string, hackAmount: number) {

	// Check argument validity
	const server = ns.getServer(hostname);
	if (isNaN(hackAmount)) {
		// throw makeRuntimeErrorMsg(
		// 	"hackAnalyzeThreads",
		// 	`Invalid hackAmount argument passed into hackAnalyzeThreads: ${hackAmount}. Must be numeric.`,
		// );
	}

	if (hackAmount < 0 || hackAmount > server.moneyAvailable) {
		return -1;
	} else if (hackAmount === 0) {
		return 0;
	}

	const percentHacked = calculatePercentMoneyHacked(server, ns.getPlayer());

	return hackAmount / Math.floor(server.moneyAvailable * percentHacked);
}

export function calculatePercentMoneyHacked(server: Server, player: Player) {
  // Adjust if needed for balancing. This is the divisor for the final calculation
  const balanceFactor = 240;

  const difficultyMult = (100 - server.hackDifficulty) / 100;
  const skillMult = (644 - (506 - 1)) / 644;
  const percentMoneyHacked = (difficultyMult * skillMult * 1.2449206854525754 * 1) / balanceFactor;
  if (percentMoneyHacked < 0) {
    return 0;
  }
  if (percentMoneyHacked > 1) {
    return 1;
  }
  console.log(percentMoneyHacked)
  return percentMoneyHacked;
}