/*
You are given an array of numbers representing stock prices, where the
i-th element represents the stock price on day i.

Determine the maximum possible profit you can earn using as many transactions
as you’d like. A transaction is defined as buying and then selling one
share of the stock. Note that you cannot engage in multiple transactions at
once. In other words, you must sell the stock before you buy it again. If no
profit can be made, then the answer should be 0.
*/


/** @param {import("..").NS } ns */
function solve(ns, data) {
    /** @type {array[int]} */
    var profit = 0;
    var lastPrice = data[0];
    for (let i = 1; i < data.length; i++) {
        let price = data[i];
        if (price > lastPrice) {
            profit += price - lastPrice;
        }
        lastPrice = price;
    }
    return profit;
}

function assertEquals(expected, actual) {
    if (expected != actual) {
        throw Error("Expected " + JSON.stringify(expected) + " actual " + JSON.stringify(actual));
    }
}

function test_example(ns) {
    assertEquals(2, solve(ns, [1,2,3]));
    assertEquals(2, solve(ns, [1,3,3]));
    assertEquals(2, solve(ns, [1,3,1]));
    assertEquals(3, solve(ns, [1,3,1,2]));
}


/** @param {import("..").NS } ns */
export async function main(ns) {
    test_example(ns);
    ns.tprint("Success");
}

export default { solve };

