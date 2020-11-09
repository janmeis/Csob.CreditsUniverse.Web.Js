import { Component, Injector, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CodebookApiService, CodebooksService, ECodetable, EInterestRateType, EKeyEnum, ICodebookItem, IInterestDto, IProductSubTypeCUDto, IProductTypeCUDto, IProductViewDto, ProductApiService, SelectedPartyService, TranslationService, UserNotificationService, UserProgressService } from 'projects/services/src/public-api';
import { Observable } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { GetCodebookProvider, GetStaticCodebookProvider, GridEnumService, ICodebookProvider } from 'projects/app-common/src/public-api';
import { ProductCollateralDialogComponent } from '../product-collateral-dialog/product-collateral-dialog.component';


@Component({
    selector: 'app-product-detail-header',
    templateUrl: './product-detail-header.component.html',
    styleUrls: ['./product-detail-header.component.less'],
})
export class ProductDetailHeaderComponent implements OnInit {
    readonly = true;
    id: number;
    creditFileId: number;
    model: IProductViewDto;
    allSubtypes: IProductSubTypeCUDto[];
    productTypes: ICodebookProvider;
    productSubtypes: ICodebookProvider;
    timeUnits: ICodebookProvider;
    rateTypes: ICodebookProvider;
    referenceRates: ICodebookProvider;
    feeCategory: ICodebookProvider;
    feeClass: ICodebookProvider;
    feeUnit: ICodebookProvider;
    frequencyUnits: ICodebookProvider;

    get interest(): IInterestDto {
        return this.model.LastInterest;
    }
    get isFloat(): boolean {
        return this.interest.RateType == EInterestRateType.Float;
    }

    constructor(
        private gridEnumService: GridEnumService,
        private codebookApiService: CodebookApiService,
        private injector: Injector,
        private notification: UserNotificationService,
        private productApiService: ProductApiService,
        public progress: UserProgressService,
        private route: ActivatedRoute,
        private selectedPartyService: SelectedPartyService,
        private title: Title,
        private translation: TranslationService,
        private codebooksService: CodebooksService
    ) { }
    ngOnInit(): void {
        this.title.setTitle(this.translation.$$get('product_detail_header.page_title'));

        this.id = +this.route.snapshot.paramMap.get('id');
        this.progress.runProgress(
            this.selectedPartyService.partyHeader.pipe(
                tap(party => this.creditFileId = party.CreditFileId),
                mergeMap(() => this.update$()),
                tap(() => {
                    if (!this.model.Interests || this.model.Interests.length == 0)
                        this.model.Interests = [{ RateType: EInterestRateType.Fixed } as IInterestDto];
                    if (!this.model.Fees)
                        this.model.Fees = [];
                }),
                mergeMap(() => this.productApiService.getAllProductTypes(this.model.SectionId)),
                map(types => types
                    .map((r: IProductTypeCUDto) => ({ Value: r.Id, Text: r.Description } as ICodebookItem))),
                tap(codebookItems => this.productTypes = GetStaticCodebookProvider(codebookItems)),
                mergeMap(() => this.productApiService.getAllProductSubtypes()),
                tap(subTypes => this.allSubtypes = subTypes),
                tap(() => this.productSubtypes = this.getFilteredSubtypes(this.model.ProductTypeCUId))
            )).subscribe();

        this.timeUnits = this.gridEnumService.GetEnumCodebookProvider(EKeyEnum.TimeUnit);
        this.rateTypes = this.gridEnumService.GetEnumCodebookProvider(EKeyEnum.InterestRateType);

        this.codebookApiService.getKeyEnums(EKeyEnum.InterestReferenceRate).subscribe(refRates => {
            this.referenceRates = GetStaticCodebookProvider(refRates);
            //console.log("reference rates ", this.referenceRates);
        })

        this.feeCategory = this.gridEnumService.GetEnumCodebookProvider(EKeyEnum.FeeCategory);
        this.feeClass = this.gridEnumService.GetEnumCodebookProvider(EKeyEnum.FeeClass);
        this.feeUnit = GetCodebookProvider(this.codebooksService, ECodetable[ECodetable.FeeUnit]);
        this.frequencyUnits = this.gridEnumService.GetEnumCodebookProvider(EKeyEnum.FrequencyUnit);
    }
    onSave(): void {
    }
    async showProductCollateralMatrix() {
        if (await ProductCollateralDialogComponent.show(this.injector, this.creditFileId, this.model.SectionId, this.readonly))
            this.update$()
                .subscribe(() => this.notification.success(this.translation.$$get('product_detail_header.collaterals_successfully_updated')));
    }
    private update$ = (): Observable<IProductViewDto> =>
        this.productApiService.getProductDetail(this.id).pipe(
            tap(detail => this.model = detail));
    private getFilteredSubtypes(productTypeId: number): ICodebookProvider {
        const codebookItems = this.allSubtypes
            .filter(s => s.ProductTypeCUId == productTypeId)
            .map(s => ({ Value: s.Id, Text: s.DescriptionL } as ICodebookItem));
        return GetStaticCodebookProvider(codebookItems);
    }
}
