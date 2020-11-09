import { NgModule } from '@angular/core';
import * as WebApiModels from './webapi-models';
export class CodebookItem {
    Value: number = null;
    Order?: number = null;
    Text: string = null;
}
export class HierarchyCodeBookItem extends CodebookItem {
    Children: HierarchyCodeBookItem[] = [];
}
export class ExternalCodebookItem extends CodebookItem {
    RatingId: number = null;
    PercentageRating: number = null;
}
export class RatingCodebookItem extends CodebookItem {
    FailureRate: number = null;
}
export class CalculatePDRatingModelDto {
    CanCalculate: boolean = null;
    CanAdd: boolean = null;
}
export class LGDModelCodebookItem extends CodebookItem {
    PDRatingModelId: number = null;
    SPVType: boolean = null;
    ProjectType: boolean = null;
}
export class EnumerationDto {
    Id: number = null;
    DataId: number = null;
    ValidFrom: Date = null;
    ValidTo?: Date = null;
    Code: string = null;
    Description: string = null;
    DescriptionL: string = null;
    Order?: number = null;
}
export class PDRatingModelDto extends EnumerationDto {
    ExternalRating: boolean = null;
    InternalRating: boolean = null;
    CalculateRating: boolean = null;
    CalculateRaroc: boolean = null;
    RequiredNACE: boolean = null;
    FinancialData: boolean = null;
    UseAssets: boolean = null;
    UseRecoveryRateLGD: boolean = null;
    CanExportPDRating: boolean = null;
    ShowPDRatingTab: boolean = null;
    ShowInCafe: boolean = null;
}
export class ProductTypeCUDto extends EnumerationDto {
    ParentTypeId?: number = null;
    HasAnyChildType: boolean = null;
    HasAnySubtype: boolean = null;
}
export class ProductSubTypeCUDto extends EnumerationDto {
    Payment?: number = null;
    ProductTypeCUId: number = null;
    ProductTypeCU: ProductTypeCUDto = null;
    IsDefault: boolean = null;
    LGDProdCommited: WebApiModels.ELGDProdCommited = null;
}
export class CollateralTypeCUDto extends EnumerationDto {
    Order?: number = null;
}
export class CollateralSubTypeCUDto extends EnumerationDto {
    RarocCode: string = null;
    MaxSecuredAmount?: number = null;
    RecoveryRateTTCstandard?: number = null;
    RecoveryRateStandard?: number = null;
    RecoveryRateTTClgd?: number = null;
    RecoveryRateLGD?: number = null;
    CollateralTypeCUId: number = null;
}
export class DashboardTypeDto extends EnumerationDto {
    Color: string = null;
    CountFulfilmentDay: number = null;
    CountStornoDay: number = null;
    IsForUser: boolean = null;
}
export class ProductInfoDto {
    Id: number = null;
    ShortDescription: string = null;
    Description: string = null;
    LongDescription: string = null;
    Name: string = null;
    Active: boolean = null;
}
export class ContractConditionFilterDto {
    CreditFileId: number = null;
    NonFinancial: boolean = null;
    Active: boolean = null;
    ProductIds: number[] = [];
    Products: ProductInfoDto[] = [];
}
export class GridResult<T> {
    data: T[] = [];
    total: number = null;
}
export class DomainDto {
    Id: number = null;
    CreatedOn: Date = null;
    CreatedBy: string = null;
    ModifiedOn: Date = null;
    ModifiedBy: string = null;
    Version: string = null;
}
export class ContractConditionViewDto extends DomainDto {
    CreditFileId: number = null;
    FinancialCovenantId?: number = null;
    NonFinancialCovenantId?: number = null;
    Active: boolean = null;
    ValidFrom: Date = null;
    ValidTo?: Date = null;
    IsCustom: boolean = null;
    CustomCode: string = null;
    Description: string = null;
    NextEvaluationDate?: Date = null;
    IsReccurrent: boolean = null;
    FrequencyUnit?: WebApiModels.EFrequencyUnit = null;
    Order: number = null;
    VersionNumber: number = null;
    NextEvaluation: string = null;
    NextEvaluationRule: ContractConditionRuleEditDto = null;
    IrregularValues: boolean = null;
    Changed: boolean = null;
    Readonly: boolean = null;
    Operator: string = null;
    RequiredFinancialValue?: number = null;
    RequiredNonFinancialValue?: boolean = null;
    FinancialCovenant: FinancialCovenantDto = null;
    NonFinancialCovenant: NonFinancialCovenantDto = null;
    Products: string = null;
    ProductIds: number[] = [];
    MigratedOn?: Date = null;
    Consolidated: boolean = null;
}
export class ContractConditionRuleEditDto {
    Id: number = null;
    Month: number = null;
    Year: number = null;
    NextEvaluationDate?: Date = null;
    OperatorKey?: WebApiModels.EFinancialConditionOperator = null;
    RequiredFinancialValue?: number = null;
    RequiredNonFinancialValue?: boolean = null;
    ValidFrom?: Date = null;
    ValidTo?: Date = null;
    Active: boolean = null;
    Changed: boolean = null;
    Readonly: boolean = null;
    UseFroSchedule?: boolean = null;
}
export class FinancialCovenantDto extends EnumerationDto {
    IsCustom: boolean = null;
    DefaultOperatorKey?: WebApiModels.EFinancialConditionOperator = null;
}
export class NonFinancialCovenantDto extends EnumerationDto {
    Order: number = null;
    IsCustom: boolean = null;
    DefaultValue?: boolean = null;
}
export class ContractConditionEditDto {
    Version: string = null;
    CreditFileId: number = null;
    Delta: number = null;
    ContractConditionId?: number = null;
    FinancialCovenantId?: number = null;
    NonFinancialCovenantId?: number = null;
    ValidFrom: Date = null;
    ValidTo?: Date = null;
    CustomCode: string = null;
    Description: string = null;
    FrequencyUnit?: WebApiModels.EFrequencyUnit = null;
    IsRecurrent: boolean = null;
    Recurrence: WebApiModels.ERecurrenceType = null;
    OperatorKey?: WebApiModels.EFinancialConditionOperator = null;
    RequiredFinancialValue?: number = null;
    RequiredNonFinancialValue?: boolean = null;
    MigratedOn?: Date = null;
    EvaluationRules: ContractConditionRuleEditDto[] = [];
    EvaluationDateFrom?: Date = null;
    EvaluationDateFromMin: Date = null;
    ProductIds: number[] = [];
    ProductConditions: ContractConditionProductDto[] = [];
    Products: string = null;
    Active: boolean = null;
    Readonly: boolean = null;
    Changed: boolean = null;
    Consolidated: boolean = null;
    VersionNumber: number = null;
}
export class ContractConditionProductDto extends DomainDto {
    Active: boolean = null;
    ValidFrom: Date = null;
    ValidTo?: Date = null;
    ContractConditionId: number = null;
    Product: ProductInfoDto = null;
}
export class ContractConditionDto {
    Id: number = null;
    CreditFileId: number = null;
    Delta: number = null;
    Active: boolean = null;
}
export class GridBaseDto {
    SortColumnName: string = null;
    SortDirection?: WebApiModels.ListSortDirection = null;
    Page: number = null;
    PageSize: number = null;
}
export class DashboardSearchDto extends GridBaseDto {
    Date: Date = null;
    CalendarType: WebApiModels.ECalendarType = null;
    DashboardTypeId?: WebApiModels.EDashboardTypeId = null;
    CreditFileId?: number = null;
    UnitId: number = null;
    UserName: string = null;
    IsForUser: boolean = null;
    ClientName: string = null;
    IcoBirthNumber: string = null;
    Comment: string = null;
    FulfilledBy: string = null;
}
export class DashboardEventDto extends DomainDto {
    GeneratedOn: Date = null;
    FulfilmentRequiredOn: Date = null;
    FulfilmentOn?: Date = null;
    DashboardState: WebApiModels.EDashboardState = null;
    CreditFileId: number = null;
    DashboardTypeId: WebApiModels.EDashboardTypeId = null;
    PartyId: number = null;
    Comment: string = null;
    FulfilledBy: string = null;
    ClientName: string = null;
    IcoBirthNumber: string = null;
    DashboardType: string = null;
    MainManager: string = null;
    DashboardReason: string = null;
    Branch: string = null;
    CanShowDetail: boolean = null;
}
export class DashboardDetailDto {
    DashboardEventDto: DashboardEventDto = null;
    ExistEvents: boolean = null;
    ClientSemaphore: MonitoringClientSemaphoreDto = null;
    Incidents: DashMonIncidentDto[] = [];
}
export class MonitoringClientSemaphoreDto extends DomainDto {
    ValidFrom: Date = null;
    ValidTo?: Date = null;
    CreditFileId: number = null;
    SemaphoreId: number = null;
    Color: string = null;
    Comment: string = null;
    Author: string = null;
    DashboardId?: number = null;
}
export class DashMonIncidentDto {
    IncidentCode: string = null;
    IncidentValue: string = null;
    GeneratedOn: Date = null;
}
export class DashboardItemDto {
    Name: string = null;
    Count: number = null;
    DashboardTypeId?: number = null;
    Date?: Date = null;
}
export class DashboardItemResDto {
    Holidays: Date[] = [];
    DashboardItems: DashboardItemDto[] = [];
}
export class FinConversionOptions {
    CurrencyId: number = null;
    UnitKey: number = null;
    OwnCurrencyRate?: number = null;
}
export class FinStatDataContainerDto {
    FinStatDataDto: FinStatDataDto = null;
    FinStatRatiosDataDto: FinStatRatiosDataDto = null;
}
export class FinStatDataDto {
    ReadonlyHeaders: FinStatHeaderDto[] = [];
    EditableHeaders: FinStatHeaderDto[] = [];
    Tabs: FinStatTabDto[] = [];
    IsLocked: boolean = null;
}
export class FinStatHeaderDto {
    Id: number = null;
    TemplateId: number = null;
    Title: string = null;
    OriginalStatementTitle: string = null;
    OriginalCurrencyId: number = null;
    CurrencyId: number = null;
    UnitKey: number = null;
    Unit?: WebApiModels.EUnit = null;
    NumberOfMonths: number = null;
    ValidFrom: Date = null;
    ValidTo: Date = null;
    ReportTypeKey: number = null;
    StateEnum: WebApiModels.EStateFinData = null;
    FormatEnum: WebApiModels.EFormat = null;
    Consolidated: boolean = null;
    AuditorOpinion: boolean = null;
    Version: string = null;
    HeaderVersion: number = null;
    Exported: boolean = null;
    Editable: boolean = null;
    PartyId: number = null;
    Expanded?: boolean = null;
    ImportFiles: ImportFileDto[] = [];
}
export class ImportFileDto extends DomainDto {
    DateImport?: Date = null;
    FileName: string = null;
    FinStatementHeaderId?: number = null;
    PartyId: number = null;
    OcrStateId?: number = null;
    TemplateTabId?: number = null;
    JskDocumentId?: any = null;
    JskDocumentVersionId?: any = null;
    KofaxSequenceNumber?: number = null;
}
export class FinStatTabDto {
    TabOrder: number = null;
    GUIOrder: number = null;
    Label: string = null;
    DisplayPercent: boolean = null;
    DisplayChange: boolean = null;
    IsOutput: boolean = null;
    ShowCollapsed: boolean = null;
    Rows: FinStatRowDto[] = [];
    RowAmountsHashCode: number = null;
}
export class FinStatRowDto {
    TemplateRowId: number = null;
    ParentRowCountId?: number = null;
    RowNumber: number = null;
    ComparatorId?: number = null;
    RatiosCode: string = null;
    RowIdent: string = null;
    Label: string = null;
    Formula: string = null;
    AllowNegative: boolean = null;
    AllowNull: boolean = null;
    ColorKey: number = null;
    Indent: number = null;
    IsTitle: boolean = null;
    DefaultShow: boolean = null;
    Font?: WebApiModels.EFont = null;
    ReadonlyItems: FinStatItemDto[] = [];
    EditableItems: FinStatItemDto[] = [];
}
export class FinStatItemDto {
    Id: number = null;
    Value?: number = null;
    Ratio?: number = null;
    Difference?: number = null;
    DifferencePerc?: number = null;
    Editable: boolean = null;
    HeaderId: number = null;
    Comment: string = null;
    IsCalculationDisabled: boolean = null;
}
export class FinStatRatiosDataDto {
    HeaderIds: number[] = [];
    Tabs: FinStatTabDto[] = [];
}
export class FinStatOverviewReqDto extends GridBaseDto {
    PartyId: number = null;
    OnlyFinished: boolean = null;
    OnlyNonConsolidation: boolean = null;
    ShowFull: boolean = null;
    PDRatingModelId?: number = null;
    ExcludeIds: number[] = [];
    SelectedIds: number[] = [];
    AdditionalSearchParams: FinStatAdditionalSearchParams = null;
    From: Date = null;
    To: Date = null;
}
export class FinStatAdditionalSearchParams {
    Format: WebApiModels.EFormat = null;
    State: WebApiModels.EStateFinData = null;
    IsConsolidated: boolean = null;
    TemplateId: number = null;
}
export class FinStatOverviewResDto extends GridBaseDto {
    Id: number = null;
    Title: string = null;
    NumberOfMonths?: number = null;
    ValidFrom: Date = null;
    ValidTo: Date = null;
    StatementType: string = null;
    Format: string = null;
    FormatEnum: WebApiModels.EFormat = null;
    TemplateId: number = null;
    State: string = null;
    StateEnum: WebApiModels.EStateFinData = null;
    Consolidated: boolean = null;
    BulkUploaded: boolean = null;
    CurrencyId: number = null;
    LastModification: Date = null;
    UnitKey?: number = null;
    HighlightColor: string = null;
}
export class FVCopyDto {
    FinStatementHeaderIds: number[] = [];
    Consolidation: boolean = null;
    ValidFrom?: Date = null;
    ValidTo?: Date = null;
}
export class ExportOptions {
    Format: WebApiModels.EExportFormat = null;
    Culture: string = null;
    IsCollapsed: boolean = null;
    IsHeaderCollapsed: boolean = null;
}
export class ImportFinancialStatementResultDto {
    ImportResult: WebApiModels.EUpdateRowsResult = null;
    ResultMessage: string = null;
}
export class StressAnalysisDto {
    FinStatHeaderId: number = null;
    Title: string = null;
    Variant: WebApiModels.EStressAnalysisVariant = null;
    Indicator: WebApiModels.EStressAnalysisIndicator = null;
    Variable: WebApiModels.EStressAnalysisVariable = null;
    PeriodNumber: number = null;
    Values: number[] = [];
}
export class FinStatBusinessTurnoverDto {
    Name: string = null;
    BusinessTurnover: number = null;
}
export class ImportFileRowDto {
    Name: string = null;
    Comment: string = null;
    IdJskFile: number = null;
    FileItem: any = null;
    Tabs: WebApiModels.EFinDataTabOrder[] = [];
    SupportedFileExtensions: string[] = [];
}
export class CreditComponentManagerModel extends DomainDto {
    CreditEntityId?: number = null;
    BranchId?: number = null;
    CreditFileId?: number = null;
    BranchCode: string = null;
    Users: CreditComponentManagerUserModel[] = [];
    MainManager: string = null;
    BranchName: string = null;
    HasUniqueMainManager: boolean = null;
    IsMainManagerSet: boolean = null;
}
export class CreditComponentManagerUserModel extends DomainDto {
    UserName: string = null;
    IsManager: boolean = null;
    IsMainManager: boolean = null;
    FirstName: string = null;
    Surname: string = null;
}
export class CreditComponentManagerListModel {
    Managers: CreditComponentManagerModel[] = [];
    HasNonStandardAccess: boolean = null;
}
export class SearchPartyLinkReqDto extends GridBaseDto {
    PartyId: number = null;
}
export class PartyLinkDto extends DomainDto {
    ValidTo?: Date = null;
    ValidFrom: Date = null;
    PercentOwnership?: number = null;
    EssRelationTypeId: number = null;
    Comment: string = null;
    SourcePartyId: number = null;
    TargetPartyId: number = null;
    TargetPartyName: string = null;
    SourcePartyName: string = null;
}
export class SearchClientReqDto extends GridBaseDto {
    ClientName: string = null;
    IdentificationNumber: string = null;
    Zecho: string = null;
    Surname: string = null;
    FirstName: string = null;
    BirthNumber: string = null;
    BirthDate?: Date = null;
}
export class SearchClientResDto {
    Id: number = null;
    Cuid: number = null;
    PersonType: WebApiModels.EPartyType = null;
    ClientName: string = null;
    IcoZecho: string = null;
    BirthNumberDate: string = null;
    CreditComponentBranch: string = null;
    FullName: string = null;
    CreditComponent: string = null;
    Entity: string = null;
    PDModelId?: number = null;
    LastModification: Date = null;
}
export class SearchClientInCuReqDto extends GridBaseDto {
    StartsWith: string = null;
}
export class PartyDetailDto extends DomainDto {
    ClientName: string = null;
    IdentificationNumber: string = null;
    Zecho: string = null;
    FirstName: string = null;
    Surname: string = null;
    BirthNumber: string = null;
    BirthDate?: Date = null;
    CitizenshipId?: number = null;
    PartyIdentifiers: PartyIdentifierDto[] = [];
    IsManagerCreditFile: boolean = null;
    AddressFo: PartyAddressDto = null;
    AddressPo: PartyAddressDto = null;
    PersonType: WebApiModels.EPartyType = null;
    IdFop?: number = null;
    CreditFileId?: number = null;
    FullName: string = null;
    MainCreditComponent: string = null;
    Cuid: number = null;
    PDModelId: number = null;
}
export class PartyIdentifierDto extends DomainDto {
    Code: string = null;
    System: string = null;
    PartyId?: number = null;
}
export class PartyAddressDto {
    AddressDtoId: number = null;
    CountryId?: number = null;
    Village: string = null;
    Street: string = null;
    Zip: string = null;
    DescriptiveNumber: string = null;
    OrientationNumber: string = null;
}
export class CreditInfoOverviewDto {
    CreditInfoTypeEnum: WebApiModels.ECreditInfoType = null;
    Value: string = null;
    Reason: string = null;
    Comment: string = null;
    StateKey: number = null;
    LastChange?: Date = null;
    ModifiedOn: Date = null;
    SourceInformation: string = null;
    CreditInfoModeEnum: WebApiModels.ECreditInfoMode = null;
    RefId?: number = null;
}
export class CreditInfoEditDto {
    Id: number = null;
    Version: string = null;
    CreditInfoTypeEnum: WebApiModels.ECreditInfoType = null;
    Comment: string = null;
    StockExchange?: boolean = null;
    PDRatingModelId?: number = null;
    LGDModelId?: number = null;
    KBCId?: number = null;
    CreditFileId: number = null;
    FiscalYearBegin: number = null;
}
export class PartyHeaderDto {
    PartyName: string = null;
    IdentificationNumber: string = null;
    BirthNumber: string = null;
    MainCreditComponent: number = null;
    CreditFileId: number = null;
    Cuid?: number = null;
    Id: number = null;
    PDModelId?: number = null;
    EssGroupId?: number = null;
    CanCalculatePdRating: boolean = null;
    CanCalculateRaroc: boolean = null;
    Permissions: string[] = [];
    PartyPermissions: WebApiModels.EPermissionType[] = [];
    Areas: WebApiModels.EPermissionAreaType[] = [];
    FiscalYearStartingMonth?: number = null;
    IsPartyManaged: boolean = null;
}
export class CreditInfoContainerDto {
    CreditFileId: number = null;
    Version: string = null;
    CreditInfoData: CreditInfoDataDto = null;
    CreditInfoFinancial: CreditInfoFinancialDto = null;
}
export class CreditInfoDataDto {
    CreatedOn: Date = null;
    PDModelId?: number = null;
    PDModelDetailId?: number = null;
    LGDModelId?: number = null;
    LGDModelDetailId?: number = null;
    CREDACId?: number = null;
    CREDACDetailId?: number = null;
    StockExchange?: boolean = null;
    StockExchangeDetailId?: number = null;
    PdRatingApproved: string = null;
    NextReviewDate?: Date = null;
    NACEId?: number = null;
    NACEDetailId?: number = null;
    FiscalYearStartingMonth?: number = null;
}
export class CreditInfoFinancialDto {
    CurrencyId?: number = null;
    TotalTurnover?: number = null;
    TotalAssets?: number = null;
    ConsolidatedCurrencyId?: number = null;
    ConsolidatedTurnover?: number = null;
    ConsolidatedAssets?: number = null;
}
export class PartyDashboardDto {
    CreditFileId: number = null;
    ClientName: string = null;
}
export class PDRatingOverviewReqDto extends GridBaseDto {
    CreditFileId: number = null;
    OnlyCompleted: boolean = null;
    ForCafe: boolean = null;
    ForRaroc: boolean = null;
    PDRatingModelId?: number = null;
    PDRatingToHideId?: number = null;
    From?: Date = null;
    To?: Date = null;
}
export class PDRatingOverviewResDto {
    Id: number = null;
    PDDate: Date = null;
    CalculationDate: Date = null;
    ClientCuid: string = null;
    PDCategoryEnum: WebApiModels.EPDRatingCategory = null;
    PDModel: string = null;
    PDModelCode: string = null;
    State: string = null;
    LastChange: Date = null;
    Rating: string = null;
    RatingForRaroc: string = null;
    PdRatingDetail: PDRatingDetailDto = null;
    User: string = null;
    Order: number = null;
    FinValidTo?: Date = null;
    FinConsolidation?: boolean = null;
    PDRatingModelId: number = null;
}
export class PDRatingDetailDto extends DomainDto {
    DecidedOn: Date = null;
    ExternalRatingId?: number = null;
    RatingId: number = null;
    Comment: string = null;
    PDRatingId: number = null;
    PercentPDRating?: number = null;
    PDRatingTypeKey?: number = null;
    OverrulingReasonKey?: number = null;
    ApprovalLevelKey?: number = null;
    OverrulingFlag?: number = null;
    Rating: RatingDto = null;
    RatingCode: string = null;
    PdRating: PDRatingDto = null;
}
export class RatingDto extends EnumerationDto {
    FailureRate: number = null;
}
export class PDRatingDto extends DomainDto {
    PDRatingModelId: number = null;
    StatePDRatingKey: number = null;
    CalculationDate?: Date = null;
    CreditFileId: number = null;
    OnlyResult: boolean = null;
    PDRatingCategoryKey: number = null;
    PDDate?: Date = null;
    ReviewText: string = null;
    FinancialRatingResult?: number = null;
    NonFinancialRatingResult?: number = null;
    TotalRatingResult?: number = null;
    PDRatingModelDate?: Date = null;
    CompleteDate?: Date = null;
    NACEId?: number = null;
    UseAsMonitoring: boolean = null;
    Consolidation: boolean = null;
    Order: number = null;
    Description: string = null;
    DetailForRaroc: PDRatingDetailDto = null;
    PDModel: PDRatingModelDto = null;
    Rating: string = null;
}
export class PDRatingDataDto {
    CreatedUserId: number = null;
    CreditFileId: number = null;
    FinancialHeader: FinancialStatementHeaderDto = null;
    State: string = null;
    StateEnum: WebApiModels.EStatePDRating = null;
    LastChangeDate: Date = null;
    PdModel: PDRatingModelDto = null;
    FinDataNeeded: boolean = null;
    PDRatingModelId: number = null;
    PDRatingCategoryEnum: WebApiModels.EPDRatingCategory = null;
    UseAsMonitoring: boolean = null;
    SelectedFinancialStatementId?: number = null;
    PDRatingId: number = null;
    PDRatingVersion: string = null;
    PDRatingResultTab: PDRatingResultTabDto = null;
    Tabs: PDRatingTabDto[] = [];
    IsLocked: boolean = null;
}
export class FinancialStatementHeaderDto extends DomainDto {
    StockExchange: boolean = null;
    Exported: boolean = null;
    BulkUploaded: boolean = null;
    PersonID: string = null;
    Title: string = null;
    SendToCAFE: boolean = null;
    SendToCRIF: boolean = null;
    ValidTo?: Date = null;
    ValidFrom?: Date = null;
    NumberOfDays?: number = null;
    NumberOfMonths?: number = null;
    AuditorsOpinion: boolean = null;
    UnitKey: number = null;
    CurrencyID: number = null;
    Consolidation: boolean = null;
    TypeKey: number = null;
    PartyId?: number = null;
    CreditFileId?: number = null;
    ParentId?: number = null;
    StateFinStatementKey: number = null;
    TemplateFinDataId: number = null;
    Migrated: boolean = null;
    SendToPDRating: boolean = null;
    HeaderVersion: number = null;
    HasConvertedHeader: boolean = null;
    IsVisited: boolean = null;
    SortedHeaderVersion: number = null;
    FinancialStatementRowsDto: FinancialStatementRowDto[] = [];
    TemplateFinDataDto: TemplateFinDataDto = null;
    ImportFilesDto: ImportFileDto[] = [];
}
export class FinancialStatementRowDto extends DomainDto {
    Amount?: number = null;
    Comment: string = null;
    Share?: number = null;
    Predictions?: number = null;
    Ratio?: number = null;
    ChangeComparedPreviousPeriod?: number = null;
    ImportFileId?: number = null;
    HeaderId: number = null;
    TemplateRowFinDataId: number = null;
    ImportFileDto: ImportFileDto = null;
    TemplateRowFinDataDto: TemplateRowFinDataDto = null;
    RowConversionsOutDto: RowConversionDto[] = [];
    RowConversionsInDto: RowConversionDto[] = [];
}
export class TemplateRowFinDataDto extends DomainDto {
    RowNumber: number = null;
    RowNumberEPO?: number = null;
    StatementEPO?: number = null;
    NegativeAllowed: boolean = null;
    Name: string = null;
    RowNameEPO: string = null;
    ConversionFormula: string = null;
    TemplateFinDataId: number = null;
    TemplateGUIId: number = null;
    TemplateTabAssignId?: number = null;
    Consolidation: boolean = null;
    NameCs: string = null;
    NameEn: string = null;
    RowIdent: string = null;
    Note: string = null;
    IsTitle: boolean = null;
    DefaultShow: boolean = null;
    PredictionShow: boolean = null;
    PredictionEdit: boolean = null;
    ParentRowCountId?: number = null;
    DataId: number = null;
    AllowNull: boolean = null;
    TemplateFinDataDto: TemplateFinDataDto = null;
}
export class TemplateFinDataDto extends DomainDto {
    Title: string = null;
    ValidTo?: Date = null;
    ValidFrom?: Date = null;
    FormatKey?: number = null;
    StateTemplateKey?: number = null;
    NameCs: string = null;
    NameEn: string = null;
    TemplateVersion: number = null;
    HighlightColor: string = null;
}
export class RowConversionDto extends DomainDto {
    TemplateRowConversionId: number = null;
    FinStatementRowOutId: number = null;
    FinStatementRowInId: number = null;
    TemplateRowConversionDto: TemplateRowConversionDto = null;
}
export class TemplateRowConversionDto extends DomainDto {
    ItemOrder?: number = null;
    TemplateRowOutId: number = null;
    TemplateRowInId: number = null;
    TemplateRowFinDataOutDto: TemplateRowFinDataDto = null;
    TemplateRowFinDataInDto: TemplateRowFinDataDto = null;
}
export class PDRatingBaseDto {
    CalculationDate: Date = null;
    PDDate: Date = null;
    PDRatingModelId: number = null;
    CountedPdRatingId?: number = null;
    PercentageRating?: number = null;
    SuggestedPDRating: PDRatingItemValueDto = null;
    SuggestedAdvisorPDRating: PDRatingItemValueDto = null;
    ApprovedPDRatings: PDRatingItemValueDto[] = [];
    ValidationPDRating?: number = null;
    ExternalRatingId?: number = null;
    PDRatingCategoryEnum: WebApiModels.EPDRatingCategory = null;
    UseAsMonitoring: boolean = null;
    Consolidation: boolean = null;
}
export class PDRatingResultTabDto extends PDRatingBaseDto {
    Date?: Date = null;
    MandatoryRatingId?: number = null;
    OtherRatingId?: number = null;
    GroupRatingId?: number = null;
    SuggestedSystemRatingId?: number = null;
    SuggestedSystemPercent?: number = null;
    SuggestedSystemOverrFlg: number = null;
}
export class PDRatingItemValueDto {
    RatingId?: number = null;
    OverrulingReasonKey?: number = null;
    Comment: string = null;
    ApprovalDate?: Date = null;
    ApprovalLevel?: number = null;
}
export class PDRatingTabDto {
    CriterionType: WebApiModels.ECriterionType = null;
    Sections: PDRatingSectionDto[] = [];
    Editable: boolean = null;
}
export class PDRatingSectionDto {
    Id: number = null;
    SectionText: string = null;
    Criterions: PDRatingCritDto[] = [];
}
export class PDRatingCritDto {
    Question: string = null;
    Order: number = null;
    Code: string = null;
    CritTempId: number = null;
    AnswerType: WebApiModels.EAnswerType = null;
    SelectedAnswerDto: PDRSelectedAnswerDto = null;
    Answers: PDRatingAnswerDto[] = [];
}
export class PDRSelectedAnswerDto {
    CriterionId: number = null;
    BoolChoice?: boolean = null;
    NumberChoice?: number = null;
    AnswerChoice?: number = null;
    InfluenceEss: InfluenceEss = null;
    CountryChoice?: number = null;
}
export class InfluenceEss {
    PartyId: number = null;
    PartyName: string = null;
    PDRatingId: number = null;
    PDRatingModelName: string = null;
    CountedPdRating: string = null;
}
export class PDRatingAnswerDto {
    Id: number = null;
    AnswerText: string = null;
    Order: number = null;
    Default: boolean = null;
}
export class PDRatingEditDto extends PDRatingBaseDto {
    PDRatingId: number = null;
    PDRatingVersion: string = null;
    CreditFileId: number = null;
    SelectedAnswers: PDRSelectedAnswerSaveDto[] = [];
    SelectedFinancialStatementId?: number = null;
}
export class PDRSelectedAnswerSaveDto extends PDRSelectedAnswerDto {
    CritTempId: number = null;
    AnswerType: WebApiModels.EAnswerType = null;
    CriterionType: WebApiModels.ECriterionType = null;
    Section: number = null;
}
export class PDRatingNewDto extends PDRatingBaseDto {
    CreditFileId: number = null;
    StatePDRating: WebApiModels.EStatePDRating = null;
}
export class PDRatingApprovedDto {
    PDRatingId: number = null;
    PDRatinVersion: string = null;
    ApprovedDto: PDRatingItemValueDto = null;
}
export class CollateralGroupsDto {
    CreditFileId: number = null;
    CollateralTypes: CollateralTypeCUDto[] = [];
    CollateralSubtypes: CollateralSubTypeCUDto[] = [];
    Sections: CollateralSectionDto[] = [];
}
export class CollateralSectionDto extends EnumerationDto {
    Collaterals: CollateralDetailDto[] = [];
    Selection: number[] = [];
}
export class CollateralDetailDto {
    Source: CollateralDto = null;
    IdentText: string = null;
    RatingText: string = null;
    SectionDescription: string = null;
    TypeDescription: string = null;
    SubTypeDescription: string = null;
    IsCopy: boolean = null;
    Links: ProductLink[] = [];
}
export class CollateralDto extends DomainDto {
    LineNumber: string = null;
    CollateralValue?: number = null;
    CurrencyId?: number = null;
    Description: string = null;
    GuarantorId?: number = null;
    StateKet?: WebApiModels.EStateProductCollateral = null;
    TypeOfStatementKey?: number = null;
    PledgeValue?: number = null;
    CreditFileId: number = null;
    PDRatingId?: number = null;
    ValidFrom?: Date = null;
    ValidTo?: Date = null;
    LastValuation?: Date = null;
    NextMonitoring?: Date = null;
    NextValuation?: Date = null;
    RecoveryRatePercent?: number = null;
    VersionStatusID?: number = null;
    CreditProposalID?: number = null;
    CollateralObjectId?: number = null;
    ExpirationDateUnit?: number = null;
    ExpirationDateQuantity?: number = null;
    ExpirationDate?: Date = null;
    URR_TTC?: number = null;
    CutOff_Eur?: number = null;
    CollateralSourceId?: number = null;
    CollateralSubTypeCUId?: number = null;
    ExpirationByProduct: boolean = null;
    SourceEntity: number = null;
    PartyId?: number = null;
    CollateralTypeCU: CollateralTypeCUDto = null;
    CollateralSubTypeCU: CollateralSubTypeCUDto = null;
    VersionStatus: VersionStatusDto = null;
    Readonly: boolean = null;
    HasAnyProductAttachment: boolean = null;
    Changed: boolean = null;
    StateKey: WebApiModels.EStateProductCollateral = null;
    AttachedProducts: ProductDto[] = [];
}
export class VersionStatusDto extends DomainDto {
    State?: WebApiModels.EStateProductCollateral = null;
}
export class ProductDto extends DomainDto {
    LineNumber: number = null;
    CurrencyLimitId?: number = null;
    ExpectedDrawdown?: number = null;
    Description: string = null;
    StateKey?: WebApiModels.EStateProductCollateral = null;
    TypeOfStatement?: number = null;
    LimitValue?: number = null;
    CreditFileId: number = null;
    DrawdownPeriod?: number = null;
    DrawdownTo?: Date = null;
    DrawdownFrom?: Date = null;
    PaymentAccount?: number = null;
    CreditAccount: string = null;
    ValidTo?: Date = null;
    LastSettlement?: Date = null;
    DueDate?: Date = null;
    UFN: boolean = null;
    OverdueFrom?: Date = null;
    RestructuredFrom?: Date = null;
    ForbearancePhase: string = null;
    BreachFrom?: Date = null;
    ForbearancePhaseCode: string = null;
    OverdueDays?: number = null;
    BreachOfRestructFrom?: Date = null;
    Drawdown: boolean = null;
    Restructured: boolean = null;
    RestructuredTo?: Date = null;
    Committed: boolean = null;
    VersionStatusID?: number = null;
    CreditProposalID?: number = null;
    ProductObjectID?: number = null;
    CurrencyID?: number = null;
    SuperiorProductId?: number = null;
    SourceProductId?: number = null;
    CurrentDrawdownAmount?: number = null;
    DrawdownToUnit: WebApiModels.ETimeUnit = null;
    DrawdownToQuantity?: number = null;
    DueDateUnit: WebApiModels.ETimeUnit = null;
    DueDateQuantity?: number = null;
    PaymentFlag: boolean = null;
    FinancingFlag: boolean = null;
    CUID?: number = null;
    ActualBalanceValue?: number = null;
    ActualBalanceDate?: Date = null;
    AvailableBalance?: number = null;
    AccountName: string = null;
    BankBicCode: string = null;
    BankNationalCode: string = null;
    AccountOpeningDate?: Date = null;
    ExchangeRate?: number = null;
    InvertedRateIndicator?: boolean = null;
    LoanSetting?: number = null;
    NextInstalmentDate?: Date = null;
    UnpaidFund?: number = null;
    AmountAfterMaturity?: number = null;
    Pmtpi?: number = null;
    SourceBankSytem?: number = null;
    MinimalInstalment?: number = null;
    MaximalInstalment?: number = null;
    ProductGroup: string = null;
    LineNo: string = null;
    Level?: number = null;
    StatusCode?: number = null;
    CreditAccountDate?: Date = null;
    RevolvingFlag?: boolean = null;
    UnauthorisedFlag?: boolean = null;
    SourceEntity?: number = null;
    ReportingDate?: Date = null;
    ProdCDSId?: number = null;
    TurnoverCreditDate?: Date = null;
    ProductSubtypeCUId?: number = null;
    Currency: CurrencyDto = null;
    CurrencyLimit: CurrencyDto = null;
    VersionStatus: VersionStatusDto = null;
    ProductSubTypeCUDto: ProductSubTypeCUDto = null;
    ProductObject: ProductObjectDto = null;
    HasAnyCollateral?: boolean = null;
    HasChildProducts?: boolean = null;
    Readonly: boolean = null;
    Changed: boolean = null;
    TemporaryId: number = null;
}
export class CurrencyDto extends EnumerationDto {
    CodeA3: string = null;
    CountryId?: number = null;
    DisplayOrder: number = null;
}
export class ProductObjectDto extends DomainDto {
    SourceEntity: number = null;
    Revolving: boolean = null;
    CreditFileId?: number = null;
    ProdCDSId?: number = null;
    SnapshotType?: number = null;
    ReportingDate?: Date = null;
    ConsolidatedId?: number = null;
    SourceSystemCode?: number = null;
    ProductTypeCUId?: number = null;
    ProductTypeCU: ProductTypeCUDto = null;
}
export class ProductLink {
    Id: number = null;
    Name: string = null;
    HasChildProducts?: boolean = null;
}
export class CollateralViewDto {
    Id: number = null;
    CreditFileId: number = null;
    SectionId: number = null;
    SectionDescription: string = null;
    CollateralTypeCUId?: number = null;
    TypeDescription: string = null;
    CollateralSubTypeCUId?: number = null;
    SubTypeDescription: string = null;
    SubTypeDescriptionL: string = null;
    CurrencyId?: number = null;
    PledgeValueThousands: number = null;
    CollateralValueThousands: number = null;
    RecoveryRatePercent?: number = null;
    ValidFrom?: Date = null;
    ValidTo?: Date = null;
    ExpirationDateUnit?: number = null;
    ExpirationDateQuantity?: number = null;
    ExpirationDate?: Date = null;
    ExpirationByProduct: boolean = null;
    GuarantorId?: number = null;
    HasProductAttachment: boolean = null;
}
export class ProductViewDto {
    Id: number = null;
    CurrencyLimitId?: number = null;
    StateKey?: WebApiModels.EStateProductCollateral = null;
    TypeOfStatement?: number = null;
    LimitValueThousands: number = null;
    CreditFileId: number = null;
    CreditAccount: string = null;
    LineNo: string = null;
    Level?: number = null;
    StatusCode?: number = null;
    SourceEntity?: number = null;
    ProductTypeCUId?: number = null;
    TypeDescription: string = null;
    ProductSubtypeCUId?: number = null;
    SubtypeDescription: string = null;
    SubtypeDescriptionL: string = null;
    StatusDescription: string = null;
    CurrencyLimitDescription: string = null;
    SectionId: number = null;
    SectionDescription: string = null;
    HasAnyCollateral?: boolean = null;
    HasChildProducts?: boolean = null;
    C_U: string = null;
    CurrentDrawdownThousands: number = null;
    DueDate?: Date = null;
    DueDateUnit?: WebApiModels.ETimeUnit = null;
    DueDateQuantity?: number = null;
    DrawdownTo?: Date = null;
    Detailed: boolean = null;
    ProdCDSId?: number = null;
    Order: number = null;
    UFN: boolean = null;
    OrderDate: Date = null;
    Interests: InterestDto[] = [];
    LastInterest: InterestDto = null;
    InstalmentPlans: InstallmentPlanDto[] = [];
    Balances: BalanceDto[] = [];
    Fees: FeeDto[] = [];
}
export class InterestDto extends DomainDto {
    LastFixedRateDate?: Date = null;
    NextFixedRateDate?: Date = null;
    ExtIntType?: WebApiModels.EInterestTypeExt = null;
    RevaluationFrequency?: number = null;
    MarginPercent?: number = null;
    ReferenceRateValidTo?: Date = null;
    ReferenceRateValidFrom?: Date = null;
    InterestRateValidTo?: Date = null;
    InterestRateValidFrom?: Date = null;
    ReferenceRate: string = null;
    RateType?: WebApiModels.EInterestRateType = null;
    ProductId: number = null;
    CcInterestForRegularPeriod?: number = null;
    ClientRate?: number = null;
    CcInterestForPrevPeriod?: number = null;
    FixationDate?: Date = null;
    FTP?: number = null;
    MarginSD?: number = null;
    ExternalRate?: number = null;
    SnapshotType?: number = null;
    SourceEntity?: number = null;
    ReportingDate?: Date = null;
    LiquidityMargin?: number = null;
    MarginPercentRAROC?: number = null;
    Deleted: boolean = null;
    MC?: number = null;
    RevaluationFrequencyUnit?: WebApiModels.EFrequencyUnit = null;
    ReferenceRateKey?: WebApiModels.EInterestReferenceRate = null;
}
export class InstallmentPlanDto extends DomainDto {
    LastDate?: Date = null;
    FirstDate?: Date = null;
    InstallmentDay?: number = null;
    Frequency?: number = null;
    ValidFrom?: Date = null;
    NumberOf?: number = null;
    Regular: boolean = null;
    CreditDebet?: number = null;
    InstallmentSubtype?: number = null;
    InstallmentType?: number = null;
    Amount?: number = null;
    CurrencyID?: number = null;
    ProductId: number = null;
    SnapshotType?: number = null;
    SourceEntity?: number = null;
    ReportingDate?: Date = null;
    Currency: CurrencyDto = null;
    Deleted: boolean = null;
    Installments: InstallmentDto[] = [];
}
export class InstallmentDto extends DomainDto {
    InstallmentDay?: Date = null;
    OrderNumber?: number = null;
    CreditDebet?: number = null;
    Amount?: number = null;
    CurrencyID?: number = null;
    InstallmentPlanId: number = null;
    CcInstalmentDate?: Date = null;
    CcRecomendedInstalmentDate?: Date = null;
    CcCurrentFullInstalment?: number = null;
    CcCurrentMinInstalment?: number = null;
    CcCurrentOutstandingAmount?: number = null;
    CcLastInstalmentDate?: Date = null;
    CcFullInstalment?: number = null;
    CcMinimalInstalment?: number = null;
    CcFixedInstalment?: number = null;
    CcNextBillDate?: Date = null;
    CcLastBillDate?: Date = null;
    CcSumAmountBill?: number = null;
    CcHasFullInstalment: boolean = null;
    FinalMaturity?: Date = null;
    MaxWithdrawalDate?: Date = null;
    EmpErrorCode: string = null;
    DaysToNextEmp?: number = null;
    EmpAmountMin?: number = null;
    EmpAmountMax?: number = null;
    PaymentDate?: Date = null;
    Currency: CurrencyDto = null;
    Deleted: boolean = null;
}
export class BalanceDto extends DomainDto {
    IsCredit?: boolean = null;
    BalanceType?: number = null;
    Amount?: number = null;
    CurrencyID?: number = null;
    ProductId: number = null;
    SnapshotType?: number = null;
    SourceEntity?: number = null;
    ReportingDate?: Date = null;
    Currency: CurrencyDto = null;
    Deleted: boolean = null;
}
export class FeeDto extends DomainDto {
    FeeCategoryKey: WebApiModels.EFeeCategory = null;
    FeeClassKey: WebApiModels.EFeeClass = null;
    Percent?: number = null;
    FeeTypeKey: WebApiModels.EFeeType = null;
    Amount?: number = null;
    ProductId?: number = null;
    Frequency?: WebApiModels.ETimeUnit = null;
    CurrencyId?: number = null;
    FeeUnitKey?: WebApiModels.EFeeUnit = null;
    SnapshotType?: number = null;
    SourceEntity?: number = null;
    ReportingDate?: Date = null;
    FeeTypeName: string = null;
    FeeDay?: number = null;
    FeeEffectiveDay?: Date = null;
    FeeExpirationDate?: Date = null;
    SourceSystemCode?: number = null;
    AmountText: string = null;
    AmountThousands: number = null;
    Currency: CurrencyDto = null;
    Deleted: boolean = null;
    Selected: boolean = null;
}
export class CollateralProductMatrixDto {
    CollateralColumns: CollateralDto[] = [];
    CollateralProductRows: CollateralProductMatrixRowDto[] = [];
}
export class CollateralProductMatrixRowDto {
    CollateralProductColumns: CollateralProductMatrixCellDto[] = [];
    Level?: number = null;
    LineNo: string = null;
    RowNumber: number = null;
    ProductTypeCU: ProductTypeCUDto = null;
    ProductSubTypeCU: ProductSubTypeCUDto = null;
    ProductId?: number = null;
    SuperiorProductId?: number = null;
    LimitValueThousands?: number = null;
    CurrencyId?: number = null;
}
export class CollateralProductMatrixCellDto extends DomainDto {
    ColNumber: number = null;
    ProductId: number = null;
    SuperiorProductId?: number = null;
    CollateralId: number = null;
    Current: boolean = null;
    Proposal: boolean = null;
    Readonly: boolean = null;
    VersionStatus: VersionStatusDto = null;
    VersionStatusId?: number = null;
}
export class RarocOverviewReqDto extends GridBaseDto {
    CreditFileId: number = null;
}
export class RarocOverviewResDto {
    Id: number = null;
    CalculatedDate: Date = null;
    Title: string = null;
    LGDModel: string = null;
    PercentRaroc?: number = null;
    StateRaroc: string = null;
    StateRarocEnum: WebApiModels.EStateRaroc = null;
    Currency: string = null;
    CurrencyDataId: number = null;
    Amount?: number = null;
    User: string = null;
    RarocForCredit: boolean = null;
}
export class RarocValidationDto {
    ValidProducts: boolean = null;
    ValidCollaterals: boolean = null;
}
export class RarocContainerDto {
    RarocDto: RarocDto = null;
    IsLocked: boolean = null;
    HasProducts: boolean = null;
    HasCollaterals: boolean = null;
    HasResult: boolean = null;
}
export class RarocDto extends DomainDto {
    RarocForCredit: boolean = null;
    StateRarocKey?: number = null;
    CreditFileId: number = null;
    FXIncome: number = null;
    OtherIncome: number = null;
    CurrencyId?: number = null;
    TotalNCIncome: number = null;
    CompanyTurnover?: number = null;
    DepositIncome: number = null;
    PaymentIncome: number = null;
    Multiplicator: boolean = null;
    ProjType?: WebApiModels.EProjectType = null;
    IsEssGroup: boolean = null;
    Title: string = null;
    LGDModelId?: number = null;
    PDRatingModelId?: number = null;
    RatingId?: number = null;
    PDRatingId?: number = null;
    ExternalRatingId?: number = null;
    PDRatingPercent?: number = null;
    CurrencyNonFinancialId?: number = null;
    ConsolidatedTurnoverEss?: number = null;
    CurrencyFinancialId?: number = null;
    TotalAssets?: number = null;
    ConsolidatedAssetsEss?: number = null;
    CurrencyConsolidatedId?: number = null;
    RarocCopyId?: number = null;
    IsFromCafe: boolean = null;
    PDRatingValue: string = null;
    State: WebApiModels.EStateRaroc = null;
    StateDescription: string = null;
    Readonly: boolean = null;
    IsRequired: boolean = null;
    ActualRequired: boolean = null;
    PartyId: number = null;
    PartyName: string = null;
    Reason: string = null;
}
export class RarocBaseDto {
    RarocId: number = null;
    RarocVersion: string = null;
}
export class RarocProductsDto extends RarocBaseDto {
    IsLocked: boolean = null;
    ProductSet: RarocProductValueDto[] = [];
    HasAnyCollateral: boolean = null;
}
export class RarocProductValueDto extends DomainDto {
    Length?: number = null;
    LGD?: number = null;
    LGDirr?: number = null;
    ExpectedLoss?: number = null;
    ExpectedDrawdown?: number = null;
    Raroc?: number = null;
    FeeIncome?: number = null;
    InterestIncome?: number = null;
    ELAbs?: number = null;
    EL?: number = null;
    ELTTC?: number = null;
    LGDHVE?: number = null;
    LGDHVETTC?: number = null;
    LGDirrAbsTTC?: number = null;
    ELRating?: number = null;
    TranInc?: number = null;
    RAR?: number = null;
    AllIn0?: number = null;
    AllIn100?: number = null;
    RAGI?: number = null;
    Tax?: number = null;
    RANI?: number = null;
    ExitRate?: number = null;
    ExitRateTTC?: number = null;
    Ru?: number = null;
    RuTTC?: number = null;
    TranAlocated?: number = null;
    TranAlocatedTTC?: number = null;
    O_r?: number = null;
    O_rTTC?: number = null;
    O_a?: number = null;
    O_aTTC?: number = null;
    O_b?: number = null;
    O_bTTC?: number = null;
    O_ExitCost?: number = null;
    O_ExitCostTTC?: number = null;
    O_RWAbasel2?: number = null;
    O_CCF?: number = null;
    O_CCFTTC?: number = null;
    O_Ex?: number = null;
    O_ExTTC?: number = null;
    O_Icrel?: number = null;
    O_IcrelTTC?: number = null;
    O_EAD?: number = null;
    O_OperCostAdj?: number = null;
    LineNo: string = null;
    LimitValue?: number = null;
    MarginUsed?: number = null;
    MarginUnused?: number = null;
    ProdMaturityCount?: number = null;
    RarocId: number = null;
    ProductSubTypeCUId?: number = null;
    CurrencyId?: number = null;
    FeeFixed?: number = null;
    FeePeriodicalAmount?: number = null;
    FeeFrequencyKey?: number = null;
    UtilizationTo: boolean = null;
    Title: string = null;
    UFN: boolean = null;
    DueDate?: Date = null;
    DueDateUnit?: number = null;
    DueDateQuantity?: number = null;
    Commited: boolean = null;
    ExternalId?: number = null;
    RuProc?: number = null;
    RuProcTTC?: number = null;
    RuAbs?: number = null;
    RuAbsTTC?: number = null;
    LimitValueOut?: number = null;
    MarginUnusedOut?: number = null;
    CureRate?: number = null;
    CureRateTTC?: number = null;
    ValiditionType: WebApiModels.EValidationType = null;
    AloCapital?: number = null;
    ProductTypeCUId?: number = null;
    SubTypeDescription: string = null;
    SubTypeDescriptionL: string = null;
    TypeDescription: string = null;
    CreditYield?: number = null;
    Total?: number = null;
    IsDeleted: boolean = null;
    IsTotal: boolean = null;
}
export class RarocProductDto extends RarocBaseDto {
    RarocProduct: RarocProductValueDto = null;
}
export class RarocCollateralsDto extends RarocBaseDto {
    IsLocked: boolean = null;
    CollateralSet: RarocCollateralValueDto[] = [];
    HasAnyProduct: boolean = null;
}
export class RarocCollateralValueDto extends DomainDto {
    PledgeValue?: number = null;
    ColAllocated?: number = null;
    ColAlocatedTTC?: number = null;
    URRadj?: number = null;
    URRadjTTC?: number = null;
    CollatNomAdj?: number = null;
    CollatNomAdjTTC?: number = null;
    Description: string = null;
    LineNo: string = null;
    CollateralValue?: number = null;
    GuarantorName: string = null;
    GuarantorPDRating: string = null;
    RarocId: number = null;
    CollateralSubTypeCUId?: number = null;
    CurrencyId?: number = null;
    Title: string = null;
    ExpirationByProduct: boolean = null;
    DueDate?: Date = null;
    DueDateUnit?: number = null;
    DueDateQuantity?: number = null;
    ExternalId?: number = null;
    PledgeValueOut?: number = null;
    CollateralValueOut?: number = null;
    CollateralTypeCUId?: number = null;
    RecoveryRateStandard?: number = null;
    SubTypeDescription: string = null;
    SubTypeDescriptionL: string = null;
    TypeDescription: string = null;
    Total?: number = null;
    IsDeleted: boolean = null;
    ValiditionType: WebApiModels.EValidationType = null;
}
export class RarocCollateralDto extends RarocBaseDto {
    RarocCollateral: RarocCollateralValueDto = null;
}
export class PDRatingItem extends CodebookItem {
    ModelDescription: string = null;
    Code: string = null;
    Rating: string = null;
    RarocMode: WebApiModels.ERarocMode = null;
}
export class RarocExportOptions {
    Culture: string = null;
}
export class RarocOutputContainerDto {
    RarocId: number = null;
    RarocVersion: string = null;
    ResultSet: RarocOutputDto = null;
    SummaryProducts: RarocProductValueDto[] = [];
    SummaryCollaterals: RarocCollateralValueDto[] = [];
}
export class RarocOutputDto extends DomainDto {
    TotalCommitment?: number = null;
    TotalNetIncome?: number = null;
    TotalGrossIncome?: number = null;
    TotalFeeIncome?: number = null;
    CIRatioClient?: number = null;
    CIRatioTransaction?: number = null;
    CalculationDate?: Date = null;
    ClientGroup?: number = null;
    LGDPercent?: number = null;
    LGDModel: string = null;
    ClientName: string = null;
    TotalNCIncome?: number = null;
    ExpectedLoss?: number = null;
    PDRatingPercent?: number = null;
    OperationalCosts?: number = null;
    Raroc?: number = null;
    RarocModel: string = null;
    RegulatoryCapital?: number = null;
    TotalInterestIncome?: number = null;
    YORE?: number = null;
    RiskClass?: number = null;
    EAD?: number = null;
    LGD?: number = null;
    LGDirrAbs?: number = null;
    AvgLGDHVE?: number = null;
    TotalTranIncome?: number = null;
    ELProc?: number = null;
    ELRating?: number = null;
    RAR?: number = null;
    AncillaryCostAdj?: number = null;
    TotGrossIncMod?: number = null;
    TotalRAGI?: number = null;
    TotalTax?: number = null;
    TotalRANI?: number = null;
    ELAbs?: number = null;
    RWABasel2Proc?: number = null;
    RWABasel2Abs?: number = null;
    ELProcTTC?: number = null;
    RU?: number = null;
    RuProc?: number = null;
    RuABS?: number = null;
    PDRatingValue: string = null;
    DepositIncomeOut?: number = null;
    PaymentIncomeOut?: number = null;
    FxIncomeOut?: number = null;
    OtherIncomeOut?: number = null;
    TaxRate?: number = null;
    TotalCostAdj?: number = null;
    Branch: string = null;
}
export class MatrixDto {
    Cells: MatrixCellDto[] = [];
    Rows: MatrixRowDto[] = [];
    Items: MatrixItemDto[][] = [];
}
export class MatrixRowCellDto {
    Title: string = null;
    CurrencyId?: number = null;
    Value?: number = null;
}
export class MatrixCellDto extends MatrixRowCellDto {
    CollateralId: number = null;
    CollTypeDes: string = null;
}
export class MatrixRowDto extends MatrixRowCellDto {
    ProductId: number = null;
    ProdTypeDes: string = null;
}
export class MatrixItemDto {
    Id: number = null;
    CollateralId: number = null;
    ProductId: number = null;
    Proposal: boolean = null;
    ReadOnly: boolean = null;
}
export class MonitoringFilterDto {
    CreditFileId: number = null;
    PartyId?: number = null;
    ByToDate: number = null;
    Granularity: WebApiModels.EFrequencyUnit = null;
    Culture: string = null;
    Delta: number = null;
    EOP: Date = null;
    PeriodeShift: number = null;
    ByEvaluationDate: boolean = null;
    ClientCreatedOn: Date = null;
}
export class MonitoringDetailsDto implements IMonitoringFilter {
    CreditFileId: number = null;
    ClientSemaphore: MonitoringClientSemaphoreDto = null;
    ByEvaluationDate: boolean = null;
    Columns: MonitoringDetailColumnDto[] = [];
    Rows: MonitoringDetailRowDto[] = [];
    Granularity: WebApiModels.EFrequencyUnit = null;
    SOP: Date = null;
    EOP: Date = null;
    Changed: boolean = null;
    CurrentFilter: MonitoringFilterDto = null;
    Culture: string = null;
}
export class IMonitoringFilter {
    CreditFileId: number = null;
    ByEvaluationDate: boolean = null;
    Granularity: WebApiModels.EFrequencyUnit = null;
    SOP: Date = null;
    EOP: Date = null;
    Culture: string = null;
}
export class MonitoringDetailColumnDto implements IMonitoringFilter {
    ColumnId: number = null;
    MonitoringClientInfoId?: number = null;
    Title: string = null;
    SOP: Date = null;
    EOP: Date = null;
    MigratedOn?: Date = null;
    LastModifiedOn?: Date = null;
    CreditFileId: number = null;
    ByEvaluationDate: boolean = null;
    Granularity: WebApiModels.EFrequencyUnit = null;
    Culture: string = null;
}
export class MonitoringDetailRowDto {
    RowId: number = null;
    CategoryId: number = null;
    CategoryTitle: string = null;
    RowDescription: string = null;
    IsSemaphore: boolean = null;
    IsLight: boolean = null;
    IsBoolean: boolean = null;
    Readonly: boolean = null;
    FinancialCovenantId?: number = null;
    NonFinancialCovenantId?: number = null;
    Value: number = null;
    CustomCode: string = null;
    SubcategoryId?: number = null;
    ColumnValues: MonitoringDetailCellDto[] = [];
    IsValid: boolean = null;
    IsMigrated: boolean = null;
    IsCustom: boolean = null;
    Consolidated: boolean = null;
    ContractConditionId?: number = null;
    Order: number = null;
}
export class MonitoringDetailCellDto {
    ColumnId: number = null;
    FinancialCovenantId?: number = null;
    NonFinancialCovenantId?: number = null;
    ContractConditionId?: number = null;
    ContractConditionEvaluationId?: number = null;
    Consolidated?: boolean = null;
    SemaphoreId?: number = null;
    MonitoringCreditInfoId?: number = null;
    PDRatingId?: number = null;
    EwsId?: number = null;
    PDRatingDetailId?: number = null;
    MonitorPDRatingDetailId?: number = null;
    MonitoringClientResultId?: number = null;
    Value: string = null;
    IsNumber: boolean = null;
    Fulfilled: boolean = null;
    Changed: boolean = null;
    IsEmpty: boolean = null;
    ClickEnabled: boolean = null;
    Color: string = null;
    MigratedOn?: Date = null;
}
export class MonitoringCellClickDto {
    CreditFileId: number = null;
    ByEvaluationDate: boolean = null;
    Granularity: WebApiModels.EFrequencyUnit = null;
    EOP: Date = null;
    CurrentClientSemaphoreId?: number = null;
    MonitoringClientInfoId: number = null;
    FinancialCovenantId?: number = null;
    NonFinancialCovenantId?: number = null;
    Consolidated?: boolean = null;
    CustomCode: string = null;
    MonitoringClientResultId?: number = null;
    ContractConditionId?: number = null;
    PDRatingId?: number = null;
    EwsId?: number = null;
    Subcategory?: WebApiModels.EMonitoringCategory = null;
    Category: WebApiModels.EMonitoringCategory = null;
    PartyId: number = null;
}
export class MonitoringCellEditDto extends MonitoringCellClickDto implements IMonitoringFilter {
    CategoryDescription: string = null;
    Description: string = null;
    Month: Date = null;
    IsLight: boolean = null;
    LightId?: number = null;
    IsBoolean: boolean = null;
    Comment: string = null;
    CommentEnabled: boolean = null;
    Readonly: boolean = null;
    BoolValue: boolean = null;
    Value: string = null;
    DecimalValue?: number = null;
    TotalVisible: boolean = null;
    Total: string = null;
    ValueFoundOn?: Date = null;
    LastModifiedVisible: boolean = null;
    LastModified: Date = null;
    Changed: boolean = null;
    Color: string = null;
    StateColor: WebApiModels.EColor = null;
    InputRows: MonitoringCellEditRowDto[] = [];
    Rows: MonitoringCellEditRowDto[] = [];
    NegativeRows: MonitoringRowDto[] = [];
    Filterable: boolean = null;
    IsCustom: boolean = null;
    Today: Date = null;
    SOP: Date = null;
    Periode: string = null;
    ShowRelevancy: boolean = null;
    CloseOnSubmit: boolean = null;
    Culture: string = null;
    User: string = null;
}
export class MonitoringCellEditRowDto {
    EOM: Date = null;
    Periode: string = null;
    IsSemaphore: boolean = null;
    IsBoolean: boolean = null;
    SemaphoreId?: number = null;
    MonitorClientResultId?: number = null;
    ConditionEvaluationId?: number = null;
    NegativeSpecificId?: number = null;
    Description: string = null;
    Operator: string = null;
    RequiredValue: string = null;
    RowValue: string = null;
    Diff: string = null;
    FinancialValue?: number = null;
    Difference?: number = null;
    NonFinancialValue?: boolean = null;
    Fullfillment: string = null;
    ValueFoundOn?: Date = null;
    Fulfilled: boolean = null;
    FulfillmentPercentage: string = null;
    PDRatingId?: number = null;
    MigratedOn?: Date = null;
    IsReadonly: boolean = null;
    Changed: boolean = null;
    RowsPD: MonitorPDRatingDto[] = [];
    User: string = null;
    Comment: string = null;
    FinStatementType: string = null;
    ConditionLink: string[] = [];
    FinancialLink: string[] = [];
    KeyId?: number = null;
    KeyString: string = null;
}
export class MonitorPDRatingDto {
    Id?: number = null;
    SubCategory: WebApiModels.EMonitoringCategory = null;
    PDRatingDetailId?: number = null;
    SavedRating: string = null;
    SavedRatingId?: number = null;
    CurrentRating: string = null;
    CurrentRatingId?: number = null;
    CurrentDetailId?: number = null;
    CurrentFinancialHeaderId?: number = null;
    ReasonKey?: number = null;
    PDValidTo?: Date = null;
    PDRatingReason: string = null;
}
export class MonitoringRowDto {
    DetailId?: number = null;
    KeyId?: number = null;
    KeyString: string = null;
    Validity: boolean = null;
    Active: boolean = null;
    Values: string[] = [];
    Links: string[][] = [];
    Details: MonitoringRowDetailDto[] = [];
    ModifiedOn: Date = null;
    ValidFrom: Date = null;
    ValidTo?: Date = null;
    ListOfEOM: Date[] = [];
    Color: string = null;
    StateColor: WebApiModels.EColor = null;
    OrderValue: number = null;
    User: string = null;
    IsTitle: boolean = null;
    Semaphore?: number = null;
    DashboardType?: WebApiModels.EDashboardTypeId = null;
    EDashboardState?: WebApiModels.EDashboardState = null;
    ChangedOn: Date = null;
}
export class MonitoringRowDetailDto {
    DetailId?: number = null;
    Values: string[] = [];
    ModifiedOn: Date = null;
    ValidFrom: Date = null;
    ValidTo?: Date = null;
    IsTitle: boolean = null;
    BatchId?: any = null;
    KeyString: string = null;
}
export class MonitoringContainerDto implements IMonitoringFilter {
    CreditFileId: number = null;
    SOP: Date = null;
    EOP: Date = null;
    Culture: string = null;
    Description: string = null;
    GroupContainers: MonitoringGroupContainerDto[] = [];
    ByEvaluationDate: boolean = null;
    Granularity: WebApiModels.EFrequencyUnit = null;
}
export class MonitoringGroupContainerDto {
    Category: WebApiModels.EMonitoringCategory = null;
    Description: string = null;
    Semaphore: WebApiModels.EColor = null;
    Color: string = null;
    Order: number = null;
    Groups: MonitoringGroupDto[] = [];
}
export class MonitoringGroupDto {
    Category: WebApiModels.EMonitoringCategory = null;
    FinancialCovenantId?: number = null;
    ContractConditionId?: number = null;
    Consolidated?: boolean = null;
    IsCustom?: boolean = null;
    Description: string = null;
    Validity: boolean = null;
    Value: string = null;
    StateColor: WebApiModels.EColor = null;
    Color: string = null;
    Rows: MonitoringRowDto[] = [];
    Order: number = null;
}
export class TestData {
    Text: string = null;
    Date1: string = null;
    Date2?: string = null;
    Date3?: string = null;
}
export class AppVersionInfo {
    Version: string = null;
    ApiVersion: string = null;
    Date: Date = null;
    ServerTimeZone: string = null;
    ServerTimeZoneOffset: number = null;
    Environment: WebApiModels.EnvironmentEnum = null;
}
export class WebUserDto {
    Login: string = null;
    FirstName: string = null;
    Surname: string = null;
    IsLeasing: boolean = null;
    Roles: any[] = [];
    RolesNames: string[] = [];
    Areas: WebApiModels.EPermissionAreaType[] = [];
    Permissions: WebApiModels.EPermissionType[] = [];
    OrganizationalUnit: OrganizationalUnitDto = null;
    HasRightToAddParty: boolean = null;
}
export class OrganizationalUnitDto extends EnumerationDto {
    GoverningUnitId?: number = null;
    BrandId?: number = null;
    IsLeasing: boolean = null;
}
export class OperationModelDto extends DomainDto {
    operationChildDto: OperationChildDto[] = [];
}
export class OperationChildDto {
    Text: string = null;
    Items: Item[] = [];
}
export class Item {
    Text: string = null;
}
export class TranslationModel {
    Module: string = null;
    Texts: {[ key: string]: string} = null;
}
export class TraceDto {
    TimeStamp: Date = null;
    Message: string = null;
    Counter: number = null;
    Data: string = null;
    Level: WebApiModels.ETraceLevel = null;
}
@NgModule({ imports: [], declarations: [
]})
export class WebApiClassesModule { }
