import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle2, LocateFixed, Lightbulb, Loader2, AlertCircle, MessageSquareText, ShieldCheck,
  CreditCard, FileText, Megaphone, Receipt, Building2, Banknote, Download, ArrowRight, Check,
  Construction, Trash2, HeartPulse, UserCheck, RefreshCw, Smartphone, ChevronRight, Landmark, UserCheck2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../auth/AuthContext';
import { isQaInspectionActive } from '../../auth/qaInspection';
import { usePrefs } from '../../i18n';
import { useToast } from '../../ui/Toast';
import { storageService } from '../../storage/storageService';
import {
  PROBLEM_CATEGORIES, ProblemCategory,
  MCK_DEPARTMENT_CATEGORIES, MCKDepartmentCategory
} from '../../data/categories';
import { DepartmentName } from '../../data/grievances';
import { savePaymentRecord } from '../../data/payments';
import { storePhotos, resolvePhoto } from '../../photos/photoStore';
import { wardCoords } from '../../photos/geo';
import { PhotoPicker } from '../../components/photos/PhotoPicker';
import { CitizenLayout } from './CitizenLayout';
import { SearchableSelect } from '../../components/common/SearchableSelect';
import { FullImagePreview } from '../../components/common/FullImagePreview';

const STEP_KEYS = ['report.stepChoose', 'report.stepPhoto', 'report.stepLocation', 'report.stepReview'];

// Tax & Utility Bills Master Data for MCK
const MCK_BILLS = [
  {
    id: 'property_tax',
    title: 'Property Tax (House Tax)',
    department: 'Revenue Section',
    refLabel: 'PTIN / Assessment No',
    refValue: 'PTIN-KNR-27-0428',
    doorNo: '8-4-122',
    address: 'Plot 42, Green Park Colony, Ward 27',
    owner: 'Smt. Lavanya Reddy',
    annualAmount: 2450,
    rebateAmount: 245,
    rebateLabel: '10% Early Bird Rebate (Scheme 2024-25)',
    netPayable: 2205,
    dueDate: '31 May 2024',
    badge: 'Due for 2024-25',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    receivingAccount: {
      accountName: 'Karimnagar Municipal Corporation — General Revenue Treasury',
      accountNumber: 'MCK-REV-TREASURY-01',
      bankName: 'State Bank of India (Collectorate Complex Branch, Karimnagar)',
      ifsc: 'SBIN0020152',
      officerInCharge: 'Sri. M. Sudhakar',
      officerTitle: 'Revenue Officer (Revenue Section)',
      supervisor: 'Sri. V. Murali Krishna, IAS (Municipal Commissioner)',
      fundAllocation: 'City civic development, sanitation staff payroll, and ward infrastructure maintenance.',
    },
  },
  {
    id: 'vlt',
    title: 'Vacant Land Tax (VLT)',
    department: 'Revenue Section',
    refLabel: 'VLT Demand Notice No',
    refValue: 'VLT-KNR-27-0054',
    doorNo: 'Open Plot 18',
    address: 'Sector 3, Green Park Colony, Ward 27',
    owner: 'Smt. Lavanya Reddy',
    annualAmount: 1850,
    rebateAmount: 0,
    netPayable: 1850,
    dueDate: '30 Jun 2024',
    badge: 'Annual Demand',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    receivingAccount: {
      accountName: 'Karimnagar Municipal Corporation — General Revenue Treasury',
      accountNumber: 'MCK-REV-TREASURY-01',
      bankName: 'State Bank of India (Collectorate Complex Branch, Karimnagar)',
      ifsc: 'SBIN0020152',
      officerInCharge: 'Sri. M. Sudhakar',
      officerTitle: 'Revenue Officer (Revenue Section)',
      supervisor: 'Sri. V. Murali Krishna, IAS (Municipal Commissioner)',
      fundAllocation: 'Municipal revenue evaluations, layout demarcation, and urban greening funds.',
    },
  },
  {
    id: 'water_charges',
    title: 'Water Supply Pipeline Charges',
    department: 'Engineering Section',
    refLabel: 'Tap Meter Consumer No',
    refValue: 'WTR-KNR-27-0199',
    doorNo: '8-4-122',
    address: 'Green Park Colony, Ward 27',
    owner: 'Smt. Lavanya Reddy',
    annualAmount: 350,
    rebateAmount: 0,
    netPayable: 350,
    dueDate: '15 Jun 2024',
    badge: 'Monthly Domestic',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    receivingAccount: {
      accountName: 'Karimnagar Municipal Corporation — Water Supply O&M Account',
      accountNumber: 'MCK-ENG-WATER-02',
      bankName: 'State Bank of India (Collectorate Complex Branch, Karimnagar)',
      ifsc: 'SBIN0020152',
      officerInCharge: 'Er. P. Venkateshwarlu',
      officerTitle: 'Superintending Engineer (Engineering Section)',
      supervisor: 'Sri. V. Murali Krishna, IAS (Municipal Commissioner)',
      fundAllocation: 'Lower Manair Dam (LMD) water filtration, chlorination chemicals, pumping electricity, and pipeline maintenance.',
    },
  },
  {
    id: 'trade_license',
    title: 'Trade License Renewal Fee',
    department: 'Revenue Section',
    refLabel: 'Trade Reg. License No',
    refValue: 'TL-KNR-2024-0312',
    doorNo: 'Shop 4, Main Commercial Complex',
    address: 'Ward 27, Karimnagar',
    owner: 'Smt. Lavanya Reddy',
    annualAmount: 1500,
    rebateAmount: 0,
    netPayable: 1500,
    dueDate: '30 Jun 2024',
    badge: 'Commercial Permit',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    receivingAccount: {
      accountName: 'Karimnagar Municipal Corporation — Commercial Revenue Fund',
      accountNumber: 'MCK-REV-COMMERCIAL-03',
      bankName: 'State Bank of India (Collectorate Complex Branch, Karimnagar)',
      ifsc: 'SBIN0020152',
      officerInCharge: 'Sri. M. Sudhakar',
      officerTitle: 'Revenue Officer (Revenue Section)',
      supervisor: 'Sri. V. Murali Krishna, IAS (Municipal Commissioner)',
      fundAllocation: 'Commercial zone regulation, market complex sanitation, and business licensing administration.',
    },
  },
];

