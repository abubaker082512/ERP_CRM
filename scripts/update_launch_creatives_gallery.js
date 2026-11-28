const fs = require("fs");
const path = require("path");

const files = [
  path.join(__dirname, "../app/launch-creatives/page.tsx"),
  path.join(__dirname, "../frontend/app/launch-creatives/page.tsx"),
];

const newSection = `
            {/* NEW: 4 FULLY GENERATED 2026 PROMOTIONAL VIDEOS (WITH AI VOICEOVER) */}
            <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border-2 border-purple-500/40 shadow-2xl shadow-purple-500/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>NEW • 4 FULLY GENERATED MP4 PROMO VIDEOS (AI VOICEOVER + SUBTITLES)</span>
                  </div>
                  <h2 className="text-2xl font-black text-white">
                    15 Industries, 1-Click AI Business Auto-Setup & Call Center Video Pack
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Ready to upload directly to Instagram Reels, TikTok, YouTube Shorts, and LinkedIn Feed ($1.00/Mo Early Bird • 1 App Free Forever).
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                {[
                  {
                    title: "Reel 1: 1-Click 'Explain Your Business' AI Auto-Setup (9:16)",
                    file: "/social_media_assets/videos/reel_1_explain_business_ai_setup.mp4",
                    badge: "9:16 Vertical Reel",
                  },
                  {
                    title: "Reel 2: 15 Global Industries Showcase — $1/Mo OS (9:16)",
                    file: "/social_media_assets/videos/reel_2_15_industries_showcase.mp4",
                    badge: "9:16 Vertical Reel",
                  },
                  {
                    title: "Reel 3: Call Center Flow -> Warm Transfer -> Auto Sales Order (9:16)",
                    file: "/social_media_assets/videos/reel_3_call_center_to_cash_flow.mp4",
                    badge: "9:16 Vertical Reel",
                  },
                  {
                    title: "Full-HD 2026 Commercial: 15 Industries + Office + 25M Leads (16:9)",
                    file: "/social_media_assets/videos/commercial_beraxis_2026_full_hd.mp4",
                    badge: "16:9 Landscape HD",
                  },
                ].map((v, i) => (
                  <div key={i} className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500 text-white mb-2">{v.badge}</span>
                      <video controls playsInline preload="metadata" src={v.file} className="w-full rounded-xl border border-slate-800 bg-black max-h-[280px] object-contain" />
                      <h3 className="font-bold text-white text-sm mt-3">{v.title}</h3>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                      <a href={v.file} download className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-1.5 transition">
                        <Download className="w-3.5 h-3.5" />
                        <span>Download MP4</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* NEW: NEXT WEEK 7-DAY SOCIAL CONTENT CALENDAR (MON - SUN) */}
            <div className="pt-6 border-t border-slate-800">
              <h2 className="text-xl font-bold text-white">Next Week's 7-Day Multi-Channel Social Pack (Monday – Sunday)</h2>
              <p className="text-xs text-slate-400 mt-1">1080x1080 High-Contrast Cards featuring 1-Click AI Setup, Call Center Flow, Built-In Office, 25M+ Leads, 3.1s OCR & $1/Mo Early Bird.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-5">
                {[
                  { day: "Monday", title: "1-Click 'Explain Your Business' AI Auto-Setup", img: "/social_media_assets/next_week/day1_monday.png" },
                  { day: "Tuesday", title: "Call Center Flow -> Warm Transfer -> Sales Order", img: "/social_media_assets/next_week/day2_tuesday.png" },
                  { day: "Wednesday", title: "Built-In Office Suite (Excel, Word & PPT Inside ERP)", img: "/social_media_assets/next_week/day3_wednesday.png" },
                  { day: "Thursday", title: "25,000,000+ Built-In B2B Leads Pool on Day 1", img: "/social_media_assets/next_week/day4_thursday.png" },
                  { day: "Friday", title: "3.1-Second AI Invoice OCR & GAAP Accounting", img: "/social_media_assets/next_week/day5_friday.png" },
                  { day: "Saturday", title: "CEO Math: $960/Mo Legacy Stack vs $1/Mo BERAXIS AI", img: "/social_media_assets/next_week/day6_saturday.png" },
                  { day: "Sunday", title: "100+ Active Businesses Across 15 Global Industries", img: "/social_media_assets/next_week/day7_sunday.png" },
                ].map((d, i) => (
                  <div key={i} className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="relative rounded-xl overflow-hidden aspect-square border border-slate-800">
                        <img src={d.img} alt={d.title} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-black">{d.day}</span>
                      </div>
                      <h3 className="font-bold text-white text-sm mt-3">{d.title}</h3>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                      <span className="text-[11px] font-mono text-emerald-400">$1.00/Mo Early Bird</span>
                      <a href={d.img} download className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-1.5 transition">
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* NEW: ALL 15 GLOBAL INDUSTRY SOCIAL CARDS */}
            <div className="pt-6 border-t border-slate-800">
              <h2 className="text-xl font-bold text-white">All 15 Global Industry Archetype Social Posts (1080x1080)</h2>
              <p className="text-xs text-slate-400 mt-1">Tailored graphics for every vertical — Padel Clubs, Call Centers, Hotels, Agribusiness & Solar, Clinics, Restaurants, Garages, Real Estate, Retail, Construction, Schools, NGOs, Manufacturing, 3PL & Agencies.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-5">
                {[
                  { name: "01. Padel & Sports Clubs", img: "/social_media_assets/industries/industry_01_padel-sports-clubs.png" },
                  { name: "02. Call Centers & BPO", img: "/social_media_assets/industries/industry_02_call-centers-bpo.png" },
                  { name: "03. Hotels & Hospitality", img: "/social_media_assets/industries/industry_03_hospitality-hotels.png" },
                  { name: "04. Agribusiness & Solar EPC", img: "/social_media_assets/industries/industry_04_agriculture-agritech.png" },
                  { name: "05. Clinics & Pharmacies", img: "/social_media_assets/industries/industry_05_clinics-healthcare.png" },
                  { name: "06. Restaurants & Bakeries", img: "/social_media_assets/industries/industry_06_restaurants-cafes.png" },
                  { name: "07. Auto Repair Garages", img: "/social_media_assets/industries/industry_07_auto-repair-garages.png" },
                  { name: "08. Real Estate Agencies", img: "/social_media_assets/industries/industry_08_real-estate-agencies.png" },
                  { name: "09. Retail Supermarkets", img: "/social_media_assets/industries/industry_09_retail-supermarkets.png" },
                  { name: "10. Construction & EPC", img: "/social_media_assets/industries/industry_10_construction-epc.png" },
                  { name: "11. Schools & Academies", img: "/social_media_assets/industries/industry_11_schools-academies.png" },
                  { name: "12. NGOs & Nonprofits", img: "/social_media_assets/industries/industry_12_ngos-nonprofits.png" },
                  { name: "13. Manufacturing ERP", img: "/social_media_assets/industries/industry_13_manufacturing-erp.png" },
                  { name: "14. Logistics & 3PL Fleets", img: "/social_media_assets/industries/industry_14_logistics-3pl.png" },
                  { name: "15. Professional Services", img: "/social_media_assets/industries/industry_15_professional-services.png" },
                ].map((ind, i) => (
                  <div key={i} className="bg-slate-900/80 rounded-2xl p-3.5 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="relative rounded-xl overflow-hidden aspect-square border border-slate-800">
                        <img src={ind.img} alt={ind.name} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="font-bold text-white text-xs mt-2.5">{ind.name}</h3>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex justify-end">
                      <a href={ind.img} download className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-1 transition">
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
`;

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let src = fs.readFileSync(f, "utf8");
  if (!src.includes("industry_01_padel-sports-clubs.png")) {
    const marker = '{/* TAB 1: GRAPHICS */}';
    const target = '            </div>\n          </div>\n        )}';
    const targetCRLF = '            </div>\r\n          </div>\r\n        )}';
    if (src.includes(targetCRLF)) {
      src = src.replace(targetCRLF, '            </div>\r\n' + newSection + '\r\n          </div>\r\n        )}');
    } else if (src.includes(target)) {
      src = src.replace(target, '            </div>\n' + newSection + '\n          </div>\n        )}');
    }
    fs.writeFileSync(f, src, "utf8");
    console.log("Updated:", f);
  }
}
