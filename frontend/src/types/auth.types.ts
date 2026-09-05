export type Role = 
  | 'ADMIN' 
  | 'SALES_MANAGER' 
  | 'SALES_REP' 
  | 'WAREHOUSE_OPS' 
  | 'FINANCE' 
  | 'CUSTOMER';

export type Permission = 
  | 'quotations:read'
  | 'quotations:create'
  | 'quotations:edit'
  | 'quotations:delete'
  | 'quotations:approve'
  | 'quotations:send'
  | 'approvals:manage'
  | 'customers:read'
  | 'customers:write'
  | 'products:read'
  | 'products:write'
  | 'inventory:read'
  | 'inventory:allocate'
  | 'billing:manage'
  | 'subscriptions:manage'
  | 'reports:read'
  | 'admin:settings'
  | 'portal:access';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  permissions: Permission[];
  avatarUrl?: string;
  department?: string;
  salesTeamId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}
