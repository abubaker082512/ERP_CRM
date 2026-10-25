import { NextResponse } from "next/server";
import { INITIAL_QUOTA, DEFAULT_COMPANIES } from "@/lib/teamStorage";
import { CompanyEntity, MultiCompanyQuota } from "@/lib/teamTypes";

// In-memory quota store for the session/workspace
let currentQuota: MultiCompanyQuota = { ...INITIAL_QUOTA };

export async function GET() {
  return NextResponse.json({
    success: true,
    quota: currentQuota,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, company, addSeats } = body;

    if (action === "create_company") {
      if (currentQuota.companies.length >= currentQuota.maxCompanies) {
        return NextResponse.json(
          {
            success: false,
            error: `Maximum company limit reached (${currentQuota.maxCompanies} companies included in your ${currentQuota.planName}). Upgrade or add extra company capacity.`,
          },
          { status: 400 }
        );
      }

      const newCompany: CompanyEntity = {
        id: `CMP-${(currentQuota.companies.length + 1).toString().padStart(3, "0")}`,
        name: company.name || "New Subsidiary Enterprise",
        code: company.code || `SUB${currentQuota.companies.length + 1}`,
        industry: company.industry || "General Commerce",
        currency: company.currency || "USD ($)",
        timezone: company.timezone || "UTC-5 (EST / Miami)",
        isPrimary: false,
        createdAt: new Date().toISOString().split("T")[0],
      };

      currentQuota.companies = [...currentQuota.companies, newCompany];

      return NextResponse.json({
        success: true,
        message: `Company '${newCompany.name}' successfully provisioned!`,
        company: newCompany,
        quota: currentQuota,
      });
    }

    if (action === "add_seats") {
      const quantity = Math.max(1, parseInt(addSeats || 1, 10));
      currentQuota.totalSeats += quantity;
      currentQuota.availableSeats += quantity;

      return NextResponse.json({
        success: true,
        message: `Successfully added ${quantity} seat(s) to your workspace pool!`,
        quota: currentQuota,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
