//@typescript-ignore
import { TableMaker } from "../lib/tableMaker.js"
import { CityName } from "../lib/CityName.js"
import { CorpEmployeePosition, WorkingEmployeePositions } from "../lib/CorpEmployeePosition.js"
import {CorpIndustryName, CorporationInfo, Division, JobName, Material, NS, Office} from "../../NetscriptDefinitions"

var corpName: string = "Babbage Corp";
var corpo: CorporationInfo;

var agricultureDivisionName: string = "Babbage's Cabbages";
var agricultureDivision: Division;
var agricultureOfficeSizes: Map<CityName, number> = new Map([[CityName.Aevum,   3],
                                                            [CityName.Chongqing,3],
                                                            [CityName.Ishima,   3],
                                                            [CityName.NewTokyo, 3],
                                                            [CityName.Sector12, 3],
                                                            [CityName.Volhaven, 3]]);
var tobaccoDivisionName: string = "LODLeaf";
var tobaccoDivision: Division;
var tobaccoOfficeSizes: Map<CityName, number> = new Map([[CityName.Aevum,   30],
                                                        [CityName.Chongqing,9],
                                                        [CityName.Ishima,   9],
                                                        [CityName.NewTokyo, 9],
                                                        [CityName.Sector12, 9],
                                                        [CityName.Volhaven, 9]]);
var livePrint: string[] = [];
var tobaccoProductPrices: number[];
var tobaccoProductMinPrices: number[];
var tobaccoProductMaxPrices: number[];
var tobaccoProductPriceJoltFactor: number;
var simulationSpeed = 0.1;

var preprint: string[] = [];
var postprint: string[] = [];


const partyFundPerPerson = 500000;
enum CorporationStage {
    EarlyAgri,
    MidAgri,
    LateAgri,
    EarlyTobacco,
    MidTobacco,
    LateTobacco
}

const cities: Array<CityName> = [CityName.Aevum, 
                                CityName.Chongqing, 
                                CityName.Ishima, 
                                CityName.NewTokyo, 
                                CityName.Sector12, 
                                CityName.Volhaven];

var stage: CorporationStage = CorporationStage.EarlyAgri;


export async function main(ns: NS) {
    ns.clearLog();
    //ns.disableLog("ALL");
    if (!ns.corporation.hasCorporation()) await attemptToCreateCorp(ns, corpName);
    corpo = ns.corporation.getCorporation();
    if (!corpo.divisions.includes(agricultureDivisionName)) await attemptToCreateDivision(ns, "Agriculture", agricultureDivisionName);
    corpName = corpo.name;
    while (corpo) {
        while (corpo.state == "EXPORT") await manageCorp(ns);
        while (corpo.state != "EXPORT") await manageCorp(ns);
        //await oncePerTick(ns);
        //if (agricultureDivision) await assignEmployeeJobs(ns, agricultureDivision);
        //if (tobaccoDivision) await assignEmployeeJobs(ns, tobaccoDivision);

        await ns.sleep(10);
    }
    ns.print("[ERROR] Couldn't find corpo");
}

async function oncePerTick(ns: NS) {
    for (var city of tobaccoDivision.cities) {
        var office = ns.corporation.getOffice(tobaccoDivision.name, city);
        
        if (office.size == office.employees) {
            var shareSize = Math.floor(office.employees/7);
            var remainder = office.employees - (shareSize * 7);
            if (city == CityName.Aevum) { //make these dictionaries and iterate through. If any aren't as they should be, unassign everyone and reassign.
                ns.corporation.setAutoJobAssignment(tobaccoDivision.name, city, CorpEmployeePosition.Operations, shareSize * 2);
                ns.corporation.setAutoJobAssignment(tobaccoDivision.name, city, CorpEmployeePosition.Engineer, shareSize * 2);
                ns.corporation.setAutoJobAssignment(tobaccoDivision.name, city, CorpEmployeePosition.Business, (shareSize * 1) + remainder);
                ns.corporation.setAutoJobAssignment(tobaccoDivision.name, city, CorpEmployeePosition.Management, shareSize * 2);
            }
            else {
                ns.corporation.setAutoJobAssignment(tobaccoDivision.name, city, CorpEmployeePosition.Operations, 1);
                ns.corporation.setAutoJobAssignment(tobaccoDivision.name, city, CorpEmployeePosition.Engineer, 1);
                ns.corporation.setAutoJobAssignment(tobaccoDivision.name, city, CorpEmployeePosition.Business, 1);
                ns.corporation.setAutoJobAssignment(tobaccoDivision.name, city, CorpEmployeePosition.Management, 1);
                ns.corporation.setAutoJobAssignment(tobaccoDivision.name, city, CorpEmployeePosition.ResearchAndDevelopment, Math.max(office.employees-4, 0));

            }
        }

    }
}

