import { FactionName } from "./lib/FactionName";
import {NS} from "../NetscriptDefinitions"

export function autocomplete(data: {servers: string[], txts: string[], scripts: string[], flags: string[]}, args: string[]) {
    return [...enumKeys(FactionName)]; // This script autocompletes the list of servers.
}

function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
    return Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];
}

function enumValues<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
    return Object.values(obj).filter(k => Number.isNaN(+k)) as K[];
}

export async function main(ns: NS) {
    while (true){
        await ns.share()
    }
}