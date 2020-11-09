import { IPartyHeaderDto } from './../../services/webapi/webapi-models';
import { Component, Injector, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { tap, mergeMap, flatMap } from 'rxjs/operators';
import { ICodebookProvider, GetStaticCodebookProvider } from '../../app-common/components/editor-codebook/editor-codebook.component';
import { GridEnumService } from '../../app-common/services/grid-enum.service';
import { SelectedPartyService } from '../../services/selected-party.service';
import { TranslationService } from '../../services/translation-service';
import { UserNotificationService } from '../../services/user-notification.service';
import { UserProgressService } from '../../services/user-progress.service';
import { CollateralApiService } from '../../services/webapi/collateral-api-service';
import { ETimeUnit, ICollateralSubTypeCUDto, ICollateralViewDto, ICodebookItem } from '../../services/webapi/webapi-models';
import { Observable, of } from 'rxjs';
import { ProductCollateralDialogComponent } from '../../product/product-collateral-dialog/product-collateral-dialog.component';
import { PartyApiService } from '../../services/webapi/party-api-service';

@Component({
    selector: 'app-collateral-detail-header',
    templateUrl: './collateral-detail-header.component.html',
    styleUrls: ['./collateral-detail-header.component.less'],
})
export class CollateralDetailHeaderComponent implements OnInit {
    readonly = true;
    id: number;
    creditFileId: number;
    model: ICollateralViewDto;
    guarantor: string;
    allSubtypes: ICollateralSubTypeCUDto[];
    collateralSubtypes: ICodebookProvider;

    constructor(
        private gridEnumService: GridEnumService,
        private injector: Injector,
        private notification: UserNotificationService,
        private collateralApiService: CollateralApiService,
        public progress: UserProgressService,
        private route: ActivatedRoute,
        private selectedPartyService: SelectedPartyService,
        private title: Title,
        private translation: TranslationService,
        private partyApiService: PartyApiService,
    ) { }
    ngOnInit() {
        this.title.setTitle(this.translation.$$get('collateral_detail_header.page_title'));

        this.id = +this.route.snapshot.paramMap.get('id');
        this.progress.runProgress(
            this.selectedPartyService.partyHeader.pipe(
                tap(party => this.creditFileId = party.CreditFileId),
                mergeMap(() => this.update$()),
                flatMap(() => {
                    if (this.model.GuarantorId)
                        return this.partyApiService.getPartyHeader(this.model.GuarantorId);
                    return of({ PartyName: this.translation.$$get('collateral_detail_header.unknown') } as IPartyHeaderDto)
                }),
                tap(partyHeader => this.guarantor = partyHeader.PartyName),
                flatMap(() => this.collateralApiService.getAllCollateralSubtypes()),
                tap(subTypes => this.allSubtypes = subTypes),
                tap(() => this.collateralSubtypes = this.getFilteredSubtypes(this.model.CollateralTypeCUId))
            )).subscribe();
    }
    onSave(): void {
    }
    async showProductCollateralMatrix() {
        if (await ProductCollateralDialogComponent.show(this.injector, this.creditFileId, this.model.SectionId, this.readonly))
            this.update$()
                .subscribe(() => this.notification.success(this.translation.$$get('collateral_detail_header.collaterals_successfully_updated')));
    }
    private update$ = (): Observable<ICollateralViewDto> =>
        this.collateralApiService.getCollateralDetailView(this.id).pipe(
            tap(detail => this.model = detail));
    private getFilteredSubtypes(collateralTypeId: number): ICodebookProvider {
        const codebookItems = this.allSubtypes
            .filter(s => s.CollateralTypeCUId == collateralTypeId)
            .map(s => ({ Value: s.Id, Text: s.DescriptionL } as ICodebookItem));
        return GetStaticCodebookProvider(codebookItems);
    }
}
