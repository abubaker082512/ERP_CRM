export type Role = "Owner" | "Admin" | "Manager" | "Specialist" | "Accountant" | "Viewer" | "Contractor";

export interface CompanyEntity {
  id: string;
  name: string;
  code: string;
  industry: string;
  currency: string;
  timezone: string;
  isPrimary?: boolean;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  companyIds: string[]; // List of company IDs member has access to
  reportsToId?: string | null; // ID of the member's direct supervisor
  allowedModules: string[]; // ['*'] for all, or specific module keys e.g. ['pos', 'sales']
  type: "full_time" | "freelance";
  status: "active" | "away" | "offline" | "deactivated";
  twoFactorEnabled: boolean;
  avatarBg: string;
  lastActive: string;
  joinedAt: string;
  title?: string;
  phone?: string;
}

export interface FreelancerContractor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  rate: string;
  contractType: "Hourly Freelance" | "Monthly Retainer" | "Fixed Milestone";
  projectAssigned: string;
  companyIds: string[];
  status: "active" | "completed" | "onboarding";
  ndaStatus: "Signed" | "Pending";
  startDate: string;
  endDate: string;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: Role;
  department: string;
  companyIds: string[];
  reportsToId?: string | null;
  allowedModules: string[];
  invitedBy: string;
  sentAt: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  expiresIn: string;
  token: string;
}

export interface MultiCompanyQuota {
  planId: "free" | "standard" | "custom";
  planName: string;
  billingCycle: "annually" | "monthly";
  maxCompanies: number;
  companies: CompanyEntity[];
  totalSeats: number;
  assignedSeats: number;
  availableSeats: number;
  costPerAdditionalSeatAnnual: number;
  costPerAdditionalSeatMonthly: number;
}
