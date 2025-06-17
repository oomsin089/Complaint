import { Dayjs } from "dayjs";

export interface IThaiDataSubDistrict {
    id?: number;
    zipCode?: number;
    nameTh?: string;
    nameEn?: string;
    districtId?: number;
    createdDate?: Dayjs;
    updatedDate?: Dayjs;
}

export interface IThaiDataFindByPostalCode {
    idSubDistrict?: number;
    idDistrict?: number;
    idProvince?: number;
    postalCode?: number;
    nameThSubDistrict?: string;
    nameThDistrict?: string;
    nameThProvince?: string;
}