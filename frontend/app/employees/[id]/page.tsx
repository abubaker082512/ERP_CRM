"use client";
import { fetchAPI } from '@/lib/api';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EmployeesHeader from '@/components/employees/EmployeesHeader';
import { ArrowLeft, Save, Trash2, Mail, Phone, Briefcase } from 'lucide-react';
import Link from 'next/link';

type Employee = {
    id: string;
    name: string;
    job_title: string;
    work_email: string;
    work_phone: string;
    department_id: string;
    image_url?: string;
};

export default function EmployeeDetail() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [emp, setEmp] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const res = await fetchAPI(`/hr/employees/${id}`);
                if (!res.ok) throw new Error(`Server error: ${res.status}`);
                setEmp(await res.json());
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployee();
    }, [id]);

    const handleSave = async () => {
        if (!emp) return;
        setSaving(true);
        setError(null);
        try {
            const payload = {
                name: emp.name,
                job_title: emp.job_title ?? null,
                work_email: emp.work_email ?? null,
                work_phone: emp.work_phone ?? null,
                image_url: emp.image_url ?? null,
                // department_id only sent if it looks like a UUID, backend strips non-UUID strings anyway
            };
            const res = await fetchAPI(`/hr/employees/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const detail = await res.json();
                throw new Error(detail.detail || `HTTP ${res.status}`);
            }
            const updated = await res.json();
            setEmp(updated);
            alert("✅ Employee updated successfully!");
        } catch (err: any) {
            setError(`Save failed: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Terminate this employee record?")) return;
        try {
            const res = await fetchAPI(`/hr/employees/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Delete failed");
        } catch (err: any) {
            alert(`Error: ${err.message}`);
            return;
        }
        router.push('/employees');
    };

    if (loading) return <div className="h-screen bg-[#0F172A] flex items-center justify-center text-white">Loading...</div>;

    if (error && !emp) return (
        <div className="h-screen bg-[#0F172A] flex flex-col items-center justify-center text-white gap-4">
            <p className="text-red-400 text-lg">⚠️ {error}</p>
            <Link href="/employees" className="text-purple-400 hover:underline">← Back to Employees</Link>
        </div>
    );

    if (!emp) return <div className="p-8 text-white">Employee not found.</div>;

    return (
        <div className="flex flex-col h-screen bg-[#0F172A] text-white">
            <EmployeesHeader />
            <div className="p-6 max-w-4xl mx-auto w-full overflow-y-auto">
                {error && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/40 text-red-400 rounded-lg px-4 py-3 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/employees" className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-2xl font-bold">{emp.name}</h1>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium transition"
                        >
                            <Trash2 size={16} /> Terminate Record
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 rounded-lg text-sm font-medium transition"
                        >
                            <Save size={16} /> {saving ? 'Saving...' : 'Update Employee'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 bg-[#1E293B] border border-gray-800 rounded-xl p-6">
                        <h2 className="text-lg font-semibold border-b border-gray-800 pb-4 mb-4">Personal Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={emp.name}
                                    onChange={e => setEmp({...emp, name: e.target.value})}
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Work Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 text-gray-500" size={16} />
                                        <input
                                            type="email"
                                            value={emp.work_email || ''}
                                            onChange={e => setEmp({...emp, work_email: e.target.value})}
                                            className="w-full bg-[#0F172A] border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Work Phone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 text-gray-500" size={16} />
                                        <input
                                            type="text"
                                            value={emp.work_phone || ''}
                                            onChange={e => setEmp({...emp, work_phone: e.target.value})}
                                            className="w-full bg-[#0F172A] border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[#1E293B] border border-gray-800 rounded-xl p-6">
                            <h2 className="text-lg font-semibold border-b border-gray-800 pb-4 mb-4">Job Position</h2>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Job Title</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-2.5 text-gray-500" size={16} />
                                    <input
                                        type="text"
                                        value={emp.job_title || ''}
                                        onChange={e => setEmp({...emp, job_title: e.target.value})}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
