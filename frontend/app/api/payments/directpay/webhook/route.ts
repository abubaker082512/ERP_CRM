import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => ({}));
    const clientTransactionId = payload.client_transaction_id || payload.clientTransactionId || payload.txn_id || payload.order_id;
    const gatewayTransactionId = payload.gateway_transaction_id || payload.dp_txn_id || payload.transaction_id || payload.reference_id;
    const status = (payload.status || (payload.success ? "completed" : "pending")).toLowerCase();
    const amount = parseFloat(payload.amount || payload.amountInPKR || 0);

    console.log("[DirectPay Webhook] Received notification:", {
      clientTransactionId,
      gatewayTransactionId,
      status,
      amount
    });

    return NextResponse.json({
      success: true,
      message: "DirectPay webhook processed successfully",
      client_transaction_id: clientTransactionId,
      gateway_transaction_id: gatewayTransactionId,
      status
    });
  } catch (err: any) {
    console.error("DirectPay webhook error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
