import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Optional, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ControlContainer, NgForm, NgModelGroup } from '@angular/forms';
import { ComboBoxComponent } from '@progress/kendo-angular-dropdowns';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { CodebookItem, CodebooksService, ICodebookItem, TranslationService } from 'projects/services/src/public-api';
import { Observable, of, Subject } from 'rxjs';
import { Arrays } from '../../arrays';
import { showTooltip } from '../../common-functions';
import { EditorValidate, EditorValidation } from '../../directives/editor-validator.directive';
import { uniqueId } from '../../uniqueId';

export interface ICodebookProvider {
  getItems(): Promise<ICodebookItem[]>;
  getItem(value: number): Promise<ICodebookItem>;
}

export interface ICodebookProvider2 extends ICodebookProvider {
    getFilteredItems(filter: string): Promise<ICodebookItem[]>
}

function isProvider2(x: ICodebookProvider): x is ICodebookProvider2 {
    return (x as ICodebookProvider2).getFilteredItems !== undefined;
}

export function GetEmptyCodebookProvider(): ICodebookProvider {
    return {
        getItems: () => Promise.resolve([]),
        getItem: id => Promise.resolve(undefined)
    };
}
export function GetStaticCodebookProvider(codebookItems: ICodebookItem[]): ICodebookProvider {
    return {
        getItems: () => Promise.resolve(codebookItems),
        getItem: id => Promise.resolve(codebookItems.find(s => s.Value == id))
    };
}
export function GetCodebookProvider(codebooksService: CodebooksService, name: string): ICodebookProvider {
    return {
        getItems: () => codebooksService.GetCodebook(name).toPromise(),
        getItem: (id) => codebooksService.LoadTableItemByIdAsync(name, id)
    };
}

type modeType = 'text' | 'number';

/*
 * Komponenta pro výběr z číselníku
 * - načte si všechny aktuálně platné hodnoty (kešuje codebookservice)
 *	  - (to by se asi dalo předělat, aby se u dlouhých číselníků nedělo)
 * - pokud jich je více než {take}, zobrazuje pouze prvních {take} a informaci, kolik jich je celkem
 * - tohle je kvůli rychlosti, jinak umí zamrznout browser
 * - pokud uživatel začne psát, filtruje záznamy na LIKE a zobrazuje {take} z {filtered}
 *    - (??? asi bych zobrazoval celkový počet, nebo něco jako zobrazeno 30 z 326 nalezených z 1023 celkem)
 * - pokud (minule) vybraná hodnota není v prvních {take} záznamech a nalezne, doplní se k nim na poslední místo
 *    - pokud se nenajde, tak je možné, že hodnota existuje v databázi jako neplatná, takže se jí pokusí dohledat
 *      - po dobu hledání se tam píše, že hledá
 *      - pak se tam dá výsledek, nebo "položka nenalezena"
 */

@Component({
    // tslint:disable-next-line: component-selector
    selector:  'editor-codebook',
    templateUrl: './editor-codebook.component.html',
    styleUrls: ['./editor-codebook.component.less'],
    viewProviders: [
        { provide: ControlContainer, deps: [NgForm, [new Optional(), NgModelGroup]], useFactory: (ngForm: NgForm, ngModelGroup: NgModelGroup): ControlContainer => ngModelGroup || ngForm }
    ],
})
export class EditorCodeBookComponent implements OnChanges, AfterViewInit {
    static BEMORESPECIFIC /*:ICodebookItem[]*/ = [{ Value: null, Text: null }];
    @ViewChild('comboBoxComponent') comboBoxComponent: ComboBoxComponent;
    private _value: number = null;
    private lazyId: number = null;
    private lazy = new Subject<string>();

    get value(): number {
        return this._value;
    }
    @Input() set value(x) {
        if (this._value != x) {
            this._value = x;
            this.valueChange.emit(this.value);
        }
        if (this.codebook)
            this.ensureValueDisplayed();
    }
    private _readonly: boolean = null;
    get readonly(): boolean {
        return this._readonly;
    }
    @Input() set readonly(x: boolean) {
        this._readonly = x;
        this.readonlyChange.emit(x);
    }
    @Input() codebook: string | ICodebookProvider;
    @Input() label: string;
    @Input() minlength = 0;
    @Input() name = uniqueId('edcb-');
    @Input() noLabel = ''
    @Input() placeholder = '';
    @Input() required = false;
    @Input() source: CodebookItem[] = [];
    @Input() take = 100;
    @Input() autoSelectSingleItem = true; // pokud je true a datovým zdrojem je číselník, který obsahuje právě jednu položku, pak je položka automaticky vybrána
    @Input() mode: modeType = 'text';
    @Input() allowZeros = false;
    @Input() autofocus = false;
    @Output() readonlyChange = new EventEmitter<boolean>();
    @Output() selectionChange = new EventEmitter<CodebookItem>(false);
    @Output() validate = new EventEmitter<EditorValidation>(false/*isasync*/);
    @Output() valueChange = new EventEmitter<any>();

    items: CodebookItem[] = [];
    footerTemplate: string;
    private _lastRequest = 1;

    onValidate = (c) => EditorValidate(c, this);

