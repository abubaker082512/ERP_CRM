"use client";
import { fetchAPI } from "@/lib/api";
import { useState, useEffect } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { DollarSign, Plus, Play, Calendar, Search, Users, Settings, FileText } from "lucide-react";
import Link from "next/link";

export default function PayrollPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'batches' | 'payslips'>('batches');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRunName, setNewRunName] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [runsRes, slipsRes, empRes] = await Promise.all([
        fetchAPI("/payroll/runs"),
        fetchAPI("/payroll/payslips"),
        fetchAPI("/hr/employees")
      ]);
      
      let employeesList: any[] = [];
      if (empRes.ok) employeesList = await empRes.json();

      if (runsRes.ok) setRuns(await runsRes.json());
      if (slipsRes.ok) {
        const slips = await slipsRes.json();
        const mappedSlips = slips.map((s: any) => ({
          ...s,
          employee_name: employeesList.find((e: any) => e.id === s.employee_id)?.name || "Employee"
        }));
        setPayslips(mappedSlips);
      }
    } finally { setLoading(false); }
  };

  const createRun = async () => {
    if (!newRunName.trim()) return;
    const res = await fetchAPI("/payroll/runs", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newRunName })
    });
    if (res.ok) {
      setNewRunName("");
      setIsModalOpen(false);
      loadData();
    }
  };

  const processRun = async (id: string) => {
    await fetchAPI(`/payroll/runs/${id}/process`, { method: "POST" });
    loadData();
  };

  return (
    <div className="flex flex-col h-screen">
      <AppHeader title="Payroll" />

      <div className="flex-1 overflow-auto p-6 max-w-6xl mx-auto w-full">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#1E293B] rounded-lg p-1 w-fit">
          <button onClick={() => setActiveTab('batches')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'batches' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            Payroll Batches
          </button>
          <button onClick={() => setActiveTab('payslips')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'payslips' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            Individual Payslips
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <DollarSign className="text-emerald-500" /> {activeTab === 'batches' ? 'Payroll Batches' : 'Employee Payslips'}
            </h1>
            <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/20">
              {activeTab === 'batches' ? runs.length : payslips.length} Records
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-600/20 active:scale-95">
            <Plus size={16} /> New {activeTab === 'batches' ? 'Batch' : 'Payslip'}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : runs.length === 0 ? (
          <div className="galaxy-card p-12 flex flex-col items-center justify-center text-center">
            <div className="bg-white/5 p-6 rounded-full mb-4"><DollarSign size={48} className="text-emerald-500/50" /></div>
            <h2 className="text-xl font-semibold text-white mb-2">No Payroll Batches</h2>
            <p className="text-gray-400 mb-6 max-w-sm">Create a new payroll batch to automatically generate payslips for all active employees.</p>
            <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-500 transition-colors">Create First Batch</button>
          </div>
        ) : activeTab === 'batches' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {runs.map(run => (
              <div key={run.id} className="galaxy-card p-6 group hover:border-emerald-500/50 transition-colors flex flex-col h-full relative overflow-hidden">
                {run.state === "done" && <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full border-b border-l border-emerald-500/20 -mr-2 -mt-2" />}
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{run.name}</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12} /> Created: {new Date(run.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${run.state === "done" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}`}>
                    {run.state}
                  </span>
                </div>

                <div className="flex-1 mt-2">
                  <div className="bg-white/5 rounded-lg p-3 flex justify-between items-center mb-4">
                    <div className="text-center w-full">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Period</p>
                      <p className="text-sm text-gray-300 font-medium">{run.date_start ? new Date(run.date_start).toLocaleDateString() : "Not set"} — {run.date_end ? new Date(run.date_end).toLocaleDateString() : "Not set"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <FileText size={14} className="text-gray-500" /> Payslips linked
                  </div>
                  {run.state === "draft" ? (
                    <button onClick={() => processRun(run.id)}
                      className="flex items-center gap-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 px-3 py-1.5 rounded-md text-xs font-bold transition-all hover:shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                      <Play size={12} className="fill-yellow-400" /> Process Batch
                    </button>
                  ) : (
                    <span className="text-emerald-500 text-sm font-semibold flex items-center gap-1">✓ Processed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="galaxy-card overflow-hidden">
             <table className="w-full text-sm text-left">
                <thead className="bg-[#1E293B] text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4">Reference</th>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Period</th>
                    <th className="px-6 py-4 text-right">Net Wage</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {payslips.map(slip => (
                    <tr key={slip.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs text-emerald-400">{slip.number || 'SLIP/NEW'}</td>
                      <td className="px-6 py-4 font-medium text-gray-200">{slip.employee_name || 'Loading...'}</td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {new Date(slip.date_from).toLocaleDateString()} - {new Date(slip.date_to).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-white">
                        ${slip.net_wage?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          slip.state === 'done' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-300'
                        }`}>{slip.state}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-[#1E293B] rounded-2xl p-6 w-full max-w-sm border border-gray-700 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><Plus size={20} className="text-emerald-500" /> New Payroll Batch</h3>
            </div>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Batch Name</label>
                <input type="text" value={newRunName} onChange={(e) => setNewRunName(e.target.value)}
                  className="w-full bg-[#0F172A] border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-inner" 
                  placeholder="e.g. November 2026 Payroll" autoFocus />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl text-sm font-medium transition-colors">Cancel</button>
              <button onClick={createRun} disabled={!newRunName.trim()} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-emerald-600/20">Create Batch</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