async function manageCorp(ns: NS) {
    await ns.sleep(10);
    corpo = ns.corporation.getCorporation();
    if (corpo.divisions.includes(agricultureDivisionName)) agricultureDivision = ns.corporation.getDivision(agricultureDivisionName);
    if (corpo.divisions.includes(tobaccoDivisionName)) tobaccoDivision = ns.corporation.getDivision(tobaccoDivisionName);
    if (ns.corporation.getBonusTime()>10000) {
        simulationSpeed = 1;
    }
    else {
        simulationSpeed = 0.1
    }
    if (!corpo.divisions.includes(tobaccoDivisionName)&& corpo.funds && corpo.funds > (10^120) && false) {
        ns.print(`corpo funds: ${ns.formatNumber(corpo.funds)}`);
        tobaccoDivision = await attemptToCreateDivision(ns, "Tobacco", tobaccoDivisionName);
    }
    //livePrint.push(`tobaccoDivision: ${!!tobaccoDivision}`);

    
    await manageOffice(ns);

    if (agricultureDivision) manageAgricultureDivision(ns);
    //if (tobaccoDivision) manageTobaccoDivision(ns);

	ns.print(preprint.join("\n"));
    printCorpo(ns);
	ns.print(postprint.join("\n"));
	preprint = [];
	postprint = [];
}

function manageAgricultureDivision(ns: NS) {
    
}

function manageTobaccoDivision(ns: NS) {
    if (!tobaccoDivision) {
        return
    }

    buyUpgrades(ns);

    var products = tobaccoDivision.products.map((productName) => { 
        return ns.corporation.getProduct(tobaccoDivision.name, productName);
    });

    for (var product of products) {
        //ns.corporation.setProductMarketTA2(tobaccoDivision.name, product.name, true);
    }

    if (products.length == 3) {
        //products.sort((a, b) => {return ns.corporation.product})
    }
}

function buyUpgrades(ns: NS) {
    corpo = ns.corporation.getCorporation();
    var wilson = "Wilson Analytics"
    var wilsonCost = ns.corporation.getUpgradeLevelCost(wilson);
    var advertCost = ns.corporation.getHireAdVertCost(tobaccoDivision.name);
    var aevumSizeUpgradecost = ns.corporation.getOfficeSizeUpgradeCost(tobaccoDivision.name, CityName.Aevum, 15);

    if (tobaccoDivision && wilsonCost < corpo.funds) {
        ns.corporation.levelUpgrade(wilson);
        return
    }
    if (tobaccoDivision && advertCost < 0.1 * wilsonCost && advertCost < corpo.funds) {
        ns.corporation.hireAdVert(tobaccoDivision.name);
        return
    }
    if (tobaccoDivision && aevumSizeUpgradecost < 0.1 * wilsonCost && aevumSizeUpgradecost < corpo.funds) {
        ns.corporation.upgradeOfficeSize(tobaccoDivision.name, CityName.Aevum, 15);
        return
    }
    for (var city of cities) {
        var sizeUpgradecost = ns.corporation.getOfficeSizeUpgradeCost(tobaccoDivision.name, city, 15);
        if (sizeUpgradecost < 0.1 * wilsonCost && sizeUpgradecost < corpo.funds * 0.01) {
            ns.corporation.upgradeOfficeSize(tobaccoDivision.name, city, 15);
            return
        }

    }

    var upgrades: string[] = [
        "Project Insight", 
        "Neural Accelerators", 
        "Nuoptimal Nootropic Injector Implants", 
        "Speech Processor Implants",
        "FocusWires"
    ];
    for (var upgradeName of upgrades) {
        corpo = ns.corporation.getCorporation();
        var upgradeCost = ns.corporation.getUpgradeLevelCost(upgradeName);
        var upgradeLevel = ns.corporation.getUpgradeLevel(upgradeName);
        if (upgradeCost < 0.1 * wilsonCost && upgradeCost < corpo.funds * 0.001) {
            ns.corporation.levelUpgrade(upgradeName);
            return
        }
    }
    
}

async function manageOffice(ns: NS) {

    for (var divisionName of [agricultureDivision?.name, tobaccoDivision?.name].filter((divisionName) => {return !!divisionName})) {
        var division = ns.corporation.getDivision(divisionName);
        for (var city of division.cities) {
            var office = ns.corporation.getOffice(divisionName, city);

            if (division.type == "Tobacco" && office.size < (tobaccoOfficeSizes.get(city) || 9)) {
                ns.corporation.upgradeOfficeSize(tobaccoDivision.name, city, (tobaccoOfficeSizes.get(city) || 9) - office.size);
            }
            
            if (division.type == "Agriculture" && office.size < (agricultureOfficeSizes.get(city) || 3)) {
                ns.corporation.upgradeOfficeSize(agricultureDivision.name, city, (agricultureOfficeSizes.get(city) || 3) - office.size);
            }


            if (office.employees < office.size) {
                ns.corporation.hireEmployee(divisionName, city);
            }
            else {
                if (office.avgEne < office.maxEne) {
                    ns.corporation.buyCoffee(divisionName, city);
                }
                if (office.avgHap < office.maxHap || office.avgMor < office.maxMor) {
                    ns.corporation.throwParty(divisionName, city, partyFundPerPerson);
                }
            }
        }
    }



}

