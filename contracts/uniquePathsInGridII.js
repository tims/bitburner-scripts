/*
You are given a 2D array of numbers (array of array of numbers) representing
a grid. The 2D array contains 1’s and 0’s, where 1 represents an obstacle and
0 represents a free space.

Assume you are initially positioned in top-left corner of that grid and that you
are trying to reach the bottom-right corner. In each step, you may only move down
or to the right. Furthermore, you cannot move onto spaces which have obstacles.

Determine how many unique paths there are from start to finish.
*/


/** @param {import("..").NS } ns */
function solve(ns, data) {
    /** @type {number} */
    ns.tprint(data);
    let m = data.length;
    let n = data[0].length;

    //Initialize and empty grid with 1 as default value
    let dp = new Array(m+1).fill(1).map(x => new Array(n+1).fill(0));
    
    //Itearte the grid
    for (let i=1;i<=m;i++) {
        for (let j=1;j<=n;j++) {
            //If obstacle
            if (data[i-1][j-1] == 1) 
                continue;
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
    assertEquals(2, solve(ns, [[0,0,0],[0,1,0],[0,0,0]]));
}


/** @param {import("..").NS } ns */
export async function main(ns) {
    test_example(ns);
    ns.tprint("Success");
}

export default { solve };

