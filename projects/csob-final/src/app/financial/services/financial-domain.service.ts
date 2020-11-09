import { CurrentLangService } from '../../services/current-lang-service';
import { LocalDatePipe } from './../../app-common/pipes/local-date.pipe';
import { IFinStatOverviewResDto } from './../../services/webapi/webapi-models';
import { Injectable } from '@angular/core';
import { EFormat, EStateFinData, IFinStatHeaderDto, ETypeOfStatement } from '../../services/webapi/webapi-models';
import { Arrays } from '../../app-common/arrays';
import { LogFactoryService, ILogger } from '../../services/log-factory.service';

interface FinSimple {
    Id?: number;
    FormatEnum: EFormat;
    StateEnum: EStateFinData;
    BulkUploaded?: boolean;
    Consolidated: boolean;
    TemplateId: number;
    CurrencyId: number;
    UnitKey?: number;
    // v overview neni: ReportTypeKey: number
}

@Injectable({
    providedIn: 'root'
})
export class FinancialDomainService {
    private localDatePipe: LocalDatePipe;
    private logger: ILogger;
    constructor(currentLangService: CurrentLangService, logFactory: LogFactoryService) {
        this.localDatePipe = new LocalDatePipe(currentLangService.getCurrentLang());
        this.logger = logFactory.get('FinancialDomainService');
    }


    public isHeaderReadonly(h: IFinStatHeaderDto): boolean {
        if (h.StateEnum == EStateFinData.OriginalNew)
            return false;
        if (h.ReportTypeKey == ETypeOfStatement.Model)
            return false;
        return true;
    }

    private convertedStates = [EStateFinData.ConvertedNew, EStateFinData.ConvertedCompleted];
    private  originalStates = [EStateFinData.OriginalNew, EStateFinData.OriginalCompleted];


    public canShow(rows: FinSimple[]): boolean {
        //Od Jakuba
        //Lze zobrazit: Originální Nový a Originální dokončený
        //Nebo: Konvertovaný nový a Konvertovaný dokončený
        //Nelze zobrazit Originální a Konvertovaný

        const allowedMix = rows.length > 0 &&  Arrays.all(rows, r => r.FormatEnum == EFormat.InternalCSOB || (r.FormatEnum == EFormat.PoFull && this.convertedStates.includes(r.StateEnum) ) );

        if (allowedMix) return true;

        return rows.length > 0 &&
            Arrays.all(rows, r => r.FormatEnum === rows[0].FormatEnum &&
                ((this.convertedStates.includes(r.StateEnum) && this.convertedStates.includes(rows[0].StateEnum)) ||
                    (this.originalStates.includes(r.StateEnum) && this.originalStates.includes(rows[0].StateEnum))));
    }

    public canCopy(rows: FinSimple[]): boolean {
        return rows.length > 0 &&
            Arrays.all(rows, this.canBeCopied) &&
            Arrays.all(rows, r => r.StateEnum === rows[0].StateEnum && r.CurrencyId === rows[0].CurrencyId) &&
            this.canShow(rows);
    }
    public canEdit(data: FinSimple[]): boolean {
        if (data.length == 0)
            return false;
        if (!Arrays.all(data, this.canBeEdited))
            return false;
        if (!Arrays.all(data, x => (x.TemplateId == data[0].TemplateId)))
            return false;
        if (!Arrays.all(data, x => (x.CurrencyId == data[0].CurrencyId)))
            return false;
        if (!Arrays.all(data, x => (x.UnitKey == data[0].UnitKey)))
            return false;

        return this.canShow(data);
    }

    public canConvert(data: FinSimple[]): boolean {
        if (data.length == 0)
            return false;
        if (!Arrays.all(data, this.canBeConverted))
            return false;
        //stejne formaty (BUG #1763)
        if (!Arrays.all(data, x => (x.FormatEnum == data[0].FormatEnum)))
            return false;

        if (!Arrays.all(data, x => (x.TemplateId == data[0].TemplateId)))
            return false;

        //stejna mena
        if (!Arrays.all(data, x => (x.CurrencyId == data[0].CurrencyId)))
            return false;
        return true;
    }
    private canBeConverted(x: FinSimple): boolean {
        //Konvertovat lze pouze Finanční výkazy, které jsou ve formátu "PO plný rozsah"
        // POZOR EFormat.PoShort historicky nemělo jít, pak ano a nakonec opět ne (16.10.2018 - Vít Maleček)
        if (EFormat.PoFull != x.FormatEnum)
            return false;
        // konvertovat pouze dokoncene
        return (x.StateEnum == EStateFinData.OriginalCompleted);
    }
    public isConverted(x: FinSimple): boolean {
        return x.StateEnum == EStateFinData.ConvertedCompleted || x.StateEnum == EStateFinData.ConvertedNew;
    }
    public isInternalCsob(x: FinSimple): boolean {
        return x && x.FormatEnum == EFormat.InternalCSOB;
    }

    public canBeCompleted(x: FinSimple): boolean {
        //dokoncit lze pouze data, ktera nejsou oznacena jako dokoncena
        //stresova analyza nema jit dokoncit
        if (this.isStress(x))
            return false;
        return [EStateFinData.OriginalNew, EStateFinData.ConvertedNew].indexOf(x.StateEnum) >= 0;
    }

