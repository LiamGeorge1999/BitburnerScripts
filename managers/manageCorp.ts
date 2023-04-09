//@typescript-ignore
import { enumKeys, enumVals } from "../lib/EnumTools.js"
import { TableMaker } from "../lib/tableMaker.js"
import { CityName } from "../lib/CityName.js"
import { CorpUnlock } from "../lib/CorpUnlock.js"
import { CorpUpgrade } from "../lib/CorpUpgrade.js"
import { CorpMaterial } from "../lib/CorpMaterial.js"
import { CorpEmployeePosition, WorkingEmployeePositions } from "../lib/CorpEmployeePosition.js"
import {CorpIndustryName, CorporationInfo, Division, JobName, Material, NS, Office, CorpUpgradeName} from "../../NetscriptDefinitions"

var corpName: string = "Babbage Corp";
var corpo: CorporationInfo;

var agricultureDivisionName: string = "Babbage's Cabbages";
var agricultureDivision: Division;
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

var employeeAllocations: { [division: string]: { [city: string]: { [position: string]: number } } } = {};

var simulationSpeed = 0.1;

var preprint: string[] = [];
var postprint: string[] = [];


const partyFundPerPerson = 500000;
enum CorporationStage {
    EarlyAgri = "Early Agri",
    MidAgri = "Mid Agri",
    LateAgri = "Late Agri",
    EarlyTobacco = "Early Tobacco",
    MidTobacco = "Mid Tobacco",
    LateTobacco = "Late Tobacco"
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
    ns.disableLog("ALL");
    if (!ns.corporation.hasCorporation()) await attemptToCreateCorp(ns, corpName);
    corpo = ns.corporation.getCorporation();
    if (!corpo.divisions.includes(agricultureDivisionName)) await attemptToCreateDivision(ns, "Agriculture", agricultureDivisionName);
    corpName = corpo.name;
    while (corpo && await ns.sleep(10)) {
        while (corpo.state == "EXPORT" && await ns.sleep(10)) await manageCorp(ns);
        while (corpo.state != "EXPORT" && await ns.sleep(10)) await manageCorp(ns);
        oncePerTick(ns);
        // if (agricultureDivision) await assignEmployeeJobs(ns, agricultureDivision);
        // if (tobaccoDivision) await assignEmployeeJobs(ns, tobaccoDivision);
    }
    ns.print("[ERROR] Couldn't find corpo");
}

function oncePerTick(ns: NS) {
    allocateEmployeeJobs(ns);
}

function allocateEmployeeJobs(ns: NS) {
    for (let division in employeeAllocations) {
        for (var city in employeeAllocations[division]) {
            for (var position in employeeAllocations[division][city]) {
                var currentEmployeesInPosition = ns.corporation.getOffice(division, city as CityName).employeeJobs[position as CorpEmployeePosition];
                if (currentEmployeesInPosition && currentEmployeesInPosition != employeeAllocations[division][city][position]) {
                    for (var position2 in employeeAllocations[division][city]) ns.corporation.setAutoJobAssignment(division, city as CityName, position2, 0);
                    for (var position2 in employeeAllocations[division][city]) ns.corporation.setAutoJobAssignment(division, city as CityName, position2, employeeAllocations[division][city][position2]);
                    
                }
            }
        }
    }
}

async function manageCorp(ns: NS) {
    corpo = ns.corporation.getCorporation();
    if (corpo.divisions.includes(agricultureDivisionName)) agricultureDivision = ns.corporation.getDivision(agricultureDivisionName);
    if (corpo.divisions.includes(tobaccoDivisionName)) tobaccoDivision = ns.corporation.getDivision(tobaccoDivisionName);
    determineStage(ns);
    if (ns.corporation.getBonusTime()>10000) {
        simulationSpeed = 1;
    }
    else {
        simulationSpeed = 0.1
    }

    await manageOffices(ns);

    if (agricultureDivision) await manageAgricultureDivision(ns);
    if (tobaccoDivision) manageTobaccoDivision(ns);

    printCorpo(ns);

}

