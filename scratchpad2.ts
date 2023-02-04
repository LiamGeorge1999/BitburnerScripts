
import {CityName, Division, NS} from "./NetscriptDefinitions"

var cityName: CityName = CityName.Aevum;

export async function main(ns: NS) {
    ns.print(cityName);
}