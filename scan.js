let SLEEP_DURATION_MS = 10000;
let MAX_SCAN_DEPTH = 10;

/** @param {import(".").NS } ns */
function getAllServers(ns) {
	var maxPorts = getMaxPorts(ns);
	var maxDepth = MAX_SCAN_DEPTH;
	return scan(ns, "home", maxDepth).filter(s => s.ports <= maxPorts)
		.filter(s => ns.getServerRequiredHackingLevel(s.host) <= ns.getHackingLevel());
}


/** @param {import(".").NS } ns */
function getMaxPorts(ns) {
	var count = 0;
	if (ns.fileExists("BruteSSH.exe", "home")) {
		count += 1;
	}
	if (ns.fileExists("FTPCrack.exe", "home")) {
		count += 1;
	}
	if (ns.fileExists("relaySMTP.exe", "home")) {
		count += 1;
	}
	if (ns.fileExists("HTTPWorm.exe", "home")) {
		count += 1;
	}
	if (ns.fileExists("SQLInject.exe", "home")) {
		count += 1;
	}
	return count;
}

/** @param {import(".").NS } ns */
function formatServer(ns, server) {
	return {
		...server,
		money: { curr: ns.nFormat((server.money || {}).curr, '$0.0a'), max: ns.nFormat((server.money || {}).max, '$0.0a') },
		ram: ns.nFormat(server.ram * 1000000000, '0b'),
		ramFree: ns.nFormat(server.ramFree * 1000000000, '0b'),
		weakenTime: ns.nFormat(server.weakenTime, '00:00:00'),
		hackTime: ns.nFormat(server.hackTime, '00:00:00'),
		growTime: ns.nFormat(server.growTime, '00:00:00'),
	}
}

/** @param {import(".").NS } ns */
/** @param {string} startHost */
/** @param {number} maxDepth */
function scan(ns, startHost, maxDepth) {
	var servers = [{
		host: startHost,
		ports: 0,
		depth: 0,
		ram: ns.getServerMaxRam(startHost),
		ramFree: ns.getServerMaxRam(startHost) - ns.getServerUsedRam(startHost),
		path: [startHost],
	}];
	var seenHostnames = [];
	var seenServers = [];
	var purchaseServers = ns.getPurchasedServers();
	// BFS
	while (servers.length > 0) {
		var server = servers.shift(); // get next in queue
		seenHostnames.push(server.host);
		seenServers.push(server);
		for (var host of ns.scan(server.host)) {
			if (server.depth < maxDepth && !seenHostnames.includes(host)) {
				var nextServer = {
					host,
					money: { curr: ns.getServerMoneyAvailable(host), max: ns.getServerMaxMoney(host) },
					ram: ns.getServerMaxRam(host),
					ramFree: ns.getServerMaxRam(host) - ns.getServerUsedRam(host),
					ports: purchaseServers.includes(host) ? 0 : ns.getServerNumPortsRequired(host),
					security: { min: ns.getServerMinSecurityLevel(host), curr: ns.getServerSecurityLevel(host) },
					weakenTime: ns.getWeakenTime(host),
					hackTime: ns.getHackTime(host),
					growTime: ns.getGrowTime(host),
					depth: server.depth + 1,
					path: [...server.path, host]
				}
				servers.push(nextServer);
			}
		}
	}
	return seenServers;
}

/** @param {import(".").NS } ns */
function analyze(ns, server) {
	var moneyMinBeforeHack = server.money.max * 0.99;
	var moneyMinAfterHack = server.money.max * 0.50;
	var threads = {
		hack: 0,
		grow: 0,
		weaken: 0
	}
	if (server.security.curr > server.security.min) {
		var weakenRequiredAmount = server.security.curr - (server.security.min);
		for (var i = 1; i <= 1000; i++) {
			if (ns.weakenAnalyze(i) >= weakenRequiredAmount) {
				threads.weaken = i;
				break;
			}
		}
		threads.weaken = i;
	}
	if (server.money.curr >= moneyMinBeforeHack) {
		threads.hack = Math.floor(ns.hackAnalyzeThreads(server.host, server.money.curr - moneyMinAfterHack)) + 1;
	} else if (server.money.curr < moneyMinBeforeHack) {
		threads.grow = Math.floor(ns.growthAnalyze(server.host, moneyMinBeforeHack - server.money.curr)) + 1;
	}
	return threads;
}


