// Automated Production Smoke Check for BERAXIS
const BASE = process.env.BERAXIS_URL || "https://www.beraxis.online";

const CHECKS = [
  { name: "Homepage", path: "/" },
  { name: "Login Page", path: "/login" },
  { name: "Signup Page", path: "/signup" },
  { name: "Pricing Page", path: "/pricing" },
  { name: "Docs Redirect", path: "/docs" },
  { name: "Sheets Redirect", path: "/sheets" },
  { name: "Products Redirect", path: "/products" },
  { name: "HR Redirect", path: "/hr" },
  { name: "Purchase RFQ Redirect", path: "/purchase/rfqs/new" },
  { name: "Auth Plan API", path: "/api/auth/plan?email=qa.human.test.1122@gmail.com", json: true },
  { name: "Lead Bank API", path: "/api/lead-bank?limit=5&skip=0&plan=free", json: true },
  { name: "Admin Overview API", path: "/api/admin/overview", json: true },
  { name: "Creem Webhook Health", path: "/api/payments/creem/webhook", json: true },
];

async function run() {
  let failed = 0;
  for (const c of CHECKS) {
    try {
      const res = await fetch(`${BASE}${c.path}`);
      if (!res.ok) {
        console.error(`FAIL [${res.status}] ${c.name} (${c.path})`);
        failed++;
        continue;
      }
      if (c.json) {
        await res.json();
      }
      console.log(`PASS [${res.status}] ${c.name}`);
    } catch (err) {
      console.error(`FAIL [ERR] ${c.name}: ${err.message}`);
      failed++;
    }
  }
  if (failed > 0) {
    console.error(`\n${failed} smoke check(s) failed.`);
    process.exit(1);
  }
  console.log(`\nAll ${CHECKS.length} smoke checks passed!`);
}

run();
