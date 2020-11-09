import { Component, EventEmitter, Injector, OnInit } from '@angular/core';
import { AppDialog, AppDialogContainerService } from 'projects/app-common/src/public-api';
import { EExportFormat, FinancialApiService, FinStatDataDto, IExportOptions, IFinConversionOptions, IFinStatDataDto, IFinStatRatiosDataDto, Languages, TranslationService, UserNotificationService, UserProgressService } from 'projects/services/src/public-api';
import { Observable, of } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { EnumValue } from '../../app-common/components/editor-enum/editor-enum.component';
import { UserBlobService } from '../../app-common/services/user-blob-service';
import { FinancialDetailUtils } from '../financial-detail/financial-detail-utils';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'financial-export-dialog',
  templateUrl: './financial-export-dialog.component.html',
  styleUrls: ['./financial-export-dialog.component.less'],
})

export class FinancialExportDialogComponent implements AppDialog, OnInit {
  exportOptions = {} as IExportOptions;
  finModel: FinStatDataDto;
  leftIds: number[] = [];
  rightIds: number[] = [];
  includeDefaults: boolean = false;
  conversion = {} as IFinConversionOptions;
  close: Function
  closed = new EventEmitter<any>()
  title: string;
  exportOptionEnumValues: EnumValue[];
  languageEnumValues: EnumValue[];

  static show(injector: Injector, exportOptions: IExportOptions, finModel: IFinStatDataDto, leftIds: number[], rightIds: number[], includeDefaults: boolean = false, conversion: IFinConversionOptions = null): Promise<boolean> {
    const dlgSvc = injector.get(AppDialogContainerService);
    const dlg = dlgSvc.createDialog(injector, FinancialExportDialogComponent,
      {},
      { exportOptions, finModel, leftIds, rightIds, includeDefaults, conversion });

    return dlgSvc.wait(dlg.closed);
  }

  constructor(
    private translation: TranslationService,
    private finApi: FinancialApiService,
    public progress: UserProgressService,
    private notification: UserNotificationService,
    private blob: UserBlobService) {
    this.title = this.translation.$$get('financial_export_dialog.export_options');
  }

  ngOnInit(): void {
    Object.assign(this.exportOptions, { Format: EExportFormat.XLS, Culture: Languages[0].cultureCode });
    this.exportOptionEnumValues = [{ text: 'PDF', value: EExportFormat.PDF }, { text: 'XLS', value: EExportFormat.XLS }];
    this.languageEnumValues = Languages.map(l => ({ text: l.value.toUpperCase(), value: l.cultureCode } as EnumValue));
  }

  public onExport(anchor: HTMLAnchorElement) {
    this.progress.runProgress((() => {
      if (this.finModel)
        return this.calculate(this.finModel).pipe(tap(ratios => FinancialDetailUtils.addorReplaceTabs(this.leftIds, [], this.finModel, ratios)));
      return of({});
    })().pipe(
      mergeMap(() => this.finApi.downloadExport(this.exportOptions, this.leftIds, this.rightIds, this.includeDefaults, this.conversion)))
    ).subscribe(result => {
      this.blob.downloadFile(anchor, result);
      this.close();
    }, err => {
      this.blob.showErrorFromBlob(err);
    })
  }

  private calculate(finModel: FinStatDataDto): Observable<IFinStatRatiosDataDto> {
    const allHeaders = finModel.ReadonlyHeaders.concat(finModel.EditableHeaders);
    const templateId = allHeaders[0].TemplateId;
    const headerIds = allHeaders.map(h => h.Id);

    return this.finApi.postCalculateRatios(templateId, headerIds);
  }
}
