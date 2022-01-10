/*
You are given an array of numbers representing stock prices, where the
i-th element represents the stock price on day i.

Determine the maximum possible profit you can earn using at most one
transaction (i.e. you can buy an sell the stock once). If no profit
can be made, then the answer should be 0. Note that you must buy the stock
before you can sell it.
*/


/** @param {import("..").NS } ns */
function solve(ns, data) {
    /** @type {array[int]} */
    var maxProfit = 0;
    var minPrice = data[0];
    for (let i = 1; i < data.length; i++) {
        let price = data[i];
        minPrice = Math.min(price, minPrice);
        maxProfit = Math.max(maxProfit, price - minPrice)
    }
    return maxProfit;
}

function assertEquals(expected, actual) {
    if (expected != actual) {
        throw Error("Expected " + JSON.stringify(expected) + " actual " + JSON.stringify(actual));
    }
}

function test_example(ns) {
    assertEquals(2, solve(ns, [1,2,3]));
}


/** @param {import("..").NS } ns */
export async function main(ns) {
    test_example(ns);
    ns.tprint("Success");
}

export default { solve };

