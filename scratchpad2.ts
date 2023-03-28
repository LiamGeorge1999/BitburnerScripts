
import {CityName} from "./lib/CityName.js"
import {Division, NS} from "./NetscriptDefinitions"

var cityName: CityName = CityName.Aevum;

export async function main(ns: NS) {
    //var cityNames: CityName = [CityName.Sector12];
    ns.disableLog("ALL");
    ns.clearLog();
    ns.tail();
    ns.print("Required hacking level: " + ns.getServerRequiredHackingLevel("w0r1d_d43m0n"));
    ns.print("Required true hacking level: " + ns.getServerRequiredHackingLevel("w0r1d_d43m0n")/ns.getPlayer().mults.hacking);
    ns.print("Required EXP: " + ns.formulas.skills.calculateExp(15000/ns.getPlayer().mults.hacking));
    ns.print("Required true EXP: " + ns.formulas.skills.calculateExp(15000/ns.getPlayer().mults.hacking)/ns.getPlayer().mults.hacking_exp);

    ns.print("Remaining EXP: " + ((ns.formulas.skills.calculateExp(15000, ns.getPlayer().mults.hacking) - ns.getPlayer().exp.hacking)/ns.getPlayer().mults.hacking_exp));

}