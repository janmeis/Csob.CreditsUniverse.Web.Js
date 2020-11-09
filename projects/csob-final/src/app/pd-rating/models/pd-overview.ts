import { IPDRatingOverviewReqDto } from 'projects/services/src/public-api';
import { GridState } from "../../app-common/models/GridBaseDto";

export class PdCriteria extends GridState implements IPDRatingOverviewReqDto {
    OnlyCompleted: boolean;
    ForRaroc: boolean;
    CreditFileId: number;
    ForCafe: boolean;
}

export class TabLabel {
    Content: any;
    Type: TabType;
    Label: string;
}

export enum TabType {
    FinancialData = 1,
    NonFinancialCriteria = 2,
    MandatoryCriteria = 3,
    OtherCriteria = 4,
    InfluenceESS = 5,
    Result = 6
}