class Resources {
	constructor(servers) {
		this.freeRam = {};
		for (var s of servers.filter(s => s.ramFree > 1)) {
			this.freeRam[s.host] = s.ramFree
		}
	}

	request(ramPerThread, neededThreads) {
		var grantedResources = [];
		for (var host in this.freeRam) {
			if (this.freeRam[host] > ramPerThread) {
				var freeThreads = Math.floor(this.freeRam[host] / ramPerThread);
				var grantedThreads = 0;
				if (freeThreads < neededThreads) {
					grantedThreads = freeThreads;
				} else {
					grantedThreads = neededThreads;
				}
				this.freeRam[host] -= ramPerThread * grantedThreads;
				neededThreads -= grantedThreads;
				if (grantedThreads > 0) {
					grantedResources.push({ host, threads: grantedThreads});
				}
			}
		}
		return grantedResources;
	}
}



class ProcessManager {
	// requests resources and starts jobs and ensure we cannot submit processes when target still has pending processes
	constructor() {
		this.pending = {}
	}

	canTarget(targetHost) {
		var timestampSec = Date.now();
		if (!this.pending[targetHost] || this.pending[targetHost].until < timestampSec) {
			this.pending[targetHost] =  { until: -Infinity, action: null, threads: 0};
			return true;
		} else {
			return false;
		}
	}

	registerProcess(host, duration, action, threads, money) {
		var timestampSec = Date.now();
		let totalThreads = this.pending[host] ? this.pending[host].threads + threads : threads;
		this.pending[host] = { until: timestampSec + duration, action, threads: totalThreads, money};
	}

	/** @param {import(".").NS } ns */
	async process(ns, target, resources, script) {
		var scriptRam = ns.getScriptRam(script, "home");
		if (this.canTarget(target.host)) {
			var usedThreads = 0;
			for (var resource of resources.request(scriptRam, target.threads)) {
				this.registerProcess(target.host, target.duration, target.action, target.threads, target.money);
				ns.print("run " + script + " on " + resource.host + " with " + resource.threads + " threads targetting " + target.host + " for " + ns.nFormat(target.duration / 1000, "00:00:00"));
				ns.exec(script, resource.host, resource.threads, target.host);
				usedThreads += resource.threads;
			}
			if (usedThreads < target.threads) {
				ns.print("Not enough resources to run " + script + " targetting " + target.host + ", short by " + (target.threads - usedThreads));
			}
		} else {
			var remaining = this.pending[target.host].until - Date.now();
			ns.print("Target busy, skipping: " + script + " targetting " + target.host + " remaining " + ns.nFormat(remaining / 1000, "00:00:00"));
		}
	}
}


/** @param {import(".").NS } ns */
/** @param {ProcessManager} processManagers */
function printStatus(ns, processManager) {
	ns.print("================================");
	let statuses = [];
	for (let host in processManager.pending) {
		let status = processManager.pending[host];
		if (status && status.until > -Infinity)
			statuses.push("Pending " + ns.nFormat((status.until - Date.now()) / 1000, "00:00:00") + " "  + ns.nFormat(status.money.curr / status.money.max, "0%") + " " 
			+ ns.nFormat(status.money.curr, "$0.0a") + " " + host + " " + status.action + "(" + status.threads + ")");
	}
	statuses.sort();
	statuses.reverse();
	for (let status of statuses) {
		ns.print(status);
	}
}