function determineStage(ns: NS) {
    var investmentOfferRound = ns.corporation.getInvestmentOffer().round
    if (investmentOfferRound == 1) stage = CorporationStage.EarlyAgri;
    if (investmentOfferRound == 2) stage = CorporationStage.MidAgri;
    if (investmentOfferRound == 3) stage = CorporationStage.LateAgri;
    if (tobaccoDivision) stage = CorporationStage.EarlyTobacco;
}

 async function manageAgricultureDivision(ns: NS) {
    var employeeAllocation: { [city: string]: { [position: string]: number } } = {}
    for (var city of cities) {
        ns.corporation.sellMaterial(agricultureDivision.name, city, CorpMaterial.Food, "MAX", "MP");
        ns.corporation.sellMaterial(agricultureDivision.name, city, CorpMaterial.Plants, "MAX", "MP");
    }
    if (stage == CorporationStage.EarlyAgri) {
        levelUpgrade(ns, CorpUpgrade.SmartFactories, 2);
        levelUpgrade(ns, CorpUpgrade.NuoptimalNootropicInjectorImplants, 2);
        levelUpgrade(ns, CorpUpgrade.SpeechProcessorImplants, 2);
        levelUpgrade(ns, CorpUpgrade.NeuralAccelerators, 2);
        levelUpgrade(ns, CorpUpgrade.FocusWires, 2);
        if (ns.corporation.getHireAdVertCount(agricultureDivision.name) < 1) ns.corporation.hireAdVert(agricultureDivision.name);
        for (var city of cities) {
            employeeAllocation[city] = createEmployeeAllocation(1, 1, 1, 0, 0, 0, 0);
            while (ns.corporation.getWarehouse(agricultureDivision.name, city).size < 300) ns.corporation.upgradeWarehouse(agricultureDivision.name, city);
            buyToAmount(ns, agricultureDivision, city, CorpMaterial.Hardware, 125);
            buyToAmount(ns, agricultureDivision, city, CorpMaterial.AICores, 75);
            buyToAmount(ns, agricultureDivision, city, CorpMaterial.RealEstate, 27000);
        }
        if (ns.corporation.getInvestmentOffer().funds + corpo.funds > 210000000000) {
            ns.corporation.acceptInvestmentOffer();
        }
    } else if (stage == CorporationStage.MidAgri) {
        levelUpgrade(ns, CorpUpgrade.SmartFactories, 10);
        levelUpgrade(ns, CorpUpgrade.SmartStorage, 10);
        for (var city of cities) {
            employeeAllocation[city] = createEmployeeAllocation(3, 2, 2, 2, 0, 0, 0);
            while (ns.corporation.getOffice(agricultureDivision.name, city).size < 9) {
                ns.corporation.upgradeOfficeSize( agricultureDivision.name, city, 3);
            }
            while (ns.corporation.getWarehouse(agricultureDivision.name, city).size < 2000) ns.corporation.upgradeWarehouse(agricultureDivision.name, city);
            buyToAmount(ns, agricultureDivision, city, CorpMaterial.Hardware, 2800);
            buyToAmount(ns, agricultureDivision, city, CorpMaterial.Robots, 96);
            buyToAmount(ns, agricultureDivision, city, CorpMaterial.AICores, 2520);
            buyToAmount(ns, agricultureDivision, city, CorpMaterial.RealEstate, 146400);
        }
        if (ns.corporation.getInvestmentOffer().funds + corpo.funds > 5000000000000) {
            ns.corporation.acceptInvestmentOffer();
        }
    } else {
        for (var city of cities) {
            employeeAllocation[city] = createEmployeeAllocation(3, 2, 2, 2, 0, 0, 0);
            while (ns.corporation.getWarehouse(agricultureDivision.name, city).size < 3800) ns.corporation.upgradeWarehouse(agricultureDivision.name, city);
            buyToAmount(ns, agricultureDivision, city, CorpMaterial.Hardware, 9300);
            buyToAmount(ns, agricultureDivision, city, CorpMaterial.Robots, 726);
            buyToAmount(ns, agricultureDivision, city, CorpMaterial.AICores, 6270);
            buyToAmount(ns, agricultureDivision, city, CorpMaterial.RealEstate, 230400);
            if (!tobaccoDivision) tobaccoDivision = await attemptToCreateDivision(ns, "Tobacco", tobaccoDivisionName);
        }
    }
    employeeAllocations[agricultureDivision.name] = employeeAllocation;
}

