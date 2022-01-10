class Upgrader {
	constructor(ns) {
		this.ns = ns;
	}
	getCost(type, i) {
		switch (type) {
			case "node":
				return this.ns.hacknet.getPurchaseNodeCost();
			case "ram":
				return this.ns.hacknet.getRamUpgradeCost(i);
			case "core":
				return this.ns.hacknet.getCoreUpgradeCost(i);
			case "level":
				return this.ns.hacknet.getLevelUpgradeCost(i);
			case "cache":
				return this.ns.hacknet.getCacheUpgradeCost(i);
			default:
				throw "unknown type to upgrade";
		}
	}
	upgrade(type, i) {
		switch (type) {
			case "node": 
				return this.hacknet.purchaseNode();
			case "ram":
				return this.ns.hacknet.upgradeRam(i, 1);
			case "core":
				return this.ns.hacknet.upgradeCore(i, 1);
			case "level":
				return this.ns.hacknet.upgradeLevel(i, 1);
			case "cache":
				return this.ns.hacknet.upgradeCache(i, 1);
			default:
				throw "unknown type to upgrade";
		}
	}
}

function getMinUpgrade(upgrade1, upgrade2) {
	if (upgrade1 == null || upgrade1.cost == null) {
		return upgrade2;
	}
	if (upgrade2 == null || upgrade2.cost == null) {
		return upgrade1;
	}
	return upgrade1.cost <= upgrade2.cost ? upgrade1 : upgrade2;
}

/** @param {NS} ns **/
export async function main(ns) {
	for (var i = 0; i < 1000; i++) { 
		var upgrades = {
			hacknet: {
				node: [{
					cost: ns.hacknet.getPurchaseNodeCost(),
					apply: () => ns.hacknet.purchaseNode(),
				}],
				ram: [...Array(ns.hacknet.numNodes()).keys()].map((i) => { return {
					cost: ns.hacknet.getRamUpgradeCost(i, 1),
					apply: () => ns.hacknet.upgradeRam(i, 1),
					node: i
				}}),
				core: [...Array(ns.hacknet.numNodes()).keys()].map((i) => { return {
					cost: ns.hacknet.getCoreUpgradeCost(i, 1),
					apply: () => ns.hacknet.upgradeCore(i, 1),
					node: i
				}}),
				level: [...Array(ns.hacknet.numNodes()).keys()].map((i) => { return {
					cost: ns.hacknet.getLevelUpgradeCost(i, 1),
					apply: () => ns.hacknet.upgradeLevel(i, 1),
					node: i
				}}),
				cache: [...Array(ns.hacknet.numNodes()).keys()].map((i) => { return {
					cost: ns.hacknet.getCacheUpgradeCost(i, 1),
					apply: () => ns.hacknet.upgradeCache(i, 1),
					node: i
				}})
			}
		}
		var minUpgrade = null;
		for (var type in upgrades.hacknet) {
			for (var upgrade of upgrades.hacknet[type]) {
				// ns.tprint({type, ...upgrade});
				minUpgrade = getMinUpgrade(minUpgrade, {type, ...upgrade})
			}
		}
		if (!Number.isNaN(minUpgrade.cost) && minUpgrade.cost !== Infinity) {
			ns.tprint(minUpgrade);
			ns.tprint(minUpgrade.apply())
		}
	}
	return;
 

	ns.tprint("Hacknet auto bot");
	var minMoney =     2000000;
	var maxPurchase = 10000000;
	var nodeCost = ns.hacknet.getPurchaseNodeCost();
	var upgrader = new Upgrader(ns);
	while (true) {
		var upgrade = null;
		var nodeCost = ns.hacknet.getPurchaseNodeCost();
		upgrade = getMinUpgrade(upgrade, nodeCost, "node");
		for (var i = 0; i < ns.hacknet.numNodes(); i++) {
			for (var type of ["ram", "core", "level"]) {
				var cost = upgrader.getCost(type, i);
				upgrade = minUpgrade(upgrade, cost, type, i);
			}
		}
		if (upgrade != null && upgrade.cost < maxPurchase) {
			var availableMoney = Math.max(ns.getServerMoneyAvailable("home") - minMoney, 0);
			if (availableMoney < upgrade.cost) {
				ns.print("Not enough money retrying later. " + JSON.stringify(upgrade));
				await ns.sleep(10000);
			} else {
				ns.print("Purchasing " + JSON.stringify(upgrade));
				upgrader.upgrade(upgrade.type, upgrade.node);
			}
		} else {
			ns.print("Nothing more to upgrade");
			break;
		}
	}
}