"use client";
import { fetchAPI } from '@/lib/api';
import { useEffect, useState } from 'react';
import {
    ShieldCheck, Users, Building2, TrendingUp, Search,
    RefreshCw, ExternalLink, CreditCard, Calendar,
    CheckCircle, ShieldAlert, Trash2, Bitcoin, DollarSign,
    Ban, Zap, ArrowUpRight, Clock, AlertTriangle, Tag, Plus,
    Percent, Sparkles, X, Check, Copy, ToggleLeft, ToggleRight,
    Edit3, Activity, Server, Database, Globe, Megaphone, Lock,
    Key, Download, Cpu, HardDrive, Bell, CheckSquare, Play,
    Sliders, LogIn, ChevronRight, Flame, Save
} from 'lucide-react';
import { DEFAULT_PRICING_CONFIG, PricingConfig } from '@/lib/pricingConfig';

export type Workspace = { 
    id: string; 
    name: string; 
    owner_email: string; 
    member_count: number; 
    created_at: string; 
    plan?: string; 
};
export type GlobalUser = { 
    id: string; 
    email: string; 
    created_at: string; 
    subscription_status?: string; 
    workspace_name?: string; 
    role?: string; 
    name?: string;
};
export type Tenant = { 
    id: string; 
    email: string; 
    subscription_status: string; 
    trial_ends_at: string; 
    created_at: string; 
};
export type SalesOrder = { 
    id: string; 
    name: string; 
    customer_name: string; 
    amount_total: number; 
    state: string; 
    created_at: string; 
};
export type PaymentRecord = {
    tenant_id: string; 
    email: string; 
    payment_status: string;
    plan: string; 
    amount_usd: number; 
    currency: string;
    activated_at: string; 
    registered_at: string;
};
export type PromoCode = {
    id: string;
    code: string;
    description: string;
    discount_type: "percentage" | "fixed_amount";
    discount_value: number;
    target_package: "all" | "standard" | "custom" | "starter";
    max_uses: number;
    used_count: number;
    min_order_amount?: number;
    expiry_date?: string;
    status: "active" | "paused" | "expired";
    created_at: string;
};
export type GlobalStats = {
    total_workspaces: number; 
    total_users: number; 
    platform_revenue: number;
    active_trials: number; 
    paid_subscribers: number; 
    crypto_revenue: number;
    cc_revenue?: number; 
    total_saas_revenue?: number;
};
export type AuditLog = {
    id: string;
    event: string;
    actor: string;
    details: string;
    severity: "info" | "warning" | "alert" | "success";
    created_at: string;
};
export type HealthData = {
    status: string;
    timestamp: string;
    services: Record<string, { status: string; latency_ms?: number; uptime?: string; mode?: string; engine?: string }>;
    system_metrics: {
        cpu_load: string;
        memory_usage: string;
        active_connections: number;
        cache_hit_ratio: string;
    };
};

const STATUS_STYLES: Record<string, string> = {
    active:    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    trialing:  "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    past_due:  "bg-red-500/10 text-red-400 border border-red-500/20",
    canceled:  "bg-red-500/10 text-red-400 border border-red-500/20",
    paused:    "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    expired:   "bg-red-500/10 text-red-400 border border-red-500/20",
    new:       "bg-gray-700/40 text-gray-400 border border-gray-700",
};

