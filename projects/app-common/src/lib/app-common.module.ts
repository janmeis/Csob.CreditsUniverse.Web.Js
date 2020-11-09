import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FileUploadModule } from 'ng2-file-upload';

// kendo components
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { GridModule } from '@progress/kendo-angular-grid';
import { WindowModule, DialogModule } from '@progress/kendo-angular-dialog';
import { ButtonGroupModule, ButtonsModule } from '@progress/kendo-angular-buttons';
import { TreeViewModule } from '@progress/kendo-angular-treeview';
import { PDFExportModule } from '@progress/kendo-angular-pdf-export';
import { TooltipModule } from '@progress/kendo-angular-tooltip';

//own components
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { BooleanLookupPipe } from './pipes/boolean-lookup.pipe';
import { CodebookLookupPipe } from './pipes/codebook-lookup.pipe';
import { EditorBoolComponent } from './components/editor-bool/editor-bool.component';
import { EditorBoolSwitchComponent } from './components/editor-bool-switch/editor-bool-switch.component';
import { EditorCodeBookComponent } from 'projects/app-common/src/public-api';
import { EditorDateComponent } from './components/editor-date/editor-date.component';
import { EditorEnumComponent } from './components/editor-enum/editor-enum.component';
import { EditorSelectorComponent } from './components/editor-selector/editor-selector.component';
import { EditorTextComponent } from './components/editor-text/editor-text.component';
import { EditorValidationsComponent } from './components/editor-validations/editor-validations.component';
import { EditorValidatorDirective } from './directives/editor-validator.directive';
import { ExportLanguageComponent } from './components/export-language/export-language.component';
import { FormatDataPipe } from './pipes/format-data-pipe';
import { FormValidatorDirective } from './directives/form-validator.directive';
import { HasRightToDirective } from './directives/has-right-to.directive';
import { IfPermittedDirective } from './directives/if-permitted-directive';
import { KeysPipe } from './pipes/keys-pipe';
import { LocalDatePipe } from './pipes/local-date.pipe';
import { MessageBoxDialogComponent } from './components/message-box-dialog/message-box-dialog.component';
import { MultilineTextComponent } from './components/multiline-text/multiline-text.component';
import { NgbCollapseDirective } from './directives/ngb-collapse.directive';
import { NumberValidator } from './directives/number-validator.directive';
import { PositiveValueValidator } from './directives/positive-value-validator';
import { RomanNumberPipe } from './pipes/roman-number.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { ScrollToDirective } from './directives/scrollto-directive';
import { TranslatePipe } from './pipes/translate-pipe';
import { TruncatePipe } from './pipes/truncate.pipe';


@NgModule({
  declarations: [
    EditorTextComponent,
    EditorBoolComponent,
    EditorDateComponent,
    EditorBoolSwitchComponent,
    EditorEnumComponent,
    EditorCodeBookComponent,
    EditorValidationsComponent,
    EditorSelectorComponent,
    ExportLanguageComponent,

    KeysPipe,
    FormatDataPipe,
    CodebookLookupPipe,
    BooleanLookupPipe,
    TranslatePipe,
    SafeHtmlPipe,
    RomanNumberPipe,
    LocalDatePipe,
    TruncatePipe,

    EditorValidatorDirective,
    FormValidatorDirective,
    NumberValidator,
    PositiveValueValidator,
    ScrollToDirective,
    MessageBoxDialogComponent,
    MultilineTextComponent,
    HasRightToDirective,
    IfPermittedDirective,
    AutoFocusDirective,
    NgbCollapseDirective,
  ],
  imports: [
    CommonModule,
    InputsModule,
    DateInputsModule,
    DropDownsModule,
    FileUploadModule,
    FormsModule,
    GridModule,
    ButtonGroupModule,
    WindowModule,
    DialogModule,
    ButtonsModule,
    TreeViewModule,
    PDFExportModule,
    TooltipModule,
    RouterModule,
  ],
  exports: [
    KeysPipe,
    TranslatePipe,
    CodebookLookupPipe,
    BooleanLookupPipe,
    FormatDataPipe,
    LocalDatePipe,
    SafeHtmlPipe,
    RomanNumberPipe,
    TruncatePipe,

    EditorTextComponent,
    EditorDateComponent,
    EditorBoolComponent,
    EditorBoolSwitchComponent,
    EditorEnumComponent,
    EditorCodeBookComponent,
    EditorValidationsComponent,
    EditorSelectorComponent,
    MultilineTextComponent,
    MessageBoxDialogComponent,
    ExportLanguageComponent,

    FileUploadModule,
    GridModule,
    WindowModule,
    DialogModule,
    InputsModule,
    DropDownsModule,
    DateInputsModule,
    ButtonGroupModule,
    ButtonsModule,
    TreeViewModule,
    PDFExportModule,
    TooltipModule,

    FormValidatorDirective,
    NumberValidator,
    PositiveValueValidator,
    ScrollToDirective,
    EditorValidatorDirective,
    HasRightToDirective,
    IfPermittedDirective,
    AutoFocusDirective,
    NgbCollapseDirective,
  ],
})
export class AppCommonModule { }
