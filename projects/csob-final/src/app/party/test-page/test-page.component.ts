import { Location } from '@angular/common';
import { Component, Inject, Injector, LOCALE_ID, OnInit } from '@angular/core';

import { ICodebookProvider } from '../../app-common/components/editor-codebook/editor-codebook.component';
import { MessageBoxDialogComponent } from '../../app-common/components/message-box-dialog/message-box-dialog.component';
import { EditorValidation } from '../../app-common/directives/editor-validator.directive';
import { CanComponentDeactivate, CurrentLangService } from 'projects/services/src/public-api';
import { CodebookItem } from 'projects/services/src/public-api';
import { TranslationService } from 'projects/services/src/public-api';
import { UrlHelperService } from 'projects/services/src/public-api';
import { ENotificationType, UserNotificationService } from 'projects/services/src/public-api';
import { TestApiService } from 'projects/services/src/public-api';
import { EPartyType, ITestData } from 'projects/services/src/public-api';
import { toDateOnlyString, fromDateOnlyString } from '../../app-common/dates';

class TestModel {
    Street: string = null
    City: string = null
    Xml: string = null
    PersonType: EPartyType = null
    KBCId: number = null
    datum: Date = null
    history: boolean = false
    currencyId: number = null
    currency: string = null
}

@Component({
    selector: 'app-test-page',
    templateUrl: './test-page.component.html',
    styleUrls: ['./test-page.component.less'],
})
export class TestPageComponent implements OnInit, CanComponentDeactivate {
    model = new TestModel()
    number = 42;
    EPartyType = EPartyType
    result: any
    today = new Date();
    testDate: string = toDateOnlyString(fromDateOnlyString('2019-01-01'))
    testDateText: string
    public onTestDate() {
        var dt = fromDateOnlyString(this.testDate);
        this.testDateText = this.testDate + " -> " + dt.toISOString() + " -> " + dt;
    }
    lang: string = undefined;
    testString: string = null;
    testString2: string = null;
    isDirty: boolean = false;
    _filterText: string = null;
    public get filterText(): string { return this._filterText; }
    public set filterText(v: string) {
        this._filterText = v;
        if (v)
            v = v.toLocaleLowerCase();
        this.filteredCodebook = {
            getItems: () => Promise.resolve(this.items.filter(x => x.Text.toLocaleLowerCase().indexOf(v) >= 0)),
            getItem: (id) => Promise.resolve(this.items.find(x => x.Value == id))
        };
    }
    private items: CodebookItem[] = [
        { Text: 'Karel Novak', Value: 1 },
        { Text: 'Pepa Novak', Value: 2 },
        { Text: 'Karel Svoboda', Value: 3 },
        { Text: 'Pepa Svoboda', Value: 4 },
        { Text: 'Karel Pepa', Value: 5 },
    ];
    filteredCodebook: ICodebookProvider = {
        getItems: () => Promise.resolve(this.items),
        getItem: (id) => Promise.resolve(this.items.find(x => x.Value == id))
    };
    public getFilteredCodebook() {
    }
    constructor(
        private testApi: TestApiService,
        private userNotificationService: UserNotificationService,
        private curentLang: CurrentLangService,
        private injector: Injector,
        private location: Location,
        private urlHelper: UrlHelperService,
        @Inject(LOCALE_ID) public locale: string

    ) {
        this.lang = this.curentLang.getCurrentLang();
    }

