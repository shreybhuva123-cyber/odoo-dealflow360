export type SearchResultType =
  | 'DEAL'
  | 'QUOTATION'
  | 'CUSTOMER'
  | 'PRODUCT'
  | 'INVOICE'
  | 'COMMAND';

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: 'blue' | 'purple' | 'green' | 'amber' | 'rose' | 'gray';
  route: string;
  meta?: Record<string, any>;
}

export interface CommandItem {
  id: string;
  title: string;
  shortcut?: string;
  icon: string;
  category: 'ACTIONS' | 'NAVIGATION' | 'SETTINGS';
  action: () => void;
}
