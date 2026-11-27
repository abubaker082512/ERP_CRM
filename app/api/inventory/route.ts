import { NextRequest, NextResponse } from "next/server";
import {
  resolveSafeClusterId,
  verifyClusterAccess,
  readClusterCollection,
  writeClusterCollection,
} from "@/lib/tenantClusterDb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawCompanyId = searchParams.get("company_id") || searchParams.get("cluster_id");
  const email = (searchParams.get("email") || "").trim().toLowerCase() || undefined;

  if (!rawCompanyId && !email) {
    return NextResponse.json({ success: true, products: [] });
  }

  const clusterId = resolveSafeClusterId(rawCompanyId, email);
  const access = await verifyClusterAccess(clusterId, email);
  if (!access.allowed) {
    return NextResponse.json({ success: false, error: access.reason || "Access denied" }, { status: 403 });
  }

  const products = await readClusterCollection<any[]>(clusterId, "inventory", []);
  return NextResponse.json(
    { success: true, clusterId, products },
    { headers: { "Cache-Control": "no-store" } }
  );
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

    const products = Array.isArray(body.products) ? body.products : [];
    await writeClusterCollection(clusterId, "inventory", products, { ownerEmail: email });
    return NextResponse.json({ success: true, clusterId, count: products.length });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to persist inventory" },
      { status: 400 }
    );
  }
}