function manageTobaccoDivision(ns: NS) {
    levelUpgrade(ns, CorpUpgrade.ProjectInsight, 10);
    levelUpgrade(ns, CorpUpgrade.NuoptimalNootropicInjectorImplants, 20);
    levelUpgrade(ns, CorpUpgrade.SpeechProcessorImplants, 20);
    levelUpgrade(ns, CorpUpgrade.NeuralAccelerators, 20);
    levelUpgrade(ns, CorpUpgrade.FocusWires, 20);
    levelUpgrade(ns, CorpUpgrade.DreamSense, 30);

    if (!ns.corporation.hasResearched(tobaccoDivision.name, "Hi-Tech R&D Laboratory") && tobaccoDivision.research > 5000) ns.corporation.research(tobaccoDivision.name, "Hi-Tech R&D Laboratory");

    var employeeAllocation: { [city: string]: { [position: string]: number } } = {};
    for (var city of cities) {
        if (city == CityName.Aevum) {
            var employeeCount = ns.corporation.getOffice(tobaccoDivision.name, city).employees;
            var shareSize = Math.floor(employeeCount/7)
            if (employeeCount > 4) employeeAllocation[city] = createEmployeeAllocation(2*shareSize, 2*shareSize, shareSize, 2*shareSize, (employeeCount-7*shareSize));
            else createEmployeeAllocation();
        }
        else {
            var employeeCount = ns.corporation.getOffice(tobaccoDivision.name, city).employees;
            if (employeeCount > 4) employeeAllocation[city] = createEmployeeAllocation(1, 1, 1, 1, (employeeCount-4), 0, 0);
            else createEmployeeAllocation();
        }
    }
    employeeAllocations[tobaccoDivision.name] = employeeAllocation;
    if (!tobaccoDivision) {
        return
    }
    manageProducts(ns, tobaccoDivision);
    if (ns.corporation.getUpgradeLevelCost(CorpUpgrade.WilsonAnalytics) < 10 * corpo.funds) return !(ns.corporation.getUpgradeLevelCost(CorpUpgrade.WilsonAnalytics) < corpo.funds) || ns.corporation.levelUpgrade(CorpUpgrade.WilsonAnalytics);
    if (ns.corporation.getHireAdVertCost(tobaccoDivision.name) < corpo.funds) return ns.corporation.hireAdVert(tobaccoDivision.name);
    if (ns.corporation.getOfficeSizeUpgradeCost(tobaccoDivision.name, CityName.Aevum, 15) < corpo.funds) return ns.corporation.upgradeOfficeSize(tobaccoDivision.name, CityName.Aevum, 15);
    for (var city of cities.filter((city) => { return city != CityName.Aevum 
                                                    && ns.corporation.getOffice(tobaccoDivision.name, city).size + 60 < ns.corporation.getOffice(tobaccoDivision.name, CityName.Aevum).size})) {
        return ns.corporation.upgradeOfficeSize(tobaccoDivision.name, city, 15);
    }
    buyUpgrades(ns);
}

function manageProducts(ns: NS, division: Division) {
    var maxProducts = 3;
    if (ns.corporation.hasResearched(division.name, "uPgrade: Capacity.I")) maxProducts++;
    if (ns.corporation.hasResearched(division.name, "uPgrade: Capacity.II")) maxProducts++;
    for (var productName of division.products) {
        for (var city of cities) {
            ns.corporation.sellProduct(division.name, city, productName, "MAX", "MP", true);
        }   
        if (ns.corporation.hasResearched(division.name, "Market-TA.II")) {
            ns.corporation.setProductMarketTA2(division.name, productName, true);
        } else if (division.research > 100000) {ns.corporation.research(division.name, "Market-TA.I"); ns.corporation.research(division.name, "Market-TA.II") }
    }

    var productNamePrefix = division.type.replaceAll(/\s/g, "");
    var products = division.products.map((productName) => { 
        return ns.corporation.getProduct(division.name, productName);
    });
    var nextProductNumber: number = 0;
    for (var product of products) {
        if (product.developmentProgress < 100) {
            return
        }
        nextProductNumber = Math.max(nextProductNumber, Number.parseInt(product.name.substring(productNamePrefix.length)) + 1); 
    }
    
    if (products.length == maxProducts) {
        ns.corporation.discontinueProduct(division.name, division.products.sort((a, b) => { return Number.parseInt(a.substring(productNamePrefix.length)) - Number.parseInt(b.substring(productNamePrefix.length)) })[0]);
    }
    ns.corporation.makeProduct(division.name, CityName.Aevum, productNamePrefix + nextProductNumber.toString(), corpo.funds/100, corpo.funds/100);
}

function levelUpgrade(ns: NS, upgradeName: CorpUpgrade, level: number) {
    while (ns.corporation.getUpgradeLevel(upgradeName) < level && ns.corporation.getUpgradeLevelCost(upgradeName) < corpo.funds) {
        ns.corporation.levelUpgrade(upgradeName);
    }
}

function buyUpgrades(ns: NS) {
    corpo = ns.corporation.getCorporation();

    var upgrades = enumVals(CorpUpgrade)
    for (var upgradeName of upgrades) {
        corpo = ns.corporation.getCorporation();
        var upgradeCost = ns.corporation.getUpgradeLevelCost(upgradeName);
        if (upgradeCost < corpo.funds * 0.001) {
            ns.corporation.levelUpgrade(upgradeName);
            return
        }
    }
    
}

