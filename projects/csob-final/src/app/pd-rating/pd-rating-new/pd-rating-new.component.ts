import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { first, map, mergeMap, tap } from 'rxjs/operators';
import { EnumValue } from '../../app-common/components/editor-enum/editor-enum.component';
import { MessageBoxDialogComponent } from '../../app-common/components/message-box-dialog/message-box-dialog.component';
import { BasePermissionsComponent } from '../../app-shell/basePermissionsComponent';
import { CanComponentDeactivate } from 'projects/services/src/public-api';
import { CodebooksService } from 'projects/services/src/public-api';
import { SecurityService } from 'projects/services/src/public-api';
import { FinancialApiService } from 'projects/services/src/public-api';
import { SelectedPartyService } from 'projects/services/src/public-api';
import { TranslationService } from 'projects/services/src/public-api';
import { UserNotificationService } from 'projects/services/src/public-api';
import { UserProgressService } from 'projects/services/src/public-api';
import { PdRatingApiService } from 'projects/services/src/public-api';
import { EPDRatingCategory, EStatePDRating, IPDRatingNewDto } from 'projects/services/src/public-api';


@Component({
    selector: 'app-pd-rating-new.component',
    templateUrl: './pd-rating-new.component.html',
    styleUrls: ['./pd-rating-new.component.less'],
})
export class PDRatingNewComponent extends BasePermissionsComponent implements CanComponentDeactivate, OnInit {
    @ViewChild('form') private form: NgForm;
    model: IPDRatingNewDto;
    canSave = false;
    id: number;
    EStatePDRating = EStatePDRating;
    pdRatingCategoryEnumValues: EnumValue[];

    private partyId: number;

    constructor(
        private codebooksService: CodebooksService,
        private finApi: FinancialApiService,
        private injector: Injector,
        private notification: UserNotificationService,
        private pdApi: PdRatingApiService,
        public progress: UserProgressService,
        private route: ActivatedRoute,
        private router: Router,
        private selectedParty: SelectedPartyService,
        private title: Title,
        private translation: TranslationService,
        protected securityService: SecurityService
    ) {
        super(securityService);
    }
    ngOnInit() {
        this.title.setTitle(this.translation.$$get('pd_rating_new.new_pd_rating'));
        this.update();
    }
    onSave(statePDRating: EStatePDRating) {
        this.model.StatePDRating = statePDRating;
        this.progress.runProgress(
            this.save().pipe(
                mergeMap(saved => {
                    if (saved)
                        this.form.reset();

                    return of(saved);
                })
            )).subscribe(result => {
                if (result) {
                    this.notification.success(this.translation.$$get('pd_rating_new.pd_rating_added'));
                    this.router.navigate(['detail', this.id], { relativeTo: this.route.parent });
                }
            });
    }
    private save(): Observable<boolean> {
        if (this.form.invalid)
            return of(false);

        return this.pdApi.postAddNewPDRating(this.model).pipe(
            tap(id => this.id = id),
            map(() => true),
            first()
        );
    }
    ratingChangedHandler(event: boolean) {
        this.form.form.markAsDirty();
    }
    private update(): void {
        this.progress.runProgress(
            this.selectedParty.partyHeader.pipe(
                tap(party => {
                    this.model = {
                        PDRatingCategoryEnum: EPDRatingCategory.Standard,
                        PDRatingModelId: party.PDModelId,
                        CreditFileId: party.CreditFileId,
                        StatePDRating: EStatePDRating.InProcess
                    } as IPDRatingNewDto;
                    this.partyId = party.Id;
                    super.fillRights(party);
                }),
                mergeMap(_ => this.codebooksService.GetCodebook('EPDRatingCategory')),
                mergeMap(category => this.finApi.getExistsConsolidationFinishFV(this.partyId).pipe(
                    tap(exists => {
                        const filteredCategory = exists ? category : category.filter(c => c.Value != EPDRatingCategory.Comparison);
                        this.pdRatingCategoryEnumValues = filteredCategory.map(c => ({ value: c.Value, text: c.Text } as EnumValue))
                    })
                )))
        ).subscribe();
    }
    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        if (!this.progress.loading && this.form && this.form.dirty) {
            return MessageBoxDialogComponent.dirtyConfirmation(this.injector, () => this.save());
        }

        return of(true);
    }
}
