"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
  sharingRules: BranchSharingRules;
  createdAt: string;
  isPrimary: boolean;
};

const DEFAULT_BRANCHES: BusinessBranch[] = [
  {
    id: "BRN-001",
    name: "Downtown Artisan Bakery & Cafe",
    code: "FNB-01",
    industryId: "food_beverage",
    subSector: "Artisan Bakery & Pastry Shop",
    operationMode: "hybrid",
    location: "San Francisco HQ • 100 Market St",
    currency: "$ USD",
    enabledModules: [
      "/pos",
      "/pos/kds",
      "/pos/recipes",
      "/pos/tables",
      "/inventory",
      "/purchase",
      "/accounting",
      "/planning",
      "/employees",
      "/timesheets",
      "/attendances"
    ],
    sharingRules: {
      shareEmployees: true,
      shareCustomers: true,
      shareInventory: false,
      shareAccounting: true,
      shareVendors: true
    },
    createdAt: "2024-01-15",
    isPrimary: true
  },
  {
    id: "BRN-002",
    name: "Beraxis Cloud & Engineering Labs",
    code: "SRV-02",
    industryId: "professional_services",
    subSector: "Software & IT Engineering Agency",
    operationMode: "hourly_billable",
    location: "Austin Tech Hub • Remote",
    currency: "$ USD",
    enabledModules: [
      "/project",
      "/timesheets",
      "/crm",
      "/sales",
      "/accounting",
      "/documents",
      "/team",
      "/employees",
      "/payroll",
      "/meet",
      "/sign",
      "/recruitment"
    ],
    sharingRules: {
      shareEmployees: true,
      shareCustomers: false,
      shareInventory: false,
      shareAccounting: true,
      shareVendors: true
    },
    createdAt: "2024-03-01",
    isPrimary: false
  },
  {
    id: "BRN-003",
    name: "Midtown Luxury Retail Boutique",
    code: "RTL-03",
    industryId: "retail_supermarket",
    subSector: "Fashion & Apparel Boutique",
    operationMode: "counter_pos",
    location: "New York • 5th Ave",
    currency: "$ USD",
    enabledModules: [
      "/pos",
      "/barcode",
      "/inventory",
      "/purchase",
      "/sales",
      "/accounting",
      "/crm",
      "/contacts",
      "/employees",
      "/attendances"
    ],
    sharingRules: {
      shareEmployees: true,
      shareCustomers: true,
      shareInventory: false,
      shareAccounting: true,
      shareVendors: true
    },
    createdAt: "2024-05-10",
    isPrimary: false
  }
];

export type BranchContextType = {
  branches: BusinessBranch[];
  activeBranch: BusinessBranch | null;
  activeIndustry: IndustryArchetype;
  hasSelectedIndustry: boolean;
  setActiveBranchId: (id: string) => void;
  createBranch: (newBranch: Omit<BusinessBranch, "id" | "createdAt">) => BusinessBranch;
  updateBranch: (id: string, updates: Partial<BusinessBranch>) => void;
  deleteBranch: (id: string) => void;
  resetToIndustrySelection: () => void;
  toggleModuleForActiveBranch: (moduleHref: string) => void;
  isModuleActive: (moduleHref: string) => boolean;
  getEntityStorageKey: (resourceType: string) => string;
};

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [branches, setBranches] = useState<BusinessBranch[]>([]);
  const [activeBranchId, setActiveBranchIdState] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedBranches = localStorage.getItem("beraxis_branches");
      if (savedBranches) {
        const parsed = JSON.parse(savedBranches);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBranches(parsed);
          const savedActiveId = localStorage.getItem("beraxis_active_branch_id");
          if (savedActiveId && parsed.some(b => b.id === savedActiveId)) {
            setActiveBranchIdState(savedActiveId);
          } else {
            setActiveBranchIdState(parsed[0].id);
          }
        }
      }
    } catch {
      // fallback
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Persist branches
  const saveBranches = (newBranches: BusinessBranch[]) => {
    setBranches(newBranches);
    try {
      localStorage.setItem("beraxis_branches", JSON.stringify(newBranches));
    } catch {}
  };

  const setActiveBranchId = (id: string) => {
    setActiveBranchIdState(id);
    try {
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
    const newId = `BRN-${Date.now().toString().slice(-4)}`;
    const newBranch: BusinessBranch = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString().slice(0, 10),
      isPrimary: branches.length === 0
    };
    const updated = [...branches, newBranch];
    saveBranches(updated);
    setActiveBranchId(newId);
    return newBranch;
  };

  const updateBranch = (id: string, updates: Partial<BusinessBranch>) => {
    const updated = branches.map(b => (b.id === id ? { ...b, ...updates } : b));
    saveBranches(updated);
  };

  const deleteBranch = (id: string) => {
    const updated = branches.filter(b => b.id !== id);
    saveBranches(updated);
    if (activeBranchId === id && updated.length > 0) {
      setActiveBranchId(updated[0].id);
    } else if (updated.length === 0) {
      setActiveBranchIdState(null);
      localStorage.removeItem("beraxis_active_branch_id");
    }
  };

  const resetToIndustrySelection = () => {
    setBranches([]);
    setActiveBranchIdState(null);
    try {
      localStorage.removeItem("beraxis_branches");
      localStorage.removeItem("beraxis_active_branch_id");
    } catch {}
  };

  const toggleModuleForActiveBranch = (moduleHref: string) => {
    if (!activeBranch) return;
    const currentModules = activeBranch.enabledModules || [];
    const isPresent = currentModules.includes(moduleHref);
    const updatedModules = isPresent
      ? currentModules.filter(m => m !== moduleHref)
      : [...currentModules, moduleHref];

    updateBranch(activeBranch.id, { enabledModules: updatedModules });
  };

  const isModuleActive = (moduleHref: string): boolean => {
    if (!activeBranch || !activeBranch.enabledModules) return true;
    return activeBranch.enabledModules.includes(moduleHref);
  };

  const getEntityStorageKey = (resourceType: string): string => {
    const branchId = activeBranch?.id || "default_entity";
    return `beraxis_${branchId}_${resourceType}`;
  };

  return (
    <BranchContext.Provider
      value={{
        branches,
        activeBranch,
        activeIndustry,
        hasSelectedIndustry,
        setActiveBranchId,
        createBranch,
        updateBranch,
        deleteBranch,
        resetToIndustrySelection,
        toggleModuleForActiveBranch,
        isModuleActive,
        getEntityStorageKey
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
