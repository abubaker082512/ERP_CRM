"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { GlobalIndustryId, GLOBAL_INDUSTRIES, getIndustryById, IndustryArchetype } from "./industryTaxonomy";

export type BranchSharingRules = {
  shareEmployees: boolean;
  shareCustomers: boolean;
  shareInventory: boolean;
  shareAccounting: boolean;
  shareVendors: boolean;
};

export type BusinessBranch = {
  id: string;
  name: string;
  code: string;
  industryId: GlobalIndustryId;
  subSector: string;
  operationMode: string;
  location: string;
  currency: string;
  enabledModules: string[];
  modules?: string[];
  sharingRules: BranchSharingRules;
  createdAt: string;
  isPrimary: boolean;
  ownerId?: string;
  accountType?: "individual" | "company";
  entityType?: "individual" | "company";
};

export type UserPlanType = "free" | "standard" | "premium";

export const MODULE_NAME_TO_HREF: Record<string, string> = {
  "Accounting": "/accounting",
  "Accounting & Finance": "/accounting",
  "CRM": "/crm",
  "CRM & Pipelines": "/crm",
  "Contacts": "/contacts",
  "Contacts & Clients": "/contacts",
  "Sales": "/sales",
  "Sales & Invoicing": "/sales",
  "Inventory": "/inventory",
  "Inventory Management": "/inventory",
  "Point of Sale": "/pos",
  "Point of Sale (POS)": "/pos",
  "Purchase": "/purchase",
  "Purchase & Vendors": "/purchase",
  "Project": "/project",
  "Project Management": "/project",
  "Timesheets": "/timesheets",
  "Planning": "/planning",
  "Manufacturing": "/manufacturing",
  "Employees": "/employees",
  "Payroll": "/payroll",
  "Attendances": "/attendances",
  "Recruitment": "/recruitment",
  "Contracts": "/employees/contracts",
  "Helpdesk": "/helpdesk",
  "Documents": "/documents",
  "Knowledge": "/knowledge",
  "Discuss": "/discuss",
  "Surveys": "/surveys",
  "Sign": "/sign",
  "Barcode": "/barcode",
  "Calendar": "/calendar",
  "Appointments": "/appointments",
  "To Do": "/todo",
  "To do": "/todo",
  "Team": "/team",
  "Dashboards": "/dashboard",
  "Website": "/website",
  "eCommerce": "/shop",
  "Club Hub": "/club",
  "NGOs & Grants": "/ngos",
  "Vehicle Jobs": "/automotive",
  "Properties": "/real-estate",
  "Education": "/education",
  "Meet": "/meet",
  "Reports": "/reports"
};

export const HREF_TO_MODULE_NAME: Record<string, string> = Object.entries(MODULE_NAME_TO_HREF).reduce(
  (acc, [name, href]) => {
    if (!acc[href]) acc[href] = name;
    return acc;
  },
  {} as Record<string, string>
);

export function normalizeModuleHref(modOrHref: string): string {
  if (!modOrHref) return "";
  if (modOrHref.startsWith("/")) return modOrHref;
  return MODULE_NAME_TO_HREF[modOrHref] || `/${modOrHref.toLowerCase().replace(/\s+/g, "-")}`;
}

const SUPER_ADMIN_EMAILS = [
  "admin@beraxis.online",
  "admin2@erp-crm.com",
  "abubaker@beraxis.online",
  "abubaker@galaxy.com"
];

