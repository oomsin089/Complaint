export interface IRoleResponse {
  roleId: number;
  roleName?: string;
  permissionCode?: string;
  flagActive?: string;
  createdBy?: string;
  createdDate?: Date | null;
  updatedBy?: string;
  updatedDate?: Date | null;
  profile?: string;
}
