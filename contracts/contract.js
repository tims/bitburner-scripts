import scan from "/scan";
import findAllValidMathexpressions from "/contracts/findAllValidMathexpressions";
import stockTraderI from "/contracts/stockTraderI";
import stockTraderII from "/contracts/stockTraderII";
import uniquePathsInGridI from "/contracts/uniquePathsInGridI";
import uniquePathsInGridII from "/contracts/uniquePathsInGridII";

/** @param {import("..").NS } ns */
function solve(ns, filename, host) {
    var data = ns.codingcontract.getData(filename, host); 
    var type = ns.codingcontract.getContractType(filename, host); 
    var desc = ns.codingcontract.getDescription(filename, host);
    ns.tprint("Type: " + type);
    ns.tprint("Data: " + JSON.stringify(data));
    // ns.tprint("Description:\n" + desc);
    

    var answer;
    switch (type) {
        case "Find All Valid Math Expressions":
            return findAllValidMathexpressions.solve(ns, data);
        case "Algorithmic Stock Trader I":
            return stockTraderI.solve(ns, data);
        case "Algorithmic Stock Trader II":
            return stockTraderII.solve(ns, data);
        case "Unique Paths in a Grid I":
            return uniquePathsInGridI.solve(ns, data);
        case "Unique Paths in a Grid II":
            return uniquePathsInGridII.solve(ns, data);
        default:
            ns.tprint("Unsolved type " + type);    
            return null;
    }

}

/** @param {import("..").NS } ns */
export async function main(ns) {
    for (var server of scan.scan(ns, "home", 10)) {
        for (let filename of ns.ls(server.host, ".cct")) {
            ns.tprint({host: server.host, filename});
            let ans = solve(ns, filename, server.host)
            var opts = {returnReward: true}

            if (ans != null) {
                ns.tprint("Submitting Answer: " + JSON.stringify(ans));
                ns.tprint(ns.codingcontract.attempt(ans, filename, server.host, opts));
            } else {
                ns.tprint("Answer is unknown, skipping");
            }
        }
    }
    
}
