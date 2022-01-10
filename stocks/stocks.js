/** @param {import("..").NS } ns */
export async function main(ns) {
    let symbols = ns.stock.getSymbols();
    for (let sym of symbols) {
        let volatility = ns.stock.getVolatility(sym);
        let forecast = ns.stock.getForecast(sym);
        let price = ns.stock.getPrice(sym);
        ns.stock.get
        ns.tprint(sym + " " + JSON.stringify({
            price: ns.nFormat(price, "0.000a"),
            forecast: ns.nFormat(forecast, "0.0%"),
            volatility: ns.nFormat(volatility, "0.0%")
            
        }));
    }
}