export type BranchContextType = {
  branches: BusinessBranch[];
  activeBranch: BusinessBranch | null;
  activeIndustry: IndustryArchetype;
  hasSelectedIndustry: boolean;
  userPlan: UserPlanType;
  planTier: UserPlanType;
  isFreePlan: boolean;
  freeSelectedApp: string;
  freePlanModule: string;
  accountType: "individual" | "company";
  currentUserKey: string;
  setUserPlan: (plan: UserPlanType) => void;
  setFreeSelectedApp: (appHref: string) => void;
  setActiveBranchId: (id: string) => void;
  createBranch: (newBranch: Omit<BusinessBranch, "id" | "createdAt">) => BusinessBranch;
  updateBranch: (id: string, updates: Partial<BusinessBranch>) => void;
  deleteBranch: (id: string) => void;
  resetToIndustrySelection: () => void;
  toggleModuleForActiveBranch: (moduleHref: string) => void;
  isModuleActive: (moduleHref: string) => boolean;
  isModuleEnabled: (moduleHref: string) => boolean;
  isLeadPoolUnlocked: () => boolean;
  getEntityStorageKey: (resourceType: string) => string;
  refreshUserContext: () => void;
};

const BranchContext = createContext<BranchContextType | undefined>(undefined);

function getLoggedInUserInfo(): {
  userKey: string;
  email: string;
  isSuperAdmin: boolean;
  accountType: "individual" | "company";
  subscriptionStatus: string;
  companyName: string;
} {
  if (typeof window === "undefined") {
    return {
      userKey: "guest",
      email: "",
      isSuperAdmin: false,
      accountType: "individual",
      subscriptionStatus: "free",
      companyName: ""
    };
  }
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      const email = (u.email || "").toLowerCase().trim();
      const id = (u.id || email || "guest").toString().toLowerCase().trim();
      const isSuperAdmin =
        SUPER_ADMIN_EMAILS.includes(email) ||
        Boolean(u.is_super_admin) ||
        u.role === "super_admin";
      const accountType =
        (u.account_type || u.user_metadata?.account_type || "individual") === "company"
          ? "company"
          : "individual";
      const subscriptionStatus =
        u.tenant?.subscription_status || u.subscription_status || u.plan || "free";
      const companyName =
        u.company_name || u.user_metadata?.company_name || u.tenant?.name || "";
      return {
        userKey: id,
        email,
        isSuperAdmin,
        accountType,
        subscriptionStatus,
        companyName
      };
    }
  } catch {}
  return {
    userKey: "guest",
    email: "",
    isSuperAdmin: false,
    accountType: "individual",
    subscriptionStatus: "free",
    companyName: ""
  };
}

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [branches, setBranches] = useState<BusinessBranch[]>([]);
  const [activeBranchId, setActiveBranchIdState] = useState<string | null>(null);
  const [currentUserKey, setCurrentUserKey] = useState<string>("guest");
  const [accountType, setAccountType] = useState<"individual" | "company">("individual");
  const [userPlan, setUserPlanState] = useState<UserPlanType>("free");
  const [freeSelectedApp, setFreeSelectedAppState] = useState<string>("");

  const loadUserScopedContext = useCallback(() => {
    try {
      const info = getLoggedInUserInfo();
      const uKey = info.userKey;
      setCurrentUserKey(uKey);
      setAccountType(info.accountType);

      if (uKey === "guest") {
        setBranches([]);
        setActiveBranchIdState(null);
        setUserPlanState("free");
        setFreeSelectedAppState("");
        return;
      }

      // 1. Determine User Plan (Super Admin gets premium; paid active gets standard/premium; otherwise check saved plan or default to free)
      const savedPlan = localStorage.getItem(`beraxis_plan_${uKey}`) as UserPlanType | null;
      let resolvedPlan: UserPlanType = "free";
      if (info.isSuperAdmin) {
        resolvedPlan = "premium";
      } else if (info.subscriptionStatus === "active" || info.subscriptionStatus === "pro" || info.subscriptionStatus === "standard") {
        resolvedPlan = savedPlan === "premium" ? "premium" : "standard";
      } else if (savedPlan && ["free", "standard", "premium"].includes(savedPlan)) {
        resolvedPlan = savedPlan;
      } else {
        resolvedPlan = "free";
      }
      setUserPlanState(resolvedPlan);

      // 2. Determine Free Selected App (for Free Plan users)
      const savedFreeApp = localStorage.getItem(`beraxis_free_app_${uKey}`);
      const legacySelectedMod = localStorage.getItem("selectedModule");
      let resolvedFreeApp = "";
      if (savedFreeApp) {
        resolvedFreeApp = normalizeModuleHref(savedFreeApp);
      } else if (legacySelectedMod) {
        resolvedFreeApp = normalizeModuleHref(legacySelectedMod);
      }
      // Never allow Leads Pool or Settings as the 1 chosen major app
      if (
        resolvedFreeApp === "/crm/leads-pool" ||
        resolvedFreeApp === "/crm/lead-bank" ||
        resolvedFreeApp === "/leads-pool" ||
        resolvedFreeApp === "/lead-pool" ||
        resolvedFreeApp === "/settings"
      ) {
        resolvedFreeApp = "";
      }
      setFreeSelectedAppState(resolvedFreeApp);

      // 3. Load strictly user-isolated branches
      const branchesKey = `beraxis_branches_${uKey}`;
      const activeIdKey = `beraxis_active_branch_id_${uKey}`;
      const savedBranchesStr = localStorage.getItem(branchesKey);

      if (savedBranchesStr) {
        const parsed = JSON.parse(savedBranchesStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBranches(parsed);
          const savedActiveId = localStorage.getItem(activeIdKey);
          const chosenId =
            savedActiveId && parsed.some((b: BusinessBranch) => b.id === savedActiveId)
              ? savedActiveId
              : parsed[0].id;
          setActiveBranchIdState(chosenId);
          localStorage.setItem("beraxis_active_branch_id", chosenId);
          return;
        }
      }

      // Fresh user has NO branches yet -> triggers Industry & Company Onboarding!
      setBranches([]);
      setActiveBranchIdState(null);
      localStorage.removeItem("beraxis_active_branch_id");
    } catch {
      setBranches([]);
      setActiveBranchIdState(null);
    }
  }, []);

  useEffect(() => {
    loadUserScopedContext();

    const handleAuthOrStorageChange = () => {
      loadUserScopedContext();
    };

    window.addEventListener("beraxis_auth_changed", handleAuthOrStorageChange);
    window.addEventListener("storage", handleAuthOrStorageChange);
    return () => {
      window.removeEventListener("beraxis_auth_changed", handleAuthOrStorageChange);
      window.removeEventListener("storage", handleAuthOrStorageChange);
    };
  }, [loadUserScopedContext]);

  const isFreePlan = userPlan === "free";

  const setUserPlan = (plan: UserPlanType) => {
    const info = getLoggedInUserInfo();
    const uKey = info.userKey;
    setUserPlanState(plan);
    try {
      localStorage.setItem(`beraxis_plan_${uKey}`, plan);
    } catch {}
  };

  const setFreeSelectedApp = (appHrefOrName: string) => {
    const info = getLoggedInUserInfo();
    const uKey = info.userKey;
    const normalized = normalizeModuleHref(appHrefOrName);
    if (
      normalized === "/crm/leads-pool" ||
      normalized === "/crm/lead-bank" ||
      normalized === "/leads-pool" ||
      normalized === "/lead-pool" ||
      normalized === "/settings"
    ) {
      return;
    }
    setFreeSelectedAppState(normalized);
    try {
      localStorage.setItem(`beraxis_free_app_${uKey}`, normalized);
      localStorage.setItem("selectedModule", HREF_TO_MODULE_NAME[normalized] || normalized);
    } catch {}

    // Also update active branch modules if on free plan
    if (isFreePlan && branches.length > 0) {
      const updated = branches.map(b => ({
        ...b,
        enabledModules: normalized ? [normalized, "/settings"] : ["/settings"]
      }));
      saveBranches(updated);
    }
  };

  // Persist user-scoped branches
  const saveBranches = (newBranches: BusinessBranch[]) => {
    const info = getLoggedInUserInfo();
    const uKey = info.userKey;
    setBranches(newBranches);
    try {
      localStorage.setItem(`beraxis_branches_${uKey}`, JSON.stringify(newBranches));
    } catch {}
  };

  const setActiveBranchId = (id: string) => {
    const info = getLoggedInUserInfo();
    const uKey = info.userKey;
    setActiveBranchIdState(id);
    try {
      localStorage.setItem(`beraxis_active_branch_id_${uKey}`, id);
      localStorage.setItem("beraxis_active_branch_id", id);
    } catch {}
  };

  const activeBranch: BusinessBranch | null =
    branches.find(b => b.id === activeBranchId) || (branches.length > 0 ? branches[0] : null);

  const activeIndustry = activeBranch
    ? getIndustryById(activeBranch.industryId)
    : GLOBAL_INDUSTRIES[0];

  const hasSelectedIndustry = Boolean(activeBranch && branches.length > 0);

  const createBranch = (data: Omit<BusinessBranch, "id" | "createdAt">): BusinessBranch => {
    const info = getLoggedInUserInfo();
    const uKey = info.userKey;
    const newId = `BRN-${uKey.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    // Enforce Free Plan 1-App + Settings rule
    let finalModules = data.enabledModules || [];
    if (isFreePlan) {
      const nonFreeExcluded = finalModules.filter(
        m =>
          m !== "/settings" &&
          m !== "/crm/leads-pool" &&
          m !== "/crm/lead-bank" &&
          m !== "/leads-pool" &&
          m !== "/lead-pool"
      );
      const chosenOne = freeSelectedApp || nonFreeExcluded[0] || "/accounting";
      finalModules = [chosenOne, "/settings"];
      if (chosenOne !== freeSelectedApp) {
        setFreeSelectedAppState(chosenOne);
        try {
          localStorage.setItem(`beraxis_free_app_${uKey}`, chosenOne);
        } catch {}
      }
    } else {
      if (!finalModules.includes("/settings")) {
        finalModules = [...finalModules, "/settings"];
      }
    }

    const resolvedEntityType = data.entityType || data.accountType || info.accountType;
    const newBranch: BusinessBranch = {
      ...data,
      enabledModules: finalModules,
      modules: finalModules,
      id: newId,
      createdAt: new Date().toISOString().slice(0, 10),
      isPrimary: branches.length === 0,
      ownerId: uKey,
      accountType: resolvedEntityType,
      entityType: resolvedEntityType
    };

    // Free Plan only allows 1 single company workspace
    const updated = isFreePlan ? [newBranch] : [...branches, newBranch];
    saveBranches(updated);
    setActiveBranchId(newId);
    return newBranch;
  };

  const updateBranch = (id: string, updates: Partial<BusinessBranch>) => {
    let finalUpdates = { ...updates };
    if (isFreePlan && finalUpdates.enabledModules) {
      const nonSettings = finalUpdates.enabledModules.filter(
        m =>
          m !== "/settings" &&
          m !== "/crm/leads-pool" &&
          m !== "/crm/lead-bank" &&
          m !== "/leads-pool" &&
          m !== "/lead-pool"
      );
      const chosenOne = nonSettings[nonSettings.length - 1] || freeSelectedApp || "/accounting";
      finalUpdates.enabledModules = [chosenOne, "/settings"];
      setFreeSelectedApp(chosenOne);
    }
    const updated = branches.map(b => (b.id === id ? { ...b, ...finalUpdates } : b));
    saveBranches(updated);
  };

  const deleteBranch = (id: string) => {
    const info = getLoggedInUserInfo();
    const uKey = info.userKey;
    const updated = branches.filter(b => b.id !== id);
    saveBranches(updated);
    if (activeBranchId === id && updated.length > 0) {
      setActiveBranchId(updated[0].id);
    } else if (updated.length === 0) {
      setActiveBranchIdState(null);
      localStorage.removeItem(`beraxis_active_branch_id_${uKey}`);
      localStorage.removeItem("beraxis_active_branch_id");
    }
  };

  const resetToIndustrySelection = () => {
    const info = getLoggedInUserInfo();
    const uKey = info.userKey;
    setBranches([]);
    setActiveBranchIdState(null);
    try {
      localStorage.removeItem(`beraxis_branches_${uKey}`);
      localStorage.removeItem(`beraxis_active_branch_id_${uKey}`);
      localStorage.removeItem("beraxis_active_branch_id");
    } catch {}
  };

  const toggleModuleForActiveBranch = (moduleHref: string) => {
    if (!activeBranch) return;
    // Never allow Lead Pool on Free Plan
    if (
      isFreePlan &&
      (moduleHref === "/crm/leads-pool" ||
        moduleHref === "/crm/lead-bank" ||
        moduleHref === "/leads-pool" ||
        moduleHref === "/lead-pool")
    ) {
      return;
    }
    if (isFreePlan) {
      if (moduleHref === "/settings") return;
      setFreeSelectedApp(moduleHref);
      updateBranch(activeBranch.id, { enabledModules: [moduleHref, "/settings"] });
      return;
    }
    const currentModules = activeBranch.enabledModules || [];
    const isPresent = currentModules.includes(moduleHref);
    const updatedModules = isPresent
      ? currentModules.filter(m => m !== moduleHref)
      : [...currentModules, moduleHref];

    updateBranch(activeBranch.id, { enabledModules: updatedModules });
  };

  const isLeadPoolUnlocked = (): boolean => {
    return !isFreePlan;
  };

  const isModuleActive = (moduleHref: string): boolean => {
    // Settings is always available
    if (moduleHref === "/settings") return true;

    // Lead Pool is strictly ONLY available on Paid Plans
    if (
      moduleHref === "/crm/leads-pool" ||
      moduleHref === "/crm/lead-bank" ||
      moduleHref === "/leads-pool" ||
      moduleHref === "/lead-pool"
    ) {
      return !isFreePlan;
    }

    // On Free Plan, ONLY the 1 chosen major app (plus Settings) is active!
    if (isFreePlan) {
      const targetApp =
        freeSelectedApp ||
        activeBranch?.enabledModules?.find(
          m =>
            m !== "/settings" &&
            m !== "/crm/leads-pool" &&
            m !== "/crm/lead-bank"
        ) ||
        "";
      if (!targetApp) return false;
      return moduleHref === targetApp || moduleHref.startsWith(`${targetApp}/`);
    }

    if (!activeBranch || !activeBranch.enabledModules) return true;
    return activeBranch.enabledModules.includes(moduleHref);
  };

  const getEntityStorageKey = (resourceType: string): string => {
    const uKey = currentUserKey || getLoggedInUserInfo().userKey || "guest";
    const branchId = activeBranch?.id || "entity_main";
    return `beraxis_${uKey}_${branchId}_${resourceType}`;
  };

  return (
    <BranchContext.Provider
      value={{
        branches,
        activeBranch,
        activeIndustry,
        hasSelectedIndustry,
        userPlan,
        planTier: userPlan,
        isFreePlan,
        freeSelectedApp,
        freePlanModule: freeSelectedApp,
        accountType,
        currentUserKey,
        setUserPlan,
        setFreeSelectedApp,
        setActiveBranchId,
        createBranch,
        updateBranch,
        deleteBranch,
        resetToIndustrySelection,
        toggleModuleForActiveBranch,
        isModuleActive,
        isModuleEnabled: isModuleActive,
        isLeadPoolUnlocked,
        getEntityStorageKey,
        refreshUserContext: loadUserScopedContext
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export function useBranchContext() {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error("useBranchContext must be used within a BranchProvider");
  }
  return context;
}
