import { 
  PersonalDetails, FamilyDetail, EducationalDetail, ProfessionalDetail, 
  SalaryDetail, ExpenseDetail, FinancialDetail, InsuranceDetail, 
  InvestmentDetail, VehicleDetail, MedicalDetail, PasswordRecord 
} from './types';

// All data starts EMPTY - user fills and saves their own data
export const emptySelfData: PersonalDetails = {
  id: 'self-1',
  type: 'self',
  name: '',
  fatherName: '',
  motherName: '',
  age: '',
  married: '',
  aadhaarNumber: '',
  panNumber: '',
  rationCard: '',
  voterCard: '',
  passport: '',
  visa: '',
  attachments: []
};

export const emptySpouseData: PersonalDetails = {
  id: 'spouse-1',
  type: 'spouse',
  name: '',
  fatherName: '',
  motherName: '',
  age: '',
  married: '',
  aadhaarNumber: '',
  panNumber: '',
  rationCard: '',
  voterCard: '',
  passport: '',
  visa: '',
  attachments: []
};

export const emptyKidsData: PersonalDetails[] = [];
export const emptyFamilyDetails: FamilyDetail[] = [];
export const emptyEducationalDetails: EducationalDetail[] = [];
export const emptyProfessionalDetails: ProfessionalDetail[] = [];
export const emptySalaryDetails: SalaryDetail[] = [];
export const emptyExpenseDetails: ExpenseDetail[] = [];
export const emptyFinancialDetails: FinancialDetail[] = [];
export const emptyInsuranceDetails: InsuranceDetail[] = [];
export const emptyInvestmentDetails: InvestmentDetail[] = [];
export const emptyVehicleDetails: VehicleDetail[] = [];
export const emptyMedicalDetails: MedicalDetail[] = [];
export const emptyPasswords: PasswordRecord[] = [];

