import {NS} from "../../NetscriptDefinitions"

export function autocomplete(data: {servers: string[], txts: string[], scripts: string[], flags: string[]}, args: string[]) {
    return [...data.servers]; // This script autocompletes the list of servers.
}