import { NextRequest, NextResponse } from "next/server";
import {
  resolveSafeClusterId,
  verifyClusterAccess,
  readClusterCollection,
  writeClusterCollection,
} from "@/lib/tenantClusterDb";

export const dynamic = "force-dynamic";

export interface PurchaseLineItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  uom: string;
  unitCost: number;
  subtotal: number;
}

export interface PurchaseOrderRecord {
  id: string;
  poNumber: string; // e.g. PO-2026-1042
  vendorName: string;
  vendorEmail?: string;
  industryId?: string;
  warehouse?: string;
  status: "draft" | "confirmed" | "received" | "cancelled";
  lines: PurchaseLineItem[];
  totalAmount: number;
  billRef?: string;
  expectedDate: string;
  receivedAt?: string;
  createdAt: string;
}

export interface VendorRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  paymentTerms: string;
}

const DEFAULT_VENDORS: VendorRecord[] = [
  { id: "VND-01", name: "Global Fresh & FMCG Distributors", email: "orders@globalfresh.io", phone: "+1-555-2091", category: "Supermarket & F&B Supply", paymentTerms: "Net 15" },
  { id: "VND-02", name: "Atlas Industrial Metals & Parts", email: "supply@atlasmetals.com", phone: "+1-555-4419", category: "Raw Materials & Auto Parts", paymentTerms: "Net 30" },
  { id: "VND-03", name: "MedCore Pharma & Solar Supply", email: "b2b@medcoresupply.org", phone: "+1-555-8832", category: "Medical, Agri & Solar Inputs", paymentTerms: "Immediate" },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawCompanyId = searchParams.get("company_id") || searchParams.get("cluster_id");
  const email = (searchParams.get("email") || "").trim().toLowerCase() || undefined;

  if (!rawCompanyId && !email) {
    return NextResponse.json({ success: true, orders: [], vendors: DEFAULT_VENDORS });
  }

  const clusterId = resolveSafeClusterId(rawCompanyId, email);
  const access = await verifyClusterAccess(clusterId, email);
  if (!access.allowed) {
    return NextResponse.json({ success: false, error: access.reason || "Access denied" }, { status: 403 });
  }

  const [orders, vendorsRaw] = await Promise.all([
    readClusterCollection<PurchaseOrderRecord[]>(clusterId, "purchase_orders", []),
    readClusterCollection<VendorRecord[] | null>(clusterId, "purchase_vendors", null),
  ]);

  const vendors = Array.isArray(vendorsRaw) && vendorsRaw.length > 0 ? vendorsRaw : DEFAULT_VENDORS;

  return NextResponse.json(
    { success: true, clusterId, orders, vendors },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.owner_email || body.email || "").trim().toLowerCase() || undefined;
    const clusterId = resolveSafeClusterId(
      body.company_id || body.companyId || body.cluster_id || body.clusterId,
      email
    );

    const access = await verifyClusterAccess(clusterId, email);
    if (!access.allowed) {
      return NextResponse.json({ success: false, error: access.reason || "Access denied" }, { status: 403 });
    }

    const action = body.action || "create_po";

    // Add Vendor
    if (action === "add_vendor") {
      const vendors = await readClusterCollection<VendorRecord[]>(clusterId, "purchase_vendors", DEFAULT_VENDORS);
      const v: VendorRecord = {
        id: `VND-${Date.now().toString().slice(-4)}`,
        name: String(body.name || "New Supplier").trim(),
        email: String(body.email_vendor || body.vendorEmail || "").trim(),
        phone: String(body.phone || "").trim(),
        category: String(body.category || "General Supplier").trim(),
        paymentTerms: String(body.paymentTerms || "Net 30").trim(),
      };
      const next = [v, ...vendors];
      await writeClusterCollection(clusterId, "purchase_vendors", next, { ownerEmail: email });
      return NextResponse.json({ success: true, clusterId, vendor: v, vendors: next });
    }

    // Receive PO -> Increment Inventory Stock + Auto-Post Vendor Bill in Accounting!
    if (action === "receive_po" || action === "update_status") {
      const orders = await readClusterCollection<PurchaseOrderRecord[]>(clusterId, "purchase_orders", []);
      const idx = orders.findIndex((o) => o.id === body.id || o.poNumber === body.id);
      if (idx === -1) {
        return NextResponse.json({ success: false, error: "Purchase order not found" }, { status: 404 });
      }

      const target = { ...orders[idx] };
      const nextStatus: PurchaseOrderRecord["status"] =
        action === "receive_po" ? "received" : body.status || target.status;

      const wasReceived = target.status === "received";
      target.status = nextStatus;

      if (!wasReceived && nextStatus === "received") {
        const now = new Date().toISOString();
        const seq = Date.now().toString().slice(-5);
        target.receivedAt = now;
        target.billRef = `BILL/${new Date().getFullYear()}/${seq}`;

        // 1. Add received quantities into isolated `inventory`
        const inv = await readClusterCollection<any[]>(clusterId, "inventory", []);
        const nextInv = [...inv];

        for (const line of target.lines || []) {
          const existingIdx = nextInv.findIndex(
            (it) =>
              (line.sku && it.sku && String(it.sku).toLowerCase() === String(line.sku).toLowerCase()) ||
              String(it.name || "").toLowerCase() === String(line.name || "").toLowerCase()
          );
          if (existingIdx !== -1) {
            const cur = Number(nextInv[existingIdx].quantity ?? nextInv[existingIdx].onHand ?? 0);
            const updatedQty = Number((cur + Number(line.quantity || 0)).toFixed(3));
            nextInv[existingIdx] = {
              ...nextInv[existingIdx],
              quantity: updatedQty,
              onHand: updatedQty,
              qty: updatedQty,
              cost_price: Number(line.unitCost || nextInv[existingIdx].cost_price || 0),
              status: "in_stock",
            };
          } else {
            nextInv.unshift({
              id: `inv_po_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              name: line.name,
              sku: line.sku || `SKU-${seq}`,
              barcode: line.sku || "",
              quantity: Number(line.quantity || 0),
              onHand: Number(line.quantity || 0),
              uom: line.uom || "Units",
              min_quantity: 10,
              unit_price: Number((Number(line.unitCost || 0) * 1.45).toFixed(2)),
              cost_price: Number(line.unitCost || 0),
              category: "Purchased Stock",
              warehouse: target.warehouse || "Main Warehouse",
              status: "in_stock",
              created_at: now,
            });
          }
        }

        // 2. Post Vendor Bill into `accounting_bills`
        const bills = await readClusterCollection<any[]>(clusterId, "accounting_bills", []);
        const newBill = {
          id: target.billRef,
          name: target.billRef,
          vendor: target.vendorName,
          vendor_name: target.vendorName,
          sourcePo: target.poNumber,
          amount: target.totalAmount,
          amount_total: target.totalAmount,
          status: "Posted",
          state: "posted",
          date: now.slice(0, 10),
          created_at: now,
        };

        await Promise.all([
          writeClusterCollection(clusterId, "inventory", nextInv, { ownerEmail: email }),
          writeClusterCollection(clusterId, "accounting_bills", [newBill, ...bills], { ownerEmail: email }),
        ]);
      }

      const nextOrders = [...orders];
      nextOrders[idx] = target;
      await writeClusterCollection(clusterId, "purchase_orders", nextOrders, { ownerEmail: email });

      return NextResponse.json({ success: true, clusterId, order: target, orders: nextOrders });
    }

    // Create RFQ or Confirmed Purchase Order
    const rawLines: any[] = Array.isArray(body.lines) ? body.lines : [];
    const lines: PurchaseLineItem[] = rawLines.map((l, i) => {
      const qty = Math.max(0.01, Number(l.quantity ?? 1));
      const unitCost = Math.max(0, Number(l.unitCost ?? l.cost ?? 0));
      return {
        id: `PL-${i + 1}`,
        sku: String(l.sku || `SKU-${i + 1}`).trim(),
        name: String(l.name || "Purchased Item").trim(),
        quantity: qty,
        uom: l.uom || "Units",
        unitCost,
        subtotal: Number((qty * unitCost).toFixed(2)),
      };
    });

    const totalAmount =
      lines.length > 0
        ? Number(lines.reduce((s, l) => s + l.subtotal, 0).toFixed(2))
        : Number(body.totalAmount || 0);

    const seq = Date.now().toString().slice(-5);
    const now = new Date().toISOString();
    const newPo: PurchaseOrderRecord = {
      id: `po_${Date.now()}`,
      poNumber: body.poNumber || `PO-${new Date().getFullYear()}-${seq}`,
      vendorName: String(body.vendorName || "Global Supplier").trim(),
      vendorEmail: body.vendorEmail || "",
      industryId: body.industryId || "retail_supermarket",
      warehouse: body.warehouse || "Main Warehouse",
      status: body.status || "confirmed",
      lines,
      totalAmount,
      expectedDate: body.expectedDate || now.slice(0, 10),
      createdAt: now,
    };

    const existing = await readClusterCollection<PurchaseOrderRecord[]>(clusterId, "purchase_orders", []);
    const nextOrders = [newPo, ...existing];
    await writeClusterCollection(clusterId, "purchase_orders", nextOrders, { ownerEmail: email });

    return NextResponse.json({ success: true, clusterId, order: newPo, orders: nextOrders });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Purchase API error" },
      { status: 400 }
    );
  }
}
