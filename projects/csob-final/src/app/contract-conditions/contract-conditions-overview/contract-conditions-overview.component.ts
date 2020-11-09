import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CellClickEvent, RowClassArgs } from '@progress/kendo-angular-grid';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { mergeMap, tap } from 'rxjs/operators';
import { showTooltip } from 'src/app/app-common/common-functions';
import { BasePermissionsComponent } from 'src/app/app-shell/basePermissionsComponent';
import { SecurityService } from 'src/app/services/security.service';
import { SelectedPartyService } from 'src/app/services/selected-party.service';
import { TranslationService } from 'src/app/services/translation-service';
import { UserProgressService } from 'src/app/services/user-progress.service';
import { EFrequencyUnit, IContractConditionFilterDto, IContractConditionViewDto, IProductInfoDto } from 'src/app/services/webapi/webapi-models';
import { hideTooltip } from '../../app-common/common-functions';
import { ContractConditionsService } from '../services/contract-conditions.service';
import { ContractConditionsOverviewService } from './contract-conditions-overview.service';

@Component({
  selector: 'app-contract-conditions-overview',
  templateUrl: './contract-conditions-overview.component.html',
  styleUrls: ['./contract-conditions-overview.component.less'],
  providers: [
    ContractConditionsService
  ]
})
export class ContractConditionsOverviewComponent extends BasePermissionsComponent implements OnInit {
  creditFileId: number;
  filteredProducts: IProductInfoDto[] = [];
  view$: ContractConditionsOverviewService;
  criteria: IContractConditionFilterDto;
  EFrequencyUnit = EFrequencyUnit;
  reschedulingActive: boolean;

  get defaultViewVisible() {
    return this.criteria && this.filteredProducts
      && this.criteria.ProductIds.length < this.filteredProducts.length;
  }

  constructor(
    private contractConditionsOverviewService: ContractConditionsOverviewService,
    private contractConditionsService: ContractConditionsService,
    public progress: UserProgressService,
    private route: ActivatedRoute,
    private router: Router,
    private selectedPartyService: SelectedPartyService,
    private title: Title,
    private translation: TranslationService,
    protected securityService: SecurityService
  ) {
    super(securityService);
    this.view$ = this.contractConditionsOverviewService;
  }

  ngOnInit(): void {
    this.title.setTitle(this.translation.$$get('contract_conditions_overview.page_title'));

    this.progress.runProgress(
      this.selectedPartyService.partyHeader.pipe(
        tap(party => {
          this.creditFileId = party.CreditFileId;
          super.fillRights(party);
        }),
        mergeMap(() => this.contractConditionsService.getProducts(this.creditFileId)),
        tap(products => this.filteredProducts = products),
        tap(products => this.criteria = { Active: true, CreditFileId: this.creditFileId, ProductIds: products.map(p => p.Id) } as IContractConditionFilterDto),
      )
    ).subscribe(() => {
      this.contractConditionsOverviewService.query(this.criteria);
    });
  }

  onGridCellClicked(event: CellClickEvent) {
    if (!(this.hasRightTo && this.hasRightTo['Conditionsdetail']))
      return;

    const contractConditionItem = event.dataItem as IContractConditionViewDto;
    this.router.navigate(['detail', contractConditionItem.Id], {
      relativeTo: this.route.parent,
      queryParams: {
        versionNumber: contractConditionItem.VersionNumber,
        readonly: true
      }
    });
  }

  onAddNewClicked() {
    if (!(this.hasRightTo && this.hasRightTo['Conditionsnew']))
      return;

    this.router.navigate(['detail', 'new'], {
      relativeTo: this.route.parent,
      queryParams: {
        versionNumber: 0,
        readonly: false
      }
    });
  }
  onFilteredOverview() {
    this.contractConditionsOverviewService.query(this.criteria);
  }

  onDefaultOverview() {
    this.criteria.ProductIds = this.filteredProducts.map(p => p.Id);
    this.contractConditionsOverviewService.query(this.criteria);
  }

  showTooltip = (e: MouseEvent, kendoTooltipInstance: TooltipDirective): void =>
    showTooltip(e, kendoTooltipInstance)

  hideTooltip = (kendoTooltipInstance: TooltipDirective): void =>
    hideTooltip(kendoTooltipInstance)

  getRowClass(context: RowClassArgs): string {
    if (context && context.dataItem as IContractConditionViewDto) {
      const contractCondition = context.dataItem as IContractConditionViewDto;
      const consolidated = contractCondition.Consolidated;
      if (consolidated)
        return 'contract-condition-consolidated';
    }

    return '';
  }
}
