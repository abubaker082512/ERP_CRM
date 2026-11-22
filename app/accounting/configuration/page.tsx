"use client";

import { useState, useEffect } from "react";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { DollarSign, Settings, Tag, Workflow, FileText, Globe, X, Plus, Trash2 } from "lucide-react";
import { useBranchContext } from "@/lib/branchContext";

const MENU_ITEMS = [
    { name: "Dashboard", href: "/accounting" },
    { name: "Customers", href: "/accounting/customers" },
    { name: "Vendors", href: "/accounting/vendors" },
    { name: "Accounting", href: "/accounting/journal" },
    { name: "Reporting", href: "/accounting/reporting" },
    { name: "Configuration", href: "/accounting/configuration" },
];

type CoaAccount = {
    code: string;
    name: string;
    type: "Asset" | "Liability" | "Equity" | "Income" | "Expense";
};

const DEFAULT_COA: CoaAccount[] = [
    { code: "1010", name: "Bank Account", type: "Asset" },
    { code: "1020", name: "Cash on Hand", type: "Asset" },
    { code: "1200", name: "Accounts Receivable", type: "Asset" },
    { code: "2000", name: "Accounts Payable", type: "Liability" },
    { code: "2100", name: "Sales Tax Payable", type: "Liability" },
    { code: "3000", name: "Owner Capital / Equity", type: "Equity" },
    { code: "4000", name: "Sales Revenue", type: "Income" },
    { code: "5000", name: "Operating Expenses", type: "Expense" },
];

