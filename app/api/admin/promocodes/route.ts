import { NextRequest, NextResponse } from "next/server";

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number; // e.g. 50 for 50%, or 100 for $100
  target_package: "all" | "standard" | "custom" | "starter";
  max_uses: number;
  used_count: number;
  min_order_amount?: number;
  expiry_date?: string;
  status: "active" | "paused" | "expired";
  created_at: string;
}

// In-memory / server-side seeded promo store
let GLOBAL_PROMOCODES: PromoCode[] = [
  {
    id: "promo_1",
    code: "BERAXIS100",
    description: "100% Full Access Launch Promo",
    discount_type: "percentage",
    discount_value: 100,
    target_package: "all",
    max_uses: 1000,
    used_count: 42,
    expiry_date: "2026-12-31",
    status: "active",
    created_at: "2026-01-01T00:00:00Z"
  },
  {
    id: "promo_2",
    code: "LAUNCH50",
    description: "50% Off Early Adopter Special",
    discount_type: "percentage",
    discount_value: 50,
    target_package: "all",
    max_uses: 500,
    used_count: 89,
    expiry_date: "2026-11-30",
    status: "active",
    created_at: "2026-02-01T00:00:00Z"
  },
  {
    id: "promo_3",
    code: "ENTERPRISE200",
    description: "$200 Flat Discount on Custom Enterprise",
    discount_type: "fixed_amount",
    discount_value: 200,
    target_package: "custom",
    max_uses: 100,
    used_count: 14,
    expiry_date: "2026-12-31",
    status: "active",
    created_at: "2026-03-01T00:00:00Z"
  },
  {
    id: "promo_4",
    code: "STANDARD25",
    description: "25% Off Standard Business Plan",
    discount_type: "percentage",
    discount_value: 25,
    target_package: "standard",
    max_uses: 250,
    used_count: 31,
    expiry_date: "2026-10-31",
    status: "active",
    created_at: "2026-04-01T00:00:00Z"
  }
];

// GET: List all promo codes OR validate a specific promo code for checkout
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const codeToValidate = searchParams.get("validate");
  const targetPackage = searchParams.get("package") || "all";
  const orderAmount = parseFloat(searchParams.get("amount") || "0");

  // Validate Promo Code mode
  if (codeToValidate) {
    const cleanCode = codeToValidate.trim().toUpperCase();
    const promo = GLOBAL_PROMOCODES.find(p => p.code.toUpperCase() === cleanCode);

    if (!promo) {
      return NextResponse.json({ valid: false, error: "Invalid promo code." }, { status: 404 });
    }

    if (promo.status !== "active") {
      return NextResponse.json({ valid: false, error: `Promo code is currently ${promo.status}.` }, { status: 400 });
    }

    if (promo.expiry_date && new Date(promo.expiry_date) < new Date()) {
      return NextResponse.json({ valid: false, error: "Promo code has expired." }, { status: 400 });
    }

    if (promo.max_uses > 0 && promo.used_count >= promo.max_uses) {
      return NextResponse.json({ valid: false, error: "Promo code usage limit has been reached." }, { status: 400 });
    }

    if (promo.target_package !== "all" && targetPackage !== "all" && promo.target_package !== targetPackage) {
      return NextResponse.json({
        valid: false,
        error: `This promo code is only applicable for the '${promo.target_package.toUpperCase()}' package.`
      }, { status: 400 });
    }

    if (promo.min_order_amount && orderAmount < promo.min_order_amount) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order amount of $${promo.min_order_amount} required to use this code.`
      }, { status: 400 });
    }

    // Calculate discount
    let calculatedDiscountUSD = 0;
    if (promo.discount_type === "percentage") {
      calculatedDiscountUSD = (orderAmount * promo.discount_value) / 100;
    } else {
      calculatedDiscountUSD = Math.min(orderAmount, promo.discount_value);
    }

    return NextResponse.json({
      valid: true,
      promo: {
        id: promo.id,
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        target_package: promo.target_package,
        calculatedDiscountUSD: parseFloat(calculatedDiscountUSD.toFixed(2)),
        description: promo.description
      }
    });
  }

  // Admin List Mode
  return NextResponse.json({
    success: true,
    total: GLOBAL_PROMOCODES.length,
    promocodes: GLOBAL_PROMOCODES
  });
}

// POST: Create New Promo Code (Super Admin)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      code,
      description = "Promotional Discount",
      discount_type = "percentage",
      discount_value,
      target_package = "all",
      max_uses = 100,
      min_order_amount = 0,
      expiry_date,
      status = "active"
    } = body;

    if (!code || !discount_value) {
      return NextResponse.json(
        { error: "Promo code and discount value are required." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");

    // Check duplicate
    if (GLOBAL_PROMOCODES.some(p => p.code.toUpperCase() === cleanCode)) {
      return NextResponse.json(
        { error: `Promo code '${cleanCode}' already exists.` },
        { status: 400 }
      );
    }

    const numValue = parseFloat(discount_value);
    if (isNaN(numValue) || numValue <= 0) {
      return NextResponse.json(
        { error: "Discount value must be a positive number." },
        { status: 400 }
      );
    }

    if (discount_type === "percentage" && numValue > 100) {
      return NextResponse.json(
        { error: "Percentage discount cannot exceed 100%." },
        { status: 400 }
      );
    }

    const newPromo: PromoCode = {
      id: `promo_${Date.now()}`,
      code: cleanCode,
      description: description.trim(),
      discount_type,
      discount_value: numValue,
      target_package,
      max_uses: parseInt(max_uses) || 0,
      used_count: 0,
      min_order_amount: parseFloat(min_order_amount) || 0,
      expiry_date: expiry_date || undefined,
      status,
      created_at: new Date().toISOString()
    };

    GLOBAL_PROMOCODES.unshift(newPromo);

    return NextResponse.json({
      success: true,
      message: `Promo code '${cleanCode}' created successfully!`,
      promo: newPromo
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create promo code." },
      { status: 500 }
    );
  }
}

// PUT: Update / Toggle Promo Code
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, discount_value, max_uses, target_package, description } = body;

    if (!id) {
      return NextResponse.json({ error: "Promo ID is required" }, { status: 400 });
    }

    const promoIndex = GLOBAL_PROMOCODES.findIndex(p => p.id === id);
    if (promoIndex === -1) {
      return NextResponse.json({ error: "Promo code not found" }, { status: 404 });
    }

    const current = GLOBAL_PROMOCODES[promoIndex];
    GLOBAL_PROMOCODES[promoIndex] = {
      ...current,
      status: status || current.status,
      discount_value: discount_value ? parseFloat(discount_value) : current.discount_value,
      max_uses: max_uses !== undefined ? parseInt(max_uses) : current.max_uses,
      target_package: target_package || current.target_package,
      description: description || current.description
    };

    return NextResponse.json({
      success: true,
      message: `Promo code updated successfully`,
      promo: GLOBAL_PROMOCODES[promoIndex]
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update promo code" },
      { status: 500 }
    );
  }
}

// DELETE: Remove Promo Code
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Promo ID is required" }, { status: 400 });
    }

    const initialLength = GLOBAL_PROMOCODES.length;
    GLOBAL_PROMOCODES = GLOBAL_PROMOCODES.filter(p => p.id !== id);

    if (GLOBAL_PROMOCODES.length === initialLength) {
      return NextResponse.json({ error: "Promo code not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Promo code deleted successfully"
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete promo code" },
      { status: 500 }
    );
  }
}
