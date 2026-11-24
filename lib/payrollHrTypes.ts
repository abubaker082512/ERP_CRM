export type PayFrequency = "Monthly" | "Bi-Weekly" | "Weekly" | "Semi-Monthly" | "Off-Cycle";

export type TaxJurisdiction =
  | "US_FEDERAL"
  | "UK_PAYE"
  | "UAE_WPS"
  | "PK_FBR"
  | "IN_TDS"
  | "GLOBAL_STD";

export const TAX_JURISDICTIONS: {
  id: TaxJurisdiction;
  label: string;
  currency: string;
  statutoryLabel: string;
  pensionLabel: string;
  employeeSocialRate: number;
  employerSocialRate: number;
  taxBrackets: { upToAnnual: number; rate: number }[];
}[] = [
  {
    id: "US_FEDERAL",
    label: "United States (Federal + FICA)",
    currency: "USD",
    statutoryLabel: "Federal Income Tax",
    pensionLabel: "FICA + 401(k)",
    employeeSocialRate: 0.0765,
    employerSocialRate: 0.0765,
    taxBrackets: [
      { upToAnnual: 11600, rate: 0.10 },
      { upToAnnual: 47150, rate: 0.12 },
      { upToAnnual: 100525, rate: 0.22 },
      { upToAnnual: 191950, rate: 0.24 },
      { upToAnnual: Infinity, rate: 0.32 },
    ],
  },
  {
    id: "UK_PAYE",
    label: "United Kingdom (PAYE + NI)",
    currency: "GBP",
    statutoryLabel: "PAYE Income Tax",
    pensionLabel: "National Insurance + Pension",
    employeeSocialRate: 0.08,
    employerSocialRate: 0.138,
    taxBrackets: [
      { upToAnnual: 12570, rate: 0.0 },
      { upToAnnual: 50270, rate: 0.20 },
      { upToAnnual: 125140, rate: 0.40 },
      { upToAnnual: Infinity, rate: 0.45 },
    ],
  },
  {
    id: "UAE_WPS",
    label: "UAE (WPS Zero-Tax + GPSSA)",
    currency: "AED",
    statutoryLabel: "Income Tax (0%)",
    pensionLabel: "Gratuity / GPSSA Reserve",
    employeeSocialRate: 0.0,
    employerSocialRate: 0.0833,
    taxBrackets: [{ upToAnnual: Infinity, rate: 0.0 }],
  },
  {
    id: "PK_FBR",
    label: "Pakistan (FBR + EOBI)",
    currency: "PKR",
    statutoryLabel: "FBR Income Tax",
    pensionLabel: "EOBI + Provident Fund",
    employeeSocialRate: 0.01,
    employerSocialRate: 0.05,
    taxBrackets: [
      { upToAnnual: 600000, rate: 0.0 },
      { upToAnnual: 1200000, rate: 0.05 },
      { upToAnnual: 2200000, rate: 0.15 },
      { upToAnnual: 3200000, rate: 0.25 },
      { upToAnnual: Infinity, rate: 0.35 },
    ],
  },
  {
    id: "IN_TDS",
    label: "India (TDS + PF/ESI)",
    currency: "INR",
    statutoryLabel: "TDS Income Tax",
    pensionLabel: "EPF + ESI",
    employeeSocialRate: 0.12,
    employerSocialRate: 0.12,
    taxBrackets: [
      { upToAnnual: 300000, rate: 0.0 },
      { upToAnnual: 700000, rate: 0.05 },
      { upToAnnual: 1000000, rate: 0.10 },
      { upToAnnual: 1500000, rate: 0.20 },
      { upToAnnual: Infinity, rate: 0.30 },
    ],
  },
  {
    id: "GLOBAL_STD",
    label: "Global Standard (Flat 15% + 5% Pension)",
    currency: "USD",
    statutoryLabel: "Withholding Tax",
    pensionLabel: "Pension & Social",
    employeeSocialRate: 0.05,
    employerSocialRate: 0.05,
    taxBrackets: [{ upToAnnual: Infinity, rate: 0.15 }],
  },
];

export type HREmployeeRecord = {
  id: string;
  empCode: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  role: string;
  employmentType: "Full-Time" | "Part-Time" | "Contractor" | "Intern";
  status: "Active" | "On Leave" | "Probation" | "Terminated";
  annualSalary: number;
  housingAllowancePct: number;
  transportAllowancePct: number;
  medicalAllowancePct: number;
  jurisdiction: TaxJurisdiction;
  taxId?: string;
  bankName?: string;
  bankAccount?: string;
  ibanOrRouting?: string;
  joinDate: string;
  leaveBalanceDays: number;
  healthPlan: "None" | "Basic" | "Family Plus" | "Executive";
  healthMonthlyPremium: number;
  pensionContributionPct: number;
  employerMatchPct: number;
};

export type LeaveRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "Annual" | "Sick" | "Casual" | "Unpaid (LWP)" | "Parental";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
};

