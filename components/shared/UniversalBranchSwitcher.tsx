"use client";

import { useState, useRef, useEffect } from "react";
import { useBranchContext } from "@/lib/branchContext";
import BranchSetupWizardModal from "@/components/settings/BranchSetupWizardModal";
import {
  Building2,
  ChevronDown,
  Plus,
  Check,
  Settings,
  Sparkles,
  MapPin,
  ExternalLink,
  Layers
} from "lucide-react";

export default function UniversalBranchSwitcher() {
  const {
    branches,
    activeBranch,
    activeIndustry,
    setActiveBranchId
  } = useBranchContext();

  const [isOpen, setIsOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleOpenNewBranch = () => {
    setEditingBranch(null);
    setIsWizardOpen(true);
    setIsOpen(false);
  };

  const handleEditActive = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBranch(activeBranch);
    setIsWizardOpen(true);
    setIsOpen(false);
  };

  if (!activeBranch) {
    return (
      <>
        <button
          onClick={handleOpenNewBranch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-all shadow-md active:scale-95 shrink-0"
        >
          <Plus size={14} />
          <span>+ Add Company</span>
        </button>
        <BranchSetupWizardModal
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          editingBranch={editingBranch}
        />
      </>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#0f1422] hover:bg-[#161c2e] border border-gray-700/80 hover:border-purple-500/50 text-xs font-semibold text-gray-200 transition-all shadow-md group shrink-0"
        title="Switch Business Entity / Branch"
      >
        <div className={`w-5 h-5 rounded-md ${activeIndustry.themeColor} flex items-center justify-center text-white text-[10px] font-extrabold shadow-sm shrink-0`}>
          {activeBranch.code ? activeBranch.code.split("-")[0] : "HQ"}
        </div>
        <div className="text-left hidden sm:block max-w-[150px] md:max-w-[200px] truncate">
          <div className="font-bold text-white truncate text-xs flex items-center gap-1">
            <span>{activeBranch.name}</span>
          </div>
          <div className="text-[10px] text-gray-400 truncate flex items-center gap-1">
            <span className={activeIndustry.accentColor}>●</span>
            <span>{activeIndustry.name.split(" ")[0]}</span>
            <span>•</span>
            <span className="text-gray-500">{activeBranch.operationMode}</span>
          </div>
        </div>
        <ChevronDown size={14} className={`text-gray-400 group-hover:text-white transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0e1320] border border-gray-700/90 shadow-2xl z-50 overflow-hidden text-xs text-white divide-y divide-gray-800 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-[#141b2c] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
                Multi-Entity & Branch Manager
              </span>
              <h4 className="font-bold text-white text-xs">
                Active: {activeBranch.name}
              </h4>
            </div>
            <button
              onClick={handleEditActive}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-purple-600 text-gray-300 hover:text-white transition-all text-[11px] flex items-center gap-1"
              title="Configure Active Branch Settings"
            >
              <Settings size={13} />
              <span>Configure</span>
            </button>
          </div>

          {/* Branches List */}
          <div className="max-h-64 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
            {branches.map(branch => {
              const isCurrent = branch.id === activeBranch.id;
              return (
                <div
                  key={branch.id}
                  onClick={() => {
                    setActiveBranchId(branch.id);
                    setIsOpen(false);
                  }}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isCurrent
                      ? "bg-purple-600/20 border-purple-500/80 text-white shadow-md"
                      : "bg-gray-900/40 border-gray-800/80 hover:bg-gray-800/50 hover:border-gray-700 text-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {branch.code.slice(0, 3)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-white truncate flex items-center gap-1.5">
                        <span className="truncate">{branch.name}</span>
                        {isCurrent && <Check size={13} className="text-emerald-400 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate flex items-center gap-1.5 mt-0.5">
                        <span className="text-purple-300 font-medium">{branch.subSector}</span>
                        <span>•</span>
                        <span className="text-gray-500">{branch.enabledModules.length} Apps</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-gray-950 text-gray-400 border border-gray-800 shrink-0">
                    {branch.operationMode}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer Action */}
          <div className="p-2.5 bg-[#141b2c] flex items-center justify-between">
            <button
              onClick={handleOpenNewBranch}
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30 transition-all active:scale-95"
            >
              <Plus size={14} /> Add New Branch / Industry Entity
            </button>
          </div>
        </div>
      )}

      {/* Setup Wizard Modal */}
      <BranchSetupWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        editingBranch={editingBranch}
      />
    </div>
  );
}