    public canBeComputed(headers: FinSimple[]): boolean {
        if (headers.length == 0)
            return false;
        const last = headers[headers.length - 1];

        if (last.FormatEnum == EFormat.PoFull && last.StateEnum == EStateFinData.OriginalCompleted)
            return false;

        if (Arrays.any(headers, h => h.FormatEnum == EFormat.InternalCSOB))
            return true;
        //pouze dokončené
        //#bug 2126: Tlačítko vypočítat by se mělo objevit na dokončených finančních výkazech a na konvertovaném novém výkazu.
        return [
            EStateFinData.OriginalCompleted,
            EStateFinData.ConvertedNew,
            EStateFinData.ConvertedCompleted].indexOf(last.StateEnum) >= 0;
    }

    public canBeCopied(x: FinSimple): boolean {
        //TODO: Kopírovat výkazy ve stavu Konvertovaný nový a Konvertovaný dokončený může pouze uživatel
        // v roli s právem konvertovat finanční výkazy.
        //Kopírování je povoleno pro všechny formáty a stavy Finančního výkazu,
        // s výjimkou výkazů, které vznikly hromadným importem
        return x.BulkUploaded == false;
    }

    public canBeDeleted(x: FinSimple): boolean {
        // task #1388 - stav used zrušen, příznak o použití není snadné spočítat. NEchává se na DB REF integritě
        return true;
        //smazat lze	pouze Finanční výkaz, který není označený jako použitý finančí výkaz,
        //který má vazbu na uživatele nebo jeho pobočku
        //return !x.IsUsed;
    }
    public canBeEdited(x: FinSimple): boolean {
        //editovat lze pouze data, ktera nejsou oznacena jako dokoncena
        //Tlačítko Editovat nesmí být přístupné pro formáty finančních výkazů ve stavu Originál dokončený nebo Konvertovaný dokončený
        if (x.StateEnum == EStateFinData.ConvertedCompleted || x.StateEnum == EStateFinData.OriginalCompleted)
            return false;
        return true;
    }

    public canChangePeriod(x: FinSimple): boolean {
        if (x.StateEnum == EStateFinData.ConvertedCompleted)
            return false;
        return true;
    }

    public canBeExported(rows: FinSimple[]): boolean {
        const allowedMix = rows.length > 0 &&  Arrays.all(rows, r => r.FormatEnum == EFormat.InternalCSOB || (r.FormatEnum == EFormat.PoFull && this.convertedStates.includes(r.StateEnum) ) );

        if (allowedMix) return true;

        return rows.length > 0 &&
            Arrays.all(rows, r => r.FormatEnum === rows[0].FormatEnum &&
                Arrays.all(rows, r => r.Consolidated === rows[0].Consolidated) &&
                ((this.convertedStates.includes(r.StateEnum) && this.convertedStates.includes(rows[0].StateEnum)) ||
                    (this.originalStates.includes(r.StateEnum) && this.originalStates.includes(rows[0].StateEnum))));
    }

    public canAddModel(rows: FinSimple[]): boolean {
        if (rows/*.filter(x => x.Id != 0)*/.length != 1)
            return false;
        //·	Zkonvertovaný nový
        //·	Zkonvertovaný dokončený.
        return rows[0].StateEnum == EStateFinData.ConvertedCompleted
            || rows[0].StateEnum == EStateFinData.ConvertedNew;
    }
    public canStressAnalysis(rows: FinSimple[]): boolean {
        if (rows.filter(x => !this.isStress(x)).length != 1)
            return false;
        //·	Zkonvertovaný nový
        //·	Zkonvertovaný dokončený.
        return rows[0].StateEnum == EStateFinData.ConvertedCompleted || rows[0].StateEnum == EStateFinData.ConvertedNew;
    }
    public isStress(row: FinSimple): boolean {
        if (row['ReportTypeKey'] == 999) return true;
        return false;
    }

    public canImportFinData(rows: FinSimple[]): boolean {
        if (rows.length != 1)
            return false;
        if (rows[0].FormatEnum == EFormat.InternalCSOB || rows[0].FormatEnum == EFormat.Municipality)
            return false;
        return rows[0].StateEnum == EStateFinData.OriginalNew;
    }

    public getFinStatDisplayNameForDeletion(row: IFinStatOverviewResDto) {
        return `${this.localDatePipe.transform(row.ValidTo, 'date')} - ${row.StatementType}` ;
    }

    public isValidFiscalYearStart(date: Date, fiscalStartMonth: number) {
        if (!date || !fiscalStartMonth) {
            //this.logger.warn(`isValidFiscalYearStart NULL date: ${date}, startMonth=${fiscalStartMonth}`);
            return null;
        }
        var month = date.getMonth() + 1;
        var day = date.getDate();
        if (month == fiscalStartMonth && day == 1)
            return true;
        //this.logger.warn(`Invalid fiscal year start month ${fiscalStartMonth} in date m=${month}, d=${day}, iso=${date.toISOString()}`);
        return false;
    }
}
