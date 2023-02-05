//@typescript-ignore
import { TableMaker } from "../lib/tableMaker.js"
import { CityName } from "../lib/CityName.js"
import {CorporationInfo, Division, NS} from "../NetscriptDefinitions.js"

var corpName: string = "Babbage's Cabbages";
var corpo: CorporationInfo;
var agricultureDivisionName: string = "Cabbages";
var agricultureDivision: Division;
var cities: Array<CityName> = [CityName.Aevum, 
                                CityName.Chongqing, 
                                CityName.Ishima, 
                                CityName.NewTokyo, 
                                CityName.Sector12, 
                                CityName.Volhaven];

enum CorporationStage {
    Early
}

var stage: CorporationStage = CorporationStage.Early;

/** @param {NS} ns **/
export async function main(ns: NS) {
    ns.clearLog();
    ns.disableLog("ALL");
    while (true) {
        await manageCorp(ns);
        await ns.sleep(10);
    }
}

async function manageCorp(ns: NS) {
    attemptToCreateCorp(ns, corpName);

    corpName = ns.corporation.getCorporation().name;
    corpo = ns.corporation.getCorporation();
    ns.print("Creating Industry");

    if (!ns.corporation.getDivision(agricultureDivisionName)) ns.corporation.expandIndustry("Agriculture", agricultureDivisionName);
    
    agricultureDivision = ns.corporation.getDivision(agricultureDivisionName);

    if (!ns.corporation.hasUnlockUpgrade("Smart Supply")) ns.corporation.unlockUpgrade("Smart Supply");

    if (agricultureDivision.cities.length < cities.length) expandToAllCities(ns, agricultureDivision);
    
    if (ns.corporation.hasUnlockUpgrade("Warehouse API")) buyWarehouses(ns, agricultureDivision);
    
    for (var divisionName of corpo.divisions) {
        var division = ns.corporation.getDivision(divisionName);
        for (var city of division.cities) {
            var office = ns.corporation.getOffice(divisionName, city);
            while (office.employees < 3) {
                ns.corporation.hireEmployee(divisionName, city);
            }
        }
    }


    printCorpo(ns);
    await ns.sleep(100);
}

function buyWarehouses(ns: NS, division: Division) {
    //test
    cities = agricultureDivision.cities.filter((cityName: CityName) => { 
        !ns.corporation.hasWarehouse(agricultureDivisionName, cityName) 
        })
    if (cities.length == 0) return
    ns.print("buying warehouses: " + JSON.stringify(cities));
    for (var city of cities) {
        ns.corporation.getWarehouse(division.name, city);
    }
}

function expandToAllCities(ns: NS, division: Division) {
    ns.print(`current cities: ${JSON.stringify(division.cities)}`);
    for (var city of cities.filter((value) => {return !division.cities.includes(value)})) {
        ns.corporation.expandCity(division.name, city);
    }
}

function attemptToCreateCorp(ns: NS, corpName: string) {
    while (!ns.corporation.hasCorporation()) {
        ns.print(`attempting to make corp ${corpName}`);
        var createdCorp = ns.corporation.createCorporation(corpName, ns.getPlayer().bitNodeN != 3)
        if (createdCorp) {
            ns.toast(`Created corp ${corpName}!`); 
        }
        ns.sleep(10000);
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