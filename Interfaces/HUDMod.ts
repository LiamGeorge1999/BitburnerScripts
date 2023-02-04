/** @param {NS} ns **/
import {NS} from "../NetscriptDefinitions"
export async function main(ns: NS) {
    const args = ns.flags([["help", false]]);
    const debugMode = false;

    if (args.help) {
        ns.tprint("This script will enhance your HUD (Heads up Display) with custom statistics.");
        ns.tprint(`Usage: run ${ns.getScriptName()}`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()}`);
        return;
    }

    if (debugMode) ns.print("not a help call");
    if (!debugMode) ns.disableLog("sleep");

    ns.print("getting HTML elements");
    var player;
    const doc = document; // This is expensive! (25GB RAM) Perhaps there's a way around it? ;)
    const hook0 = doc.getElementById('overview-extra-hook-0');
    const hook1 = doc.getElementById('overview-extra-hook-1');


    while (true) {
        if (debugMode) ns.print("attempting to retrieve details");
        try {
            if (debugMode) ns.print("getting Player");
            player = ns.getPlayer();
            const headers = ["karma"];
            if (debugMode) ns.print("getting & formatting Karma");
            const karma = Math.floor(heartbreak(ns));
            const values = [ns.nFormat(karma, "0.00a")];
            if (debugMode) ns.print("Updating HTML elements")
            // Now drop it into the placeholder elements
            if (hook0) hook0.innerText = headers.join(" \n");
            if (hook1) hook1.innerText = values.join("\n");
            var karmaPercent = Math.floor(karma/(-5400));
            var karmabar = `<span class="MuiLinearProgress-root MuiLinearProgress-colorPrimary MuiLinearProgress-determinate css-1l4f89k" role="progressbar" aria-valuenow="${karmaPercent}" aria-valuemin="0" aria-valuemax="100">
                                <span class="MuiLinearProgress-bar MuiLinearProgress-barColorPrimary MuiLinearProgress-bar1Determinate css-1tze08t" style="transform: translateX(-${100-karmaPercent}%);">
                                </span>
                                </span>`

            ns.print("Finished update");
        } catch (err) { // This might come in handy later
            ns.print("ERROR: Update Skipped: " + String(err));
        }
        await ns.sleep(1000);
    }
}

function heartbreak(ns: NS): number {
    // @ts-ignore
    return ns.heart.break()
}