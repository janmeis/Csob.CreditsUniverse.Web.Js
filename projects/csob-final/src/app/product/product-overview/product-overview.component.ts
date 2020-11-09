import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SelectionEvent } from '@progress/kendo-angular-grid';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { GroupDescriptor, State } from '@progress/kendo-data-query';
import { tap } from 'rxjs/operators';
import { showTooltip } from 'src/app/app-common/common-functions';
import { BasePermissionsComponent } from 'src/app/app-shell/basePermissionsComponent';
import { SecurityService } from 'src/app/services/security.service';
import { SelectedPartyService } from '../../services/selected-party.service';
import { TranslationService } from '../../services/translation-service';
import { UserNotificationService } from '../../services/user-notification.service';
import { ETimeUnit, IProductViewDto } from '../../services/webapi/webapi-models';
import { ProductCollateralDialogComponent } from '../product-collateral-dialog/product-collateral-dialog.component';
import { ProductOverviewService } from './product-overview.service';

@UntilDestroy()
@Component({
    selector: 'app-product-overview',
    templateUrl: './product-overview.component.html',
    styleUrls: ['./product-overview.component.less'],
    providers: [
        ProductOverviewService
    ]
})
export class ProductOverviewComponent extends BasePermissionsComponent implements OnInit, OnDestroy {
    readonly = true;
    view$: ProductOverviewService;
    state = {
        group: [{ field: 'SectionId' } as GroupDescriptor]
    } as State;
    creditFileId: number;
    ETimeUnit = ETimeUnit;

    constructor(
        private injector: Injector,
        private notification: UserNotificationService,
        private productOverviewService: ProductOverviewService,
        private route: ActivatedRoute,
        private router: Router,
        private selectedParty: SelectedPartyService,
        private title: Title,
        private translation: TranslationService,
        protected securityService: SecurityService
    ) {
        super(securityService);
        this.view$ = this.productOverviewService;
    }
    ngOnInit(): void {
        this.title.setTitle(this.translation.$$get('product_overview.page_title'));

        this.selectedParty.partyHeader.pipe(
                untilDestroyed(this),
                tap(party => {
                    this.creditFileId = party.CreditFileId;
                    super.fillRights(party);
                })
        ).subscribe(_ => {
            this.productOverviewService.query(this.creditFileId, this.state);
        });
    }
    ngOnDestroy(): void {
    }
    getSectionDescription(sectionId: number, items: IProductViewDto[]): string {
        const item = items.find(i => i.SectionId == sectionId)
        return item ? item.SectionDescription : `〉${sectionId} 〈`;
    }
    getTypeDescription(dataItem: IProductViewDto) {
        switch (dataItem.Level) {
            case 1:
                return `<span class="fa fa-long-arrow-right pr-2"></span>${dataItem.TypeDescription}`
            case 2:
                return `<span class="fa fa-long-arrow-right pr-2 pl-2"></span>${dataItem.TypeDescription}`
            default:
                return dataItem.TypeDescription || '';
        }
    }
    selectionChangeHandler(selection: SelectionEvent) {
        if (!(this.hasRightTo && this.hasRightTo['Productdetail']))
            return;

        if (selection.selectedRows.length > 0) {
            const id = selection.selectedRows[0].dataItem.Id;
            this.router.navigate(['detail', id], { relativeTo: this.route.parent });
        }
    }

    showTooltip = (e: MouseEvent, kendoTooltipInstance: TooltipDirective): void =>
        showTooltip(e, kendoTooltipInstance);

    async showProductCollateralMatrix(sectionId: number) {
        if (await ProductCollateralDialogComponent.show(this.injector, this.creditFileId, sectionId, this.readonly)) {
            this.notification.success(this.translation.$$get('product_overview.collaterals_successfully_updated'));
            this.productOverviewService.query(this.creditFileId, this.state);
        }
    }
}
