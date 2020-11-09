import { NgModule } from '@angular/core';
// Enums not in EKeyEnum:
//    ECodetable
//    ELGDProdCommited
//    EFinancialConditionOperator
//    ERecurrenceType
//    ListSortDirection
//    ECalendarType
//    EDashboardTypeId
//    EFont
//    EExportFormat
//    EFinDataTabOrder
//    EUpdateRowsResult
//    ECreditInfoMode
//    EPermissionType
//    EPermissionAreaType
//    EStateProductCollateral
//    EInterestTypeExt
//    EFeeUnit
//    EProjectType
//    EValidationType
//    ERarocMode
//    EColor
//    EnvironmentEnum
//    ETraceLevel
export enum EKeyEnum {
    Action = 1,
    ActionArea = 2,
    ActionRegime = 3,
    AnswerMode = 4,
    AnswerType = 5,
    ClientGroup = 6,
    ClientRole = 7,
    CountryDataId = 8,
    CriterionType = 9,
    CurrencyDataId = 10,
    DateType = 11,
    Failure = 12,
    FeeCategory = 13,
    FeeType = 14,
    FieldError = 15,
    FileFormat = 16,
    Format = 17,
    LanguageVersion = 18,
    Operator = 19,
    OverrulingReason = 20,
    PartyType = 21,
    PDRatingType = 22,
    RecordType = 23,
    Role = 24,
    State = 25,
    StateFinData = 26,
    StatementEPO = 27,
    StateParty = 28,
    StatePDRating = 29,
    StateRaroc = 30,
    TimeUnit = 31,
    TypeOfStatement = 32,
    Unit = 33,
    StressAnalysisIndicator = 34,
    StressAnalysisVariable = 35,
    StressAnalysisVariant = 36,
    PDRatingCategory = 37,
    CreditInfoType = 38,
    DashboardCategory = 39,
    DashboardEventType = 40,
    DashboardState = 41,
    DashboardReason = 42,
    ApprovalLevel = 43,
    UnitAbbrevation = 44,
    FeeClass = 45,
    InterestReferenceRate = 46,
    FrequencyUnit = 47,
    InterestRateType = 48,
    FrequencyUnitForContractConditions = 49,
    MonitoringCategory = 50,
    MonEventSource = 51,
    PDRatingReason = 52
}
export interface ICodebookItem {
    Value: number;
    Order?: number;
    Text: string;
}
export enum ECodetable {
    Currency = 1,
    Country = 2,
    AddressType = 3,
    Gender = 4,
    LegalEntity = 5,
    RatingModel = 6,
    Rating = 7,
    KBC = 8,
    Company = 9,
    Employee = 10,
    ExternalRating = 12,
    ProductType = 13,
    ProductSubtype = 14,
    ProductSection = 15,
    CollateralType = 16,
    CollateralSubtype = 17,
    FinancialCovenant = 18,
    NonFinancialCovenant = 19,
    FeeUnit = 20,
    RatingCode = 23,
    EssRelationType = 24,
    MigratedContractTermType = 25,
    OrganizationalUnit = 26,
    OrganizationalUnitLevel7 = 28,
    LGDModel = 29,
    Subdivison = 30,
    NACE = 31,
    DashboardDefinition = 32,
    DashboardType = 33,
    Holiday = 34,
    OrganizationalUnitAllLevel = 35,
    CategoryCRU = 36,
    CdsProduct = 37,
    FinancialEwsRatio = 38,
    CurrencyCz = 100,
    CountriesCzSk = 200,
    CountryCz = 201,
    CurrencyCzEur = 202,
    CafeProductTypeMapping = 203,
    ProductSubTypeMappingRaroc = 204,
    FeeClass = 205,
    OverrulingReason = 206
}
export interface IHierarchyCodeBookItem extends ICodebookItem {
    Children: IHierarchyCodeBookItem[];
}
export interface IExternalCodebookItem extends ICodebookItem {
    RatingId: number;
    PercentageRating: number;
}
export interface IRatingCodebookItem extends ICodebookItem {
    FailureRate: number;
}
export interface ICalculatePDRatingModelDto {
    CanCalculate: boolean;
    CanAdd: boolean;
}
export interface ILGDModelCodebookItem extends ICodebookItem {
    PDRatingModelId: number;
    SPVType: boolean;
    ProjectType: boolean;
}
export interface IEnumerationDto {
    Id: number;
    DataId: number;
    ValidFrom: Date;
    ValidTo?: Date;
    Code: string;
    Description: string;
    DescriptionL: string;
    Order?: number;
}
export interface IPDRatingModelDto extends IEnumerationDto {
    ExternalRating: boolean;
    InternalRating: boolean;
    CalculateRating: boolean;
    CalculateRaroc: boolean;
    RequiredNACE: boolean;
    FinancialData: boolean;
    UseAssets: boolean;
    UseRecoveryRateLGD: boolean;
    CanExportPDRating: boolean;
    ShowPDRatingTab: boolean;
    ShowInCafe: boolean;
}
export interface IProductTypeCUDto extends IEnumerationDto {
    ParentTypeId?: number;
    HasAnyChildType: boolean;
    HasAnySubtype: boolean;
}
export interface IProductSubTypeCUDto extends IEnumerationDto {
    Payment?: number;
    ProductTypeCUId: number;
    ProductTypeCU: IProductTypeCUDto;
    IsDefault: boolean;
    LGDProdCommited: ELGDProdCommited;
}
export enum ELGDProdCommited {
    OnlyUncommited = 0,
    OnlyCommited = 1,
    UncommitedAndCommited = 2
}
export interface ICollateralTypeCUDto extends IEnumerationDto {
    Order?: number;
}
export interface ICollateralSubTypeCUDto extends IEnumerationDto {
    RarocCode: string;
    MaxSecuredAmount?: number;
    RecoveryRateTTCstandard?: number;
    RecoveryRateStandard?: number;
    RecoveryRateTTClgd?: number;
    RecoveryRateLGD?: number;
    CollateralTypeCUId: number;
}
export interface IDashboardTypeDto extends IEnumerationDto {
    Color: string;
    CountFulfilmentDay: number;
    CountStornoDay: number;
    IsForUser: boolean;
}
export interface IProductInfoDto {
    Id: number;
    ShortDescription: string;
    Description: string;
    LongDescription: string;
    Name: string;
    Active: boolean;
}
export interface IContractConditionFilterDto {
    CreditFileId: number;
    NonFinancial: boolean;
    Active: boolean;
    ProductIds: number[];
    Products: IProductInfoDto[];
}
export interface IGridResult<T> {
    data: T[];
    total: number;
}
export interface IDomainDto {
    Id: number;
    CreatedOn: Date;
    CreatedBy: string;
    ModifiedOn: Date;
    ModifiedBy: string;
    Version: string;
}
export interface IContractConditionViewDto extends IDomainDto {
    CreditFileId: number;
    FinancialCovenantId?: number;
    NonFinancialCovenantId?: number;
    Active: boolean;
    ValidFrom: Date;
    ValidTo?: Date;
    IsCustom: boolean;
    CustomCode: string;
    Description: string;
    NextEvaluationDate?: Date;
    IsReccurrent: boolean;
    FrequencyUnit?: EFrequencyUnit;
    Order: number;
    VersionNumber: number;
    NextEvaluation: string;
    NextEvaluationRule: IContractConditionRuleEditDto;
    IrregularValues: boolean;
    Changed: boolean;
    Readonly: boolean;
    Operator: string;
    RequiredFinancialValue?: number;
    RequiredNonFinancialValue?: boolean;
    FinancialCovenant: IFinancialCovenantDto;
    NonFinancialCovenant: INonFinancialCovenantDto;
    Products: string;
    ProductIds: number[];
    MigratedOn?: Date;
    Consolidated: boolean;
}
export enum EFrequencyUnit {
    Month = 3,
    Quarter = 4,
    HalfOfYear = 5,
    Year = 6
}
export interface IContractConditionRuleEditDto {
    Id: number;
    Month: number;
    Year: number;
    NextEvaluationDate?: Date;
    OperatorKey?: EFinancialConditionOperator;
    RequiredFinancialValue?: number;
    RequiredNonFinancialValue?: boolean;
    ValidFrom?: Date;
    ValidTo?: Date;
    Active: boolean;
    Changed: boolean;
    Readonly: boolean;
    UseFroSchedule?: boolean;
}
export enum EFinancialConditionOperator {
    Min = 1,
    Max = 2
}
export interface IFinancialCovenantDto extends IEnumerationDto {
    IsCustom: boolean;
    DefaultOperatorKey?: EFinancialConditionOperator;
}
export interface INonFinancialCovenantDto extends IEnumerationDto {
    Order: number;
    IsCustom: boolean;
    DefaultValue?: boolean;
}
export interface IContractConditionEditDto {
    Version: string;
    CreditFileId: number;
    Delta: number;
    ContractConditionId?: number;
    FinancialCovenantId?: number;
    NonFinancialCovenantId?: number;
    ValidFrom: Date;
    ValidTo?: Date;
    CustomCode: string;
    Description: string;
    FrequencyUnit?: EFrequencyUnit;
    IsRecurrent: boolean;
    Recurrence: ERecurrenceType;
    OperatorKey?: EFinancialConditionOperator;
    RequiredFinancialValue?: number;
    RequiredNonFinancialValue?: boolean;
    MigratedOn?: Date;
    EvaluationRules: IContractConditionRuleEditDto[];
    EvaluationDateFrom?: Date;
    EvaluationDateFromMin: Date;
    ProductIds: number[];
    ProductConditions: IContractConditionProductDto[];
    Products: string;
    Active: boolean;
    Readonly: boolean;
    Changed: boolean;
    Consolidated: boolean;
    VersionNumber: number;
}
export enum ERecurrenceType {
    OneOff = 1,
    Repeatedly = 2
}
export interface IContractConditionProductDto extends IDomainDto {
    Active: boolean;
    ValidFrom: Date;
    ValidTo?: Date;
    ContractConditionId: number;
    Product: IProductInfoDto;
}
export interface IContractConditionDto {
    Id: number;
    CreditFileId: number;
    Delta: number;
    Active: boolean;
}
export interface IGridBaseDto {
    SortColumnName: string;
    SortDirection?: ListSortDirection;
    Page: number;
    PageSize: number;
}
export interface IDashboardSearchDto extends IGridBaseDto {
    Date: Date;
    CalendarType: ECalendarType;
    DashboardTypeId?: EDashboardTypeId;
    CreditFileId?: number;
    UnitId: number;
    UserName: string;
    IsForUser: boolean;
    ClientName: string;
    IcoBirthNumber: string;
    Comment: string;
    FulfilledBy: string;
}
export enum ListSortDirection {
    Ascending = 0,
    Descending = 1
}
export enum ECalendarType {
    Week = 1,
    Month = 2,
    Agenda = 3,
    Day = 4,
    All = 5
}
export enum EDashboardTypeId {
    MediumWarning = 1,
    HighWarning = 2,
    Review = 3,
    User = 4
}
export interface IDashboardEventDto extends IDomainDto {
    GeneratedOn: Date;
    FulfilmentRequiredOn: Date;
    FulfilmentOn?: Date;
    DashboardState: EDashboardState;
    CreditFileId: number;
    DashboardTypeId: EDashboardTypeId;
    PartyId: number;
    Comment: string;
    FulfilledBy: string;
    ClientName: string;
    IcoBirthNumber: string;
    DashboardType: string;
    MainManager: string;
    DashboardReason: string;
    Branch: string;
    CanShowDetail: boolean;
}
export enum EDashboardState {
    Unfulfilled = 1,
    New = 2,
    Fulfilled = 3,
    Canceled = 4
}
export interface IDashboardDetailDto {
    DashboardEventDto: IDashboardEventDto;
    ExistEvents: boolean;
    ClientSemaphore: IMonitoringClientSemaphoreDto;
    Incidents: IDashMonIncidentDto[];
}
export interface IMonitoringClientSemaphoreDto extends IDomainDto {
    ValidFrom: Date;
    ValidTo?: Date;
    CreditFileId: number;
    SemaphoreId: number;
    Color: string;
    Comment: string;
    Author: string;
    DashboardId?: number;
}
export interface IDashMonIncidentDto {
    IncidentCode: string;
    IncidentValue: string;
    GeneratedOn: Date;
}
export interface IDashboardItemDto {
    Name: string;
    Count: number;
    DashboardTypeId?: number;
    Date?: Date;
}
export interface IDashboardItemResDto {
    Holidays: Date[];
    DashboardItems: IDashboardItemDto[];
}
export interface IFinConversionOptions {
    CurrencyId: number;
    UnitKey: number;
    OwnCurrencyRate?: number;
}
export interface IFinStatDataContainerDto {
    FinStatDataDto: IFinStatDataDto;
    FinStatRatiosDataDto: IFinStatRatiosDataDto;
}
export interface IFinStatDataDto {
    ReadonlyHeaders: IFinStatHeaderDto[];
    EditableHeaders: IFinStatHeaderDto[];
    Tabs: IFinStatTabDto[];
    IsLocked: boolean;
}
export interface IFinStatHeaderDto {
    Id: number;
    TemplateId: number;
    Title: string;
    OriginalStatementTitle: string;
    OriginalCurrencyId: number;
    CurrencyId: number;
    UnitKey: number;
    Unit?: EUnit;
    NumberOfMonths: number;
    ValidFrom: Date;
    ValidTo: Date;
    ReportTypeKey: number;
    StateEnum: EStateFinData;
    FormatEnum: EFormat;
    Consolidated: boolean;
    AuditorOpinion: boolean;
    Version: string;
    HeaderVersion: number;
    Exported: boolean;
    Editable: boolean;
    PartyId: number;
    Expanded?: boolean;
    ImportFiles: IImportFileDto[];
}
export enum EUnit {
    Billions = 1,
    Millions = 2,
    Thousands = 3,
    Units = 4
}
export enum EStateFinData {
    OriginalNew = 1,
    ConvertedNew = 2,
    OriginalCompleted = 3,
    ConvertedCompleted = 4
}
export enum EFormat {
    TaxEvidence = 1,
    PoShort = 2,
    PoFull = 3,
    InternalCSOB = 4,
    Municipality = 5,
    PDRatingMigration = 100,
    T = 777777
}
export interface IImportFileDto extends IDomainDto {
    DateImport?: Date;
    FileName: string;
    FinStatementHeaderId?: number;
    PartyId: number;
    OcrStateId?: number;
    TemplateTabId?: number;
    JskDocumentId?: any;
    JskDocumentVersionId?: any;
    KofaxSequenceNumber?: number;
}
export interface IFinStatTabDto {
    TabOrder: number;
    GUIOrder: number;
    Label: string;
    DisplayPercent: boolean;
    DisplayChange: boolean;
    IsOutput: boolean;
    ShowCollapsed: boolean;
    Rows: IFinStatRowDto[];
    RowAmountsHashCode: number;
}
export interface IFinStatRowDto {
    TemplateRowId: number;
    ParentRowCountId?: number;
    RowNumber: number;
    ComparatorId?: number;
    RatiosCode: string;
    RowIdent: string;
    Label: string;
    Formula: string;
    AllowNegative: boolean;
    AllowNull: boolean;
    ColorKey: number;
    Indent: number;
    IsTitle: boolean;
    DefaultShow: boolean;
    Font?: EFont;
    ReadonlyItems: IFinStatItemDto[];
    EditableItems: IFinStatItemDto[];
}
export enum EFont {
    B10 = 1,
    N10 = 2,
    N12 = 3,
    N11 = 4,
    B11 = 5,
    N9 = 6,
    B9 = 7,
    N8 = 8,
    B8 = 9
}
export interface IFinStatItemDto {
    Id: number;
    Value?: number;
    Ratio?: number;
    Difference?: number;
    DifferencePerc?: number;
    Editable: boolean;
    HeaderId: number;
    Comment: string;
    IsCalculationDisabled: boolean;
}
export interface IFinStatRatiosDataDto {
    HeaderIds: number[];
    Tabs: IFinStatTabDto[];
}
export interface IFinStatOverviewReqDto extends IGridBaseDto {
    PartyId: number;
    OnlyFinished: boolean;
    OnlyNonConsolidation: boolean;
    ShowFull: boolean;
    PDRatingModelId?: number;
    ExcludeIds: number[];
    SelectedIds: number[];
    AdditionalSearchParams: IFinStatAdditionalSearchParams;
    From: Date;
    To: Date;
}
export interface IFinStatAdditionalSearchParams {
    Format: EFormat;
    State: EStateFinData;
    IsConsolidated: boolean;
    TemplateId: number;
}
export interface IFinStatOverviewResDto extends IGridBaseDto {
    Id: number;
    Title: string;
    NumberOfMonths?: number;
    ValidFrom: Date;
    ValidTo: Date;
    StatementType: string;
    Format: string;
    FormatEnum: EFormat;
    TemplateId: number;
    State: string;
    StateEnum: EStateFinData;
    Consolidated: boolean;
    BulkUploaded: boolean;
    CurrencyId: number;
    LastModification: Date;
    UnitKey?: number;
    HighlightColor: string;
}
export interface IFVCopyDto {
    FinStatementHeaderIds: number[];
    Consolidation: boolean;
    ValidFrom?: Date;
    ValidTo?: Date;
}
export interface IExportOptions {
    Format: EExportFormat;
    Culture: string;
    IsCollapsed: boolean;
    IsHeaderCollapsed: boolean;
}
export enum EExportFormat {
    PDF = 0,
    XLS = 1
}
export enum EFinDataTabOrder {
    Balance = 11,
    ProfitAndLoss = 12,
    AdditionalInfo = 15,
    Ratios = 18,
    CashFlow = 19,
    TaxEvidence = 20
}
export interface IImportFinancialStatementResultDto {
    ImportResult: EUpdateRowsResult;
    ResultMessage: string;
}
export enum EUpdateRowsResult {
    Successful = 1,
    Error = 2,
    WaitingForKofax = 3
}
export interface IStressAnalysisDto {
    FinStatHeaderId: number;
    Title: string;
    Variant: EStressAnalysisVariant;
    Indicator: EStressAnalysisIndicator;
    Variable: EStressAnalysisVariable;
    PeriodNumber: number;
    Values: number[];
}
export enum EStressAnalysisVariant {
    Basic = 1,
    Advanced = 2
}
export enum EStressAnalysisIndicator {
    DSCR = 1,
    CCF = 2,
    TotalPL = 3,
    SolvencyRatio = 4,
    Gearing = 5,
    InterestCover = 6
}
export enum EStressAnalysisVariable {
    Sales = 1,
    GrossMargin = 2
}
export interface IFinStatBusinessTurnoverDto {
    Name: string;
    BusinessTurnover: number;
}
export interface IImportFileRowDto {
    Name: string;
    Comment: string;
    IdJskFile: number;
    FileItem: any;
    Tabs: EFinDataTabOrder[];
    SupportedFileExtensions: string[];
}
export interface ICreditComponentManagerModel extends IDomainDto {
    CreditEntityId?: number;
    BranchId?: number;
    CreditFileId?: number;
    BranchCode: string;
    Users: ICreditComponentManagerUserModel[];
    MainManager: string;
    BranchName: string;
    HasUniqueMainManager: boolean;
    IsMainManagerSet: boolean;
}
export interface ICreditComponentManagerUserModel extends IDomainDto {
    UserName: string;
    IsManager: boolean;
    IsMainManager: boolean;
    FirstName: string;
    Surname: string;
}
export interface ICreditComponentManagerListModel {
    Managers: ICreditComponentManagerModel[];
    HasNonStandardAccess: boolean;
}
export interface ISearchPartyLinkReqDto extends IGridBaseDto {
    PartyId: number;
}
export interface IPartyLinkDto extends IDomainDto {
    ValidTo?: Date;
    ValidFrom: Date;
    PercentOwnership?: number;
    EssRelationTypeId: number;
    Comment: string;
    SourcePartyId: number;
    TargetPartyId: number;
    TargetPartyName: string;
    SourcePartyName: string;
}
export interface ISearchClientReqDto extends IGridBaseDto {
    ClientName: string;
    IdentificationNumber: string;
    Zecho: string;
    Surname: string;
    FirstName: string;
    BirthNumber: string;
    BirthDate?: Date;
}
export interface ISearchClientResDto {
    Id: number;
    Cuid: number;
    PersonType: EPartyType;
    ClientName: string;
    IcoZecho: string;
    BirthNumberDate: string;
    CreditComponentBranch: string;
    FullName: string;
    CreditComponent: string;
    Entity: string;
    PDModelId?: number;
    LastModification: Date;
}
export enum EPartyType {
    PO = 1,
    FO = 2,
    FOP = 3,
    BANK = 4
}
export interface ISearchClientInCuReqDto extends IGridBaseDto {
    StartsWith: string;
}
export interface IPartyDetailDto extends IDomainDto {
    ClientName: string;
    IdentificationNumber: string;
    Zecho: string;
    FirstName: string;
    Surname: string;
    BirthNumber: string;
    BirthDate?: Date;
    CitizenshipId?: number;
    PartyIdentifiers: IPartyIdentifierDto[];
    IsManagerCreditFile: boolean;
    AddressFo: IPartyAddressDto;
    AddressPo: IPartyAddressDto;
    PersonType: EPartyType;
    IdFop?: number;
    CreditFileId?: number;
    FullName: string;
    MainCreditComponent: string;
    Cuid: number;
    PDModelId: number;
}
export interface IPartyIdentifierDto extends IDomainDto {
    Code: string;
    System: string;
    PartyId?: number;
}
export interface IPartyAddressDto {
    AddressDtoId: number;
    CountryId?: number;
    Village: string;
    Street: string;
    Zip: string;
    DescriptiveNumber: string;
    OrientationNumber: string;
}
export interface ICreditInfoOverviewDto {
    CreditInfoTypeEnum: ECreditInfoType;
    Value: string;
    Reason: string;
    Comment: string;
    StateKey: number;
    LastChange?: Date;
    ModifiedOn: Date;
    SourceInformation: string;
    CreditInfoModeEnum: ECreditInfoMode;
    RefId?: number;
}
export enum ECreditInfoType {
    LatestApprovedPDRating = 1,
    PDModel = 2,
    DateNextReview = 3,
    CREDAC = 4,
    TotalConsolidatedSalesTurnover = 5,
    TotalSalesTurnover = 6,
    TotalConsolidatedAssets = 7,
    TotalAssets = 8,
    UnautorizedOverdraft = 9,
    Blacklist = 10,
    Insolvency = 11,
    Execution = 12,
    Restructuring = 13,
    SharesStockExchange = 14,
    LGDModel = 15,
    NACE = 16,
    OverdueAmount = 17,
    FiscalYearBegin = 18
}
export enum ECreditInfoMode {
    Edit = 0,
    Override = 1,
    None = 2
}
export interface ICreditInfoEditDto {
    Id: number;
    Version: string;
    CreditInfoTypeEnum: ECreditInfoType;
    Comment: string;
    StockExchange?: boolean;
    PDRatingModelId?: number;
    LGDModelId?: number;
    KBCId?: number;
    CreditFileId: number;
    FiscalYearBegin: number;
}
export interface IPartyHeaderDto {
    PartyName: string;
    IdentificationNumber: string;
    BirthNumber: string;
    MainCreditComponent: number;
    CreditFileId: number;
    Cuid?: number;
    Id: number;
    PDModelId?: number;
    EssGroupId?: number;
    CanCalculatePdRating: boolean;
    CanCalculateRaroc: boolean;
    Permissions: string[];
    PartyPermissions: EPermissionType[];
    Areas: EPermissionAreaType[];
    FiscalYearStartingMonth?: number;
    IsPartyManaged: boolean;
}
export enum EPermissionType {
    Partynew = 10001,
    Partydetail = 10002,
    Partyedit = 10003,
    PartyLinksdetail = 10004,
    Statementnew = 20001,
    Statementedit = 20002,
    Statementshowlist = 20003,
    Statementdetail = 20004,
    Statementdelete = 20005,
    Statementcopy = 20006,
    Statementexport = 20007,
    Statementrecalculate = 20008,
    Statementconvert = 20009,
    Statementcalculate = 20010,
    Statementshowfull = 20011,
    Productnew = 30001,
    Productedit = 30002,
    Productshowlist = 30003,
    Productdelete = 30004,
    Productcopy = 30005,
    Productdetail = 30006,
    Collateralnew = 40001,
    Collateraledit = 40002,
    Collateralshowlist = 40003,
    Collateraldelete = 40004,
    Collateralcopy = 40005,
    Collateraldetail = 40006,
    PdRatingnew = 50001,
    PdRatingcalculate = 50002,
    PdRatingshowlist = 50003,
    PdRatingdelete = 50004,
    PdRatingcopy = 50005,
    PdRatingcomplete = 50006,
    PdRatingexport = 50007,
    PdRatingdetail = 50008,
    PdRatingapprobate = 50009,
    PdRatingchangefinancialdata = 50010,
    PdRatingsave = 50011,
    Rarocnew = 60001,
    Raroccalculate = 60002,
    Rarocshowlist = 60003,
    Rarocdelete = 60004,
    Raroccopy = 60005,
    Raroccollateraladd = 60006,
    Raroccollateraldelete = 60007,
    Raroccollateraldetail = 60008,
    Rarocdetail = 60009,
    Rarocexport = 60010,
    Rarocfinish = 60011,
    Rarocproductadd = 60012,
    Rarocproductcollateralmatrix = 60013,
    Rarocproductdelete = 60014,
    Rarocproductdetail = 60015,
    Rarocremoveselectedpdrating = 60016,
    Rarocsave = 60017,
    Rarocselectpdrating = 60018,
    Monitoringdetail = 70001,
    Monitoringexport = 70002,
    Monitoringchangeperiod = 70003,
    Monitoringsave = 70004,
    Conditionsdefaultview = 80001,
    Conditionsdelete = 80002,
    Conditionsdetail = 80003,
    Conditionsedit = 80004,
    Conditionsfilter = 80005,
    Conditionsnew = 80006,
    Conditionssave = 80007,
    Conditionsshowlist = 80008,
    Dashboarddetail = 90001,
    Dashboardglobalshowlist = 90002,
    CreditInfoedit = 11001,
    CreditFileManagementedit = 11002,
    CreditFileManagementndachange = 11003,
    Generallogin = 12001,
    Administrationedit = 13001,
    Administrationshowlist = 13002,
    Administrationapply = 13003
}
export enum EPermissionAreaType {
    Party = 1,
    Statement = 2,
    Product = 3,
    Collateral = 4,
    PdRating = 5,
    Raroc = 6,
    Monitoring = 7,
    Conditions = 8,
    Dashboard = 9,
    CreditFileManagement = 10,
    CreditInfo = 11,
    General = 12,
    Administration = 13
}
export interface ICreditInfoContainerDto {
    CreditFileId: number;
    Version: string;
    CreditInfoData: ICreditInfoDataDto;
    CreditInfoFinancial: ICreditInfoFinancialDto;
}
export interface ICreditInfoDataDto {
    CreatedOn: Date;
    PDModelId?: number;
    PDModelDetailId?: number;
    LGDModelId?: number;
    LGDModelDetailId?: number;
    CREDACId?: number;
    CREDACDetailId?: number;
    StockExchange?: boolean;
    StockExchangeDetailId?: number;
    PdRatingApproved: string;
    NextReviewDate?: Date;
    NACEId?: number;
    NACEDetailId?: number;
    FiscalYearStartingMonth?: number;
}
export interface ICreditInfoFinancialDto {
    CurrencyId?: number;
    TotalTurnover?: number;
    TotalAssets?: number;
    ConsolidatedCurrencyId?: number;
    ConsolidatedTurnover?: number;
    ConsolidatedAssets?: number;
}
export interface IPartyDashboardDto {
    CreditFileId: number;
    ClientName: string;
}
export interface IPDRatingOverviewReqDto extends IGridBaseDto {
    CreditFileId: number;
    OnlyCompleted: boolean;
    ForCafe: boolean;
    ForRaroc: boolean;
    PDRatingModelId?: number;
    PDRatingToHideId?: number;
    From?: Date;
    To?: Date;
}
export interface IPDRatingOverviewResDto {
    Id: number;
    PDDate: Date;
    CalculationDate: Date;
    ClientCuid: string;
    PDCategoryEnum: EPDRatingCategory;
    PDModel: string;
    PDModelCode: string;
    State: string;
    LastChange: Date;
    Rating: string;
    RatingForRaroc: string;
    PdRatingDetail: IPDRatingDetailDto;
    User: string;
    Order: number;
    FinValidTo?: Date;
    FinConsolidation?: boolean;
    PDRatingModelId: number;
}
export enum EPDRatingCategory {
    Standard = 1,
    Monitoring = 2,
    Orientative = 3,
    Comparison = 4
}
export interface IPDRatingDetailDto extends IDomainDto {
    DecidedOn: Date;
    ExternalRatingId?: number;
    RatingId: number;
    Comment: string;
    PDRatingId: number;
    PercentPDRating?: number;
    PDRatingTypeKey?: number;
    OverrulingReasonKey?: number;
    ApprovalLevelKey?: number;
    OverrulingFlag?: number;
    Rating: IRatingDto;
    RatingCode: string;
    PdRating: IPDRatingDto;
}
export interface IRatingDto extends IEnumerationDto {
    FailureRate: number;
}
export interface IPDRatingDto extends IDomainDto {
    PDRatingModelId: number;
    StatePDRatingKey: number;
    CalculationDate?: Date;
    CreditFileId: number;
    OnlyResult: boolean;
    PDRatingCategoryKey: number;
    PDDate?: Date;
    ReviewText: string;
    FinancialRatingResult?: number;
    NonFinancialRatingResult?: number;
    TotalRatingResult?: number;
    PDRatingModelDate?: Date;
    CompleteDate?: Date;
    NACEId?: number;
    UseAsMonitoring: boolean;
    Consolidation: boolean;
    Order: number;
    Description: string;
    DetailForRaroc: IPDRatingDetailDto;
    PDModel: IPDRatingModelDto;
    Rating: string;
}
export interface IPDRatingDataDto {
    CreatedUserId: number;
    CreditFileId: number;
    FinancialHeader: IFinancialStatementHeaderDto;
    State: string;
    StateEnum: EStatePDRating;
    LastChangeDate: Date;
    PdModel: IPDRatingModelDto;
    FinDataNeeded: boolean;
    PDRatingModelId: number;
    PDRatingCategoryEnum: EPDRatingCategory;
    UseAsMonitoring: boolean;
    SelectedFinancialStatementId?: number;
    PDRatingId: number;
    PDRatingVersion: string;
    PDRatingResultTab: IPDRatingResultTabDto;
    Tabs: IPDRatingTabDto[];
    IsLocked: boolean;
}
export interface IFinancialStatementHeaderDto extends IDomainDto {
    StockExchange: boolean;
    Exported: boolean;
    BulkUploaded: boolean;
    PersonID: string;
    Title: string;
    SendToCAFE: boolean;
    SendToCRIF: boolean;
    ValidTo?: Date;
    ValidFrom?: Date;
    NumberOfDays?: number;
    NumberOfMonths?: number;
    AuditorsOpinion: boolean;
    UnitKey: number;
    CurrencyID: number;
    Consolidation: boolean;
    TypeKey: number;
    PartyId?: number;
    CreditFileId?: number;
    ParentId?: number;
    StateFinStatementKey: number;
    TemplateFinDataId: number;
    Migrated: boolean;
    SendToPDRating: boolean;
    HeaderVersion: number;
    HasConvertedHeader: boolean;
    IsVisited: boolean;
    SortedHeaderVersion: number;
    FinancialStatementRowsDto: IFinancialStatementRowDto[];
    TemplateFinDataDto: ITemplateFinDataDto;
    ImportFilesDto: IImportFileDto[];
}
export interface IFinancialStatementRowDto extends IDomainDto {
    Amount?: number;
    Comment: string;
    Share?: number;
    Predictions?: number;
    Ratio?: number;
    ChangeComparedPreviousPeriod?: number;
    ImportFileId?: number;
    HeaderId: number;
    TemplateRowFinDataId: number;
    ImportFileDto: IImportFileDto;
    TemplateRowFinDataDto: ITemplateRowFinDataDto;
    RowConversionsOutDto: IRowConversionDto[];
    RowConversionsInDto: IRowConversionDto[];
}
export interface ITemplateRowFinDataDto extends IDomainDto {
    RowNumber: number;
    RowNumberEPO?: number;
    StatementEPO?: number;
    NegativeAllowed: boolean;
    Name: string;
    RowNameEPO: string;
    ConversionFormula: string;
    TemplateFinDataId: number;
    TemplateGUIId: number;
    TemplateTabAssignId?: number;
    Consolidation: boolean;
    NameCs: string;
    NameEn: string;
    RowIdent: string;
    Note: string;
    IsTitle: boolean;
    DefaultShow: boolean;
    PredictionShow: boolean;
    PredictionEdit: boolean;
    ParentRowCountId?: number;
    DataId: number;
    AllowNull: boolean;
    TemplateFinDataDto: ITemplateFinDataDto;
}
export interface ITemplateFinDataDto extends IDomainDto {
    Title: string;
    ValidTo?: Date;
    ValidFrom?: Date;
    FormatKey?: number;
    StateTemplateKey?: number;
    NameCs: string;
    NameEn: string;
    TemplateVersion: number;
    HighlightColor: string;
}
export interface IRowConversionDto extends IDomainDto {
    TemplateRowConversionId: number;
    FinStatementRowOutId: number;
    FinStatementRowInId: number;
    TemplateRowConversionDto: ITemplateRowConversionDto;
}
export interface ITemplateRowConversionDto extends IDomainDto {
    ItemOrder?: number;
    TemplateRowOutId: number;
    TemplateRowInId: number;
    TemplateRowFinDataOutDto: ITemplateRowFinDataDto;
    TemplateRowFinDataInDto: ITemplateRowFinDataDto;
}
export enum EStatePDRating {
    InProcess = 1,
    WaitingForApproval = 2,
    Approved = 3,
    Finished = 4
}
export interface IPDRatingBaseDto {
    CalculationDate: Date;
    PDDate: Date;
    PDRatingModelId: number;
    CountedPdRatingId?: number;
    PercentageRating?: number;
    SuggestedPDRating: IPDRatingItemValueDto;
    SuggestedAdvisorPDRating: IPDRatingItemValueDto;
    ApprovedPDRatings: IPDRatingItemValueDto[];
    ValidationPDRating?: number;
    ExternalRatingId?: number;
    PDRatingCategoryEnum: EPDRatingCategory;
    UseAsMonitoring: boolean;
    Consolidation: boolean;
}
export interface IPDRatingResultTabDto extends IPDRatingBaseDto {
    Date?: Date;
    MandatoryRatingId?: number;
    OtherRatingId?: number;
    GroupRatingId?: number;
    SuggestedSystemRatingId?: number;
    SuggestedSystemPercent?: number;
    SuggestedSystemOverrFlg: number;
}
export interface IPDRatingItemValueDto {
    RatingId?: number;
    OverrulingReasonKey?: number;
    Comment: string;
    ApprovalDate?: Date;
    ApprovalLevel?: number;
}
export interface IPDRatingTabDto {
    CriterionType: ECriterionType;
    Sections: IPDRatingSectionDto[];
    Editable: boolean;
}
export enum ECriterionType {
    Mandatory = 1,
    Soft = 2,
    NonFinancial = 3,
    InflueceESS = 4,
    Ratio = 5
}
export interface IPDRatingSectionDto {
    Id: number;
    SectionText: string;
    Criterions: IPDRatingCritDto[];
}
export interface IPDRatingCritDto {
    Question: string;
    Order: number;
    Code: string;
    CritTempId: number;
    AnswerType: EAnswerType;
    SelectedAnswerDto: IPDRSelectedAnswerDto;
    Answers: IPDRatingAnswerDto[];
}
export enum EAnswerType {
    Boolean = 1,
    StringFromList = 2,
    Number = 3,
    Ess = 4,
    EssPDModel = 5,
    EssCountry = 6
}
export interface IPDRSelectedAnswerDto {
    CriterionId: number;
    BoolChoice?: boolean;
    NumberChoice?: number;
    AnswerChoice?: number;
    InfluenceEss: IInfluenceEss;
    CountryChoice?: number;
}
export interface IInfluenceEss {
    PartyId: number;
    PartyName: string;
    PDRatingId: number;
    PDRatingModelName: string;
    CountedPdRating: string;
}
export interface IPDRatingAnswerDto {
    Id: number;
    AnswerText: string;
    Order: number;
    Default: boolean;
}
export interface IPDRatingEditDto extends IPDRatingBaseDto {
    PDRatingId: number;
    PDRatingVersion: string;
    CreditFileId: number;
    SelectedAnswers: IPDRSelectedAnswerSaveDto[];
    SelectedFinancialStatementId?: number;
}
export interface IPDRSelectedAnswerSaveDto extends IPDRSelectedAnswerDto {
    CritTempId: number;
    AnswerType: EAnswerType;
    CriterionType: ECriterionType;
    Section: number;
}
export interface IPDRatingNewDto extends IPDRatingBaseDto {
    CreditFileId: number;
    StatePDRating: EStatePDRating;
}
export interface IPDRatingApprovedDto {
    PDRatingId: number;
    PDRatinVersion: string;
    ApprovedDto: IPDRatingItemValueDto;
}
export interface ICollateralGroupsDto {
    CreditFileId: number;
    CollateralTypes: ICollateralTypeCUDto[];
    CollateralSubtypes: ICollateralSubTypeCUDto[];
    Sections: ICollateralSectionDto[];
}
export interface ICollateralSectionDto extends IEnumerationDto {
    Collaterals: ICollateralDetailDto[];
    Selection: number[];
}
export interface ICollateralDetailDto {
    Source: ICollateralDto;
    IdentText: string;
    RatingText: string;
    SectionDescription: string;
    TypeDescription: string;
    SubTypeDescription: string;
    IsCopy: boolean;
    Links: IProductLink[];
}
export interface ICollateralDto extends IDomainDto {
    LineNumber: string;
    CollateralValue?: number;
    CurrencyId?: number;
    Description: string;
    GuarantorId?: number;
    StateKet?: EStateProductCollateral;
    TypeOfStatementKey?: number;
    PledgeValue?: number;
    CreditFileId: number;
    PDRatingId?: number;
    ValidFrom?: Date;
    ValidTo?: Date;
    LastValuation?: Date;
    NextMonitoring?: Date;
    NextValuation?: Date;
    RecoveryRatePercent?: number;
    VersionStatusID?: number;
    CreditProposalID?: number;
    CollateralObjectId?: number;
    ExpirationDateUnit?: number;
    ExpirationDateQuantity?: number;
    ExpirationDate?: Date;
    URR_TTC?: number;
    CutOff_Eur?: number;
    CollateralSourceId?: number;
    CollateralSubTypeCUId?: number;
    ExpirationByProduct: boolean;
    SourceEntity: number;
    PartyId?: number;
    CollateralTypeCU: ICollateralTypeCUDto;
    CollateralSubTypeCU: ICollateralSubTypeCUDto;
    VersionStatus: IVersionStatusDto;
    Readonly: boolean;
    HasAnyProductAttachment: boolean;
    Changed: boolean;
    StateKey: EStateProductCollateral;
    AttachedProducts: IProductDto[];
}
export enum EStateProductCollateral {
    Proposal = 1,
    ForApproval = 2,
    ForCompletion = 3,
    Approved = 4,
    Contract = 5,
    Finished = 6,
    Canceled = 7,
    Rejected = 8,
    NotSignedByClient = 9
}
export interface IVersionStatusDto extends IDomainDto {
    State?: EStateProductCollateral;
}
export interface IProductDto extends IDomainDto {
    LineNumber: number;
    CurrencyLimitId?: number;
    ExpectedDrawdown?: number;
    Description: string;
    StateKey?: EStateProductCollateral;
    TypeOfStatement?: number;
    LimitValue?: number;
    CreditFileId: number;
    DrawdownPeriod?: number;
    DrawdownTo?: Date;
    DrawdownFrom?: Date;
    PaymentAccount?: number;
    CreditAccount: string;
    ValidTo?: Date;
    LastSettlement?: Date;
    DueDate?: Date;
    UFN: boolean;
    OverdueFrom?: Date;
    RestructuredFrom?: Date;
    ForbearancePhase: string;
    BreachFrom?: Date;
    ForbearancePhaseCode: string;
    OverdueDays?: number;
    BreachOfRestructFrom?: Date;
    Drawdown: boolean;
    Restructured: boolean;
    RestructuredTo?: Date;
    Committed: boolean;
    VersionStatusID?: number;
    CreditProposalID?: number;
    ProductObjectID?: number;
    CurrencyID?: number;
    SuperiorProductId?: number;
    SourceProductId?: number;
    CurrentDrawdownAmount?: number;
    DrawdownToUnit: ETimeUnit;
    DrawdownToQuantity?: number;
    DueDateUnit: ETimeUnit;
    DueDateQuantity?: number;
    PaymentFlag: boolean;
    FinancingFlag: boolean;
    CUID?: number;
    ActualBalanceValue?: number;
    ActualBalanceDate?: Date;
    AvailableBalance?: number;
    AccountName: string;
    BankBicCode: string;
    BankNationalCode: string;
    AccountOpeningDate?: Date;
    ExchangeRate?: number;
    InvertedRateIndicator?: boolean;
    LoanSetting?: number;
    NextInstalmentDate?: Date;
    UnpaidFund?: number;
    AmountAfterMaturity?: number;
    Pmtpi?: number;
    SourceBankSytem?: number;
    MinimalInstalment?: number;
    MaximalInstalment?: number;
    ProductGroup: string;
    LineNo: string;
    Level?: number;
    StatusCode?: number;
    CreditAccountDate?: Date;
    RevolvingFlag?: boolean;
    UnauthorisedFlag?: boolean;
    SourceEntity?: number;
    ReportingDate?: Date;
    ProdCDSId?: number;
    TurnoverCreditDate?: Date;
    ProductSubtypeCUId?: number;
    Currency: ICurrencyDto;
    CurrencyLimit: ICurrencyDto;
    VersionStatus: IVersionStatusDto;
    ProductSubTypeCUDto: IProductSubTypeCUDto;
    ProductObject: IProductObjectDto;
    HasAnyCollateral?: boolean;
    HasChildProducts?: boolean;
    Readonly: boolean;
    Changed: boolean;
    TemporaryId: number;
}
export enum ETimeUnit {
    Month = 1,
    Year = 2,
    Day = 3,
    Quarter = 4,
    Week = 5
}
export interface ICurrencyDto extends IEnumerationDto {
    CodeA3: string;
    CountryId?: number;
    DisplayOrder: number;
}
export interface IProductObjectDto extends IDomainDto {
    SourceEntity: number;
    Revolving: boolean;
    CreditFileId?: number;
    ProdCDSId?: number;
    SnapshotType?: number;
    ReportingDate?: Date;
    ConsolidatedId?: number;
    SourceSystemCode?: number;
    ProductTypeCUId?: number;
    ProductTypeCU: IProductTypeCUDto;
}
export interface IProductLink {
    Id: number;
    Name: string;
    HasChildProducts?: boolean;
}
export interface ICollateralViewDto {
    Id: number;
    CreditFileId: number;
    SectionId: number;
    SectionDescription: string;
    CollateralTypeCUId?: number;
    TypeDescription: string;
    CollateralSubTypeCUId?: number;
    SubTypeDescription: string;
    SubTypeDescriptionL: string;
    CurrencyId?: number;
    PledgeValueThousands: number;
    CollateralValueThousands: number;
    RecoveryRatePercent?: number;
    ValidFrom?: Date;
    ValidTo?: Date;
    ExpirationDateUnit?: number;
    ExpirationDateQuantity?: number;
    ExpirationDate?: Date;
    ExpirationByProduct: boolean;
    GuarantorId?: number;
    HasProductAttachment: boolean;
}
export interface IProductViewDto {
    Id: number;
    CurrencyLimitId?: number;
    StateKey?: EStateProductCollateral;
    TypeOfStatement?: number;
    LimitValueThousands: number;
    CreditFileId: number;
    CreditAccount: string;
    LineNo: string;
    Level?: number;
    StatusCode?: number;
    SourceEntity?: number;
    ProductTypeCUId?: number;
    TypeDescription: string;
    ProductSubtypeCUId?: number;
    SubtypeDescription: string;
    SubtypeDescriptionL: string;
    StatusDescription: string;
    CurrencyLimitDescription: string;
    SectionId: number;
    SectionDescription: string;
    HasAnyCollateral?: boolean;
    HasChildProducts?: boolean;
    C_U: string;
    CurrentDrawdownThousands: number;
    DueDate?: Date;
    DueDateUnit?: ETimeUnit;
    DueDateQuantity?: number;
    DrawdownTo?: Date;
    Detailed: boolean;
    ProdCDSId?: number;
    Order: number;
    UFN: boolean;
    OrderDate: Date;
    Interests: IInterestDto[];
    LastInterest: IInterestDto;
    InstalmentPlans: IInstallmentPlanDto[];
    Balances: IBalanceDto[];
    Fees: IFeeDto[];
}
export interface IInterestDto extends IDomainDto {
    LastFixedRateDate?: Date;
    NextFixedRateDate?: Date;
    ExtIntType?: EInterestTypeExt;
    RevaluationFrequency?: number;
    MarginPercent?: number;
    ReferenceRateValidTo?: Date;
    ReferenceRateValidFrom?: Date;
    InterestRateValidTo?: Date;
    InterestRateValidFrom?: Date;
    ReferenceRate: string;
    RateType?: EInterestRateType;
    ProductId: number;
    CcInterestForRegularPeriod?: number;
    ClientRate?: number;
    CcInterestForPrevPeriod?: number;
    FixationDate?: Date;
    FTP?: number;
    MarginSD?: number;
    ExternalRate?: number;
    SnapshotType?: number;
    SourceEntity?: number;
    ReportingDate?: Date;
    LiquidityMargin?: number;
    MarginPercentRAROC?: number;
    Deleted: boolean;
    MC?: number;
    RevaluationFrequencyUnit?: EFrequencyUnit;
    ReferenceRateKey?: EInterestReferenceRate;
}
export enum EInterestTypeExt {
    Internal = 1,
    External = 2
}
export enum EInterestRateType {
    Fixed = 1,
    Float = 2
}
export enum EInterestReferenceRate {
    PRIBOR = 1,
    LIBOR = 2,
    EURIBOR = 3,
    KK = 4,
    KKA = 5,
    KKB = 6,
    KKK = 7,
    KKPBA = 8,
    KKPR = 9,
    KKV = 10,
    KKWD = 11,
    KKZ = 12,
    KPN = 13,
    KPS = 14,
    KSP = 15,
    OVDSME = 16,
    PPPSME = 17,
    PPUSME = 18,
    RSU = 19,
    RSUZ = 20,
    STKONP = 21,
    VSKAPT = 22,
    VSKFO = 23,
    VSPS = 24,
    YieldCurve = 25,
    CC = 26,
    CF_CZK_3M = 27,
    CF_EUR_ERIB_3M = 28,
    CPPKTK = 29,
    CPVKTK = 30,
    DRSME = 31,
    EQINDEX_CZK_1Y = 32,
    Given_Rate = 33,
    INDFIX = 34,
    INFINDEX_CZK_1Y = 35,
    IRINDEX_CZK_1Y = 36
}
export interface IInstallmentPlanDto extends IDomainDto {
    LastDate?: Date;
    FirstDate?: Date;
    InstallmentDay?: number;
    Frequency?: number;
    ValidFrom?: Date;
    NumberOf?: number;
    Regular: boolean;
    CreditDebet?: number;
    InstallmentSubtype?: number;
    InstallmentType?: number;
    Amount?: number;
    CurrencyID?: number;
    ProductId: number;
    SnapshotType?: number;
    SourceEntity?: number;
    ReportingDate?: Date;
    Currency: ICurrencyDto;
    Deleted: boolean;
    Installments: IInstallmentDto[];
}
export interface IInstallmentDto extends IDomainDto {
    InstallmentDay?: Date;
    OrderNumber?: number;
    CreditDebet?: number;
    Amount?: number;
    CurrencyID?: number;
    InstallmentPlanId: number;
    CcInstalmentDate?: Date;
    CcRecomendedInstalmentDate?: Date;
    CcCurrentFullInstalment?: number;
    CcCurrentMinInstalment?: number;
    CcCurrentOutstandingAmount?: number;
    CcLastInstalmentDate?: Date;
    CcFullInstalment?: number;
    CcMinimalInstalment?: number;
    CcFixedInstalment?: number;
    CcNextBillDate?: Date;
    CcLastBillDate?: Date;
    CcSumAmountBill?: number;
    CcHasFullInstalment: boolean;
    FinalMaturity?: Date;
    MaxWithdrawalDate?: Date;
    EmpErrorCode: string;
    DaysToNextEmp?: number;
    EmpAmountMin?: number;
    EmpAmountMax?: number;
    PaymentDate?: Date;
    Currency: ICurrencyDto;
    Deleted: boolean;
}
export interface IBalanceDto extends IDomainDto {
    IsCredit?: boolean;
    BalanceType?: number;
    Amount?: number;
    CurrencyID?: number;
    ProductId: number;
    SnapshotType?: number;
    SourceEntity?: number;
    ReportingDate?: Date;
    Currency: ICurrencyDto;
    Deleted: boolean;
}
export interface IFeeDto extends IDomainDto {
    FeeCategoryKey: EFeeCategory;
    FeeClassKey: EFeeClass;
    Percent?: number;
    FeeTypeKey: EFeeType;
    Amount?: number;
    ProductId?: number;
    Frequency?: ETimeUnit;
    CurrencyId?: number;
    FeeUnitKey?: EFeeUnit;
    SnapshotType?: number;
    SourceEntity?: number;
    ReportingDate?: Date;
    FeeTypeName: string;
    FeeDay?: number;
    FeeEffectiveDay?: Date;
    FeeExpirationDate?: Date;
    SourceSystemCode?: number;
    AmountText: string;
    AmountThousands: number;
    Currency: ICurrencyDto;
    Deleted: boolean;
    Selected: boolean;
}
export enum EFeeCategory {
    Input = 1,
    Periodical = 2,
    MarginUsed = 3,
    MarginUnused = 4
}
export enum EFeeClass {
    CommitmentFee = 1,
    EvaluationAndProcessing = 2,
    Provision = 3,
    ManagementFee = 4,
    CommitmentReward = 5
}
export enum EFeeType {
    Amount = 1,
    Percentage = 2
}
export enum EFeeUnit {
    BasicPoints = 1,
    Percents = 2,
    CurrencyInThousands = 3,
    Currency = 4
}
export interface ICollateralProductMatrixDto {
    CollateralColumns: ICollateralDto[];
    CollateralProductRows: ICollateralProductMatrixRowDto[];
}
export interface ICollateralProductMatrixRowDto {
    CollateralProductColumns: ICollateralProductMatrixCellDto[];
    Level?: number;
    LineNo: string;
    RowNumber: number;
    ProductTypeCU: IProductTypeCUDto;
    ProductSubTypeCU: IProductSubTypeCUDto;
    ProductId?: number;
    SuperiorProductId?: number;
    LimitValueThousands?: number;
    CurrencyId?: number;
}
export interface ICollateralProductMatrixCellDto extends IDomainDto {
    ColNumber: number;
    ProductId: number;
    SuperiorProductId?: number;
    CollateralId: number;
    Current: boolean;
    Proposal: boolean;
    Readonly: boolean;
    VersionStatus: IVersionStatusDto;
    VersionStatusId?: number;
}
export interface IRarocOverviewReqDto extends IGridBaseDto {
    CreditFileId: number;
}
export interface IRarocOverviewResDto {
    Id: number;
    CalculatedDate: Date;
    Title: string;
    LGDModel: string;
    PercentRaroc?: number;
    StateRaroc: string;
    StateRarocEnum: EStateRaroc;
    Currency: string;
    CurrencyDataId: number;
    Amount?: number;
    User: string;
    RarocForCredit: boolean;
}
export enum EStateRaroc {
    InProcess = 1,
    Finished = 2,
    Approved = 3
}
export interface IRarocValidationDto {
    ValidProducts: boolean;
    ValidCollaterals: boolean;
}
export interface IRarocContainerDto {
    RarocDto: IRarocDto;
    IsLocked: boolean;
    HasProducts: boolean;
    HasCollaterals: boolean;
    HasResult: boolean;
}
export interface IRarocDto extends IDomainDto {
    RarocForCredit: boolean;
    StateRarocKey?: number;
    CreditFileId: number;
    FXIncome: number;
    OtherIncome: number;
    CurrencyId?: number;
    TotalNCIncome: number;
    CompanyTurnover?: number;
    DepositIncome: number;
    PaymentIncome: number;
    Multiplicator: boolean;
    ProjType?: EProjectType;
    IsEssGroup: boolean;
    Title: string;
    LGDModelId?: number;
    PDRatingModelId?: number;
    RatingId?: number;
    PDRatingId?: number;
    ExternalRatingId?: number;
    PDRatingPercent?: number;
    CurrencyNonFinancialId?: number;
    ConsolidatedTurnoverEss?: number;
    CurrencyFinancialId?: number;
    TotalAssets?: number;
    ConsolidatedAssetsEss?: number;
    CurrencyConsolidatedId?: number;
    RarocCopyId?: number;
    IsFromCafe: boolean;
    PDRatingValue: string;
    State: EStateRaroc;
    StateDescription: string;
    Readonly: boolean;
    IsRequired: boolean;
    ActualRequired: boolean;
    PartyId: number;
    PartyName: string;
    Reason: string;
}
export enum EProjectType {
    project_type_infrastructure = 1,
    project_type_energy = 2,
    project_type_oil_gas = 3
}
export interface IRarocBaseDto {
    RarocId: number;
    RarocVersion: string;
}
export interface IRarocProductsDto extends IRarocBaseDto {
    IsLocked: boolean;
    ProductSet: IRarocProductValueDto[];
    HasAnyCollateral: boolean;
}
export interface IRarocProductValueDto extends IDomainDto {
    Length?: number;
    LGD?: number;
    LGDirr?: number;
    ExpectedLoss?: number;
    ExpectedDrawdown?: number;
    Raroc?: number;
    FeeIncome?: number;
    InterestIncome?: number;
    ELAbs?: number;
    EL?: number;
    ELTTC?: number;
    LGDHVE?: number;
    LGDHVETTC?: number;
    LGDirrAbsTTC?: number;
    ELRating?: number;
    TranInc?: number;
    RAR?: number;
    AllIn0?: number;
    AllIn100?: number;
    RAGI?: number;
    Tax?: number;
    RANI?: number;
    ExitRate?: number;
    ExitRateTTC?: number;
    Ru?: number;
    RuTTC?: number;
    TranAlocated?: number;
    TranAlocatedTTC?: number;
    O_r?: number;
    O_rTTC?: number;
    O_a?: number;
    O_aTTC?: number;
    O_b?: number;
    O_bTTC?: number;
    O_ExitCost?: number;
    O_ExitCostTTC?: number;
    O_RWAbasel2?: number;
    O_CCF?: number;
    O_CCFTTC?: number;
    O_Ex?: number;
    O_ExTTC?: number;
    O_Icrel?: number;
    O_IcrelTTC?: number;
    O_EAD?: number;
    O_OperCostAdj?: number;
    LineNo: string;
    LimitValue?: number;
    MarginUsed?: number;
    MarginUnused?: number;
    ProdMaturityCount?: number;
    RarocId: number;
    ProductSubTypeCUId?: number;
    CurrencyId?: number;
    FeeFixed?: number;
    FeePeriodicalAmount?: number;
    FeeFrequencyKey?: number;
    UtilizationTo: boolean;
    Title: string;
    UFN: boolean;
    DueDate?: Date;
    DueDateUnit?: number;
    DueDateQuantity?: number;
    Commited: boolean;
    ExternalId?: number;
    RuProc?: number;
    RuProcTTC?: number;
    RuAbs?: number;
    RuAbsTTC?: number;
    LimitValueOut?: number;
    MarginUnusedOut?: number;
    CureRate?: number;
    CureRateTTC?: number;
    ValiditionType: EValidationType;
    AloCapital?: number;
    ProductTypeCUId?: number;
    SubTypeDescription: string;
    SubTypeDescriptionL: string;
    TypeDescription: string;
    CreditYield?: number;
    Total?: number;
    IsDeleted: boolean;
    IsTotal: boolean;
}
export enum EValidationType {
    OK = 1,
    NOK = 2,
    KO = 3,
    OKNoValid = 4
}
export interface IRarocProductDto extends IRarocBaseDto {
    RarocProduct: IRarocProductValueDto;
}
export interface IRarocCollateralsDto extends IRarocBaseDto {
    IsLocked: boolean;
    CollateralSet: IRarocCollateralValueDto[];
    HasAnyProduct: boolean;
}
export interface IRarocCollateralValueDto extends IDomainDto {
    PledgeValue?: number;
    ColAllocated?: number;
    ColAlocatedTTC?: number;
    URRadj?: number;
    URRadjTTC?: number;
    CollatNomAdj?: number;
    CollatNomAdjTTC?: number;
    Description: string;
    LineNo: string;
    CollateralValue?: number;
    GuarantorName: string;
    GuarantorPDRating: string;
    RarocId: number;
    CollateralSubTypeCUId?: number;
    CurrencyId?: number;
    Title: string;
    ExpirationByProduct: boolean;
    DueDate?: Date;
    DueDateUnit?: number;
    DueDateQuantity?: number;
    ExternalId?: number;
    PledgeValueOut?: number;
    CollateralValueOut?: number;
    CollateralTypeCUId?: number;
    RecoveryRateStandard?: number;
    SubTypeDescription: string;
    SubTypeDescriptionL: string;
    TypeDescription: string;
    Total?: number;
    IsDeleted: boolean;
    ValiditionType: EValidationType;
}
export interface IRarocCollateralDto extends IRarocBaseDto {
    RarocCollateral: IRarocCollateralValueDto;
}
export interface IPDRatingItem extends ICodebookItem {
    ModelDescription: string;
    Code: string;
    Rating: string;
    RarocMode: ERarocMode;
}
export enum ERarocMode {
    Unknown = 0,
    RealEstate = 1,
    ProjectFinance = 2
}
export interface IRarocExportOptions {
    Culture: string;
}
export interface IRarocOutputContainerDto {
    RarocId: number;
    RarocVersion: string;
    ResultSet: IRarocOutputDto;
    SummaryProducts: IRarocProductValueDto[];
    SummaryCollaterals: IRarocCollateralValueDto[];
}
export interface IRarocOutputDto extends IDomainDto {
    TotalCommitment?: number;
    TotalNetIncome?: number;
    TotalGrossIncome?: number;
    TotalFeeIncome?: number;
    CIRatioClient?: number;
    CIRatioTransaction?: number;
    CalculationDate?: Date;
    ClientGroup?: number;
    LGDPercent?: number;
    LGDModel: string;
    ClientName: string;
    TotalNCIncome?: number;
    ExpectedLoss?: number;
    PDRatingPercent?: number;
    OperationalCosts?: number;
    Raroc?: number;
    RarocModel: string;
    RegulatoryCapital?: number;
    TotalInterestIncome?: number;
    YORE?: number;
    RiskClass?: number;
    EAD?: number;
    LGD?: number;
    LGDirrAbs?: number;
    AvgLGDHVE?: number;
    TotalTranIncome?: number;
    ELProc?: number;
    ELRating?: number;
    RAR?: number;
    AncillaryCostAdj?: number;
    TotGrossIncMod?: number;
    TotalRAGI?: number;
    TotalTax?: number;
    TotalRANI?: number;
    ELAbs?: number;
    RWABasel2Proc?: number;
    RWABasel2Abs?: number;
    ELProcTTC?: number;
    RU?: number;
    RuProc?: number;
    RuABS?: number;
    PDRatingValue: string;
    DepositIncomeOut?: number;
    PaymentIncomeOut?: number;
    FxIncomeOut?: number;
    OtherIncomeOut?: number;
    TaxRate?: number;
    TotalCostAdj?: number;
    Branch: string;
}
export interface IMatrixDto {
    Cells: IMatrixCellDto[];
    Rows: IMatrixRowDto[];
    Items: IMatrixItemDto[][];
}
export interface IMatrixRowCellDto {
    Title: string;
    CurrencyId?: number;
    Value?: number;
}
export interface IMatrixCellDto extends IMatrixRowCellDto {
    CollateralId: number;
    CollTypeDes: string;
}
export interface IMatrixRowDto extends IMatrixRowCellDto {
    ProductId: number;
    ProdTypeDes: string;
}
export interface IMatrixItemDto {
    Id: number;
    CollateralId: number;
    ProductId: number;
    Proposal: boolean;
    ReadOnly: boolean;
}
export interface IMonitoringFilterDto {
    CreditFileId: number;
    PartyId?: number;
    ByToDate: number;
    Granularity: EFrequencyUnit;
    Culture: string;
    Delta: number;
    EOP: Date;
    PeriodeShift: number;
    ByEvaluationDate: boolean;
    ClientCreatedOn: Date;
}
export interface IMonitoringFilter {
    CreditFileId: number;
    ByEvaluationDate: boolean;
    Granularity: EFrequencyUnit;
    SOP: Date;
    EOP: Date;
    Culture: string;
}
export interface IMonitoringDetailsDto extends IMonitoringFilter {
    CreditFileId: number;
    ClientSemaphore: IMonitoringClientSemaphoreDto;
    ByEvaluationDate: boolean;
    Columns: IMonitoringDetailColumnDto[];
    Rows: IMonitoringDetailRowDto[];
    Granularity: EFrequencyUnit;
    SOP: Date;
    EOP: Date;
    Changed: boolean;
    CurrentFilter: IMonitoringFilterDto;
    /* Property Culture skipped, because it is already implemented by interface IMonitoringFilter*/
}
export interface IMonitoringDetailColumnDto extends IMonitoringFilter {
    ColumnId: number;
    MonitoringClientInfoId?: number;
    Title: string;
    SOP: Date;
    EOP: Date;
    MigratedOn?: Date;
    LastModifiedOn?: Date;
    /* Property CreditFileId skipped, because it is already implemented by interface IMonitoringFilter*/
    /* Property ByEvaluationDate skipped, because it is already implemented by interface IMonitoringFilter*/
    /* Property Granularity skipped, because it is already implemented by interface IMonitoringFilter*/
    /* Property Culture skipped, because it is already implemented by interface IMonitoringFilter*/
}
export interface IMonitoringDetailRowDto {
    RowId: number;
    CategoryId: number;
    CategoryTitle: string;
    RowDescription: string;
    IsSemaphore: boolean;
    IsLight: boolean;
    IsBoolean: boolean;
    Readonly: boolean;
    FinancialCovenantId?: number;
    NonFinancialCovenantId?: number;
    Value: number;
    CustomCode: string;
    SubcategoryId?: number;
    ColumnValues: IMonitoringDetailCellDto[];
    IsValid: boolean;
    IsMigrated: boolean;
    IsCustom: boolean;
    Consolidated: boolean;
    ContractConditionId?: number;
    Order: number;
}
export interface IMonitoringDetailCellDto {
    ColumnId: number;
    FinancialCovenantId?: number;
    NonFinancialCovenantId?: number;
    ContractConditionId?: number;
    ContractConditionEvaluationId?: number;
    Consolidated?: boolean;
    SemaphoreId?: number;
    MonitoringCreditInfoId?: number;
    PDRatingId?: number;
    EwsId?: number;
    PDRatingDetailId?: number;
    MonitorPDRatingDetailId?: number;
    MonitoringClientResultId?: number;
    Value: string;
    IsNumber: boolean;
    Fulfilled: boolean;
    Changed: boolean;
    IsEmpty: boolean;
    ClickEnabled: boolean;
    Color: string;
    MigratedOn?: Date;
}
export interface IMonitoringCellClickDto {
    CreditFileId: number;
    ByEvaluationDate: boolean;
    Granularity: EFrequencyUnit;
    EOP: Date;
    CurrentClientSemaphoreId?: number;
    MonitoringClientInfoId: number;
    FinancialCovenantId?: number;
    NonFinancialCovenantId?: number;
    Consolidated?: boolean;
    CustomCode: string;
    MonitoringClientResultId?: number;
    ContractConditionId?: number;
    PDRatingId?: number;
    EwsId?: number;
    Subcategory?: EMonitoringCategory;
    Category: EMonitoringCategory;
    PartyId: number;
}
export enum EMonitoringCategory {
    Zero = 0,
    OverallResult = 1,
    LightTreatment = 10,
    ContractTermsFinancial = 2,
    ContractTermsNonFinancial = 3,
    PDRating = 4,
    PDRatingMonitoring = 41,
    PDRatingStandard = 42,
    PDRatingComparison = 43,
    NegativeInformations = 5,
    NegativeInformationInsolvency = 51,
    NegativeInformationBlacklist = 52,
    NegativeInformationExecution = 53,
    NegativeInformationUnauthorizedOverdraft = 54,
    NegativeInformationRestructuring = 55,
    NegativeInformationCRU = 56,
    NegativeInformationCRIBIS = 57,
    NegativeInformationPaymentFlow = 58,
    NegativeInformationSpecific = 59
}
export interface IMonitoringCellEditDto extends IMonitoringCellClickDto, IMonitoringFilter {
    CategoryDescription: string;
    Description: string;
    Month: Date;
    IsLight: boolean;
    LightId?: number;
    IsBoolean: boolean;
    Comment: string;
    CommentEnabled: boolean;
    Readonly: boolean;
    BoolValue: boolean;
    Value: string;
    DecimalValue?: number;
    TotalVisible: boolean;
    Total: string;
    ValueFoundOn?: Date;
    LastModifiedVisible: boolean;
    LastModified: Date;
    Changed: boolean;
    Color: string;
    StateColor: EColor;
    InputRows: IMonitoringCellEditRowDto[];
    Rows: IMonitoringCellEditRowDto[];
    NegativeRows: IMonitoringRowDto[];
    Filterable: boolean;
    IsCustom: boolean;
    Today: Date;
    SOP: Date;
    Periode: string;
    ShowRelevancy: boolean;
    CloseOnSubmit: boolean;
    /* Property Culture skipped, because it is already implemented by interface IMonitoringFilter*/
    User: string;
}
export enum EColor {
    White = 1,
    Blue = 2,
    Pink = 3,
    Gray = 4,
    Green = 5,
    Orange = 6,
    Red = 7
}
export interface IMonitoringCellEditRowDto {
    EOM: Date;
    Periode: string;
    IsSemaphore: boolean;
    IsBoolean: boolean;
    SemaphoreId?: number;
    MonitorClientResultId?: number;
    ConditionEvaluationId?: number;
    NegativeSpecificId?: number;
    Description: string;
    Operator: string;
    RequiredValue: string;
    RowValue: string;
    Diff: string;
    FinancialValue?: number;
    Difference?: number;
    NonFinancialValue?: boolean;
    Fullfillment: string;
    ValueFoundOn?: Date;
    Fulfilled: boolean;
    FulfillmentPercentage: string;
    PDRatingId?: number;
    MigratedOn?: Date;
    IsReadonly: boolean;
    Changed: boolean;
    RowsPD: IMonitorPDRatingDto[];
    User: string;
    Comment: string;
    FinStatementType: string;
    ConditionLink: string[];
    FinancialLink: string[];
    KeyId?: number;
    KeyString: string;
}
export interface IMonitorPDRatingDto {
    Id?: number;
    SubCategory: EMonitoringCategory;
    PDRatingDetailId?: number;
    SavedRating: string;
    SavedRatingId?: number;
    CurrentRating: string;
    CurrentRatingId?: number;
    CurrentDetailId?: number;
    CurrentFinancialHeaderId?: number;
    ReasonKey?: number;
    PDValidTo?: Date;
    PDRatingReason: string;
}
export interface IMonitoringRowDto {
    DetailId?: number;
    KeyId?: number;
    KeyString: string;
    Validity: boolean;
    Active: boolean;
    Values: string[];
    Links: string[][];
    Details: IMonitoringRowDetailDto[];
    ModifiedOn: Date;
    ValidFrom: Date;
    ValidTo?: Date;
    ListOfEOM: Date[];
    Color: string;
    StateColor: EColor;
    OrderValue: number;
    User: string;
    IsTitle: boolean;
    Semaphore?: number;
    DashboardType?: EDashboardTypeId;
    EDashboardState?: EDashboardState;
    ChangedOn: Date;
}
export interface IMonitoringRowDetailDto {
    DetailId?: number;
    Values: string[];
    ModifiedOn: Date;
    ValidFrom: Date;
    ValidTo?: Date;
    IsTitle: boolean;
    BatchId?: any;
    KeyString: string;
}
export interface IMonitoringContainerDto extends IMonitoringFilter {
    CreditFileId: number;
    SOP: Date;
    EOP: Date;
    /* Property Culture skipped, because it is already implemented by interface IMonitoringFilter*/
    Description: string;
    GroupContainers: IMonitoringGroupContainerDto[];
    /* Property ByEvaluationDate skipped, because it is already implemented by interface IMonitoringFilter*/
    /* Property Granularity skipped, because it is already implemented by interface IMonitoringFilter*/
}
export interface IMonitoringGroupContainerDto {
    Category: EMonitoringCategory;
    Description: string;
    Semaphore: EColor;
    Color: string;
    Order: number;
    Groups: IMonitoringGroupDto[];
}
export interface IMonitoringGroupDto {
    Category: EMonitoringCategory;
    FinancialCovenantId?: number;
    ContractConditionId?: number;
    Consolidated?: boolean;
    IsCustom?: boolean;
    Description: string;
    Validity: boolean;
    Value: string;
    StateColor: EColor;
    Color: string;
    Rows: IMonitoringRowDto[];
    Order: number;
}
export interface ITestData {
    Text: string;
    Date1: string;
    Date2?: string;
    Date3?: string;
}
export interface IAppVersionInfo {
    Version: string;
    ApiVersion: string;
    Date: Date;
    ServerTimeZone: string;
    ServerTimeZoneOffset: number;
    Environment: EnvironmentEnum;
}
export enum EnvironmentEnum {
    Dev = 0,
    Int = 1,
    Prod = 2,
    ACC = 3
}
export interface IWebUserDto {
    Login: string;
    FirstName: string;
    Surname: string;
    IsLeasing: boolean;
    Roles: any[];
    RolesNames: string[];
    Areas: EPermissionAreaType[];
    Permissions: EPermissionType[];
    OrganizationalUnit: IOrganizationalUnitDto;
    HasRightToAddParty: boolean;
}
export interface IOrganizationalUnitDto extends IEnumerationDto {
    GoverningUnitId?: number;
    BrandId?: number;
    IsLeasing: boolean;
}
export interface IOperationModelDto extends IDomainDto {
    operationChildDto: IOperationChildDto[];
}
export interface IOperationChildDto {
    Text: string;
    Items: IItem[];
}
export interface IItem {
    Text: string;
}
export interface ITranslationModel {
    Module: string;
    Texts: {[ key: string]: string};
}
export interface ITraceDto {
    TimeStamp: Date;
    Message: string;
    Counter: number;
    Data: string;
    Level: ETraceLevel;
}
export enum ETraceLevel {
    Debug = 1,
    Warning = 2,
    Info = 3,
    Error = 4,
    Fatal = 5
}
export enum ETypeOfStatement {
    Audited = 1,
    FinalNotAudited = 2,
    Preliminarily = 3,
    Continuous = 4,
    Plan = 5,
    Model = 6
}
@NgModule({ imports: [], declarations: [
]})
export class WebApiModelsModule { }
