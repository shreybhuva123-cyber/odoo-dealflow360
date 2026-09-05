export type CustomerTier = 'ENTERPRISE' | 'MID_MARKET' | 'GROWTH' | 'STANDARD' | 'SMB';

export interface CustomerContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roleTitle?: string;
  isPrimary: boolean;
}

export interface CreditProfile {
  creditLimit: number;
  availableCredit: number;
  paymentTerms: string; // e.g. "NET30", "NET60", "IMMEDIATE"
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  overdueBalance: number;
}

export interface Customer {
  id: string;
  companyName: string;
  industry: string;
  tier: CustomerTier;
  contacts: CustomerContact[];
  creditProfile: CreditProfile;
  accountManagerId: string;
  country: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
