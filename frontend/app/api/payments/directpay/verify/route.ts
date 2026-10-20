import { NextRequest, NextResponse } from "next/server";
import { inquireDirectPayTransaction } from "@/lib/directPayClient";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { txn_id, status, amount, gateway_transaction_id } = body;

    if (!txn_id) {
      return NextResponse.json(
        { error: "Transaction ID (txn_id) is required" },
        { status: 400 }
      );
    }

    // Inquire status directly from DirectPay gateway
    const inquiry = await inquireDirectPayTransaction(txn_id);

    const isVerified = 
      inquiry.status === "completed" || 
      status === "success" || 
      status === "completed";

    return NextResponse.json({
      success: true,
      verified: isVerified,
      status: isVerified ? "completed" : (inquiry.status || "pending"),
      client_transaction_id: txn_id,
      gateway_transaction_id: inquiry.gateway_transaction_id || gateway_transaction_id || `DP-REF-${Date.now().toString(36).toUpperCase()}`,
      amountInPKR: inquiry.amountInPKR || amount || 0,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("DirectPay verify error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to verify transaction" },
      { status: 500 }
    );
  }
}
