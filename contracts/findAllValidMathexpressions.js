/*
Find All Valid Math Expressions
You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


You are given the following string which contains only digits between 0 and 9:

3334

You are also given a target number of -95. Return all possible ways you can add the +, -, and * operators to the string such that it evaluates to the target number.

The provided answer should be an array of strings containing the valid expressions. The data provided by this problem is an array with two elements. The first element is the string of digits, while the second element is the target number:

["3334", -95]

NOTE: Numbers in the expression cannot have leading 0's. In other words, "1+01" is not a valid expression Examples:

Input: digits = "123", target = 6
Output: [1+2+3, 1*2*3]

Input: digits = "105", target = 5
Output: [1*0+5, 10-5]
*/

/** @param {string} input */
function genExpressions(input) {
    let expressions = [];

    if (input.length == 1 || input[0] != "0") {
        expressions.push(JSON.stringify(Number.parseInt(input)))
    }
    for (let i = 0; i < input.length - 1; i++) {
        let num = Number.parseInt(input.slice(0, i + 1));
        var remainder = input.slice(i + 1, input.length);
        for (let sol of genExpressions(remainder)) {
            expressions.push(num + "+" + sol)
        }
        for (let sol of genExpressions(remainder)) {
            expressions.push(num + "-" + sol)
        }
        for (let sol of genExpressions(remainder)) {
            expressions.push(num + "*" + sol)
        }
    }
    return expressions;
}

/** @param {import("..").NS } ns */
function solve(ns, data) {
    /** @type {string} */
    var input = data[0];
    var target = data[1];
    var solutions = []

    for (let exp of genExpressions(input)) {
        let value = eval(exp);
        if (value == target) {
            solutions.push(exp);
        }
    }
    ns.tprint({ solutions });
    return solutions;
}

/** @param {import("..").NS } ns */
function test_simple(ns) {
    let ans = solve(ns, ["123", 6]);
    if (ans.length != 2)
        throw new Error();
    if (!ans.includes("1+2+3") || !ans.includes("1*2*3"))
        throw new Error();
}


/** @param {import("..").NS } ns */
function test_zero(ns) {
    let ans = solve(ns, ["123", 0]);
    ns.tprint("Solution " + JSON.stringify(ans));
    if (ans.length != 1)
        throw new Error();
    if (!ans.includes("1+2-3"))
        throw new Error();
}


/** @param {import("..").NS } ns */
function test_negative(ns) {
    let ans = solve(ns, ["123", -1]);
    ns.tprint("Solution " + JSON.stringify(ans));
    if (ans.length != 1)
        throw new Error();
    if (!ans.includes("1*2-3"))
        throw new Error();
}


/** @param {import("..").NS } ns */
function test_full(ns) {
    let ans = solve(ns, ["123", 123]);
    ns.tprint("Solution " + JSON.stringify(ans));
    if (ans.length != 1)
        throw new Error();
    if (!ans.includes("123"))
        throw new Error();
}

/** @param {import("..").NS } ns */
function test_doubledigit(ns) {
    let ans = solve(ns, ["123", 15]);
    ns.tprint("Solution " + JSON.stringify(ans));
    if (ans.length != 1)
        throw new Error();
    if (!ans.includes("12+3"))
        throw new Error();
}


/** @param {import("..").NS } ns */
export async function main(ns) {
    test_simple(ns);
    test_zero(ns);
    test_negative(ns);
    test_full(ns);
    test_doubledigit(ns);
    ns.tprint("Success");
}

export default { solve };

