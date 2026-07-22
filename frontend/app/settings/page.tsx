"use client";

import { useState, useEffect, useRef } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { Settings, Save, Mail, Building2, Globe, Database, CreditCard, Scale, Plus, Trash2, Check, Search, ChevronDown, X } from "lucide-react";

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

// Comprehensive worldwide dataset for Country, Currency, and Timezone autocompletion
const WORLD_LOCALE_DATA = [
  { country: "Afghanistan", code: "AF", currency: "AFN", currencyName: "Afghan Afghani", timezone: "Asia/Kabul" },
  { country: "Albania", code: "AL", currency: "ALL", currencyName: "Albanian Lek", timezone: "Europe/Tirane" },
  { country: "Algeria", code: "DZ", currency: "DZD", currencyName: "Algerian Dinar", timezone: "Africa/Algiers" },
  { country: "Andorra", code: "AD", currency: "EUR", currencyName: "Euro", timezone: "Europe/Andorra" },
  { country: "Angola", code: "AO", currency: "AOA", currencyName: "Angolan Kwanza", timezone: "Africa/Luanda" },
  { country: "Argentina", code: "AR", currency: "ARS", currencyName: "Argentine Peso", timezone: "America/Argentina/Buenos_Aires" },
  { country: "Armenia", code: "AM", currency: "AMD", currencyName: "Armenian Dram", timezone: "Asia/Yerevan" },
  { country: "Australia", code: "AU", currency: "AUD", currencyName: "Australian Dollar", timezone: "Australia/Sydney" },
  { country: "Austria", code: "AT", currency: "EUR", currencyName: "Euro", timezone: "Europe/Vienna" },
  { country: "Azerbaijan", code: "AZ", currency: "AZN", currencyName: "Azerbaijani Manat", timezone: "Asia/Baku" },
  { country: "Bahamas", code: "BS", currency: "BSD", currencyName: "Bahamian Dollar", timezone: "America/Nassau" },
  { country: "Bahrain", code: "BH", currency: "BHD", currencyName: "Bahraini Dinar", timezone: "Asia/Bahrain" },
  { country: "Bangladesh", code: "BD", currency: "BDT", currencyName: "Bangladeshi Taka", timezone: "Asia/Dhaka" },
  { country: "Barbados", code: "BB", currency: "BBD", currencyName: "Barbadian Dollar", timezone: "America/Barbados" },
  { country: "Belarus", code: "BY", currency: "BYN", currencyName: "Belarusian Ruble", timezone: "Europe/Minsk" },
  { country: "Belgium", code: "BE", currency: "EUR", currencyName: "Euro", timezone: "Europe/Brussels" },
  { country: "Belize", code: "BZ", currency: "BZD", currencyName: "Belize Dollar", timezone: "America/Belize" },
  { country: "Benin", code: "BJ", currency: "XOF", currencyName: "West African CFA Franc", timezone: "Africa/Porto-Novo" },
  { country: "Bhutan", code: "BT", currency: "BTN", currencyName: "Bhutanese Ngultrum", timezone: "Asia/Thimphu" },
  { country: "Bolivia", code: "BO", currency: "BOB", currencyName: "Bolivian Boliviano", timezone: "America/La_Paz" },
  { country: "Bosnia and Herzegovina", code: "BA", currency: "BAM", currencyName: "Convertible Mark", timezone: "Europe/Sarajevo" },
  { country: "Botswana", code: "BW", currency: "BWP", currencyName: "Botswana Pula", timezone: "Africa/Gaborone" },
  { country: "Brazil", code: "BR", currency: "BRL", currencyName: "Brazilian Real", timezone: "America/Sao_Paulo" },
  { country: "Brunei", code: "BN", currency: "BND", currencyName: "Brunei Dollar", timezone: "Asia/Bandar_Seri_Begawan" },
  { country: "Bulgaria", code: "BG", currency: "BGN", currencyName: "Bulgarian Lev", timezone: "Europe/Sofia" },
  { country: "Burkina Faso", code: "BF", currency: "XOF", currencyName: "West African CFA Franc", timezone: "Africa/Ouagadougou" },
  { country: "Burundi", code: "BI", currency: "BIF", currencyName: "Burundian Franc", timezone: "Africa/Bujumbura" },
  { country: "Cambodia", code: "KH", currency: "KHR", currencyName: "Cambodian Riel", timezone: "Asia/Phnom_Penh" },
  { country: "Cameroon", code: "CM", currency: "XAF", currencyName: "Central African CFA Franc", timezone: "Africa/Douala" },
  { country: "Canada", code: "CA", currency: "CAD", currencyName: "Canadian Dollar", timezone: "America/Toronto" },
  { country: "Cape Verde", code: "CV", currency: "CVE", currencyName: "Cape Verdean Escudo", timezone: "Atlantic/Cape_Verde" },
  { country: "Chile", code: "CL", currency: "CLP", currencyName: "Chilean Peso", timezone: "America/Santiago" },
  { country: "China", code: "CN", currency: "CNY", currencyName: "Chinese Yuan", timezone: "Asia/Shanghai" },
  { country: "Colombia", code: "CO", currency: "COP", currencyName: "Colombian Peso", timezone: "America/Bogota" },
  { country: "Costa Rica", code: "CR", currency: "CRC", currencyName: "Costa Rican Colón", timezone: "America/Costa_Rica" },
  { country: "Croatia", code: "HR", currency: "EUR", currencyName: "Euro", timezone: "Europe/Zagreb" },
  { country: "Cuba", code: "CU", currency: "CUP", currencyName: "Cuban Peso", timezone: "America/Havana" },
  { country: "Cyprus", code: "CY", currency: "EUR", currencyName: "Euro", timezone: "Asia/Nicosia" },
  { country: "Czech Republic", code: "CZ", currency: "CZK", currencyName: "Czech Koruna", timezone: "Europe/Prague" },
  { country: "Denmark", code: "DK", currency: "DKK", currencyName: "Danish Krone", timezone: "Europe/Copenhagen" },
  { country: "Ecuador", code: "EC", currency: "USD", currencyName: "US Dollar", timezone: "America/Guayaquil" },
  { country: "Egypt", code: "EG", currency: "EGP", currencyName: "Egyptian Pound", timezone: "Africa/Cairo" },
  { country: "El Salvador", code: "SV", currency: "USD", currencyName: "US Dollar", timezone: "America/El_Salvador" },
  { country: "Estonia", code: "EE", currency: "EUR", currencyName: "Euro", timezone: "Europe/Tallinn" },
  { country: "Ethiopia", code: "ET", currency: "ETB", currencyName: "Ethiopian Birr", timezone: "Africa/Addis_Ababa" },
  { country: "Fiji", code: "FJ", currency: "FJD", currencyName: "Fijian Dollar", timezone: "Pacific/Fiji" },
  { country: "Finland", code: "FI", currency: "EUR", currencyName: "Euro", timezone: "Europe/Helsinki" },
  { country: "France", code: "FR", currency: "EUR", currencyName: "Euro", timezone: "Europe/Paris" },
  { country: "Georgia", code: "GE", currency: "GEL", currencyName: "Georgian Lari", timezone: "Asia/Tbilisi" },
  { country: "Germany", code: "DE", currency: "EUR", currencyName: "Euro", timezone: "Europe/Berlin" },
  { country: "Ghana", code: "GH", currency: "GHS", currencyName: "Ghanaian Cedi", timezone: "Africa/Accra" },
  { country: "Greece", code: "GR", currency: "EUR", currencyName: "Euro", timezone: "Europe/Athens" },
  { country: "Guatemala", code: "GT", currency: "GTQ", currencyName: "Guatemalan Quetzal", timezone: "America/Guatemala" },
  { country: "Honduras", code: "HN", currency: "HNL", currencyName: "Honduran Lempira", timezone: "America/Tegucigalpa" },
  { country: "Hungary", code: "HU", currency: "HUF", currencyName: "Hungarian Forint", timezone: "Europe/Budapest" },
  { country: "Iceland", code: "IS", currency: "ISK", currencyName: "Icelandic Króna", timezone: "Atlantic/Reykjavik" },
  { country: "India", code: "IN", currency: "INR", currencyName: "Indian Rupee", timezone: "Asia/Kolkata" },
  { country: "Indonesia", code: "ID", currency: "IDR", currencyName: "Indonesian Rupiah", timezone: "Asia/Jakarta" },
  { country: "Iran", code: "IR", currency: "IRR", currencyName: "Iranian Rial", timezone: "Asia/Tehran" },
  { country: "Iraq", code: "IQ", currency: "IQD", currencyName: "Iraqi Dinar", timezone: "Asia/Baghdad" },
  { country: "Ireland", code: "IE", currency: "EUR", currencyName: "Euro", timezone: "Europe/Dublin" },
  { country: "Israel", code: "IL", currency: "ILS", currencyName: "Israeli New Shekel", timezone: "Asia/Jerusalem" },
  { country: "Italy", code: "IT", currency: "EUR", currencyName: "Euro", timezone: "Europe/Rome" },
  { country: "Jamaica", code: "JM", currency: "JMD", currencyName: "Jamaican Dollar", timezone: "America/Jamaica" },
  { country: "Japan", code: "JP", currency: "JPY", currencyName: "Japanese Yen", timezone: "Asia/Tokyo" },
  { country: "Jordan", code: "JO", currency: "JOD", currencyName: "Jordanian Dinar", timezone: "Asia/Amman" },
  { country: "Kazakhstan", code: "KZ", currency: "KZT", currencyName: "Kazakhstani Tenge", timezone: "Asia/Almaty" },
  { country: "Kenya", code: "KE", currency: "KES", currencyName: "Kenyan Shilling", timezone: "Africa/Nairobi" },
  { country: "Korea, South", code: "KR", currency: "KRW", currencyName: "South Korean Won", timezone: "Asia/Seoul" },
  { country: "Kuwait", code: "KW", currency: "KWD", currencyName: "Kuwaiti Dinar", timezone: "Asia/Kuwait" },
  { country: "Lebanon", code: "LB", currency: "LBP", currencyName: "Lebanese Pound", timezone: "Asia/Beirut" },
  { country: "Libya", code: "LY", currency: "LYD", currencyName: "Libyan Dinar", timezone: "Africa/Tripoli" },
  { country: "Luxembourg", code: "LU", currency: "EUR", currencyName: "Euro", timezone: "Europe/Luxembourg" },
  { country: "Malaysia", code: "MY", currency: "MYR", currencyName: "Malaysian Ringgit", timezone: "Asia/Kuala_Lumpur" },
  { country: "Mexico", code: "MX", currency: "MXN", currencyName: "Mexican Peso", timezone: "America/Mexico_City" },
  { country: "Monaco", code: "MC", currency: "EUR", currencyName: "Euro", timezone: "Europe/Monaco" },
  { country: "Morocco", code: "MA", currency: "MAD", currencyName: "Moroccan Dirham", timezone: "Africa/Casablanca" },
  { country: "Nepal", code: "NP", currency: "NPR", currencyName: "Nepalese Rupee", timezone: "Asia/Kathmandu" },
  { country: "Netherlands", code: "NL", currency: "EUR", currencyName: "Euro", timezone: "Europe/Amsterdam" },
  { country: "New Zealand", code: "NZ", currency: "NZD", currencyName: "New Zealand Dollar", timezone: "Pacific/Auckland" },
  { country: "Nigeria", code: "NG", currency: "NGN", currencyName: "Nigerian Naira", timezone: "Africa/Lagos" },
  { country: "Norway", code: "NO", currency: "NOK", currencyName: "Norwegian Krone", timezone: "Europe/Oslo" },
  { country: "Oman", code: "OM", currency: "OMR", currencyName: "Omani Rial", timezone: "Asia/Muscat" },
  { country: "Pakistan", code: "PK", currency: "PKR", currencyName: "Pakistani Rupee", timezone: "Asia/Karachi" },
  { country: "Panama", code: "PA", currency: "PAB", currencyName: "Panamanian Balboa", timezone: "America/Panama" },
  { country: "Peru", code: "PE", currency: "PEN", currencyName: "Peruvian Sol", timezone: "America/Lima" },
  { country: "Philippines", code: "PH", currency: "PHP", currencyName: "Philippine Peso", timezone: "Asia/Manila" },
  { country: "Poland", code: "PL", currency: "PLN", currencyName: "Polish Zloty", timezone: "Europe/Warsaw" },
  { country: "Portugal", code: "PT", currency: "EUR", currencyName: "Euro", timezone: "Europe/Lisbon" },
  { country: "Qatar", code: "QA", currency: "QAR", currencyName: "Qatari Riyal", timezone: "Asia/Qatar" },
  { country: "Romania", code: "RO", currency: "RON", currencyName: "Romanian Leu", timezone: "Europe/Bucharest" },
  { country: "Russia", code: "RU", currency: "RUB", currencyName: "Russian Ruble", timezone: "Europe/Moscow" },
  { country: "Saudi Arabia", code: "SA", currency: "SAR", currencyName: "Saudi Riyal", timezone: "Asia/Riyadh" },
  { country: "Singapore", code: "SG", currency: "SGD", currencyName: "Singapore Dollar", timezone: "Asia/Singapore" },
  { country: "South Africa", code: "ZA", currency: "ZAR", currencyName: "South African Rand", timezone: "Africa/Johannesburg" },
  { country: "Spain", code: "ES", currency: "EUR", currencyName: "Euro", timezone: "Europe/Madrid" },
  { country: "Sri Lanka", code: "LK", currency: "LKR", currencyName: "Sri Lankan Rupee", timezone: "Asia/Colombo" },
  { country: "Sweden", code: "SE", currency: "SEK", currencyName: "Swedish Krona", timezone: "Europe/Stockholm" },
  { country: "Switzerland", code: "CH", currency: "CHF", currencyName: "Swiss Franc", timezone: "Europe/Zurich" },
  { country: "Taiwan", code: "TW", currency: "TWD", currencyName: "New Taiwan Dollar", timezone: "Asia/Taipei" },
  { country: "Thailand", code: "TH", currency: "THB", currencyName: "Thai Baht", timezone: "Asia/Bangkok" },
  { country: "Turkey", code: "TR", currency: "TRY", currencyName: "Turkish Lira", timezone: "Europe/Istanbul" },
  { country: "Ukraine", code: "UA", currency: "UAH", currencyName: "Ukrainian Hryvnia", timezone: "Europe/Kiev" },
  { country: "United Arab Emirates", code: "AE", currency: "AED", currencyName: "UAE Dirham", timezone: "Asia/Dubai" },
  { country: "United Kingdom", code: "GB", currency: "GBP", currencyName: "British Pound", timezone: "Europe/London" },
  { country: "United States", code: "US", currency: "USD", currencyName: "US Dollar", timezone: "America/New_York" },
  { country: "Uruguay", code: "UY", currency: "UYU", currencyName: "Uruguayan Peso", timezone: "America/Montevideo" },
  { country: "Uzbekistan", code: "UZ", currency: "UZS", currencyName: "Uzbekistani Som", timezone: "Asia/Tashkent" },
  { country: "Venezuela", code: "VE", currency: "VES", currencyName: "Venezuelan Bolívar", timezone: "America/Caracas" },
  { country: "Vietnam", code: "VN", currency: "VND", currencyName: "Vietnamese Dong", timezone: "Asia/Ho_Chi_Minh" },
  { country: "Yemen", code: "YE", currency: "YER", timezone: "Yemeni Rial", timezone: "Asia/Aden" },
  { country: "Zimbabwe", code: "ZW", currency: "ZWL", currencyName: "Zimbabwean Dollar", timezone: "Africa/Harare" }
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

  // Search filter query for general locale search
  const [searchLocale, setSearchLocale] = useState("");
  const [isLocaleDropdownOpen, setIsLocaleDropdownOpen] = useState(false);

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

  const localeDropdownRef = useRef<HTMLDivElement>(null);

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

    // Close locale dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (localeDropdownRef.current && !localeDropdownRef.current.contains(e.target as Node)) {
        setIsLocaleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const handleSelectLocale = (item: any) => {
    setCountry(item.country);
    setCurrency(item.currency);
    setTimezone(item.timezone);
    setSearchLocale(item.country);
    setIsLocaleDropdownOpen(false);
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

  const filteredLocales = WORLD_LOCALE_DATA.filter(loc => 
    loc.country.toLowerCase().includes(searchLocale.toLowerCase()) ||
    loc.currency.toLowerCase().includes(searchLocale.toLowerCase()) ||
    loc.timezone.toLowerCase().includes(searchLocale.toLowerCase())
  );

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

                {/* Searchable World Country, Currency, and Timezone Wizard */}
                <div className="p-5 bg-purple-900/10 border border-purple-500/25 rounded-2xl relative" ref={localeDropdownRef}>
                  <div className="flex items-center gap-2.5 mb-3">
                    <Globe size={18} className="text-purple-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Searchable World Locale Wizard</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Search any country to automatically configure national currency & timezone settings.</p>
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input 
                      type="text"
                      placeholder="Type country name (e.g. Canada, Germany, Pakistan)..."
                      value={searchLocale}
                      onChange={e => { setSearchLocale(e.target.value); setIsLocaleDropdownOpen(true); }}
                      onFocus={() => setIsLocaleDropdownOpen(true)}
                      className="w-full bg-[#0B101E] border border-gray-700 rounded-xl pl-10 pr-10 py-3 text-sm text-white focus:border-purple-500 outline-none transition-all"
                    />
                    {searchLocale && (
                      <button 
                        onClick={() => { setSearchLocale(""); setIsLocaleDropdownOpen(false); }}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  {/* Dropdown Results */}
                  {isLocaleDropdownOpen && (
                    <div className="absolute left-5 right-5 mt-1 max-h-56 bg-[#1A2236] border border-gray-700 rounded-xl overflow-y-auto z-20 shadow-2xl divide-y divide-white/5">
                      {filteredLocales.length === 0 ? (
                        <div className="p-4 text-center text-xs text-gray-500">No matching country or currency found.</div>
                      ) : (
                        filteredLocales.map((item, index) => (
                          <div 
                            key={index}
                            onClick={() => handleSelectLocale(item)}
                            className="p-3 hover:bg-purple-600/10 cursor-pointer flex items-center justify-between text-xs text-gray-300 transition-colors"
                          >
                            <span className="font-semibold text-white">{item.country} ({item.code})</span>
                            <span className="text-[10px] text-gray-400 font-mono">Currency: {item.currency} | Timezone: {item.timezone}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Country / Region</label>
                    <input 
                      type="text"
                      readOnly
                      value={country}
                      className="w-full bg-[#1E293B]/60 border border-gray-800 rounded-xl px-4 py-3 text-gray-400 outline-none cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Active Currency</label>
                    <input 
                      type="text"
                      readOnly
                      value={currency}
                      className="w-full bg-[#1E293B]/60 border border-gray-800 rounded-xl px-4 py-3 text-gray-400 outline-none cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Active Timezone</label>
                    <input 
                      type="text"
                      readOnly
                      value={timezone}
                      className="w-full bg-[#1E293B]/60 border border-gray-800 rounded-xl px-4 py-3 text-gray-400 outline-none cursor-not-allowed"
                    />
                  </div>
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