/** @param {import(".").NS } ns */
export async function main(ns) {
	var homeRamReserved = 0.1;
	// var maxWeakenThreads = 300;
	if (ns.args.length > 0) {
		switch (ns.args[0]) {
			case "killall":
				var allServers = getAllServers(ns);
				allServers.forEach(s => {
					if (s.host != "home") {
						ns.killall(s.host);
					}
				});
				return;
			case "analyze":
				var allServers = getAllServers(ns);
				allServers.forEach(s => {
					ns.tprint(formatServer(ns, s));
				});
				return;
			case "list":
				var allServers = getAllServers(ns);
				allServers.forEach(s => {
					ns.tprint(s.host);
				});
				return;
			case "grep":
				var allServers = getAllServers(ns);
				for (let s of allServers) {
					let re = new RegExp(ns.args[1]);
					if (s.host.match(re)) {
						ns.tprint(formatServer(ns, s));
					}
				}
				return;

		}
	}

	var processManager = new ProcessManager();
	while (true) {
		var purchasedServers = ns.getPurchasedServers();
		var allServers = getAllServers(ns);
		allServers = allServers.map(s => {
			if (s.host == "home") {
				return { ...s, ramFree: Math.max(0, s.ramFree - s.ram * homeRamReserved) };
			} else {
				return s;
			}
		});
		var resources = new Resources(allServers);
		allServers.sort((a, b) => ns.getServerMaxMoney(a.host) - ns.getServerMaxMoney(b.host));
		for (var s of allServers) {
			if (s.host != "home") {
				if (!purchasedServers.includes(s.host)) {
					if (!ns.hasRootAccess(s.host)) {
						ns.exec("invade.js", "home", 1, s.host);
					}
				}
				await ns.scp(["weaken.js", "grow.js", "hack.js"], "home", s.host);
			}
		}

		// Exclude purchased servers and servers with no max money
		var targets = allServers
			.filter(s => !purchasedServers.includes(s.host))
			.filter(s => (s.money || {}).max > 0)
			.map(s => ({ ...s, threads: analyze(ns, s) }));
			// .filter(s => s.threads.weaken < maxWeakenThreads);

		targets.sort((a, b) => a.threads.weaken - b.threads.weaken);
		var weakenTargets = targets.filter((s) => s.threads.weaken > 0);
		ns.print("WEAKEN targets " + JSON.stringify(weakenTargets.map(s => s.host)));

		targets.sort((a, b) => a.threads.grow - b.threads.grow);
		var growTargets = targets.filter((s) => s.threads.weaken == 0)
			.filter((s) => s.threads.grow > 0);
		ns.print("GROW targets " + JSON.stringify(growTargets.map(s => s.host)));

		targets.sort((a, b) => a.threads.hack - b.threads.hack);
		var hackTargets = targets.filter(s => s.threads.weaken == 0)
			.filter(s => s.threads.grow == 0)
			.filter(s => s.threads.hack > 0);
		ns.print("HACK targets " + JSON.stringify(hackTargets.map(s => s.host)));

		hackTargets = hackTargets.map(s => ({ ...s, threads: s.threads.hack, duration: s.hackTime, action: "hack" }));
		var gt = growTargets.map(s => ({ ...s, threads: s.threads.grow, duration: s.growTime, action: "grow" }));
		weakenTargets = weakenTargets.map(s => ({ ...s, threads: s.threads.weaken, duration: s.weakenTime, action: "weaken" }));
		var maxLen = Math.max(hackTargets.length, gt.length, weakenTargets.length);
		ns.print(maxLen);
		for (var i = 0; i < maxLen; i++) {
			if (i < hackTargets.length)
				processManager.process(ns, hackTargets[i], resources, "hack.js");
			if (i < gt.length)
				processManager.process(ns, gt[i], resources, "grow.js");
			if (i < weakenTargets.length)
				processManager.process(ns, weakenTargets[i], resources, "weaken.js");
		}

		// ns.print("Resources:" + JSON.stringify(resources.freeRam, null, 2));
		// ns.print("Pending:" + JSON.stringify(processManager.pending, null, 2));
		printStatus(ns, processManager);
		await ns.sleep(SLEEP_DURATION_MS);
	}
}

export default { scan };