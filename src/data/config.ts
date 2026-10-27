export type DataMode = 'deck-exact' | 'harmonized';

export interface AppConfig {
  dataMode: DataMode;
  fiscalYear: string;
  reportMonth: string;
  lastUpdated: string;
  population: string;
  totalWards: number;
}

export const APP_CONFIG: AppConfig = {
  dataMode: 'deck-exact',
  fiscalYear: 'FY 2024-25',
  reportMonth: 'May 2024',
  lastUpdated: '10:30 AM',
  population: '6,10,000',
  totalWards: 66,
};
