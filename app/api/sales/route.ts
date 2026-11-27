import { NextRequest, NextResponse } from "next/server";
import {
  resolveSafeClusterId,
  verifyClusterAccess,
  readClusterCollection,
  writeClusterCollection,
} from "@/lib/tenantClusterDb";

export const dynamic = "force-dynamic";

export type SalesOrderState =
  | "draft"       // Quotation / Proposal / Estimate
  | "sent"        // Quotation Sent
  | "sale"        // Confirmed Sales Order
  | "dispatched"  // Delivered / Fulfilled / Event Executed
  | "invoiced"    // Invoiced & Paid
  | "returned"    // Returned / Credit Note Issued
  | "cancel";

export interface SalesLineItem {
  id: string;
  sku?: string;
  name: string;
  description?: string;
  quantity: number;
  uom?: string;
  unitPrice: number;
  discountPct?: number;
  subtotal: number;
}

export interface SalesOrderRecord {
  id: string;
  name: string; // e.g. SO-2026-1042
  clusterId: string;
  industryId: string;
  channel: "Direct Sales" | "Wholesale B2B" | "Catering & Events" | "Call Center Closer" | "POS Sync" | "eCommerce";
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  pricelistName?: string;
  paymentTerms?: string;
  state: SalesOrderState;
  lines: SalesLineItem[];
  subtotal: number;
  discountTotal: number;
  taxRate: number;
  taxAmount: number;
  amount_total: number;
  amountPaid: number;
  deliveryRef?: string;
  invoiceRef?: string;
  returnRef?: string;
  industryMeta?: Record<string, any>;
  notes?: string;
  date_order: string;
  created_at: string;
  updated_at: string;
}

export interface SalesPricelist {
  id: string;
  name: string;
  tierType: "Retail" | "Wholesale" | "VIP / Corporate" | "Promotional";
  discountPct: number;
  minQty: number;
  active: boolean;
  createdAt: string;
}

export interface SalesReturnRecord {
  id: string;
  creditNoteNumber: string;
  orderId: string;
  orderName: string;
  customer_name: string;
  reason: string;
  refundAmount: number;
  restocked: boolean;
  createdAt: string;
}

const DEFAULT_PRICELISTS: SalesPricelist[] = [
  { id: "PL-RETAIL", name: "Standard Retail Tariff", tierType: "Retail", discountPct: 0, minQty: 1, active: true, createdAt: "2026-01-01" },
  { id: "PL-WHOLESALE", name: "Supermarket / B2B Case Wholesale", tierType: "Wholesale", discountPct: 12, minQty: 10, active: true, createdAt: "2026-01-01" },
  { id: "PL-VIP", name: "Corporate & VIP Contract Tier", tierType: "VIP / Corporate", discountPct: 18, minQty: 1, active: true, createdAt: "2026-01-01" },
  { id: "PL-PROMO", name: "Seasonal / Bundle Promo", tierType: "Promotional", discountPct: 10, minQty: 2, active: true, createdAt: "2026-01-01" },
];

