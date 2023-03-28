import { NS } from "../NetscriptDefinitions";

export async function main(ns: NS) {
	ns.tprint(`BitNode: ${ns.getPlayer().bitNodeN}`);
	//@ts-ignore
	ns.tprint(`karma: ${ns.heart.break()}`);
}