import scan from '/scan';

/** @param {import(".").NS } ns */
export async function main(ns) {
    for (var s of scan.scan(ns, "home", 2)) {
        ns.tprint(s);
    }
}
