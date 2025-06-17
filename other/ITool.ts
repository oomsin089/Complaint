import { Dayjs } from "dayjs";

export interface ITool {
    idTool?: number;
    toolName?: string
    createdDate?: Dayjs
    createdBy?: string
    updatedDate?: Dayjs
    updatedBy?: string
}

export interface IToolSelect {
    idTool?: number;
    toolName?: string
}

export interface IAddTool {
    toolName?: string
    createdBy?: string
}