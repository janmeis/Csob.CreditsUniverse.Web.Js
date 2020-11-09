import { Component, Injector, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SelectionEvent } from '@progress/kendo-angular-grid';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { GroupDescriptor, State } from '@progress/kendo-data-query';
import { tap } from 'rxjs/operators';
import { showTooltip } from 'projects/app-common/src/public-api'
import { BasePermissionsComponent } from '../../app-shell/basePermissionsComponent';
import { SecurityService } from 'projects/services/src/public-api';
import { ICollateralViewDto } from 'projects/services/src/public-api';
import { ProductCollateralDialogComponent } from '../../product/product-collateral-dialog/product-collateral-dialog.component';
import { SelectedPartyService } from 'projects/services/src/public-api';
import { TranslationService } from 'projects/services/src/public-api';
import { UserNotificationService } from 'projects/services/src/public-api';
import { CollateralOverviewService } from './collateral-overview.service';

@UntilDestroy()
@Component({
    selector: 'app-collateral-overview',
    templateUrl: './collateral-overview.component.html',
    styleUrls: ['./collateral-overview.component.less'],
    providers: [
        CollateralOverviewService
    ]
})
export class CollateralOverviewComponent extends BasePermissionsComponent implements OnInit {
    readonly = true;
    view$: CollateralOverviewService;
    state = {
        group: [{ field: 'SectionId' } as GroupDescriptor]
    } as State;
    creditFileId: number;

    constructor(
        private injector: Injector,
        private notification: UserNotificationService,
        private collateralOverviewService: CollateralOverviewService,
        private router: Router,
        private route: ActivatedRoute,
        private selectedParty: SelectedPartyService,
        private title: Title,
        private translation: TranslationService,
        protected securityService: SecurityService
    ) {
        super(securityService);
        this.view$ = this.collateralOverviewService;
    }
    ngOnInit() {
        this.title.setTitle(this.translation.$$get('collateral_overview.collateral_overview'));

        this.selectedParty.partyHeader.pipe(
            untilDestroyed(this),
            tap(party => {
                this.creditFileId = party.CreditFileId;
                super.fillRights(party);
            })
        ).subscribe(_ => {
            this.collateralOverviewService.query(this.creditFileId, this.state);
        });
    }
    getSectionDescription(sectionId: number, items: ICollateralViewDto[]): string {
        const item = items.find(i => i.SectionId == sectionId);
        return item ? item.SectionDescription : `〉${sectionId} 〈`;
    }
    selectionChangeHandler(selection: SelectionEvent) {
        if (!(this.hasRightTo && this.hasRightTo['Collateraldetail']))
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
            this.notification.success(this.translation.$$get('collateral_overview.collaterals_successfully_updated'));
            this.collateralOverviewService.query(this.creditFileId, this.state);
        }
    }
}
