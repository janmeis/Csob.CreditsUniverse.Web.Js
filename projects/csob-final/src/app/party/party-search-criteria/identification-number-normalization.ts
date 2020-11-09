export function normalizeIdentificationNumber(identificationNumber: string) {
    const identificationNumberLength = 8;
    const identificationNumberRegex = /^(?:\d*)\s*$/;

    if (!identificationNumber || identificationNumber.length === 0 || !identificationNumberRegex.test(identificationNumber))
        return identificationNumber;

    if (identificationNumber.length < identificationNumberLength)
        return `${'0'.repeat(identificationNumberLength - identificationNumber.length)}${identificationNumber}`;

    return identificationNumber;
}
