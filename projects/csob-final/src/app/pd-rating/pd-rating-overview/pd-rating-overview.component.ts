import { Component, Injector, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CellClickEvent, DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { SortDescriptor, State } from '@progress/kendo-data-query';
import { of } from 'rxjs';
import { flatMap, tap } from 'rxjs/operators';

import { showTooltip } from 'src/app/app-common/common-functions';
import { BasePermissionsComponent } from 'src/app/app-shell/basePermissionsComponent';
import { SecurityService } from 'src/app/services/security.service';
import { SelectedPartyService } from '../../services/selected-party.service';
import { TranslationService } from '../../services/translation-service';
import { ENotificationType, UserNotificationService } from '../../services/user-notification.service';
import { UserProgressService } from '../../services/user-progress.service';
import { CodebookApiService } from '../../services/webapi/codebook-api-service';
import { PdCriteria } from '../models/pd-overview';
import { ICalculatePDRatingModelDto, IPartyHeaderDto, IPDRatingOverviewResDto } from './../../services/webapi/webapi-models';
import { PdRatingOverviewService } from './pd-rating-overview.service';

@Component({
    selector: 'app-pd-rating-overview',
    templateUrl: './pd-rating-overview.component.html',
    styleUrls: ['./pd-rating-overview.component.less'],
    providers: [
        PdRatingOverviewService
    ]
})

export class PDRatingOverviewComponent extends BasePermissionsComponent implements OnInit {
    canCopy = false;
    CalculatePdRating: ICalculatePDRatingModelDto;
    criteria = new PdCriteria()
    grid = {
        skip: 0, take: 10,
        sort: [{ field: 'PDModel', dir: 'asc' } as SortDescriptor]
    } as State;
    view$: PdRatingOverviewService;
    party: IPartyHeaderDto = null;

    constructor(
        private notification: UserNotificationService,
        private codebookApi: CodebookApiService,
        public progress: UserProgressService,
        private route: ActivatedRoute,
        private router: Router,
        private selectedPartyService: SelectedPartyService,
        private title: Title,
        private translation: TranslationService,
        private pdRatingOverviewService: PdRatingOverviewService,
        protected securityService: SecurityService) {
        super(securityService);
        this.view$ = this.pdRatingOverviewService;
    }

    ngOnInit() {
        this.title.setTitle(this.translation.$$get('pd_rating_overview.page_title'));
        this.progress.runProgress(
            this.selectedPartyService.partyHeader.pipe(
                tap(party => {
                    this.party = party;
                    super.fillRights(party);
                }),
                flatMap(() => {
                    if (this.party.PDModelId) {
                        return this.codebookApi.getIsCalculateInCu(this.party.PDModelId);
                    }
                    return of({} as ICalculatePDRatingModelDto);
                }),
                tap(calculatePdRating => this.CalculatePdRating = calculatePdRating),
            )).subscribe(() => {
                if (!(this.party.PDModelId && this.party.CreditFileId)) {
                    this.notification.show({ message: this.translation.$$get('pd_rating_overview.no_pdmodel_or_credit_file'), type: ENotificationType.Error, delay: 5000, pinned: 'while' });
                    this.router.navigate(['/party/detail', this.party.Id, 'credit']);
                }

                this.criteria.CreditFileId = this.party.CreditFileId;
                this.criteria.setState(this.grid);

                // pro defaultní třídění musí jít na WebAPI null sort column
                this.criteria.SortColumnName = null;

                // odstraním indikátor třízení z gridu
                if (this.grid.sort && this.grid.sort.length > 0) {
                    this.grid.sort[0].dir = null;
                    this.grid.sort[0].field = null;
                }

                this.pdRatingOverviewService.query(this.criteria);
            });
    }

    onGridUpdate(state: DataStateChangeEvent) {
        this.grid = state;

        this.criteria.setState(this.grid);
        this.pdRatingOverviewService.query(this.criteria);
    }

    onGridCellClicked(event: CellClickEvent) {
        if (!(this.hasRightTo && this.hasRightTo['PdRatingdetail']))
            return;

        const pdRatingItem = event.dataItem as IPDRatingOverviewResDto;
        this.router.navigate(['detail', pdRatingItem.Id], {
            relativeTo: this.route.parent
        });
    }

    showTooltip = (e: MouseEvent, kendoTooltipInstance: TooltipDirective): void =>
        showTooltip(e, kendoTooltipInstance);
}