export const quickPortals = {
  '🏦 Banking': [
    { name: 'SBI Online', url: 'https://retail.onlinesbi.sbi' },
    { name: 'HDFC Netbanking', url: 'https://netbanking.hdfcbank.com' },
    { name: 'ICICI Bank', url: 'https://www.icicibank.com' },
    { name: 'Axis Bank', url: 'https://www.axisbank.com' },
    { name: 'Kotak Mahindra', url: 'https://www.kotak.com' },
    { name: 'PNB Online', url: 'https://netbanking.pnb.co.in' },
    { name: 'Bank of Baroda', url: 'https://www.bankofbaroda.in' },
    { name: 'Canara Bank', url: 'https://www.canarabank.com' },
  ],
  '📈 Investments & MF': [
    { name: 'Zerodha Kite', url: 'https://kite.zerodha.com' },
    { name: 'Groww (SIP/MF)', url: 'https://groww.in' },
    { name: 'Angel One', url: 'https://www.angelone.in' },
    { name: 'CAMS (MF Stmt)', url: 'https://www.camsonline.com' },
    { name: 'KFintech (MF)', url: 'https://www.kfintech.com' },
    { name: 'AMFI (MF NAV)', url: 'https://www.amfiindia.com' },
    { name: 'NSE India', url: 'https://www.nseindia.com' },
    { name: 'BSE StAR MF', url: 'https://www.bsestarmf.in' },
    { name: 'NPS (Pension)', url: 'https://www.npscra.nist.gov.in' },
    { name: 'PPF / NSC (Post)', url: 'https://www.indiapost.gov.in' },
    { name: 'Sukanya Samriddhi', url: 'https://www.nsiindia.gov.in' },
    { name: 'PM Kisan Yojana', url: 'https://pmkisan.gov.in' },
  ],
  '🏛️ Government & Visa': [
    { name: 'Income Tax E-Filing', url: 'https://eportal.incometax.gov.in' },
    { name: 'EPFO / PF', url: 'https://unifiedportal-mem.epfindia.gov.in' },
    { name: 'DigiLocker', url: 'https://www.digilocker.gov.in' },
    { name: 'Aadhaar (UIDAI)', url: 'https://myaadhaar.uidai.gov.in' },
    { name: 'Passport Seva', url: 'https://www.passportindia.gov.in' },
    { name: 'Voter ID (NVSP)', url: 'https://www.nvsp.in' },
    { name: 'GST Portal', url: 'https://www.gst.gov.in' },
    { name: 'US Visa (CEAC)', url: 'https://ceac.state.gov' },
    { name: 'UK Visa', url: 'https://www.gov.uk/apply-to-come-to-the-uk' },
    { name: 'Schengen Visa', url: 'https://www.schengenvisainfo.com' },
    { name: 'Canada (IRCC)', url: 'https://www.canada.ca/en/immigration-refugees-citizenship.html' },
    { name: 'Australia Visa', url: 'https://immi.homeaffairs.gov.au' },
    { name: 'Dubai/UAE Visa', url: 'https://smartservices.icp.gov.ae' },
    { name: 'Singapore Visa', url: 'https://www.ica.gov.sg' },
    { name: 'Japan Visa', url: 'https://www.mofa.go.jp/j_info/visit/visa' },
  ],
  '🛡️ Insurance (Life+Health)': [
    { name: 'LIC India', url: 'https://licindia.in' },
    { name: 'HDFC Life', url: 'https://www.hdfclife.com' },
    { name: 'ICICI Prudential', url: 'https://www.iciciprulife.com' },
    { name: 'SBI Life', url: 'https://www.sbilife.co.in' },
    { name: 'Max Life', url: 'https://www.maxlifeinsurance.com' },
    { name: 'Star Health', url: 'https://www.starhealth.in' },
    { name: 'Niva Bupa Health', url: 'https://www.nivabupa.com' },
    { name: 'Care Health', url: 'https://www.careinsurance.com' },
    { name: 'Manipal Cigna', url: 'https://www.manipalcigna.com' },
    { name: 'Bajaj Allianz Health', url: 'https://www.bajajallianz.com' },
    { name: 'Policy Bazaar', url: 'https://www.policybazaar.com' },
  ],
  '🏥 Health & Medical': [
    { name: 'Practo (Doctors)', url: 'https://www.practo.com' },
    { name: 'Apollo 24|7', url: 'https://www.apollo247.com' },
    { name: 'MedPlus Pharmacy', url: 'https://www.medplusmart.com' },
    { name: 'PharmEasy', url: 'https://pharmeasy.in' },
    { name: 'Netmeds', url: 'https://www.netmeds.com' },
    { name: '1mg / Tata Health', url: 'https://www.1mg.com' },
    { name: 'ABHA Health ID', url: 'https://abha.abdm.gov.in' },
    { name: 'CoWIN / Vaccine', url: 'https://www.cowin.gov.in' },
  ],
  '🚗 Vehicle & Transport': [
    { name: 'Parivahan (RC/DL)', url: 'https://parivahan.gov.in' },
    { name: 'FASTag NHAI', url: 'https://www.ihmcl.com' },
    { name: 'IRCTC (Rail)', url: 'https://www.irctc.co.in' },
    { name: 'MakeMyTrip', url: 'https://www.makemytrip.com' },
  ],
  '💳 Payments & UPI': [
    { name: 'Google Pay', url: 'https://pay.google.com' },
    { name: 'Paytm', url: 'https://paytm.com' },
    { name: 'PhonePe', url: 'https://www.phonepe.com' },
    { name: 'CRED', url: 'https://cred.club' },
    { name: 'BHIM UPI', url: 'https://www.bhimupi.org.in' },
  ],
  '🎓 Education': [
    { name: 'CBSE Results', url: 'https://www.cbse.gov.in' },
    { name: 'NAD (Degree Verify)', url: 'https://nad.gov.in' },
    { name: 'Coursera', url: 'https://www.coursera.org' },
    { name: 'Udemy', url: 'https://www.udemy.com' },
  ],
  '⚡ Utilities & Bills': [
    { name: 'Electricity (BBPS)', url: 'https://www.bharatbillpay.com' },
    { name: 'Jio Recharge', url: 'https://www.jio.com' },
    { name: 'Airtel Recharge', url: 'https://www.airtel.in' },
    { name: 'Gas Booking (HP)', url: 'https://www.hindustanpetroleum.com' },
  ],
  '🏠 Appliances & Service': [
    { name: 'Samsung Service', url: 'https://www.samsung.com/in/support' },
    { name: 'LG Service', url: 'https://www.lg.com/in/support' },
    { name: 'Whirlpool Service', url: 'https://www.whirlpoolindia.com/support' },
    { name: 'Godrej Service', url: 'https://www.godrej.com/support' },
    { name: 'Voltas Service', url: 'https://www.voltas.com/customer-support' },
    { name: 'Blue Star Service', url: 'https://www.bluestarindia.com/support' },
    { name: 'Havells Service', url: 'https://www.havells.com/en/consumer-care.html' },
    { name: 'Bajaj Electricals', url: 'https://www.bajajelectricals.com/customer-care' },
    { name: 'Crompton Service', url: 'https://www.crompton.co.in/customer-care' },
    { name: 'Bosch Home', url: 'https://www.bosch-home.in/customer-service' },
    { name: 'IFB Service', url: 'https://www.ifbappliances.com/customer-care' },
    { name: 'UrbanClap/Urban Co.', url: 'https://www.urbancompany.com' },
  ],
};

export const emergencyProtocols = [
  {
    title: '1. Term Life Insurance Claim',
    steps: 'Locate Policy Bond in physical locker and Insurance section. Contact insurer with Death Certificate and ID proof. Use sum assured to clear home loan and secure education funds.'
  },
  {
    title: '2. Home Loan & Title Deeds',
    steps: 'Check if home loan is covered by mortgage protection. Do not pay from savings before claiming insurance. Retrieve original title deeds from bank after loan closure.'
  },
  {
    title: '3. Investment Transmission',
    steps: 'Submit Form T3 to mutual fund registrar (CAMS/Karvy) with certified death certificate to transfer all folios to registered nominee without succession disputes.'
  },
  {
    title: '4. Bank Locker & Key Location',
    steps: 'Record your bank locker number and branch. Keep the key in a known secure location. Document the exact position for family reference.'
  },
  {
    title: '5. Legal Advisor Contact',
    steps: 'Keep your family legal advisor details here for property mutation, estate planning, and succession certificate processing.'
  }
];
