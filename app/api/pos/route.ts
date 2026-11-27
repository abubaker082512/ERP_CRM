import { NextRequest, NextResponse } from "next/server";
import {
  resolveSafeClusterId,
  verifyClusterAccess,
  readClusterCollection,
  writeClusterCollection,
} from "@/lib/tenantClusterDb";

export const dynamic = "force-dynamic";

export interface KDSTicketRecord {
  id: string;
  orderNumber: string;
  tableNumber: string;
  orderType: "Dine-In" | "Takeaway" | "Delivery";
  placedAt: string;
  createdAt: string;
  elapsedMinutes: number;
  status: "queued" | "preparing" | "ready" | "served";
  notes?: string;
  items: {
    id: string;
    name: string;
    qty: number;
    course?: string;
    modifiers?: string[];
    notes?: string;
  }[];
}

export interface RestaurantTableRecord {
  id: string;
  number: string;
  zone: "Main Hall" | "Outdoor Patio" | "VIP Lounge";
  seats: number;
  status: "available" | "occupied" | "reserved" | "cleaning";
  guestName?: string;
  seatedAt?: string;
  currentTotal?: number;
  waiter?: string;
}

export const DEFAULT_RESTAURANT_TABLES: RestaurantTableRecord[] = [
  { id: "TBL-1", number: "Table 1", zone: "Main Hall", seats: 2, status: "available", waiter: "Alex" },
  { id: "TBL-2", number: "Table 2", zone: "Main Hall", seats: 4, status: "available", waiter: "Alex" },
  { id: "TBL-3", number: "Table 3", zone: "Main Hall", seats: 4, status: "available", waiter: "Sara" },
  { id: "TBL-4", number: "Table 4", zone: "Main Hall", seats: 6, status: "available", waiter: "Sara" },
  { id: "TBL-5", number: "Table 5", zone: "Outdoor Patio", seats: 2, status: "available", waiter: "Omar" },
  { id: "TBL-6", number: "Table 6", zone: "Outdoor Patio", seats: 4, status: "available", waiter: "Omar" },
  { id: "TBL-7", number: "Table 7", zone: "Outdoor Patio", seats: 6, status: "reserved", guestName: "Dinner Party", seatedAt: "19:30", waiter: "Omar" },
  { id: "TBL-8", number: "Table 8", zone: "VIP Lounge", seats: 8, status: "available", waiter: "Elena" },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawCompanyId = searchParams.get("company_id") || searchParams.get("cluster_id");
  const email = (searchParams.get("email") || "").trim().toLowerCase() || undefined;

  if (!rawCompanyId && !email) {
    return NextResponse.json({
      success: true,
      products: [],
      orders: [],
      kdsTickets: [],
      tables: DEFAULT_RESTAURANT_TABLES,
      recipes: [],
      heldCarts: [],
    });
  }

  const clusterId = resolveSafeClusterId(rawCompanyId, email);
  const access = await verifyClusterAccess(clusterId, email);
  if (!access.allowed) {
    return NextResponse.json({ success: false, error: access.reason || "Access denied" }, { status: 403 });
  }

  const [products, orders, kdsTickets, tablesRaw, recipes, heldCarts, wasteLogs] = await Promise.all([
    readClusterCollection<any[]>(clusterId, "pos_products", []),
    readClusterCollection<any[]>(clusterId, "pos_orders", []),
    readClusterCollection<KDSTicketRecord[]>(clusterId, "kds_tickets", []),
    readClusterCollection<RestaurantTableRecord[] | null>(clusterId, "pos_tables", null),
    readClusterCollection<any[]>(clusterId, "pos_recipes", []),
    readClusterCollection<any[]>(clusterId, "pos_held_carts", []),
    readClusterCollection<any[]>(clusterId, "pos_waste_logs", []),
  ]);

  const nowMs = Date.now();
  const computedTickets = (Array.isArray(kdsTickets) ? kdsTickets : []).map((t) => {
    const createdMs = t.createdAt ? new Date(t.createdAt).getTime() : nowMs;
    const mins = Number.isFinite(createdMs) ? Math.max(0, Math.floor((nowMs - createdMs) / 60000)) : t.elapsedMinutes || 0;
    return { ...t, elapsedMinutes: mins };
  });

  const tables = Array.isArray(tablesRaw) && tablesRaw.length > 0 ? tablesRaw : DEFAULT_RESTAURANT_TABLES;

  return NextResponse.json(
    {
      success: true,
      clusterId,
      products,
      orders,
      kdsTickets: computedTickets,
      tables,
      recipes,
      heldCarts,
      wasteLogs,
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

    const action = body.action || "checkout";

    // 1. Save POS Catalog (+ optional Inventory Stock seeding)
    if (action === "save_products") {
      const prods = Array.isArray(body.products) ? body.products : [];
      await writeClusterCollection(clusterId, "pos_products", prods, { ownerEmail: email });

      if (body.syncToInventory !== false && prods.length > 0) {
        const inv = await readClusterCollection<any[]>(clusterId, "inventory", []);
        const nextInv = [...inv];
        for (const p of prods) {
          const exists = nextInv.some(
            (x) =>
              (p.sku && x.sku && String(x.sku).toLowerCase() === String(p.sku).toLowerCase()) ||
              String(x.name || "").toLowerCase() === String(p.name || "").toLowerCase()
          );
          if (!exists) {
            nextInv.unshift({
              id: p.id || `inv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              name: p.name,
              sku: p.sku || `SKU-${Date.now().toString().slice(-4)}`,
              barcode: p.barcode || p.sku || "",
              quantity: Number(p.stockQty ?? 100),
              onHand: Number(p.stockQty ?? 100),
              uom: p.weighed ? "Kg" : p.uom || "Units",
              min_quantity: 10,
              unit_price: Number(p.list_price || 0),
              cost_price: Number(p.cost_price || 0),
              category: p.category || "POS Catalog",
              warehouse: "Main Storefront / Kitchen",
              status: "in_stock",
              created_at: new Date().toISOString(),
            });
          }
        }
        await writeClusterCollection(clusterId, "inventory", nextInv, { ownerEmail: email });
      }

      return NextResponse.json({ success: true, clusterId, products: prods });
    }

    // 2. Send Order to Kitchen Display System (KDS) + Occupy Table
    if (action === "send_kds") {
      const existing = await readClusterCollection<KDSTicketRecord[]>(clusterId, "kds_tickets", []);
      const now = new Date();
      const placedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const rawItems = Array.isArray(body.items) ? body.items : [];
      const ticket: KDSTicketRecord = {
        id: body.id || `KDS-${Date.now().toString().slice(-5)}`,
        orderNumber: body.orderNumber || `#${Math.floor(100 + Math.random() * 900)}`,
        tableNumber: body.tableNumber || body.table || "Counter",
        orderType: body.orderType || "Dine-In",
        placedAt: placedTime,
        createdAt: now.toISOString(),
        elapsedMinutes: 0,
        status: body.status || "queued",
        notes: body.notes || "",
        items: rawItems.map((it: any, idx: number) => ({
          id: it.id || `ki_${idx + 1}`,
          name: String(it.name || "Menu Item"),
          qty: Number(it.qty || 1),
          course: it.course || "Mains",
          modifiers: Array.isArray(it.modifiers) ? it.modifiers : [],
          notes: it.notes || body.notes || "",
        })),
      };

      const updatedTickets = [ticket, ...existing.filter((t) => t.id !== ticket.id)];
      await writeClusterCollection(clusterId, "kds_tickets", updatedTickets, { ownerEmail: email });

      // Mark Dine-In table occupied
      if (ticket.orderType === "Dine-In" && ticket.tableNumber) {
        const tablesRaw = await readClusterCollection<RestaurantTableRecord[] | null>(clusterId, "pos_tables", null);
        const tables = Array.isArray(tablesRaw) && tablesRaw.length > 0 ? tablesRaw : DEFAULT_RESTAURANT_TABLES;
        const nextTables = tables.map((t) =>
          t.number.toLowerCase() === ticket.tableNumber.toLowerCase()
            ? {
                ...t,
                status: "occupied" as const,
                seatedAt: t.seatedAt || placedTime,
                currentTotal: Number(body.currentTotal ?? t.currentTotal ?? 0),
                guestName: body.guestName || t.guestName || "Dine-In Guest",
              }
            : t
        );
        await writeClusterCollection(clusterId, "pos_tables", nextTables, { ownerEmail: email });
      }

      return NextResponse.json({ success: true, clusterId, ticket, kdsTickets: updatedTickets });
    }

    // 3. Update KDS Ticket Status (queued -> preparing -> ready -> served)
    if (action === "update_kds") {
      const existing = await readClusterCollection<KDSTicketRecord[]>(clusterId, "kds_tickets", []);
      if (Array.isArray(body.tickets)) {
        await writeClusterCollection(clusterId, "kds_tickets", body.tickets, { ownerEmail: email });
        return NextResponse.json({ success: true, clusterId, kdsTickets: body.tickets });
      }
      const next = existing.map((t) =>
        t.id === body.ticketId ? { ...t, status: body.status || t.status } : t
      );
      await writeClusterCollection(clusterId, "kds_tickets", next, { ownerEmail: email });
      return NextResponse.json({ success: true, clusterId, kdsTickets: next });
    }

    // 4. Save / Update Floor Plan Tables
    if (action === "save_tables") {
      const tables = Array.isArray(body.tables) && body.tables.length > 0 ? body.tables : DEFAULT_RESTAURANT_TABLES;
      await writeClusterCollection(clusterId, "pos_tables", tables, { ownerEmail: email });
      return NextResponse.json({ success: true, clusterId, tables });
    }

    // 5. Hold / Recall Cart (Supermarket & Restaurant)
    if (action === "hold_cart") {
      const held = await readClusterCollection<any[]>(clusterId, "pos_held_carts", []);
      const entry = {
        id: `HOLD-${Date.now().toString().slice(-4)}`,
        label: body.label || `Parked Cart #${held.length + 1}`,
        customerName: body.customerName || "",
        posMode: body.posMode || "retail_supermarket",
        tableNumber: body.tableNumber || "",
        items: Array.isArray(body.items) ? body.items : [],
        total: Number(body.total || 0),
        createdAt: new Date().toISOString(),
      };
      const next = [entry, ...held];
      await writeClusterCollection(clusterId, "pos_held_carts", next, { ownerEmail: email });
      return NextResponse.json({ success: true, clusterId, heldCart: entry, heldCarts: next });
    }

    if (action === "remove_held_cart") {
      const held = await readClusterCollection<any[]>(clusterId, "pos_held_carts", []);
      const next = held.filter((h) => h.id !== body.holdId);
      await writeClusterCollection(clusterId, "pos_held_carts", next, { ownerEmail: email });
      return NextResponse.json({ success: true, clusterId, heldCarts: next });
    }

    // 6. Save Recipes & Waste Logs
    if (action === "save_recipes") {
      if (Array.isArray(body.recipes)) {
        await writeClusterCollection(clusterId, "pos_recipes", body.recipes, { ownerEmail: email });
      }
      if (Array.isArray(body.wasteLogs)) {
        await writeClusterCollection(clusterId, "pos_waste_logs", body.wasteLogs, { ownerEmail: email });
      }
      return NextResponse.json({ success: true, clusterId });
    }

    // 7. Complete POS Sale OR POS Return / Refund -> Sync Inventory, Sales & Accounting!
    const isRefund = Boolean(body.isRefund || action === "refund");
    const items: any[] = Array.isArray(body.items) ? body.items : [];
    const now = new Date().toISOString();
    const seq = Date.now().toString().slice(-6);
    const total = Number(body.total ?? body.amount_total ?? 0);

    const txRecord = {
      id: body.id || `${isRefund ? "pos_ret" : "tx"}_${Date.now()}`,
      name: body.name || `${isRefund ? "POS-RET" : "POS"}/${seq}`,
      posMode: body.posMode || "retail_supermarket",
      isRefund,
      customerName: body.customerName || "Walk-In Customer",
      customerPhone: body.customerPhone || "",
      loyaltyPointsEarned: !isRefund ? Math.floor(Math.max(0, total)) : 0,
      items,
      subtotal: Number(body.subtotal ?? total),
      discountAmount: Number(body.discountAmount ?? 0),
      serviceChargeAmount: Number(body.serviceChargeAmount ?? 0),
      taxAmount: Number(body.taxAmount ?? 0),
      total: isRefund ? -Math.abs(total) : total,
      amount_total: isRefund ? -Math.abs(total) : total,
      amountPaid: Number(body.amountPaid ?? total),
      splitCash: Number(body.splitCash ?? 0),
      splitCard: Number(body.splitCard ?? 0),
      changeDue: Number(body.changeDue ?? 0),
      status: isRefund ? "REFUNDED" : body.status || "APPROVED",
      state: isRefund ? "returned" : "invoiced",
      paymentMethod: body.paymentMethod || "Card / Terminal",
      orderType: body.orderType || "Counter",
      tableNumber: body.tableNumber || "",
      date: new Date().toLocaleString(),
      created_at: now,
    };

    const existingOrders = await readClusterCollection<any[]>(clusterId, "pos_orders", []);
    const nextPosOrders = [txRecord, ...existingOrders];
    await writeClusterCollection(clusterId, "pos_orders", nextPosOrders, { ownerEmail: email });

    // Deduct or Restore Inventory Stock (direct SKU/Name + Restaurant Recipe BOM ingredients!)
    const [inv, recipes] = await Promise.all([
      readClusterCollection<any[]>(clusterId, "inventory", []),
      readClusterCollection<any[]>(clusterId, "pos_recipes", []),
    ]);

    if (Array.isArray(inv) && inv.length > 0 && items.length > 0) {
      const mult = isRefund ? 1 : -1;
      const updatedInv = inv.map((invItem) => {
        let delta = 0;
        for (const sold of items) {
          const soldQty = Number(sold.qty ?? sold.quantity ?? 1);
          const directMatch =
            (sold.sku && invItem.sku && String(sold.sku).toLowerCase() === String(invItem.sku).toLowerCase()) ||
            String(sold.name || "").toLowerCase() === String(invItem.name || "").toLowerCase();
          if (directMatch) {
            delta += mult * soldQty;
          }
          // Check Restaurant Recipe BOM ingredient deduction
          if (Array.isArray(recipes) && recipes.length > 0) {
            const matchedRecipe = recipes.find(
              (r: any) => String(r.name || "").toLowerCase() === String(sold.name || "").toLowerCase()
            );
            if (matchedRecipe && Array.isArray(matchedRecipe.ingredients)) {
              for (const ing of matchedRecipe.ingredients) {
                if (String(ing.name || "").toLowerCase() === String(invItem.name || "").toLowerCase()) {
                  const perYield = Number(ing.quantity || 0) / Math.max(1, Number(matchedRecipe.yieldCount || 1));
                  delta += mult * soldQty * perYield;
                }
              }
            }
          }
        }
        if (delta === 0) return invItem;
        const prev = Number(invItem.quantity ?? invItem.onHand ?? invItem.qty ?? 0);
        const nextQty = Math.max(0, Number((prev + delta).toFixed(3)));
        const minQ = Number(invItem.min_quantity ?? 5);
        return {
          ...invItem,
          quantity: nextQty,
          onHand: nextQty,
          qty: nextQty,
          status: nextQty <= 0 ? "out_of_stock" : nextQty <= minQ ? "low_stock" : "in_stock",
        };
      });
      await writeClusterCollection(clusterId, "inventory", updatedInv, { ownerEmail: email });
    }

    // Sync POS Sale / Refund to Sales Hub (`sales_orders` / `sales_returns`) & Accounting (`accounting_invoices`)
    if (isRefund) {
      const returns = await readClusterCollection<any[]>(clusterId, "sales_returns", []);
      await writeClusterCollection(
        clusterId,
        "sales_returns",
        [
          {
            id: `RET-${seq}`,
            creditNoteNumber: `POS-CN-${seq}`,
            orderId: txRecord.id,
            orderName: txRecord.name,
            customer_name: txRecord.customerName,
            reason: body.refundReason || "POS Counter Return & Refund",
            refundAmount: Math.abs(total),
            restocked: true,
            createdAt: now,
          },
          ...returns,
        ],
        { ownerEmail: email }
      );
    } else if (txRecord.status === "APPROVED") {
      const [salesOrders, invoices] = await Promise.all([
        readClusterCollection<any[]>(clusterId, "sales_orders", []),
        readClusterCollection<any[]>(clusterId, "accounting_invoices", []),
      ]);

      const syncedOrder = {
        id: `SO-POS-${seq}`,
        name: txRecord.name,
        clusterId,
        industryId: txRecord.posMode,
        channel: "POS Sync",
        customer_name: txRecord.customerName,
        customer_phone: txRecord.customerPhone,
        pricelistName: "POS Register",
        paymentTerms: txRecord.paymentMethod,
        state: "invoiced",
        lines: items.map((it, i) => ({
          id: `LN-${i + 1}`,
          sku: it.sku || "",
          name: it.name,
          quantity: Number(it.qty || 1),
          uom: it.weighed ? "Kg" : "Units",
          unitPrice: Number(it.list_price || 0),
          subtotal: Number(((Number(it.list_price) || 0) * (Number(it.qty) || 1)).toFixed(2)),
        })),
        subtotal: txRecord.subtotal,
        discountTotal: txRecord.discountAmount,
        taxRate: 0,
        taxAmount: txRecord.taxAmount,
        amount_total: total,
        amountPaid: txRecord.amountPaid,
        deliveryRef: `POS/OUT/${seq}`,
        invoiceRef: `POS/INV/${seq}`,
        date_order: now,
        created_at: now,
        updated_at: now,
      };
      await writeClusterCollection(clusterId, "sales_orders", [syncedOrder, ...salesOrders], {
        ownerEmail: email,
      });

      await writeClusterCollection(
        clusterId,
        "accounting_invoices",
        [
          {
            id: `POS-INV-${seq}`,
            name: `POS/INV/${seq}`,
            customer: txRecord.customerName,
            customer_name: txRecord.customerName,
            amount: total,
            amount_total: total,
            status: "Paid",
            state: "posted",
            sourceOrder: txRecord.name,
            date: now.slice(0, 10),
            created_at: now,
          },
          ...invoices,
        ],
        { ownerEmail: email }
      );
    }

    // Free up Dine-In table once bill is settled
    if (body.posMode === "food_beverage" && body.tableNumber && !isRefund) {
      const tablesRaw = await readClusterCollection<RestaurantTableRecord[] | null>(clusterId, "pos_tables", null);
      if (Array.isArray(tablesRaw) && tablesRaw.length > 0) {
        const nextTables = tablesRaw.map((t) =>
          t.number.toLowerCase() === String(body.tableNumber).toLowerCase()
            ? { ...t, status: "available" as const, currentTotal: 0, seatedAt: undefined, guestName: undefined }
            : t
        );
        await writeClusterCollection(clusterId, "pos_tables", nextTables, { ownerEmail: email });
      }
    }

    return NextResponse.json({ success: true, clusterId, transaction: txRecord });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "POS API failure" },
      { status: 400 }
    );
  }
}
