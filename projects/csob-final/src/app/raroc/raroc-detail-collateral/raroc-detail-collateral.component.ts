import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { CellClickEvent, DataStateChangeEvent, RowClassArgs } from '@progress/kendo-angular-grid';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { State } from '@progress/kendo-data-query';
import { Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { showTooltip } from '../../app-common/common-functions';
import { MessageBoxDialogComponent } from '../../app-common/components/message-box-dialog/message-box-dialog.component';
import { BasePermissionsComponent } from '../../app-shell/basePermissionsComponent';
import { SecurityService } from '../../services/security.service';
import { SelectedPartyService } from '../../services/selected-party.service';
import { TranslationService } from '../../services/translation-service';
import { UserNotificationService } from '../../services/user-notification.service';
import { UserProgressService } from '../../services/user-progress.service';
import { EValidationType, IRarocCollateralValueDto, IRarocValidationDto } from '../../services/webapi/webapi-models';
import { RarocDetailCollateralDialogComponent } from '../raroc-detail-collateral-dialog/raroc-detail-collateral-dialog.component';
import { RarocDetailService } from '../raroc-detail/raroc-detail.service';
import { RarocProductCollateralDialogComponent } from '../raroc-product-collateral-dialog/raroc-product-collateral-dialog.component';
import { RarocDetailCollateralService } from './raroc-detail-collateral.service';

@Component({
    selector: 'app-raroc-detail-collateral',
    templateUrl: './raroc-detail-collateral.component.html',
    styleUrls: ['./raroc-detail-collateral.component.less'],
    providers: [
        RarocDetailCollateralService
    ]
})
export class RarocDetailCollateralComponent extends BasePermissionsComponent implements OnInit {
    @Input() rarocId: number;
    @Input() lgdModelId: number;
    @Input() readonly: boolean;
    @Output() collateralChanged = new EventEmitter<string>();
    @Output() rarocValidationChanged = new EventEmitter<IRarocValidationDto>();

    view$: RarocDetailCollateralService;
    canDelete = false;
    state = {
        skip: 0, take: 10,
        sort: []
    } as State;
    selection: number[] = [];
    hasAnyProduct: boolean;

    constructor(
        private injector: Injector,
        private notification: UserNotificationService,
        private progress: UserProgressService,
        private rarocDetailService: RarocDetailService,
        private rarocDetailCollateralService: RarocDetailCollateralService,
        private selectedParty: SelectedPartyService,
        private translation: TranslationService,
        protected securityService: SecurityService
    ) {
        super(securityService);
        this.view$ = this.rarocDetailCollateralService;
    }

    ngOnInit(): void {
        this.readonly = this.readonly || this.lgdModelId == null;

        this.progress.runProgress(
            this.selectedParty.partyHeader.pipe(
                tap(party => super.fillRights(party)),
                mergeMap(() => this.rarocDetailCollateralService.hasAnyProduct$(this.rarocId))
            )).subscribe(result => {
                this.hasAnyProduct = result;
                this.rarocDetailCollateralService.query(this.rarocId, this.state);
            });
    }

    onGridSelectedKeysChange(selection: number[]) {
        this.canDelete = selection.length > 0;
    }

    onGridDataStateChange(state: DataStateChangeEvent) {
        this.state = state;
        this.selection = [];
        this.canDelete = false;

        this.rarocDetailCollateralService.query(this.rarocId, this.state);
    }

    async onGridCellClicked(event: CellClickEvent) {
        if (event.column.isCheckboxColumn || this.canDelete)
            return;

          if  (!this.hasRightTo['Raroccollateraldetail']) {
              return;
          }

        const collateral = Object.assign({}, event.dataItem as IRarocCollateralValueDto);
        if (await RarocDetailCollateralDialogComponent.show(this.injector, collateral, this.lgdModelId, this.readonly))
            this.saveCollateral(collateral);
    }

    async onAddClicked() {
        const collateral = await this.rarocDetailCollateralService.addCollateral();
        if (await RarocDetailCollateralDialogComponent.show(this.injector, collateral, this.lgdModelId, this.readonly))
            this.saveCollateral(collateral);
    }

    async onDeleteClicked() {
        if (this.selection.length == 0)
            return;

        const opts = MessageBoxDialogComponent.createDeleteAlertOption(this.injector);
        opts.message = this.translation.$$get('raroc_detail_collateral.items_will_be_irreversibly_lost');
        if (await MessageBoxDialogComponent.show(this.injector, opts).toPromise()) {
            this.rarocDetailCollateralService.deleteCollaterals(this.selection);

            this.selection = [];
            this.canDelete = false;
            this.state.skip = 0;
            this.save();
        }
    }

    async showRarocProductCollateralMatrix() {
        const matrix = await RarocProductCollateralDialogComponent.show(this.injector, this.rarocId, this.readonly);
        if (matrix) {
            this.progress.runProgress(
                this.rarocDetailCollateralService.saveMatrix$(matrix)
            ).subscribe(() => {
                this.notification.success(this.translation.$$get('raroc_detail_collateral.collaterals_products_matrix_successfully_updated'));
                this.raiseCollateralChanged();
            });
        }
    }

    showTooltip = (e: MouseEvent, kendoTooltipInstance: TooltipDirective): void =>
        showTooltip(e, kendoTooltipInstance);

    getRowClass(context: RowClassArgs) {
        if (context && context.dataItem as IRarocCollateralValueDto) {
            const validationType: EValidationType = (context.dataItem as IRarocCollateralValueDto).ValiditionType;
            switch (validationType) {
                case EValidationType.NOK:
                    return 'data-nok';
                case EValidationType.KO:
                    return 'data-ko';
                default:
                    return 'data-ok';
            }
        }

        return '';
    }

    private saveCollateral(product: IRarocCollateralValueDto) {
        this.saveHelper(this.rarocDetailCollateralService.saveCollateral$(product));
    }

    private save() {
        this.saveHelper(this.rarocDetailCollateralService.saveCollaterals$());
    }

    private saveHelper(serviceCall$: Observable<any>) {
        this.progress.runProgress(
            serviceCall$.pipe(
                mergeMap(() => this.rarocDetailService.getValidationRaroc(this.rarocId)),
                tap(rarocValidation => this.rarocValidationChanged.emit(rarocValidation)),
                mergeMap(() => this.rarocDetailCollateralService.hasAnyProduct$(this.rarocId))
            )).subscribe(result => {
                this.notification.success(this.translation.$$get('raroc_detail_collateral.collaterals_successfully_updated'));
                this.raiseCollateralChanged();
                this.hasAnyProduct = result;

                this.rarocDetailCollateralService.query(this.rarocId, this.state);
            });
    }

    private raiseCollateralChanged() {
        this.collateralChanged.emit(this.rarocDetailCollateralService.rarocVersion);
    }
}
