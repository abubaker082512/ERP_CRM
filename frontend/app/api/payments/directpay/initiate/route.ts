import { NextRequest, NextResponse } from "next/server";
import { buildDirectPayUrl, normalizeDirectPayPhone, DIRECTPAY_DEFAULT_CLIENT_ID } from "@/lib/directPayClient";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amountInPKR,
      description = "Beraxis ERP Services",
      payer_name = "Beraxis Client",
      email = "billing@beraxis.online",
      msisdn,
      currency = "PKR",
      return_url,
      custom_tx_id
    } = body;

    const numAmount = parseFloat(amountInPKR);
    if (isNaN(numAmount) || numAmount < 10 || numAmount > 50000) {
      return NextResponse.json(
        { error: "DirectPay amount must be between 10.00 and 50,000.00 PKR" },
        { status: 400 }
      );
    }

    const clientTransactionId = custom_tx_id || `BERAXIS-TXN-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Host determination for redirects
    const origin = req.headers.get("origin") || req.headers.get("referer") || "https://erp-crm-puce.vercel.app";
    const cleanOrigin = origin.replace(/\/$/, "");

    const successRedirectUrl = return_url 
      ? `${return_url}?dp_status=success&txn_id=${encodeURIComponent(clientTransactionId)}&amount=${encodeURIComponent(numAmount)}`
      : `${cleanOrigin}/checkout?dp_status=success&txn_id=${encodeURIComponent(clientTransactionId)}&amount=${encodeURIComponent(numAmount)}`;

    const failedRedirectUrl = return_url 
      ? `${return_url}?dp_status=failed&txn_id=${encodeURIComponent(clientTransactionId)}`
      : `${cleanOrigin}/checkout?dp_status=failed&txn_id=${encodeURIComponent(clientTransactionId)}`;

    const paymentUrl = buildDirectPayUrl({
      clientTransactionId,
      amountInPKR: numAmount,
      description,
      payerName: payer_name,
      email,
      msisdn: msisdn || "03001234567",
      currency,
      successRedirectUrl,
      failedRedirectUrl
    });

    return NextResponse.json({
      success: true,
      paymentUrl,
      clientTransactionId,
      amountInPKR: numAmount,
      currency,
      clientId: DIRECTPAY_DEFAULT_CLIENT_ID
    });
  } catch (error: any) {
    console.error("DirectPay initiate error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate DirectPay payment session" },
      { status: 500 }
    );
  }
}
