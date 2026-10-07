import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

OUTPUT_DIR = r"D:\ERP_CRM\scratch\deck_assets"
PUBLIC_OUTPUT_DIR = r"D:\ERP_CRM\public\deck_assets"
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(PUBLIC_OUTPUT_DIR, exist_ok=True)

plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['axes.edgecolor'] = '#1E293B'
plt.rcParams['axes.linewidth'] = 1.0

def save_dual(fig, filename):
    p1 = os.path.join(OUTPUT_DIR, filename)
    p2 = os.path.join(PUBLIC_OUTPUT_DIR, filename)
    fig.savefig(p1, dpi=200, bbox_inches='tight', facecolor='#0B0F19', edgecolor='none')
    fig.savefig(p2, dpi=200, bbox_inches='tight', facecolor='#0B0F19', edgecolor='none')
    plt.close(fig)
    print(f"Chart saved: {filename}")

# ==============================================================================
# CHART 1: Market TAM / SAM / SOM ($62B -> $136B)
# ==============================================================================
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10.5, 4.2), facecolor='#0B0F19')

years = ['2024', '2025', '2026', '2027', '2028', '2029', '2030']
market_size = [62.4, 71.0, 81.5, 93.2, 106.8, 120.5, 136.2]

ax1.set_facecolor('#0B0F19')
bars = ax1.bar(years, market_size, color='#1E293B', edgecolor='#38BDF8', linewidth=1.5, width=0.55)
bars[-1].set_color('#0284C7')
bars[-1].set_edgecolor('#38BDF8')

ax1.plot(years, market_size, color='#38BDF8', marker='o', linewidth=2.5, markersize=6)
for i, v in enumerate(market_size):
    ax1.text(i, v + 3.5, f"${v}B", ha='center', va='bottom', color='#F8FAFC', fontsize=8.5, fontweight='bold')

ax1.set_title("Global ERP Software Market (13.8% CAGR)", color='#F8FAFC', fontsize=10.5, fontweight='bold', pad=12)
ax1.set_ylabel("Market Size (USD Billions)", color='#94A3B8', fontsize=8.5)
ax1.tick_params(colors='#94A3B8', labelsize=8)
ax1.set_ylim(0, 160)
ax1.grid(axis='y', color='#1E293B', linestyle='--', alpha=0.7)

ax2.set_facecolor('#0B0F19')
categories = ['TAM\nTotal Addressable', 'SAM\nServiceable Available', 'SOM\nTarget Share (Y3-5)']
values = [34.8, 8.2, 0.41]
colors_list = ['#6366F1', '#8B5CF6', '#10B981']

bar_horiz = ax2.barh(categories, values, color=colors_list, edgecolor='#F8FAFC', linewidth=0.5, height=0.5)
ax2.set_title("Addressable Market Opportunity (SMB AI ERP)", color='#F8FAFC', fontsize=10.5, fontweight='bold', pad=12)
ax2.set_xlabel("Market Opportunity (USD Billions)", color='#94A3B8', fontsize=8.5)
ax2.tick_params(colors='#94A3B8', labelsize=8)
ax2.grid(axis='x', color='#1E293B', linestyle='--', alpha=0.7)
ax2.set_xlim(0, 42)

ax2.text(34.8 + 0.8, 0, "$34.8 Billion\n(Global SMB Cloud ERP/CRM)", va='center', color='#818CF8', fontsize=8, fontweight='bold')
ax2.text(8.2 + 0.8, 1, "$8.2 Billion\n(Odoo/GHL/Zoho Switchers)", va='center', color='#C084FC', fontsize=8, fontweight='bold')
ax2.text(0.41 + 0.8, 2, "$410 Million\n(Beraxis 5% Initial Capture)", va='center', color='#34D399', fontsize=8, fontweight='bold')

plt.tight_layout()
save_dual(fig, "chart_market_tam.png")


