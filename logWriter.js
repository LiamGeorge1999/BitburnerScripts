/** @param {import(".").NS} ns **/
export async function main(ns) {
    if (!ns.args[0] || !ns.args[1]) { 
        ns.print(`[ERROR] FATAL ERROR: NULL (FALSEY) ARGS: ${ns.args.join(",")}`);
        ns.exit();
    }
    ns.print(`Args: "${ns.args.join("\", \"")}"`);
    await ns.write(ns.args[0], ns.args[1]);
}