export const identificationNumberValidatorRegex = /^\d{8}\s*$/;

export function isValidIdentificationNumber(ic: string): boolean {
    if (!ic)
        return true;

    if (!identificationNumberValidatorRegex.test(ic))
        return false;

    const icArray = ic.split('').map(n => +n);

    let a = 0;
    for (let i = 0; i < 7; i++)
        a += icArray[i] * (8 - i);

    a = Math.trunc(a % 11);
    let c = 0;
    if (a === 0 || a === 10)
        c = 1;
    else if (a === 1)
        c = 0;
    else
        c = 11 - a;

    return icArray[7] === c;
}
