"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StandardModuleHeader from "@/components/shared/StandardModuleHeader";
import { useBranchContext } from "@/lib/branchContext";
import { useTheme } from "@/lib/themeContext";
import { GLOBAL_INDUSTRIES } from "@/lib/industryTaxonomy";
import { exportToCSV, exportToExcel, printQuotationPDF } from "@/lib/exportUtils";
import type {
  SalesOrderRecord,
  SalesOrderState,
  SalesPricelist,
  SalesReturnRecord,
  SalesLineItem,
} from "@/app/api/sales/route";
import {
  BarChart3,
  Plus,
  FileText,
  CheckCircle2,
  Truck,
  Receipt,
  RotateCcw,
  Tag,
  Download,
  FileSpreadsheet,
  ShoppingBag,
  UtensilsCrossed,
  PhoneCall,
  Building2,
  Sparkles,
  Trash2,
  X,
  ArrowRight,
  Layers,
} from "lucide-react";

const MENU_ITEMS = [
  { name: "Sales Hub", href: "/sales" },
  { name: "Confirmed Orders", href: "/sales/orders" },
  { name: "Customers", href: "/sales/customers" },
  { name: "Products", href: "/sales/products" },
  { name: "Reporting", href: "/sales/reporting" },
  { name: "Configuration", href: "/sales/configuration" },
];

type IndustrySalesBlueprint = {
  quoteLabel: string;
  orderLabel: string;
  fulfillLabel: string;
  channelDefault: SalesOrderRecord["channel"];
  metaFields: { key: string; label: string; placeholder: string }[];
  sampleOrders: Omit<SalesOrderRecord, "id" | "clusterId" | "created_at" | "updated_at">[];
};

