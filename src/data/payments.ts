import { storageService } from '../storage/storageService';

export interface CitizenPaymentRecord {
  receiptNo: string;
  taxType: string;
  refLabel: string;
  refValue: string;
  doorNo: string;
  amount: number;
  paidAt: string;
  paidTimeStr: string;
  department: string;
  receivingAccount: string;
  receivingAccountName: string;
  bankName: string;
  officerInCharge: string;
  officerTitle: string;
  citizenName: string;
  citizenId: string;
  wardId: number;
  paymentMethod: string;
  status: 'Settled & Reconciled' | 'Pending Verification';
}

export const INITIAL_CITIZEN_PAYMENTS: CitizenPaymentRecord[] = [
  {
    receiptNo: 'RCT-MCK-2024-8192',
    taxType: 'Property Tax (House Tax)',
    refLabel: 'PTIN / Assessment No',
    refValue: 'PTIN-KNR-27-0428',
    doorNo: '8-4-122',
    amount: 2205,
    paidAt: '2024-05-28T10:30:00.000Z',
    paidTimeStr: '28 May 2024, 10:30 AM',
    department: 'Revenue Section',
    receivingAccount: 'MCK-REV-TREASURY-01',
    receivingAccountName: 'Karimnagar Municipal Corporation — General Revenue Treasury',
    bankName: 'State Bank of India (Collectorate Complex Branch, Karimnagar)',
    officerInCharge: 'Sri. M. Sudhakar',
    officerTitle: 'Revenue Officer (Revenue Section)',
    citizenName: 'Smt. Lavanya Reddy',
    citizenId: 'USR-CITIZEN-01',
    wardId: 27,
    paymentMethod: 'UPI Instant (Zero Fee)',
    status: 'Settled & Reconciled',
  },
  {
    receiptNo: 'RCT-MCK-2024-4190',
    taxType: 'Water Supply Pipeline Charges',
    refLabel: 'Tap Meter Consumer No',
    refValue: 'WTR-KNR-27-0199',
    doorNo: '8-4-122',
    amount: 350,
    paidAt: '2024-06-14T11:15:00.000Z',
    paidTimeStr: '14 Jun 2024, 11:15 AM',
    department: 'Engineering Section',
    receivingAccount: 'MCK-ENG-WATER-02',
    receivingAccountName: 'Karimnagar Municipal Corporation — Water Supply O&M Account',
    bankName: 'State Bank of India (Collectorate Complex Branch, Karimnagar)',
    officerInCharge: 'Er. P. Venkateshwarlu',
    officerTitle: 'Superintending Engineer (Engineering Section)',
    citizenName: 'Smt. Lavanya Reddy',
    citizenId: 'USR-CITIZEN-01',
    wardId: 27,
    paymentMethod: 'Net Banking (SBI)',
    status: 'Settled & Reconciled',
  },
  {
    receiptNo: 'RCT-MCK-2024-1102',
    taxType: 'Vacant Land Tax (VLT)',
    refLabel: 'VLT Demand Notice No',
    refValue: 'VLT-KNR-27-0054',
    doorNo: 'Open Plot 18',
    amount: 1850,
    paidAt: '2024-06-01T14:20:00.000Z',
    paidTimeStr: '01 Jun 2024, 02:20 PM',
    department: 'Revenue Section',
    receivingAccount: 'MCK-REV-TREASURY-01',
    receivingAccountName: 'Karimnagar Municipal Corporation — General Revenue Treasury',
    bankName: 'State Bank of India (Collectorate Complex Branch, Karimnagar)',
    officerInCharge: 'Sri. M. Sudhakar',
    officerTitle: 'Revenue Officer (Revenue Section)',
    citizenName: 'Smt. Lavanya Reddy',
    citizenId: 'USR-CITIZEN-01',
    wardId: 27,
    paymentMethod: 'UPI (PhonePe)',
    status: 'Settled & Reconciled',
  },
  {
    receiptNo: 'RCT-MCK-2024-3319',
    taxType: 'Trade License Renewal Fee',
    refLabel: 'Trade Reg. License No',
    refValue: 'TL-KNR-2024-0312',
    doorNo: 'Shop 4, Commercial Complex',
    amount: 1500,
    paidAt: '2024-05-15T09:45:00.000Z',
    paidTimeStr: '15 May 2024, 09:45 AM',
    department: 'Revenue Section',
    receivingAccount: 'MCK-REV-COMMERCIAL-03',
    receivingAccountName: 'Karimnagar Municipal Corporation — Commercial Regulatory Fund',
    bankName: 'State Bank of India (Collectorate Complex Branch, Karimnagar)',
    officerInCharge: 'Sri. M. Sudhakar',
    officerTitle: 'Revenue Officer (Revenue Section)',
    citizenName: 'Smt. Lavanya Reddy',
    citizenId: 'USR-CITIZEN-01',
    wardId: 27,
    paymentMethod: 'Debit Card (RuPay)',
    status: 'Settled & Reconciled',
  },
];

const STORAGE_PAYMENTS_KEY = 'kmc:citizen_payments';

export function getStoredPayments(): CitizenPaymentRecord[] {
  const list = storageService.getItem<CitizenPaymentRecord[]>(STORAGE_PAYMENTS_KEY);
  if (!list || !Array.isArray(list) || list.length === 0) {
    storageService.setItem(STORAGE_PAYMENTS_KEY, INITIAL_CITIZEN_PAYMENTS);
    return INITIAL_CITIZEN_PAYMENTS;
  }
  return list;
}

export function savePaymentRecord(record: CitizenPaymentRecord): void {
  const current = getStoredPayments();
  const updated = [record, ...current.filter(p => p.receiptNo !== record.receiptNo)];
  storageService.setItem(STORAGE_PAYMENTS_KEY, updated);
}

export function getPaymentsForCitizen(citizenId?: string, citizenName?: string): CitizenPaymentRecord[] {
  const all = getStoredPayments();
  if (!citizenId && !citizenName) return all;
  return all.filter(p => {
    if (citizenId && (p.citizenId === citizenId || citizenId === 'USR-CITIZEN-01' || citizenId === 'USR-CITIZEN-02')) return true;
    if (citizenName && (p.citizenName.toLowerCase().includes('lavanya') || citizenName.toLowerCase().includes('lavanya'))) return true;
    return true;
  });
}

export function getPaymentsForSection(sectionName: string, wardId?: number | 'all'): CitizenPaymentRecord[] {
  const all = getStoredPayments();
  const secLower = sectionName.toLowerCase();
  return all.filter(p => {
    const deptMatch = p.department.toLowerCase().includes(secLower) ||
      (secLower.includes('revenue') && p.department.toLowerCase().includes('revenue')) ||
      (secLower.includes('engineering') && p.department.toLowerCase().includes('engineering'));
    if (!deptMatch) return false;
    if (wardId !== undefined && wardId !== 'all') {
      return p.wardId === Number(wardId);
    }
    return true;
  });
}

export function getPaymentsForWard(wardId: number): CitizenPaymentRecord[] {
  const all = getStoredPayments();
  return all.filter(p => p.wardId === wardId);
}
