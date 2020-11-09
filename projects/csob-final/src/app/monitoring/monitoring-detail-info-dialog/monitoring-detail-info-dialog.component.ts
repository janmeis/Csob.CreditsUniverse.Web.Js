import { Component, ComponentRef, EventEmitter, Injector, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DialogComponent } from '@progress/kendo-angular-dialog';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { Observable, of } from 'rxjs';
import { first, map, mergeMap, tap } from 'rxjs/operators';
import { fixToNumber, fixToString, showTooltip } from 'src/app/app-common/common-functions';
import { MessageBoxDialogComponent } from 'src/app/app-common/components/message-box-dialog/message-box-dialog.component';
import { BasePermissionsComponent } from 'src/app/app-shell/basePermissionsComponent';
import { SecurityService } from 'src/app/services/security.service';
import { SelectedPartyService } from 'src/app/services/selected-party.service';
import { TranslationService } from 'src/app/services/translation-service';
import { UserProgressService } from 'src/app/services/user-progress.service';
import { MonitoringApiService } from 'src/app/services/webapi/monitoring-api-service';
import { EColor, EMonitoringCategory, IMonitoringCellClickDto, IMonitoringCellEditDto, IPartyHeaderDto } from 'src/app/services/webapi/webapi-models';
import { AppDialog, AppDialogContainerService } from './../../app-common/services/app-dialog-container.service';

@Component({
    selector: 'app-monitoring-detail-info-dialog',
    templateUrl: './monitoring-detail-info-dialog.component.html',
    styleUrls: ['./monitoring-detail-info-dialog.component.less'],
})
export class MonitoringDetailInfoDialogComponent extends BasePermissionsComponent implements AppDialog, OnInit {
    @ViewChild('form') private form: NgForm;
    cellClick: IMonitoringCellClickDto;
    close: Function;
    closed = new EventEmitter<boolean>();
    dlgRef: ComponentRef<DialogComponent>;
    model: IMonitoringCellEditDto;
    party: IPartyHeaderDto;
    EMonitoringCategory = EMonitoringCategory;
    EColor = EColor;
    realValue: number;

    private isSaved = false;

    static show(injector: Injector, cellClick: IMonitoringCellClickDto) {
        const dlgSvc = injector.get(AppDialogContainerService);
        const dlg = dlgSvc.createWindow(injector, MonitoringDetailInfoDialogComponent, {
            width: 1200,
            height: 780,
            top: window.innerHeight / 2 - 375,
            left: window.innerWidth / 2 - 480,
            css: 'monitoring-detail-window'
        }, { cellClick });
        return dlgSvc.wait(dlg.closed);
    }

    getTitle = () => this.translation.$$get('monitoring_detail_info_dialog.dialog_title');

    constructor(
        private injector: Injector,
        private monitoringApi: MonitoringApiService,
        public progress: UserProgressService,
        private selectedParty: SelectedPartyService,
        private translation: TranslationService,
        protected securityService: SecurityService) {
        super(securityService);
    }

    ngOnInit() {
        this.progress.runProgress(
            this.selectedParty.partyHeader.pipe(
                tap(party => super.fillRights(party)),
                mergeMap(_ => this.update$()),
                tap(monitoringCellEdit => this.model = monitoringCellEdit))
        ).subscribe(_ => {
            window.scroll(0, 0);    // fix for Angular 10
        });
    }

    onSubmit() {
        this.progress.runProgress(this.save$().pipe(
            mergeMap(saved => {
                if (!saved)
                    return of(false);

                if (!this.model.CloseOnSubmit)
                    return this.update$().pipe(
                        map(_ => true)
                    );

                return of(true);
            })
        )).subscribe(result => {
            if (!result)
                return;

            if (this.model.CloseOnSubmit)
                this.close(this.isSaved);
            else
                setTimeout(() => this.form.form.markAsPristine(), 100); // HACK!
        });
    }

    private save$(): Observable<boolean> {
        if (!this.form || this.form.invalid)
            return of(false);

        this.model.Value = fixToString(this.realValue);   // HACK!
        return this.monitoringApi.postSaveCellData(this.model).pipe(
            tap(_ => this.isSaved = true),
            map(() => true),
            first()
        );
    }

    async onClose() {
        if (await this.canClose()) {
            this.close(this.isSaved);
        }
    }

    private canClose(): Promise<boolean> {
        if (!this.form.dirty)
            return of(true).toPromise();

        return MessageBoxDialogComponent.dirtyConfirmation(this.injector, () => this.save$());
    }

    showTooltip = (e: MouseEvent, kendoTooltipInstance: TooltipDirective): void =>
        showTooltip(e, kendoTooltipInstance)

    onDetailLinkClicked(link: string) {
        this.close({ result: this.isSaved, link: link });
    }

    private update$(): Observable<IMonitoringCellEditDto> {
        if (!!this.cellClick.PDRatingId)
            return this.updatePDRating$();

        return this.monitoringApi.postCellData(this.cellClick).pipe(
            tap(cellEdit => {
                if (cellEdit.Category == EMonitoringCategory.ContractTermsFinancial && !!cellEdit.Rows && cellEdit.Rows.length > 0)
                    this.realValue = fixToNumber(cellEdit.Rows[0].RowValue);
            }),
            tap(cellEdit => this.dlgRef.instance.title = this.getNewTitle(cellEdit)),
        );
    }

    private updatePDRating$(): Observable<IMonitoringCellEditDto> {
        return this.monitoringApi.postGroupContainer(this.cellClick, EMonitoringCategory.PDRating).pipe(
            map(groupContainer => {
                if (!!groupContainer && !!groupContainer.Groups && groupContainer.Groups.length > 0)
                    return groupContainer.Groups[0];

                return null;
            }),
            map(group => ({
                Category: EMonitoringCategory.PDRating,
                NegativeRows: group.Rows,
                PDRatingId: this.cellClick.PDRatingId,
                Readonly: true,
                Rows: [],
                CloseOnSubmit: true
            } as IMonitoringCellEditDto)),
            tap(_ => this.dlgRef.instance.title = this.translation.$$get('monitoring_detail_info_dialog.pd_rating_title'))
        );
    }

    private getNewTitle(cellEdit: IMonitoringCellEditDto): string {
        if (!cellEdit)
            return this.getTitle();

        return cellEdit.Description
            ? `${cellEdit.CategoryDescription}${cellEdit.CategoryDescription ? `: ${cellEdit.Description}` : ''}`
            : cellEdit.CategoryDescription || this.getTitle();
    }
}