async function assignEmployeeJobs(ns: NS, division: Division) {
    
    for (var city of cities) {
        var office = ns.corporation.getOffice(division.name, city);
        if (division.type == "Tobacco") {
            var employees = office.employees;
            var employeeDistribution: Map<CorpEmployeePosition, number>;
            var dumpPosition: CorpEmployeePosition;
            var employeeJobs: Map<CorpEmployeePosition, number> = new Map();
            if (city == CityName.Aevum) {
                dumpPosition = CorpEmployeePosition.Engineer;
                employeeDistribution = new Map([[CorpEmployeePosition.Operations, 2],
                                                [CorpEmployeePosition.Engineer, 2],
                                                [CorpEmployeePosition.Business, 1],
                                                [CorpEmployeePosition.Management, 2],
                                                [CorpEmployeePosition.ResearchAndDevelopment, 2]]);
            }
            else {
                dumpPosition = CorpEmployeePosition.ResearchAndDevelopment;
                employeeDistribution = new Map([[CorpEmployeePosition.Operations, -1],
                                                [CorpEmployeePosition.Engineer, -1],
                                                [CorpEmployeePosition.Business, -1],
                                                [CorpEmployeePosition.Management, -1],
                                                [CorpEmployeePosition.ResearchAndDevelopment, 1]]);
            }
            
            var totalShares: number = 0;
            await clearEmployeeJobs(ns, division, city, office);
            postprint.push(`Unassigned employees in ${city}: ${office.employeeJobs[CorpEmployeePosition.Unassigned]}`);
            
            for (var position of employeeDistribution.keys()) {
                if (employeeDistribution.get(position) == -1 && employees) {
                    //office.employeeJobs[position] = 1;
                    ns.corporation.setAutoJobAssignment(division.name, city, position, 1);
                    postprint.push(`Assigned default ${1} employees to ${position} in ${city} for ${division.name}`);
                    employees--;
                    employeeDistribution.delete(position);
                } else {
                    var shares = employeeDistribution.get(position);
                    if (shares) {
                        totalShares += shares;
                    };
                }
            }

            var employeesPerShare = Math.floor(employees/totalShares);
            postprint.push(`total employees = ${office.employees}; total shares = ${totalShares}; employees per share = ${employeesPerShare}`);
            for (var position of employeeDistribution.keys()) {
                var shares = employeeDistribution.get(position);
                if (shares && employees > 0) {
                    //office.employeeJobs[position] = shares * employeesPerShare;
                    ns.corporation.setAutoJobAssignment(division.name, city, position, shares * employeesPerShare);
                    postprint.push(`Assigned ${shares * employeesPerShare} employees from ${shares} shares to ${position} in ${city} for ${division.name}`);
                    employees -= office.employeeJobs[position];
                }
            }
            office.employeeJobs[dumpPosition] = employees;
            ns.corporation.setAutoJobAssignment(division.name, city, dumpPosition, employees);
            postprint.push(`Dumped ${employees} employees to ${dumpPosition} in ${city} for ${division.name}`);
        }
        
    }
}

async function clearEmployeeJobs(ns: NS, division: Division, city: CityName, office: Office) {
    for (var position of WorkingEmployeePositions) {
        if (position != "Unassigned") {
            ns.corporation.setAutoJobAssignment(division.name, city, position, 0);
        }
    }
}

async function buyToAmount(ns: NS, division: Division, city: CityName, materialName: string, amount: number) {
    if (!ns.corporation.hasUnlockUpgrade("Warehouse API")) {
        ns.print(`Missing Warehouse API, cannot autobuy materials`);
        return
    }
    var materialData: Material = ns.corporation.getMaterial(division.name, city, materialName)
    while (materialData.qty < amount) {
        ns.corporation.buyMaterial(division.name, city, materialName, amount/10);
        await ns.sleep(10);
    }
    ns.corporation.buyMaterial(division.name, city, materialName, 0);
}

