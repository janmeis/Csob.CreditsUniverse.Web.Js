import { Component, EventEmitter, Injector, OnInit } from '@angular/core';
import { AppDialog, AppDialogContainerService } from 'projects/app-common/src/public-api';
import { CodebookApiService, ICodebookItem, IHierarchyCodeBookItem, TranslationService, UserProgressService } from 'projects/services/src/public-api';
import { Observable, of } from 'rxjs';

interface Item {
    uid?: string
    text: string
    selectable?: boolean
    visible?: boolean
    id?: any
    items?: Item[]
}
function addUidRec(list: Item[], parentId: string = '') {
    for (var i = 0; i < list.length; i++) {
        list[i].uid = parentId + i.toString();
        if (list[i].items) {
            addUidRec(list[i].items, list[i].uid + '-');
        }
    }
}

@Component({
    selector: 'app-selector-kbc-dialog',
    templateUrl: './selector-kbc-dialog.component.html',
    styleUrls: ['./selector-kbc-dialog.component.less']
})
export class SelectorKbcDialogComponent implements OnInit, AppDialog {
    close: Function
    closed = new EventEmitter<{ text: string, id: number }>();
    title: string = this.translation.$$get('selector_kbc_dialog.title');
    private _search: string = null;
    get search() { return this._search }
    set search(value: string) {
        this._search = value;
        this.searchChanged();
    }
    selection: Item = null;
    expandedKeys: string[] = [];
    items: Item[] = []
    visibleItems: Item[] = []
    constructor(
        private translation: TranslationService,
        public progress: UserProgressService,
        private codebooks: CodebookApiService) { }

    ngOnInit() {
        this.update();
    }
    private update() {
        this.progress.runAsync(this.codebooks.getCredacHierarchy())
            .then(data => this.loadData(data));
    }
    private loadData(data: IHierarchyCodeBookItem[]) {
        function createItem(x: ICodebookItem): Item {
            return { text: x.Text, id: x.Value, selectable: false, visible: true };
        }
        function create(items: IHierarchyCodeBookItem[], level = 0): Item[] {
            return items.map(x => {
                var r = createItem(x);
                if (x.Children && x.Children.length > 0) {
                    r.items = create(x.Children, level + 1);
                }
                r.selectable = level == 2;
                return r;
            });
        }
        this.items = create(data, 0);
        addUidRec(this.items);
        this.visibleItems = this.getVisibleItems(this.items);
    }
    private getVisibleItems(items: Item[]): Item[] {
        var result: Item[] = [];
        for (var i = 0; i < items.length; i++) {
            var item = Object.assign({}, items[i]); //mutate
            if (item.items) {
                //just test, if there are any visible sub-items
                var r = this.getVisibleItems(item.items);
                if (r.length > 0) {
                    result.push(item);
                    continue;
                }
            }
            if (!this.search || item.text.indexOf(this.search) >= 0) {
                result.push(item);
            }
        }
        return result;
    }
    onHasChildren = (node: Item): boolean => {
        return node.items && this.getVisibleItems(node.items).length > 0;
    }
    onGetChildren = (node: Item): Observable<Item[]> => {
        return of(this.getVisibleItems(node.items));
    }
    searchChanged() {
        this.visibleItems = this.getVisibleItems(this.items);
    }
    onSelectionChange(item: Item) {
        if (!item.selectable) {
            var i = this.expandedKeys.indexOf(item.uid);
            if (i >= 0) {
                this.expandedKeys.splice(i, 1);
            } else {
                this.expandedKeys.push(item.uid);
            }
            this.selection = null;
        } else {
            this.selection = item;
        }
    }
    onSelect() {
        this.close({ id: this.selection.id, text: this.selection.text });
    }
    public static showModal(injector: Injector) {
        var dlgSvc = injector.get(AppDialogContainerService);
        var dlg = dlgSvc.createDialog(injector, SelectorKbcDialogComponent, {
            width: 600
        }, {});
        return dlgSvc.wait(dlg.closed);
    }
}
