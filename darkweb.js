/** @param {import(".").NS } ns */
export async function main(ns) {
    if (!ns.purchaseTor()) {
        ns.tprint("Failed to buy TOR server");
        return;
    }

    let programs = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe", "ServerProfiler.exe", "DeepscanV1.exe", "DeepscanV2.exe", "AutoLink.exe", "Formulas.exe"]
    let purchased = [];
    while (purchased.length < programs.length) {
        for (let program of programs) {
            if (purchased.includes(program)) {
                continue;
            }

            if (ns.fileExists(program)) {
                ns.print("Already owns " + program);
                purchased.push(program);
            } else if (ns.purchaseProgram(program)){
                ns.print("Succeeded buying " + program);
                purchased.push(program);
            } else {
                ns.print("Failed buying " + program);
            }
        }
        ns.sleep(10000);
    }
    ns.tprint("All programs purchased");
}