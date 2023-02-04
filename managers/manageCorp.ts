//@typescript-ignore
import { TableMaker } from "../lib/tableMaker.js"
import {CityName, Division, NS} from "../NetscriptDefinitions"

/** @param {NS} ns **/
export async function main(ns: NS) {
    ns.disableLog("ALL");
    while (true) {
        await manageCorp(ns);
        await ns.sleep(10);
    }
}

var corpName: string = "Babbage's Cabbages";
var agricultureDivisionName: string = "Cabbages";
var agricultureDivision: Division;
var cities: Array<CityName> = [CityName.Aevum, CityName.Chongqing, CityName.Ishima, CityName.NewTokyo, CityName.Sector12, CityName.Volhaven];

async function manageCorp(ns: NS) {

    if (ns.corporation.hasCorporation()){
        corpName = ns.corporation.getCorporation().name;
    }
    if (!ns.corporation.hasCorporation()){
        atteptToCreateCorp(ns, corpName);
    }

    var corpo = ns.corporation.getCorporation();
    ns.print("Creating Industry");
    //test
    if (!ns.corporation.getDivision(agricultureDivisionName)) {
        ns.corporation.expandIndustry("Agriculture", agricultureDivisionName);
        agricultureDivision = ns.corporation.getDivision(agricultureDivisionName);
    }
    agricultureDivision = ns.corporation.getDivision(agricultureDivisionName);
    if (agricultureDivision.cities.length < cities.length) {
        expandToAllCities(ns, agricultureDivision);
    }
    buyWarehouses(ns, agricultureDivision, agricultureDivision.cities
                                            .filter((cityName: CityName) => { 
                                                    !ns.corporation.hasWarehouse(agricultureDivisionName, cityName) 
                                            }));




    printCorpo(ns);
    await ns.sleep(100);
}

function buyWarehouses(ns: NS, division: Division, cities: Array<CityName>) {
    //test
    if (cities.length == 0) return
    ns.print("buying warehouses: " + JSON.stringify(cities));
    for (var city of cities) {
        ns.corporation.getWarehouse(division.name, city);
    }
}

function expandToAllCities(ns: NS, division: Division) {
    for (var city of cities) {
        if (division.cities.indexOf(city) != -1) {
            ns.corporation.expandCity(division.name, city);
        }
    }
}

function atteptToCreateCorp(ns: NS, corpName: string) {
    
    var createdCorp = ns.corporation.createCorporation(corpName, ns.getPlayer().bitNodeN != 3)
    if (createdCorp) {
        ns.toast(`Created corp ${corpName}!`); 
    }

}

/** @param {NS} ns **/
function printCorpo(ns: NS) {
    const columns = ["NAME", "REVENUE", "EXPEND", "PROFIT", "%"];
    var livePrint: string[] = [];
    var corpo = ns.corporation.getCorporation()
    livePrint.push(`Corp Name: ${corpo.name}`);
	livePrint.push(`${localeHHMMSS()} - bonus time: ${ns.nFormat(ns.corporation.getBonusTime()/1000, "00:00:00")}`);
    var rows: string[][] = [];
    for (let divisionName of corpo.divisions){
        var division = ns.corporation.getDivision(divisionName)
        var row = [
            division.name,
            ns.nFormat(division.lastCycleRevenue, "0.00a"),
            ns.nFormat(division.lastCycleExpenses, "0.00a"),
            ns.nFormat(division.lastCycleRevenue - division.lastCycleExpenses, "0.00a"),
            ns.nFormat(((corpo.revenue - corpo.expenses) / (ns.corporation.getBonusTime()>0 ? 10 : 1)), "0.00a")
        ];
        livePrint.push(`Div Name: ${division.name}`);
        livePrint.push(`Revenue: ${ns.nFormat(division.lastCycleRevenue, "0.00a")}`);
        livePrint.push(`Expendature: ${ns.nFormat(division.lastCycleExpenses, "0.00a")}`);
        livePrint.push(`Profit: ${ns.nFormat(division.lastCycleRevenue - division.lastCycleExpenses, "0.00a")}`);

        rows.push(row);
    }
    var table = [columns, ...rows];
    ns.clearLog()
    //ns.print(livePrint.join("\n"));
    //ns.print(`State: ${corpo.state}`);
    for (var line of livePrint){
        ns.print(line);
    }
    ns.print(TableMaker.makeTable(table));
}


function localeHHMMSS(ms: number = 0): string {
	if (!ms) {
		ms = new Date().getTime()
	}
	return new Date(ms).toLocaleTimeString()
}