import { ComponentFactoryResolver, ComponentRef, EventEmitter, Injectable, Injector, Type, ViewContainerRef } from '@angular/core';
import { DialogComponent, WindowComponent } from '@progress/kendo-angular-dialog';
import { Observable, Subject } from 'rxjs';

/***
 * dialogs must implement AppDialog interface and be explicitelly loaded in their module using
 * entryComponents:[]
 ***/

/***
 * implement this interface in same way, AppDialogContainerService will inject your class with implementation of methods
 * */
export interface AppDialog {
	/***
	 * call this function to close dialog
	 * */
    close: Function;
	/***
	 * if defined, this event is automatically called when dialog is closed with params passed to close fn
	 * */
    closed?: EventEmitter<any>;
	/***
	 * set this from component or outer call to your title of dialog
	 * */
    title?: string;
	/***
	 * or implement this function to provide title via method
	 * */
    getTitle?(): string;
	/***
	 * this field is filled by reference to Kendo dialog - you can call
	 * this.dlgRef.instance.title = 'dynamic title' from your code
	 * */
    dlgRef?: ComponentRef<DialogComponent | WindowComponent>;
}

interface DialogParameters {
    width?: number;
    title?: string;
    actions?: string;
    minWidth?: number;
    height?: number;
    css?: string,
    top?: number,
    left?: number,
    resizable?: boolean,
}
/*
 * inspired by https://blog.strongbrew.io/Modals-in-angular2/
*/
@Injectable({
    providedIn: 'root'
})
export class AppDialogContainerService {
    public container: ViewContainerRef;
    public containerInjector: Injector;
    activeInstances = 0;
    constructor(
    ) {
        //private compResolver: ComponentFactoryResolver,
        //private compiler: Compiler,
        //console.log('AppDialogContainerService params:', [this.compiler, this.compResolver]);
        //in prod/aot compiler is empty object {}
    }

    public createDialog<T extends AppDialog>(injector: Injector, dialog: Type<T>, dialogParams: DialogParameters = {}, parameters: any = {}): T {
        const result = this.createComponentData<T, DialogComponent>(injector, dialog, DialogComponent);
        return this.getComponentInstance<T, DialogComponent>(result, dialogParams, parameters);
    }

    public createWindow<T extends AppDialog>(injector: Injector, dialog: Type<T>, dialogParams: DialogParameters = {}, parameters: any = {}): T {
        const result = this.createComponentData<T, WindowComponent>(injector, dialog, WindowComponent);
        return this.getComponentInstance<T, WindowComponent>(result, dialogParams, parameters);
    }

    public wait<T>(closedEvent: Observable<T>): Promise<T> {
        const result = new Subject<T>();
        closedEvent.subscribe(r => {
            result.next(r);
            result.complete();
        });
        return result.toPromise();
    }

    private createComponentData<T, D extends DialogComponent | WindowComponent>(injector: Injector, dialog: Type<T>, component: Type<D>): {
        componentRef: ComponentRef<T>,
        dlgRef: ComponentRef<D>
    } {
      const factoryRes = injector.get(ComponentFactoryResolver) as ComponentFactoryResolver;
      const factory = factoryRes.resolveComponentFactory(dialog);
      const componentRef = this.container.createComponent(factory, null, injector);
      const factoryDlg = factoryRes.resolveComponentFactory(component);
      const dlgRef = this.container.createComponent(factoryDlg, null, injector,
            [
                [], // title template
                [componentRef.location.nativeElement] // content template
            ]);
        return { dlgRef, componentRef };
    }

    private getComponentInstance<T extends AppDialog, D extends DialogComponent | WindowComponent>(result: {
        componentRef: ComponentRef<T>,
        dlgRef: ComponentRef<D>
    }, dialogParams: DialogParameters, parameters: any) {
        Object.assign(result.dlgRef.instance, dialogParams);
        if (dialogParams.css) {
            (result.dlgRef.location.nativeElement as HTMLDivElement).classList.add(dialogParams.css);
        }
        Object.assign(result.componentRef.instance, parameters);
        if (typeof result.componentRef.instance.getTitle === 'function') {
            result.dlgRef.instance.title = result.componentRef.instance.getTitle();
        }
        if (result.componentRef.instance.title) {
            result.dlgRef.instance.title = result.componentRef.instance.title;
        }
        this.activeInstances++;
        result.componentRef.instance['__destroy'] = () => {
            this.activeInstances--;
            result.componentRef.destroy();
            result.dlgRef.destroy();
        };
        result.componentRef.instance.dlgRef = result.dlgRef;
        result.componentRef.instance.close = (x: boolean) => {
            result.componentRef.instance['__destroy']();
            if (result.componentRef.instance.closed) {
                result.componentRef.instance.closed.emit(x);
            }
        };
        result.dlgRef.instance.close.subscribe(r => {
            result.componentRef.instance.close(r);
        });
        return result.componentRef.instance;
    }
}
