"use client";

import { useState, useEffect } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { Settings, Save, Mail, Building2, Globe, Database, CreditCard, Scale, Plus, Trash2, Check, RefreshCw } from "lucide-react";

// Default global units of measure
const DEFAULT_UOMS = [
  { id: "unit", name: "Units", category: "Unit", ratio: 1.0, active: true },
  { id: "kg", name: "Kilograms (kg)", category: "Weight", ratio: 1.0, active: true },
  { id: "g", name: "Grams (g)", category: "Weight", ratio: 1000.0, active: true },
  { id: "lb", name: "Pounds (lb)", category: "Weight", ratio: 2.2046, active: true },
  { id: "l", name: "Liters (L)", category: "Volume", ratio: 1.0, active: true },
  { id: "ml", name: "Milliliters (ml)", category: "Volume", ratio: 1000.0, active: true },
  { id: "m", name: "Meters (m)", category: "Length", ratio: 1.0, active: true },
  { id: "cm", name: "Centimeters (cm)", category: "Length", ratio: 100.0, active: true },
  { id: "inch", name: "Inches (in)", category: "Length", ratio: 39.37, active: true },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);

  // General settings state
  const [companyName, setCompanyName] = useState("Galaxy Technologies Inc.");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("UTC");
  const [country, setCountry] = useState("US");
  const [dateFormat, setDateFormat] = useState("YYYY-MM-DD");

  // Email settings state
  const [smtpServer, setSmtpServer] = useState("smtp.galaxy.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [encryption, setEncryption] = useState("tls");
  const [smtpUser, setSmtpUser] = useState("admin@galaxy.com");

  // Units of Measure state
  const [uoms, setUoms] = useState<any[]>(DEFAULT_UOMS);
  const [newUomName, setNewUomName] = useState("");
  const [newUomCat, setNewUomCat] = useState("Unit");
  const [newUomRatio, setNewUomRatio] = useState("1.0");
  const [isAddUomOpen, setIsAddUomOpen] = useState(false);

  useEffect(() => {
    // Load persisted settings on mount
    const savedCompany = localStorage.getItem("settings_company_name");
    const savedCurrency = localStorage.getItem("settings_currency");
    const savedTimezone = localStorage.getItem("settings_timezone");
    const savedCountry = localStorage.getItem("settings_country");
    const savedDateFormat = localStorage.getItem("settings_date_format");
    const savedSmtp = localStorage.getItem("settings_smtp_server");
    const savedPort = localStorage.getItem("settings_smtp_port");
    const savedEnc = localStorage.getItem("settings_encryption");
    const savedUser = localStorage.getItem("settings_smtp_username");
    const savedUoms = localStorage.getItem("settings_uoms");

    if (savedCompany) setCompanyName(savedCompany);
    if (savedCurrency) setCurrency(savedCurrency);
    if (savedTimezone) setTimezone(savedTimezone);
    if (savedCountry) setCountry(savedCountry);
    if (savedDateFormat) setDateFormat(savedDateFormat);
    if (savedSmtp) setSmtpServer(savedSmtp);
    if (savedPort) setSmtpPort(savedPort);
    if (savedEnc) setEncryption(savedEnc);
    if (savedUser) setSmtpUser(savedUser);
    if (savedUoms) {
      try { setUoms(JSON.parse(savedUoms)); } catch (e) {}
    }
  }, []);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem("settings_company_name", companyName);
      localStorage.setItem("settings_currency", currency);
      localStorage.setItem("settings_timezone", timezone);
      localStorage.setItem("settings_country", country);
      localStorage.setItem("settings_date_format", dateFormat);
      localStorage.setItem("settings_smtp_server", smtpServer);
      localStorage.setItem("settings_smtp_port", smtpPort);
      localStorage.setItem("settings_encryption", encryption);
      localStorage.setItem("settings_smtp_username", smtpUser);
      localStorage.setItem("settings_uoms", JSON.stringify(uoms));
      
      setSaving(false);
      alert("Settings saved successfully!");
    }, 800);
  };

  const handleAddUom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUomName.trim() || !newUomRatio) return;

    const newUom = {
      id: newUomName.toLowerCase().replace(/\s+/g, "-"),
      name: newUomName.trim(),
      category: newUomCat,
      ratio: parseFloat(newUomRatio) || 1.0,
      active: true
    };

    const updated = [...uoms, newUom];
    setUoms(updated);
    localStorage.setItem("settings_uoms", JSON.stringify(updated));

    setNewUomName("");
    setNewUomRatio("1.0");
    setIsAddUomOpen(false);
  };

  const toggleUom = (id: string) => {
    const updated = uoms.map(u => u.id === id ? { ...u, active: !u.active } : u);
    setUoms(updated);
    localStorage.setItem("settings_uoms", JSON.stringify(updated));
  };

  const deleteUom = (id: string) => {
    const updated = uoms.filter(u => u.id !== id);
    setUoms(updated);
    localStorage.setItem("settings_uoms", JSON.stringify(updated));
  };

  const tabs = [
    { id: "general", label: "General & Locale", icon: Building2 },
    { id: "uom", label: "Units of Measure", icon: Scale },
    { id: "email", label: "Email Setup", icon: Mail },
    { id: "users", label: "Users & Teams", icon: Globe },
    { id: "integrations", label: "Integrations", icon: Database },
    { id: "billing", label: "Billing", icon: CreditCard },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#0B101E] text-white">
      <AppHeader title="Settings" />

      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full px-6 pb-6 gap-8">
        {/* Sidebar */}
        <div className="w-64 shrink-0 space-y-1 mt-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Configuration</h2>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-purple-600/20 text-purple-400" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              }`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? "text-purple-400" : "text-gray-500"} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto mt-4">
          <div className="galaxy-card p-8 border border-gray-800">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-800">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h1>
                <p className="text-sm text-gray-400 mt-1">Manage your platform configurations and preferences.</p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-purple-600/20 active:scale-95"
              >
                <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            {/* General Tab */}
            {activeTab === "general" && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                  <input 
                    type="text" 
                    value={companyName} 
                    onChange={e => setCompanyName(e.target.value)} 
                    className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Default Currency</label>
                    <select 
                      value={currency} 
                      onChange={e => setCurrency(e.target.value)}
                      className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                    >
                      <option value="USD">USD ($) - United States Dollar</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                      <option value="AUD">AUD ($) - Australian Dollar</option>
                      <option value="CAD">CAD ($) - Canadian Dollar</option>
                      <option value="JPY">JPY (¥) - Japanese Yen</option>
                      <option value="PKR">PKR (₨) - Pakistani Rupee</option>
                      <option value="INR">INR (₹) - Indian Rupee</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                    <select 
                      value={timezone} 
                      onChange={e => setTimezone(e.target.value)}
                      className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                    >
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                      <option value="America/New_York">EST (America/New York)</option>
                      <option value="Europe/London">GMT/BST (Europe/London)</option>
                      <option value="Asia/Karachi">PKT (Asia/Karachi)</option>
                      <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
                      <option value="Asia/Tokyo">JST (Asia/Tokyo)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Country / Region</label>
                    <select 
                      value={country} 
                      onChange={e => setCountry(e.target.value)}
                      className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                    >
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="PK">Pakistan</option>
                      <option value="IN">India</option>
                      <option value="JP">Japan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date Format</label>
                    <select 
                      value={dateFormat} 
                      onChange={e => setDateFormat(e.target.value)}
                      className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                    >
                      <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-07-22)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 07/22/2026)</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 22/07/2026)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company Logo</label>
                  <div className="border-2 border-dashed border-gray-800 rounded-xl p-6 text-center hover:border-purple-500 transition-colors cursor-pointer bg-[#0F172A]">
                    <p className="text-sm text-gray-400">Drag and drop your logo here, or click to browse</p>
                    <p className="text-xs text-gray-500 mt-2">Recommended size: 512x512px</p>
                  </div>
                </div>
              </div>
            )}

            {/* Units of Measure Tab */}
            {activeTab === "uom" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Worldwide Units of Measure (UoM)</h3>
                    <p className="text-xs text-gray-400 mt-1">Configure standard conversion factors and ratios for purchase, sales, and manufacturing stock consumption.</p>
                  </div>
                  <button 
                    onClick={() => setIsAddUomOpen(true)}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    <Plus size={14} /> Add UoM
                  </button>
                </div>

                <div className="galaxy-card overflow-hidden border border-gray-800">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#1E293B] text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-800">
                      <tr>
                        <th className="px-6 py-4">UoM Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Ratio (to Category Base)</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {uoms.map(u => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-semibold text-gray-200">{u.name}</td>
                          <td className="px-6 py-4 text-gray-400">{u.category}</td>
                          <td className="px-6 py-4 font-mono text-gray-500">{u.ratio}</td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => toggleUom(u.id)}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                                u.active 
                                  ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                                  : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                              }`}
                            >
                              {u.active ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => deleteUom(u.id)}
                              className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                              title="Delete UoM"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {isAddUomOpen && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1A2236] rounded-2xl p-6 w-full max-w-md border border-white/8 shadow-2xl">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-white">Add Unit of Measure</h3>
                        <button onClick={() => setIsAddUomOpen(false)} className="text-gray-500 hover:text-white">
                          <X size={18} />
                        </button>
                      </div>

                      <form onSubmit={handleAddUom} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">UoM Name *</label>
                          <input 
                            type="text" 
                            required
                            value={newUomName}
                            onChange={e => setNewUomName(e.target.value)}
                            placeholder="e.g. Liters (L) or Meters (m)" 
                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500 outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Category *</label>
                            <select 
                              value={newUomCat} 
                              onChange={e => setNewUomCat(e.target.value)}
                              className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500 outline-none"
                            >
                              <option value="Unit">Unit / Count</option>
                              <option value="Weight">Weight</option>
                              <option value="Volume">Volume</option>
                              <option value="Length">Length</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Ratio to Base *</label>
                            <input 
                              type="number" 
                              step="0.0001"
                              required
                              value={newUomRatio}
                              onChange={e => setNewUomRatio(e.target.value)}
                              className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500 outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
                          <button type="button" onClick={() => setIsAddUomOpen(false)} className="px-4 py-2 text-sm text-gray-400">Cancel</button>
                          <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-xl text-sm font-bold">Add UoM</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Email Tab */}
            {activeTab === "email" && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Server</label>
                  <input 
                    type="text" 
                    value={smtpServer} 
                    onChange={e => setSmtpServer(e.target.value)}
                    className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Port</label>
                    <input 
                      type="text" 
                      value={smtpPort} 
                      onChange={e => setSmtpPort(e.target.value)}
                      className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Encryption</label>
                    <select 
                      value={encryption} 
                      onChange={e => setEncryption(e.target.value)}
                      className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                    >
                      <option value="tls">TLS</option>
                      <option value="ssl">SSL</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Username</label>
                  <input 
                    type="text" 
                    value={smtpUser} 
                    onChange={e => setSmtpUser(e.target.value)}
                    className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Password</label>
                  <input type="password" defaultValue="********" className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" />
                </div>
              </div>
            )}

            {/* Other tabs */}
            {["users", "integrations", "billing"].includes(activeTab) && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Settings size={48} className="text-gray-600 mb-4 animate-[spin_10s_linear_infinite]" />
                <h3 className="text-lg font-medium text-white mb-2">Coming Soon</h3>
                <p className="text-gray-400 max-w-xs">This configuration area is currently under active SaaS subscription packaging development.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal X component placeholder because we need X icon to close modals
function X(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