# ==============================================================================
# CHART 2: 5-Year ARR Growth Forecast ($835K -> $62M ARR)
# ==============================================================================
fig, ax = plt.subplots(figsize=(10.5, 4.2), facecolor='#0B0F19')
ax.set_facecolor('#0B0F19')

years_arr = ['Year 1\n(Initial Blitz)', 'Year 2\n(AI Outbound)', 'Year 3\n(Partner Scale)', 'Year 4\n(Enterprise)', 'Year 5\n(Market Leader)']
arr_millions = [0.835, 4.60, 16.50, 34.20, 62.00]
paying_users = [350, 1800, 5500, 10500, 18000]

bars = ax.bar(years_arr, arr_millions, color=['#1E293B', '#1E1B4B', '#312E81', '#3730A3', '#4F46E5'], edgecolor='#818CF8', linewidth=1.5, width=0.5)
ax.plot(years_arr, arr_millions, color='#38BDF8', marker='s', linewidth=2.5, markersize=7)

for i, (v, users) in enumerate(zip(arr_millions, paying_users)):
    label = f"${int(v*1000)}k ARR\n({users:,} Accounts)" if v < 1 else f"${v:.1f}M ARR\n({users:,} Accounts)"
    ax.text(i, v + 2.5, label, ha='center', va='bottom', color='#F8FAFC', fontsize=8.5, fontweight='bold')

ax.set_title("5-Year Financial Forecast & ARR Trajectory ($0.8M → $62M ARR)", color='#F8FAFC', fontsize=11, fontweight='bold', pad=14)
ax.set_ylabel("Annual Recurring Revenue (USD Millions)", color='#94A3B8', fontsize=9)
ax.tick_params(colors='#94A3B8', labelsize=8.5)
ax.set_ylim(0, 75)
ax.grid(axis='y', color='#1E293B', linestyle='--', alpha=0.7)

plt.tight_layout()
save_dual(fig, "chart_arr_growth.png")


# ==============================================================================
# CHART 3: Unit Economics & SaaS Health Metrics
# ==============================================================================
fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(10.5, 4.4), facecolor='#0B0F19')

ax1.set_facecolor('#0B0F19')
metrics_ltv = ['CAC\n(Acquisition)', 'LTV\n(Lifetime Value)']
vals_ltv = [180, 4800]
ax1.bar(metrics_ltv, vals_ltv, color=['#EF4444', '#10B981'], width=0.45, edgecolor='#F8FAFC', linewidth=0.5)
ax1.text(0, 300, "$180", ha='center', color='#F8FAFC', fontweight='bold', fontsize=9)
ax1.text(1, 4900, "$4,800\n(26.6x LTV:CAC)", ha='center', color='#34D399', fontweight='bold', fontsize=8.5)
ax1.set_title("Customer Lifetime Value vs. CAC", color='#F8FAFC', fontsize=9, fontweight='bold')
ax1.set_ylim(0, 6000)
ax1.tick_params(colors='#94A3B8', labelsize=7.5)
ax1.grid(axis='y', color='#1E293B', linestyle='--', alpha=0.5)

ax2.set_facecolor('#0B0F19')
sizes = [84, 16]
colors_pie = ['#38BDF8', '#1E293B']
ax2.pie(sizes, colors=colors_pie, autopct='%1.0f%%', startangle=140, 
        textprops=dict(color='#F8FAFC', fontweight='bold', fontsize=9),
        wedgeprops=dict(edgecolor='#0B0F19', linewidth=2))
ax2.set_title("Gross Margin (84% SaaS)", color='#F8FAFC', fontsize=9, fontweight='bold')

ax3.set_facecolor('#0B0F19')
paybacks = ['Beraxis', 'Industry Avg\n(SaaS)']
pb_vals = [1.1, 14.5]
ax3.barh(paybacks, pb_vals, color=['#10B981', '#64748B'], height=0.45)
ax3.text(1.3, 0, "1.1 Months (Fast Recovery)", va='center', color='#34D399', fontweight='bold', fontsize=7.5)
ax3.text(14.7, 1, "14.5 Months", va='center', color='#CBD5E1', fontweight='bold', fontsize=7.5)
ax3.set_title("CAC Payback Period (Months)", color='#F8FAFC', fontsize=9, fontweight='bold')
ax3.set_xlim(0, 20)
ax3.tick_params(colors='#94A3B8', labelsize=7.5)
ax3.grid(axis='x', color='#1E293B', linestyle='--', alpha=0.5)

