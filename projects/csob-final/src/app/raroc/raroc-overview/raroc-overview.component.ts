import { Component, Injector, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CellClickEvent, DataStateChangeEvent, RowArgs } from '@progress/kendo-angular-grid';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { SortDescriptor, State } from '@progress/kendo-data-query';

import { showTooltip } from '../../app-common/common-functions';
import { MessageBoxDialogComponent } from '../../app-common/components/message-box-dialog/message-box-dialog.component';
import { EditorValidation } from '../../app-common/directives/editor-validator.directive';
import { BasePermissionsComponent } from '../../app-shell/basePermissionsComponent';
import { SecurityService } from '../../services/security.service';
import { SelectedPartyService } from '../../services/selected-party.service';
import { TranslationService } from '../../services/translation-service';
import { UserProgressService } from '../../services/user-progress.service';
import { RarocApiService } from '../../services/webapi/raroc-api-service';
import { EStateRaroc, IPartyHeaderDto } from '../../services/webapi/webapi-models';
import { IRarocOverviewResDto } from './../../services/webapi/webapi-models';
import { RarocCriteria, RarocOverviewService } from './raroc-overview.service';
import { tap } from 'rxjs/operators';
import { UserNotificationService, ENotificationType } from '../../services/user-notification.service';

export enum EViewMode {
    DetailView = 0,
    ProductView = 1,
    CollateralView = 2,
    ResultSet = 3
}

export interface IsValid {
    isValid(): boolean;
    validations?: { [key: string]: EditorValidation }
}

@Component({
    selector: 'app-raroc-overview',
    templateUrl: './raroc-overview.component.html',
    styleUrls: ['./raroc-overview.component.less'],
    providers: [
        RarocOverviewService
    ]
})
export class RarocOverviewComponent extends BasePermissionsComponent implements OnInit {
    readonly = false;
    view$: RarocOverviewService;
    criteria = new RarocCriteria();
    grid = {
        skip: 0, take: 10,
        sort: [{ field: 'LGDModel', dir: 'asc' } as SortDescriptor]
    } as State;
    selection: IRarocOverviewResDto[] = [];
    EStateRadoc = EStateRaroc;
    EViewMode = EViewMode;
    party: IPartyHeaderDto;

    get canShow() {
        return this.selection && this.selection.length == 1;
    }
    get canEdit() {
        return this.canShow && this.selection[0].StateRarocEnum == EStateRaroc.InProcess;
    }
    get canDelete() {
        return this.selection && this.selection.length > 0 && this.selection.filter(s => s.RarocForCredit).length == 0;
    }
    constructor(
        private notification: UserNotificationService,
        private rarocApi: RarocApiService,
        private injector: Injector,
        public progress: UserProgressService,
        private selectedParty: SelectedPartyService,
        private title: Title,
        private translation: TranslationService,
        private route: ActivatedRoute,
        private router: Router,
        private rarocOverviewService: RarocOverviewService,
        protected securityService: SecurityService
    ) {
        super(securityService);
        this.view$ = this.rarocOverviewService;
    }

    ngOnInit() {
        this.title.setTitle(this.translation.$$get('raroc_overview.page_title'));

        this.progress.runProgress(
            this.selectedParty.partyHeader.pipe(
                tap(party => {
                    this.party = party;
                    //console.log("MAM PARTY ", party);
                    this.criteria.CreditFileId = party.CreditFileId;
                    super.fillRights(party);
                }))).subscribe(async () => {
                    if (!this.party.PDModelId)
                        this.party = await this.selectedParty.reload().toPromise();

                    if (!(this.party.PDModelId && this.party.CreditFileId)) {
                        this.notification.show({ message: this.translation.$$get('raroc_overview.no_pdmodel_or_credit_file'), type: ENotificationType.Error, delay: 5000, pinned: 'while' });
                        this.router.navigate(['/party/detail', this.party.Id, 'credit']);
                    }

                    this.criteria.setState(this.grid);

                    // pro defaultní třídění musí jít na WebAPI null sort column
                    this.criteria.SortColumnName = null;

                    // odstraním indikátor třízení z gridu
                    if (this.grid.sort && this.grid.sort.length > 0) {
                        this.grid.sort[0].dir = null;
                        this.grid.sort[0].field = null;
                    }

                    this.rarocOverviewService.query(this.criteria);
                });
    }
    async deleteHandler() {
        const opts = MessageBoxDialogComponent.createDeleteAlertOption(this.injector);
        opts.message = this.translation.$$get('raroc_overview.sure_delete_selected_rarocs');
        if (await MessageBoxDialogComponent.show(this.injector, opts).toPromise())
            this.progress.runProgress(this.rarocApi.postCancelRarocs(this.selection.map(s => s.Id)))
                .subscribe(() => {
                    this.selection = [];
                    this.rarocOverviewService.query(this.criteria);
                });
    }
    async copyHandler() {
        const opts = MessageBoxDialogComponent.createYesNoOptions(this.injector);
        opts.message = this.translation.$$get('raroc_overview.sure_copy_selected_raroc');
        const btn = opts.buttons.find(b => b.result);
        btn.css = 'k-button k-primary';
        if (await MessageBoxDialogComponent.show(this.injector, opts).toPromise())
            this.progress.runProgress(this.rarocApi.getCopyRaroc(this.selection[0].Id))
                .subscribe(rarocId =>
                    this.router.navigate(['detail', rarocId], {
                        relativeTo: this.route.parent,
                        queryParams: { readonly: this.readonly, viewMode: EViewMode.DetailView }
                    })
                );
    }
    onGridUpdate(state: DataStateChangeEvent) {
        this.grid = state;
        this.criteria.setState(this.grid);
        this.selection = [];
        this.rarocOverviewService.query(this.criteria);
    }
    onGridCellClicked(event: CellClickEvent) {
        if (event.column.isCheckboxColumn || !(this.hasRightTo && this.hasRightTo['Rarocdetail']))
            return;

        const rarocItem = event.dataItem as IRarocOverviewResDto;
        this.router.navigate(['detail', rarocItem.Id], {
            relativeTo: this.route.parent,
            queryParams: {
                readonly: rarocItem.StateRarocEnum != EStateRaroc.InProcess,
                viewMode: EViewMode.DetailView
            }
        });
    }
    rarocSelectionKey = (context: RowArgs): IRarocOverviewResDto =>
        context.dataItem as IRarocOverviewResDto;
    showTooltip = (e: MouseEvent, kendoTooltipInstance: TooltipDirective): void =>
        showTooltip(e, kendoTooltipInstance);
}