// Certificates & Citizen Schemes Master Data
const MCK_CERTIFICATES = [
  {
    id: 'birth_cert',
    title: 'Digital Birth Certificate (QR Hologram)',
    department: 'Statistics / Birth & Death Registration Section',
    description: 'Issuance of digitally signed, bilingual civil birth certificate with verifiable QR code.',
    fee: '₹50 (Statutory Search & Issuance)',
    sla: '48 Hours',
    slaHours: 48,
    icon: FileText,
    assignedOfficer: 'Sri. B. Anjaneyulu',
    officerRole: 'Civil Registrar & Statistical Officer',
    officeLocation: 'Room 104, Ground Floor, MCK Head Office, Collectorate Road',
    workflow: 'Hospital civil registry cross-verification → Digital signing by Civil Registrar → Bilingual tamper-proof QR certificate issuance.',
  },
  {
    id: 'death_cert',
    title: 'Death Registration Certificate',
    department: 'Statistics / Birth & Death Registration Section',
    description: 'Official death register entry certificate with hospital verification and digital seal.',
    fee: '₹50 (Statutory Search & Issuance)',
    sla: '48 Hours',
    slaHours: 48,
    icon: FileText,
    assignedOfficer: 'Sri. B. Anjaneyulu',
    officerRole: 'Civil Registrar & Statistical Officer',
    officeLocation: 'Room 104, Ground Floor, MCK Head Office, Collectorate Road',
    workflow: 'Hospital / Crematorium death register cross-matching → Civil Registrar verification → Tamper-proof QR digital certificate issuance.',
  },
  {
    id: 'building_perm',
    title: 'Building Permission (TG-bPASS Instant / Regular)',
    department: 'Town Planning Section (TPS)',
    description: 'Instant self-certification for plots up to 75 sq. yards; single-window clearance for residential layouts.',
    fee: 'As per municipal schedule',
    sla: '72 Hours',
    slaHours: 72,
    icon: Building2,
    assignedOfficer: 'Smt. D. Vani',
    officerRole: 'City Planner (Town Planning Section - TPS)',
    officeLocation: 'Room 202, 2nd Floor, MCK Head Office, Collectorate Road',
    workflow: 'TG-bPASS plot coordinates scrutiny → Ward Town Planning Inspector ground check → Building Permit Order clearance.',
  },
  {
    id: 'asara_pension',
    title: 'Asara Social Security Pension Application',
    department: 'Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)',
    description: 'Direct Benefit Transfer (DBT) monthly financial support for eligible senior citizens, widows, and persons with disabilities.',
    fee: 'Free of Cost (State Scheme)',
    sla: '72 Hours',
    slaHours: 72,
    icon: HeartPulse,
    assignedOfficer: 'Smt. K. Madhavi',
    officerRole: 'Project Director (MEPMA & Asara Welfare Section)',
    officeLocation: 'Room 305, 3rd Floor, MCK Annex Building, Collectorate Road',
    workflow: 'Slum Level Federation (SLF) scrutiny → Community Organizer (CO) field check → Direct Benefit Transfer (DBT) enrollment.',
  },
  {
    id: 'mepma_shg',
    title: 'MEPMA Mahila SHG Revolving Fund Subsidy',
    department: 'Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)',
    description: 'Bank linkage interest subvention and revolving fund assistance for urban women Self-Help Groups.',
    fee: 'Free of Cost (MEPMA Mission)',
    sla: '72 Hours',
    slaHours: 72,
    icon: HeartPulse,
    assignedOfficer: 'Smt. K. Madhavi',
    officerRole: 'Project Director (MEPMA & Asara Welfare Section)',
    officeLocation: 'Room 305, 3rd Floor, MCK Annex Building, Collectorate Road',
    workflow: 'Town Level Federation (TLF) evaluation → Lead Bank Manager credit linkage → Revolving fund grant release.',
  },
  {
    id: 'street_vendor',
    title: 'PM SVANidhi Urban Street Vendor ID & Certificate',
    department: 'Urban Welfare / Poverty Alleviation Section (MEPMA & Asara)',
    description: 'Official street vending identity badge and collateral-free micro-credit bank linkage.',
    fee: 'Free of Cost (Urban Livelihoods)',
    sla: '48 Hours',
    slaHours: 48,
    icon: UserCheck,
    assignedOfficer: 'Smt. K. Madhavi',
    officerRole: 'Project Director (MEPMA & Asara Welfare Section)',
    officeLocation: 'Room 305, 3rd Floor, MCK Annex Building, Collectorate Road',
    workflow: 'Street vendor biometric verification → Issuance of official QR vending badge → Bank micro-credit sanction.',
  },
];

/**
 * Citizen Services, Online Tax & Bill Payments, and Grievance Wizard
 * Empowers residents to settle municipal taxes/bills, apply for certificates, and report grievances across MCK's 7 Core Departments.
 */
