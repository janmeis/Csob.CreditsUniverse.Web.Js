export const birthNumberValidatorRegex = /^(\d{2})(\d{2})(\d{2})\/?(\d{3})(\d?)\s*$/;

// <see cref="https://phpfashion.com/jak-overit-platne-ic-a-rodne-cislo" />
export function getDateFromBirthNumber(birthNumber: string): Date | null {
    if (!birthNumberValidatorRegex.test(birthNumber))
        return null;

    const [_, yearStr, monthStr, dayStr, ext, c] = birthNumberValidatorRegex.exec(birthNumber);

    let year = +yearStr;
    let month = +monthStr;
    let day = +dayStr;

    if (!c || c.length == 0) {
        year += year < 54 ? 1900 : 1800;
    } else {
        // kontrolní číslice
        const sum = +(yearStr + monthStr + dayStr + ext);
        let mod = Math.trunc(sum % 11);
        if (mod == 10)
            mod = 0;
        if (mod != +c)
            return null;

        year += year < 54 ? 2000 : 1900;
    }

    // k měsíci může být připočteno 20, 50 nebo 70
    if (month > 70 && year > 2003)
        month -= 70;
    else if (month > 50)
        month -= 50;
    else if (month > 20 && year > 2003)
        month -= 20;

    const now = new Date();

    if (year > now.getFullYear() || year < 1900)
        return null;

    // kontrola data
    if (!checkdate(year, month, day))
        return null;

    return new Date(year, month - 1, day);
}

export function isValidBirthNumber(birthNumber: string): boolean {
    if (!birthNumber)
        return true;

    return getDateFromBirthNumber(birthNumber) != null;
}

export function checkdate(year: number, month: number, day: number): boolean {
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day;
}
