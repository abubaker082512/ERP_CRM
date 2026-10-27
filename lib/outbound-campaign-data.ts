export interface OutboundSequenceTemplate {
  id: string;
  step: number;
  name: string;
  subject: string;
  body: string;
  delayDays: number;
  category: "comparison" | "leads" | "trial";
}

export interface TargetAudiencePersona {
  id: string;
  name: string;
  targetIndustries: string[];
  targetCountries: string[];
  targetTitles: string[];
  suggestedSequenceId: string;
  hook: string;
}

export const TARGET_PERSONAS: TargetAudiencePersona[] = [
  {
    id: "smb-founders-us-uk",
    name: "SMB Founders & CEOs (US & UK)",
    targetIndustries: ["SaaS / Cloud Infrastructure", "Professional Services", "Retail & Supermarkets", "Supply Chain & Logistics"],
    targetCountries: ["United States", "United Kingdom"],
    targetTitles: ["Chief Executive Officer", "Founder", "Co-Founder", "Managing Director", "Owner"],
    suggestedSequenceId: "saas-tax-breakdown",
    hook: "Ditching the $400/month SaaS tax for a unified $1/month cloud cockpit."
  },
  {
    id: "middle-east-enterprises",
    name: "GCC & Middle East High-Growth Leaders",
    targetIndustries: ["Construction & Real Estate", "Supply Chain & Logistics", "Automotive & Fleet", "Healthcare & Clinics"],
    targetCountries: ["United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait"],
    targetTitles: ["Managing Director", "General Manager", "VP of Operations", "Chief Executive Officer"],
    suggestedSequenceId: "leads-pool-accelerator",
    hook: "Pre-verified B2B decision makers to scale regional outreach without third-party scrapers."
  },
  {
    id: "retail-dining-operators",
    name: "Retail & F&B Multi-Unit Operators",
    targetIndustries: ["Bakeries & Restaurants", "Retail & Supermarkets", "Sports Clubs & Gyms"],
    targetCountries: ["United States", "United Kingdom", "Canada", "Germany"],
    targetTitles: ["Owner", "Managing Partner", "General Manager", "Director of Operations"],
    suggestedSequenceId: "pos-inventory-unification",
    hook: "Unified touch POS, kitchen displays, and double-entry accounting in one app for $1/mo."
  }
];

export const OUTBOUND_TEMPLATES: OutboundSequenceTemplate[] = [
  {
    id: "saas-tax-breakdown",
    step: 1,
    name: "The $400/Mo SaaS Tax Breakdown (Touch 1)",
    category: "comparison",
    delayDays: 0,
    subject: "Quick question regarding {{company_name}}'s software stack",
    body: `Hi {{contact_name}},

I noticed your team at {{company_name}} is scaling operations in {{city}}.

Most founders we speak with are frustrated by the "SaaS Tax": paying $85/mo for QuickBooks, $50/mo per user for HubSpot, and another $100/mo for third-party B2B contact scrapers like Apollo or ZoomInfo.

We built Beraxis (https://www.beraxis.online) to unify your entire operating system into one lightning-fast command center:
• Real-time double-entry accounting & balance sheets
• Visual sales Kanban CRM pipeline
• Built-in directory of 25,000,000+ verified B2B leads with buying intent scores
• Touch POS & multi-warehouse inventory

All for just $1.00/month on our Early Bird plan (or 1 App 100% Free Forever with no credit card required).

Would you be open to a 3-minute look to see how it compares to your current setup?

Best regards,
The Beraxis Growth Team
https://www.beraxis.online

---
Beraxis Systems Inc. • 1309 Coffeen Ave, Sheridan, WY 82801
To unsubscribe: {{unsubscribe_url}}`
  },
  {
    id: "leads-pool-accelerator",
    step: 2,
    name: "The Built-in Leads Engine (Touch 2)",
    category: "leads",
    delayDays: 3,
    subject: "Verified B2B leads for {{company_name}}",
    body: `Hi {{contact_name}},

Following up on my previous note. One specific feature that our customers in {{industry}} love is that they never have to buy external B2B lead lists again.

Inside your Beraxis cockpit, you have immediate access to our Global Leads Pool:
• 25,000,000+ verified executive emails and phone numbers
• Filter by country, employee headcount, and AI intent scoring
• 1-Click ingestion directly into your visual sales CRM pipeline

You can test-drive the live leads pool showcase here:
👉 https://www.beraxis.online/leads-pool

Let me know if you would like me to set up a free workspace pre-configured for {{company_name}}.

Best,
The Beraxis Growth Team
https://www.beraxis.online

---
Beraxis Systems Inc. • 1309 Coffeen Ave, Sheridan, WY 82801
To unsubscribe: {{unsubscribe_url}}`
  },
  {
    id: "trial-closeout",
    step: 3,
    name: "Permission to close your file? (Touch 3 - Break-up)",
    category: "trial",
    delayDays: 6,
    subject: "Permission to close file on {{company_name}}?",
    body: `Hi {{contact_name}},

I don't want to clutter your inbox if unifying your CRM and ERP isn't a priority for {{company_name}} right now.

If you ever want to test an enterprise-grade ERP without the $15,000 consultant onboarding fees or per-user penalties, you can claim 1 App 100% Free Forever anytime:

👉 https://www.beraxis.online/signup

Should I check back in Q3, or are you all set with your current stack?

Cheers,
The Beraxis Growth Team
https://www.beraxis.online

---
Beraxis Systems Inc. • 1309 Coffeen Ave, Sheridan, WY 82801
To unsubscribe: {{unsubscribe_url}}`
  }
];

export function personalizeOutboundTemplate(
  template: OutboundSequenceTemplate,
  lead: {
    contact_name: string;
    company_name: string;
    city?: string;
    industry?: string;
    email?: string;
  }
): { subject: string; body: string } {
  const city = lead.city || "your region";
  const industry = lead.industry || "your industry";
  const contact = lead.contact_name || "there";
  const company = lead.company_name || "your company";
  const unsubUrl = `https://www.beraxis.online/api/admin/outbound-campaign?action=unsubscribe&email=${encodeURIComponent(lead.email || "")}`;

  let subject = template.subject
    .replace(/\{\{contact_name\}\}/g, contact)
    .replace(/\{\{company_name\}\}/g, company)
    .replace(/\{\{city\}\}/g, city)
    .replace(/\{\{industry\}\}/g, industry);

  let body = template.body
    .replace(/\{\{contact_name\}\}/g, contact)
    .replace(/\{\{company_name\}\}/g, company)
    .replace(/\{\{city\}\}/g, city)
    .replace(/\{\{industry\}\}/g, industry)
    .replace(/\{\{unsubscribe_url\}\}/g, unsubUrl);

  return { subject, body };
}
