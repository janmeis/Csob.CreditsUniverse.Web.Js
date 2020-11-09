import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { first, map, mergeMap, tap } from 'rxjs/operators';
import { PartyApiService } from 'src/app/services/webapi/party-api-service';
import { PartyLinkDto } from 'src/app/services/webapi/webapi-models-classes';
import { MessageBoxDialogComponent } from '../../app-common/components/message-box-dialog/message-box-dialog.component';
import { EditorValidation } from '../../app-common/directives/editor-validator.directive';
import { CanComponentDeactivate } from './../../services/app-navigation-guard.service';
import { TranslationService } from '../../services/translation-service';
import { UserNotificationService } from '../../services/user-notification.service';
import { UserProgressService } from '../../services/user-progress.service';
import { PartyLinksApiService } from '../../services/webapi/partylinks-api-service';
import { IPartyLinkDto } from '../../services/webapi/webapi-models';
import { PartySearchDialogComponent } from '../party-search-dialog/party-search-dialog.component';
import { PartyCodebookService } from '../services/party-codebook.service';
import { Title } from '@angular/platform-browser';

type TParty = 'source' | 'target';

@Component({
    selector: 'app-party-links-detail',
    templateUrl: './party-links-detail.component.html',
    styleUrls: ['./party-links-detail.component.less'],
})
export class PartyLinksDetailComponent implements OnInit, CanComponentDeactivate {
    @ViewChild('form') private form: NgForm;
    private id: number;
    partyId: number;
    needsPercent = false;

    model: IPartyLinkDto = new PartyLinkDto()

    constructor(
        private injector: Injector,
        private notification: UserNotificationService,
        public Parties: PartyCodebookService,
        private partyApiService: PartyApiService,
        private partyLinksService: PartyLinksApiService,
        public progress: UserProgressService,
        private route: ActivatedRoute,
        private router: Router,
        private translation: TranslationService,
        private title: Title
    ) { }
    public ngOnInit() {
        this.partyId = +this.route.snapshot.paramMap.get('id');
        this.id = +this.route.snapshot.queryParams['id'];
        this.title.setTitle(this.translation.$$get('party_links_detail.new_party_link'));
        if (this.id) {
            this.title.setTitle(this.translation.$$get('party_links_detail.party_link_detail'));
            this.progress.runProgress(this.update$()).subscribe();
        }
    }
    OnPartyTypeChanged() {
        //ngOnChanges tady proste nefunguje
        //TODO: use enum
        this.needsPercent = [3, 5, 6, 7, 10].indexOf(this.model.EssRelationTypeId) >= 0;
        if (!this.needsPercent) {
            this.model.PercentOwnership = null;
        }
    }
    onCancel() {
        this.form.reset();
        this.router.navigate(['/party/detail', this.partyId, 'links']);
    }
    onSwap() {
        event.preventDefault();
        var i = this.model.SourcePartyId;
        this.model.SourcePartyId = this.model.TargetPartyId;
        this.model.TargetPartyId = i;
        var s = this.model.SourcePartyName;
        this.model.SourcePartyName = this.model.TargetPartyName;
        this.model.TargetPartyName = s;
    }
    onSetCurrent(p: TParty) {
        event.preventDefault();
        if (p == 'target') {
            this.model.TargetPartyId = this.partyId;
            this.model.TargetPartyName = null;
        } else {
            this.model.SourcePartyId = this.partyId;
            this.model.SourcePartyName = null;
        }
        this.form.form.markAsDirty();
    }
    async onSearchParty(p: TParty) {
        event.preventDefault();
        var data = await PartySearchDialogComponent.show(this.injector, 'partylink', { currentId: this.partyId /*onlyCompleted: true*/ });
        if (data && data.Id)
            this.getLinkedParty(p, data.Id, data.ClientName || data.FullName);
        else if (data && data.Cuid)
            this.progress.runProgress(
                this.partyApiService.getDetail(0, { cuid: data.Cuid }).pipe(
                    tap(partyDetail =>
                        this.getLinkedParty(p, partyDetail.Id, partyDetail.ClientName || partyDetail.FullName)
                    ))).subscribe();
    }
    validatePercentValue(args: EditorValidation) {
        var v = +args.value;
        if (v > 100 || v < 0) {
            args.errors.push(this.translation.$$get('party_links_detail.please_enter_number_between_0_and_100'));
            return;
        }
    }
    onSave() {
        this.progress.runProgress(
            this.save().pipe(
                mergeMap(saved => {
                    if (saved) {
                        this.form.reset()
                        this.replaceUrl();
                        return this.update$().pipe(map(() => true))
                    }

                    return of(false);
                })
            )).subscribe(result => {
                if (result)
                    this.notification.success(this.translation.$$get('party_links_detail.data_saved'));
            });
    }
    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        if (!this.progress.running && this.form.dirty)
            return MessageBoxDialogComponent.dirtyConfirmation(this.injector, () => this.save())

        return of(true);
    }
    private update$(): Observable<IPartyLinkDto> {
        return this.id
            ? this.partyLinksService.getLoad(this.id).pipe(tap(data => this.model = data))
            : of<IPartyLinkDto>();
    }
    private save(): Observable<boolean> {
        if (!this.isFormValid())
            return of(false);

        return this.partyLinksService.postSave(this.model).pipe(
            tap(id => this.id = id),
            map(() => true),
            first());
    }
    private isFormValid(): boolean {
        const errorMessages = [];
        if (this.form.invalid)
            errorMessages.push(this.translation.$$get('party_links_detail.form_is_not_valid'));
        if (this.model.SourcePartyId == this.model.TargetPartyId)
            errorMessages.push(this.translation.$$get('party_links_detail.you_must_select_different_party_to_source_and_target'));

        errorMessages.forEach(m => this.notification.error(m));
        return errorMessages.length == 0;
    }
    private replaceUrl(): void {
        this.router.navigate(['detail', this.partyId, 'links', 'edit'], {
            queryParams: { id: this.id },
            relativeTo: this.route.parent,
            replaceUrl: true
        });
    }
    private getLinkedParty(p: string, id: number, partyName: string) {
        if (p == 'target') {
            this.model.TargetPartyId = id;
            this.model.TargetPartyName = partyName;
        }
        else {
            this.model.SourcePartyId = id;
            this.model.SourcePartyName = partyName;
        }
        this.form.form.markAsDirty();
    }
}