ax4.set_facecolor('#0B0F19')
ax4.bar(['NRR (132%)'], [100], color='#6366F1', width=0.35, label='Base Subscription')
ax4.bar(['NRR (132%)'], [32], bottom=[100], color='#C084FC', width=0.35, label='AI Credits / Voice Add-on')
ax4.set_title("Net Revenue Retention (132%)", color='#F8FAFC', fontsize=9, fontweight='bold')
ax4.set_ylim(0, 150)
ax4.legend(facecolor='#0F172A', edgecolor='#1E293B', fontsize=6.5, labelcolor='#CBD5E1', loc='upper right')
ax4.tick_params(colors='#94A3B8', labelsize=7.5)
ax4.grid(axis='y', color='#1E293B', linestyle='--', alpha=0.5)

plt.tight_layout()
save_dual(fig, "chart_unit_economics.png")


# ==============================================================================
# CHART 4: Realistic Competitor Comparison (Beraxis vs Odoo, Zoho, GoHighLevel)
# ==============================================================================
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10.5, 4.2), facecolor='#0B0F19')

# 4A: Implementation Time (Days)
ax1.set_facecolor('#0B0F19')
platforms = ['Beraxis AI', 'GoHighLevel', 'Zoho One', 'Odoo ERP']
setup_days = [0.01, 7, 35, 90] # in Days
colors_comp = ['#10B981', '#38BDF8', '#F59E0B', '#EF4444']

ax1.barh(platforms, setup_days, color=colors_comp, height=0.5)
ax1.text(1, 0, "15 Minutes (Instant)", va='center', color='#34D399', fontweight='bold', fontsize=8)
ax1.text(8.5, 1, "7 Days (CRM Only)", va='center', color='#CBD5E1', fontsize=8)
ax1.text(37, 2, "35 Days (40+ Apps)", va='center', color='#CBD5E1', fontsize=8)
ax1.text(92, 3, "90 Days (Consultants)", va='center', color='#CBD5E1', fontsize=8)

ax1.set_title("Implementation Time-to-Value (Days)", color='#F8FAFC', fontsize=10, fontweight='bold', pad=10)
ax1.set_xlim(0, 120)
ax1.tick_params(colors='#94A3B8', labelsize=8)
ax1.grid(axis='x', color='#1E293B', linestyle='--', alpha=0.6)

# 4B: Monthly Cost & Scope Comparison
ax2.set_facecolor('#0B0F19')
platforms_cost = ['Beraxis\n(Full ERP+AI)', 'GoHighLevel\n(No ERP/Books)', 'Zoho One\n(40+ Apps)', 'Odoo\n(+App Fees)']
monthly_cost = [199, 497, 700, 720]

bars2 = ax2.bar(platforms_cost, monthly_cost, color=['#38BDF8', '#6366F1', '#F59E0B', '#EF4444'], width=0.5)
for i, c in enumerate(monthly_cost):
    ax2.text(i, c + 25, f"${c}/mo", ha='center', va='bottom', color='#F8FAFC', fontweight='bold', fontsize=8)

ax2.set_title("Monthly Cost & Scope (20 Users)", color='#F8FAFC', fontsize=10, fontweight='bold', pad=10)
ax2.set_ylabel("USD / Month", color='#94A3B8', fontsize=8.5)
ax2.set_ylim(0, 950)
ax2.tick_params(colors='#94A3B8', labelsize=7.5)
ax2.grid(axis='y', color='#1E293B', linestyle='--', alpha=0.6)

plt.tight_layout()
save_dual(fig, "chart_competitor_comparison.png")

print("Updated realistic competitor comparison charts generated successfully!")