function getIndustrySalesBlueprint(industryId: string): IndustrySalesBlueprint {
  switch (industryId) {
    case "retail_supermarket":
      return {
        quoteLabel: "Wholesale / Bulk Quote",
        orderLabel: "Supermarket / B2B Order",
        fulfillLabel: "Dispatch Crates",
        channelDefault: "Wholesale B2B",
        metaFields: [
          { key: "deliverySlot", label: "Delivery / Pickup Slot", placeholder: "Tomorrow 08:00 - 11:00 AM" },
          { key: "loyaltyOrTaxId", label: "Customer Loyalty / Trade ID", placeholder: "TRD-90412" },
        ],
        sampleOrders: [
          {
            name: "SO-2026-SM01",
            industryId: "retail_supermarket",
            channel: "Wholesale B2B",
            customer_name: "Metro Fresh Mart — Branch 4",
            customer_phone: "+1-555-0194",
            pricelistName: "Supermarket / B2B Case Wholesale",
            paymentTerms: "Net 15",
            state: "sale",
            lines: [
              { id: "L1", sku: "8901003", name: "Extra Virgin Olive Oil 1L (Case x12)", quantity: 5, uom: "Cases", unitPrice: 148, subtotal: 740 },
              { id: "L2", sku: "8901004", name: "Arabica Coffee Beans 500g (Case x10)", quantity: 4, uom: "Cases", unitPrice: 135, subtotal: 540 },
            ],
            subtotal: 1280,
            discountTotal: 0,
            taxRate: 5,
            taxAmount: 64,
            amount_total: 1344,
            amountPaid: 0,
            industryMeta: { deliverySlot: "Morning Cold-Van 08:30 AM", loyaltyOrTaxId: "B2B-4410" },
            date_order: new Date().toISOString(),
          },
          {
            name: "SO-2026-SM02",
            industryId: "retail_supermarket",
            channel: "Direct Sales",
            customer_name: "Greenfield Corporate Pantry",
            pricelistName: "Corporate & VIP Contract Tier",
            paymentTerms: "Monthly Account",
            state: "draft",
            lines: [
              { id: "L1", sku: "8901001", name: "Organic Whole Milk 1L", quantity: 60, uom: "Units", unitPrice: 3.5, subtotal: 210 },
              { id: "L2", sku: "8901002", name: "Artisan Sourdough Loaf", quantity: 30, uom: "Units", unitPrice: 4.0, subtotal: 120 },
            ],
            subtotal: 330,
            discountTotal: 0,
            taxRate: 0,
            taxAmount: 0,
            amount_total: 330,
            amountPaid: 0,
            industryMeta: { deliverySlot: "Weekly Monday 07:30 AM" },
            date_order: new Date().toISOString(),
          },
        ],
      };

    case "food_beverage":
    case "hospitality_travel":
      return {
        quoteLabel: "Catering / Event Proposal",
        orderLabel: "Banquet & Catering Order",
        fulfillLabel: "Mark Event Served",
        channelDefault: "Catering & Events",
        metaFields: [
          { key: "guestCount", label: "Guest Headcount", placeholder: "e.g. 120 Guests" },
          { key: "eventDateTime", label: "Event Date & Service Time", placeholder: "2026-12-05 19:30" },
          { key: "dietaryNotes", label: "Menu / Dietary Requirements", placeholder: "Halal, 15 Vegan plates, Live Grill" },
        ],
        sampleOrders: [
          {
            name: "CAT-2026-FB01",
            industryId: "food_beverage",
            channel: "Catering & Events",
            customer_name: "Apex Tech Annual Gala Dinner",
            customer_phone: "+1-555-0821",
            pricelistName: "Corporate & VIP Contract Tier",
            paymentTerms: "50% Advance Deposit",
            state: "sale",
            lines: [
              { id: "L1", sku: "CAT-GOLD", name: "3-Course Executive Banquet Menu (Per Guest)", quantity: 120, uom: "Guests", unitPrice: 38, subtotal: 4560 },
              { id: "L2", sku: "CAT-BEV", name: "Specialty Mocktail & Espresso Bar", quantity: 120, uom: "Guests", unitPrice: 9, subtotal: 1080 },
            ],
            subtotal: 5640,
            discountTotal: 0,
            taxRate: 8,
            taxAmount: 451.2,
            amount_total: 6091.2,
            amountPaid: 3000,
            industryMeta: { guestCount: "120 Guests", eventDateTime: "2026-12-05 19:30", dietaryNotes: "10 Gluten-free, Live Barista Station" },
            date_order: new Date().toISOString(),
          },
          {
            name: "CAT-2026-FB02",
            industryId: "food_beverage",
            channel: "Catering & Events",
            customer_name: "Horizon Law Firm Executive Boxes",
            pricelistName: "Standard Retail Tariff",
            paymentTerms: "Immediate",
            state: "draft",
            lines: [
              { id: "L1", sku: "FB-101", name: "Gourmet Smash Burger &Sides Box", quantity: 45, uom: "Boxes", unitPrice: 18.5, subtotal: 832.5 },
            ],
            subtotal: 832.5,
            discountTotal: 0,
            taxRate: 0,
            taxAmount: 0,
            amount_total: 832.5,
            amountPaid: 0,
            industryMeta: { guestCount: "45 Pax", eventDateTime: "Friday 12:30 PM" },
            date_order: new Date().toISOString(),
          },
        ],
      };

    case "call_center":
      return {
        quoteLabel: "Policy / Plan Quote",
        orderLabel: "Closer Deal Sheet",
        fulfillLabel: "QA Verify & Issue",
        channelDefault: "Call Center Closer",
        metaFields: [
          { key: "carrierName", label: "Carrier / Provider", placeholder: "Mutual of Omaha / Aetna" },
          { key: "policyNumber", label: "Policy / Contract #", placeholder: "POL-884920" },
          { key: "fronterCloser", label: "Fronter → Closer Agents", placeholder: "Ali (Fronter) → Sarah (Closer)" },
        ],
        sampleOrders: [
          {
            name: "DEAL-2026-CC01",
            industryId: "call_center",
            channel: "Call Center Closer",
            customer_name: "Robert Henderson",
            customer_phone: "+1-555-0319",
            pricelistName: "Standard Retail Tariff",
            paymentTerms: "1st Draft 1st of Month",
            state: "invoiced",
            lines: [
              { id: "L1", sku: "FE-25K", name: "Final Expense Whole Life ($25,000 Coverage — Annualized)", quantity: 12, uom: "Months", unitPrice: 74, subtotal: 888 },
            ],
            subtotal: 888,
            discountTotal: 0,
            taxRate: 0,
            taxAmount: 0,
            amount_total: 888,
            amountPaid: 888,
            invoiceRef: "INV/2026/CC01",
            deliveryRef: "QA-PASSED",
            industryMeta: { carrierName: "Mutual of Omaha", policyNumber: "MOO-77412", fronterCloser: "Hamza → Omar Closer" },
            date_order: new Date().toISOString(),
          },
        ],
      };

    case "professional_services":
      return {
        quoteLabel: "SOW / Retainer Proposal",
        orderLabel: "Signed Client Engagement",
        fulfillLabel: "Deliver Milestone",
        channelDefault: "Direct Sales",
        metaFields: [
          { key: "projectCode", label: "Project / Matter Code", placeholder: "PRJ-2026-88" },
          { key: "billableHours", label: "Estimated Billable Hours", placeholder: "120 hrs @ $125/hr" },
        ],
        sampleOrders: [
          {
            name: "SOW-2026-PS01",
            industryId: "professional_services",
            channel: "Direct Sales",
            customer_name: "Vanguard FinTech Holdings",
            pricelistName: "Corporate & VIP Contract Tier",
            paymentTerms: "50% Mobilization / 50% Go-Live",
            state: "sale",
            lines: [
              { id: "L1", sku: "ENG-CLOUD", name: "Cloud Security Audit & Architecture Sprint", quantity: 80, uom: "Hours", unitPrice: 125, subtotal: 10000 },
            ],
            subtotal: 10000,
            discountTotal: 0,
            taxRate: 0,
            taxAmount: 0,
            amount_total: 10000,
            amountPaid: 5000,
            industryMeta: { projectCode: "SOW-FIN-09", billableHours: "80 Billable Hours" },
            date_order: new Date().toISOString(),
          },
        ],
      };

    case "manufacturing":
      return {
        quoteLabel: "Factory MTO Quotation",
        orderLabel: "Production Sales Order",
        fulfillLabel: "QC Pass & Ship Lot",
        channelDefault: "Wholesale B2B",
        metaFields: [
          { key: "bomRef", label: "BOM / Work Center", placeholder: "BOM-CNC-04 • Line B" },
          { key: "lotNumber", label: "Batch / Lot Tracking #", placeholder: "LOT-2026-11A" },
        ],
        sampleOrders: [
          {
            name: "MTO-2026-MF01",
            industryId: "manufacturing",
            channel: "Wholesale B2B",
            customer_name: "Atlas Industrial Robotics",
            pricelistName: "Supermarket / B2B Case Wholesale",
            paymentTerms: "Net 30",
            state: "sale",
            lines: [
              { id: "L1", sku: "CNC-HSG-09", name: "Precision Machined Aluminum Housing", quantity: 200, uom: "Units", unitPrice: 48, subtotal: 9600 },
            ],
            subtotal: 9600,
            discountTotal: 0,
            taxRate: 5,
            taxAmount: 480,
            amount_total: 10080,
            amountPaid: 0,
            industryMeta: { bomRef: "BOM-AL6061", lotNumber: "LOT-26-901" },
            date_order: new Date().toISOString(),
          },
        ],
      };

    case "healthcare_wellness":
      return {
        quoteLabel: "Treatment Plan Estimate",
        orderLabel: "Approved Patient Care Plan",
        fulfillLabel: "Complete Procedure",
        channelDefault: "Direct Sales",
        metaFields: [
          { key: "practitioner", label: "Attending Doctor / Specialist", placeholder: "Dr. Sara Malik" },
          { key: "patientChart", label: "Patient File / Insurance Ref", placeholder: "PAT-40912" },
        ],
        sampleOrders: [
          {
            name: "CLN-2026-HC01",
            industryId: "healthcare_wellness",
            channel: "Direct Sales",
            customer_name: "Nadia Al-Farsi",
            pricelistName: "Standard Retail Tariff",
            paymentTerms: "Immediate",
            state: "sale",
            lines: [
              { id: "L1", sku: "HC-IMP-01", name: "Ceramic Dental Crown & 3D Scan Package", quantity: 1, uom: "Package", unitPrice: 950, subtotal: 950 },
            ],
            subtotal: 950,
            discountTotal: 0,
            taxRate: 0,
            taxAmount: 0,
            amount_total: 950,
            amountPaid: 950,
            industryMeta: { practitioner: "Dr. H. Siddiqui", patientChart: "CLN-8821" },
            date_order: new Date().toISOString(),
          },
        ],
      };

    case "automotive_workshop":
      return {
        quoteLabel: "Vehicle Repair Estimate",
        orderLabel: "Approved Service Job Card",
        fulfillLabel: "Release Vehicle",
        channelDefault: "Direct Sales",
        metaFields: [
          { key: "vinPlate", label: "Vehicle Plate & VIN", placeholder: "ABC-4921 • WBA33..." },
          { key: "serviceBay", label: "Assigned Mechanic & Bay", placeholder: "Bay 02 — Master Tech" },
        ],
        sampleOrders: [
          {
            name: "JOB-2026-AW01",
            industryId: "automotive_workshop",
            channel: "Direct Sales",
            customer_name: " Tariq Logistics Fleet",
            pricelistName: "Corporate & VIP Contract Tier",
            paymentTerms: "Immediate",
            state: "sale",
            lines: [
              { id: "L1", sku: "AW-302", name: "Ceramic Brake Pads + Rotor Machining", quantity: 2, uom: "Axles", unitPrice: 220, subtotal: 440 },
              { id: "L2", sku: "AW-LAB", name: "Master Technician Labor", quantity: 3, uom: "Hours", unitPrice: 65, subtotal: 195 },
            ],
            subtotal: 635,
            discountTotal: 0,
            taxRate: 5,
            taxAmount: 31.75,
            amount_total: 666.75,
            amountPaid: 0,
            industryMeta: { vinPlate: "FLT-9021", serviceBay: "Bay 01" },
            date_order: new Date().toISOString(),
          },
        ],
      };

    case "real_estate":
      return {
        quoteLabel: "Lease / Purchase Offer",
        orderLabel: "Executed Lease / Escrow",
        fulfillLabel: "Hand Over Keys",
        channelDefault: "Direct Sales",
        metaFields: [
          { key: "propertyUnit", label: "Property & Unit #", placeholder: "Crescent Tower — Suite 12B" },
          { key: "leaseDuration", label: "Lease Term / Escrow Date", placeholder: "12 Months Annual" },
        ],
        sampleOrders: [
          {
            name: "LSE-2026-RE01",
            industryId: "real_estate",
            channel: "Direct Sales",
            customer_name: "BlueWave Consulting LLC",
            pricelistName: "Corporate & VIP Contract Tier",
            paymentTerms: "Quarterly Cheques",
            state: "sale",
            lines: [
              { id: "L1", sku: "UNIT-12B", name: "Commercial Office Lease — Suite 12B (2,400 sqft)", quantity: 12, uom: "Months", unitPrice: 3800, subtotal: 45600 },
            ],
            subtotal: 45600,
            discountTotal: 0,
            taxRate: 0,
            taxAmount: 0,
            amount_total: 45600,
            amountPaid: 11400,
            industryMeta: { propertyUnit: "Crescent Tower 12B", leaseDuration: "Jan–Dec 2026" },
            date_order: new Date().toISOString(),
          },
        ],
      };

    case "education_academies":
      return {
        quoteLabel: "Admission & Fee Offer",
        orderLabel: "Student Tuition Order",
        fulfillLabel: "Activate Enrollment",
        channelDefault: "Direct Sales",
        metaFields: [
          { key: "cohortBatch", label: "Program & Cohort", placeholder: "Fall 2026 — Full-Stack AI" },
          { key: "studentId", label: "Student Roll #", placeholder: "STU-2026-412" },
        ],
        sampleOrders: [
          {
            name: "TUI-2026-ED01",
            industryId: "education_academies",
            channel: "Direct Sales",
            customer_name: "Bilal Ahmed",
            pricelistName: "Standard Retail Tariff",
            paymentTerms: "Term Installment",
            state: "invoiced",
            lines: [
              { id: "L1", sku: "BOOT-AI", name: "16-Week Cloud & AI Engineering Bootcamp Tuition", quantity: 1, uom: "Term", unitPrice: 2400, subtotal: 2400 },
            ],
            subtotal: 2400,
            discountTotal: 0,
            taxRate: 0,
            taxAmount: 0,
            amount_total: 2400,
            amountPaid: 2400,
            invoiceRef: "INV/2026/ED01",
            industryMeta: { cohortBatch: "Cohort 2026-B", studentId: "STU-412" },
            date_order: new Date().toISOString(),
          },
        ],
      };

    case "logistics_wholesale":
      return {
        quoteLabel: "Freight & Wholesale Quote",
        orderLabel: "3PL / Pallet Shipment Order",
        fulfillLabel: "Dispatch Fleet / BOL",
        channelDefault: "Wholesale B2B",
        metaFields: [
          { key: "bolNumber", label: "Bill of Lading / Truck #", placeholder: "BOL-88921 • TRK-14" },
          { key: "routeZone", label: "Origin → Destination Hub", placeholder: "Port Warehouse → North DC" },
        ],
        sampleOrders: [
          {
            name: "BOL-2026-LG01",
            industryId: "logistics_wholesale",
            channel: "Wholesale B2B",
            customer_name: "Continental Retail Group",
            pricelistName: "Supermarket / B2B Case Wholesale",
            paymentTerms: "Net 30",
            state: "sale",
            lines: [
              { id: "L1", sku: "PLT-FMCG", name: "Mixed FMCG Pallet Distribution (22 Pallets)", quantity: 22, uom: "Pallets", unitPrice: 310, subtotal: 6820 },
            ],
            subtotal: 6820,
            discountTotal: 0,
            taxRate: 0,
            taxAmount: 0,
            amount_total: 6820,
            amountPaid: 0,
            industryMeta: { bolNumber: "BOL-2026-771", routeZone: "Central Hub → Metro Stores" },
            date_order: new Date().toISOString(),
          },
        ],
      };

    case "construction_contracting":
      return {
        quoteLabel: "BOQ / Tender Bid",
        orderLabel: "Progress Billing Contract",
        fulfillLabel: "Certify Site Milestone",
        channelDefault: "Direct Sales",
        metaFields: [
          { key: "siteName", label: "Project Site & Zone", placeholder: "Marina Commercial Fitout" },
          { key: "retentionPct", label: "Retention & Cert #", placeholder: "10% Retention • IPC #2" },
        ],
        sampleOrders: [
          {
            name: "IPC-2026-CN01",
            industryId: "construction_contracting",
            channel: "Direct Sales",
            customer_name: "Emaar MEP Developments",
            pricelistName: "Corporate & VIP Contract Tier",
            paymentTerms: "Net 30 Upon QS Cert",
            state: "sale",
            lines: [
              { id: "L1", sku: "MEP-PH2", name: "HVAC & Electrical Rough-In — Phase 2", quantity: 1, uom: "Milestone", unitPrice: 28500, subtotal: 28500 },
            ],
            subtotal: 28500,
            discountTotal: 0,
            taxRate: 5,
            taxAmount: 1425,
            amount_total: 29925,
            amountPaid: 0,
            industryMeta: { siteName: "Plot 14 Tower B", retentionPct: "10% Retention" },
            date_order: new Date().toISOString(),
          },
        ],
      };

    case "fitness_sports_club":
      return {
        quoteLabel: "Corporate / Club Proposal",
        orderLabel: "Membership & Court Package",
        fulfillLabel: "Issue RFID & Activate",
        channelDefault: "Direct Sales",
        metaFields: [
          { key: "courtOrTier", label: "Membership Tier / Court", placeholder: "Unlimited Padel VIP" },
          { key: "rfidTag", label: "RFID Turnstile Card #", placeholder: "RFID-99204" },
        ],
        sampleOrders: [
          {
            name: "CLB-2026-SP01",
            industryId: "fitness_sports_club",
            channel: "Direct Sales",
            customer_name: "Corporate Padel League (16 Players)",
            pricelistName: "Corporate & VIP Contract Tier",
            paymentTerms: "Immediate",
            state: "sale",
            lines: [
              { id: "L1", sku: "PAD-TOURN", name: "Weekend Panoramic Courts #1-#4 Tournament Block", quantity: 8, uom: "Hours", unitPrice: 160, subtotal: 1280 },
            ],
            subtotal: 1280,
            discountTotal: 0,
            taxRate: 0,
            taxAmount: 0,
            amount_total: 1280,
            amountPaid: 1280,
            industryMeta: { courtOrTier: "Courts 1–4", rfidTag: "EVENT-PASS" },
            date_order: new Date().toISOString(),
          },
        ],
      };

    case "ngos":
      return {
        quoteLabel: "Grant / Donor Concept Note",
        orderLabel: "Committed Donor Grant",
        fulfillLabel: "Disburse Field Aid",
        channelDefault: "Direct Sales",
        metaFields: [
          { key: "fundType", label: "Fund Restriction", placeholder: "Restricted — Clean Water" },
          { key: "beneficiaries", label: "Target Beneficiaries", placeholder: "1,500 Households" },
        ],
        sampleOrders: [
          {
            name: "GRT-2026-NG01",
            industryId: "ngos",
            channel: "Direct Sales",
            customer_name: "Nordic Humanitarian Endowment",
            pricelistName: "Corporate & VIP Contract Tier",
            paymentTerms: "Tranche Release",
            state: "invoiced",
            lines: [
              { id: "L1", sku: "WASH-26", name: "Solar Water Filtration & Rural School Kits", quantity: 1, uom: "Grant", unitPrice: 35000, subtotal: 35000 },
            ],
            subtotal: 35000,
            discountTotal: 0,
            taxRate: 0,
            taxAmount: 0,
            amount_total: 35000,
            amountPaid: 35000,
            invoiceRef: "RCPT/NGO/2601",
            industryMeta: { fundType: "Restricted WASH Fund", beneficiaries: "1,800 Beneficiaries" },
            date_order: new Date().toISOString(),
          },
        ],
      };

    case "agriculture_agritech":
      return {
        quoteLabel: "Harvest / Solar EPC Quote",
        orderLabel: "Agri-Supply / Solar Contract",
        fulfillLabel: "Deliver Harvest / Commission",
        channelDefault: "Wholesale B2B",
        metaFields: [
          { key: "harvestOrKw", label: "Harvest Lot / Solar Capacity", placeholder: "Lot #A14 (12 Tons) or 50kW Hybrid" },
          { key: "coldChainSite", label: "Cold-Chain / Field GPS", placeholder: "Reefer +4°C • Sector 7" },
        ],
        sampleOrders: [
          {
            name: "AGR-2026-AG01",
            industryId: "agriculture_agritech",
            channel: "Wholesale B2B",
            customer_name: "SunValley Cold-Storage Exports",
            pricelistName: "Supermarket / B2B Case Wholesale",
            paymentTerms: "50% Dispatch / 50% Arrival",
            state: "sale",
            lines: [
              { id: "L1", sku: "CROP-ORG", name: "Grade-A Greenhouse Hydroponic Produce", quantity: 4000, uom: "Kg", unitPrice: 2.15, subtotal: 8600 },
            ],
            subtotal: 8600,
            discountTotal: 0,
            taxRate: 0,
            taxAmount: 0,
            amount_total: 8600,
            amountPaid: 4300,
            industryMeta: { harvestOrKw: "Batch H-2026-09", coldChainSite: "Reefer Van #3 (+4°C)" },
            date_order: new Date().toISOString(),
          },
        ],
      };

    default:
      return {
        quoteLabel: "Quotation / Proposal",
        orderLabel: "Sales Order",
        fulfillLabel: "Deliver / Fulfill",
        channelDefault: "Direct Sales",
        metaFields: [
          { key: "projectOrRef", label: "Project / PO / Reference #", placeholder: "PO-2026-774" },
          { key: "deliveryTerms", label: "Delivery / Milestone Schedule", placeholder: "FOB Warehouse / Milestone 1" },
        ],
        sampleOrders: [
          {
            name: "SO-2026-1001",
            industryId,
            channel: "Direct Sales",
            customer_name: "Global Enterprise Client",
            pricelistName: "Corporate & VIP Contract Tier",
            paymentTerms: "Net 30",
            state: "sale",
            lines: [
              { id: "L1", sku: "STD-01", name: "Enterprise Supply & Operations Package", quantity: 10, uom: "Units", unitPrice: 250, subtotal: 2500 },
            ],
            subtotal: 2500,
            discountTotal: 0,
            taxRate: 5,
            taxAmount: 125,
            amount_total: 2625,
            amountPaid: 0,
            industryMeta: { projectOrRef: "PO-99201", deliveryTerms: "Standard Dispatch" },
            date_order: new Date().toISOString(),
          },
        ],
      };
  }
}

