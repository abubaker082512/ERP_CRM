"use client";

import { useState, useEffect } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { Settings, Save, Mail, Building2, Globe, Database, CreditCard } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);

  // General settings state
  const [companyName, setCompanyName] = useState("Galaxy Technologies Inc.");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("UTC");

  // Email settings state
  const [smtpServer, setSmtpServer] = useState("smtp.galaxy.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [encryption, setEncryption] = useState("tls");
  const [smtpUser, setSmtpUser] = useState("admin@galaxy.com");

  useEffect(() => {
    // Load persisted settings on mount
    const savedCompany = localStorage.getItem("settings_company_name");
    const savedCurrency = localStorage.getItem("settings_currency");
    const savedTimezone = localStorage.getItem("settings_timezone");
    const savedSmtp = localStorage.getItem("settings_smtp_server");
    const savedPort = localStorage.getItem("settings_smtp_port");
    const savedEnc = localStorage.getItem("settings_encryption");
    const savedUser = localStorage.getItem("settings_smtp_username");

    if (savedCompany) setCompanyName(savedCompany);
    if (savedCurrency) setCurrency(savedCurrency);
    if (savedTimezone) setTimezone(savedTimezone);
    if (savedSmtp) setSmtpServer(savedSmtp);
    if (savedPort) setSmtpPort(savedPort);
    if (savedEnc) setEncryption(savedEnc);
    if (savedUser) setSmtpUser(savedUser);
  }, []);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem("settings_company_name", companyName);
      localStorage.setItem("settings_currency", currency);
      localStorage.setItem("settings_timezone", timezone);
      localStorage.setItem("settings_smtp_server", smtpServer);
      localStorage.setItem("settings_smtp_port", smtpPort);
      localStorage.setItem("settings_encryption", encryption);
      localStorage.setItem("settings_smtp_username", smtpUser);
      
      setSaving(false);
      alert("Settings saved successfully!");
    }, 800);
  };

  const tabs = [
    { id: "general", label: "General", icon: Building2 },
    { id: "users", label: "Users & Teams", icon: Globe },
    { id: "email", label: "Email Setup", icon: Mail },
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
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                    <select 
                      value={timezone} 
                      onChange={e => setTimezone(e.target.value)}
                      className="w-full bg-[#1E293B] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">EST (New York)</option>
                      <option value="Europe/London">GMT (London)</option>
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
