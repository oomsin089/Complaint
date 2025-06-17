import { Dayjs } from "dayjs";

export interface ISkill {
    idSkill?: number;
    skillName?: string
    createdDate?: Dayjs
    createdBy?: string
    updatedDate?: Dayjs
    updatedBy?: string
}

export interface ISkillSelect {
    idSkill?: number;
    skillName?: string
}

export interface IAddSkill {
skillName?: string
createdBy?: string
}