async function deductOrRestoreInventory(
  clusterId: string,
  lines: SalesLineItem[],
  direction: "deduct" | "restore"
) {
  try {
    const inv = await readClusterCollection<any[]>(clusterId, "inventory", []);
    if (!Array.isArray(inv) || inv.length === 0) return;
    let changed = false;
    const mult = direction === "deduct" ? -1 : 1;
    const updated = inv.map((item) => {
      const match = lines.find(
        (l) =>
          (l.sku && item.sku && l.sku.toLowerCase() === String(item.sku).toLowerCase()) ||
          l.name.toLowerCase() === String(item.name || "").toLowerCase()
      );
      if (!match) return item;
      changed = true;
      const prevQty = Number(item.onHand ?? item.qty ?? item.quantity ?? 0);
      const nextQty = Math.max(0, Number((prevQty + mult * Number(match.quantity || 0)).toFixed(3)));
      return {
        ...item,
        onHand: nextQty,
        qty: nextQty,
        quantity: nextQty,
      };
    });
    if (changed) {
      await writeClusterCollection(clusterId, "inventory", updated);
    }
  } catch {}
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawCompanyId = searchParams.get("company_id") || searchParams.get("cluster_id");
  const email = (searchParams.get("email") || searchParams.get("owner_email") || "").trim().toLowerCase() || undefined;
  const orderId = searchParams.get("id");

  if (!rawCompanyId && !email) {
    return NextResponse.json({
      success: true,
      orders: [],
      pricelists: DEFAULT_PRICELISTS,
      returns: [],
      posOrders: [],
    });
  }

  const clusterId = resolveSafeClusterId(rawCompanyId, email);
  const access = await verifyClusterAccess(clusterId, email);
  if (!access.allowed) {
    return NextResponse.json({ success: false, error: access.reason || "Access denied" }, { status: 403 });
  }

  const [orders, pricelistsRaw, returns, posOrders] = await Promise.all([
    readClusterCollection<SalesOrderRecord[]>(clusterId, "sales_orders", []),
    readClusterCollection<SalesPricelist[] | null>(clusterId, "sales_pricelists", null),
    readClusterCollection<SalesReturnRecord[]>(clusterId, "sales_returns", []),
    readClusterCollection<any[]>(clusterId, "pos_orders", []),
  ]);

  const pricelists = Array.isArray(pricelistsRaw) && pricelistsRaw.length > 0 ? pricelistsRaw : DEFAULT_PRICELISTS;

  if (orderId) {
    const found = orders.find((o) => o.id === orderId || o.name === orderId);
    if (!found) {
      return NextResponse.json({ success: false, error: "Sales order not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, clusterId, order: found });
  }

  return NextResponse.json(
    {
      success: true,
      clusterId,
      orders,
      pricelists,
      returns,
      posOrders,
    },
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

    // Sub-action: Save Pricelist / Promotion
    if (body.action === "save_pricelist") {
      const current = await readClusterCollection<SalesPricelist[]>(
        clusterId,
        "sales_pricelists",
        DEFAULT_PRICELISTS
      );
      const item: SalesPricelist = {
        id: body.id || `PL-${Date.now().toString().slice(-5)}`,
        name: String(body.name || "Custom Pricelist").trim(),
        tierType: body.tierType || "Wholesale",
        discountPct: Math.max(0, Math.min(90, Number(body.discountPct || 0))),
        minQty: Math.max(1, Number(body.minQty || 1)),
        active: body.active !== false,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      const next = [item, ...current.filter((p) => p.id !== item.id)];
      await writeClusterCollection(clusterId, "sales_pricelists", next, { ownerEmail: email });
      return NextResponse.json({ success: true, clusterId, pricelist: item, pricelists: next });
    }

    // Sub-action: Create Return / Credit Note
    if (body.action === "create_return") {
      const orders = await readClusterCollection<SalesOrderRecord[]>(clusterId, "sales_orders", []);
      const returns = await readClusterCollection<SalesReturnRecord[]>(clusterId, "sales_returns", []);
      const target = orders.find((o) => o.id === body.orderId);
      const cnNumber = `CN-${Date.now().toString().slice(-5)}`;
      const refundAmount = Number(body.refundAmount ?? target?.amount_total ?? 0);
      const restocked = body.restock !== false;

      const retRecord: SalesReturnRecord = {
        id: `RET-${Date.now().toString().slice(-6)}`,
        creditNoteNumber: cnNumber,
        orderId: body.orderId || "",
        orderName: target?.name || body.orderName || "Direct Return",
        customer_name: target?.customer_name || body.customer_name || "Walk-In Customer",
        reason: String(body.reason || "Customer return / credit adjustment").trim(),
        refundAmount,
        restocked,
        createdAt: new Date().toISOString(),
      };

      await writeClusterCollection(clusterId, "sales_returns", [retRecord, ...returns], {
        ownerEmail: email,
      });

      if (target) {
        const nextOrders = orders.map((o) =>
          o.id === target.id
            ? { ...o, state: "returned" as const, returnRef: cnNumber, updated_at: new Date().toISOString() }
            : o
        );
        await writeClusterCollection(clusterId, "sales_orders", nextOrders);
        if (restocked && target.lines?.length) {
          await deductOrRestoreInventory(clusterId, target.lines, "restore");
        }
      }

      return NextResponse.json({ success: true, clusterId, returnRecord: retRecord });
    }

    // Standard: Create Quotation or Confirmed Sales Order
    const rawLines: any[] = Array.isArray(body.lines) ? body.lines : [];
    const normalizedLines: SalesLineItem[] = rawLines.map((l, i) => {
      const qty = Number(l.quantity ?? l.product_uom_qty ?? l.qty ?? 1) || 1;
      const unitPrice = Number(l.unitPrice ?? l.price_unit ?? l.list_price ?? 0) || 0;
      const disc = Number(l.discountPct ?? 0) || 0;
      const sub = Number((qty * unitPrice * (1 - disc / 100)).toFixed(2));
      return {
        id: l.id || `LN-${i + 1}`,
        sku: l.sku || "",
        name: String(l.name || l.product_name || "Item").trim(),
        description: l.description || "",
        quantity: qty,
        uom: l.uom || "Units",
        unitPrice,
        discountPct: disc,
        subtotal: sub,
      };
    });

    const computedSub = normalizedLines.reduce((s, l) => s + l.subtotal, 0);
    const subtotal = normalizedLines.length > 0 ? computedSub : Number(body.amount_total || 0);
    const discountTotal = Number(body.discountTotal || 0);
    const taxRate = Number(body.taxRate || 0);
    const taxable = Math.max(0, subtotal - discountTotal);
    const taxAmount = Number(((taxable * taxRate) / 100).toFixed(2));
    const amountTotal = Number((taxable + taxAmount).toFixed(2));

    const now = new Date().toISOString();
    const seqNum = Date.now().toString().slice(-5);
    const initialState: SalesOrderState = body.state || "draft";

    const newOrder: SalesOrderRecord = {
      id: body.id || `SO-${seqNum}`,
      name: body.name && body.name !== "New" ? String(body.name) : `SO-${new Date().getFullYear()}-${seqNum}`,
      clusterId,
      industryId: String(body.industryId || "retail_supermarket"),
      channel: body.channel || "Direct Sales",
      customer_name: String(body.customer_name || body.customer || "Walk-In / Corporate Client").trim(),
      customer_email: body.customer_email || "",
      customer_phone: body.customer_phone || "",
      pricelistName: body.pricelistName || "Standard Retail Tariff",
      paymentTerms: body.paymentTerms || "Immediate",
      state: initialState,
      lines: normalizedLines,
      subtotal,
      discountTotal,
      taxRate,
      taxAmount,
      amount_total: amountTotal,
      amountPaid: initialState === "invoiced" ? amountTotal : Number(body.amountPaid || 0),
      deliveryRef: initialState === "dispatched" || initialState === "invoiced" ? `WH/OUT/${seqNum}` : undefined,
      invoiceRef: initialState === "invoiced" ? `INV/${new Date().getFullYear()}/${seqNum}` : undefined,
      industryMeta: body.industryMeta || {},
      notes: body.notes || "",
      date_order: body.date_order || now,
      created_at: now,
      updated_at: now,
    };

    const existing = await readClusterCollection<SalesOrderRecord[]>(clusterId, "sales_orders", []);
    await writeClusterCollection(
      clusterId,
      "sales_orders",
      [newOrder, ...existing.filter((o) => o.id !== newOrder.id)],
      { ownerEmail: email }
    );

    if (initialState === "dispatched" || initialState === "invoiced") {
      await deductOrRestoreInventory(clusterId, normalizedLines, "deduct");
    }

    return NextResponse.json({ success: true, clusterId, order: newOrder });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to save sales order" },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
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

    const id = String(body.id || "");
    const orders = await readClusterCollection<SalesOrderRecord[]>(clusterId, "sales_orders", []);
    const idx = orders.findIndex((o) => o.id === id || o.name === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const current = orders[idx];
    const nextState: SalesOrderState = body.state || current.state;
    const now = new Date().toISOString();
    const seq = current.id.replace(/[^0-9]/g, "").slice(-5) || Date.now().toString().slice(-5);

    const wasDispatched = current.state === "dispatched" || current.state === "invoiced";
    const willBeDispatched = nextState === "dispatched" || nextState === "invoiced";

    const updated: SalesOrderRecord = {
      ...current,
      ...(body.customer_name ? { customer_name: body.customer_name } : {}),
      ...(body.amount_total !== undefined ? { amount_total: Number(body.amount_total) } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      state: nextState,
      deliveryRef:
        willBeDispatched && !current.deliveryRef ? `WH/OUT/${seq}` : current.deliveryRef,
      invoiceRef:
        nextState === "invoiced" && !current.invoiceRef
          ? `INV/${new Date().getFullYear()}/${seq}`
          : current.invoiceRef,
      amountPaid:
        nextState === "invoiced" ? current.amount_total : current.amountPaid,
      updated_at: now,
    };

    if (!wasDispatched && willBeDispatched && current.lines?.length > 0) {
      await deductOrRestoreInventory(clusterId, current.lines, "deduct");
    }

    // Sync Paid Invoice into isolated accounting_invoices collection for Accounting & Reports!
    if (nextState === "invoiced") {
      const invoices = await readClusterCollection<any[]>(clusterId, "accounting_invoices", []);
      const invDoc = {
        id: updated.invoiceRef || `INV-${seq}`,
        name: updated.invoiceRef || `INV-${seq}`,
        customer: updated.customer_name,
        customer_name: updated.customer_name,
        amount: updated.amount_total,
        amount_total: updated.amount_total,
        status: "Paid",
        state: "posted",
        sourceOrder: updated.name,
        date: now.slice(0, 10),
        created_at: now,
      };
      await writeClusterCollection(clusterId, "accounting_invoices", [
        invDoc,
        ...invoices.filter((inv) => inv.id !== invDoc.id),
      ]);
    }

    const nextOrders = [...orders];
    nextOrders[idx] = updated;
    await writeClusterCollection(clusterId, "sales_orders", nextOrders);

    return NextResponse.json({ success: true, clusterId, order: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to update sales order" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawCompanyId = searchParams.get("company_id") || searchParams.get("cluster_id");
  const email = (searchParams.get("email") || "").trim().toLowerCase() || undefined;
  const id = searchParams.get("id") || "";

  const clusterId = resolveSafeClusterId(rawCompanyId, email);
  const access = await verifyClusterAccess(clusterId, email);
  if (!access.allowed) {
    return NextResponse.json({ success: false, error: access.reason || "Access denied" }, { status: 403 });
  }

  const orders = await readClusterCollection<SalesOrderRecord[]>(clusterId, "sales_orders", []);
  await writeClusterCollection(
    clusterId,
    "sales_orders",
    orders.filter((o) => o.id !== id && o.name !== id)
  );
  return NextResponse.json({ success: true, id });
}
