import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/gatewayConfig";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      cardNumber = "",
      cardHolder = "",
      expiry = "",
      cvv = "",
      email = "",
      phone = "",
      name = "",
      company = "",
      plan = "standard",
      billing = "monthly",
      users = 1
    } = body;

    // 1. Validate card fields
    const cleanCard = cardNumber.replace(/\s+/g, "");
    if (!cleanCard || cleanCard.length < 13 || cleanCard.length > 19) {
      return NextResponse.json({
        success: false,
        error: "Please enter a valid 15 or 16-digit credit/debit card number."
      }, { status: 400 });
    }

    const expiryParts = expiry.split("/");
    if (expiryParts.length !== 2) {
      return NextResponse.json({
        success: false,
        error: "Please enter a valid expiry date in MM/YY format."
      }, { status: 400 });
    }

    const expMonth = parseInt(expiryParts[0].trim(), 10);
    let expYear = parseInt(expiryParts[1].trim(), 10);
    if (isNaN(expMonth) || expMonth < 1 || expMonth > 12) {
      return NextResponse.json({
        success: false,
        error: "Invalid expiry month. Must be between 01 and 12."
      }, { status: 400 });
    }

    // Convert YY to YYYY if needed
    if (expYear < 100) {
      expYear += 2000;
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return NextResponse.json({
        success: false,
        error: "This card has expired. Please enter an active card."
      }, { status: 400 });
    }

    const cleanCvv = cvv.trim();
    if (!cleanCvv || cleanCvv.length < 3 || cleanCvv.length > 4) {
      return NextResponse.json({
        success: false,
        error: "Please enter a valid 3 or 4-digit CVV / CVC code."
      }, { status: 400 });
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({
        success: false,
        error: "Please enter a valid customer email address."
      }, { status: 400 });
    }

    // 2. Load Stripe Secret Key
    const stripeKey = getStripeSecretKey();

    if (!stripeKey || !stripeKey.startsWith("sk_")) {
      return NextResponse.json({
        success: false,
        error: "Stripe Payment Gateway is not configured with live API keys yet. Please add your Stripe Secret Key in Super Admin (/super-admin) > Payment Gateways or switch to DirectPay Card Gateway."
      }, { status: 400 });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16" as any
    });

    // 3. Calculate pricing
    let unitAmountCents = 1000; // default $10.00
    let productName = "Beraxis Standard Plan";
    let productDesc = "All 28 ERP/CRM modules, 1,500 Lead Credits/mo per user, cloud instance, and daily backups.";
    let interval: "month" | "year" = "month";
    const isAnnual = billing === "annual" || billing === "annually";

    if (plan === "leadspool" || plan === "leads-pool") {
      unitAmountCents = 1000; // $10.00 USD/mo
      productName = "Beraxis Leads Pool Solo (1,500 Contacts/mo)";
      productDesc = "Dedicated access to 25.8M+ Global B2B Leads Pool, direct dials, WhatsApp links, and 1,500 monthly export contacts.";
      interval = "month";
    } else if (plan === "standard") {
      if (isAnnual) {
        unitAmountCents = Math.round(users * 1200); // $12.00/yr per seat
        interval = "year";
        productName = `Beraxis Standard Plan - Annual (${users} seat${users > 1 ? 's' : ''})`;
      } else {
        unitAmountCents = Math.round(users * 500); // $5.00/mo per seat
        interval = "month";
        productName = `Beraxis Standard Plan - Monthly (${users} seat${users > 1 ? 's' : ''})`;
      }
    } else if (plan === "custom" || plan === "premium") {
      if (isAnnual) {
        unitAmountCents = Math.round(users * 44880);
        interval = "year";
        productName = `Beraxis Custom Enterprise - Annual (${users} seat${users > 1 ? 's' : ''})`;
      } else {
        unitAmountCents = Math.round(users * 4680);
        interval = "month";
        productName = `Beraxis Custom Enterprise - Monthly (${users} seat${users > 1 ? 's' : ''})`;
      }
    }

    // 4. Create Stripe PaymentMethod
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        number: cleanCard,
        exp_month: expMonth,
        exp_year: expYear,
        cvc: cleanCvv
      },
      billing_details: {
        name: cardHolder || name || "Beraxis Subscriber",
        email: email,
        phone: phone || undefined
      }
    });

    // 5. Create or find Stripe Customer
    const customer = await stripe.customers.create({
      email: email,
      name: cardHolder || name,
      payment_method: paymentMethod.id,
      invoice_settings: {
        default_payment_method: paymentMethod.id
      },
      metadata: {
        company: company,
        phone: phone,
        plan: plan,
        users: String(users)
      }
    });

    // 6. Create Subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
              description: productDesc,
              tax_code: "txcd_10300100"
            },
            unit_amount: unitAmountCents,
            recurring: {
              interval: interval
            }
          }
        }
      ],
      default_payment_method: paymentMethod.id,
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        customer_name: name,
        company: company,
        phone: phone,
        plan_tier: plan,
        billing_cycle: billing,
        users: String(users)
      }
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent;

    // Check if 3DS authentication is required by issuing bank
    if (paymentIntent && paymentIntent.status === "requires_action") {
      return NextResponse.json({
        success: true,
        requiresAction: true,
        clientSecret: paymentIntent.client_secret,
        actionUrl: paymentIntent.next_action?.redirect_to_url?.url,
        subscriptionId: subscription.id
      });
    }

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      customerId: customer.id,
      status: subscription.status,
      plan: plan
    });

  } catch (error: any) {
    console.error("[Stripe Charge Card Error]:", error);

    let userMsg = error.message || "Failed to process card payment with Stripe.";
    if (error.code === "card_declined") {
      userMsg = `Your card was declined by the bank. Reason: ${error.decline_code || "Transaction not allowed"}. Please try another card.`;
    } else if (error.code === "incorrect_cvc") {
      userMsg = "The CVV / Security code entered is incorrect.";
    } else if (error.code === "expired_card") {
      userMsg = "Your card has expired. Please use a card with a valid future expiry date.";
    } else if (error.code === "insufficient_funds") {
      userMsg = "Card has insufficient funds to complete this subscription.";
    }

    return NextResponse.json({
      success: false,
      error: userMsg
    }, { status: 400 });
  }
}