export default function AccountingConfigurationPage() {
    const { getEntityStorageKey } = useBranchContext();
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [accounts, setAccounts] = useState<CoaAccount[]>(DEFAULT_COA);
    const [newAccCode, setNewAccCode] = useState("");
    const [newAccName, setNewAccName] = useState("");
    const [newAccType, setNewAccType] = useState<CoaAccount["type"]>("Asset");

    const [currency, setCurrency] = useState("USD ($)");
    const [fiscalStart, setFiscalStart] = useState("January 1");
    const [defaultTax, setDefaultTax] = useState("0%");
    const [paymentTerm, setPaymentTerm] = useState("Net 30");

    useEffect(() => {
        try {
            const savedCoa = localStorage.getItem(getEntityStorageKey("accounting_coa"));
            if (savedCoa) setAccounts(JSON.parse(savedCoa));
            const savedCfg = localStorage.getItem(getEntityStorageKey("accounting_config"));
            if (savedCfg) {
                const parsed = JSON.parse(savedCfg);
                if (parsed.currency) setCurrency(parsed.currency);
                if (parsed.fiscalStart) setFiscalStart(parsed.fiscalStart);
                if (parsed.defaultTax) setDefaultTax(parsed.defaultTax);
                if (parsed.paymentTerm) setPaymentTerm(parsed.paymentTerm);
            }
        } catch {}
    }, [getEntityStorageKey]);

    const saveCoa = (next: CoaAccount[]) => {
        setAccounts(next);
        try {
            localStorage.setItem(getEntityStorageKey("accounting_coa"), JSON.stringify(next));
        } catch {}
    };

    const saveConfig = () => {
        try {
            localStorage.setItem(
                getEntityStorageKey("accounting_config"),
                JSON.stringify({ currency, fiscalStart, defaultTax, paymentTerm })
            );
        } catch {}
        setActiveSection(null);
    };

    const handleAddAccount = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAccCode.trim() || !newAccName.trim()) return;
        saveCoa([...accounts, { code: newAccCode.trim(), name: newAccName.trim(), type: newAccType }]);
        setNewAccCode("");
        setNewAccName("");
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0F172A] overflow-x-hidden">
            <StandardModuleHeader
                moduleName="Accounting"
                moduleIcon={<DollarSign size={20} />}
                menuItems={MENU_ITEMS}
                searchPlaceholder="Search settings..."
            />

            <div className="flex-1 overflow-auto p-4 sm:p-6 pb-24">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">Accounting Configuration</h2>
                    <p className="text-sm text-gray-400 mt-1">Manage Chart of Accounts, taxes, currencies, and fiscal rules</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <button
                        type="button"
                        onClick={() => setActiveSection("coa")}
                        className="text-left bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
                    >
                        <div className="bg-blue-500/20 p-3 rounded-lg w-fit mb-4">
                            <FileText size={24} className="text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Chart of Accounts</h3>
                        <p className="text-sm text-gray-400 mb-4">{accounts.length} active ledger accounts configured</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveSection("taxes")}
                        className="text-left bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
                    >
                        <div className="bg-purple-500/20 p-3 rounded-lg w-fit mb-4">
                            <Tag size={24} className="text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Taxes</h3>
                        <p className="text-sm text-gray-400 mb-4">Default Tax Rate: {defaultTax}</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveSection("currencies")}
                        className="text-left bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
                    >
                        <div className="bg-yellow-500/20 p-3 rounded-lg w-fit mb-4">
                            <Globe size={24} className="text-yellow-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Currencies</h3>
                        <p className="text-sm text-gray-400 mb-4">Base Currency: {currency}</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveSection("fiscal")}
                        className="text-left bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
                    >
                        <div className="bg-green-500/20 p-3 rounded-lg w-fit mb-4">
                            <Settings size={24} className="text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Fiscal Years</h3>
                        <p className="text-sm text-gray-400 mb-4">Starts: {fiscalStart}</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveSection("terms")}
                        className="text-left bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
                    >
                        <div className="bg-red-500/20 p-3 rounded-lg w-fit mb-4">
                            <Workflow size={24} className="text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Payment Terms</h3>
                        <p className="text-sm text-gray-400 mb-4">Default Term: {paymentTerm}</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveSection("coa")}
                        className="text-left bg-[#1E293B] rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
                    >
                        <div className="bg-cyan-500/20 p-3 rounded-lg w-fit mb-4">
                            <Settings size={24} className="text-cyan-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Journals</h3>
                        <p className="text-sm text-gray-400 mb-4">INV, BILL, BNK1, CSH1, MISC active</p>
                        <div className="text-sm text-blue-400 hover:text-blue-300">Configure →</div>
                    </button>
                </div>

                <div className="mt-8 bg-[#1E293B] rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Current Settings</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                            <div>
                                <div className="text-white font-medium">Fiscal Year Start</div>
                                <div className="text-sm text-gray-400">{fiscalStart}</div>
                            </div>
                            <button onClick={() => setActiveSection("fiscal")} className="text-blue-400 hover:text-blue-300 text-sm font-medium cursor-pointer">
                                Edit
                            </button>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                            <div>
                                <div className="text-white font-medium">Company Currency</div>
                                <div className="text-sm text-gray-400">{currency}</div>
                            </div>
                            <button onClick={() => setActiveSection("currencies")} className="text-blue-400 hover:text-blue-300 text-sm font-medium cursor-pointer">
                                Edit
                            </button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <div>
                                <div className="text-white font-medium">Default Tax &amp; Payment Term</div>
                                <div className="text-sm text-gray-400">{defaultTax} • {paymentTerm}</div>
                            </div>
                            <button onClick={() => setActiveSection("taxes")} className="text-blue-400 hover:text-blue-300 text-sm font-medium cursor-pointer">
                                Edit
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {activeSection === "coa" && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1E293B] border border-gray-700 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl max-h-[85vh] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Chart of Accounts</h3>
                            <button onClick={() => setActiveSection(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleAddAccount} className="grid grid-cols-12 gap-2 mb-4">
                            <input
                                type="text"
                                required
                                placeholder="Code (e.g. 1050)"
                                value={newAccCode}
                                onChange={(e) => setNewAccCode(e.target.value)}
                                className="col-span-3 bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                            />
                            <input
                                type="text"
                                required
                                placeholder="Account Name"
                                value={newAccName}
                                onChange={(e) => setNewAccName(e.target.value)}
                                className="col-span-5 bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                            />
                            <select
                                value={newAccType}
                                onChange={(e) => setNewAccType(e.target.value as CoaAccount["type"])}
                                className="col-span-2 bg-[#0F172A] border border-gray-700 rounded-lg px-2 py-2 text-xs text-white"
                            >
                                <option value="Asset">Asset</option>
                                <option value="Liability">Liability</option>
                                <option value="Equity">Equity</option>
                                <option value="Income">Income</option>
                                <option value="Expense">Expense</option>
                            </select>
                            <button type="submit" className="col-span-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                                <Plus size={14} /> Add
                            </button>
                        </form>
                        <div className="flex-1 overflow-y-auto border border-gray-800 rounded-xl divide-y divide-gray-800">
                            {accounts.map((acc) => (
                                <div key={acc.code} className="flex items-center justify-between px-4 py-2.5 text-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{acc.code}</span>
                                        <span className="font-medium text-white">{acc.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-400">{acc.type}</span>
                                        <button
                                            onClick={() => saveCoa(accounts.filter((a) => a.code !== acc.code))}
                                            className="text-gray-500 hover:text-red-400"
                                            title="Remove account"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeSection && activeSection !== "coa" && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1E293B] border border-gray-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold capitalize">Configure {activeSection}</h3>
                            <button onClick={() => setActiveSection(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div>
                                <label className="block text-gray-300 mb-1">Base Currency</label>
                                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white">
                                    <option>USD ($)</option>
                                    <option>EUR (€)</option>
                                    <option>GBP (£)</option>
                                    <option>PKR (₨)</option>
                                    <option>AED (د.إ)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-1">Fiscal Year Start</label>
                                <select value={fiscalStart} onChange={(e) => setFiscalStart(e.target.value)} className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white">
                                    <option>January 1</option>
                                    <option>April 1</option>
                                    <option>July 1</option>
                                    <option>October 1</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-1">Default Tax Rate</label>
                                <input type="text" value={defaultTax} onChange={(e) => setDefaultTax(e.target.value)} className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-1">Default Payment Term</label>
                                <input type="text" value={paymentTerm} onChange={(e) => setPaymentTerm(e.target.value)} className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 text-white" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setActiveSection(null)} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm">Cancel</button>
                            <button onClick={saveConfig} className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm">Save Settings</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
