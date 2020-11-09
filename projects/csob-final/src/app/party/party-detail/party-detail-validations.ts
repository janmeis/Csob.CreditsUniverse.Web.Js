import { isValidIdentificationNumber } from "../validation/identificationNumberValidator";
import { isValidBirthNumber, getDateFromBirthNumber } from "../validation/birthNumberValidator";

export const isIdentificationNumberValid = (identificationNumber: string, isCountryCzSk: boolean): boolean =>
    isCountryCzSk
        ? isValidIdentificationNumber(identificationNumber)
        : !identificationNumber || /^(?:\d*)$/.test(identificationNumber);
export const matchBirthNumberAndDate = (birthNumber: string, birthDate: Date): boolean => {
    if (!(birthDate && birthNumber))
        return true;
    if (birthDate && !birthNumber || !birthDate && birthNumber)
        return false;

    if (! /^\d{6}/.test(birthNumber))
        return false;

    const date = getDateFromBirthNumber(birthNumber);
    if (!date)
        return false;

    const yearIsValid = String(date.getFullYear()).substr(-2) === String(birthDate.getFullYear()).substr(-2);
    const monthIsValid = date.getMonth() === birthDate.getMonth();
    const dayIsValid = date.getDate() === birthDate.getDate();

    return yearIsValid && monthIsValid && dayIsValid;
}
export const isBirthNumberValid = (birthNumber: string, isCountryCzSk: boolean): boolean =>
    isCountryCzSk
        ? isValidBirthNumber(birthNumber)
        : !birthNumber || /^(?:(?:\d*)|(?:\d+\/\d+))\s*$/.test(birthNumber);
