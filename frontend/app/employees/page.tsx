"use client";

import { useState, useEffect } from 'react';
import EmployeesHeader from '@/components/employees/EmployeesHeader';
import { Plus, Mail, Phone, MapPin } from 'lucide-react';

type Employee = {
    id: string;
    name: string;
    job_title: string;
    work_email: string;
    work_phone: string;
    department_id: string; // Ideally fetch name
    image_url?: string;
};

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newJobTitle, setNewJobTitle] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/v1/hr/employees');
            if (res.ok) setEmployees(await res.json());
        } catch (error) {
            console.error("Failed to fetch employees", error);
        }
    };

    const handleCreateEmployee = async () => {
        if (!newName.trim()) return;

        try {
            const res = await fetch('http://localhost:8000/api/v1/hr/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName,
                    job_title: newJobTitle,
                    work_email: newEmail,
                    work_phone: newPhone
                })
            });

            if (res.ok) {
                const newEmployee = await res.json();
                setEmployees([...employees, newEmployee]);
                setNewName('');
                setNewJobTitle('');
                setNewEmail('');
                setNewPhone('');
                setIsNewModalOpen(false);
            }
        } catch (error) {
            console.error("Failed to create employee", error);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <EmployeesHeader />

            <div className="flex-1 overflow-auto p-6">
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsNewModalOpen(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded text-sm font-medium"
                        >
                            New
                        </button>
                        <span className="text-xl font-semibold text-gray-200">Employees</span>
                    </div>
                </div>

                {/* New Employee Modal */}
                {isNewModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                        <div className="bg-[#1E293B] rounded-lg shadow-xl w-full max-w-md border border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Create Employee</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                                        placeholder="e.g. Jane Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Job Title</label>
                                    <input
                                        type="text"
                                        value={newJobTitle}
                                        onChange={(e) => setNewJobTitle(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                                        placeholder="e.g. Software Engineer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Work Email</label>
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                                        placeholder="jane@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Work Phone</label>
                                    <input
                                        type="text"
                                        value={newPhone}
                                        onChange={(e) => setNewPhone(e.target.value)}
                                        className="w-full bg-[#0F172A] border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500 outline-none"
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setIsNewModalOpen(false)}
                                    className="px-4 py-2 text-gray-300 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateEmployee}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Employees Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {employees.map((emp) => (
                        <div key={emp.id} className="bg-[#1E293B] border border-gray-700 rounded-lg overflow-hidden hover:border-purple-500 transition-colors group cursor-pointer flex">
                            <div className="w-24 bg-gray-800 flex items-center justify-center shrink-0">
                                {emp.image_url ? (
                                    <img src={emp.image_url} alt={emp.name} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-3xl">👤</span>
                                )}
                            </div>
                            <div className="p-3 flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-200 mb-0.5 truncate group-hover:text-purple-400">{emp.name}</h3>
                                <p className="text-xs text-gray-400 mb-2 truncate">{emp.job_title}</p>

                                <div className="space-y-1">
                                    {emp.work_email && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                            <Mail size={12} className="shrink-0" />
                                            <span className="truncate">{emp.work_email}</span>
                                        </div>
                                    )}
                                    {emp.work_phone && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                            <Phone size={12} className="shrink-0" />
                                            <span className="truncate">{emp.work_phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
