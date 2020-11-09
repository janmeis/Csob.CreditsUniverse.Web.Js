export interface Result<T> {
    Data: T
    Statuses: ResultStatus[]
}

export interface ResultStatus {
    Code: string
    Message: string
    Detail: string
    Parameters: { [key: string]: any }
    Severity: ESeverity
}

export enum ESeverity {
    Info,
    Error,
    Warning
}