export type OvertimeBonusEntry = {
  id: string;
  employeeId: string;
  employeeName: string;
  category: "Overtime" | "Bonus" | "Commission" | "Reimbursement" | "Arrears" | "Garnishment";
  hours?: number;
  amount: number;
  period: string;
  notes: string;
  status: "Pending" | "Approved" | "Applied";
};

export type EmployeeLoan = {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "Salary Advance" | "Personal Loan" | "Equipment Loan";
  principal: number;
  monthlyInstallment: number;
  remainingBalance: number;
  status: "Active" | "Paid Off";
  issuedDate: string;
};

export type PayrollAuditLog = {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  category: "Payroll" | "HR" | "Compliance" | "Benefits" | "Settlement";
};

export function computeProgressiveAnnualTax(annualTaxable: number, jurisdiction: TaxJurisdiction): number {
  const cfg = TAX_JURISDICTIONS.find((j) => j.id === jurisdiction) || TAX_JURISDICTIONS[0];
  let tax = 0;
  let prevLimit = 0;
  for (const bracket of cfg.taxBrackets) {
    if (annualTaxable <= prevLimit) break;
    const taxableInBracket = Math.min(annualTaxable, bracket.upToAnnual) - prevLimit;
    tax += taxableInBracket * bracket.rate;
    prevLimit = bracket.upToAnnual;
  }
  return Math.max(0, Math.round(tax));
}

export function getPeriodsPerYear(freq: PayFrequency): number {
  switch (freq) {
    case "Weekly":
      return 52;
    case "Bi-Weekly":
      return 26;
    case "Semi-Monthly":
      return 24;
    case "Monthly":
    case "Off-Cycle":
    default:
      return 12;
  }
}

export function calculateGrossToNet(params: {
  emp: HREmployeeRecord;
  frequency: PayFrequency;
  overtimeAmount?: number;
  bonusAmount?: number;
  reimbursementAmount?: number;
  arrearsAmount?: number;
  unpaidLeaveDays?: number;
  loanInstallment?: number;
  garnishmentAmount?: number;
}) {
  const {
    emp,
    frequency,
    overtimeAmount = 0,
    bonusAmount = 0,
    reimbursementAmount = 0,
    arrearsAmount = 0,
    unpaidLeaveDays = 0,
    loanInstallment = 0,
    garnishmentAmount = 0,
  } = params;

  const periods = getPeriodsPerYear(frequency);
  const cfg = TAX_JURISDICTIONS.find((j) => j.id === emp.jurisdiction) || TAX_JURISDICTIONS[0];

  const basePay = Math.round(emp.annualSalary / periods);
  const housingAllowance = Math.round(basePay * ((emp.housingAllowancePct || 0) / 100));
  const transportAllowance = Math.round(basePay * ((emp.transportAllowancePct || 0) / 100));
  const medicalAllowance = Math.round(basePay * ((emp.medicalAllowancePct || 0) / 100));
  const allowances = housingAllowance + transportAllowance + medicalAllowance;

  const dailyRate = Math.round(basePay / 22);
  const lwpDeduction = Math.max(0, unpaidLeaveDays * dailyRate);

  const taxableGross = Math.max(0, basePay + allowances + overtimeAmount + bonusAmount + arrearsAmount - lwpDeduction);
  const totalGross = taxableGross + reimbursementAmount;

  const pensionDeduction = Math.round(basePay * ((emp.pensionContributionPct || 0) / 100));
  const statutorySocial = Math.round(taxableGross * cfg.employeeSocialRate);
  const healthDeduction = Math.round((emp.healthMonthlyPremium || 0) * (12 / periods));

  const annualizedTaxable = Math.max(0, (taxableGross - pensionDeduction - healthDeduction) * periods);
  const incomeTax = Math.round(computeProgressiveAnnualTax(annualizedTaxable, emp.jurisdiction) / periods);

  const employerSocial = Math.round(taxableGross * cfg.employerSocialRate);
  const employerPensionMatch = Math.round(basePay * ((emp.employerMatchPct || 0) / 100));
  const employerTotalCost = totalGross + employerSocial + employerPensionMatch;

  const totalDeductions =
    incomeTax +
    statutorySocial +
    pensionDeduction +
    healthDeduction +
    lwpDeduction +
    loanInstallment +
    garnishmentAmount;

  const netPay = Math.max(0, totalGross - (incomeTax + statutorySocial + pensionDeduction + healthDeduction + loanInstallment + garnishmentAmount));

  return {
    basePay,
    housingAllowance,
    transportAllowance,
    medicalAllowance,
    allowances,
    overtimeAmount,
    bonusAmount,
    reimbursementAmount,
    arrearsAmount,
    lwpDeduction,
    totalGross,
    incomeTax,
    statutorySocial,
    pensionDeduction,
    healthDeduction,
    loanInstallment,
    garnishmentAmount,
    totalDeductions,
    netPay,
    employerSocial,
    employerPensionMatch,
    employerTotalCost,
  };
}