const STATE_BADGE: Record<SalesOrderState, { label: string; cls: string }> = {
  draft: { label: "Quotation (Draft)", cls: "bg-slate-500/20 text-slate-300 border-slate-500/35" },
  sent: { label: "Quote Sent", cls: "bg-sky-500/20 text-sky-300 border-sky-500/35" },
  sale: { label: "Confirmed Order", cls: "bg-indigo-500/20 text-indigo-300 border-indigo-500/35" },
  dispatched: { label: "Delivered / Fulfilled", cls: "bg-amber-500/20 text-amber-300 border-amber-500/35" },
  invoiced: { label: "Invoiced & Paid", cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/35" },
  returned: { label: "Returned / Credit Note", cls: "bg-rose-500/20 text-rose-300 border-rose-500/35" },
  cancel: { label: "Cancelled", cls: "bg-gray-600/20 text-gray-400 border-gray-600/35" },
};

export default function MultiIndustrySalesHubPage() {
  const router = useRouter();
  const { activeBranch, getEntityStorageKey, currencySymbol } = useBranchContext();
  const { isLight } = useTheme();
  const companyId = activeBranch?.id || "CLS-DEFAULT";

  const [selectedIndustry, setSelectedIndustry] = useState<string>(
    activeBranch?.industryId || "retail_supermarket"
  );
  const [activeTab, setActiveTab] = useState<
    "all" | "quotations" | "orders" | "deliveries" | "invoices_pos" | "pricelists_returns"
  >("all");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [searchQuery, setSearchQuery] = useState("");

  const [orders, setOrders] = useState<SalesOrderRecord[]>([]);
  const [pricelists, setPricelists] = useState<SalesPricelist[]>([]);
  const [returns, setReturns] = useState<SalesReturnRecord[]>([]);
  const [posOrders, setPosOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Create Quote / Order Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [docMode, setDocMode] = useState<"draft" | "sale">("draft");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedPricelist, setSelectedPricelist] = useState("Standard Retail Tariff");
  const [paymentTerms, setPaymentTerms] = useState("Immediate");
  const [taxRate, setTaxRate] = useState("5");
  const [metaValues, setMetaValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [formLines, setFormLines] = useState<
    { name: string; sku: string; quantity: number; uom: string; unitPrice: number }[]
  >([{ name: "", sku: "", quantity: 1, uom: "Units", unitPrice: 0 }]);
  const [savingOrder, setSavingOrder] = useState(false);

  // Pricelist & Return Modals
  const [newPlName, setNewPlName] = useState("");
  const [newPlTier, setNewPlTier] = useState<SalesPricelist["tierType"]>("Wholesale");
  const [newPlDisc, setNewPlDisc] = useState("15");
  const [returnModalOrder, setReturnModalOrder] = useState<SalesOrderRecord | null>(null);
  const [returnReason, setReturnReason] = useState("Damaged / Unsold Goods Return");
  const [restockItems, setRestockItems] = useState(true);

  useEffect(() => {
    if (activeBranch?.industryId) {
      setSelectedIndustry(activeBranch.industryId);
    }
  }, [activeBranch?.industryId]);

  const blueprint = useMemo(
    () => getIndustrySalesBlueprint(selectedIndustry),
    [selectedIndustry]
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadSalesData = async () => {
    setLoading(true);
    let userEmail = "";
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      userEmail = (u.email || "").trim().toLowerCase();
    } catch {}

    // Local POS fallback merge
    let localPos: any[] = [];
    try {
      const rawPos = localStorage.getItem(getEntityStorageKey("pos_orders"));
      if (rawPos) localPos = JSON.parse(rawPos);
    } catch {}

    try {
      const res = await fetch(
        `/api/sales?company_id=${encodeURIComponent(companyId)}&email=${encodeURIComponent(userEmail)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (data?.success) {
        setOrders(Array.isArray(data.orders) ? data.orders : []);
        setPricelists(Array.isArray(data.pricelists) ? data.pricelists : []);
        setReturns(Array.isArray(data.returns) ? data.returns : []);
        const cloudPos = Array.isArray(data.posOrders) ? data.posOrders : [];
        const byId = new Map<string, any>();
        for (const p of [...cloudPos, ...localPos]) {
          if (p?.id) byId.set(p.id, p);
        }
        setPosOrders(Array.from(byId.values()));
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    loadSalesData();
  }, [companyId]);

  const handleLoadIndustrySamples = async () => {
    for (const sample of blueprint.sampleOrders) {
      await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          ...sample,
        }),
      });
    }
    await loadSalesData();
    showToast(`Loaded ${blueprint.sampleOrders.length} sample orders for ${selectedIndustry.replace(/_/g, " ")}!`);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const validLines = formLines.filter((l) => l.name.trim() && l.quantity > 0);
    if (!customerName.trim() || validLines.length === 0) return;

    setSavingOrder(true);
    try {
      const plObj = pricelists.find((p) => p.name === selectedPricelist);
      const plDisc = plObj?.discountPct || 0;

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          industryId: selectedIndustry,
          channel: blueprint.channelDefault,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          pricelistName: selectedPricelist,
          paymentTerms,
          state: docMode,
          taxRate: Number(taxRate || 0),
          industryMeta: metaValues,
          notes,
          lines: validLines.map((l, idx) => ({
            id: `LN-${idx + 1}`,
            sku: l.sku,
            name: l.name,
            quantity: Number(l.quantity),
            uom: l.uom || "Units",
            unitPrice: Number(l.unitPrice),
            discountPct: plDisc,
            subtotal: Number((l.quantity * l.unitPrice * (1 - plDisc / 100)).toFixed(2)),
          })),
        }),
      });
      const data = await res.json();
      if (data?.success && data?.order) {
        setOrders((prev) => [data.order, ...prev]);
        try {
          const localKey = getEntityStorageKey("sales_orders");
          localStorage.setItem(localKey, JSON.stringify([data.order, ...orders]));
        } catch {}
        setIsCreateOpen(false);
        setCustomerName("");
        setCustomerPhone("");
        setMetaValues({});
        setNotes("");
        setFormLines([{ name: "", sku: "", quantity: 1, uom: "Units", unitPrice: 0 }]);
        showToast(
          docMode === "sale"
            ? `Confirmed ${blueprint.orderLabel} ${data.order.name}!`
            : `Created ${blueprint.quoteLabel} ${data.order.name}!`
        );
      }
    } finally {
      setSavingOrder(false);
    }
  };

  const handleAdvanceState = async (order: SalesOrderRecord, nextState: SalesOrderState) => {
    const res = await fetch("/api/sales", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_id: companyId,
        id: order.id,
        state: nextState,
      }),
    });
    const data = await res.json();
    if (data?.success && data?.order) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? data.order : o)));
      showToast(
        nextState === "sale"
          ? `Order ${order.name} Confirmed!`
          : nextState === "dispatched"
          ? `Order ${order.name} Dispatched & Inventory Updated (${data.order.deliveryRef})!`
          : nextState === "invoiced"
          ? `Invoice ${data.order.invoiceRef} Generated & Synced to Accounting!`
          : `Updated ${order.name}`
      );
    }
  };

  const handleIssueReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModalOrder) return;
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_return",
        company_id: companyId,
        orderId: returnModalOrder.id,
        orderName: returnModalOrder.name,
        customer_name: returnModalOrder.customer_name,
        refundAmount: returnModalOrder.amount_total,
        reason: returnReason,
        restock: restockItems,
      }),
    });
    const data = await res.json();
    if (data?.success && data?.returnRecord) {
      setReturns((prev) => [data.returnRecord, ...prev]);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === returnModalOrder.id
            ? { ...o, state: "returned", returnRef: data.returnRecord.creditNoteNumber }
            : o
        )
      );
      setReturnModalOrder(null);
      showToast(`Issued Credit Note ${data.returnRecord.creditNoteNumber}!`);
    }
  };

  const handleCreatePricelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlName.trim()) return;
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_pricelist",
        company_id: companyId,
        name: newPlName.trim(),
        tierType: newPlTier,
        discountPct: Number(newPlDisc || 0),
        minQty: 1,
      }),
    });
    const data = await res.json();
    if (data?.success && Array.isArray(data.pricelists)) {
      setPricelists(data.pricelists);
      setNewPlName("");
      showToast(`Added Pricelist "${data.pricelist?.name}"!`);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    await fetch(`/api/sales?id=${encodeURIComponent(id)}&company_id=${encodeURIComponent(companyId)}`, {
      method: "DELETE",
    }).catch(() => {});
  };

  const handlePrintPdf = (o: SalesOrderRecord) => {
    printQuotationPDF({
      documentNumber: o.name,
      documentType:
        o.state === "invoiced"
          ? "Proforma Invoice"
          : o.state === "draft" || o.state === "sent"
          ? "Quotation"
          : "Sales Order",
      customerName: o.customer_name,
      date: new Date(o.date_order || o.created_at).toLocaleDateString(),
      status: STATE_BADGE[o.state]?.label || o.state.toUpperCase(),
      lines: (o.lines || []).map((l) => ({
        name: l.name,
        description: l.uom ? `${l.quantity} ${l.uom}` : l.description || "",
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        subtotal: l.subtotal,
      })),
      amountTotal: o.amount_total,
      notes: o.notes || `Channel: ${o.channel} • Terms: ${o.paymentTerms || "Standard"}`,
    });
  };

  // KPI aggregations
  const quoteList = orders.filter((o) => o.state === "draft" || o.state === "sent");
  const confirmedList = orders.filter((o) => o.state === "sale");
  const dispatchedList = orders.filter((o) => o.state === "dispatched");
  const invoicedList = orders.filter((o) => o.state === "invoiced");

  const quotePipelineValue = quoteList.reduce((s, o) => s + (o.amount_total || 0), 0);
  const confirmedOrdersValue = [...confirmedList, ...dispatchedList, ...invoicedList].reduce(
    (s, o) => s + (o.amount_total || 0),
    0
  );
  const posSyncedRevenue = posOrders
    .filter((p) => p.state !== "cancel")
    .reduce((s, p) => s + Number(p.amount_total ?? p.total ?? 0), 0);
  const omnichannelRevenue = confirmedOrdersValue + posSyncedRevenue;

  const displayedOrders = useMemo(() => {
    let base = orders;
    if (activeTab === "quotations") base = quoteList;
    else if (activeTab === "orders") base = confirmedList;
    else if (activeTab === "deliveries") base = dispatchedList;
    else if (activeTab === "invoices_pos") base = invoicedList;

    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase();
    return base.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        (o.channel || "").toLowerCase().includes(q)
    );
  }, [orders, activeTab, searchQuery, quoteList, confirmedList, dispatchedList, invoicedList]);

  const exportCurrentOrders = (fmt: "xlsx" | "csv") => {
    const headers = ["Document #", "Channel", "Customer", "Pricelist", "Stage", "Delivery Ref", "Invoice Ref", "Total", "Date"];
    const rows = displayedOrders.map((o) => [
      o.name,
      o.channel,
      o.customer_name,
      o.pricelistName || "",
      STATE_BADGE[o.state]?.label || o.state,
      o.deliveryRef || "-",
      o.invoiceRef || "-",
      o.amount_total,
      new Date(o.date_order || o.created_at).toLocaleDateString(),
    ]);
    if (fmt === "xlsx") exportToExcel(`Sales_Pipeline_${selectedIndustry}`, headers, rows, "Sales");
    else exportToCSV(`Sales_Pipeline_${selectedIndustry}`, headers, rows);
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isLight ? "bg-[#F6F7FB] text-slate-900" : "bg-[#0B101E] text-white"
      }`}
    >
      <StandardModuleHeader
        moduleName="Sales"
        moduleIcon={<BarChart3 size={20} />}
        menuItems={MENU_ITEMS}
        searchPlaceholder="Search quotes, orders, customers, channels..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onNewClick={() => {
          setDocMode("sale");
          setIsCreateOpen(true);
        }}
        newButtonLabel={`+ ${blueprint.orderLabel}`}
      />

      {toast && (
        <div className="fixed top-16 right-6 z-[200] bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2">
          <Sparkles size={14} /> {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-5">
        {/* Top Industry-Adaptive Sales Command Banner */}
        <div className="beraxis-bento-card p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className={`text-xl font-black flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
              <Layers className="text-purple-500" size={20} />
              All-Industry Order-to-Cash &amp; Omnichannel Sales Hub
            </h1>
            <p className={`text-xs ${isLight ? "text-slate-600" : "text-gray-400"}`}>
              Full pipeline from <strong>{blueprint.quoteLabel}</strong> → <strong>{blueprint.orderLabel}</strong> →{" "}
              <strong>{blueprint.fulfillLabel}</strong> → <strong>Invoice &amp; Accounting</strong> +{" "}
              <strong>POS &amp; Closer Sync</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold outline-none cursor-pointer ${
                isLight
                  ? "bg-white border-slate-300 text-slate-900"
                  : "bg-[#0F172A] border-purple-500/40 text-purple-200"
              }`}
              title="Switch industry sales workflow template"
            >
              {GLOBAL_INDUSTRIES.map((ind) => (
                <option key={ind.id} value={ind.id}>
                  {ind.name} Sales Mode
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleLoadIndustrySamples}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold cursor-pointer"
            >
              + Load Industry Sample Pipeline
            </button>

            <button
              type="button"
              onClick={() => {
                setDocMode("draft");
                setIsCreateOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold cursor-pointer flex items-center gap-1"
            >
              <Plus size={14} /> {blueprint.quoteLabel}
            </button>

            <button
              type="button"
              onClick={() => {
                setDocMode("sale");
                setIsCreateOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white text-xs font-extrabold cursor-pointer flex items-center gap-1 shadow-lg"
            >
              <Plus size={14} /> {blueprint.orderLabel}
            </button>
          </div>
        </div>

        {/* 5 Real-Time Order-to-Cash KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="beraxis-bento-card p-4">
            <div className="text-[10px] uppercase font-bold text-gray-400">Open Quotations</div>
            <div className="text-xl font-black text-sky-400 mt-1">
              {currencySymbol}
              {quotePipelineValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">{quoteList.length} active quote(s)</div>
          </div>

          <div className="beraxis-bento-card p-4">
            <div className="text-[10px] uppercase font-bold text-gray-400">Confirmed Sales Orders</div>
            <div className="text-xl font-black text-indigo-400 mt-1">
              {currencySymbol}
              {confirmedOrdersValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              {confirmedList.length + dispatchedList.length + invoicedList.length} confirmed
            </div>
          </div>

          <div className="beraxis-bento-card p-4">
            <div className="text-[10px] uppercase font-bold text-gray-400">Delivered / Fulfilled</div>
            <div className="text-xl font-black text-amber-400 mt-1">
              {dispatchedList.length + invoicedList.length}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">Stock auto-deducted</div>
          </div>

          <div className="beraxis-bento-card p-4">
            <div className="text-[10px] uppercase font-bold text-gray-400">POS Register Sync</div>
            <div className="text-xl font-black text-emerald-400 mt-1">
              {currencySymbol}
              {posSyncedRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">{posOrders.length} POS receipt(s)</div>
          </div>

          <div className="beraxis-bento-card p-4 border border-purple-500/35">
            <div className="text-[10px] uppercase font-bold text-purple-300">Total Omnichannel Sales</div>
            <div className="text-xl font-black text-purple-400 mt-1">
              {currencySymbol}
              {omnichannelRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">Orders + POS + Closer</div>
          </div>
        </div>

        {/* Operational Stage Tabs + Export / Kanban Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Pipeline", count: orders.length },
              { id: "quotations", label: "Quotations & Proposals", count: quoteList.length },
              { id: "orders", label: "Confirmed Orders", count: confirmedList.length },
              { id: "deliveries", label: "Deliveries & Dispatch", count: dispatchedList.length },
              { id: "invoices_pos", label: "Invoiced & POS Sync", count: invoicedList.length + posOrders.length },
              { id: "pricelists_returns", label: "Pricelists & Returns", count: pricelists.length + returns.length },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeTab === t.id
                    ? "bg-purple-600 text-white shadow-md"
                    : isLight
                    ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
                }`}
              >
                <span>{t.label}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-black/25 text-[10px] font-extrabold">
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {activeTab !== "pricelists_returns" && (
            <div className="flex items-center gap-2">
              <div className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                    viewMode === "table" ? "bg-purple-600 text-white" : "text-gray-400"
                  }`}
                >
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("kanban")}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                    viewMode === "kanban" ? "bg-purple-600 text-white" : "text-gray-400"
                  }`}
                >
                  Kanban
                </button>
              </div>
              <button
                type="button"
                onClick={() => exportCurrentOrders("xlsx")}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <FileSpreadsheet size={13} /> Excel
              </button>
              <button
                type="button"
                onClick={() => exportCurrentOrders("csv")}
                className="px-3 py-1.5 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Download size={13} /> CSV
              </button>
            </div>
          )}
        </div>

        {/* Tab 6: Pricelists, Promotions & Customer Returns / Credit Notes */}
        {activeTab === "pricelists_returns" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="beraxis-bento-card p-5 space-y-4">
              <h3 className="text-base font-black flex items-center gap-2">
                <Tag size={17} className="text-purple-400" />
                Tiered Pricelists, Wholesale &amp; Promotional Rules
              </h3>
              <form onSubmit={handleCreatePricelist} className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <input
                  required
                  value={newPlName}
                  onChange={(e) => setNewPlName(e.target.value)}
                  placeholder="Pricelist name (e.g. Supermarket Distributor)"
                  className="sm:col-span-2 px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-white outline-none"
                />
                <select
                  value={newPlTier}
                  onChange={(e) => setNewPlTier(e.target.value as any)}
                  className="px-2.5 py-2 rounded-xl bg-[#0F172A] border border-white/15 text-white"
                >
                  <option value="Wholesale">Wholesale</option>
                  <option value="VIP / Corporate">VIP / Corporate</option>
                  <option value="Promotional">Promotional</option>
                  <option value="Retail">Retail</option>
                </select>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={90}
                    value={newPlDisc}
                    onChange={(e) => setNewPlDisc(e.target.value)}
                    placeholder="% Off"
                    className="w-16 px-2.5 py-2 rounded-xl bg-black/30 border border-white/15 text-white"
                  />
                  <button
                    type="submit"
                    className="flex-1 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                {pricelists.map((pl) => (
                  <div
                    key={pl.id}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold">{pl.name}</div>
                      <div className="text-[11px] text-gray-400">{pl.tierType} Tier</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                      {pl.discountPct}% Discount
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="beraxis-bento-card p-5 space-y-4">
              <h3 className="text-base font-black flex items-center gap-2">
                <RotateCcw size={17} className="text-rose-400" />
                Returns, Refunds &amp; Credit Notes ({returns.length})
              </h3>
              {returns.length === 0 ? (
                <p className="text-xs text-gray-400 py-8 text-center">
                  No returns issued yet. Click <strong>Return</strong> on any confirmed/dispatched order to issue a Credit Note and automatically restock inventory.
                </p>
              ) : (
                <div className="space-y-2">
                  {returns.map((ret) => (
                    <div
                      key={ret.id}
                      className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-rose-300">
                          {ret.creditNoteNumber} • {ret.customer_name}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          Order {ret.orderName} — {ret.reason} ({ret.restocked ? "Restocked" : "No Restock"})
                        </div>
                      </div>
                      <span className="font-black text-rose-300">
                        -{currencySymbol}
                        {Number(ret.refundAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : viewMode === "kanban" ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(
              [
                { state: "draft", title: "1. Quotations & Proposals" },
                { state: "sale", title: "2. Confirmed Orders" },
                { state: "dispatched", title: "3. Delivered / Fulfilled" },
                { state: "invoiced", title: "4. Invoiced & Paid" },
              ] as const
            ).map((col) => {
              const colItems = displayedOrders.filter((o) =>
                col.state === "draft" ? o.state === "draft" || o.state === "sent" : o.state === col.state
              );
              return (
                <div key={col.state} className="beraxis-bento-card p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-extrabold">{col.title}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 font-bold">
                      {colItems.length}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {colItems.map((o) => (
                      <div
                        key={o.id}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-purple-400">{o.name}</span>
                          <span className="font-black text-emerald-400">
                            {currencySymbol}
                            {o.amount_total.toLocaleString()}
                          </span>
                        </div>
                        <div className="font-semibold truncate">{o.customer_name}</div>
                        <div className="text-[10px] text-gray-400">{o.channel}</div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {(o.state === "draft" || o.state === "sent") && (
                            <button
                              onClick={() => handleAdvanceState(o, "sale")}
                              className="px-2 py-1 rounded bg-indigo-600 text-white text-[10px] font-bold cursor-pointer"
                            >
                              Confirm Order →
                            </button>
                          )}
                          {o.state === "sale" && (
                            <button
                              onClick={() => handleAdvanceState(o, "dispatched")}
                              className="px-2 py-1 rounded bg-amber-600 text-white text-[10px] font-bold cursor-pointer"
                            >
                              {blueprint.fulfillLabel} →
                            </button>
                          )}
                          {o.state === "dispatched" && (
                            <button
                              onClick={() => handleAdvanceState(o, "invoiced")}
                              className="px-2 py-1 rounded bg-emerald-600 text-white text-[10px] font-bold cursor-pointer"
                            >
                              Create Invoice →
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List / Pipeline Table + POS Sync Section */
          <div className="space-y-5">
            <div className="beraxis-bento-card overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-xs text-gray-400">Loading isolated cluster sales pipeline...</div>
              ) : displayedOrders.length === 0 ? (
                <div className="p-10 text-center space-y-3">
                  <BarChart3 size={34} className="mx-auto text-purple-400 opacity-75" />
                  <h3 className="text-sm font-bold">No Orders in This Stage Yet</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    Create a new <strong>{blueprint.quoteLabel}</strong> or <strong>{blueprint.orderLabel}</strong>, or load realistic sample transactions for {selectedIndustry.replace(/_/g, " ")}.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDocMode("sale");
                        setIsCreateOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                    >
                      + Create {blueprint.orderLabel}
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadIndustrySamples}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold cursor-pointer"
                    >
                      Load Industry Samples
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-white/10 bg-black/25 text-[11px] uppercase text-gray-400">
                      <tr>
                        <th className="px-4 py-3">Order / Quote #</th>
                        <th className="px-4 py-3">Customer &amp; Details</th>
                        <th className="px-4 py-3">Channel / Pricelist</th>
                        <th className="px-4 py-3">Stage &amp; Refs</th>
                        <th className="px-4 py-3">Total</th>
                        <th className="px-4 py-3 text-right">Order-to-Cash Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {displayedOrders.map((o) => {
                        const badge = STATE_BADGE[o.state] || STATE_BADGE.draft;
                        const metaEntries = Object.entries(o.industryMeta || {}).filter(([, v]) => Boolean(v));
                        return (
                          <tr key={o.id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="px-4 py-3.5">
                              <button
                                onClick={() => router.push(`/sales/${o.id}`)}
                                className="font-extrabold text-purple-400 hover:underline cursor-pointer flex items-center gap-1.5"
                              >
                                <FileText size={14} /> {o.name}
                              </button>
                              <div className="text-[10px] text-gray-500 mt-0.5">
                                {new Date(o.date_order || o.created_at).toLocaleDateString()}
                              </div>
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="font-bold">{o.customer_name}</div>
                              <div className="text-[10px] text-gray-400">
                                {(o.lines || []).length} item(s)
                                {metaEntries.length > 0 &&
                                  ` • ${metaEntries.map(([, val]) => String(val)).join(" • ")}`}
                              </div>
                            </td>

                            <td className="px-4 py-3.5">
                              <span className="font-semibold text-cyan-300">{o.channel}</span>
                              <div className="text-[10px] text-gray-400">{o.pricelistName || "Standard"}</div>
                            </td>

                            <td className="px-4 py-3.5 space-y-1">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.cls}`}>
                                {badge.label}
                              </span>
                              {(o.deliveryRef || o.invoiceRef || o.returnRef) && (
                                <div className="text-[10px] font-mono text-gray-400">
                                  {o.deliveryRef && <span className="mr-2">📦 {o.deliveryRef}</span>}
                                  {o.invoiceRef && <span className="text-emerald-400">🧾 {o.invoiceRef}</span>}
                                  {o.returnRef && <span className="text-rose-400">↩ {o.returnRef}</span>}
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-3.5 font-black text-emerald-400 text-sm">
                              {currencySymbol}
                              {Number(o.amount_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>

                            <td className="px-4 py-3.5 text-right">
                              <div className="flex flex-wrap items-center justify-end gap-1.5">
                                {o.state === "draft" && (
                                  <button
                                    onClick={() => handleAdvanceState(o, "sale")}
                                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold cursor-pointer flex items-center gap-1"
                                  >
                                    <CheckCircle2 size={12} /> Confirm Order
                                  </button>
                                )}
                                {o.state === "sale" && (
                                  <button
                                    onClick={() => handleAdvanceState(o, "dispatched")}
                                    className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold cursor-pointer flex items-center gap-1"
                                  >
                                    <Truck size={12} /> {blueprint.fulfillLabel}
                                  </button>
                                )}
                                {(o.state === "sale" || o.state === "dispatched") && (
                                  <button
                                    onClick={() => handleAdvanceState(o, "invoiced")}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer flex items-center gap-1"
                                  >
                                    <Receipt size={12} /> Invoice &amp; Pay
                                  </button>
                                )}
                                {(o.state === "dispatched" || o.state === "invoiced") && (
                                  <button
                                    onClick={() => setReturnModalOrder(o)}
                                    className="px-2 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[11px] font-bold cursor-pointer"
                                    title="Issue Return / Credit Note"
                                  >
                                    Return
                                  </button>
                                )}
                                <button
                                  onClick={() => handlePrintPdf(o)}
                                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-bold cursor-pointer flex items-center gap-1"
                                >
                                  <Download size={12} /> PDF
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(o.id)}
                                  className="p-1.5 text-gray-500 hover:text-rose-400 cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* POS Register Receipts Synced Automatically Into Sales */}
            {(activeTab === "invoices_pos" || activeTab === "all") && posOrders.length > 0 && (
              <div className="beraxis-bento-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black flex items-center gap-2">
                    <ShoppingBag size={16} className="text-emerald-400" />
                    Synced POS Register Transactions ({posOrders.length})
                  </h3>
                  <Link href="/pos" className="text-xs font-bold text-purple-400 hover:underline flex items-center gap-1">
                    Open Smart POS <ArrowRight size={12} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                  {posOrders.slice(0, 9).map((p) => (
                    <div key={p.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-emerald-300">{p.name}</div>
                        <div className="text-[10px] text-gray-400">
                          {p.orderType || p.paymentMethod || "POS"} • {(p.items || []).length} item(s)
                        </div>
                      </div>
                      <span className="font-black">
                        {currencySymbol}
                        {Number(p.amount_total ?? p.total ?? 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Industry-Adaptive Create Quotation / Sales Order Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-3xl rounded-3xl border p-6 shadow-2xl max-h-[92vh] overflow-y-auto ${
              isLight
                ? "bg-white border-slate-200 text-slate-900"
                : "bg-[#0F172A] border-white/15 text-white"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-black">
                  {docMode === "sale" ? `New ${blueprint.orderLabel}` : `New ${blueprint.quoteLabel}`}
                </h2>
                <p className="text-xs text-gray-400">
                  Industry profile: <strong>{selectedIndustry.replace(/_/g, " ").toUpperCase()}</strong>
                </p>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDocMode("draft")}
                  className={`py-2 rounded-xl border font-bold cursor-pointer ${
                    docMode === "draft" ? "bg-sky-600/20 border-sky-500 text-sky-300" : "border-white/10 text-gray-400"
                  }`}
                >
                  Save as {blueprint.quoteLabel} (Draft)
                </button>
                <button
                  type="button"
                  onClick={() => setDocMode("sale")}
                  className={`py-2 rounded-xl border font-bold cursor-pointer ${
                    docMode === "sale" ? "bg-purple-600/20 border-purple-500 text-purple-300" : "border-white/10 text-gray-400"
                  }`}
                >
                  Confirm Immediately as {blueprint.orderLabel}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Customer / Account Name *</label>
                  <input
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Metro Retail Group / Gala Event Client"
                    className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Customer Phone / WhatsApp</label>
                  <input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">Pricelist / Promo Tier</label>
                  <select
                    value={selectedPricelist}
                    onChange={(e) => setSelectedPricelist(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070B16] border border-white/15 text-white"
                  >
                    {pricelists.map((pl) => (
                      <option key={pl.id} value={pl.name}>
                        {pl.name} ({pl.discountPct}% off)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Payment Terms</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070B16] border border-white/15 text-white"
                  >
                    <option value="Immediate">Immediate Payment</option>
                    <option value="50% Advance Deposit">50% Advance Deposit</option>
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Monthly Installment">Monthly Installment</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Tax / VAT (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-white"
                  />
                </div>
              </div>

              {/* Industry-Specific Dynamic Metadata Fields */}
              {blueprint.metaFields.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/25 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {blueprint.metaFields.map((mf) => (
                    <div key={mf.key}>
                      <label className="block text-[11px] font-bold text-purple-300 mb-1">{mf.label}</label>
                      <input
                        value={metaValues[mf.key] || ""}
                        onChange={(e) => setMetaValues({ ...metaValues, [mf.key]: e.target.value })}
                        placeholder={mf.placeholder}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Line Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold">Order Line Items *</label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormLines([...formLines, { name: "", sku: "", quantity: 1, uom: "Units", unitPrice: 0 }])
                    }
                    className="text-purple-400 font-bold hover:underline cursor-pointer"
                  >
                    + Add Line Item
                  </button>
                </div>
                {formLines.map((ln, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      required
                      placeholder="Product / Menu Package / Service..."
                      value={ln.name}
                      onChange={(e) => {
                        const copy = [...formLines];
                        copy[idx].name = e.target.value;
                        setFormLines(copy);
                      }}
                      className="col-span-5 px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-white"
                    />
                    <input
                      placeholder="SKU"
                      value={ln.sku}
                      onChange={(e) => {
                        const copy = [...formLines];
                        copy[idx].sku = e.target.value;
                        setFormLines(copy);
                      }}
                      className="col-span-2 px-2.5 py-2 rounded-xl bg-black/30 border border-white/15 text-white"
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Qty"
                      value={ln.quantity}
                      onChange={(e) => {
                        const copy = [...formLines];
                        copy[idx].quantity = parseFloat(e.target.value) || 0;
                        setFormLines(copy);
                      }}
                      className="col-span-2 px-2.5 py-2 rounded-xl bg-black/30 border border-white/15 text-white"
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Unit Price"
                      value={ln.unitPrice}
                      onChange={(e) => {
                        const copy = [...formLines];
                        copy[idx].unitPrice = parseFloat(e.target.value) || 0;
                        setFormLines(copy);
                      }}
                      className="col-span-2 px-2.5 py-2 rounded-xl bg-black/30 border border-white/15 text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setFormLines(formLines.filter((_, i) => i !== idx))}
                      disabled={formLines.length <= 1}
                      className="col-span-1 text-rose-400 disabled:opacity-30 cursor-pointer flex justify-center"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/15 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingOrder}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold cursor-pointer"
                >
                  {savingOrder ? "Saving..." : docMode === "sale" ? "Confirm Order" : "Save Quotation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Return / Credit Note Modal */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0F172A] border border-rose-500/35 p-6 text-white space-y-4 shadow-2xl">
            <h3 className="text-base font-black flex items-center gap-2 text-rose-300">
              <RotateCcw size={18} /> Issue Return &amp; Credit Note ({returnModalOrder.name})
            </h3>
            <form onSubmit={handleIssueReturn} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Return Reason</label>
                <input
                  required
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restockItems}
                  onChange={(e) => setRestockItems(e.target.checked)}
                />
                <span>Automatically restock returned quantities into Inventory</span>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnModalOrder(null)}
                  className="px-4 py-2 rounded-xl border border-white/15 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold cursor-pointer"
                >
                  Issue Credit Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
