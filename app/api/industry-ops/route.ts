import { NextRequest, NextResponse } from "next/server";
import {
  resolveSafeClusterId,
  verifyClusterAccess,
  readClusterCollection,
  writeClusterCollection,
} from "@/lib/tenantClusterDb";

export const dynamic = "force-dynamic";

const COLLECTION_MAP: Record<string, string> = {
  manufacturing: "mrp_orders",
  mrp_boms: "mrp_boms",
  mrp_work_orders: "mrp_work_orders",
  inventory_operations: "inventory_operations",
  inventory_warehouses: "inventory_warehouses",
  automotive: "automotive_jobs",
  real_estate: "real_estate_units",
  education: "education_students",
  club_courts: "club_courts",
  club_members: "club_members",
  ngos: "ngo_programs",
  appointments: "appointments",
  projects: "project_milestones",
  timesheets: "timesheets",
  helpdesk_tickets: "helpdesk_tickets",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawCompanyId = searchParams.get("company_id") || searchParams.get("cluster_id");
  const email = (searchParams.get("email") || "").trim().toLowerCase() || undefined;
  const domain = searchParams.get("domain") || "";

  if (!rawCompanyId && !email) {
    return NextResponse.json({ success: true, items: [] });
  }

  const clusterId = resolveSafeClusterId(rawCompanyId, email);
  const access = await verifyClusterAccess(clusterId, email);
  if (!access.allowed) {
    return NextResponse.json({ success: false, error: access.reason || "Access denied" }, { status: 403 });
  }

  if (domain && COLLECTION_MAP[domain]) {
    const items = await readClusterCollection<any[]>(clusterId, COLLECTION_MAP[domain], []);
    return NextResponse.json({ success: true, clusterId, domain, items, records: items }, { headers: { "Cache-Control": "no-store" } });
  }

  const [mrpOrders, autoJobs, reUnits, eduStudents, clubCourts, clubMembers, ngoPrograms, appointments, projects] =
    await Promise.all([
      readClusterCollection<any[]>(clusterId, "mrp_orders", []),
      readClusterCollection<any[]>(clusterId, "automotive_jobs", []),
      readClusterCollection<any[]>(clusterId, "real_estate_units", []),
      readClusterCollection<any[]>(clusterId, "education_students", []),
      readClusterCollection<any[]>(clusterId, "club_courts", []),
      readClusterCollection<any[]>(clusterId, "club_members", []),
      readClusterCollection<any[]>(clusterId, "ngo_programs", []),
      readClusterCollection<any[]>(clusterId, "appointments", []),
      readClusterCollection<any[]>(clusterId, "project_milestones", []),
    ]);

  return NextResponse.json(
    {
      success: true,
      clusterId,
      mrpOrders,
      autoJobs,
      reUnits,
      eduStudents,
      clubCourts,
      clubMembers,
      ngoPrograms,
      appointments,
      projects,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

async function appendSyncedOrderAndInvoice(
  clusterId: string,
  email: string | undefined,
  opts: {
    prefix: string;
    industryId: string;
    customerName: string;
    itemName: string;
    amount: number;
    uom?: string;
    meta?: Record<string, any>;
  }
) {
  const seq = Date.now().toString().slice(-5);
  const now = new Date().toISOString();
  const orderName = `${opts.prefix}-${seq}`;
  const invName = `INV/${opts.prefix}/${seq}`;

  const [salesOrders, invoices] = await Promise.all([
    readClusterCollection<any[]>(clusterId, "sales_orders", []),
    readClusterCollection<any[]>(clusterId, "accounting_invoices", []),
  ]);

  const orderDoc = {
    id: `SO-${seq}`,
    name: orderName,
    clusterId,
    industryId: opts.industryId,
    channel: "Direct Sales",
    customer_name: opts.customerName,
    pricelistName: "Standard Tariff",
    paymentTerms: "Immediate",
    state: "invoiced",
    lines: [
      {
        id: "LN-1",
        sku: opts.prefix,
        name: opts.itemName,
        quantity: 1,
        uom: opts.uom || "Service",
        unitPrice: opts.amount,
        subtotal: opts.amount,
      },
    ],
    subtotal: opts.amount,
    discountTotal: 0,
    taxRate: 0,
    taxAmount: 0,
    amount_total: opts.amount,
    amountPaid: opts.amount,
    deliveryRef: `FUL/${opts.prefix}/${seq}`,
    invoiceRef: invName,
    industryMeta: opts.meta || {},
    date_order: now,
    created_at: now,
    updated_at: now,
  };

  await Promise.all([
    writeClusterCollection(clusterId, "sales_orders", [orderDoc, ...salesOrders], { ownerEmail: email }),
    writeClusterCollection(
      clusterId,
      "accounting_invoices",
      [
        {
          id: invName,
          name: invName,
          customer: opts.customerName,
          customer_name: opts.customerName,
          amount: opts.amount,
          amount_total: opts.amount,
          status: "Paid",
          state: "posted",
          sourceOrder: orderName,
          date: now.slice(0, 10),
          created_at: now,
        },
        ...invoices,
      ],
      { ownerEmail: email }
    ),
  ]);

  return { orderDoc, invoiceRef: invName };
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

    const action = body.action || "save_collection";

    // Generic isolated collection persistence for vertical hubs
    if (action === "save_collection") {
      const domain = String(body.domain || "");
      const col = COLLECTION_MAP[domain];
      if (!col) {
        return NextResponse.json({ success: false, error: "Invalid industry domain" }, { status: 400 });
      }
      const items = Array.isArray(body.items) ? body.items : [];
      await writeClusterCollection(clusterId, col, items, { ownerEmail: email });
      return NextResponse.json({ success: true, clusterId, domain, count: items.length });
    }

    // 1. Manufacturing & AgriTech Batch Run -> Deduct Raw BOM & Add Finished Goods to Inventory!
    if (action === "complete_manufacturing_order") {
      const mrpOrders = await readClusterCollection<any[]>(clusterId, "mrp_orders", []);
      const inv = await readClusterCollection<any[]>(clusterId, "inventory", []);
      const seq = Date.now().toString().slice(-4);
      const finishedProduct = String(body.product || "Finished Assembly").trim();
      const finishedSku = String(body.sku || `FG-${seq}`).trim();
      const qtyProduced = Math.max(1, Number(body.quantity || 10));
      const rawInputs: { sku?: string; name: string; qtyPerUnit: number }[] = Array.isArray(body.bomInputs)
        ? body.bomInputs
        : [];

      let nextInv = inv.map((item) => {
        const rawMatch = rawInputs.find(
          (r) =>
            (r.sku && item.sku && r.sku.toLowerCase() === String(item.sku).toLowerCase()) ||
            r.name.toLowerCase() === String(item.name || "").toLowerCase()
        );
        if (!rawMatch) return item;
        const consumed = qtyProduced * Number(rawMatch.qtyPerUnit || 1);
        const nextQ = Math.max(0, Number((Number(item.quantity ?? 0) - consumed).toFixed(3)));
        return { ...item, quantity: nextQ, onHand: nextQ, qty: nextQ };
      });

      const fgIdx = nextInv.findIndex(
        (x) =>
          String(x.sku || "").toLowerCase() === finishedSku.toLowerCase() ||
          String(x.name || "").toLowerCase() === finishedProduct.toLowerCase()
      );
      if (fgIdx !== -1) {
        const cur = Number(nextInv[fgIdx].quantity ?? 0);
        const updatedQ = Number((cur + qtyProduced).toFixed(3));
        nextInv[fgIdx] = { ...nextInv[fgIdx], quantity: updatedQ, onHand: updatedQ, qty: updatedQ, status: "in_stock" };
      } else {
        nextInv = [
          {
            id: `fg_${Date.now()}`,
            name: finishedProduct,
            sku: finishedSku,
            quantity: qtyProduced,
            onHand: qtyProduced,
            uom: body.uom || "Units",
            min_quantity: 5,
            unit_price: Number(body.unitPrice || 250),
            cost_price: Number(body.costPrice || 120),
            category: body.industryId === "agriculture_agritech" ? "Harvest / Batch Yield" : "Manufactured Goods",
            warehouse: "Finished Goods Warehouse",
            status: "in_stock",
            created_at: new Date().toISOString(),
          },
          ...nextInv,
        ];
      }

      const moRecord = {
        id: body.id || `MO-${seq}`,
        product: finishedProduct,
        sku: finishedSku,
        quantity: qtyProduced,
        industryId: body.industryId || "manufacturing",
        status: "done",
        deadline: new Date().toISOString().slice(0, 10),
        source: body.source || "Factory Schedule",
        completedAt: new Date().toISOString(),
      };

      await Promise.all([
        writeClusterCollection(clusterId, "inventory", nextInv, { ownerEmail: email }),
        writeClusterCollection(
          clusterId,
          "mrp_orders",
          [moRecord, ...mrpOrders.filter((m) => m.id !== moRecord.id)],
          { ownerEmail: email }
        ),
      ]);

      return NextResponse.json({ success: true, clusterId, moRecord, inventoryCount: nextInv.length });
    }

    // 2. Automotive Workshop: Complete Vehicle Job Card -> Deduct Parts + Post Sales & Accounting Invoice!
    if (action === "complete_job_card") {
      const jobs = await readClusterCollection<any[]>(clusterId, "automotive_jobs", []);
      const inv = await readClusterCollection<any[]>(clusterId, "inventory", []);
      const partsTotal = Number(body.partsTotal || 145);
      const laborTotal = Number(body.laborTotal || 120);
      const totalAmount = Number((partsTotal + laborTotal).toFixed(2));

      if (body.partSku && inv.length > 0) {
        const nextInv = inv.map((it) =>
          String(it.sku || "").toLowerCase() === String(body.partSku).toLowerCase()
            ? { ...it, quantity: Math.max(0, Number(it.quantity || 0) - Number(body.partQty || 1)) }
            : it
        );
        await writeClusterCollection(clusterId, "inventory", nextInv, { ownerEmail: email });
      }

      const jobRecord = {
        id: body.id || `JC-${Date.now().toString().slice(-4)}`,
        vehicle: body.vehicle || "2024 Toyota Land Cruiser",
        licensePlate: body.licensePlate || "DXB-40912",
        vin: body.vin || "JTMCY7AJ9P40129",
        customer: body.customer || "Fleet Account",
        serviceRequested: body.serviceRequested || "Full Synthetic Service + Ceramic Brake Pads",
        partsTotal,
        laborTotal,
        status: "invoiced",
        openedDate: new Date().toISOString().slice(0, 10),
      };

      await writeClusterCollection(clusterId, "automotive_jobs", [jobRecord, ...jobs], { ownerEmail: email });
      const synced = await appendSyncedOrderAndInvoice(clusterId, email, {
        prefix: "AUTO",
        industryId: "automotive_workshop",
        customerName: jobRecord.customer,
        itemName: `${jobRecord.vehicle} (${jobRecord.licensePlate}) — ${jobRecord.serviceRequested}`,
        amount: totalAmount,
        uom: "Job Card",
        meta: { vin: jobRecord.vin, plate: jobRecord.licensePlate },
      });

      return NextResponse.json({ success: true, clusterId, jobCard: jobRecord, salesOrder: synced.orderDoc });
    }

    // 3. Real Estate & Hospitality: Lease / Room Folio Billing -> Sync to Sales & Accounting!
    if (action === "bill_property_or_folio") {
      const units = await readClusterCollection<any[]>(clusterId, "real_estate_units", []);
      const unitRecord = {
        id: body.id || `UNIT-${Date.now().toString().slice(-4)}`,
        propertyName: body.propertyName || "Skyline Executive Tower",
        unitNumber: body.unitNumber || "Suite 1402",
        unitType: body.unitType || "Commercial Office",
        sqft: Number(body.sqft || 650),
        monthlyRent: Number(body.amount || 4500),
        housekeeping: body.housekeeping || "Clean",
        status: "occupied",
        tenantName: body.tenantName || "Horizon Capital Partners",
        leaseStart: body.leaseStart || new Date().toISOString().slice(0, 10),
        leaseEnd: body.leaseEnd || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      };
      await writeClusterCollection(
        clusterId,
        "real_estate_units",
        [unitRecord, ...units.filter((u) => u.id !== unitRecord.id)],
        { ownerEmail: email }
      );

      const synced = await appendSyncedOrderAndInvoice(clusterId, email, {
        prefix: body.industryId === "hospitality_travel" ? "FOLIO" : "LEASE",
        industryId: body.industryId || "real_estate",
        customerName: unitRecord.tenantName,
        itemName: `${unitRecord.propertyName} — ${unitRecord.unitNumber}`,
        amount: unitRecord.monthlyRent,
        uom: body.industryId === "hospitality_travel" ? "Stay Folio" : "Month",
      });

      return NextResponse.json({ success: true, clusterId, unit: unitRecord, salesOrder: synced.orderDoc });
    }

    // 4. Education Academy: Student Cohort Enrollment -> Tuition Invoice!
    if (action === "enroll_student") {
      const students = await readClusterCollection<any[]>(clusterId, "education_students", []);
      const student = {
        id: body.id || `STU-${Date.now().toString().slice(-4)}`,
        name: body.name || "Zainab Al-Mansoor",
        email: body.email || "zainab@academy.edu",
        course: body.course || "AI & Cloud Engineering Diploma",
        batch: body.batch || "Fall 2026 Cohort",
        tuitionFee: Number(body.tuitionFee || 3200),
        paymentStatus: "paid",
        attendanceRate: 100,
        enrolledDate: new Date().toISOString().slice(0, 10),
      };
      await writeClusterCollection(clusterId, "education_students", [student, ...students], { ownerEmail: email });

      const synced = await appendSyncedOrderAndInvoice(clusterId, email, {
        prefix: "TUITION",
        industryId: "education_academies",
        customerName: student.name,
        itemName: `${student.course} (${student.batch})`,
        amount: student.tuitionFee,
        uom: "Term",
      });

      return NextResponse.json({ success: true, clusterId, student, salesOrder: synced.orderDoc });
    }

    // 5. Fitness, Gym & Padel Club: Court Booking / RFID Membership -> Club Revenue Sync!
    if (action === "book_club_facility") {
      const members = await readClusterCollection<any[]>(clusterId, "club_members", []);
      const entry = {
        id: `MEM-${Date.now().toString().slice(-4)}`,
        name: body.memberName || "Rami Haddad",
        membershipTier: body.tier || "Unlimited Padel VIP",
        rfidCardNumber: body.rfid || `RFID-${Date.now().toString().slice(-6)}`,
        status: "active",
        joinedDate: new Date().toISOString().slice(0, 10),
        totalVisits: 1,
      };
      await writeClusterCollection(clusterId, "club_members", [entry, ...members], { ownerEmail: email });

      const synced = await appendSyncedOrderAndInvoice(clusterId, email, {
        prefix: "CLUB",
        industryId: "fitness_sports_club",
        customerName: entry.name,
        itemName: `${entry.membershipTier} (${body.courtName || "Panoramic Court #1"})`,
        amount: Number(body.amount || 180),
        uom: "Pass",
      });

      return NextResponse.json({ success: true, clusterId, member: entry, salesOrder: synced.orderDoc });
    }

    // 6. NGOs & Humanitarian Grants: Restricted Grant Pledge & Field Disbursement!
    if (action === "record_ngo_grant") {
      const programs = await readClusterCollection<any[]>(clusterId, "ngo_programs", []);
      const grantAmount = Number(body.grantAmount || 25000);
      const disbursedAmount = Number(body.disbursedAmount || 10000);
      const prog = {
        id: `NGO-${Date.now().toString().slice(-4)}`,
        programTitle: body.programTitle || "Clean Water & Solar Wells Initiative",
        donorName: body.donorName || "Global Relief Foundation",
        fundType: body.fundType || "restricted",
        grantAmount,
        disbursedAmount,
        beneficiariesReached: Number(body.beneficiariesReached || 850),
        status: "active",
        region: body.region || "South Asia",
        startDate: new Date().toISOString().slice(0, 10),
      };
      await writeClusterCollection(clusterId, "ngo_programs", [prog, ...programs], { ownerEmail: email });

      const synced = await appendSyncedOrderAndInvoice(clusterId, email, {
        prefix: "GRANT",
        industryId: "ngos",
        customerName: prog.donorName,
        itemName: `${prog.programTitle} (${prog.fundType.toUpperCase()} FUND)`,
        amount: grantAmount,
        uom: "Grant",
      });

      return NextResponse.json({ success: true, clusterId, program: prog, salesOrder: synced.orderDoc });
    }

    // 7. Healthcare, Professional Services, Construction & Logistics Milestone/Appointment Billing
    if (action === "execute_service_workflow") {
      const industryId = String(body.industryId || "professional_services");
      const prefixMap: Record<string, string> = {
        healthcare_wellness: "CLINIC",
        professional_services: "SOW",
        construction_contracting: "AIA",
        logistics_wholesale: "BOL",
      };
      const synced = await appendSyncedOrderAndInvoice(clusterId, email, {
        prefix: prefixMap[industryId] || "SRV",
        industryId,
        customerName: String(body.customerName || "Enterprise Client"),
        itemName: String(body.serviceTitle || "Milestone Deliverable"),
        amount: Number(body.amount || 1500),
        uom: body.uom || "Milestone",
        meta: body.meta || {},
      });
      return NextResponse.json({ success: true, clusterId, industryId, salesOrder: synced.orderDoc });
    }

    // 8. Logistics / Warehouse Stock Operation Validation (WH-IN Receipt / WH-OUT Delivery / WH-INT Transfer)
    if (action === "validate_warehouse_operation") {
      const ops = await readClusterCollection<any[]>(clusterId, "inventory_operations", []);
      const inv = await readClusterCollection<any[]>(clusterId, "inventory", []);
      const opType = body.opType || body.type || "receipt"; // receipt | delivery | transfer
      const productName = String(body.product || "Warehouse Stock").trim();
      const sku = String(body.sku || `WH-${Date.now().toString().slice(-4)}`).trim();
      const qty = Math.max(0.01, Number(body.quantity || 1));

      let nextInv = [...inv];
      if (opType === "receipt" || opType === "delivery") {
        const mult = opType === "receipt" ? 1 : -1;
        const idx = nextInv.findIndex(
          (x) =>
            (sku && x.sku && String(x.sku).toLowerCase() === sku.toLowerCase()) ||
            String(x.name || "").toLowerCase() === productName.toLowerCase()
        );
        if (idx !== -1) {
          const cur = Number(nextInv[idx].quantity ?? nextInv[idx].stock ?? nextInv[idx].onHand ?? 0);
          const updatedQ = Math.max(0, Number((cur + mult * qty).toFixed(3)));
          nextInv[idx] = { ...nextInv[idx], quantity: updatedQ, stock: updatedQ, onHand: updatedQ, qty: updatedQ };
        } else if (opType === "receipt") {
          nextInv = [
            {
              id: `wh_inv_${Date.now()}`,
              name: productName,
              sku,
              stock: qty,
              quantity: qty,
              onHand: qty,
              uom: body.uom || "Units",
              min_quantity: 5,
              price: Number(body.unitPrice || 25),
              unit_price: Number(body.unitPrice || 25),
              cost_price: Number(body.costPrice || 15),
              category: "Warehouse Stock",
              warehouse: body.warehouse || "Primary Distribution Hub",
              status: "in_stock",
              created_at: new Date().toISOString(),
            },
            ...nextInv,
          ];
        }
        await writeClusterCollection(clusterId, "inventory", nextInv, { ownerEmail: email });
      }

      const opRecord = {
        id: body.id || body.operation_id || `${opType === "receipt" ? "WH-IN" : opType === "delivery" ? "WH-OUT" : "WH-INT"}-${Date.now().toString().slice(-4)}`,
        type: opType,
        product: productName,
        sku,
        quantity: qty,
        status: "done",
        date: new Date().toISOString().slice(0, 10),
      };
      const nextOps = [opRecord, ...ops.filter((o) => o.id !== opRecord.id)];
      await writeClusterCollection(clusterId, "inventory_operations", nextOps, { ownerEmail: email });

      return NextResponse.json({ success: true, clusterId, operation: opRecord, operations: nextOps });
    }

    // 9. Professional Services & Construction: Convert Billable Timesheets / Project Milestone -> Invoice
    if (action === "convert_timesheets_to_invoice") {
      const hours = Math.max(0.25, Number(body.hours || 1));
      const hourlyRate = Math.max(1, Number(body.hourlyRate || 95));
      const amount = Number(body.amount ?? (hours * hourlyRate).toFixed(2));
      const synced = await appendSyncedOrderAndInvoice(clusterId, email, {
        prefix: body.industryId === "construction_contracting" ? "AIA" : "TS-INV",
        industryId: body.industryId || "professional_services",
        customerName: String(body.customerName || "Client Engagement"),
        itemName: String(body.description || `${hours} Billable Hours @ $${hourlyRate}/hr`),
        amount,
        uom: body.industryId === "construction_contracting" ? "Milestone" : "Hours",
      });
      return NextResponse.json({ success: true, clusterId, salesOrder: synced.orderDoc });
    }

    // 10. Healthcare, Dental, Salon & Advisory: Complete Appointment & Bill Session
    if (action === "complete_appointment_billing") {
      const appointments = await readClusterCollection<any[]>(clusterId, "appointments", []);
      const nextAppts = appointments.map((a) =>
        a.id === body.appointmentId ? { ...a, status: "completed", clinicalNotes: body.clinicalNotes || a.notes } : a
      );
      if (appointments.length > 0) {
        await writeClusterCollection(clusterId, "appointments", nextAppts, { ownerEmail: email });
      }
      const synced = await appendSyncedOrderAndInvoice(clusterId, email, {
        prefix: "APPT",
        industryId: body.industryId || "healthcare_wellness",
        customerName: String(body.clientName || "Patient / Client"),
        itemName: String(body.serviceTitle || "Clinical / Advisory Session"),
        amount: Number(body.fee || 95),
        uom: "Session",
      });
      return NextResponse.json({ success: true, clusterId, salesOrder: synced.orderDoc, appointments: nextAppts });
    }

    return NextResponse.json({ success: false, error: "Unsupported industry action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Industry operations error" },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
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
    const domain = String(body.domain || "");
    const col = COLLECTION_MAP[domain];
    if (!col) {
      return NextResponse.json({ success: false, error: "Invalid industry domain" }, { status: 400 });
    }
    const items = Array.isArray(body.records) ? body.records : Array.isArray(body.items) ? body.items : [];
    await writeClusterCollection(clusterId, col, items, { ownerEmail: email });
    return NextResponse.json({ success: true, clusterId, domain, count: items.length });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed to save domain collection" }, { status: 400 });
  }
}
