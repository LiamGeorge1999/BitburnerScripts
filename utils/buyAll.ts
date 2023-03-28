
import {CorpIndustryName, CorporationInfo, Division, Material, NS} from "../../NetscriptDefinitions"


/** @param {NS} ns **/
export async function main(ns: NS) {
    if (ns.singularity.purchaseTor()) {
        if (ns.getPlayer().money > 5000000000) {
            ns.singularity.purchaseProgram("Formulas.exe");
            for (var program of ns.singularity.getDarkwebPrograms()) {
                ns.singularity.purchaseProgram(program);
            }
        }
    }
}