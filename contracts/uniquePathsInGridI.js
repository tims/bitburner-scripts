/*
Unique Paths in a Grid I

You are given an array with two numbers: [m, n]. These numbers represent a
m x n grid. Assume you are initially positioned in the top-left corner of that
grid and that you are trying to reach the bottom-right corner. On each step,
you may only move down or to the right.

Determine how many unique paths there are from start to finish.
*/



/** @param {import("..").NS } ns */
function solve(ns, data) {
    /** @type {number} */
    let m = data[0];
    let n = data[1];

    //Initialize and empty grid with 1 as default value
    let dp = new Array(m+1).fill(1).map(x => new Array(n+1).fill(0));
    
    //Itearte the grid
    for (let i=1;i<=m;i++) {
        for (let j=1;j<=n;j++) {
            //If unique path then update the data in dp cache
            if (i==1 && j==1) dp[i][j] = 1;
            
            //Else return the result of down and right unique paths
            else dp[i][j] = dp[i-1][j] + dp[i][j-1];
        }
    }
  
    //Return the result from end
    return dp[m][n];
}

function assertEquals(expected, actual) {
    if (expected != actual) {
        throw Error("Expected " + JSON.stringify(expected) + " actual " + JSON.stringify(actual));
    }
}

function test_example(ns) {
    assertEquals(28, solve(ns, [7,3]));
}


/** @param {import("..").NS } ns */
export async function main(ns) {
    test_example(ns);
    ns.tprint("Success");
}

export default { solve };
