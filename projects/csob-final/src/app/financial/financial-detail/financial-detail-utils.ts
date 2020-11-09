import { FinStatTabDto } from 'projects/services/src/public-api';
import { Arrays } from '../../app-common/arrays';
import { IFinStatTabDto, IFinStatDataDto, IFinStatRatiosDataDto, EUpdateRowsResult } from 'projects/services/src/public-api';

export class FinancialDetailUtils {
    // klíč pro identifikaci příznaku v localStorage, že proběhl import a má dojít k přenačtení dat
    static readonly FinDataImportResult = 'FinDataImportResult';

    static readonly FinDataReadonlyRequired = 'FinDataReadonlyRequired';

    static storeReadonlyRequiredStorageFlag(value: boolean) {
        localStorage.setItem(FinancialDetailUtils.FinDataReadonlyRequired, String(value));
    }

    static getReadonlyRequiredStorageFlag(): boolean {
        const readonlyRequired = localStorage.getItem(FinancialDetailUtils.FinDataReadonlyRequired);
        if (readonlyRequired) {
            return Boolean(readonlyRequired);
        }

        return false;
    }

    static removeReadonlyRequiredStorageFlag() {
        localStorage.removeItem(FinancialDetailUtils.FinDataReadonlyRequired);
    }

    static storeImportResultToStorage(result: number) {
        localStorage.setItem(FinancialDetailUtils.FinDataImportResult, String(result));
    }

    static getImportResultFromStorage(): number {
        const result = localStorage.getItem(FinancialDetailUtils.FinDataImportResult);
        if (result) {
            return +result;
        }

        return null;
    }

    static removeImportResultFromStorage() {
        localStorage.removeItem(FinancialDetailUtils.FinDataImportResult);
    }

    static addorReplaceTabs(readonlyIds: number[], editableIds: number[], finModel: IFinStatDataDto, ratiosData: IFinStatRatiosDataDto) {
        if (!(ratiosData && ratiosData.Tabs && ratiosData.Tabs.length > 0))
            return;

        const tabs: FinStatTabDto[] = ratiosData.Tabs;

        finModel.Tabs.forEach(currentTab => {
            if (!tabs.map(t => t.TabOrder).includes(currentTab.TabOrder)) {
                tabs.push(currentTab);
            }
        });

        const readonlyHeaderIds = ratiosData.Tabs[0].Rows[0].ReadonlyItems.map(i => i.HeaderId);
        const editableHeaderIds = ratiosData.Tabs[0].Rows[0].EditableItems.map(i => i.HeaderId);

        tabs.forEach(t => {
            t = FinancialDetailUtils.updateTabValues(readonlyIds, editableIds, t, readonlyHeaderIds, editableHeaderIds);
        });

        finModel.Tabs = tabs.sort((t1, t2) => t1.GUIOrder - t2.GUIOrder)
    }

    static updateTabValues(leftIds: number[], rightIds: number[], tab: IFinStatTabDto, leftHeaderIds: number[], rightHeaderIds: number[]): IFinStatTabDto {
        // tady by se mely prehazet sloupce aby odpovidaly stavajicim hlavickam
        if (!leftIds || leftIds.length <= 1 || Arrays.sequenceEquals(leftIds, leftHeaderIds) &&
            !rightIds || rightIds.length <= 1 || Arrays.sequenceEquals(rightIds, rightHeaderIds)) {
            return tab;
        }

        tab.Rows.forEach(finRow => {
            // zkopirovani needitovatelnych polozek
            const readonlyItems = [];
            leftIds.forEach(id => {
                const leftItem = finRow.ReadonlyItems.find(i => id == i.HeaderId);
                if (leftItem)
                    readonlyItems.push(leftItem);
            });

            finRow.ReadonlyItems = readonlyItems;

            // zkopirovani editovatelnych polozek
            const editableItems = [];
            rightIds.forEach(id => {
                const rightItem = finRow.EditableItems.find(i => id == i.HeaderId);
                if (rightItem)
                    editableItems.push(rightItem);
            });

            finRow.EditableItems = editableItems;
        });

        return tab;
    }
}
