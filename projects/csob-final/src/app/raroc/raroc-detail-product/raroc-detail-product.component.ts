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
import { EValidationType, IRarocProductValueDto, IRarocValidationDto } from '../../services/webapi/webapi-models';
import { RarocDetailProductDialogComponent } from '../raroc-detail-product-dialog/raroc-detail-product-dialog.component';
import { RarocDetailService } from '../raroc-detail/raroc-detail.service';
import { RarocProductCollateralDialogComponent } from '../raroc-product-collateral-dialog/raroc-product-collateral-dialog.component';
import { RarocDetailProductService } from './raroc-detail-product.service';


@Component({
    selector: 'app-raroc-detail-product',
    templateUrl: './raroc-detail-product.component.html',
    styleUrls: ['./raroc-detail-product.component.less'],
    providers: [
        RarocDetailProductService
    ]
})
export class RarocDetailProductComponent extends BasePermissionsComponent implements OnInit {
    @Input() rarocId: number;
    @Input() lgdModelId: number;
    @Input() readonly: boolean;
    @Output() productChanged = new EventEmitter<{ rarocVersion: string, hasProducts: boolean }>();
    @Output() rarocValidationChanged = new EventEmitter<IRarocValidationDto>();

    view$: RarocDetailProductService;
    canDelete = false;
    state = {
        skip: 0, take: 10,
        sort: []
    } as State;
    selection: number[] = [];
    hasAnyCollateral: boolean;

    constructor(
        private injector: Injector,
        private notification: UserNotificationService,
        private progress: UserProgressService,
        private rarocDetailService: RarocDetailService,
        private rarocDetailProductService: RarocDetailProductService,
        private translation: TranslationService,
        protected securityService: SecurityService,
        private selectedParty: SelectedPartyService
    ) {
        super(securityService);
        this.view$ = this.rarocDetailProductService;
    }

    ngOnInit(): void {
        this.readonly = this.readonly || this.lgdModelId == null;

        this.progress.runProgress(
            this.rarocDetailProductService.hasAnyCollateral$(this.rarocId)
        ).subscribe(result => {
            this.hasAnyCollateral = result;
            this.rarocDetailProductService.query(this.rarocId, this.state);
        });
        this.progress.runProgress(
            this.selectedParty.partyHeader.pipe(
                tap(party => {
                    super.fillRights(party);
                }),
            ), true).subscribe();
    }

    onGridSelectedKeysChange(selection: number[]) {
        this.canDelete = selection.length > 0;
    }

    onGridDataStateChange(state: DataStateChangeEvent) {
        this.state = state;
        this.selection = [];
        this.canDelete = false;

        this.rarocDetailProductService.query(this.rarocId, this.state);
    }

    async onGridCellClicked(event: CellClickEvent) {
        if (event.column.isCheckboxColumn || this.canDelete)
            return;

        if  (!this.hasRightTo['Rarocproductdetail']) {
            return;
        }

        const product = Object.assign({}, event.dataItem as IRarocProductValueDto);
        if (await RarocDetailProductDialogComponent.show(this.injector, product, this.lgdModelId, this.readonly))
            this.saveProduct(product);
    }

    async onAddClicked() {
        const product = await this.rarocDetailProductService.addProduct();
        if (await RarocDetailProductDialogComponent.show(this.injector, product, this.lgdModelId, this.readonly))
            this.saveProduct(product);
    }

    async onDeleteClicked() {
        if (this.selection.length == 0)
            return;

        const opts = MessageBoxDialogComponent.createDeleteAlertOption(this.injector);
        opts.message = this.translation.$$get('raroc_detail_product.items_will_be_irreversibly_lost');
        if (await MessageBoxDialogComponent.show(this.injector, opts).toPromise()) {
            this.rarocDetailProductService.deleteProducts(this.selection);

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
                this.rarocDetailProductService.saveMatrix$(matrix)
            ).subscribe(() => {
                this.notification.success(this.translation.$$get('raroc_detail_product.collaterals_products_matrix_successfully_updated'));
                this.raiseProductChangedEvent();
            });
        }
    }

    showTooltip = (e: MouseEvent, kendoTooltipInstance: TooltipDirective): void =>
        showTooltip(e, kendoTooltipInstance);

    getRowClass(context: RowClassArgs) {
        if (context && context.dataItem as IRarocProductValueDto) {
            const validationType: EValidationType = (context.dataItem as IRarocProductValueDto).ValiditionType;
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

    private saveProduct(product: IRarocProductValueDto) {
        this.saveHelper(this.rarocDetailProductService.saveProduct$(product));
    }

    private save() {
        this.saveHelper(this.rarocDetailProductService.saveProducts$());
    }

    private saveHelper(serviceCall$: Observable<any>) {
        this.progress.runProgress(
            serviceCall$.pipe(
                mergeMap(() => this.rarocDetailService.getValidationRaroc(this.rarocId)),
                tap(rarocValidation => this.rarocValidationChanged.emit(rarocValidation)),
                mergeMap(() => this.rarocDetailProductService.hasAnyCollateral$(this.rarocId))
            )).subscribe(result => {
                this.notification.success(this.translation.$$get('raroc_detail_product.products_successfully_updated'));
                this.raiseProductChangedEvent();
                this.hasAnyCollateral = result;

                this.rarocDetailProductService.query(this.rarocId, this.state);
            });
    }

    private raiseProductChangedEvent() {
        this.productChanged.emit({ rarocVersion: this.rarocDetailProductService.rarocVersion, hasProducts: this.rarocDetailProductService.hasProducts });
    }
}