async function buyWarehouses(ns: NS, division: Division, cities: CityName[]) {
    ns.print(`buying warehouses for ${division.name}.`);
    ns.print(`Cities left without warehouse: ${cities}`);
    if (cities.length == 0) return
    for (var city of cities) {
        ns.print(`buying warehouse for ${division.name} in ${city}.`);
        ns.corporation.purchaseWarehouse(division.name, city);
        await ns.sleep(10);
    }
}
//TODO: fix city expansion buying
async function expandToAllCities(ns: NS, division: Division) {
    livePrint.push(`current cities: ${JSON.stringify(division.cities)}`);
    for (var city of cities.filter((value) => {return !division.cities.includes(value)})) {
        ns.corporation.expandCity(division.name, city);
        await ns.sleep(10);
    }
}

async function attemptToCreateCorp(ns: NS, corpName: string) {
    ns.print("Creating corp")
    while (!ns.corporation.hasCorporation()) {
        ns.print(`attempting to make corp ${corpName}`);
        var createdCorp = ns.corporation.createCorporation(corpName, ns.getPlayer().bitNodeN != 3)
        if (createdCorp) {
            ns.toast(`Created corp ${corpName}!`); 
        }
        await ns.sleep(5000);
    }
}

async function attemptToCreateDivision(ns: NS, industry: CorpIndustryName, divisionName: string): Promise<Division> {
    ns.print(`creating division ${divisionName} in ${industry}`);
    while (!corpo.divisions.includes(divisionName)) {
        ns.print(`Attempting to make ${industry} division ${divisionName}`);
        ns.corporation.expandIndustry(industry, divisionName);
        await ns.sleep(1000);
        corpo = ns.corporation.getCorporation();
    }
    var division = ns.corporation.getDivision(divisionName);
    while (!ns.corporation.hasUnlockUpgrade("Smart Supply")){
        ns.print(`Attempting to buy smart supply`);
        ns.corporation.unlockUpgrade("Smart Supply");
        await ns.sleep(1000);
    }
    //ns.print(division);
    while (division.cities.length < cities.length) {
        ns.print("expanding division")
        await expandToAllCities(ns, division);
        await ns.sleep(1000);
        division = ns.corporation.getDivision(divisionName);
    }
    if (ns.corporation.hasUnlockUpgrade("Warehouse API")) {
        ns.print("considering warehouses")
        var warehouselessCities = division.cities.filter((cityName: CityName) => { 
            ns.print(`considering ${cityName}`);
            return !ns.corporation.hasWarehouse(division.name, cityName);
            });
            
        if (warehouselessCities.length > 0) await buyWarehouses(ns, division, warehouselessCities);
        else ns.print("all cities have warehouses")
    }
    else {
        ns.print(`cannot automate buying of warehouses`);
    }
    return division;
}

function managePrices(ns: NS) {
    if (tobaccoDivision) {
        var products = tobaccoDivision.products;
        for (var index in products) {
            if (!tobaccoProductMinPrices[index]) {
                //tobaccoProductMinPrices[index] = tobaccoDivision.pro
            }
        }
    }
}

function printCorpo(ns: NS) {
    const columns = ["NAME", "REVENUE", "EXPEND", "PROFIT", "%"];
    var corpo = ns.corporation.getCorporation()
    livePrint.push(`Corp Name: ${corpo.name}`);
    livePrint.push(`Corp funds: ${ns.formatNumber(corpo.funds)}`);
    livePrint.push(`Corp Revenue: ${ns.formatNumber(corpo.revenue)}`);
    livePrint.push(`Corp Expendature: ${ns.formatNumber(corpo.expenses)}`);
    livePrint.push(`Corp profit: ${ns.formatNumber(corpo.revenue - corpo.expenses)}`);
	livePrint.push(`${localeHHMMSS()} - bonus time: ${ns.formatNumber(ns.corporation.getBonusTime()/1000)}`);
    var rows: string[][] = [];
    for (let divisionName of corpo.divisions){
        var division = ns.corporation.getDivision(divisionName)
        var row = [
            division.name,
            ns.formatNumber(division.lastCycleRevenue),
            ns.formatNumber(division.lastCycleExpenses),
            ns.formatNumber(division.lastCycleRevenue - division.lastCycleExpenses),
            ns.formatNumber(((division.lastCycleRevenue - division.lastCycleExpenses) / (corpo.revenue - corpo.expenses)) || 0)
        ];
        // livePrint.push(`Div Name: ${division.name}`);
        // livePrint.push(`Revenue: ${ns.nFormat(division.lastCycleRevenue, "0.00a")}`);
        // livePrint.push(`Expendature: ${ns.nFormat(division.lastCycleExpenses, "0.00a")}`);
        // livePrint.push(`Profit: ${ns.nFormat(division.lastCycleRevenue - division.lastCycleExpenses, "0.00a")}`);

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
    livePrint = [];
}

function localeHHMMSS(ms: number = 0): string {
	if (!ms) {
		ms = new Date().getTime()
	}
	return new Date(ms).toLocaleTimeString()
}