"use client";
import { fetchAPI } from "@/lib/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Edit2, Save, X, Mail, Phone, Briefcase,
  Building2, Clock, DollarSign, User, Trash2
} from "lucide-react";

export default function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [emp, setEmp] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any>(null);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { loadAll(); }, [params.id]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const loadAll = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        fetchAPI(`/hr/employees/${params.id}`),
        fetchAPI(`/hr/departments`),
      ]);
      if (empRes.ok) {
        const data = await empRes.json();
        setEmp(data); setForm(data);
      } else { router.push("/employees"); return; }
      if (deptRes.ok) setDepartments(await deptRes.json());

      // Load attendance summary & payslips in background
      const [attRes, payRes] = await Promise.all([
        fetchAPI(`/attendance/summary?employee_id=${params.id}`),
        fetchAPI(`/payroll/payslips?employee_id=${params.id}`),
      ]);
      if (attRes.ok) setAttendance(await attRes.json());
      if (payRes.ok) setPayslips(await payRes.json());
    } catch { router.push("/employees"); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetchAPI(`/hr/employees/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, job_title: form.job_title,
          work_email: form.work_email, work_phone: form.work_phone,
          department_id: form.department_id,
        }),
      });
      if (res.ok) { const d = await res.json(); setEmp(d); setEditing(false); showToast("Employee saved"); }
      else showToast("Failed to save");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this employee?")) return;
    await fetchAPI(`/hr/employees/${params.id}`, { method: "DELETE" });
    router.push("/employees");
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!emp) return null;

  const field = (label: string, key: string, icon: any, type = "text", extra?: any) => (
    <div>
      <label className="text-xs text-gray-400 flex items-center gap-1 mb-1">
        {icon} {label}
      </label>
      {editing
        ? extra
          ? <select value={form[key] || ""} onChange={e => setForm({ ...form, [key]: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 text-sm">
              <option value="">— None —</option>
              {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          : <input type={type} value={form[key] || ""} onChange={e => setForm({ ...form, [key]: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 text-sm" />
        : <p className="text-white text-sm">{emp[key] || "—"}</p>
      }
    </div>
  );

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto">
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm bg-green-500/20 border border-green-500/30 text-green-400 shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
        <Link href="/employees" className="flex items-center gap-1 hover:text-purple-400 transition-colors">
          <ArrowLeft size={16} /> Employees
        </Link>
        <span>/</span>
        <span className="text-white">{emp.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="galaxy-card p-6 text-center mb-4">
            <div className="w-20 h-20 bg-purple-600/30 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              {emp.image_url ? <img src={emp.image_url} className="w-full h-full rounded-full object-cover" /> : "👤"}
            </div>
            <h1 className="text-xl font-bold text-white mb-1">{emp.name}</h1>
            <p className="text-sm text-purple-300">{emp.job_title || "No title"}</p>
            <p className="text-xs text-gray-400 mt-1">{emp.hr_department?.name || "No department"}</p>

            <div className="flex gap-2 justify-center mt-4">
              {editing ? (
                <>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs">
                    <Save size={12} /> {saving ? "..." : "Save"}
                  </button>
                  <button onClick={() => { setEditing(false); setForm(emp); }}
                    className="flex items-center gap-1 bg-white/5 text-gray-300 px-3 py-1.5 rounded-lg text-xs">
                    <X size={12} /> Cancel
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setEditing(true)}
                    className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg text-xs transition-colors">
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={handleDelete}
                    className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs transition-colors">
                    <Trash2 size={12} /> Delete
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Attendance Summary */}
          {attendance && (
            <div className="galaxy-card p-5">
              <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                <Clock size={12} /> This Month
              </h3>
              <p className="text-2xl font-bold text-white">{attendance.total_hours}h</p>
              <p className="text-xs text-gray-400">{attendance.records} attendance records</p>
              <p className="text-xs text-gray-500 mt-1">{attendance.month}</p>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="galaxy-card p-6">
            <h2 className="text-sm font-semibold text-gray-300 mb-4">Work Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {field("Full Name", "name", <User size={11} />)}
              {field("Job Title", "job_title", <Briefcase size={11} />)}
              {field("Work Email", "work_email", <Mail size={11} />, "email")}
              {field("Work Phone", "work_phone", <Phone size={11} />, "tel")}
              {field("Department", "department_id", <Building2 size={11} />, "text", true)}
            </div>
          </div>

          {/* Payslips */}
          <div className="galaxy-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <DollarSign size={16} className="text-purple-400" /> Payslips
              </h2>
              <Link href="/payroll" className="text-xs text-purple-400 hover:underline">View All</Link>
            </div>
            {payslips.length === 0 ? (
              <p className="text-gray-500 text-sm">No payslips generated yet.</p>
            ) : (
              <div className="space-y-2">
                {payslips.slice(0, 5).map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-white/3 rounded-lg border border-white/5">
                    <div>
                      <p className="text-sm text-white">{p.date_from} – {p.date_to}</p>
                      <p className="text-xs text-gray-400">{p.state}</p>
                    </div>
                    <p className="text-sm font-bold text-green-400">${(p.net_wage || 0).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
