"use client";

import PayrollHeader from '@/components/payroll/PayrollHeader';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

type SalaryStructure = {
  id: string;
  name: string;
  base_salary: number;
  allowances: number;
  deductions: number;
  currency: string;
};

export default function SalaryStructuresPage() {
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [allowances, setAllowances] = useState('');
  const [deductions, setDeductions] = useState('');
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/payroll/salary_structures')
      .then((r) => r.json())
      .then(setStructures)
      .catch(console.error);
  }, []);

  const createStructure = async () => {
    const payload = {
      name: newName,
      base_salary: parseFloat(baseSalary) || 0,
      allowances: parseFloat(allowances) || 0,
      deductions: parseFloat(deductions) || 0,
      currency,
    };
    const res = await fetch('http://localhost:8000/api/v1/payroll/salary_structures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const created = await res.json();
      setStructures([...structures, created]);
      setModalOpen(false);
      setNewName('');
      setBaseSalary('');
      setAllowances('');
      setDeductions('');
      setCurrency('USD');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <PayrollHeader />
      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-200">Salary Structures</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded flex items-center gap-1"
          >
            <Plus size={16} /> New Structure
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {structures.map((s) => (
            <div
              key={s.id}
              className="bg-[#1E293B] border border-gray-700 rounded p-4 hover:border-purple-500 transition-colors"
            >
              <h3 className="font-semibold text-gray-200 mb-1">{s.name}</h3>
              <p className="text-sm text-gray-400">{s.currency} {s.base_salary.toLocaleString(undefined, {minimumFractionDigits:2})}</p>
              <p className="text-xs text-gray-400 mt-2">Allowances: {s.allowances} | Deductions: {s.deductions}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#1E293B] rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Create Salary Structure</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500"
              />
              <input
                type="number"
                placeholder="Base Salary"
                value={baseSalary}
                onChange={(e) => setBaseSalary(e.target.value)}
                className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500"
              />
              <input
                type="number"
                placeholder="Allowances"
                value={allowances}
                onChange={(e) => setAllowances(e.target.value)}
                className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500"
              />
              <input
                type="number"
                placeholder="Deductions"
                value={deductions}
                onChange={(e) => setDeductions(e.target.value)}
                className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500"
              />
              <input
                type="text"
                placeholder="Currency (e.g., USD)"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500"
              />
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >Cancel</button>
              <button
                onClick={createStructure}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
