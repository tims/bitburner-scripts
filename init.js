/** @param {import(".").NS } ns */
export async function main(ns) {
    var ram = 0;
    var minRam = 0;
    var minMoney = 1000000000 * 5; //1B * x
    var availableMoney = ns.getServerMoneyAvailable("home") - minMoney;
    var serverCount = ns.getPurchasedServers().length;

    for (var host of ns.getPurchasedServers()) {
        minRam = Math.max(ram, ns.getServerMaxRam(host));
    }

    for (var i = 1; i <= 20; i++) {
		var cost = ns.getPurchasedServerCost(Math.pow(2, i));
        if (cost < availableMoney) {
            ram = Math.pow(2, i);
        }
	}
    ram = Math.max(minRam, ram);
    ns.tprint("next server ram ", ns.nFormat(ram * 1000000000, '0b'));
    var serverCost = serverCount < ns.getPurchasedServerLimit() ? ns.getPurchasedServerCost(ram) : Infinity;
    var homeRamCost = Infinity; //ns.getUpgradeHomeRamCost();
    ns.tprint("serverCost = " + serverCost);
    ns.tprint("homeRamCost = " + homeRamCost);

    if (Math.min(serverCost, homeRamCost) > availableMoney) {
        ns.tprint("not enough money, need " + ns.nFormat(Math.min(serverCost, homeRamCost), "$0.0a"));
        return;
    }

    var name = "nemo" + serverCount + '-' + ns.nFormat(ram * 1000000000, '0b');
    ns.tprint({name, serverCost, homeRamCost});
    
    if (homeRamCost < Infinity && homeRamCost < serverCost) {
        var upgraded = ns.upgradeHomeRam();    
        ns.tprint("Home RAM upgrade cost = " + ns.nFormat(homeRamCost, '$0.0a') + " upgraded = " + JSON.stringify(upgraded));
    } else if (serverCost < Infinity) {
        var upgraded = ns.purchaseServer(name, ram);
        ns.tprint("Server " + name + " cost = " + ns.nFormat(serverCost, '$0.0a') + " purchased = " + JSON.stringify(upgraded));
	} else {
        ns.tprint("Nothing to purchase");
    }
}