    canDeactivate(): Promise<boolean> | boolean {
        if (!this.isDirty)
            return true;
        return MessageBoxDialogComponent.dirtyConfirmation(this.injector, () => {
            return MessageBoxDialogComponent.confirmYesNo(this.injector, "Simulace ulozeni, povedlo se?");
        });
    }
    ngOnInit() {
    }
    onSubmit() {
    }
    async onTest() {
        //this.httpClient.post(this.appConfig.apiEndPoint + "/test/testpost", { Text: "testing ng" })
        //  .subscribe(x => this.result = x);
		/*
		 * this.progress.start();
		this.httpClient.post(this.appConfig.apiEndPoint + "/party/search", { PersonType: 1 })
		  .subscribe(x => this.result = x, null, ()=>this.progress.stop());
		  */
        /*Surname:"H"*/
        //this.router.navigateByUrl("/party/new");
        var data: ITestData = {
            Text: 'test text',
            Date1: this.testDate
        };
        this.testDateText = 'loading';
        var result = await this.testApi.postTestPost(data, toDateOnlyString(new Date())).toPromise();
        //var dlg = await MessageBoxDialogComponent.confirmYesNo(this.injector, 'result:' + result.Text + '/' + result.Date1+'/'+new Date(result.Date1));
        //pozor, json-interceptor pouzitim patter-matchingu preklada yyyy-mm-dd na Date!
        var s = result.Text + '\n';
        s += 'Date1=' + result.Date1 + '\n';
        s += 'Date2=' + result.Date2 + '\n';
        s += 'Date3=' + result.Date3 + '\n';
        s += '\n';
        s += `${result.Date1} => ${fromDateOnlyString(result.Date1)}`;
        this.testDateText = s;
    }
    onTest2() {
        //this.userNotificationService.warning("starting to communicate");
        //this.httpClient.get(this.appConfig.apiEndPoint + "/party/detail/1")
        //  .subscribe(x => {
        //    this.result = x;
        //    this.userNotificationService.error("communication done");
        //  },
        //  null);
    }
    onStreetValidate(v: EditorValidation) {
        if (v.value == "42") {
            v.errors.push("[label] error 42");
        }
    }
    onPartySelected(x: number) {
        alert('onPartySelected' + x + '/' + this);
    }
    onGetTranslation() {
		/*
		this.userApiService.getTranslations()
		  .subscribe(x => {
			console.log("translations", x);
			for (var i = 0; i < x.length; i++) {
			  var m = x[i];
			  this.translationCache.locales[m.Module] = m.Texts;
			}

			this.router.navigate(['..','test2'], { queryParams: { ts: new Date().getTime() }, relativeTo: this.route });
		  });
		  */
    }
    private type = ENotificationType.Information
    onNotify() {
        var delay = 0; //undefined will hide it after while
        this.userNotificationService.show({ message: "Test " + ENotificationType[this.type], type: this.type, delay: 0 });
        this.type = this.type + 1;
        if (this.type > ENotificationType.Error) {
            this.type = ENotificationType.Information;
        }
    }

    async onTestDialog() {
        //this.kendoDialogs.open({
        //	title: "This is testing title", content: "some <b>content</b> of dialog",
        //	actions: [
        //		{ text: "Button 1" },
        //		{ text: "Button 2 primary", primary: true },
        //		{ text: "Button 3" }
        //	]

        //});
        //dlg.show();

        //
        //var c = this.appDialogContainer.createDialog<ConfirmationDialogComponent>(ConfirmationDialogComponent);
        //c.title = "Yes or no?";
        //c.show();

        //minWidth = "950"
        //title=resx
        //var dlg = this.appDialogContainer.createDialog(this.injector, PartySearchDialogComponent, { /*minWidth: 950, xxheight: 300, */ title:'Select party'});
        var r = await MessageBoxDialogComponent.confirmYesNo(this.injector, 'Yes or no').toPromise();
        alert('Result=' + r);
    }
    onTest3() {
        this.urlHelper.saveToUrl({ test: new Date().toISOString() }, this.location);
    }

    async sendClientChangeNotificationIvent() {
        var data: ITestData = {
            Text: this.model.Xml,
            Date1: toDateOnlyString(new Date('2012-04-05'))
        };
        var result = await this.testApi.postTestEvent(data).toPromise();

        this.userNotificationService.show({ message: "Test " + ENotificationType[this.type], type: this.type, delay: 0 });
    }
}
