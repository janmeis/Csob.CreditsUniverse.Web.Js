import { Component, Injector, Input, OnInit } from '@angular/core';
import { RowClassArgs } from '@progress/kendo-angular-grid/dist/es2015/rendering/common/row-class';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { flatMap, tap } from 'rxjs/operators';

import { showTooltip } from 'src/app/app-common/common-functions';
import { BasePermissionsComponent } from 'src/app/app-shell/basePermissionsComponent';
import { SecurityService } from 'src/app/services/security.service';
import { SelectedPartyService } from 'src/app/services/selected-party.service';
import { UserProgressService } from 'src/app/services/user-progress.service';
import { TranslationService } from '../../services/translation-service';
import { IPartyHeaderDto, IRarocDto, IRarocOutputContainerDto, IRarocOutputDto } from '../../services/webapi/webapi-models';
import { RarocExportDialogComponent } from '../raroc-export-dialog/raroc-export-dialog.component';
import { RarocDetailResultService } from './raroc-detail-result.service';

@Component({
    selector: 'app-raroc-detail-result',
    templateUrl: './raroc-detail-result.component.html',
    styleUrls: ['./raroc-detail-result.component.less'],
    providers: [
        RarocDetailResultService
    ]
})
export class RarocDetailResultComponent extends BasePermissionsComponent implements OnInit {
    @Input() rarocId: number;
    @Input() raroc: IRarocDto;
    party: IPartyHeaderDto;
    rarocOutput: IRarocOutputContainerDto;
    get resultSet(): IRarocOutputDto {
        return this.rarocOutput ? this.rarocOutput.ResultSet : null;
    }

    constructor(
        private selectedParty: SelectedPartyService,
        private progress: UserProgressService,
        private injector: Injector,
        private rarocDetailResultService: RarocDetailResultService,
        protected securityService: SecurityService
    ) {
        super(securityService);
    }

    ngOnInit(): void {
        this.progress.runProgress(
            this.selectedParty.partyHeader.pipe(
                tap(party => {
                    this.party = party;
                    super.fillRights(party);
                }),
                flatMap(() => this.rarocDetailResultService.getRarocOutputt$(this.rarocId))
            )).subscribe((result: IRarocOutputContainerDto) => {
                this.rarocOutput = result;
            });
    }

    onExport() {
        RarocExportDialogComponent.show(this.injector, this.party.Id, this.rarocId);
    }

    showTooltip = (e: MouseEvent, kendoTooltipInstance: TooltipDirective): void =>
        showTooltip(e, kendoTooltipInstance);

    getRowClass = (context: RowClassArgs) =>
        context.dataItem.Id == 0 ? 'grid-summary' : '';
}