export const ReportWizard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { submitGrievance, wards } = useApp();
  const { currentUser } = useAuth();
  const { t } = usePrefs();
  const { toast } = useToast();

  const homeWard = currentUser?.assignedWardIds?.[0] || 27;

  // Initialize serviceMode from URL query params or default to grievance
  const initialMode = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const m = params.get('mode');
    if (m === 'payment' || m === 'certificate' || m === 'grievance') return m;
    return 'grievance';
  }, [location.search]);

  const [serviceMode, setServiceMode] = useState<'grievance' | 'payment' | 'certificate'>(initialMode);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const m = params.get('mode');
    if (m === 'payment' || m === 'certificate' || m === 'grievance') {
      setServiceMode(m);
    }
  }, [location.search]);

  // 1. Grievance Redressal Flow State
  const [step, setStep] = useState(0);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('engineering');
  const [selectedDept, setSelectedDept] = useState<MCKDepartmentCategory>(() => MCK_DEPARTMENT_CATEGORIES[0]);
  const [category, setCategory] = useState<ProblemCategory | null>(() => ({
    key: MCK_DEPARTMENT_CATEGORIES[0].subcategories[0].key,
    category: MCK_DEPARTMENT_CATEGORIES[0].subcategories[0].label,
    department: MCK_DEPARTMENT_CATEGORIES[0].department,
    slaHours: MCK_DEPARTMENT_CATEGORIES[0].subcategories[0].slaHours,
    icon: MCK_DEPARTMENT_CATEGORIES[0].icon,
  }));
  const [photos, setPhotos] = useState<string[]>([]);
  const [wardId, setWardId] = useState(homeWard);
  const [landmark, setLandmark] = useState('');
  const [note, setNote] = useState('');
  const [located, setLocated] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ id: string; time: string } | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // 2. Tax & Bill Payment Flow State
  const [selectedBill, setSelectedBill] = useState(MCK_BILLS[0]);
  const [paymentStep, setPaymentStep] = useState<0 | 1 | 2>(0);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'netbanking' | 'card'>('upi');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<{
    receiptNo: string;
    amount: number;
    time: string;
    taxType: string;
    refNo: string;
    receivingAccount?: {
      accountName: string;
      accountNumber: string;
      bankName: string;
      ifsc: string;
      officerInCharge: string;
      officerTitle: string;
      supervisor: string;
      fundAllocation: string;
    };
  } | null>(null);

  // 3. Certificates & Welfare Schemes State
  const [selectedCert, setSelectedCert] = useState(MCK_CERTIFICATES[0]);
  const [certStep, setCertStep] = useState<0 | 1 | 2>(0);
  const [applicantAadhaar, setApplicantAadhaar] = useState('XXXX-XXXX-4812');
  const [applicantPhone, setApplicantPhone] = useState('+91 98490 27001');
  const [certResult, setCertResult] = useState<{
    ackNo: string;
    time: string;
    scheme: string;
    department: string;
    sla: string;
    assignedOfficer?: string;
    officerRole?: string;
    officeLocation?: string;
    workflow?: string;
  } | null>(null);

  // Handlers for 7 Core MCK Departments Selection
  const handleSelectDepartment = (dept: MCKDepartmentCategory) => {
    setSelectedDeptId(dept.id);
    setSelectedDept(dept);
    const primarySub = dept.subcategories[0];
    setCategory({
      key: primarySub.key,
      category: primarySub.label,
      department: dept.department,
      slaHours: primarySub.slaHours,
      icon: dept.icon,
    });
    setError(null);
    setTimeout(() => {
      const el = document.getElementById('department-subcategories-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleSelectBill = (b: (typeof MCK_BILLS)[0]) => {
    setSelectedBill(b);
    setTimeout(() => {
      const el = document.getElementById('bill-demand-breakdown');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('ring-4', 'ring-emerald-500/30');
        setTimeout(() => el.classList.remove('ring-4', 'ring-emerald-500/30'), 1500);
      }
    }, 50);
  };

  const handleSelectCert = (c: (typeof MCK_CERTIFICATES)[0]) => {
    setSelectedCert(c);
    setTimeout(() => {
      const el = document.getElementById('cert-action-bar');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const handleSelectSubcategory = (dept: MCKDepartmentCategory, sub: { key: string; label: string; slaHours: number }) => {
    setSelectedDeptId(dept.id);
    setSelectedDept(dept);
    setCategory({
      key: sub.key,
      category: sub.label,
      department: dept.department,
      slaHours: sub.slaHours,
      icon: dept.icon,
    });
    setError(null);
  };

  // Move focus to heading on step transitions
  useEffect(() => {
    headingRef.current?.focus();
  }, [step, done, paymentStep, certStep]);

  const ward = wards.find((w) => w.id === wardId);
  const place = `${landmark.trim() || located || ''}${ward ? `, Ward ${ward.id} – ${ward.name}` : ''}`.replace(/^, /, '');
  const categoryLabel = category ? (category.category || t(`report.cat.${category.key}`)) : '';

  const useMyLocation = () => {
    setLocating(true);
    setError(null);
    setTimeout(() => {
      const home = wards.find((w) => w.id === homeWard);
      setWardId(homeWard);
      const spot = homeWard === 27 ? 'Green Park Colony main road' : `${home?.name || `Ward ${homeWard}`} main road`;
      setLocated(spot);
      if (!landmark.trim()) setLandmark(spot);
      setLocating(false);
    }, 700);
  };

  const next = () => {
    setError(null);
    if (step === 0 && !category) return setError(t('report.pickCategory'));
    if (step === 2 && !landmark.trim() && !located) return setError(t('report.landmarkNeeded'));
    setStep((s) => Math.min(3, s + 1));
  };

  const back = () => {
    setError(null);
    if (step === 0) navigate('/citizen/portal');
    else setStep((s) => s - 1);
  };

  const submit = () => {
    if (!category) return;
    setSending(true);
    const coords = wardCoords(wardId);
    const stored = storePhotos(photos, place, coords.lat, coords.lng);
    if (!stored.ok) {
      setSending(false);
      setError(t('photoError.quota'));
      return;
    }
    const created = submitGrievance(
      {
        citizenId: currentUser?.role === 'citizen' ? currentUser.id : 'USR-CITIZEN-01',
        category: category.category,
        department: category.department,
        description: note.trim() || `${category.category} problem reported by citizen`,
        location: place,
        wardId,
        slaHours: category.slaHours,
        latitude: coords.lat,
        longitude: coords.lng,
        beforePhotos: stored.photos,
      },
      currentUser?.displayName
    );
    setSending(false);
    setDone({ id: created.id, time: created.reportedOn });
    toast(t('success.title'));
  };

  // Payment Execution Simulator
  const handleExecutePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      const receiptNo = `RCT-MCK-2024-${Math.floor(1000 + Math.random() * 9000)}`;
      const res = {
        receiptNo,
        amount: selectedBill.netPayable,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        taxType: selectedBill.title,
        refNo: selectedBill.refValue,
        receivingAccount: selectedBill.receivingAccount,
      };

      // Persist payment to local storage for citizen records
      try {
        savePaymentRecord({
          receiptNo,
          taxType: selectedBill.title,
          refLabel: selectedBill.refLabel,
          refValue: selectedBill.refValue,
          doorNo: selectedBill.doorNo,
          amount: selectedBill.netPayable,
          paidAt: new Date().toISOString(),
          paidTimeStr: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          department: selectedBill.department,
          receivingAccount: selectedBill.receivingAccount.accountNumber,
          receivingAccountName: selectedBill.receivingAccount.accountName,
          bankName: selectedBill.receivingAccount.bankName,
          officerInCharge: selectedBill.receivingAccount.officerInCharge,
          officerTitle: selectedBill.receivingAccount.officerTitle,
          citizenName: 'Smt. Lavanya Reddy',
          citizenId: currentUser?.id || 'USR-CITIZEN-01',
          wardId: 27,
          paymentMethod: paymentMethod === 'upi' ? 'UPI Instant (Zero Fee)' : paymentMethod === 'netbanking' ? 'Net Banking' : 'Card Payment',
          status: 'Settled & Reconciled',
        });
      } catch (err) {
        console.warn('Failed to save payment history to local storage', err);
      }

      setPaymentSuccess(res);
      setPaymentStep(2);
      toast('Payment Successful! Official MCK Receipt Generated.');
    }, 1200);
  };

  // Certificate Application Submission Simulator
  const handleExecuteCertificateApply = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);

      // Submit into KMC Grievances/Applications Repository so designated officer receives it in their queue
      const created = submitGrievance(
        {
          citizenId: currentUser?.role === 'citizen' ? currentUser.id : 'USR-CITIZEN-01',
          citizenName: 'Smt. Lavanya Reddy',
          category: selectedCert.title,
          department: selectedCert.department as DepartmentName,
          assignedTo: selectedCert.assignedOfficer,
          description: `Citizen Application for ${selectedCert.title}. Applicant: Smt. Lavanya Reddy (Aadhaar: ${applicantAadhaar}, Mobile: ${applicantPhone}). Assigned to ${selectedCert.assignedOfficer} (${selectedCert.officerRole}) for civil verification and digital seal.`,
          location: 'Ward 27 – Green Park Colony',
          wardId: 27,
          slaHours: selectedCert.slaHours,
          latitude: 18.4386,
          longitude: 79.1288,
          beforePhotos: [],
        },
        'Smt. Lavanya Reddy'
      );

      const res = {
        ackNo: created.id,
        time: created.reportedOn || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        scheme: selectedCert.title,
        department: selectedCert.department,
        sla: selectedCert.sla,
        assignedOfficer: selectedCert.assignedOfficer,
        officerRole: selectedCert.officerRole,
        officeLocation: selectedCert.officeLocation,
        workflow: selectedCert.workflow,
      };
      setCertResult(res);
      setCertStep(2);
      toast('Application submitted successfully to municipal records.');
    }, 1000);
  };

  // ---------------------------------------------------------------------------
  // SCREEN: Grievance Success Confirmation
  // ---------------------------------------------------------------------------
  if (done && serviceMode === 'grievance') {
    return (
      <CitizenLayout title={t('report.title')}>
        <div className="bg-white rounded-2xl border-2 border-emerald-300 shadow-card p-6 text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-700 mx-auto" aria-hidden="true" />
          <h2 ref={headingRef} tabIndex={-1} className="mt-3 text-2xl font-bold font-body tracking-normal outline-none">{t('success.title')}</h2>
          <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-4">
              <dt className="text-sm font-semibold text-slate-600">{t('success.idLabel')}</dt>
              <dd className="text-2xl font-bold font-mono text-kmc-navy mt-1" data-testid="complaint-id">{done.id}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-4">
              <dt className="text-sm font-semibold text-slate-600">{t('success.time')}</dt>
              <dd className="text-lg font-bold mt-1">{done.time}</dd>
            </div>
          </dl>
          <div className="mt-5 rounded-xl bg-blue-50 border-2 border-blue-200 p-4 text-left">
            <p className="text-base font-bold text-blue-950">{t('success.nextTitle')}</p>
            <p className="text-base text-blue-950 mt-1">{t('success.nextText')}</p>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => navigate(`/citizen/track/${encodeURIComponent(done.id)}`)}
              className="w-full min-h-[52px] rounded-xl bg-kmc-navy text-white text-base font-bold"
            >
              {t('success.track')}
            </button>
            <button
              type="button"
              onClick={() => {
                setDone(null);
                setStep(0);
                setPhotos([]);
                setNote('');
                setLandmark('');
              }}
              className="w-full min-h-[52px] rounded-xl border-2 border-slate-300 bg-white text-base font-bold"
            >
              {t('success.another')}
            </button>
          </div>
        </div>
      </CitizenLayout>
    );
  }

  return (
    <CitizenLayout title={t("Citizen Services, Bill Payments & Grievances")}>
      <div className="max-w-4xl mx-auto w-full">

        {/* =================================================================== */}
        {/* Top Header: 3 Civic Functionalities of Municipal Governance         */}
        {/* =================================================================== */}
        <section className="bg-gradient-to-r from-kmc-navy via-slate-900 to-kmc-navy-dark rounded-2xl p-5 sm:p-6 text-white shadow-lg mb-6 border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                {t("Karimnagar Municipal Corporation (MCK) Citizen Portal")}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold font-heading uppercase text-white mt-0.5 tracking-tight">
                {serviceMode === 'payment' && t("Pay Municipal Taxes & Utility Bills")}
                {serviceMode === 'certificate' && t("Citizen Services, Certificates & Welfare")}
                {serviceMode === 'grievance' && t("Report a Civic Problem / Grievance")}
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                {serviceMode === 'payment' && t("Pay Property Tax (House Tax), Vacant Land Tax (VLT), and water charges online with instant receipts.")}
                {serviceMode === 'certificate' && t("Apply for unified QR digital birth/death certificates, TG-bPASS building permissions, and Asara pensions.")}
                {serviceMode === 'grievance' && t("Lodge civic grievances with photo evidence and GPS coordinates across the 7 Core Departments of MCK.")}
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-white/10 border border-white/20 text-amber-300 px-3 py-1 rounded-lg self-start sm:self-auto shrink-0">
              {t("Ward 27 · Green Park Colony")}
            </span>
          </div>

          {/* 3 Main Civic Mode Switcher Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-white/15">
            <button
              type="button"
              onClick={() => {
                setServiceMode('payment');
                setPaymentStep(0);
                setPaymentSuccess(null);
              }}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                serviceMode === 'payment'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold ring-1 ring-emerald-300'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>{t("Pay Taxes & Bills")}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setServiceMode('certificate');
                setCertStep(0);
                setCertResult(null);
              }}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                serviceMode === 'certificate'
                  ? 'bg-blue-500 text-white shadow-md font-extrabold ring-1 ring-blue-300'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>{t("Certificates & Schemes")}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setServiceMode('grievance');
                setStep(0);
                setDone(null);
              }}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                serviceMode === 'grievance'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold ring-1 ring-amber-300'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Megaphone className="w-4 h-4 shrink-0" />
              <span>{t("Report a Civic Problem")}</span>
            </button>
          </div>
        </section>

        {/* =================================================================== */}
        {/* MODE 1: PAY MUNICIPAL TAXES & UTILITY BILLS                         */}
        {/* =================================================================== */}
        {serviceMode === 'payment' && (
          <div className="space-y-6">
            {paymentStep === 0 && (
              <section className="bg-white rounded-2xl border-2 border-slate-200 shadow-card p-5 sm:p-6 space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[11px] uppercase font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                    {t("Revenue & Engineering Section · Online Bill Desk")}
                  </span>
                  <h2 ref={headingRef} tabIndex={-1} className="mt-1 text-2xl font-bold font-heading text-slate-900 outline-none uppercase tracking-tight">
                    {t("Select Tax or Municipal Bill to Settle")}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {t("Verify your property assessment, vacant land tax, or water charges and pay directly with zero convenience fees.")}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MCK_BILLS.map((b) => {
                    const isSelected = selectedBill.id === b.id;
                    return (
                      <div
                        key={b.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSelectBill(b)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectBill(b);
                          }
                        }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500 scale-[1.01]'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {b.department}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${b.badgeColor}`}>
                              {b.badge}
                            </span>
                          </div>
                          <h3 className="text-base font-bold font-heading text-slate-900">
                            {t(b.title)}
                          </h3>
                          <div className="mt-2 space-y-1 text-xs text-slate-600">
                            <p><span className="text-slate-400">{b.refLabel}:</span> <strong className="font-mono text-slate-900">{b.refValue}</strong></p>
                            <p><span className="text-slate-400">{t("Door No")}:</span> <strong>{b.doorNo}</strong></p>
                            <p><span className="text-slate-400">{t("Owner")}:</span> <strong>{b.owner}</strong></p>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("Net Payable")}</span>
                            <span className="text-lg font-bold font-mono text-emerald-800">₹{b.netPayable.toLocaleString()}</span>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {isSelected ? t("Selected") : t("Select Bill")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bill Details Summary Card */}
                <div id="bill-demand-breakdown" className="scroll-mt-24 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 transition-all">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold uppercase text-slate-700">{t("Assessment & Demand Breakdown")}</span>
                    <span className="text-xs font-mono font-bold text-kmc-navy">{selectedBill.refValue}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">{t("Assessment Demand")}</span>
                      <strong className="text-sm font-mono text-slate-900">₹{selectedBill.annualAmount}</strong>
                    </div>
                    {selectedBill.rebateAmount > 0 && (
                      <div>
                        <span className="text-emerald-600 font-bold block">{t("Early Bird Rebate (10%)")}</span>
                        <strong className="text-sm font-mono text-emerald-700">-₹{selectedBill.rebateAmount}</strong>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400 block">{t("Due Date")}</span>
                      <strong className="text-sm text-slate-900">{selectedBill.dueDate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t("Total Payable Amount")}</span>
                      <strong className="text-base font-mono text-emerald-800 font-extrabold">₹{selectedBill.netPayable}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/citizen/portal')}
                    className="min-h-[48px] px-5 rounded-xl border-2 border-slate-300 font-bold text-sm text-slate-700"
                  >
                    {t("Back to Portal")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStep(1)}
                    className="flex-1 min-h-[48px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <span>{t("Proceed to Settle Bill (₹{{amt}})", { amt: selectedBill.netPayable })}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </section>
            )}

            {paymentStep === 1 && (
              <section className="bg-white rounded-2xl border-2 border-slate-200 shadow-card p-5 sm:p-6 space-y-5">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                      {t("Step 2 of 2: Secure Payment Gateway")}
                    </span>
                    <h2 ref={headingRef} tabIndex={-1} className="mt-1 text-2xl font-bold font-heading text-slate-900 outline-none uppercase tracking-tight">
                      {t("Choose Payment Method")}
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">{t("Amount Due")}</span>
                    <span className="text-xl font-mono font-bold text-emerald-700">₹{selectedBill.netPayable}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'upi' ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                        UPI
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-slate-900">{t("UPI Instant Payment (Zero Fee)")}</span>
                        <span className="block text-xs text-slate-500">{t("Google Pay, PhonePe, Paytm, BHIM or any UPI App")}</span>
                      </div>
                    </div>
                    <input type="radio" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="w-4 h-4 text-emerald-600" />
                  </label>

                  <label
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'netbanking' ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                        NET
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-slate-900">{t("Internet Banking")}</span>
                        <span className="block text-xs text-slate-500">{t("SBI, HDFC, ICICI, Telangana Grameena Bank, Axis & 50+ Banks")}</span>
                      </div>
                    </div>
                    <input type="radio" checked={paymentMethod === 'netbanking'} onChange={() => setPaymentMethod('netbanking')} className="w-4 h-4 text-emerald-600" />
                  </label>

                  <label
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'card' ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                        CARD
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-slate-900">{t("Debit / Credit Card")}</span>
                        <span className="block text-xs text-slate-500">{t("RuPay, Visa, MasterCard")}</span>
                      </div>
                    </div>
                    <input type="radio" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-4 h-4 text-emerald-600" />
                  </label>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentStep(0)}
                    className="min-h-[48px] px-5 rounded-xl border-2 border-slate-300 font-bold text-sm text-slate-700"
                  >
                    {t("Back to Bill Selection")}
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={handleExecutePayment}
                    className="flex-1 min-h-[48px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-70"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{t("Processing Municipal Settlement…")}</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        <span>{t("Pay ₹{{amt}} & Generate Official Receipt", { amt: selectedBill.netPayable })}</span>
                      </>
                    )}
                  </button>
                </div>
              </section>
            )}

            {paymentStep === 2 && paymentSuccess && (
              <section className="bg-white rounded-2xl border-2 border-emerald-300 shadow-card p-6 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    {t("Official Municipal Payment Receipt")}
                  </span>
                  <h2 ref={headingRef} tabIndex={-1} className="mt-2 text-2xl font-bold font-heading text-slate-900 uppercase">
                    {t("Payment Successfully Acknowledged!")}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t("Your municipal tax dues have been settled and reconciled in the Municipal Corporation of Karimnagar records.")}
                  </p>
                </div>

                {/* Official Receipt Card */}
                <div className="bg-slate-50 rounded-xl p-5 border-2 border-slate-200 text-left max-w-lg mx-auto space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-xs uppercase text-slate-800">KARIMNAGAR MUNICIPAL CORP.</span>
                    <span className="font-mono text-xs font-bold text-emerald-700">{paymentSuccess.receiptNo}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block">{t("Tax Head")}</span>
                      <strong className="text-slate-900">{paymentSuccess.taxType}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t("Reference No")}</span>
                      <strong className="font-mono text-slate-900">{paymentSuccess.refNo}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t("Payer Name")}</span>
                      <strong className="text-slate-900">Smt. Lavanya Reddy</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t("Ward / Door No")}</span>
                      <strong className="text-slate-900">Ward 27 · 8-4-122</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t("Amount Succeeded")}</span>
                      <strong className="text-base font-mono text-emerald-800 font-extrabold">₹{paymentSuccess.amount}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t("Payment Timestamp")}</span>
                      <strong className="text-slate-700">{paymentSuccess.time} · Paid Online</strong>
                    </div>
                  </div>

                  {paymentSuccess.receivingAccount && (
                    <div className="mt-3 pt-3 border-t border-slate-200 rounded-lg bg-emerald-50/80 p-3 border border-emerald-200 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-950 font-bold text-[11px] uppercase tracking-wide">
                        <Landmark className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{t("Municipal Treasury Credit Details")}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-emerald-800 font-semibold block">{t("Beneficiary Treasury Account:")}</span>
                          <strong className="text-slate-900 font-mono">{paymentSuccess.receivingAccount.accountNumber}</strong>
                          <p className="text-[10px] text-slate-600">{paymentSuccess.receivingAccount.accountName}</p>
                        </div>
                        <div>
                          <span className="text-emerald-800 font-semibold block">{t("Supervising Section Officer:")}</span>
                          <strong className="text-slate-900">{paymentSuccess.receivingAccount.officerInCharge}</strong>
                          <p className="text-[10px] text-slate-600">{paymentSuccess.receivingAccount.officerTitle}</p>
                        </div>
                        <div>
                          <span className="text-emerald-800 font-semibold block">{t("Bank & Branch:")}</span>
                          <p className="text-slate-700">{paymentSuccess.receivingAccount.bankName}</p>
                        </div>
                        <div>
                          <span className="text-emerald-800 font-semibold block">{t("Administrative Custodian:")}</span>
                          <p className="text-slate-700">{paymentSuccess.receivingAccount.supervisor}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-emerald-900 pt-1 border-t border-emerald-200/60">
                        <strong>{t("Allocation Purpose")}:</strong> {paymentSuccess.receivingAccount.fundAllocation}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3 max-w-lg mx-auto">
                  <button
                    type="button"
                    onClick={() => {
                      toast('Tax Receipt downloaded to device.');
                    }}
                    className="flex-1 min-h-[48px] rounded-xl bg-kmc-navy hover:bg-kmc-navy-light text-white font-bold text-sm flex items-center justify-center gap-2 shadow"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t("Download Tax Receipt (PDF)")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/citizen/portal')}
                    className="min-h-[48px] px-5 rounded-xl border-2 border-slate-300 font-bold text-sm text-slate-700"
                  >
                    {t("Back to Citizen Portal")}
                  </button>
                </div>
              </section>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* MODE 2: CITIZEN SERVICES, CERTIFICATES & WELFARE SCHEMES            */}
        {/* =================================================================== */}
        {serviceMode === 'certificate' && (
          <div className="space-y-6">
            {certStep === 0 && (
              <section className="bg-white rounded-2xl border-2 border-slate-200 shadow-card p-5 sm:p-6 space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[11px] uppercase font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                    {t("Statistics, Town Planning & Urban Welfare Section Desk")}
                  </span>
                  <h2 ref={headingRef} tabIndex={-1} className="mt-1 text-2xl font-bold font-heading text-slate-900 outline-none uppercase tracking-tight">
                    {t("Apply for Municipal Certificates & Welfare Services")}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {t("Directly request digital certificates, TG-bPASS permissions, Asara pensions, and SHG subsidies from designated sections.")}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {MCK_CERTIFICATES.map((c) => {
                    const isSelected = selectedCert.id === c.id;
                    const Icon = c.icon;
                    return (
                      <div
                        key={c.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSelectCert(c)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectCert(c);
                          }
                        }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500 scale-[1.01]'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="p-2 rounded-lg bg-slate-100 text-kmc-navy">
                              <Icon className="w-5 h-5" />
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {c.sla} SLA
                            </span>
                          </div>
                          <h3 className="text-base font-bold font-heading text-slate-900">
                            {t(c.title)}
                          </h3>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {t(c.description)}
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                          <span className="text-slate-500">{t("Fee")}: <strong>{c.fee}</strong></span>
                          <span className={`font-bold px-2.5 py-1 rounded-lg transition-colors ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {isSelected ? t("Selected") : t("Select Service")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div id="cert-action-bar" className="scroll-mt-24 pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/citizen/portal')}
                    className="min-h-[48px] px-5 rounded-xl border-2 border-slate-300 font-bold text-sm text-slate-700"
                  >
                    {t("Back to Portal")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCertStep(1)}
                    className="flex-1 min-h-[48px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <span>{t("Continue Application for {{service}}", { service: selectedCert.title })}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </section>
            )}

            {certStep === 1 && (
              <section className="bg-white rounded-2xl border-2 border-slate-200 shadow-card p-5 sm:p-6 space-y-5">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                      {t("Step 2 of 2: Applicant Information")}
                    </span>
                    <h2 ref={headingRef} tabIndex={-1} className="mt-1 text-2xl font-bold font-heading text-slate-900 outline-none uppercase tracking-tight">
                      {t(selectedCert.title)}
                    </h2>
                    <p className="text-xs text-slate-500">{t("Handled by: {{dept}}", { dept: selectedCert.department })}</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">{t("Applicant Name (As per Municipal Register)")}</label>
                    <input
                      type="text"
                      readOnly
                      value="Smt. Lavanya Reddy"
                      className="w-full min-h-[46px] rounded-xl border border-slate-300 px-3 bg-slate-50 font-semibold text-slate-900 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">{t("Aadhaar / Citizen Reference ID")}</label>
                      <input
                        type="text"
                        value={applicantAadhaar}
                        onChange={(e) => setApplicantAadhaar(e.target.value)}
                        className="w-full min-h-[46px] rounded-xl border border-slate-300 px-3 font-mono font-semibold text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">{t("Registered Mobile Number (SMS Alerts)")}</label>
                      <input
                        type="text"
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        className="w-full min-h-[46px] rounded-xl border border-slate-300 px-3 font-mono font-semibold text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">{t("Ward Jurisdiction")}</label>
                    <input
                      type="text"
                      readOnly
                      value="Ward 27 – Green Park Colony (Corporator: Sri. K. Ramesh Rao)"
                      className="w-full min-h-[46px] rounded-xl border border-slate-300 px-3 bg-slate-50 text-slate-800 text-sm"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-950">
                    <p className="font-bold mb-1">{t("Service Delivery SLA: {{sla}}", { sla: selectedCert.sla })}</p>
                    <p className="text-[11px] leading-relaxed">
                      {t("Upon submission, your application file will be assigned directly to the responsible section officer. Official SMS updates with QR download links will be transmitted automatically.")}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setCertStep(0)}
                    className="min-h-[48px] px-5 rounded-xl border-2 border-slate-300 font-bold text-sm text-slate-700"
                  >
                    {t("Back to Services")}
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={handleExecuteCertificateApply}
                    className="flex-1 min-h-[48px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-70"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{t("Submitting Application…")}</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        <span>{t("Submit Application & Generate Acknowledgement")}</span>
                      </>
                    )}
                  </button>
                </div>
              </section>
            )}

            {certStep === 2 && certResult && (
              <section className="bg-white rounded-2xl border-2 border-blue-300 shadow-card p-6 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                    {t("Official Municipal Application Lodged")}
                  </span>
                  <h2 ref={headingRef} tabIndex={-1} className="mt-2 text-2xl font-bold font-heading text-slate-900 uppercase">
                    {t("Application Submitted Successfully!")}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t("Your request has been filed in the official municipal registry. Track progress live via citizen app.")}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-5 border-2 border-slate-200 text-left max-w-lg mx-auto space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-xs uppercase text-slate-800">KARIMNAGAR MUNICIPAL CORP.</span>
                    <span className="font-mono text-xs font-bold text-blue-700">{certResult.ackNo}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block">{t("Service / Certificate")}</span>
                      <strong className="text-slate-900">{certResult.scheme}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t("Designated Section")}</span>
                      <strong className="text-slate-900">{certResult.department}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t("Applicant")}</span>
                      <strong className="text-slate-900">Smt. Lavanya Reddy</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t("Resolution SLA")}</span>
                      <strong className="font-mono text-blue-800 font-bold">{certResult.sla}</strong>
                    </div>
                  </div>

                  {certResult.assignedOfficer && (
                    <div className="mt-3 pt-3 border-t border-slate-200 rounded-lg bg-blue-50/80 p-3 border border-blue-200 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-blue-950 font-bold text-[11px] uppercase tracking-wide">
                        <UserCheck2 className="w-3.5 h-3.5 text-blue-700" />
                        <span>{t("Designated Receiving Officer & Processing Desk")}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-blue-800 font-semibold block">{t("Receiving Officer:")}</span>
                          <strong className="text-slate-900">{certResult.assignedOfficer}</strong>
                          <p className="text-[10px] text-slate-600">{certResult.officerRole}</p>
                        </div>
                        <div>
                          <span className="text-blue-800 font-semibold block">{t("Official Desk Location:")}</span>
                          <p className="text-slate-700">{certResult.officeLocation}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-blue-900 pt-1 border-t border-blue-200/60">
                        <strong>{t("Verification Workflow")}:</strong> {certResult.workflow}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{t("Dispatched to officer queue · Trackable across Section and Leadership dashboards")}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3 max-w-lg mx-auto">
                  <button
                    type="button"
                    onClick={() => navigate('/citizen/track')}
                    className="flex-1 min-h-[48px] rounded-xl bg-kmc-navy hover:bg-kmc-navy-light text-white font-bold text-sm flex items-center justify-center gap-2 shadow"
                  >
                    <span>{t("Track Application Live")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/citizen/portal')}
                    className="min-h-[48px] px-5 rounded-xl border-2 border-slate-300 font-bold text-sm text-slate-700"
                  >
                    {t("Back to Citizen Portal")}
                  </button>
                </div>
              </section>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* MODE 3: REPORT A CIVIC PROBLEM / GRIEVANCE (7 MCK SECTIONS)         */}
        {/* =================================================================== */}
        {serviceMode === 'grievance' && (
          <div>
            <div className="mt-2 text-base font-semibold text-slate-700">
              <div className="flex items-center justify-between">
                <span>{t('report.stepOf', { n: step + 1 })}</span>
                <span>{t(STEP_KEYS[step])}</span>
              </div>
              <div
                className="mt-2 h-3 rounded-full bg-slate-200 overflow-hidden"
                role="progressbar"
                aria-valuemin={1}
                aria-valuemax={4}
                aria-valuenow={step + 1}
                aria-label={t('report.stepOf', { n: step + 1 })}
              >
                <div className="h-full bg-kmc-green transition-all motion-reduce:transition-none" style={{ width: `${((step + 1) / 4) * 100}%` }} />
              </div>
              <ol className="mt-2 hidden sm:grid grid-cols-4 gap-2 text-sm text-slate-600">
                {STEP_KEYS.map((k, i) => (
                  <li key={k} className={i === step ? 'font-bold text-slate-900' : ''}>{i + 1}. {t(k)}</li>
                ))}
              </ol>
            </div>

            <section className="mt-6 bg-white rounded-2xl border-2 border-slate-200 shadow-card p-5">
              {step === 0 && (
                <>
                  <div className="border-b border-slate-100 pb-3 mb-4">
                    <span className="text-[11px] uppercase font-bold text-kmc-navy bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                      {t("Karimnagar Municipal Corporation (MCK) · 7 Administrative Sections")}
                    </span>
                    <h2 ref={headingRef} tabIndex={-1} className="mt-1 text-2xl font-bold font-heading text-slate-900 outline-none uppercase tracking-tight">
                      {t("Select Municipal Department")}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {t("Select the designated administrative section of MCK responsible for resolving your civic grievance.")}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5" role="radiogroup" aria-label={t('report.q1')}>
                    {MCK_DEPARTMENT_CATEGORIES.map((dept) => {
                      const Icon = dept.icon;
                      const isSelected = selectedDeptId === dept.id;
                      return (
                        <div
                          key={dept.id}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onClick={() => handleSelectDepartment(dept)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleSelectDepartment(dept);
                            }
                          }}
                          className={`rounded-2xl border-2 p-4 cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-kmc-navy bg-blue-50/80 shadow-md ring-2 ring-kmc-navy'
                              : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                isSelected ? 'bg-kmc-navy text-amber-300' : 'bg-slate-100 text-slate-700'
                              }`}>
                                <Icon className="w-5 h-5" />
                              </span>
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {dept.slaHours}h SLA
                              </span>
                            </div>
                            <h3 className="text-base font-bold font-heading text-slate-900 leading-tight">
                              {t(dept.title)}
                            </h3>
                            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                              {t(dept.description)}
                            </p>
                          </div>

                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                              {t("Services & Scope")}:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {dept.subcategories.slice(0, 2).map((sub) => (
                                <span key={sub.key} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                                  {t(sub.label)}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Subcategory options for the selected department */}
                  {selectedDept && (
                    <div id="department-subcategories-section" className="scroll-mt-24 mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-xs font-bold uppercase text-kmc-navy block mb-2">
                        {t("Specific Issue / Service under {{dept}}", { dept: selectedDept.title })}:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {selectedDept.subcategories.map((sub) => {
                          const isSubSelected = category?.category === sub.label;
                          return (
                            <button
                              key={sub.key}
                              type="button"
                              onClick={() => handleSelectSubcategory(selectedDept, sub)}
                              className={`p-2.5 rounded-lg border text-left text-xs font-bold transition-all flex items-center justify-between ${
                                isSubSelected
                                  ? 'bg-kmc-navy text-white border-kmc-navy shadow-xs'
                                  : 'bg-white text-slate-800 border-slate-200 hover:border-kmc-navy'
                              }`}
                            >
                              <span className="line-clamp-1">{t(sub.label)}</span>
                              <span className="text-[10px] opacity-80 shrink-0 ml-1.5">{sub.slaHours}h</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {step === 1 && (
                <>
                  <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold font-body tracking-normal outline-none">{t('report.q2')}</h2>
                  <p className="mt-1 text-base text-slate-600">{t('report.photoHelp')}</p>
                  <div className="mt-4">
                    <PhotoPicker photos={photos} onChange={setPhotos} altPrefix={t('detail.beforeAlt', { problem: categoryLabel })} />
                  </div>
                  {photos.length === 0 && (
                    <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 border-2 border-amber-200 p-3 text-base text-amber-950">
                      <Lightbulb className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                      {t('report.photoTip')}
                    </p>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold font-body tracking-normal outline-none">{t('report.q3')}</h2>
                  <button
                    type="button"
                    onClick={useMyLocation}
                    disabled={locating}
                    className="mt-4 w-full min-h-[56px] rounded-xl bg-kmc-navy text-white text-base font-bold flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {locating ? <Loader2 className="w-6 h-6 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <LocateFixed className="w-6 h-6" aria-hidden="true" />}
                    {locating ? t('report.locating') : t('report.useLocation')}
                  </button>
                  {located && (
                    <p className="mt-3 flex items-center gap-2 text-base text-emerald-900" role="status">
                      <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                      {t('report.located', { place: `${located}, Ward ${wardId}` })}
                    </p>
                  )}
                  <label htmlFor="report-ward" className="block mt-5 text-base font-semibold">{t('report.wardLabel')}</label>
                  <div className="mt-1">
                    <SearchableSelect
                      id="report-ward"
                      value={wardId}
                      onChange={(val) => setWardId(Number(val))}
                      size="lg"
                      fullWidth
                      searchPlaceholder="Search 66 wards..."
                      options={wards.map((w) => ({
                        value: w.id,
                        label: `Ward ${w.id} – ${w.name}`,
                        sublabel: w.corporator ? `Corporator: ${w.corporator}` : undefined,
                      }))}
                    />
                  </div>
                  <label htmlFor="report-landmark" className="block mt-4 text-base font-semibold">{t('report.landmarkLabel')}</label>
                  <input
                    id="report-landmark"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder={t('report.landmarkPlaceholder')}
                    className="mt-1 w-full min-h-[52px] rounded-xl border-2 border-slate-300 px-3 text-base"
                  />
                </>
              )}

              {step === 3 && category && (
                <>
                  <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold font-body tracking-normal outline-none">{t('report.q4')}</h2>
                  <dl className="mt-4 space-y-3">
                    {[
                      { label: t('Department Section'), value: category.department, goTo: 0 },
                      { label: t('report.problem'), value: categoryLabel, goTo: 0 },
                      { label: t('report.place'), value: place, goTo: 2 },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center gap-3 rounded-xl bg-slate-50 border-2 border-slate-200 p-4">
                        <div className="flex-1 min-w-0">
                          <dt className="text-sm font-semibold text-slate-600">{row.label}</dt>
                          <dd className="text-lg font-bold break-words">{row.value}</dd>
                        </div>
                        <button type="button" onClick={() => setStep(row.goTo)} className="min-h-[44px] px-3 rounded-lg border-2 border-slate-300 text-base font-semibold">
                          {t('report.edit')}
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 border-2 border-slate-200 p-4">
                      <div className="flex-1 min-w-0">
                        <dt className="text-sm font-semibold text-slate-600">{t('report.photos')}</dt>
                        <dd className="mt-1">
                          {photos.length ? (
                            <span className="flex gap-2">
                              {photos.map((p, i) => (
                                <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                                  <FullImagePreview
                                    src={p}
                                    alt={`${t('detail.beforeAlt', { problem: categoryLabel })} ${i + 1}`}
                                    title={`${categoryLabel} ${i + 1}`}
                                    variant="thumbnail"
                                    className="w-full h-full"
                                  />
                                </div>
                              ))}
                            </span>
                          ) : (
                            <span className="text-lg font-bold">{t('report.noPhotos')}</span>
                          )}
                        </dd>
                      </div>
                      <button type="button" onClick={() => setStep(1)} className="min-h-[44px] px-3 rounded-lg border-2 border-slate-300 text-base font-semibold">
                        {t('report.edit')}
                      </button>
                    </div>
                  </dl>
                  <label htmlFor="report-note" className="mt-5 flex items-center gap-2 text-base font-semibold">
                    <MessageSquareText className="w-5 h-5" aria-hidden="true" />
                    {t('report.noteLabel')}
                  </label>
                  <textarea
                    id="report-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t('report.notePlaceholder')}
                    rows={3}
                    className="mt-1 w-full rounded-xl border-2 border-slate-300 p-3 text-base"
                  />
                </>
              )}

              {error && (
                <p className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 border-2 border-red-300 p-3 text-base text-red-900" role="alert">
                  <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                  {error}
                </p>
              )}

              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={back}
                  className="min-h-[52px] px-6 rounded-xl border-2 border-slate-300 bg-white text-base font-bold hover:border-kmc-navy"
                >
                  {step === 0 ? t('common.cancel') : t('common.back')}
                </button>
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={next}
                    className="min-h-[52px] px-8 rounded-xl bg-kmc-navy text-white text-base font-bold hover:bg-kmc-navy-light"
                  >
                    {t('common.next')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={submit}
                    disabled={sending}
                    className="min-h-[52px] px-8 rounded-xl bg-kmc-green text-white text-base font-bold hover:bg-kmc-green-dark flex items-center gap-2 disabled:opacity-70"
                  >
                    {sending && <Loader2 className="w-5 h-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                    {sending ? t('report.sending') : t('report.send')}
                  </button>
                )}
              </div>
            </section>
          </div>
        )}

      </div>
    </CitizenLayout>
  );
};