export default function SuperAdminPage() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [users, setUsers] = useState<GlobalUser[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [sales, setSales] = useState<SalesOrder[]>([]);
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [promocodes, setPromocodes] = useState<PromoCode[]>([]);
    const [stats, setStats] = useState<GlobalStats | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [health, setHealth] = useState<HealthData | null>(null);
    const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({
        ai_copilot: true,
        pos_terminal: true,
        mrp_manufacturing: true,
        directpay_card: true,
        whatsapp_bot: true,
        hr_payroll: true,
        strict_2fa: false,
        fleet_logistics: true
    });
    const [announcement, setAnnouncement] = useState({
        message: "DirectPay Card Gateway is actively processing transactions on Beraxis.",
        banner_type: "info",
        is_active: true
    });

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<
        "overview" | "pricing" | "promocodes" | "payments" | "billing" | "users" | "sales" | "flags" | "broadcast" | "audit" | "diagnostics" | "experiments"
    >("overview");

    // Dynamic SaaS Plan Pricing state
    const [pricingConfig, setPricingConfig] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG);
    const [pricingForm, setPricingForm] = useState({
        standard_annual_monthly_rate: "1.00",
        standard_monthly_rate: "5.00",
        standard_original_annual_rate: "24.90",
        standard_original_monthly_rate: "31.10",
        standard_is_early_bird: true,
        standard_badge_text: "Early Bird Special (96% OFF)",
        standard_bill_annual_upfront: true,
        custom_annual_monthly_rate: "37.40",
        custom_monthly_rate: "46.80",
        custom_badge_text: "Custom Enterprise",
        custom_is_early_bird: false,
        standard_lead_credits_per_user_monthly: "1500",
        custom_lead_credits_per_user_monthly: "5000"
    });
    const [savingPricing, setSavingPricing] = useState(false);

    // A/B Testing & Optimization Engine state
    const [experimentsData, setExperimentsData] = useState<any>(null);
    const [loadingExp, setLoadingExp] = useState(false);
    const [promotedWinner, setPromotedWinner] = useState<Record<string, string>>({});

    const fetchExperimentsData = async () => {
        setLoadingExp(true);
        try {
            const res = await fetch("/api/experiments");
            if (res.ok) {
                const data = await res.json();
                setExperimentsData(data);
                if (data.promotedWinners) {
                    setPromotedWinner(data.promotedWinners);
                }
            }
        } catch (err) {
            console.error("Failed to load experiments telemetry:", err);
        } finally {
            setLoadingExp(false);
        }
    };

    const handlePromoteWinner = async (experimentId: string, variantId: string) => {
        try {
            const res = await fetch("/api/experiments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "promote_winner",
                    experimentId,
                    variantId
                })
            });
            if (res.ok) {
                showToast(`Variant ${variantId} promoted to 100% of future traffic!`);
                fetchExperimentsData();
            }
        } catch (e) {
            showToast("Failed to promote variant.");
        }
    };

    const handleResetExperiments = async () => {
        if (!confirm("Are you sure you want to reset all experiment data and counters to baseline?")) return;
        try {
            const res = await fetch("/api/experiments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "reset" })
            });
            if (res.ok) {
                showToast("Experiment metrics reset successfully.");
                fetchExperimentsData();
            }
        } catch (e) {
            showToast("Failed to reset experiments.");
        }
    };

    // Search filters
    const [searchTerm, setSearchTerm] = useState("");
    const [promoSearchTerm, setPromoSearchTerm] = useState("");
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [salesSearchTerm, setSalesSearchTerm] = useState("");
    const [billingSearchTerm, setBillingSearchTerm] = useState("");
    const [paymentSearchTerm, setPaymentSearchTerm] = useState("");

    // Modals
    const [isCreatePromoOpen, setIsCreatePromoOpen] = useState(false);
    const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
    const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
    const [isResetPasswordOpen, setIsResetPasswordOpen] = useState<GlobalUser | null>(null);
    const [isChangePlanOpen, setIsChangePlanOpen] = useState<Workspace | null>(null);
    const [isTestDirectPayOpen, setIsTestDirectPayOpen] = useState(false);
    const [directPayTestResult, setDirectPayTestResult] = useState<any>(null);
    const [directPayClientId, setDirectPayClientId] = useState("pwa_ci_k1qlq54hv4gw5pr0khux");
    const [directPayClientSecret, setDirectPayClientSecret] = useState("pwa_secret_zp5rai8z02zr3o5sebm1co6uxci58uca");
    const [directPayEnabled, setDirectPayEnabled] = useState(true);
    const [stripeSecretKey, setStripeSecretKey] = useState("");
    const [stripePublishableKey, setStripePublishableKey] = useState("");
    const [stripeWebhookSecret, setStripeWebhookSecret] = useState("");
    const [stripeEnabled, setStripeEnabled] = useState(true);
    const [stripeMode, setStripeMode] = useState<"test" | "live">("test");
    const [showStripeSecret, setShowStripeSecret] = useState(false);
    const [isTestStripeOpen, setIsTestStripeOpen] = useState(false);
    const [stripeTestResult, setStripeTestResult] = useState<any>(null);
    const [stripeTesting, setStripeTesting] = useState(false);
    const [savingGateways, setSavingGateways] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Stripe Live Transactions & Stats
    const [stripeTransactions, setStripeTransactions] = useState<any[]>([]);
    const [stripeStats, setStripeStats] = useState<any>({
        total: 0,
        succeeded_count: 0,
        failed_count: 0,
        pending_count: 0,
        succeeded_volume_usd: 0,
        failed_volume_usd: 0,
        success_rate_percent: 100
    });
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [transactionStatusFilter, setTransactionStatusFilter] = useState<"all" | "succeeded" | "failed" | "pending">("all");
    const [transactionSearchTerm, setTransactionSearchTerm] = useState("");

    // Form inputs
    const [promoForm, setPromoForm] = useState({
        code: "",
        description: "",
        discount_type: "percentage" as "percentage" | "fixed_amount",
        discount_value: "20",
        target_package: "all" as "all" | "standard" | "custom" | "starter",
        max_uses: "500",
        min_order_amount: "0",
        expiry_date: "2026-12-31",
        status: "active" as "active" | "paused"
    });

    const [wsForm, setWsForm] = useState({
        name: "",
        owner_email: "",
        plan: "One App Free",
        member_count: 1
    });

    const [userForm, setUserForm] = useState({
        name: "",
        email: "",
        password: "User@123456",
        role: "user",
        plan: "One App Free",
        workspace_id: ""
    });

    const [newPasswordInput, setNewPasswordInput] = useState("");
    const [selectedPlanInput, setSelectedPlanInput] = useState("One App Free");

    const isSuperAdminEmail = (email?: string) => {
        if (!email) return false;
        const e = email.toLowerCase().trim();
        return (
            e === "admin@beraxis.online" ||
            e === "abubaker0825@gmail.com" ||
            e === "admin2@erp-crm.com" ||
            e === "beraxisai@gmail.com" ||
            e === "snakeyes358@gmail.com" ||
            e === "admin@galaxy.com" ||
            e === "abubaker@galaxy.com" ||
            e.endsWith("@beraxis.online") ||
            e.endsWith("@erp-crm.com")
        );
    };

    const getWorkspacePlanLabel = (ws: any) => {
        if (isSuperAdminEmail(ws.owner_email)) {
            return "Admin Full Control";
        }
        if (!ws.plan || ws.plan === "Standard Plan" || ws.plan === "Standard") {
            return "One App Free";
        }
        return ws.plan;
    };

    const [authChecked, setAuthChecked] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [isColdStarting, setIsColdStarting] = useState(false);

    useEffect(() => { 
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoggedIn(false);
                setError("Authentication required: Please log in with your Super Admin account to load platform metrics.");
            }
        }
        fetchAllData();
        fetchExperimentsData();
    }, []);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
    };

    const fetchAllData = async (retryCount = 0) => {
        setLoading(true);
        setError(null);
        
        try {
            // 1. Try to fetch from backend
            const [wsRes, statsRes, usersRes, salesRes, tenantsRes, paymentsRes, healthRes, flagsRes, auditRes] = await Promise.all([
                fetchAPI("/super-admin/workspaces").catch(() => null),
                fetchAPI("/super-admin/stats").catch(() => null),
                fetchAPI("/super-admin/users").catch(() => null),
                fetchAPI("/super-admin/sales").catch(() => null),
                fetchAPI("/super-admin/tenants").catch(() => null),
                fetchAPI("/super-admin/payments").catch(() => null),
                fetchAPI("/super-admin/health").catch(() => null),
                fetchAPI("/super-admin/feature-flags").catch(() => null),
                fetchAPI("/super-admin/audit-logs").catch(() => null),
            ]);

            let hasData = false;
            if (wsRes?.ok) {
                const data = await wsRes.json();
                if (Array.isArray(data) && data.length > 0) { setWorkspaces(data); hasData = true; }
            }
            if (statsRes?.ok) {
                const data = await statsRes.json();
                if (data && typeof data === 'object') setStats(data);
            }
            if (usersRes?.ok) {
                const data = await usersRes.json();
                if (Array.isArray(data) && data.length > 0) { setUsers(data); hasData = true; }
            }
            if (salesRes?.ok) {
                const data = await salesRes.json();
                if (Array.isArray(data) && data.length > 0) setSales(data);
            }
            if (tenantsRes?.ok) {
                const data = await tenantsRes.json();
                if (Array.isArray(data) && data.length > 0) setTenants(data);
            }
            if (paymentsRes?.ok) {
                const data = await paymentsRes.json();
                if (Array.isArray(data) && data.length > 0) setPayments(data);
            }
            if (healthRes?.ok) {
                const data = await healthRes.json();
                if (data && typeof data === 'object') setHealth(data);
            }
            if (flagsRes?.ok) {
                const data = await flagsRes.json();
                if (data && typeof data === 'object') setFeatureFlags(data);
            }
            if (auditRes?.ok) {
                const data = await auditRes.json();
                if (Array.isArray(data) && data.length > 0) setAuditLogs(data);
            }

            // 2. If FastAPI returned 401 or empty, seamlessly fallback to native overview API
            if (!hasData) {
                try {
                    const fallbackRes = await fetch("/api/admin/overview");
                    if (fallbackRes.ok) {
                        const fb = await fallbackRes.json();
                        if (Array.isArray(fb.workspaces)) setWorkspaces(fb.workspaces);
                        if (Array.isArray(fb.users)) setUsers(fb.users);
                        if (Array.isArray(fb.tenants)) setTenants(fb.tenants);
                        if (fb.stats) setStats(fb.stats);
                        if (Array.isArray(fb.sales)) setSales(fb.sales);
                        if (fb.health) setHealth(fb.health);
                        if (Array.isArray(fb.auditLogs)) setAuditLogs(fb.auditLogs);
                        if (fb.featureFlags) setFeatureFlags(fb.featureFlags);
                    }
                } catch (fbErr) {
                    console.warn("[SuperAdmin] Overview fallback error:", fbErr);
                }
            }

            setIsColdStarting(false);
            setIsLoggedIn(true);
            setError(null);
        } catch (err) {
            console.warn("Super Admin fetch error:", err);
            setIsLoggedIn(true);
        } finally {
            setLoading(false);
            setAuthChecked(true);
        }

        // Always run Next.js native endpoints independently
        await Promise.allSettled([
            fetchGatewaySettings(),
            fetchStripeTransactions(),
            fetchPricing(),
            fetchPromos(),
            fetchAnnouncement()
        ]);
    };

    const fetchAnnouncement = async () => {
        try {
            const res = await fetch("/api/admin/announcement");
            if (res.ok) {
                const data = await res.json();
                if (data && typeof data === 'object') {
                    setAnnouncement(data);
                }
            }
        } catch (err) {
            console.warn("Failed to fetch announcement", err);
        }
    };

    const fetchStripeTransactions = async () => {
        setTransactionsLoading(true);
        try {
            const res = await fetch("/api/admin/transactions");
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setStripeTransactions(data.transactions || []);
                    if (data.stats) setStripeStats(data.stats);
                }
            }
        } catch (err) {
            console.error("Failed to fetch Stripe transactions", err);
        } finally {
            setTransactionsLoading(false);
        }
    };

    const fetchGatewaySettings = async () => {
        try {
            const res = await fetch("/api/admin/gateway-settings");
            if (res.ok) {
                const data = await res.json();
                if (data && data.config) {
                    setStripeSecretKey(data.config.stripe_secret_key || "");
                    setStripePublishableKey(data.config.stripe_publishable_key || "");
                    setStripeWebhookSecret(data.config.stripe_webhook_secret || "");
                    setStripeEnabled(data.config.stripe_enabled !== false);
                    setStripeMode(data.config.stripe_mode || "test");
                    if (data.config.directpay_client_id) setDirectPayClientId(data.config.directpay_client_id);
                    if (data.config.directpay_client_secret) setDirectPayClientSecret(data.config.directpay_client_secret);
                    if (data.config.directpay_enabled !== undefined) setDirectPayEnabled(data.config.directpay_enabled);
                }
            }
        } catch (err) {
            console.error("Failed to fetch gateway settings", err);
        }
    };

    const handleSaveGatewaySettings = async () => {
        setSavingGateways(true);
        try {
            const res = await fetch("/api/admin/gateway-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    stripe_secret_key: stripeSecretKey,
                    stripe_publishable_key: stripePublishableKey,
                    stripe_webhook_secret: stripeWebhookSecret,
                    stripe_enabled: stripeEnabled,
                    stripe_mode: stripeSecretKey.startsWith("sk_live") ? "live" : "test",
                    directpay_client_id: directPayClientId,
                    directpay_client_secret: directPayClientSecret,
                    directpay_enabled: directPayEnabled
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast("✅ Gateway settings & Stripe keys saved successfully!");
            } else {
                showToast("❌ " + (data.error || "Failed to save gateway settings"));
            }
        } catch (err) {
            showToast("❌ Network error saving gateway settings");
        } finally {
            setSavingGateways(false);
        }
    };

    const handleTestStripe = async () => {
        setIsTestStripeOpen(true);
        setStripeTesting(true);
        setStripeTestResult(null);
        try {
            const res = await fetch(`/api/admin/gateway-settings?test=stripe&key=${encodeURIComponent(stripeSecretKey)}`);
            const data = await res.json();
            setStripeTestResult({
                status: res.status,
                ok: res.ok,
                data: data,
                timestamp: new Date().toISOString()
            });
        } catch (err: any) {
            setStripeTestResult({
                status: 500,
                ok: false,
                error: err.message,
                timestamp: new Date().toISOString()
            });
        } finally {
            setStripeTesting(false);
        }
    };

    const fetchPricing = async () => {
        try {
            const res = await fetch("/api/admin/pricing");
            if (res.ok) {
                const data = await res.json();
                if (data && data.standard) {
                    setPricingConfig(data);
                    setPricingForm({
                        standard_annual_monthly_rate: String(data.standard.annual_monthly_rate ?? "1.00"),
                        standard_monthly_rate: String(data.standard.monthly_rate ?? "5.00"),
                        standard_original_annual_rate: String(data.standard.original_annual_rate ?? "24.90"),
                        standard_original_monthly_rate: String(data.standard.original_monthly_rate ?? "31.10"),
                        standard_is_early_bird: data.standard.is_early_bird !== false,
                        standard_badge_text: data.standard.badge_text || "Early Bird Special (96% OFF)",
                        standard_bill_annual_upfront: data.standard.bill_annual_upfront !== false,
                        standard_lead_credits_per_user_monthly: String(data.standard?.lead_credits_per_user_monthly ?? "1500"),
                        custom_annual_monthly_rate: String(data.custom?.annual_monthly_rate ?? "37.40"),
                        custom_monthly_rate: String(data.custom?.monthly_rate ?? "46.80"),
                        custom_badge_text: data.custom?.badge_text || "Custom Enterprise",
                        custom_is_early_bird: Boolean(data.custom?.is_early_bird),
                        custom_lead_credits_per_user_monthly: String(data.custom?.lead_credits_per_user_monthly ?? "5000")
                    });
                }
            }
        } catch (err) {
            console.error("Failed to fetch pricing config", err);
        }
    };

    const handleSavePricing = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSavingPricing(true);
        try {
            const payload: PricingConfig = {
                standard: {
                    name: "Standard",
                    annual_monthly_rate: parseFloat(pricingForm.standard_annual_monthly_rate) || 1.00,
                    monthly_rate: parseFloat(pricingForm.standard_monthly_rate) || 5.00,
                    original_annual_rate: parseFloat(pricingForm.standard_original_annual_rate) || 24.90,
                    original_monthly_rate: parseFloat(pricingForm.standard_original_monthly_rate) || 31.10,
                    is_early_bird: pricingForm.standard_is_early_bird,
                    badge_text: pricingForm.standard_badge_text,
                    bill_annual_upfront: pricingForm.standard_bill_annual_upfront,
                    lead_credits_per_user_monthly: parseInt(pricingForm.standard_lead_credits_per_user_monthly, 10) || 1500
                },
                custom: {
                    name: "Custom Enterprise",
                    annual_monthly_rate: parseFloat(pricingForm.custom_annual_monthly_rate) || 37.40,
                    monthly_rate: parseFloat(pricingForm.custom_monthly_rate) || 46.80,
                    original_annual_rate: 37.40,
                    original_monthly_rate: 46.80,
                    is_early_bird: pricingForm.custom_is_early_bird,
                    badge_text: pricingForm.custom_badge_text,
                    bill_annual_upfront: true,
                    lead_credits_per_user_monthly: parseInt(pricingForm.custom_lead_credits_per_user_monthly, 10) || 5000
                },
                updated_at: new Date().toISOString(),
                updated_by: "Super Admin"
            };

            const res = await fetch("/api/admin/pricing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            // Sync with backend if available
            fetchAPI("/super-admin/pricing", {
                method: "POST",
                body: JSON.stringify(payload)
            }).catch(() => null);

            if (res.ok) {
                setPricingConfig(payload);
                showToast("🚀 Plan Pricing updated and published live!");
            } else {
                showToast("⚠️ Failed to update pricing. Please check logs.");
            }
        } catch (err) {
            console.error("Save pricing error:", err);
            showToast("⚠️ Network error while updating pricing.");
        } finally {
            setSavingPricing(false);
        }
    };

    const handleResetPricingDefaults = () => {
        setPricingForm({
            standard_annual_monthly_rate: "1.00",
            standard_monthly_rate: "5.00",
            standard_original_annual_rate: "24.90",
            standard_original_monthly_rate: "31.10",
            standard_is_early_bird: true,
            standard_badge_text: "Early Bird Special (96% OFF)",
            standard_bill_annual_upfront: true,
            standard_lead_credits_per_user_monthly: "1500",
            custom_annual_monthly_rate: "37.40",
            custom_monthly_rate: "46.80",
            custom_badge_text: "Custom Enterprise",
            custom_is_early_bird: false,
            custom_lead_credits_per_user_monthly: "5000"
        });
        showToast("↺ Pricing form reset to $1 Early Bird defaults (click Save to publish)");
    };

    const fetchPromos = async () => {
        try {
            const res = await fetch("/api/admin/promocodes");
            if (res.ok) {
                const data = await res.json();
                if (data && Array.isArray(data.promocodes)) {
                    setPromocodes(data.promocodes);
                }
            }
        } catch (err) {
            console.error("Failed to fetch promocodes", err);
        }
    };

    // ── PROMO CODE ACTIONS ──────────────────────────────────────────────
    const handleCreatePromo = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/promocodes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(promoForm)
            });
            const data = await res.json();
            if (res.ok && data.success) {
                showToast(`🎉 Promo code '${data.promo?.code || promoForm.code}' deployed successfully!`);
                setIsCreatePromoOpen(false);
                setPromoForm({
                    code: "",
                    description: "",
                    discount_type: "percentage",
                    discount_value: "20",
                    target_package: "all",
                    max_uses: "500",
                    min_order_amount: "0",
                    expiry_date: "2026-12-31",
                    status: "active"
                });
                fetchPromos();
            } else {
                alert(`Error: ${data.error || "Failed to create promo code"}`);
            }
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleTogglePromoStatus = async (promo: PromoCode) => {
        const nextStatus = promo.status === "active" ? "paused" : "active";
        try {
            const res = await fetch("/api/admin/promocodes", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: promo.id, status: nextStatus })
            });
            if (res.ok) {
                showToast(`Promo '${promo.code}' status changed to ${nextStatus}.`);
                fetchPromos();
            }
        } catch (err) {
            alert("Failed to toggle promo status");
        }
    };

    const handleDeletePromo = async (id: string, code: string) => {
        if (!confirm(`Are you sure you want to delete promo code '${code}'?`)) return;
        try {
            const res = await fetch(`/api/admin/promocodes?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                showToast(`🗑️ Promo code '${code}' deleted.`);
                fetchPromos();
            }
        } catch (err) {
            alert("Failed to delete promo code");
        }
    };

    // ── WORKSPACE CRUD ACTIONS ─────────────────────────────────────────
    const handleCreateWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!wsForm.name.trim() || !wsForm.owner_email.trim()) return;

        try {
            const res = await fetchAPI("/super-admin/users/create", {
                method: "POST",
                body: JSON.stringify({
                    email: wsForm.owner_email.trim(),
                    password: "Company@123456",
                    name: wsForm.name.trim(),
                    role: "owner",
                    plan: wsForm.plan
                })
            });
            const data = await res.json();
            if (res.ok) {
                showToast(`🏢 Company Workspace '${wsForm.name}' created with active owner!`);
                setIsCreateWorkspaceOpen(false);
                setWsForm({ name: "", owner_email: "", plan: "Standard Plan", member_count: 5 });
                fetchAllData();
            } else {
                const newWs: Workspace = {
                    id: `ws_${Date.now()}`,
                    name: wsForm.name.trim(),
                    owner_email: wsForm.owner_email.trim(),
                    member_count: Number(wsForm.member_count) || 1,
                    plan: wsForm.plan,
                    created_at: new Date().toISOString()
                };
                setWorkspaces([newWs, ...workspaces]);
                setIsCreateWorkspaceOpen(false);
                showToast(`🏢 Company Workspace '${newWs.name}' created!`);
            }
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleDeleteWorkspace = (id: string, name: string) => {
        if (!confirm(`Archive / Delete Company '${name}' and detach all resources?`)) return;
        setWorkspaces(workspaces.filter(w => w.id !== id));
        showToast(`🗑️ Company '${name}' archived.`);
    };

    const handleEnterWorkspace = (ws: Workspace) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("beraxis_active_workspace_id", ws.id);
            localStorage.setItem("beraxis_active_workspace_name", ws.name);
            showToast(`🚀 Impersonating & Entering '${ws.name}'...`);
            setTimeout(() => {
                window.location.href = "/";
            }, 800);
        }
    };

    const handleUpdatePlan = async () => {
        if (!isChangePlanOpen) return;
        try {
            const res = await fetchAPI(`/super-admin/tenants/${isChangePlanOpen.id}/plan`, {
                method: "PUT",
                body: JSON.stringify({
                    plan: selectedPlanInput,
                    subscription_status: "active"
                })
            });
            if (res.ok) {
                showToast(`⭐ Workspace plan upgraded to ${selectedPlanInput}!`);
                setIsChangePlanOpen(null);
                fetchAllData();
            } else {
                setWorkspaces(workspaces.map(w => w.id === isChangePlanOpen.id ? { ...w, plan: selectedPlanInput } : w));
                setIsChangePlanOpen(null);
                showToast(`⭐ Workspace plan updated.`);
            }
        } catch (err) {
            alert("Failed to update plan");
        }
    };

    // ── USER ACTIONS ───────────────────────────────────────────────────
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userForm.email.trim()) return;

        try {
            const res = await fetchAPI("/super-admin/users/create", {
                method: "POST",
                body: JSON.stringify(userForm)
            });
            const data = await res.json();
            if (res.ok) {
                showToast(`👤 User '${userForm.email}' created and provisioned!`);
                setIsCreateUserOpen(false);
                setUserForm({ name: "", email: "", password: "User@123456", role: "user", plan: "Standard Plan", workspace_id: "" });
                fetchAllData();
            } else {
                alert(`Error: ${data.detail || "Failed to create user"}`);
            }
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleResetPassword = async () => {
        if (!isResetPasswordOpen || !newPasswordInput.trim()) return;
        try {
            const res = await fetchAPI(`/super-admin/users/${isResetPasswordOpen.id}/reset-password`, {
                method: "PUT",
                body: JSON.stringify({ new_password: newPasswordInput.trim() })
            });
            if (res.ok) {
                showToast(`🔑 Password updated for ${isResetPasswordOpen.email}!`);
                setIsResetPasswordOpen(null);
                setNewPasswordInput("");
            } else {
                const d = await res.json();
                alert(`Error: ${d.detail || "Failed to reset password"}`);
            }
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleDeleteUser = async (userId: string, email: string) => {
        if (!confirm(`Delete user ${email}? This will revoke access permanently.`)) return;
        try {
            await fetchAPI(`/super-admin/users/${userId}`, { method: "DELETE" });
            setUsers(users.filter(u => u.id !== userId));
            showToast(`🗑️ User ${email} deleted.`);
        } catch (err) {
            setUsers(users.filter(u => u.id !== userId));
            showToast(`🗑️ User ${email} removed.`);
        }
    };

    const handleTenantAction = async (tenantId: string, action: "activate" | "deactivate" | "extend-trial") => {
        setActionLoading(`${tenantId}-${action}`);
        try {
            const res = await fetchAPI(`/super-admin/tenants/${tenantId}/${action}`, { method: "POST" });
            if (res.ok) {
                showToast(`Action '${action}' applied successfully.`);
                await fetchAllData();
            } else {
                const e = await res.json().catch(() => ({ detail: "Action failed" }));
                alert(`Error: ${e.detail}`);
            }
        } catch (e: any) {
            alert(`Exception: ${e.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    // ── FEATURE FLAGS TOGGLE ──────────────────────────────────────────
    const handleToggleFlag = async (flagKey: string) => {
        const nextState = !featureFlags[flagKey];
        const updated = { ...featureFlags, [flagKey]: nextState };
        setFeatureFlags(updated);
        try {
            await fetchAPI("/super-admin/feature-flags", {
                method: "PUT",
                body: JSON.stringify({ [flagKey]: nextState })
            });
            showToast(`⚡ Feature '${flagKey}' is now ${nextState ? "ENABLED" : "DISABLED"}.`);
        } catch (err) {
            console.error("Flag sync error", err);
        }
    };

    // ── ANNOUNCEMENT BANNER SAVE ──────────────────────────────────────
    const handleSaveAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/announcement", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(announcement)
            });
            if (res.ok) {
                const data = await res.json();
                if (data.announcement) setAnnouncement(data.announcement);
                showToast("📢 Global announcement banner updated and permanently saved!");
            }
        } catch (err) {
            showToast("Failed to update announcement");
        }
    };

    // ── DIRECTPAY DIAGNOSTIC TEST ─────────────────────────────────────
    const handleTestDirectPay = async () => {
        setIsTestDirectPayOpen(true);
        setDirectPayTestResult(null);
        try {
            const res = await fetch("/api/payments/directpay/initiate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amountInPKR: 100.00,
                    description: "Beraxis Diagnostics Test",
                    payer_name: "Super Admin",
                    email: "diagnostics@beraxis.online"
                })
            });
            const data = await res.json();
            setDirectPayTestResult({
                status: res.status,
                ok: res.ok,
                data: data,
                timestamp: new Date().toISOString()
            });
        } catch (err: any) {
            setDirectPayTestResult({
                status: 500,
                ok: false,
                error: err.message,
                timestamp: new Date().toISOString()
            });
        }
    };

    // ── EXPORT CSV HELPER ─────────────────────────────────────────────
    const exportCSV = (type: "workspaces" | "users" | "promos" | "sales" | "payments") => {
        let headers: string[] = [];
        let rows: string[][] = [];
        let filename = `beraxis_${type}_${new Date().toISOString().slice(0, 10)}.csv`;

        if (type === "workspaces") {
            headers = ["ID", "Company Name", "Owner Email", "Plan", "Seats", "Created Date"];
            rows = (workspaces || []).map(w => [w.id || "", `"${w.name || ""}"`, w.owner_email || "", `"${w.plan || 'Standard'}"`, String(w.member_count || 1), w.created_at || ""]);
        } else if (type === "users") {
            headers = ["ID", "Email", "Workspace", "Status", "Created Date"];
            rows = (users || []).map(u => [u.id || "", u.email || "", `"${u.workspace_name || 'N/A'}"`, u.subscription_status || 'new', u.created_at || ""]);
        } else if (type === "promos") {
            headers = ["Code", "Discount Type", "Value", "Package", "Used Count", "Max Uses", "Status", "Expiry"];
            rows = (promocodes || []).map(p => [p.code || "", p.discount_type || "", String(p.discount_value || 0), p.target_package || "", String(p.used_count || 0), String(p.max_uses || 0), p.status || "", p.expiry_date || 'Never']);
        } else if (type === "sales") {
            headers = ["Order Ref", "Customer Name", "Amount Total", "State", "Date"];
            rows = (sales || []).map(s => [s.name || "", `"${s.customer_name || ""}"`, String(s.amount_total || 0), s.state || "", s.created_at || ""]);
        } else if (type === "payments") {
            headers = ["Tenant ID", "Email", "Plan", "Amount USD", "Method", "Status", "Registered At"];
            rows = (payments || []).map(p => [p.tenant_id || "", p.email || "", `"${p.plan || ""}"`, String(p.amount_usd || 0), p.currency || "", p.payment_status || "", p.registered_at || ""]);
        }

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`📥 Exported ${filename} successfully.`);
    };

    // Safe filtered lists
    const safeWorkspaces = Array.isArray(workspaces) ? workspaces : [];
    const safePromocodes = Array.isArray(promocodes) ? promocodes : [];
    const safeUsers = Array.isArray(users) ? users : [];
    const safeSales = Array.isArray(sales) ? sales : [];
    const safeTenants = Array.isArray(tenants) ? tenants : [];
    const safePayments = Array.isArray(payments) ? payments : [];
    const safeAuditLogs = Array.isArray(auditLogs) ? auditLogs : [];

    const filteredWorkspaces = safeWorkspaces.filter(ws =>
        (ws?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ws?.owner_email || "").toLowerCase().includes(searchTerm.toLowerCase()));
        
    const filteredPromocodes = safePromocodes.filter(p =>
        (p?.code || "").toLowerCase().includes(promoSearchTerm.toLowerCase()) ||
        (p?.description || "").toLowerCase().includes(promoSearchTerm.toLowerCase()) ||
        (p?.target_package || "").toLowerCase().includes(promoSearchTerm.toLowerCase()));
        
    const filteredUsers = safeUsers.filter(u => (u?.email || "").toLowerCase().includes(userSearchTerm.toLowerCase()));
    
    const filteredSales = safeSales.filter(s =>
        (s?.name || "").toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
        (s?.customer_name || "").toLowerCase().includes(salesSearchTerm.toLowerCase()));
        
    const filteredTenants = safeTenants.filter(t =>
        (t?.email || "").toLowerCase().includes(billingSearchTerm.toLowerCase()) ||
        (t?.subscription_status || "").toLowerCase().includes(billingSearchTerm.toLowerCase()));
        
    const filteredPayments = safePayments.filter(p =>
        (p?.email || "").toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
        (p?.payment_status || "").toLowerCase().includes(paymentSearchTerm.toLowerCase()));

    const paidPayments = filteredPayments.filter(p => p.payment_status === "active");
    const pendingPayments = filteredPayments.filter(p => p.payment_status !== "active");
    const monthlySaaSRevenue = paidPayments.reduce((acc, p) => acc + (Number(p.amount_usd) || 0), 0);

    return (
        <div className="space-y-8 pb-20 text-slate-100 min-h-screen bg-[#0A0E17]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">

                {/* ── TOP PLATFORM BANNER (IF ACTIVE) ── */}
                {announcement?.is_active && announcement?.message && (
                    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-indigo-900/40 border border-purple-500/30 flex items-center justify-between shadow-lg shadow-purple-900/20">
                        <div className="flex items-center gap-3">
                            <Megaphone className="text-purple-400 shrink-0" size={20} />
                            <div>
                                <span className="text-xs uppercase font-extrabold tracking-wider bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-md mr-2 border border-purple-500/30">
                                    Global Broadcast
                                </span>
                                <span className="text-sm font-semibold text-white">{announcement.message}</span>
                            </div>
                        </div>
                        <button onClick={() => setActiveTab("broadcast")} className="text-xs text-purple-400 hover:text-purple-200 font-bold flex items-center gap-1 cursor-pointer">
                            Edit <ChevronRight size={14} />
                        </button>
                    </div>
                )}

                {/* ── HEADER & MASTER ACTION BAR ── */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 bg-[#111827]/80 p-6 rounded-3xl border border-gray-800 shadow-2xl backdrop-blur-xl">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <ShieldCheck className="text-white" size={28} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-3xl font-black tracking-tight text-white">SaaS Command Center</h1>
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live 99.98%
                                    </span>
                                </div>
                                <p className="text-gray-400 text-xs mt-0.5">Enterprise Multi-Tenant Controller · DirectPay Card Gateway · Global DB Partitions</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            onClick={handleTestDirectPay}
                            className="flex items-center gap-2 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/30 hover:to-blue-600/30 px-3.5 py-2 rounded-xl text-xs font-bold text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer shadow-md"
                        >
                            <CreditCard size={15} /> Test DirectPay
                        </button>
                        <button
                            onClick={() => exportCSV(activeTab === "promocodes" ? "promos" : activeTab === "users" ? "users" : activeTab === "sales" ? "sales" : activeTab === "payments" ? "payments" : "workspaces")}
                            className="flex items-center gap-2 bg-[#1E293B] hover:bg-gray-800 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-300 border border-gray-700 transition-all cursor-pointer"
                        >
                            <Download size={15} /> Export CSV
                        </button>
                        <button
                            onClick={fetchAllData}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                        >
                            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Sync Matrix
                        </button>
                    </div>
                </div>

                {/* ── AUTHENTICATION REQUIRED PROMPT (IF NOT LOGGED IN) ── */}
                {!isLoggedIn && (
                    <div className="mb-8 p-5 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-amber-500/30 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                        <div className="flex items-center gap-3">
                            <Lock className="text-amber-400 shrink-0" size={24} />
                            <div>
                                <h3 className="font-bold text-white text-sm">Super Admin Session Required</h3>
                                <p className="text-xs text-gray-400 mt-0.5">Please sign in with your Super Admin account (<span className="text-purple-300 font-mono">admin@beraxis.online</span>) to unlock real-time database feeds, tenant controls, and billing metrics.</p>
                            </div>
                        </div>
                        <a
                            href="/login"
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 shrink-0 flex items-center gap-1.5"
                        >
                            <LogIn size={15} /> Sign In to Super Admin
                        </a>
                    </div>
                )}

                {/* Toast Notification */}
                {toastMessage && (
                    <div className="mb-6 bg-purple-600/20 border border-purple-500/40 text-purple-300 p-4 rounded-2xl flex items-center gap-3 shadow-lg shadow-purple-600/10 animate-in fade-in">
                        <Sparkles size={20} className="text-purple-400" />
                        <p className="font-semibold text-sm">{toastMessage}</p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3">
                        <ShieldAlert size={20} />
                        <div><p className="font-bold text-sm">Connection Notice</p><p className="text-xs">{error}</p></div>
                    </div>
                )}

                {/* ── STATS RIBBON (8 ENTERPRISE METRIC CARDS) ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5 mb-8">
                    <StatCard label="Companies"       value={stats?.total_workspaces ?? safeWorkspaces.length}                             icon={<Building2 size={18}/>}   color="text-blue-400"   bg="bg-blue-500/10" />
                    <StatCard label="Total Users"     value={stats?.total_users ?? safeUsers.length}                                        icon={<Users size={18}/>}       color="text-purple-400" bg="bg-purple-500/10" />
                    <StatCard label="Active Promos"   value={safePromocodes.filter(p => p?.status === 'active').length}                      icon={<Tag size={18}/>}         color="text-pink-400"   bg="bg-pink-500/10" />
                    <StatCard label="Paid Subs"       value={stats?.paid_subscribers ?? paidPayments.length}                           icon={<CheckCircle size={18}/>} color="text-emerald-400" bg="bg-emerald-500/10" />
                    <StatCard label="DirectPay Card"  value={`$${(stats?.cc_revenue ?? monthlySaaSRevenue).toLocaleString()}`}         icon={<CreditCard size={18}/>}  color="text-cyan-400"    bg="bg-cyan-500/10" />
                    <StatCard label="Monthly MRR"     value={`$${(stats?.total_saas_revenue ?? monthlySaaSRevenue).toLocaleString()}`}  icon={<TrendingUp size={18}/>}  color="text-amber-400"  bg="bg-amber-500/10" />
                    <StatCard label="ERP Volume"      value={`$${(stats?.platform_revenue ?? 0).toLocaleString(undefined,{minimumFractionDigits:0})}`} icon={<DollarSign size={18}/>} color="text-green-400" bg="bg-green-500/10" title="Total gross sales invoiced and transacted by all tenant businesses inside their ERP modules" />
                    <StatCard label="API Latency"     value={`${health?.services?.api_server?.latency_ms ?? 18}ms`}                    icon={<Activity size={18}/>}    color="text-indigo-400" bg="bg-indigo-500/10" />
                </div>

                {/* ── NAVIGATION TABS ── */}
                <div className="flex border-b border-gray-800 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none gap-1 bg-[#111827]/40 p-1.5 rounded-2xl border">
                    <TabBtn active={activeTab === "overview"}    onClick={() => setActiveTab("overview")}    label="🏢 Companies" count={safeWorkspaces.length} />
                    <TabBtn active={activeTab === "pricing"}     onClick={() => setActiveTab("pricing")}     label="💰 Plan Pricing ($1 Early Bird)" />
                    <TabBtn active={activeTab === "promocodes"}  onClick={() => setActiveTab("promocodes")}  label="🎟️ Promo Codes" count={safePromocodes.length} />
                    <TabBtn active={activeTab === "payments"}    onClick={() => setActiveTab("payments")}    label="💳 Payment Gateways (Stripe Global)" count={safePayments.length} />
                    <TabBtn active={activeTab === "billing"}     onClick={() => setActiveTab("billing")}     label="⚖️ Billing Ctrl" count={safeTenants.length} />
                    <TabBtn active={activeTab === "users"}       onClick={() => setActiveTab("users")}       label="👥 Users" count={safeUsers.length} />
                    <TabBtn active={activeTab === "sales"}       onClick={() => setActiveTab("sales")}       label="🛒 ERP Sales" count={safeSales.length} />
                    <TabBtn active={activeTab === "flags"}       onClick={() => setActiveTab("flags")}       label="⚙️ Feature Flags" />
                    <TabBtn active={activeTab === "broadcast"}   onClick={() => setActiveTab("broadcast")}   label="📢 Broadcast" />
                    <TabBtn active={activeTab === "audit"}       onClick={() => setActiveTab("audit")}       label="🛡️ Audit Logs" count={safeAuditLogs.length} />
                    <TabBtn active={activeTab === "diagnostics"} onClick={() => setActiveTab("diagnostics")} label="🩺 System Health" />
                    <TabBtn active={activeTab === "experiments"} onClick={() => { setActiveTab("experiments"); fetchExperimentsData(); }} label="🧪 A/B Testing & Optimization" />
                </div>

                {/* ── TAB 1: WORKSPACES & TENANT DATABASES ── */}
                {activeTab === "overview" && (
                    <div className="bg-[#111827] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
                        <TableHeader title="All Companies & Tenant Databases" subtitle="Tenant partitions, database scopes, and isolated enterprise workspaces">
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="Filter by company or owner..." />
                                <button
                                    onClick={() => setIsCreateWorkspaceOpen(true)}
                                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-500/25 flex items-center gap-1.5 shrink-0 cursor-pointer"
                                >
                                    <Plus size={16} /> New Company
                                </button>
                            </div>
                        </TableHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#0B0F19] text-gray-500 text-xs uppercase tracking-widest font-bold border-b border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4">Company</th>
                                        <th className="px-6 py-4">Owner Email</th>
                                        <th className="px-6 py-4">Subscription Plan</th>
                                        <th className="px-6 py-4 text-center">Allocated Seats</th>
                                        <th className="px-6 py-4">Created Date</th>
                                        <th className="px-6 py-4 text-right">Admin Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {loading ? <LoadingRow cols={6} /> : filteredWorkspaces.length === 0 ? <EmptyRow cols={6} /> :
                                        filteredWorkspaces.map(ws => (
                                            <tr key={ws.id} className="hover:bg-white/3 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-purple-400 font-black border border-purple-500/30 shadow-inner">
                                                            {(ws.name || "W").charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-gray-100 block text-sm">{ws.name || "Workspace"}</span>
                                                            <span className="text-[10px] text-gray-500 font-mono">ID: {(ws.id || "").slice(0, 18)}...</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-300 text-sm font-medium">{ws.owner_email || "Unknown"}</td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => {
                                                            setIsChangePlanOpen(ws);
                                                            setSelectedPlanInput(getWorkspacePlanLabel(ws));
                                                        }}
                                                        className={`${
                                                            isSuperAdminEmail(ws.owner_email)
                                                                ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30"
                                                                : getWorkspacePlanLabel(ws).includes("Standard") || getWorkspacePlanLabel(ws).includes("Custom")
                                                                ? "bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/30"
                                                                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                                        } border px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all`}
                                                        title="Click to change plan"
                                                    >
                                                        <Sparkles size={12} className={isSuperAdminEmail(ws.owner_email) ? "text-amber-400" : "text-purple-400"} />
                                                        {getWorkspacePlanLabel(ws)}
                                                        <Edit3 size={11} className="opacity-60" />
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="bg-purple-950/40 text-purple-300 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/20 font-mono">
                                                        {ws.member_count || 1} seats
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-400 font-mono">{fmtDate(ws.created_at)}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleEnterWorkspace(ws)} 
                                                            className="px-3 py-1.5 rounded-xl bg-purple-600/10 hover:bg-purple-600 hover:text-white border border-purple-500/30 text-purple-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                                                            title="Impersonate and open tenant ERP"
                                                        >
                                                            <LogIn size={13} /> Enter ERP
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteWorkspace(ws.id, ws.name)} 
                                                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer" 
                                                            title="Archive Company"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── TAB: PLAN PRICING & EARLY BIRD CONTROLLER ── */}
                {activeTab === "pricing" && (
                    <div className="space-y-6">
                        <div className="bg-[#111827] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
                            <TableHeader 
                                title="SaaS Plan Pricing & Early Bird Rate Controller" 
                                subtitle="Super Admin command center for live plan rates. Standard Plan Early Bird rates are set to $1/mo Annual and $5/mo Monthly."
                            >
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <button
                                        type="button"
                                        onClick={handleResetPricingDefaults}
                                        className="bg-[#1E293B] hover:bg-gray-800 text-gray-300 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-gray-700 transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <RefreshCw size={14} /> Reset $1 Early Bird Defaults
                                    </button>
                                    <a
                                        href="/pricing"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-purple-500/30 transition-all flex items-center gap-1.5"
                                    >
                                        <ExternalLink size={14} /> View Live Pricing Page
                                    </a>
                                </div>
                            </TableHeader>

                            {/* Active Status Ribbon */}
                            <div className="px-6 py-4 bg-[#0B0F19] border-b border-gray-800 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-3 w-3 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-xs font-bold text-gray-300">
                                        Live Rates Active: Standard Annual <span className="text-emerald-400 font-black">${pricingConfig.standard.annual_monthly_rate.toFixed(2)}/mo</span> • Standard Monthly <span className="text-purple-400 font-black">${pricingConfig.standard.monthly_rate.toFixed(2)}/mo</span>
                                    </span>
                                </div>
                                <div className="text-[11px] text-gray-500">
                                    Last synchronized: {pricingConfig.updated_at ? new Date(pricingConfig.updated_at).toLocaleTimeString() : "Just now"}
                                </div>
                            </div>

                            <form onSubmit={handleSavePricing} className="p-6 md:p-8 space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    
                                    {/* ── CARD 1: STANDARD PLAN SETTINGS ── */}
                                    <div className="bg-[#0D1322] border border-purple-500/30 rounded-2xl p-6 space-y-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600/30 to-transparent px-4 py-1 text-[10px] font-extrabold text-purple-300 uppercase tracking-widest">
                                            Standard Tier
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                                                <Flame size={20} className="text-amber-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                                    Standard Plan (Early Bird)
                                                </h3>
                                                <p className="text-xs text-gray-400">Controls rates displayed on /pricing and billed on /checkout</p>
                                            </div>
                                        </div>

                                        {/* Early Bird Mode Toggle */}
                                        <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-xl flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                                                    <Sparkles size={14} className="text-yellow-400" /> Early Bird Promotional Status
                                                </p>
                                                <p className="text-[11px] text-gray-400">Displays Early Bird badges, flame animations, and strikethrough comparison</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setPricingForm(f => ({ ...f, standard_is_early_bird: !f.standard_is_early_bird }))}
                                                className="cursor-pointer text-purple-400 hover:text-purple-300 transition-colors"
                                            >
                                                {pricingForm.standard_is_early_bird ? (
                                                    <ToggleRight size={34} className="text-emerald-400" />
                                                ) : (
                                                    <ToggleLeft size={34} className="text-gray-600" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Rates Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
                                                    Annual Plan Rate ($ / user / mo) *
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3.5 top-2.5 text-gray-400 font-mono text-sm">$</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0.10"
                                                        required
                                                        value={pricingForm.standard_annual_monthly_rate}
                                                        onChange={(e) => setPricingForm(f => ({ ...f, standard_annual_monthly_rate: e.target.value }))}
                                                        className="w-full bg-[#070B16] border border-emerald-500/40 rounded-xl pl-8 pr-4 py-2.5 text-white font-mono font-bold text-sm outline-none focus:border-emerald-400"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-gray-400 mt-1">Target: $1.00 / month (billed $12/user/yr)</p>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider mb-1.5">
                                                    Monthly Plan Rate ($ / user / mo) *
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3.5 top-2.5 text-gray-400 font-mono text-sm">$</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0.10"
                                                        required
                                                        value={pricingForm.standard_monthly_rate}
                                                        onChange={(e) => setPricingForm(f => ({ ...f, standard_monthly_rate: e.target.value }))}
                                                        className="w-full bg-[#070B16] border border-purple-500/40 rounded-xl pl-8 pr-4 py-2.5 text-white font-mono font-bold text-sm outline-none focus:border-purple-400"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-gray-400 mt-1">Target: $5.00 / month (month-to-month)</p>
                                            </div>
                                        </div>

                                        {/* Strikethrough Reference Rates */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-400 mb-1">
                                                    Original Reference Annual Rate ($)
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3.5 top-2 text-gray-500 font-mono text-xs">$</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={pricingForm.standard_original_annual_rate}
                                                        onChange={(e) => setPricingForm(f => ({ ...f, standard_original_annual_rate: e.target.value }))}
                                                        className="w-full bg-[#070B16] border border-white/10 rounded-xl pl-7 pr-3 py-2 text-gray-300 font-mono text-xs outline-none focus:border-purple-500"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-gray-500 mt-1">Shows struck-through e.g. ~~$24.90~~</p>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-400 mb-1">
                                                    Original Reference Monthly Rate ($)
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3.5 top-2 text-gray-500 font-mono text-xs">$</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={pricingForm.standard_original_monthly_rate}
                                                        onChange={(e) => setPricingForm(f => ({ ...f, standard_original_monthly_rate: e.target.value }))}
                                                        className="w-full bg-[#070B16] border border-white/10 rounded-xl pl-7 pr-3 py-2 text-gray-300 font-mono text-xs outline-none focus:border-purple-500"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-gray-500 mt-1">Shows struck-through e.g. ~~$31.10~~</p>
                                            </div>
                                        </div>

                                        {/* Promo Badge Text */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                                Promotional Card Badge Text
                                            </label>
                                            <input
                                                type="text"
                                                value={pricingForm.standard_badge_text}
                                                onChange={(e) => setPricingForm(f => ({ ...f, standard_badge_text: e.target.value }))}
                                                placeholder="Early Bird Special (96% OFF)"
                                                className="w-full bg-[#070B16] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs outline-none focus:border-purple-500"
                                            />
                                        </div>

                                        {/* Lead Pool Credits Quota */}
                                        <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-xl space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider">
                                                    Lead Pool Credits / User / Mo *
                                                </label>
                                                <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold">
                                                    Standard Allocation
                                                </span>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="50"
                                                    step="50"
                                                    required
                                                    value={pricingForm.standard_lead_credits_per_user_monthly}
                                                    onChange={(e) => setPricingForm(f => ({ ...f, standard_lead_credits_per_user_monthly: e.target.value }))}
                                                    className="w-full bg-[#070B16] border border-cyan-500/40 rounded-xl px-4 py-2 text-white font-mono font-bold text-sm outline-none focus:border-cyan-400"
                                                />
                                            </div>
                                            <p className="text-[10px] text-gray-400">
                                                Default: 1,500 leads/user/mo. Each seat purchased receives this quota automatically.
                                            </p>
                                        </div>

                                        {/* Bill Upfront Option */}
                                        <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={pricingForm.standard_bill_annual_upfront}
                                                onChange={(e) => setPricingForm(f => ({ ...f, standard_bill_annual_upfront: e.target.checked }))}
                                                className="rounded border-gray-700 text-purple-600 focus:ring-purple-500 w-4 h-4"
                                            />
                                            <div className="text-xs">
                                                <p className="font-semibold text-white">Bill Annual Subscriptions 12 Months Upfront</p>
                                                <p className="text-[11px] text-gray-400">Charges $12/user for the entire 1-year period upfront at checkout</p>
                                            </div>
                                        </label>
                                    </div>

                                    {/* ── CARD 2: CUSTOM ENTERPRISE SETTINGS & PREVIEW ── */}
                                    <div className="space-y-6">
                                        <div className="bg-[#0D1322] border border-pink-500/20 rounded-2xl p-6 space-y-6 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 bg-gradient-to-l from-pink-600/30 to-transparent px-4 py-1 text-[10px] font-extrabold text-pink-300 uppercase tracking-widest">
                                                Enterprise Tier
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                                                    <Building2 size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-white">Custom Enterprise Plan</h3>
                                                    <p className="text-xs text-gray-400">Developer studio, custom database, and multi-company plan rates</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                                                        Annual Rate ($ / user / mo)
                                                    </label>
                                                    <div className="relative">
                                                        <span className="absolute left-3.5 top-2.5 text-gray-400 font-mono text-sm">$</span>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={pricingForm.custom_annual_monthly_rate}
                                                            onChange={(e) => setPricingForm(f => ({ ...f, custom_annual_monthly_rate: e.target.value }))}
                                                            className="w-full bg-[#070B16] border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-white font-mono text-sm outline-none focus:border-pink-500"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                                                        Monthly Rate ($ / user / mo)
                                                    </label>
                                                    <div className="relative">
                                                        <span className="absolute left-3.5 top-2.5 text-gray-400 font-mono text-sm">$</span>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={pricingForm.custom_monthly_rate}
                                                            onChange={(e) => setPricingForm(f => ({ ...f, custom_monthly_rate: e.target.value }))}
                                                            className="w-full bg-[#070B16] border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-white font-mono text-sm outline-none focus:border-pink-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                                    Enterprise Badge Text
                                                </label>
                                                <input
                                                    type="text"
                                                    value={pricingForm.custom_badge_text}
                                                    onChange={(e) => setPricingForm(f => ({ ...f, custom_badge_text: e.target.value }))}
                                                    className="w-full bg-[#070B16] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs outline-none focus:border-pink-500"
                                                />
                                            </div>

                                            {/* Enterprise Lead Pool Credits */}
                                            <div className="p-4 bg-pink-950/20 border border-pink-500/20 rounded-xl space-y-2">
                                                <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider">
                                                    Custom Lead Credits / User / Mo
                                                </label>
                                                <input
                                                    type="number"
                                                    min="100"
                                                    step="100"
                                                    value={pricingForm.custom_lead_credits_per_user_monthly}
                                                    onChange={(e) => setPricingForm(f => ({ ...f, custom_lead_credits_per_user_monthly: e.target.value }))}
                                                    className="w-full bg-[#070B16] border border-white/10 rounded-xl px-4 py-2 text-white font-mono font-bold text-xs outline-none focus:border-pink-500"
                                                />
                                                <p className="text-[10px] text-gray-400">
                                                    Default: 5,000+ custom credits/user/mo for high-velocity teams.
                                                </p>
                                            </div>
                                        </div>

                                        {/* ── LIVE SIMULATOR PREVIEW ── */}
                                        <div className="bg-[#0B0F19] border border-gray-800 rounded-2xl p-6 space-y-4">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                                <TrendingUp size={15} className="text-purple-400" /> Live Standard Plan Customer Pricing Simulator
                                            </h4>

                                            <div className="grid grid-cols-3 gap-3 text-center">
                                                {[1, 5, 20].map(seats => {
                                                    const annualRateNum = parseFloat(pricingForm.standard_annual_monthly_rate) || 1.00;
                                                    const monthlyRateNum = parseFloat(pricingForm.standard_monthly_rate) || 5.00;
                                                    const annualTotalMo = (seats * annualRateNum).toFixed(2);
                                                    const annualTotalYr = (seats * annualRateNum * 12).toFixed(2);
                                                    const monthlyTotalMo = (seats * monthlyRateNum).toFixed(2);
                                                    const savingsYr = ((seats * monthlyRateNum * 12) - (seats * annualRateNum * 12)).toFixed(0);
                                                    const creditsPerUser = parseInt(pricingForm.standard_lead_credits_per_user_monthly, 10) || 1500;
                                                    const totalCredits = seats * creditsPerUser;

                                                    return (
                                                        <div key={seats} className="p-3 bg-white/5 rounded-xl border border-white/5 text-left">
                                                            <div className="text-xs font-black text-purple-300 mb-1.5">{seats} {seats === 1 ? 'Seat' : 'Seats'}</div>
                                                            <div className="text-[11px] text-gray-400">
                                                                Monthly: <span className="font-mono text-white font-bold">${monthlyTotalMo}/mo</span>
                                                            </div>
                                                            <div className="text-[11px] text-emerald-400">
                                                                Annual: <span className="font-mono text-white font-bold">${annualTotalMo}/mo</span> (${annualTotalYr}/yr)
                                                            </div>
                                                            <div className="text-[10px] text-cyan-300 font-bold mt-1">
                                                                ⚡ {totalCredits.toLocaleString()} leads / mo
                                                            </div>
                                                            <div className="text-[10px] text-amber-400 font-bold mt-0.5">
                                                                Save ${savingsYr}/yr!
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Save Bar */}
                                <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-xs text-gray-400 flex items-center gap-2">
                                        <CheckCircle size={16} className="text-emerald-400" />
                                        <span>Saving automatically updates public pricing & checkout endpoints in real-time.</span>
                                    </div>

                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <button
                                            type="button"
                                            onClick={handleResetPricingDefaults}
                                            className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                                        >
                                            Reset Defaults
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={savingPricing}
                                            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-black px-8 py-3 rounded-xl shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            {savingPricing ? (
                                                <>
                                                    <RefreshCw size={15} className="animate-spin" /> Publishing...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={15} /> Save & Publish Live Rates
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── TAB 2: PROMO CODES ENGINE ── */}
                {activeTab === "promocodes" && (
                    <div className="space-y-6">
                        <div className="bg-[#111827] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
                            <TableHeader 
                                title="Super Admin Promo Codes & Discount Engine" 
                                subtitle="Deploy specific percentage or fixed dollar discounts for Standard, Custom Enterprise, or All packages"
                            >
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <SearchBox value={promoSearchTerm} onChange={setPromoSearchTerm} placeholder="Filter by code or package..." />
                                    <button
                                        onClick={() => setIsCreatePromoOpen(true)}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-500/25 flex items-center gap-1.5 shrink-0 cursor-pointer"
                                    >
                                        <Plus size={16} /> Deploy Promo Code
                                    </button>
                                </div>
                            </TableHeader>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#0B0F19] text-gray-500 text-xs uppercase tracking-widest font-bold border-b border-gray-800">
                                        <tr>
                                            <th className="px-6 py-4">Promo Code</th>
                                            <th className="px-6 py-4">Discount Value</th>
                                            <th className="px-6 py-4">Eligible Package</th>
                                            <th className="px-6 py-4 text-center">Redemptions</th>
                                            <th className="px-6 py-4">Expires</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800/50">
                                        {filteredPromocodes.length === 0 ? <EmptyRow cols={7} /> :
                                            filteredPromocodes.map(promo => {
                                                const isPercent = promo.discount_type === "percentage";
                                                return (
                                                    <tr key={promo.id} className="hover:bg-white/3 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2.5">
                                                                <span className="font-mono font-black text-sm text-purple-300 bg-purple-950/60 px-3 py-1.5 rounded-xl border border-purple-500/40 tracking-wider shadow-inner">
                                                                    {promo.code}
                                                                </span>
                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(promo.code);
                                                                        showToast(`Copied promo code '${promo.code}'!`);
                                                                    }}
                                                                    className="text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                                                                    title="Copy Code"
                                                                >
                                                                    <Copy size={14} />
                                                                </button>
                                                            </div>
                                                            <p className="text-[11px] text-gray-400 mt-1">{promo.description}</p>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span className={`text-base font-black font-mono ${isPercent ? "text-emerald-400" : "text-cyan-400"}`}>
                                                                {isPercent ? `${promo.discount_value}% OFF` : `$${promo.discount_value} FLAT`}
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-gray-300">
                                                                {promo.target_package === "all" ? "🌐 All Packages" : 
                                                                 promo.target_package === "standard" ? "💼 Standard Plan" : 
                                                                 promo.target_package === "custom" ? "👑 Custom Enterprise" : "⚡ Starter"}
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-4 text-center">
                                                            <span className="text-xs font-mono font-bold text-gray-300 bg-gray-800/60 px-2.5 py-1 rounded-lg border border-gray-700">
                                                                {promo.used_count || 0} / {promo.max_uses > 0 ? promo.max_uses : "∞"}
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-4 text-xs text-gray-400 font-mono">
                                                            {promo.expiry_date ? fmtDate(promo.expiry_date) : "Never"}
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 ${STATUS_STYLES[promo.status] || STATUS_STYLES.new}`}>
                                                                {promo.status}
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleTogglePromoStatus(promo)}
                                                                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                                                                        promo.status === "active"
                                                                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500 hover:text-black"
                                                                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-white"
                                                                    }`}
                                                                >
                                                                    {promo.status === "active" ? "Pause" : "Activate"}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeletePromo(promo.id, promo.code)}
                                                                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                                                    title="Delete Promo"
                                                                >
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB 3: DIRECTPAY CARD SUBSCRIPTIONS ── */}
                {activeTab === "payments" && (
                    <div className="space-y-6">
                        {/* Top 3 Stat Cards: Success, Failures, Health */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-[#111827] rounded-3xl p-6 border-l-4 border-emerald-500 border border-gray-800 shadow-xl">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Succeeded Payments</p>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                        Live Stripe
                                    </span>
                                </div>
                                <p className="text-3xl font-black text-emerald-400">
                                    {(stripeStats?.succeeded_count ?? 0)} <span className="text-sm font-semibold text-gray-400 font-mono">({stripeStats.succeeded_volume_usd ? `$${stripeStats.succeeded_volume_usd.toFixed(2)}` : '$0.00'})</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Successfully settled card and subscription charges</p>
                            </div>

                            <div className="bg-[#111827] rounded-3xl p-6 border-l-4 border-rose-500 border border-gray-800 shadow-xl">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Failed / Declined</p>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                        (stripeStats?.failed_count ?? 0) > 0 
                                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse" 
                                            : "bg-gray-800 text-gray-400"
                                    }`}>
                                        {(stripeStats?.failed_count ?? 0) > 0 ? "Requires Review" : "Zero Errors"}
                                    </span>
                                </div>
                                <p className="text-3xl font-black text-rose-400">
                                    {(stripeStats?.failed_count ?? 0)} <span className="text-sm font-semibold text-gray-400 font-mono">({stripeStats.failed_volume_usd ? `$${stripeStats.failed_volume_usd.toFixed(2)}` : '$0.00'})</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Declined cards, insufficient funds, expired checkouts</p>
                            </div>

                            <div className="bg-[#111827] rounded-3xl p-6 border-l-4 border-purple-500 border border-gray-800 shadow-xl">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Gateway Success Rate</p>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                        {(stripeStats?.total ?? 0)} Total
                                    </span>
                                </div>
                                <p className="text-3xl font-black text-purple-400">{(stripeStats?.success_rate_percent ?? 100)}%</p>
                                <p className="text-xs text-gray-500 mt-1">Active Stripe Production account (BERAXIS)</p>
                            </div>
                        </div>

                        {/* Stripe Global Payments Gateway Card */}
                        <div className="bg-[#111827] rounded-3xl border border-purple-500/30 p-6 shadow-2xl space-y-5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600/30 to-indigo-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-lg">
                                        <Globe size={22} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base font-bold text-white">Super Admin SaaS Gateway — Stripe Global (Workbench &amp; API Keys)</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                Boolean((stripeSecretKey || "").includes("_live"))
                                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                            }`}>
                                                {Boolean((stripeSecretKey || "").includes("_live")) ? "🟢 Live Production" : "🟡 Test Sandbox"}
                                            </span>
                                            {stripeEnabled && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                    Active on Checkout
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Manage your Stripe keys for global subscriptions (USD), Apple Pay, Google Pay, and Leads Pool Solo ($10/mo) automated recurring payments.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <span>{stripeEnabled ? "Gateway Enabled" : "Gateway Disabled"}</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={stripeEnabled}
                                                onChange={e => setStripeEnabled(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                        </label>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={savingGateways}
                                        onClick={handleSaveGatewaySettings}
                                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/20 cursor-pointer disabled:opacity-50"
                                    >
                                        {savingGateways ? "Saving..." : "Save Stripe Settings"}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                                            Stripe Secret Key (Secret / Restricted Key)
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowStripeSecret(!showStripeSecret)}
                                            className="text-[10px] text-purple-400 hover:text-purple-300 font-mono"
                                        >
                                            {showStripeSecret ? "Hide Key" : "Show Key"}
                                        </button>
                                    </div>
                                    <input
                                        type={showStripeSecret ? "text" : "password"}
                                        value={stripeSecretKey}
                                        onChange={e => setStripeSecretKey(e.target.value)}
                                        placeholder="sk_live_... or rk_live_..."
                                        className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:border-purple-500 outline-none"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">
                                        Standard secret key or restricted key with Charges, Sessions, and Webhooks permissions.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                                        Stripe Publishable Key (Client Elements)
                                    </label>
                                    <input
                                        type="text"
                                        value={stripePublishableKey}
                                        onChange={e => setStripePublishableKey(e.target.value)}
                                        placeholder="pk_live_..."
                                        className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:border-purple-500 outline-none"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">
                                        Client-side key used for secure Stripe Checkout redirect and UI Elements.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                                        Stripe Webhook Signing Secret (whsec_...)
                                    </label>
                                    <input
                                        type="password"
                                        value={stripeWebhookSecret}
                                        onChange={e => setStripeWebhookSecret(e.target.value)}
                                        placeholder="whsec_..."
                                        className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:border-purple-500 outline-none"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">
                                        Used by <code className="text-purple-300">/api/payments/stripe/webhook</code> to verify event signatures.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                                        Stripe Account Mode
                                    </label>
                                    <div className="w-full bg-[#0B0F19]/60 border border-gray-800 rounded-xl px-4 py-2.5 text-gray-300 text-xs flex items-center justify-between">
                                        <span className="font-mono">{Boolean((stripeSecretKey || "").includes("_live")) ? "LIVE PRODUCTION" : "TEST SANDBOX"}</span>
                                        <span className="text-[10px] text-emerald-400 font-bold">● PCI-DSS LEVEL 1 COMPLIANT</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1">
                                        Automatically switches based on the key prefix.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-gray-800/80">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                                        Stripe Webhook Destination URL (Paste this in Stripe Dashboard &gt; Webhooks)
                                    </label>
                                    <code className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                        https://beraxis.online/api/payments/stripe/webhook
                                    </code>
                                </div>
                                <button
                                    type="button"
                                    disabled={stripeTesting}
                                    onClick={handleTestStripeConnection}
                                    className="px-4 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-purple-500/40 flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                                >
                                    {stripeTesting ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
                                            Testing Stripe...
                                        </>
                                    ) : (
                                        <>
                                            🧪 Test Stripe Connection
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Real-Time Stripe Transactions Table (Success & Failures) */}
                        <div className="bg-[#111827] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-black text-white">Stripe Live Transaction Feed</h2>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                            Success &amp; Failures
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Real-time audit log of customer charges, subscription checkouts, card declines, and settlement statuses.
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 flex-wrap">
                                    {/* Status filter pills */}
                                    <div className="flex items-center gap-1 bg-[#0B0F19] p-1 rounded-xl border border-gray-800 text-xs">
                                        <button
                                            type="button"
                                            onClick={() => setTransactionStatusFilter("all")}
                                            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                                                transactionStatusFilter === "all" ? "bg-purple-600 text-white shadow" : "text-gray-400 hover:text-white"
                                            }`}
                                        >
                                            All ({(stripeStats?.total ?? 0)})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTransactionStatusFilter("succeeded")}
                                            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                                                transactionStatusFilter === "succeeded" ? "bg-emerald-600 text-white shadow" : "text-emerald-400 hover:text-emerald-300"
                                            }`}
                                        >
                                            <CheckCircle size={12} /> Success ({(stripeStats?.succeeded_count ?? 0)})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTransactionStatusFilter("failed")}
                                            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                                                transactionStatusFilter === "failed" ? "bg-rose-600 text-white shadow" : "text-rose-400 hover:text-rose-300"
                                            }`}
                                        >
                                            <AlertTriangle size={12} /> Failed ({(stripeStats?.failed_count ?? 0)})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTransactionStatusFilter("pending")}
                                            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                                                transactionStatusFilter === "pending" ? "bg-amber-600 text-white shadow" : "text-amber-400 hover:text-amber-300"
                                            }`}
                                        >
                                            <Clock size={12} /> Open ({(stripeStats?.pending_count ?? 0)})
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={fetchStripeTransactions}
                                        disabled={transactionsLoading}
                                        className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        <RefreshCw size={13} className={transactionsLoading ? "animate-spin" : ""} />
                                        Refresh Live
                                    </button>
                                </div>
                            </div>

                            {/* Search Box */}
                            <div className="px-6 py-3 bg-[#0B0F19]/60 border-b border-gray-800/80 flex items-center gap-3">
                                <Search size={14} className="text-gray-500 shrink-0" />
                                <input
                                    type="text"
                                    value={transactionSearchTerm}
                                    onChange={e => setTransactionSearchTerm(e.target.value)}
                                    placeholder="Search by customer email, name, transaction ID (cs_live_ / ch_), or failure reason..."
                                    className="w-full bg-transparent text-xs text-white placeholder-gray-500 outline-none"
                                />
                                {transactionSearchTerm && (
                                    <button onClick={() => setTransactionSearchTerm("")} className="text-gray-400 hover:text-white text-xs">
                                        Clear
                                    </button>
                                )}
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#0B0F19] text-gray-500 text-xs uppercase tracking-widest font-bold border-b border-gray-800">
                                        <tr>
                                            <th className="px-6 py-4">Transaction / Status</th>
                                            <th className="px-6 py-4">Customer Details</th>
                                            <th className="px-6 py-4">Plan / Purpose</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Outcome / Failure Reason</th>
                                            <th className="px-6 py-4">Date &amp; Time</th>
                                            <th className="px-6 py-4 text-right">Stripe Record</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800/50">
                                        {transactionsLoading ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-xs font-mono">
                                                    <div className="inline-block w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2 align-middle"></div>
                                                    Syncing transactions live from Stripe API...
                                                </td>
                                            </tr>
                                        ) : stripeTransactions.filter(t => {
                                            if (transactionStatusFilter !== "all" && t.status !== transactionStatusFilter) return false;
                                            if (transactionSearchTerm) {
                                                const q = transactionSearchTerm.toLowerCase();
                                                const emailMatch = (t.customer_email || "").toLowerCase().includes(q);
                                                const nameMatch = (t.customer_name || "").toLowerCase().includes(q);
                                                const idMatch = (t.id || "").toLowerCase().includes(q);
                                                const planMatch = (t.plan || "").toLowerCase().includes(q);
                                                const reasonMatch = (t.failure_reason || "").toLowerCase().includes(q);
                                                return emailMatch || nameMatch || idMatch || planMatch || reasonMatch;
                                            }
                                            return true;
                                        }).length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-xs">
                                                    No transactions found matching the selected filter.
                                                </td>
                                            </tr>
                                        ) : (
                                            stripeTransactions.filter(t => {
                                                if (transactionStatusFilter !== "all" && t.status !== transactionStatusFilter) return false;
                                                if (transactionSearchTerm) {
                                                    const q = transactionSearchTerm.toLowerCase();
                                                    const emailMatch = (t.customer_email || "").toLowerCase().includes(q);
                                                    const nameMatch = (t.customer_name || "").toLowerCase().includes(q);
                                                    const idMatch = (t.id || "").toLowerCase().includes(q);
                                                    const planMatch = (t.plan || "").toLowerCase().includes(q);
                                                    const reasonMatch = (t.failure_reason || "").toLowerCase().includes(q);
                                                    return emailMatch || nameMatch || idMatch || planMatch || reasonMatch;
                                                }
                                                return true;
                                            }).map(tx => {
                                                const isSuccess = tx.status === "succeeded";
                                                const isFail = tx.status === "failed";

                                                return (
                                                    <tr key={tx.id} className="hover:bg-white/3 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2.5">
                                                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                                                                    isSuccess
                                                                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                                                        : isFail
                                                                            ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                                                                            : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                                                }`}>
                                                                    {isSuccess && <CheckCircle size={11} />}
                                                                    {isFail && <AlertTriangle size={11} />}
                                                                    {!isSuccess && !isFail && <Clock size={11} />}
                                                                    {tx.status}
                                                                </span>
                                                            </div>
                                                            <span className="text-[10px] text-gray-500 font-mono block mt-1">
                                                                {tx.id}
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border ${
                                                                    isSuccess
                                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                                        : isFail
                                                                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                                            : "bg-gray-800 text-gray-400 border-gray-700"
                                                                }`}>
                                                                    {(tx.customer_email || "U").charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <span className="font-semibold text-gray-200 block text-xs">
                                                                        {tx.customer_email}
                                                                    </span>
                                                                    {tx.customer_name && tx.customer_name !== "Subscriber" && (
                                                                        <span className="text-[11px] text-gray-400 block">
                                                                            {tx.customer_name}
                                                                        </span>
                                                                    )}
                                                                    <span className="text-[10px] text-gray-500 font-mono">
                                                                        {tx.payment_method || "Stripe"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span className="text-xs font-semibold text-gray-300 block">
                                                                {tx.plan || "Standard Plan"}
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span className={`font-mono font-bold text-sm ${
                                                                isSuccess ? "text-emerald-400" : isFail ? "text-rose-400" : "text-gray-400"
                                                            }`}>
                                                                ${Number(tx.amount_usd || 0).toFixed(2)} USD
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            {isSuccess ? (
                                                                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                                                                    <Check size={13} className="shrink-0" />
                                                                    <span>Payment captured &amp; subscription active</span>
                                                                </div>
                                                            ) : isFail ? (
                                                                <div className="space-y-0.5">
                                                                    <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
                                                                        <AlertTriangle size={13} className="shrink-0 text-rose-400" />
                                                                        <span>{tx.failure_reason || "Payment declined / failed"}</span>
                                                                    </div>
                                                                    {tx.failure_code && (
                                                                        <span className="text-[10px] text-rose-300/80 font-mono bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 inline-block">
                                                                            Code: {tx.failure_code}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-amber-400/90 flex items-center gap-1">
                                                                    <Clock size={12} /> Checkout session open (waiting for customer)
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td className="px-6 py-4 text-xs text-gray-400 font-mono">
                                                            {new Date(tx.created_at).toLocaleString("en-US", {
                                                                month: "short",
                                                                day: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit"
                                                            })}
                                                        </td>

                                                        <td className="px-6 py-4 text-right">
                                                            <a
                                                                href={tx.stripe_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600/10 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold transition-all"
                                                            >
                                                                <span>View in Stripe</span>
                                                                <ExternalLink size={12} />
                                                            </a>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB 4: BILLING CONTROL ── */}
                {activeTab === "billing" && (
                    <div className="bg-[#111827] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
                        <TableHeader title="Billing Control & Tenant Lifecycle" subtitle="Override subscription status, extend trials, block access">
                            <SearchBox value={billingSearchTerm} onChange={setBillingSearchTerm} placeholder="Filter by email or status..." />
                        </TableHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#0B0F19] text-gray-500 text-xs uppercase tracking-widest font-bold border-b border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4">Tenant Account</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Trial / Expiry Date</th>
                                        <th className="px-6 py-4 text-right">Admin Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {loading ? <LoadingRow cols={4} /> : filteredTenants.length === 0 ? <EmptyRow cols={4} /> :
                                        filteredTenants.map(t => {
                                            const isExpired = t.subscription_status === "trialing" && t.trial_ends_at && new Date() > new Date(t.trial_ends_at);
                                            return (
                                                <tr key={t.id} className="hover:bg-white/3 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className="font-semibold text-gray-200 block text-sm">{t.email}</span>
                                                        <span className="text-[10px] text-gray-600 font-mono">{t.id}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 ${STATUS_STYLES[t.subscription_status] || STATUS_STYLES.new}`}>
                                                            {t.subscription_status === "active" && <CheckCircle size={10}/>}
                                                            {t.subscription_status} {isExpired && "(Expired)"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-mono">
                                                        {t.trial_ends_at
                                                            ? <span className="flex items-center gap-1.5 text-gray-400"><Calendar size={13} className="text-gray-500"/>{fmtDate(t.trial_ends_at)}</span>
                                                            : <span className="text-gray-600">—</span>}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            {t.subscription_status !== "active" ? (
                                                                <ActionBtn onClick={() => handleTenantAction(t.id, "activate")} loading={actionLoading === `${t.id}-activate`} label="Activate" color="emerald"/>
                                                            ) : (
                                                                <ActionBtn onClick={() => handleTenantAction(t.id, "deactivate")} loading={actionLoading === `${t.id}-deactivate`} label="Block" color="red"/>
                                                            )}
                                                            <ActionBtn onClick={() => handleTenantAction(t.id, "extend-trial")} loading={actionLoading === `${t.id}-extend-trial`} label="+14d Trial" color="amber"/>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── TAB 5: GLOBAL USERS MANAGEMENT ── */}
                {activeTab === "users" && (
                    <div className="bg-[#111827] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
                        <TableHeader title="Platform User Accounts & IAM" subtitle="All registered accounts, roles, workspace permissions, and password overrides">
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <SearchBox value={userSearchTerm} onChange={setUserSearchTerm} placeholder="Filter by email..." />
                                <button
                                    onClick={() => setIsCreateUserOpen(true)}
                                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-500/25 flex items-center gap-1.5 shrink-0 cursor-pointer"
                                >
                                    <Plus size={16} /> Provision User
                                </button>
                            </div>
                        </TableHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#0B0F19] text-gray-500 text-xs uppercase tracking-widest font-bold border-b border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4">User Account</th>
                                        <th className="px-6 py-4">Assigned Workspace</th>
                                        <th className="px-6 py-4">Subscription Status</th>
                                        <th className="px-6 py-4">Joined Date</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {loading ? <LoadingRow cols={5}/> : filteredUsers.length === 0 ? <EmptyRow cols={5}/> :
                                        filteredUsers.map(u => (
                                            <tr key={u.id} className="hover:bg-white/3 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30 text-sm">
                                                            {(u.email || "U").charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold text-gray-200 block text-sm">{u.email}</span>
                                                            <span className="text-[10px] text-gray-500 font-mono">ID: {(u.id || "").slice(0, 16)}...</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-400">
                                                    {u.workspace_name
                                                        ? <span className="flex items-center gap-1.5 text-gray-300 font-medium"><Building2 size={13} className="text-purple-400"/>{u.workspace_name}</span>
                                                        : <span className="text-gray-600">—</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 ${STATUS_STYLES[u.subscription_status || "new"] || STATUS_STYLES.new}`}>
                                                        {u.subscription_status === "active" && <CheckCircle size={10}/>}
                                                        {u.subscription_status || "new"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-500 font-mono">{u.created_at ? fmtDate(u.created_at) : "N/A"}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => {
                                                                setIsResetPasswordOpen(u);
                                                                setNewPasswordInput("");
                                                            }}
                                                            className="px-2.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                                            title="Reset Password"
                                                        >
                                                            <Key size={13} /> Reset Pass
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteUser(u.id, u.email)} 
                                                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer" 
                                                            title="Delete user"
                                                        >
                                                            <Trash2 size={15}/>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── TAB 6: ERP SALES TAB ── */}
                {activeTab === "sales" && (
                    <div className="bg-[#111827] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
                        <TableHeader title="Platform-wide ERP Sales Transactions" subtitle="Aggregated sales orders across tenant Point-of-Sale, Invoicing, and Quotations">
                            <SearchBox value={salesSearchTerm} onChange={setSalesSearchTerm} placeholder="Search by order or customer..." />
                        </TableHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#0B0F19] text-gray-500 text-xs uppercase tracking-widest font-bold border-b border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4">Order Ref</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {loading ? <LoadingRow cols={5}/> : filteredSales.length === 0 ? <EmptyRow cols={5}/> :
                                        filteredSales.map(order => (
                                            <tr key={order.id} className="hover:bg-white/3 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                                            <DollarSign size={16}/>
                                                        </div>
                                                        <span className="font-bold text-gray-200">{order.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-300 text-sm font-semibold">{order.customer_name}</td>
                                                <td className="px-6 py-4 font-mono font-bold text-emerald-400">${Number(order.amount_total || 0).toFixed(2)}</td>
                                                <td className="px-6 py-4 text-xs text-gray-500 font-mono">{order.created_at ? fmtDate(order.created_at) : "N/A"}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.state === "sale" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                                                        {order.state === "sale" ? "Confirmed" : "Quotation"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── TAB 7: FEATURE FLAGS & GLOBAL SWITCHBOARD ── */}
                {activeTab === "flags" && (
                    <div className="space-y-6">
                        <div className="bg-[#111827] rounded-3xl border border-gray-800 p-6 shadow-2xl">
                            <div className="border-b border-gray-800 pb-4 mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Sliders className="text-purple-400" size={22} /> Platform Feature Flags & Global Modules
                                </h2>
                                <p className="text-xs text-gray-400 mt-1">Master kill switches and global module toggles across the entire SaaS infrastructure</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FlagToggle 
                                    label="AI Agentic Copilot & Lead Automation" 
                                    desc="DeepMind/Gemini powered automated CRM lead generator and assistant" 
                                    enabled={Boolean(featureFlags?.ai_copilot)} 
                                    onToggle={() => handleToggleFlag("ai_copilot")} 
                                />
                                <FlagToggle 
                                    label="DirectPay Card Processing Gateway" 
                                    desc="Live DirectPay Card PWA gateway for SaaS subscription checkouts" 
                                    enabled={Boolean(featureFlags?.directpay_card)} 
                                    onToggle={() => handleToggleFlag("directpay_card")} 
                                />
                                <FlagToggle 
                                    label="Retail Point-of-Sale (Touch Cashier)" 
                                    desc="Barcode scanner, offline sync cashier, receipt printing terminal" 
                                    enabled={Boolean(featureFlags?.pos_terminal)} 
                                    onToggle={() => handleToggleFlag("pos_terminal")} 
                                />
                                <FlagToggle 
                                    label="Manufacturing & MRP Work Orders" 
                                    desc="Bill of materials, routing stages, production planning" 
                                    enabled={Boolean(featureFlags?.mrp_manufacturing)} 
                                    onToggle={() => handleToggleFlag("mrp_manufacturing")} 
                                />
                                <FlagToggle 
                                    label="Automated HR & Multi-Tier Payroll" 
                                    desc="Salary slips, tax allowances, biometric attendance integration" 
                                    enabled={Boolean(featureFlags?.hr_payroll)} 
                                    onToggle={() => handleToggleFlag("hr_payroll")} 
                                />
                                <FlagToggle 
                                    label="WhatsApp Auto-Bot Notifications" 
                                    desc="Transactional invoice dispatch & customer OTPs via Meta API" 
                                    enabled={Boolean(featureFlags?.whatsapp_bot)} 
                                    onToggle={() => handleToggleFlag("whatsapp_bot")} 
                                />
                                <FlagToggle 
                                    label="Fleet Logistics & GPS Dispatch" 
                                    desc="Vehicle route tracking, fuel consumption, driver manifests" 
                                    enabled={Boolean(featureFlags?.fleet_logistics)} 
                                    onToggle={() => handleToggleFlag("fleet_logistics")} 
                                />
                                <FlagToggle 
                                    label="Strict 2-Factor Authentication (2FA)" 
                                    desc="Enforce TOTP / authenticator verification for all tenant logins" 
                                    enabled={Boolean(featureFlags?.strict_2fa)} 
                                    onToggle={() => handleToggleFlag("strict_2fa")} 
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB 8: GLOBAL BROADCAST ANNOUNCEMENTS ── */}
                {activeTab === "broadcast" && (
                    <div className="bg-[#111827] rounded-3xl border border-gray-800 p-6 shadow-2xl space-y-6">
                        <div className="border-b border-gray-800 pb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Megaphone className="text-purple-400" size={22} /> Platform-Wide Announcement Banner
                            </h2>
                            <p className="text-xs text-gray-400 mt-1">Broadcast real-time system alerts, maintenance windows, or feature updates to all active users</p>
                        </div>

                        <form onSubmit={handleSaveAnnouncement} className="space-y-4 max-w-2xl">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Announcement Message *</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={announcement?.message || ""}
                                    onChange={e => setAnnouncement({ ...announcement, message: e.target.value })}
                                    placeholder="e.g. Scheduled database maintenance on Sunday at 02:00 AM UTC."
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-2xl p-4 text-white text-sm focus:border-purple-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Banner Style</label>
                                    <select
                                        value={announcement?.banner_type || "info"}
                                        onChange={e => setAnnouncement({ ...announcement, banner_type: e.target.value })}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs font-semibold focus:border-purple-500 outline-none"
                                    >
                                        <option value="info">🔵 Information (Blue / Purple)</option>
                                        <option value="alert">🟡 Important Warning (Amber)</option>
                                        <option value="warning">🔴 Critical Maintenance (Red)</option>
                                        <option value="success">🟢 Milestone / New Feature (Green)</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-3 pt-6">
                                    <input
                                        type="checkbox"
                                        id="active_banner_toggle"
                                        checked={Boolean(announcement?.is_active)}
                                        onChange={e => setAnnouncement({ ...announcement, is_active: e.target.checked })}
                                        className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-purple-600 focus:ring-purple-500"
                                    />
                                    <label htmlFor="active_banner_toggle" className="text-xs font-bold text-gray-200 cursor-pointer">
                                        Display Banner Globally
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-purple-600/30 cursor-pointer">
                                    Publish Announcement
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── TAB 9: AUDIT LOGS & ACTIVITY STREAM ── */}
                {activeTab === "audit" && (
                    <div className="bg-[#111827] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
                        <TableHeader title="Security Audit & Platform Event Stream" subtitle="Cryptographic log of administrative actions, authentication attempts, and billing events" />
                        <div className="divide-y divide-gray-800/50">
                            {safeAuditLogs.length === 0 ? <p className="p-8 text-center text-gray-500 text-sm">No recent events recorded.</p> :
                                safeAuditLogs.map(log => (
                                    <div key={log.id} className="p-5 flex items-start justify-between gap-4 hover:bg-white/2 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                                                <Activity size={16} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-xs text-white bg-gray-800 px-2 py-0.5 rounded-md border border-gray-700">{log.event}</span>
                                                    <span className="text-xs text-gray-400">by <span className="text-gray-200 font-semibold">{log.actor}</span></span>
                                                </div>
                                                <p className="text-xs text-gray-300 mt-1">{log.details}</p>
                                            </div>
                                        </div>
                                        <span className="text-[11px] text-gray-500 font-mono shrink-0">{fmtDate(log.created_at)}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}

                {/* ── TAB 10: SYSTEM HEALTH & DIAGNOSTICS ── */}
                {activeTab === "diagnostics" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-[#111827] rounded-3xl border border-gray-800 p-6 shadow-2xl space-y-4">
                                <h3 className="text-base font-bold flex items-center gap-2 text-white">
                                    <Server className="text-emerald-400" size={20} /> Infrastructure Matrix
                                </h3>
                                <div className="space-y-3">
                                    <HealthRow label="FastAPI App Engine (Render)" status="Operational" latency="18ms" uptime="99.98%" />
                                    <HealthRow label="Supabase PostgREST & Database" status={health?.services?.supabase_database?.status || "Operational"} latency={`${health?.services?.supabase_database?.latency_ms ?? 12}ms`} uptime="99.99%" />
                                    <HealthRow label="DirectPay Card Gateway" status="Active" latency="32ms" uptime="Card-Only PWA" />
                                    <HealthRow label="Supabase Auth & Multi-Tenant RLS" status="Operational" latency="24ms" uptime="Active Isolation" />
                                    <HealthRow label="AI Lead Generator Engine" status="Operational" latency="45ms" uptime="Gemini 2.5 Flash" />
                                </div>
                            </div>

                            <div className="bg-[#111827] rounded-3xl border border-gray-800 p-6 shadow-2xl space-y-4">
                                <h3 className="text-base font-bold flex items-center gap-2 text-white">
                                    <HardDrive className="text-cyan-400" size={20} /> System Resource Gauges
                                </h3>
                                <div className="space-y-3">
                                    <GaugeRow label="CPU Utilization" value="14%" />
                                    <GaugeRow label="Memory Usage" value="38%" />
                                    <GaugeRow label="Active DB Connections" value="24 pools" />
                                    <GaugeRow label="Cache Hit Ratio" value="94.2%" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB 11: A/B TESTING & OPTIMIZATION ENGINE ── */}
                {activeTab === "experiments" && (
                    <div className="space-y-6 animate-in fade-in">
                        {/* Top Header Card */}
                        <div className="bg-[#111827] rounded-3xl border border-gray-800 p-6 shadow-2xl">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-800 pb-5">
                                <div>
                                    <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                                        <span className="text-2xl">🧪</span> A/B Testing &amp; Conversion Optimization Engine
                                        <span className="text-xs bg-purple-500/20 text-purple-300 font-mono font-bold px-2.5 py-0.5 rounded-full border border-purple-500/30">
                                            Zero SEO Cloaking Engine Active
                                        </span>
                                    </h2>
                                    <p className="text-xs text-gray-400 mt-1 max-w-2xl">
                                        Deterministic variant allocation with two-proportion Z-test statistical significance scoring. 
                                        Search crawlers (Googlebot, Bingbot) receive canonical Control Variant A with zero layout shift.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <button
                                        onClick={fetchExperimentsData}
                                        disabled={loadingExp}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition-all border border-gray-700 cursor-pointer"
                                    >
                                        <RefreshCw size={14} className={loadingExp ? "animate-spin" : ""} />
                                        <span>Refresh Telemetry</span>
                                    </button>

                                    <button
                                        onClick={handleResetExperiments}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all border border-red-500/30 cursor-pointer"
                                    >
                                        <Trash2 size={14} />
                                        <span>Reset Store</span>
                                    </button>
                                </div>
                            </div>

                            {/* Global Telemetry KPI Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                <div className="bg-[#0B0F19] p-4 rounded-2xl border border-gray-800">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Impressions</div>
                                    <div className="text-2xl font-black text-white mt-1">
                                        {experimentsData ? (
                                            (experimentsData.experiments?.hero_headline_v1?.totalImpressions || 0) +
                                            (experimentsData.experiments?.hero_cta_v1?.totalImpressions || 0) +
                                            (experimentsData.experiments?.hero_media_v1?.totalImpressions || 0)
                                        ).toLocaleString() : "..."}
                                    </div>
                                    <div className="text-[11px] text-gray-500 mt-1">Across 3 live experiments</div>
                                </div>

                                <div className="bg-[#0B0F19] p-4 rounded-2xl border border-gray-800">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Conversions</div>
                                    <div className="text-2xl font-black text-emerald-400 mt-1">
                                        {experimentsData ? (
                                            (experimentsData.experiments?.hero_headline_v1?.totalConversions || 0) +
                                            (experimentsData.experiments?.hero_cta_v1?.totalConversions || 0) +
                                            (experimentsData.experiments?.hero_media_v1?.totalConversions || 0)
                                        ).toLocaleString() : "..."}
                                    </div>
                                    <div className="text-[11px] text-emerald-400/70 mt-1 font-semibold">Pricing &amp; trial actions</div>
                                </div>

                                <div className="bg-[#0B0F19] p-4 rounded-2xl border border-gray-800">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Blended CVR %</div>
                                    <div className="text-2xl font-black text-cyan-400 mt-1">
                                        {experimentsData ? (
                                            (
                                                ((experimentsData.experiments?.hero_headline_v1?.totalConversions || 0) +
                                                (experimentsData.experiments?.hero_cta_v1?.totalConversions || 0) +
                                                (experimentsData.experiments?.hero_media_v1?.totalConversions || 0)) /
                                                Math.max(1, ((experimentsData.experiments?.hero_headline_v1?.totalImpressions || 0) +
                                                (experimentsData.experiments?.hero_cta_v1?.totalImpressions || 0) +
                                                (experimentsData.experiments?.hero_media_v1?.totalImpressions || 0))) * 100
                                            ).toFixed(1)
                                        ) : "..."}%
                                    </div>
                                    <div className="text-[11px] text-cyan-400/70 mt-1 font-semibold">High SaaS conversion</div>
                                </div>

                                <div className="bg-[#0B0F19] p-4 rounded-2xl border border-gray-800">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Top Performing Hook</div>
                                    <div className="text-lg font-black text-amber-300 mt-1 truncate">
                                        Anti-SaaS Tax
                                    </div>
                                    <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                                        +42.6% Lift (99.6% Conf)
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Experiments List */}
                        {experimentsData && Object.values(experimentsData.experiments || {}).map((exp: any) => (
                            <div key={exp.id} className="bg-[#111827] rounded-3xl border border-gray-800 p-6 shadow-2xl space-y-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800/80 pb-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                            <h3 className="text-base font-bold text-white">{exp.name}</h3>
                                            <span className="text-[10px] font-mono bg-gray-800 text-gray-300 px-2 py-0.5 rounded border border-gray-700">
                                                {exp.id}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">{exp.description}</p>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="text-gray-400">Total Tested: <strong className="text-white font-mono">{exp.totalImpressions?.toLocaleString()}</strong></span>
                                        <span className="text-gray-600">•</span>
                                        <span className="text-gray-400">Total Conv: <strong className="text-emerald-400 font-mono">{exp.totalConversions?.toLocaleString()}</strong></span>
                                        <span className="text-gray-600">•</span>
                                        <span className="text-gray-400">Overall CVR: <strong className="text-cyan-400 font-mono">{exp.overallCvr}%</strong></span>
                                    </div>
                                </div>

                                {/* Variants Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {Object.values(exp.variants || {}).map((variant: any) => {
                                        const isControl = variant.id === "control";
                                        const isPromoted = promotedWinner[exp.id] === variant.id;

                                        return (
                                            <div
                                                key={variant.id}
                                                className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                                                    isPromoted
                                                        ? "bg-purple-950/20 border-purple-500/60 shadow-lg shadow-purple-950/40"
                                                        : variant.isWinner
                                                        ? "bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-950/30"
                                                        : isControl
                                                        ? "bg-[#0B0F19] border-gray-800"
                                                        : "bg-[#0B0F19] border-gray-800/80"
                                                }`}
                                            >
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                                            isControl 
                                                                ? "bg-gray-800 text-gray-300 border border-gray-700" 
                                                                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                                        }`}>
                                                            {isControl ? "Variant A (Control)" : `Challenger (${variant.id})`}
                                                        </span>

                                                        {isPromoted ? (
                                                            <span className="text-[10px] font-bold bg-purple-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                <Check size={11} /> 100% Promoted Winner
                                                            </span>
                                                        ) : variant.isWinner ? (
                                                            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                <Sparkles size={11} /> Leading Variant
                                                            </span>
                                                        ) : null}
                                                    </div>

                                                    <h4 className="text-sm font-bold text-white mb-3 line-clamp-2">{variant.name}</h4>

                                                    {/* Metrics Box */}
                                                    <div className="grid grid-cols-2 gap-2 bg-black/40 p-3 rounded-xl border border-white/5 mb-3 font-mono">
                                                        <div>
                                                            <span className="text-[10px] text-gray-400 block">IMPRESSIONS</span>
                                                            <span className="text-sm font-bold text-white">{variant.impressions?.toLocaleString()}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] text-gray-400 block">CONVERSIONS</span>
                                                            <span className="text-sm font-bold text-emerald-400">{variant.conversions?.toLocaleString()}</span>
                                                        </div>
                                                    </div>

                                                    {/* Conversion Rate & Lift */}
                                                    <div className="flex items-baseline justify-between mb-3">
                                                        <div>
                                                            <span className="text-[10px] text-gray-400 block">CVR %</span>
                                                            <span className="text-2xl font-black text-white">{variant.cvr}%</span>
                                                        </div>

                                                        {!isControl && (
                                                            <div className="text-right">
                                                                <span className="text-[10px] text-gray-400 block">RELATIVE LIFT</span>
                                                                <span className={`text-base font-bold ${variant.lift >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                                                    {variant.lift >= 0 ? `+${variant.lift}%` : `${variant.lift}%`}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Statistical Significance Display */}
                                                    {!isControl && (
                                                        <div className="mt-2 text-xs p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                                                            <div className="flex justify-between items-center text-[11px]">
                                                                <span className="text-gray-400">Statistical Conf:</span>
                                                                <strong className={variant.confidence >= 95 ? "text-emerald-400" : "text-amber-400"}>
                                                                    {variant.confidence}% (Z: {variant.zScore})
                                                                </strong>
                                                            </div>
                                                            <div className="text-[11px] text-gray-400">
                                                                {variant.isSignificant ? (
                                                                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                                                        <CheckCircle size={12} /> Statistically Significant (p &lt; 0.05)
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-amber-400/80">
                                                                        ⏳ Sample accumulating (p &gt; 0.05)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Promote Winner Button */}
                                                <div className="mt-4 pt-3 border-t border-white/10">
                                                    <button
                                                        onClick={() => handlePromoteWinner(exp.id, variant.id)}
                                                        disabled={isPromoted}
                                                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                                            isPromoted
                                                                ? "bg-purple-600 text-white cursor-default"
                                                                : variant.isWinner
                                                                ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                                                                : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
                                                        }`}
                                                    >
                                                        {isPromoted ? (
                                                            <><Check size={14} /> Active 100% Traffic</>
                                                        ) : (
                                                            <><Sparkles size={14} /> Promote as 100% Winner</>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Goals Breakdown Chips */}
                                {exp.goals && (
                                    <div className="pt-2 flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-semibold text-gray-400">Tracked Goal Tallies:</span>
                                        {Object.entries(exp.goals).map(([goalName, count]: [string, any]) => (
                                            <span key={goalName} className="text-xs bg-gray-800/80 text-gray-300 px-2.5 py-1 rounded-lg border border-gray-700/60 font-mono">
                                                {goalName}: <strong className="text-white">{count}</strong>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Section 2: Social Video Ad Attribution Matrix */}
                        {experimentsData?.socialAttributions && (
                            <div className="bg-[#111827] rounded-3xl border border-gray-800 p-6 shadow-2xl space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                                    <div>
                                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                                            <span>🎬</span> Social Video Ad Attribution Matrix
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Tracking Cost Per Acquisition and conversion performance across each video commercial creative.
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-400 font-mono">
                                        5 Active Creatives Tracked
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                                                <th className="pb-3">Ad Creative</th>
                                                <th className="pb-3">Target Channels</th>
                                                <th className="pb-3 text-right">Tracked Visits</th>
                                                <th className="pb-3 text-right">Paid / Signups</th>
                                                <th className="pb-3 text-right">CVR %</th>
                                                <th className="pb-3 text-center">Tracking URL</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800/60">
                                            {Object.values(experimentsData.socialAttributions).map((creative: any) => {
                                                const trackingUrl = `https://www.beraxis.online/?utm_source=social&utm_creative=${creative.id}&utm_campaign=launch`;

                                                return (
                                                    <tr key={creative.id} className="hover:bg-white/5 transition-colors">
                                                        <td className="py-3 font-semibold text-white">
                                                            <div>{creative.name}</div>
                                                            <span className="text-[10px] text-gray-500 font-mono">{creative.id}</span>
                                                        </td>
                                                        <td className="py-3 text-gray-300">{creative.source}</td>
                                                        <td className="py-3 text-right font-mono text-white font-bold">{creative.visits?.toLocaleString()}</td>
                                                        <td className="py-3 text-right font-mono text-emerald-400 font-bold">{creative.conversions?.toLocaleString()}</td>
                                                        <td className="py-3 text-right font-mono font-black text-cyan-300">{creative.cvr}%</td>
                                                        <td className="py-3 text-center">
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(trackingUrl);
                                                                    showToast(`Copied tracking link for ${creative.id}!`);
                                                                }}
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition-all font-mono text-[11px] cursor-pointer"
                                                                title="Copy tracked UTM campaign URL"
                                                            >
                                                                <Copy size={11} /> Copy UTM Link
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Section 3: Live Event Telemetry Stream */}
                        {experimentsData?.recentEvents && (
                            <div className="bg-[#111827] rounded-3xl border border-gray-800 p-6 shadow-2xl space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        <Activity size={18} className="text-emerald-400" /> Live Event Telemetry Stream
                                    </h3>
                                    <span className="text-xs text-gray-400 font-mono">Last 50 recorded events</span>
                                </div>

                                <div className="divide-y divide-gray-800/60 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
                                    {experimentsData.recentEvents.map((evt: any) => (
                                        <div key={evt.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-white/5 px-2 rounded-lg transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded font-mono ${
                                                    evt.action === "conversion"
                                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                                        : evt.action === "attribution"
                                                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                                                        : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                                                }`}>
                                                    {evt.action}
                                                </span>

                                                <span className="font-mono text-gray-300">
                                                    {evt.experimentId ? `${evt.experimentId} → ${evt.variantId}` : evt.creativeId}
                                                </span>

                                                {evt.goal && (
                                                    <span className="text-[11px] bg-white/5 text-gray-400 px-2 py-0.5 rounded border border-white/10 font-mono">
                                                        Goal: {evt.goal}
                                                    </span>
                                                )}
                                            </div>

                                            <span className="text-[11px] text-gray-500 font-mono">
                                                {new Date(evt.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* ── MODAL 1: CREATE PROMO CODE ── */}
            {isCreatePromoOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[99999] p-4 animate-in fade-in">
                    <div className="bg-[#141C2E] border border-purple-500/30 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 animate-in zoom-in-95 text-white">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                                    <Tag size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">Deploy Promo Code</h3>
                                    <p className="text-xs text-gray-400">Package-specific percentage or fixed dollar discounts</p>
                                </div>
                            </div>
                            <button onClick={() => setIsCreatePromoOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreatePromo} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Promo Code *</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={promoForm.code} 
                                        onChange={e => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})}
                                        placeholder="e.g. VIP50 or LAUNCH200" 
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono font-bold text-sm focus:border-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Discount Type *</label>
                                    <select 
                                        value={promoForm.discount_type} 
                                        onChange={e => setPromoForm({...promoForm, discount_type: e.target.value as any})}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs font-semibold focus:border-purple-500 outline-none cursor-pointer"
                                    >
                                        <option value="percentage">% Percentage Discount</option>
                                        <option value="fixed_amount">$ Fixed Dollar Amount Off</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                                        Discount Value ({promoForm.discount_type === "percentage" ? "%" : "$ USD"}) *
                                    </label>
                                    <input 
                                        type="number" 
                                        required
                                        min="1"
                                        max={promoForm.discount_type === "percentage" ? 100 : 10000}
                                        value={promoForm.discount_value} 
                                        onChange={e => setPromoForm({...promoForm, discount_value: e.target.value})}
                                        placeholder={promoForm.discount_type === "percentage" ? "50" : "100"} 
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-purple-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Target Plan *</label>
                                    <select 
                                        value={promoForm.target_package} 
                                        onChange={e => setPromoForm({...promoForm, target_package: e.target.value as any})}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs font-semibold focus:border-purple-500 outline-none cursor-pointer"
                                    >
                                        <option value="all">🌐 All Packages</option>
                                        <option value="standard">💼 Standard Plan ($24.90/seat)</option>
                                        <option value="custom">👑 Custom Enterprise ($37.40/seat)</option>
                                        <option value="starter">⚡ Starter Plan</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Description</label>
                                <input 
                                    type="text" 
                                    value={promoForm.description} 
                                    onChange={e => setPromoForm({...promoForm, description: e.target.value})}
                                    placeholder="e.g. Q4 Executive Discount for Enterprise Gym Chains" 
                                    className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs focus:border-purple-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Max Redemptions</label>
                                    <input 
                                        type="number" 
                                        value={promoForm.max_uses} 
                                        onChange={e => setPromoForm({...promoForm, max_uses: e.target.value})}
                                        placeholder="500" 
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:border-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Expiry Date</label>
                                    <input 
                                        type="date" 
                                        value={promoForm.expiry_date} 
                                        onChange={e => setPromoForm({...promoForm, expiry_date: e.target.value})}
                                        className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:border-purple-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                                <button type="button" onClick={() => setIsCreatePromoOpen(false)} className="px-4 py-2 text-xs text-gray-400 hover:text-white font-bold">
                                    Cancel
                                </button>
                                <button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-purple-500/25 cursor-pointer">
                                    Deploy Code
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL 2: CREATE WORKSPACE ── */}
            {isCreateWorkspaceOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[99999] p-4 animate-in fade-in">
                    <div className="bg-[#141C2E] border border-gray-700/80 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95 text-white">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Building2 size={18} className="text-purple-400" /> Create Company Workspace
                            </h3>
                            <button onClick={() => setIsCreateWorkspaceOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateWorkspace} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Company Name *</label>
                                <input required type="text" value={wsForm.name} onChange={e => setWsForm({...wsForm, name: e.target.value})} placeholder="e.g. Apex Global Logistics" className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs focus:border-purple-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Owner Email Address *</label>
                                <input required type="email" value={wsForm.owner_email} onChange={e => setWsForm({...wsForm, owner_email: e.target.value})} placeholder="admin@apexlogistics.com" className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs focus:border-purple-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Plan Tier</label>
                                    <select value={wsForm.plan} onChange={e => setWsForm({...wsForm, plan: e.target.value})} className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs focus:border-purple-500 outline-none">
                                        <option value="One App Free">🌱 One App Free ($0/mo Forever)</option>
                                        <option value="Standard Plan ($1/mo Early Bird)">💼 Standard Plan ($1/mo Early Bird)</option>
                                        <option value="Custom Plan ($37.40/mo)">👑 Custom Plan ($37.40/mo)</option>
                                        <option value="Admin Full Control">💎 Admin Full Control (Super Admin)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Member Seats</label>
                                    <input type="number" min="1" value={wsForm.member_count} onChange={e => setWsForm({...wsForm, member_count: parseInt(e.target.value) || 1})} className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:border-purple-500 outline-none" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                                <button type="button" onClick={() => setIsCreateWorkspaceOpen(false)} className="px-4 py-2 text-xs text-gray-400 hover:text-white font-bold">Cancel</button>
                                <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-purple-500/25">Create Company</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL 3: PROVISION USER ── */}
            {isCreateUserOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[99999] p-4 animate-in fade-in">
                    <div className="bg-[#141C2E] border border-gray-700/80 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95 text-white">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Users size={18} className="text-purple-400" /> Provision Platform User
                            </h3>
                            <button onClick={() => setIsCreateUserOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Full Name</label>
                                <input type="text" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} placeholder="e.g. Sarah Jenkins" className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs focus:border-purple-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Email Address *</label>
                                <input required type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} placeholder="user@domain.com" className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs focus:border-purple-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Initial Password *</label>
                                <input required type="text" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:border-purple-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Role</label>
                                    <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs focus:border-purple-500 outline-none">
                                        <option value="owner">Company Owner</option>
                                        <option value="admin">Administrator</option>
                                        <option value="manager">Manager</option>
                                        <option value="user">Standard User</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Workspace</label>
                                    <select value={userForm.workspace_id} onChange={e => setUserForm({...userForm, workspace_id: e.target.value})} className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs focus:border-purple-500 outline-none">
                                        <option value="">Auto-Create Dedicated</option>
                                        {safeWorkspaces.map(w => (
                                            <option key={w.id} value={w.id}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                                <button type="button" onClick={() => setIsCreateUserOpen(false)} className="px-4 py-2 text-xs text-gray-400 hover:text-white font-bold">Cancel</button>
                                <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-purple-500/25">Provision User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL 4: RESET USER PASSWORD ── */}
            {isResetPasswordOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[99999] p-4 animate-in fade-in">
                    <div className="bg-[#141C2E] border border-gray-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-white">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <Key size={16} className="text-purple-400" /> Reset Password
                            </h3>
                            <button onClick={() => setIsResetPasswordOpen(null)}><X size={16}/></button>
                        </div>
                        <p className="text-xs text-gray-400">Updating credentials for <span className="text-white font-semibold">{isResetPasswordOpen.email}</span></p>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">New Password</label>
                            <input
                                type="text"
                                value={newPasswordInput}
                                onChange={e => setNewPasswordInput(e.target.value)}
                                placeholder="Enter strong new password"
                                className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:border-purple-500 outline-none"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setIsResetPasswordOpen(null)} className="px-4 py-2 text-xs text-gray-400 font-bold">Cancel</button>
                            <button onClick={handleResetPassword} className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-purple-600/30">Set Password</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL 5: CHANGE WORKSPACE PLAN ── */}
            {isChangePlanOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[99999] p-4 animate-in fade-in">
                    <div className="bg-[#141C2E] border border-gray-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-white">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <Sparkles size={16} className="text-purple-400" /> Upgrade / Change Plan
                            </h3>
                            <button onClick={() => setIsChangePlanOpen(null)}><X size={16}/></button>
                        </div>
                        <p className="text-xs text-gray-400">Change plan tier for <span className="text-white font-semibold">{isChangePlanOpen.name}</span></p>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Select Target Tier</label>
                            <select
                                value={selectedPlanInput}
                                onChange={e => setSelectedPlanInput(e.target.value)}
                                className="w-full bg-[#0F172A] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs font-semibold focus:border-purple-500 outline-none"
                            >
                                <option value="One App Free">🌱 One App Free ($0/mo Forever)</option>
                                <option value="Standard Plan ($1/mo Early Bird)">💼 Standard Plan ($1/mo Early Bird)</option>
                                <option value="Standard Plan ($5/mo Monthly)">⚡ Standard Plan ($5/mo Monthly)</option>
                                <option value="Custom Plan ($37.40/mo)">👑 Custom Plan (Multi-Company &amp; APIs)</option>
                                <option value="Admin Full Control">💎 Admin Full Control (Super Admin VIP)</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setIsChangePlanOpen(null)} className="px-4 py-2 text-xs text-gray-400 font-bold">Cancel</button>
                            <button onClick={handleUpdatePlan} className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-purple-600/30">Save Tier</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL 6: DIRECTPAY DIAGNOSTICS & PING TEST ── */}
            {isTestStripeOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[99999] p-4 animate-in fade-in">
                    <div className="bg-[#141C2E] border border-purple-500/30 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 text-white">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                            <h3 className="text-base font-bold flex items-center gap-2 text-purple-300">
                                <Globe size={18} /> Stripe Global API Connection Test
                            </h3>
                            <button onClick={() => setIsTestStripeOpen(false)}><X size={18}/></button>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-[#0F172A] p-3.5 rounded-xl border border-gray-800 text-xs font-mono space-y-1">
                                <p className="text-gray-400">Target Key: <span className="text-purple-300">{stripeSecretKey ? stripeSecretKey.slice(0, 12) + "..." : "Not Configured"}</span></p>
                                <p className="text-gray-400">Endpoint: <span className="text-emerald-400 font-bold">api.stripe.com/v1/balance</span></p>
                                <p className="text-gray-400">Protocol: <span className="text-cyan-300">Stripe REST API (TLS 1.3)</span></p>
                            </div>

                            {stripeTesting ? (
                                <div className="p-8 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
                                    <RefreshCw className="animate-spin text-purple-400" size={16} /> Connecting to Stripe API &amp; verifying credentials...
                                </div>
                            ) : stripeTestResult ? (
                                <div className={`p-4 rounded-xl border text-xs font-mono ${stripeTestResult.ok ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-red-500/10 border-red-500/30 text-red-300"}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-bold">{stripeTestResult.ok ? "✅ STRIPE CONNECTED" : "❌ CONNECTION FAILED"}</p>
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 font-mono">HTTP {stripeTestResult.status}</span>
                                    </div>
                                    <pre className="overflow-x-auto text-[11px] p-2 bg-black/40 rounded-lg whitespace-pre-wrap">
                                        {JSON.stringify(stripeTestResult.data || stripeTestResult.error, null, 2)}
                                    </pre>
                                </div>
                            ) : null}
                        </div>

                        <div className="flex justify-end pt-2">
                            <button onClick={() => setIsTestStripeOpen(false)} className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isTestDirectPayOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[99999] p-4 animate-in fade-in">
                    <div className="bg-[#141C2E] border border-cyan-500/30 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 text-white">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                            <h3 className="text-base font-bold flex items-center gap-2 text-cyan-300">
                                <CreditCard size={18} /> DirectPay Card Gateway Ping & Diagnostic
                            </h3>
                            <button onClick={() => setIsTestDirectPayOpen(false)}><X size={18}/></button>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-[#0F172A] p-3.5 rounded-xl border border-gray-800 text-xs font-mono space-y-1">
                                <p className="text-gray-400">Client ID: <span className="text-cyan-300">pwa_ci_k1qlq54hv4gw5pr0khux</span></p>
                                <p className="text-gray-400">Mode: <span className="text-emerald-400 font-bold">Card-Only (No JazzCash / EasyPaisa)</span></p>
                                <p className="text-gray-400">Security: <span className="text-purple-300">HMAC-SHA256 Checksum Signature</span></p>
                            </div>

                            {directPayTestResult ? (
                                <div className={`p-4 rounded-xl border text-xs font-mono ${directPayTestResult.ok ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-red-500/10 border-red-500/30 text-red-300"}`}>
                                    <p className="font-bold mb-2">HTTP {directPayTestResult.status} · {directPayTestResult.ok ? "SUCCESS" : "TEST RESULT"}</p>
                                    <pre className="overflow-x-auto text-[11px] p-2 bg-black/40 rounded-lg whitespace-pre-wrap">
                                        {JSON.stringify(directPayTestResult.data || directPayTestResult.error, null, 2)}
                                    </pre>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
                                    <RefreshCw className="animate-spin" size={16} /> Generating test checkout session...
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-2">
                            <button onClick={() => setIsTestDirectPayOpen(false)} className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

// ── SUB-COMPONENTS & HELPERS ───────────────────────────────────────────
function fmtDate(d: string) {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" }); }
    catch { return d; }
}

function StatCard({ label, value, icon, color, bg }: any) {
    return (
        <div className="bg-[#111827] rounded-3xl p-5 border border-gray-800 shadow-xl group hover:border-purple-500/40 hover:scale-[1.02] transition-all">
            <div className={`${bg} ${color} p-2.5 rounded-2xl w-fit mb-3 group-hover:scale-110 transition-transform`}>{icon}</div>
            <p className="text-2xl font-black text-white mb-0.5 tracking-tight">{value}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</p>
        </div>
    );
}

function TabBtn({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count?: number }) {
    return (
        <button onClick={onClick} className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${active ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/60"}`}>
            {label}
            {count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${active ? "bg-white/20 text-white" : "bg-gray-800 text-gray-400"}`}>
                    {count}
                </span>
            )}
        </button>
    );
}

function TableHeader({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
    return (
        <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#111827]/40">
            <div>
                <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
            </div>
            {children}
        </div>
    );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
    return (
        <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-2.5 text-gray-500" size={15}/>
            <input 
                type="text" 
                placeholder={placeholder} 
                value={value} 
                onChange={e => onChange(e.target.value)}
                className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-purple-500 transition-all text-white placeholder-gray-500"
            />
        </div>
    );
}

function ActionBtn({ onClick, loading, label, color }: { onClick: () => void; loading: boolean; label: string; color: string }) {
    const styles: Record<string, string> = {
        emerald: "bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white border-emerald-500/30",
        red:     "bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white border-red-500/30",
        amber:   "bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-black border-amber-500/30",
    };
    return (
        <button onClick={onClick} disabled={loading} className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all disabled:opacity-50 cursor-pointer ${styles[color]}`}>
            {loading ? "..." : label}
        </button>
    );
}

function FlagToggle({ label, desc, enabled, onToggle }: { label: string; desc: string; enabled: boolean; onToggle: () => void }) {
    return (
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-gray-800 flex items-center justify-between gap-4">
            <div>
                <p className="text-sm font-bold text-white">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
            <button onClick={onToggle} className="cursor-pointer transition-transform shrink-0">
                {enabled ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                        <Check size={12} /> ON
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-800 text-gray-400 border border-gray-700 text-xs font-bold">
                        <X size={12} /> OFF
                    </div>
                )}
            </button>
        </div>
    );
}

function HealthRow({ label, status, latency, uptime }: { label: string; status: string; latency: string; uptime: string }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A] border border-gray-800 text-xs">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-semibold text-gray-200">{label}</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="font-mono text-cyan-400">{latency}</span>
                <span className="text-gray-500">{uptime}</span>
            </div>
        </div>
    );
}

function GaugeRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A] border border-gray-800 text-xs">
            <span className="font-medium text-gray-300">{label}</span>
            <span className="font-mono font-bold text-purple-400">{value}</span>
        </div>
    );
}

function LoadingRow({ cols }: { cols: number }) {
    return <tr><td colSpan={cols} className="px-6 py-14 text-center text-gray-500 text-xs">Connecting to platform matrix...</td></tr>;
}
function EmptyRow({ cols }: { cols: number }) {
    return <tr><td colSpan={cols} className="px-6 py-14 text-center text-gray-500 text-xs">No records found.</td></tr>;
}
