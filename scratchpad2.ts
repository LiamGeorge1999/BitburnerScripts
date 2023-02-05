
import {CityName} from "./lib/CityName.js"
import {Division, NS} from "./NetscriptDefinitions.js"

var cityName: CityName = CityName.Aevum;

export async function main(ns: NS) {
    //var cityNames: CityName = [CityName.Sector12];
    ns.clearLog();
    ns.tail();
    ns.print("Does cabbages exist in sector-12?");
    ns.print(ns.corporation.getDivision("Cabbages").cities.indexOf(CityName.Sector12));
    ns.print(ns.corporation.getDivision("Cabbages").cities);
}