async function manageOffices(ns: NS) {
    for (var divisionName of [agricultureDivision?.name, tobaccoDivision?.name].filter((divisionName) => {return !!divisionName})) {
        var division = ns.corporation.getDivision(divisionName);
        for (var city of division.cities) {
            var office = ns.corporation.getOffice(divisionName, city);

            if (division.type == "Tobacco" && office.size < (tobaccoOfficeSizes.get(city) || 9)) {
                ns.corporation.upgradeOfficeSize(tobaccoDivision.name, city, (tobaccoOfficeSizes.get(city) || 9) - office.size);
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

function buyToAmount(ns: NS, division: Division, city: CityName, materialName: string, amount: number) {
    if (!ns.corporation.hasUnlockUpgrade("Warehouse API")) {
        ns.print(`Missing Warehouse API, cannot autobuy materials`);
        return
    }
    var materialData: Material = ns.corporation.getMaterial(division.name, city, materialName)
    if (materialData.qty < amount) ns.corporation.buyMaterial(division.name, city, materialName, (amount - materialData.qty)/10);
    else ns.corporation.buyMaterial(division.name, city, materialName, 0);
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
        while (!ns.corporation.hasUnlockUpgrade("Smart Supply")){
            ns.print(`Attempting to buy smart supply`);
            ns.corporation.unlockUpgrade("Smart Supply");
            await ns.sleep(1000);
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
            ns.corporation.purchaseWarehouse(division.name, cityName);
            });
            
        if (warehouselessCities.length > 0) await buyWarehouses(ns, division, warehouselessCities);
        else ns.print("all cities have warehouses")
    }
    else {
        ns.print(`cannot automate buying of warehouses`);
    }
    return ns.corporation.getDivision(divisionName);
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

function createEmployeeAllocation(operations: number = 0, engineer: number = 0, business: number = 0, management: number = 0, research: number = 0, training: number = 0, unassigned: number = 0) {
    return {
        "Operations": operations,
        "Engineer": engineer,
        "Business": business,
        "Management": management,
        "Research & Development": research,
        "Training": training,
        "Unassigned": unassigned
    }
}

function printCorpo(ns: NS) {
    const divisionColumns = ["NAME", "REVENUE", "EXPEND", "PROFIT", "%"];
    const productColumns = ["NAME", "PROGRESS", "RATING", "SELLPRICE"];
    var corpo = ns.corporation.getCorporation()
    preprint.push(`Corp Name: ${corpo.name}`);
    preprint.push(`Corp stage: ${stage}`);
    preprint.push(`Corp funds: ${ns.formatNumber(corpo.funds)}`);
    preprint.push(`Corp Revenue: ${ns.formatNumber(corpo.revenue)}`);
    preprint.push(`Corp Expendature: ${ns.formatNumber(corpo.expenses)}`);
    preprint.push(`Corp profit: ${ns.formatNumber(corpo.revenue - corpo.expenses)}`);
	preprint.push(`${localeHHMMSS()} - bonus time: ${ns.formatNumber(ns.corporation.getBonusTime()/1000)}`);
    var divisionRows: string[][] = [];
    var productRows: string[][] = [];
    for (let divisionName of corpo.divisions){
        var division = ns.corporation.getDivision(divisionName)
        var divisionRow = [
            division.name,
            ns.formatNumber(division.lastCycleRevenue),
            ns.formatNumber(division.lastCycleExpenses),
            ns.formatNumber(division.lastCycleRevenue - division.lastCycleExpenses),
            ns.formatNumber(((division.lastCycleRevenue - division.lastCycleExpenses) / (corpo.revenue - corpo.expenses)) || 0)
        ];
        
        for (var product of division.products.map((productName) => { return ns.corporation.getProduct(division.name, productName)})) {
            var productRow: string[] = [
                product.name,
                ns.formatPercent(product.developmentProgress/100),
                ns.formatNumber(product.rat),
                product.sCost.toString()
            ]
            productRows.push(productRow);
        }

        divisionRows.push(divisionRow);
    }
    var divisionsTable = [divisionColumns, ...divisionRows];
    var productTable = [productColumns, ...productRows];
    ns.clearLog()
	ns.print(preprint.join("\n"));
    ns.print(TableMaker.makeTable(divisionsTable));
    ns.print("\n");
    ns.print(TableMaker.makeTable(productTable));
	ns.print(postprint.join("\n"));
	preprint = [];
	postprint = [];
    livePrint = [];
}

function localeHHMMSS(ms: number = 0): string {
	if (!ms) {
		ms = new Date().getTime()
	}
	return new Date(ms).toLocaleTimeString()
}