    constructor(
        private codebooksService: CodebooksService,
        private translation: TranslationService
    ) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['source'])
            this.updateCodebookItems();
        if (changes['codebook'])
            this.updateCodebook();
    }
    ngAfterViewInit(): void {
        if (this.autofocus && !!this.comboBoxComponent.searchbar.input.nativeElement) {
            setTimeout(() => {
                this.comboBoxComponent.focus();
            }, 100);
        }
    }
    filterChange(filter: string): void {
        this.comboBoxComponent.toggle(false);
        this.comboBoxComponent.loading = true;
        if (isProvider2(this.provider)) {
            this._lastRequest++;
            const last = this._lastRequest;
            this.provider.getFilteredItems(filter)
                .then(items => {
                    if (last != this._lastRequest)
                        return;
                    let toggle = true;
                    if (items === EditorCodeBookComponent.BEMORESPECIFIC) {
                        items = [];
                        toggle = false;
                    }
                    this.source = items;
                    this.setItems(items, this.take, items.length);
                    this.comboBoxComponent.loading = false;
                    this.comboBoxComponent.toggle(toggle);
                });
            return;
        }

        let filteredItems = this.source;
        if (filter && filter.length >= this.minlength) {
            filteredItems = this.source.filter(f => f.Text.toLowerCase().indexOf(filter.toLowerCase()) >= 0);
        }

        this.setItems(filteredItems, this.take, filteredItems.length);

        this.comboBoxComponent.loading = false;
        this.comboBoxComponent.toggle(true);
    }
    public itemDisabled(args: { dataItem: CodebookItem, index: number }) {
        return !args.dataItem || args.dataItem.Value == null;
    }

    comboSelectionChange(event: CodebookItem) {
        this.selectionChange.emit(event);
    }
    private get provider(): ICodebookProvider {
        if (this.codebook !== null && typeof this.codebook === 'object' && typeof this.codebook !== 'string') {
            return this.codebook as ICodebookProvider;
        }
        const name = this.codebook as string;
        if (name) {
            return GetCodebookProvider(this.codebooksService, name);
        }
        if (this.source != null && this.source.length > 0) {
            console.warn(`Source property of codebook (label=${this.label || this.noLabel}) is no more supported`);
        } else {
            console.warn(`Cannot create provider for codebook (label=${this.label || this.noLabel})`);
        }
        return {
            getItems: () => Promise.resolve([]),
            getItem: (id) => Promise.resolve(undefined)
        }
    }
    private updateCodebook() {
        this._lastRequest++;
        const last = this._lastRequest;
        this.provider.getItems()
            .then(items => {
                if (this._lastRequest != last)
                    return;
                if (items === EditorCodeBookComponent.BEMORESPECIFIC) {
                    items = [];
                }
                this.source = items;
                this.setItems(this.source, this.take, this.source.length);
            });
    }
    private updateCodebookItems(): void {
        if (this.source)
            this.setItems(this.source, this.take, this.source.length);
    }
    private setItems(filteredItems: CodebookItem[], take: number, actualCount: number) {
        this.items = actualCount > take ? filteredItems.slice(0, this.take) : filteredItems;
        this.footerTemplate = actualCount > take ? this.translation.$$get('editor_codebook.x_of_x_items_found', take, actualCount) : null;

        this.sort();
        this.ensureValueDisplayed();

        if (this.autoSelectSingleItem) {
            if (this.comboBoxComponent && !this.comboBoxComponent.loading) {
                // automatické nastavnení prvku, pokud je v datovém zdroji právě jeden
                if (this.items && this.items.length === 1) {
                    const singleItem = this.items[0];
                    this.value = singleItem.Value;
                    this.selectionChange.emit(singleItem);
                }
            }
        }
    }

    private sort() {
        this.items = Arrays.sortBy(this.items, x => x['Order'], x => x.Value, x => x.Text.toLocaleLowerCase());
    }

    private ensureValueDisplayed() {
        if (!this.value)
            return;
        // if the current value is not within the displayed items
        const predicate = (f: CodebookItem) => f.Value === this.value;
        if (this.items.find(predicate))
            return;
        let foundItem = this.source.find(predicate);
        if (foundItem) {
            // tady by se mohl odstranit posledni nebo predposledni radek, aby sedel pocet
            this.items.push(foundItem);
            this.sort();
            return;
        }
        foundItem = { Text: this.translation.$$get('editor_codebook.loading_item'), Value: this.value };

        this.items.push(foundItem);
        this.provider.getItem(this.value)
            .then(x => {
                foundItem.Text = x.Text;
                this.sort();
            })
            .catch(x => {
                foundItem.Text = this.translation.$$get('editor_codebook.item_not_found');
                this.items = this.items.concat(); // mutate array to rebind
            });
    }

    codebookLookup(value: number): Observable<string> {
        if (value == null || typeof value == 'undefined')
            return of('');

        if (!!this.source && this.source.length > 0) {
            const item = this.source.find(s => s.Value == value);
            if (item)
                return of(item.Text);
        }
        if (this.lazyId == value)
            return this.lazy;
        // console.log('loading text of ' + value);
        this.lazyId = value;
        this.provider.getItem(value)
            .then(x => {
                // console.log('text loaded ' + x.Text);
                this.lazy.next(x.Text);
            })
            .catch(x => {
                // console.log('text load error ' + x);
                this.lazy.next(value == 0 && this.allowZeros ? '' :  this.translation.$$get('editor_codebook.item_not_found'));
            });
        return this.lazy;
    }

    showTooltip = (e: MouseEvent, kendoTooltipInstance: TooltipDirective): void => showTooltip(e, kendoTooltipInstance, ['SPAN']);
}
