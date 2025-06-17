import { Dayjs } from "dayjs";

export interface IPosition {
    id?: number;
    positionCode?: string
    positionName?: string
    positionNameEn?: string
    createdDate?: Dayjs
    createdBy?: string
    updatedDate?: Dayjs
    updatedBy?: string
}

export interface IPositionSelect {
    idPosition?: number;
    positionName?: string
}

export interface IAddPosition {
    positionName?: string
    createdBy?: string
}