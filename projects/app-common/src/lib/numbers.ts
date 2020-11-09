export function getPrecision(a: number): number {
    if (!isFinite(a)) return 0;
    a = Math.abs(a);
    let e = 1, p = 0;
    while (p < 50 && Math.round(a * e) / e !== a) { e *= 10; p++; }
    return p;
}

export function getDecimalPlaces(a: number): number {
    if (!isFinite(a)) return 0;
    a = Math.abs(a);
    return 1 + Math.trunc(Math.log(a) / Math.LN10);
}

//tento regex pripousti i divne veci, je to kvuli postupnemu psani cisla
const numberREGEX = /^[+-]?[0-9]*(\.[0-9]*)?$/;
export function parseFloatLocale(s: string) {
    if (s == null || s == undefined || s == '' || !s.replace)
        return undefined;
    const nav = window.navigator || window.clientInformation;
    //if (nav && nav.language == "cs") {
    s = s.replace(',', '.');
    //}
    s = s.replace(/\s/g, '');
    if (!numberREGEX.test(s))
        return undefined;
    //this parses string using current locale
    // in EN, only 1.23 is valid
    // in CS, noth 1.23, 1,23 are valid
    //  but 1.23sss returns also 1.23
    return Number.parseFloat(s);
    //const parts = s.split('.', 2);
}

export function tryParseNumber(s: string): number {
    const f = parseFloatLocale(s);
    if (f == undefined)
        return undefined;
    if (isNaN(f))
        return undefined;
    return f;
}

export function padStartZeros(n: number, len: number) {
    let s = n.toString();
    while (s.length < len) {
        s = '0' + s;
    }
    return s;
}
