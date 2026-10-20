import { NextRequest, NextResponse } from "next/server";
import { inquireDirectPayTransaction } from "@/lib/directPayClient";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const txnId = searchParams.get("txn_id") || searchParams.get("client_transaction_id");

  if (!txnId) {
    return NextResponse.json(
      { error: "Query parameter 'txn_id' is required" },
      { status: 400 }
    );
  }

  const result = await inquireDirectPayTransaction(txnId);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const txnId = body.txn_id || body.client_transaction_id || body.gateway_transaction_id;

    if (!txnId) {
      return NextResponse.json(
        { error: "Missing 'txn_id' or 'client_transaction_id' in body" },
        { status: 400 }
      );
    }

    const result = await inquireDirectPayTransaction(txnId);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to parse request" },
      { status: 500 }
    );
  }
}
