export interface Attachment {
  id: string;
  name: string;
  size: string;
  fileType: string;
  fileData: string; // base64 data URL
  uploadDate: string;
}

export interface PersonalDetails {
  id: string;
  type: 'self' | 'spouse' | 'kid';
  name: string;
  fatherName: string;
  motherName: string;
  age: number | string;
  married: string;
  aadhaarNumber: string;
  panNumber: string;
  rationCard: string;
  voterCard: string;
  passport: string;
  visa: string;
  attachments: Attachment[];
}

export interface FamilyDetail {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
  attachments: Attachment[];
}

export interface EducationalDetail {
  id: string;
  personName: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  passingYear: string;
  grade: string;
  attachments: Attachment[];
}

export interface ProfessionalDetail {
  id: string;
  personName: string;
  companyName: string;
  employerName: string;
  designation: string;
  joiningDate: string;
  experience: string;
  officeLocation: string;
  managerName: string;
  managerContact: string;
  hrContact: string;
  attachments: Attachment[];
}

export interface SalaryDetail {
  id: string;
  personName: string;
  grossMonthly: number;
  basicPay: number;
  hra: number;
  allowances: number;
  deductions: number;
  bonusDetails: string;
  creditedAccount: string;
  attachments: Attachment[];
}

export interface ExpenseDetail {
  id: string;
  category: string;
  amount: number;
  frequency: string;
  dueDate: string;
  paymentMethod: string;
  notes: string;
  month: string;
  year: string;
}

export interface FinancialDetail {
  id: string;
  loanType: string;
  lenderBank: string;
  accountNumber: string;
  totalAmount: number;
  remainingAmount: number;
  emiAmount: number;
  emiTenureMonths: number;
  emiPaid: number;
  emiDate: string; // day of month e.g. "5"
  emiStartMonth: string;
  emiStartYear: string;
  interestRate: number;
  endYear: string;
  attachments: Attachment[];
}

export interface InsuranceDetail {
  id: string;
  policyType: string;
  provider: string;
  policyNumber: string;
  sumAssured: number;
  premiumAmount: number;
  frequency: string;
  startYear: string;
  policyTermYears: number;
  premiumsPaid: number;
  dueDate: string; // DD/MM/YYYY
  premiumStatus: string; // 'Paid' | 'Unpaid'
  nominee: string;
  attachments: Attachment[];
}

export interface InvestmentDetail {
  id: string;
  investmentType: string;
  assetClass: string;
  platformOrBank: string;
  frequency: string; // Monthly, Quarterly, Half-Yearly, Yearly, One-Time
  sipAmount: number;
  currentValue: number;
  investedAmount: number;
  maturityYear: string;
  accountNumber: string;
  nominee: string;
  attachments: Attachment[];
}

export interface VehicleDetail {
  id: string;
  ownerName: string;
  modelName: string;
  vehicleType: string;
  registrationNumber: string;
  insuranceExpiry: string;
  rcNumber: string;
  attachments: Attachment[];
}

export interface MedicalDetail {
  id: string;
  personName: string;
  bloodGroup: string;
  conditions: string;
  medications: string;
  allergies: string;
  doctorContact: string;
  hospitalPreference: string;
  attachments: Attachment[];
}

export interface PasswordRecord {
  id: string;
  category: string;
  serviceName: string;
  username: string;
  passwordKey: string;
  websiteUrl: string;
  securityQuestionNotes: string;
  updatedAt: string;
}

export interface DocumentRecord {
  id: string;
  documentName: string;
  category: string;
  belongsTo: string;
  notes: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  fileData: string;
  uploadDate: string;
}

export interface ApplianceDetail {
  id: string;
  category: string;
  applianceName: string;
  brand: string;
  modelNumber: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  warrantyExpiry: string;
  warrantyStatus: string; // 'Active' | 'Expired'
  condition: string; // 'Working' | 'Repair Needed' | 'Not Working'
  location: string; // 'Kitchen' | 'Living Room' | 'Bedroom' etc.
  serviceContact: string;
  notes: string;
  attachments: Attachment[];
}
