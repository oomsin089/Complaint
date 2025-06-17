export interface IUserResponse {
  userId: number;
  username: string;
  employeeCode: string | null;
  firstName: string | null;
  lastName: string | null;
  jobTitle: string | null;
  roleId: number;
  roleName: string | null;
  permissionCode: string | null;
  identityCode: string | null;
}
