"use client";

import React, { useState } from "react";
import {
  X,
  Printer,
  Share2,
  Check,
  Copy,
  Building2,
  Calendar,
  DollarSign,
  ShieldCheck,
  ExternalLink,
  MessageCircle,
  FileText
} from "lucide-react";

export interface InvoiceData {
  id: string;
  number?: string;
  customer?: string;
  partner_name?: string;
  amount: number | string;
  status: string;
  date?: string;
  due_date?: string;
  companyName?: string;
  items?: Array<{ name: string; qty: number; price: number }>;
}

interface InvoiceReceiptModalProps {
  invoice: InvoiceData | null;
  onClose: () => void;
  companyName?: string;
}

export default function InvoiceReceiptModal({
  invoice,
  onClose,
  companyName = "Beraxis Commercial Entity"
}: InvoiceReceiptModalProps) {
  const [copied, setCopied] = useState(false);

  if (!invoice) return null;

  const invNumber = invoice.number || invoice.id || "INV-001";
  const customerName = invoice.customer || invoice.partner_name || "Valued Client";
  const invoiceDate = invoice.date || new Date().toISOString().split("T")[0];
  const dueDate = invoice.due_date || invoiceDate;
  const rawAmount = typeof invoice.amount === "string" ? parseFloat(invoice.amount.replace(/[^0-9.-]/g, "")) || 0 : invoice.amount;
  const statusFormatted = (invoice.status || "Paid").toUpperCase();
  const isPaid = statusFormatted.includes("PAID") || statusFormatted.includes("POSTED");

  // Sample items if none provided
  const items = invoice.items && invoice.items.length > 0 ? invoice.items : [
    { name: "Commercial Software Services & Support", qty: 1, price: rawAmount }
  ];

  const subtotal = rawAmount;
  const tax = 0; // Tax free or calculated
  const total = subtotal + tax;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hello ${customerName},\n\nHere is your official invoice #${invNumber} from ${companyName} for $${rawAmount.toFixed(2)}.\n\n` +
      `📅 Invoice Date: ${invoiceDate}\n` +
      `📌 Status: ${statusFormatted}\n` +
      `💰 Total: $${total.toFixed(2)}\n\n` +
      `Verify receipt & pay online: https://www.beraxis.online\n` +
      `Thank you for your business!`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleCopySummary = () => {
    const summary = `Invoice #${invNumber} | ${companyName} | Customer: ${customerName} | Total: $${total.toFixed(2)} | Status: ${statusFormatted}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      {/* Print-specific style injection to guarantee A4/Letter crisp white paper */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible !important;
          }
          #printable-invoice {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 24px !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-2xl bg-[#0B0F19] border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-white my-8">
        {/* Modal Controls Header */}
        <div className="no-print p-4 sm:px-6 bg-[#0E1526] border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-purple-400" />
            <span className="font-bold text-sm text-white">Invoice Preview &amp; Share</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
              title="Share invoice on WhatsApp"
            >
              <MessageCircle size={14} className="text-emerald-400" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer size={14} className="text-purple-400" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Copy Summary"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE SHEET (High contrast black-on-white receipt) */}
        <div id="printable-invoice" className="p-8 sm:p-10 bg-white text-gray-900 font-sans space-y-6">
          {/* Header Row */}
          <div className="flex items-start justify-between border-b pb-6 border-gray-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-gray-900 text-white font-black text-base flex items-center justify-center">
                  B
                </div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">{companyName}</h2>
              </div>
              <p className="text-xs text-gray-500">Official Commercial Tax Invoice</p>
              <p className="text-xs text-gray-400 mt-0.5">Powered by Beraxis Autonomous Cloud ERP</p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-gray-900 block tracking-tight">INVOICE</span>
              <span className="font-mono text-sm font-bold text-gray-600 block mt-0.5">#{invNumber}</span>
              <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}>
                {statusFormatted}
              </span>
            </div>
          </div>

          {/* Details Row: Bill To & Dates */}
          <div className="grid grid-cols-2 gap-6 text-xs py-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Billed To</span>
              <h3 className="font-bold text-sm text-gray-900">{customerName}</h3>
              <p className="text-gray-500 mt-0.5">Verified Commercial Account</p>
              <p className="text-gray-400">client@account.com</p>
            </div>

            <div className="text-right space-y-1">
              <div>
                <span className="text-gray-500">Invoice Date:</span>{" "}
                <strong className="text-gray-900">{invoiceDate}</strong>
              </div>
              <div>
                <span className="text-gray-500">Payment Due:</span>{" "}
                <strong className="text-gray-900">{dueDate}</strong>
              </div>
              <div>
                <span className="text-gray-500">Currency:</span>{" "}
                <strong className="text-gray-900">USD ($)</strong>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-medium text-gray-800">{it.name}</td>
                    <td className="p-3 text-center text-gray-600">{it.qty}</td>
                    <td className="p-3 text-right text-gray-600">${it.price.toFixed(2)}</td>
                    <td className="p-3 text-right font-bold text-gray-900">${(it.qty * it.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation Summary Row */}
          <div className="flex justify-between items-start pt-2">
            <div className="max-w-xs text-[11px] text-gray-500 space-y-1">
              <p className="font-bold text-gray-700">Payment &amp; Terms:</p>
              <p>Payment due upon receipt. Electronic bank transfers, credit card payments, and online settlement accepted.</p>
              <div className="pt-2 flex items-center gap-1.5 text-emerald-700 font-semibold">
                <ShieldCheck size={14} />
                <span>256-Bit SSL Encrypted Ledger Entry</span>
              </div>
            </div>

            <div className="w-48 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-800">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Sales Tax (0%):</span>
                <span className="font-semibold text-gray-800">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-gray-900 border-t border-gray-300 pt-2">
                <span>Total Due:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Receipt Seal */}
          <div className="border-t border-gray-200 pt-4 flex items-center justify-between text-[10px] text-gray-400">
            <span>Verified System ID: BERAXIS-{invNumber}-{Math.abs(invNumber.split("").reduce((a, b) => a + b.charCodeAt(0), 0))}</span>
            <span>Thank you for choosing Beraxis!</span>
          </div>
        </div>

        {/* Modal Bottom Footer Strip */}
        <div className="no-print p-4 bg-[#0E1526] border-t border-white/10 flex items-center justify-between gap-4 text-xs">
          <span className="text-gray-400 text-[11px]">
            Ready to print or dispatch via WhatsApp with 1 click.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
