export interface IndustryFAQ {
  q: string;
  a: string;
}

export interface IndustryData {
  slug: string;
  name: string;
  h1: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  themeColor: string;
  accentColor: string;
  badge: string;
  painPoints: { title: string; desc: string }[];
  solutions: { title: string; desc: string }[];
  keyFeatures: { title: string; desc: string }[];
  operationModes: { badge: string; name: string; desc: string }[];
  departments: string[];
  roles: string[];
  faqs: IndustryFAQ[];
}

export const INDUSTRIES_MAP: Record<string, IndustryData> = {
  "padel-clubs": {
    slug: "padel-clubs",
    name: "Padel & Sports Clubs",
    h1: "ERP for Padel Clubs & Sports Centers",
    tagline: "Court Bookings, Member Subscriptions & Pro-Shop POS",
    metaTitle: "ERP for Padel Clubs & Sports Centers | Beraxis AI",
    metaDescription: "Streamline court booking calendars, padel racket rental POS, tournament ladders, and recurring membership billing. Automated sports club ERP for $1/month.",
    keywords: [
      "ERP for padel clubs",
      "padel court booking software",
      "automated gym management software",
      "sports club management software",
      "padel pro shop POS",
      "tennis club membership software",
      "padel league tournament management"
    ],
    themeColor: "from-sky-500 to-indigo-600",
    accentColor: "text-sky-400",
    badge: "🎾 Racket & Sports Operations",
    painPoints: [
      {
        title: "Double-Booked Courts & Manual WhatsApp Scheduling",
        desc: "Managing court slots across WhatsApp and paper ledgers leads to chaotic double-bookings, angry members, and wasted peak evening court hours."
      },
      {
        title: "Disconnected Pro-Shop & Court Rental Invoicing",
        desc: "Using separate card machines for ball/racket rentals and separate spreadsheets for membership dues burns hours on manual end-of-day reconciliations."
      },
      {
        title: "High Churn & Uncollected Membership Dues",
        desc: "Failed subscription renewals and unmonitored court credits result in 15-20% uncollected dues every quarter."
      }
    ],
    solutions: [
      {
        title: "Real-Time Multi-Court Drag-and-Drop Calendar",
        desc: "Visual interactive court scheduling for indoor, outdoor, and panoramic padel courts with automated split-bill payments and lighting automation."
      },
      {
        title: "Unified Pro-Shop POS & Equipment Rentals",
        desc: "Scan racket rentals, ball cans, grips, and beverages with instant barcode POS that syncs inventory and charges directly to player tabs."
      },
      {
        title: "Automated Recurring Memberships & WhatsApp Alerts",
        desc: "Collect monthly subscriptions automatically via Stripe, send automated WhatsApp match reminders, and fill empty court hours with targeted promotions."
      }
    ],
    keyFeatures: [
      { title: "Dynamic Court Booking Engine", desc: "60, 90, and 120-minute slot increments with dynamic peak/off-peak pricing." },
      { title: "Automated Player Split-Bills", desc: "Let all 4 players pay their exact 25% share via mobile link before entering the court." },
      { title: "Pro Shop Barcode Terminal", desc: "Sell drinks, apparel, and padel gear with live inventory depletion." },
      { title: "Tournament & Ladder Brackets", desc: "Americano, Mexicano, and knockout tournament brackets generated automatically." },
      { title: "25M+ B2B Leads Engine", desc: "Find corporate sponsors, local businesses, and company tournament clients." },
      { title: "Double-Entry Financial Ledgers", desc: "Audit-ready revenue recognition for prepayments, packages, and court credits." }
    ],
    operationModes: [
      { badge: "🎾 Padel & Rackets", name: "Court Scheduler Mode", desc: "4-player split payments, lighting relay triggers, and rental racket tracking." },
      { badge: "🏋️ Gym & Fitness", name: "Turnstile Gate Mode", desc: "QR/barcode access control, trainer PT slots, and recurring membership drafts." },
      { badge: "🏆 Academy", name: "Junior & Pro Coaching", desc: "Class attendance registers, coach payroll splits, and clinic packages." }
    ],
    departments: ["Court Operations", "Pro Shop Retail", "Academy & Coaching", "Club Cafe & Bar", "Member Relations"],
    roles: ["Club General Manager", "Head Padel Coach", "Front Desk Receptionist", "Pro Shop Cashier", "Barista / Cafe Server"],
    faqs: [
      {
        q: "Can Beraxis handle 4-way split bills for padel matches?",
        a: "Yes. When a court is booked, Beraxis can divide the total court fee equally across 4 registered players. Each player receives a payment link or can pay at the front desk POS."
      },
      {
        q: "Does it support turnstiles, magnetic doors, or lighting relays?",
        a: "Yes. Beraxis includes webhook and API relays that can automatically activate court lighting 5 minutes before game time and shut off when the slot expires."
      },
      {
        q: "How much does Beraxis cost for a padel club?",
        a: "Beraxis costs just $1/month ($12 billed annually) with our Early Bird Plan, unlocking all 28 modules, unlimited user seats, and court management tools with zero per-booking commission fees."
      }
    ]
  },

  "dental-clinics": {
    slug: "dental-clinics",
    name: "Dental & Healthcare Clinics",
    h1: "Dental Clinic Management Software & EMR",
    tagline: "Patient Records, Dental Charts, Appointments & Recall Automation",
    metaTitle: "Dental Clinic Management Software & Patient EMR | Beraxis AI",
    metaDescription: "Cloud dental practice management software with graphical tooth charts, automated SMS/WhatsApp recall reminders, lab order tracking, and patient billing for $1/month.",
    keywords: [
      "dental clinic management software",
      "dental practice management ERP",
      "dental EMR software",
      "patient appointment booking dental",
      "dental charting software cloud",
      "medical clinic ERP",
      "clinic billing and prescription software"
    ],
    themeColor: "from-teal-500 to-cyan-600",
    accentColor: "text-teal-400",
    badge: "🦷 Healthcare & Clinical Operations",
    painPoints: [
      {
        title: "No-Shows and Broken Recall Appointments",
        desc: "Unconfirmed appointments and missed 6-month checkup recalls drain thousands of dollars from clinic chair productivity."
      },
      {
        title: "Scattered Patient Charts, Lab Slips & X-Rays",
        desc: "Juggling third-party imaging, paper lab order slips, and fragmented billing software causes administrative gridlock."
      },
      {
        title: "Per-Practitioner SaaS Tax",
        desc: "Legacy dental software vendors charge $250 to $500 per dentist per month, punishing clinics for hiring associate practitioners."
      }
    ],
    solutions: [
      {
        title: "Automated WhatsApp & SMS Recalls",
        desc: "Intelligent automated appointment reminders with 1-click confirmation cut clinic no-show rates by up to 45%."
      },
      {
        title: "Interactive Graphical Odontogram Charting",
        desc: "Click-to-chart adult and pediatric tooth charts, periodontal probing depths, treatment plans, and digital lab prescription slips."
      },
      {
        title: "Unlimited Practitioners for $1/Month",
        desc: "Add all your dentists, hygienists, dental assistants, and front desk receptionists under one subscription with zero per-chair surcharges."
      }
    ],
    keyFeatures: [
      { title: "Graphical Dental Chart (Odontogram)", desc: "Chart restorations, crowns, extractions, endo, and implants in seconds." },
      { title: "Smart Appointment Schedule", desc: "Color-coded by practitioner, operatory chair, and procedure duration." },
      { title: "Dental Lab Tracking", desc: "Track outside lab case dispatches, return dates, and patient delivery statuses." },
      { title: "Multi-Tier Treatment Plans", desc: "Print elegant treatment estimates with staged payment plans for patients." },
      { title: "Dental Consumables Inventory", desc: "Track composites, anesthetics, and implants with lot expiration warnings." },
      { title: "Voice Clinical Notes", desc: "Dictate post-op notes directly into the patient EMR hands-free between patients." }
    ],
    operationModes: [
      { badge: "🦷 Dental Practice", name: "Operatory Mode", desc: "Dental chair assignment, odontogram charting, and treatment staging." },
      { badge: "⚕️ Multi-Specialty Clinic", name: "EMR Mode", desc: "Doctor consultation queues, vitals capture, and pharmacy prescriptions." },
      { badge: "💆 Aesthetic & MedSpa", name: "Spa Mode", desc: "Treatment packages, consumable batch tracking, and aesthetic consent forms." }
    ],
    departments: ["Clinical / Operatories", "Front Desk Reception", "Dental Hygiene", "Lab & Sterilization", "Billing & Insurance"],
    roles: ["Lead Dentist", "Associate Dentist", "Dental Hygienist", "Dental Assistant", "Practice Administrator"],
    faqs: [
      {
        q: "Can I manage multiple dental chairs or operatories simultaneously?",
        a: "Yes. The scheduler displays a multi-column chair view allowing your front desk to allocate patients to specific operatories and dentists without scheduling conflicts."
      },
      {
        q: "Does Beraxis include patient recall automation?",
        a: "Yes. Beraxis automatically schedules and dispatches 6-month cleaning recalls and follow-up treatment alerts via WhatsApp and email."
      },
      {
        q: "Is patient medical data secure?",
        a: "All records are protected with AES-256 encryption at rest, TLS 1.3 transit encryption, and strict role-based access control complying with healthcare data privacy standards."
      }
    ]
  },

  "bakeries-restaurants": {
    slug: "bakeries-restaurants",
    name: "Bakeries & Food Service",
    h1: "Bakery & Restaurant POS System with Recipe BOM",
    tagline: "Touch POS, Kitchen Displays (KDS), Recipe Costing & Batch Production",
    metaTitle: "Bakery & Restaurant POS System with Recipe BOM Costing | Beraxis AI",
    metaDescription: "All-in-one food service ERP: high-speed touchscreen POS, Kitchen Display System (KDS), ingredient yield costing, batch production orders, and table management for $1/month.",
    keywords: [
      "bakery POS software",
      "restaurant management ERP",
      "recipe BOM costing software",
      "kitchen display system KDS",
      "artisan bakery software",
      "cafe point of sale cloud",
      "restaurant inventory and recipe costing"
    ],
    themeColor: "from-amber-500 to-orange-600",
    accentColor: "text-amber-400",
    badge: "🥐 Artisan Baking & Restaurant Operations",
    painPoints: [
      {
        title: "Flour, Butter & Ingredient Cost Leakages",
        desc: "Without exact recipe Yield and Bill of Materials (BOM) tracking, rising ingredient costs quietly decimate bakery and restaurant margins."
      },
      {
        title: "Lost Kitchen Tickets and Slow Order Dispatch",
        desc: "Noisy paper kitchen printers run out of paper, drop tickets, and cause miscommunication between servers and line cooks."
      },
      {
        title: "Extortionate POS Add-on Fees (Toast & Square)",
        desc: "Toast and Square charge hundreds of dollars for KDS screens, loyalty addons, and online ordering, eating up 3-5% of total gross sales."
      }
    ],
    solutions: [
      {
        title: "Ingredient-Level Recipe BOM Costing",
        desc: "Enter raw flour, yeast, butter, and milk quantities. Beraxis calculates exact per-croissant unit cost and updates gross profit margins dynamically."
      },
      {
        title: "Real-Time Kitchen Display System (KDS)",
        desc: "Orders from touch POS terminals route instantly to colored kitchen station screens with course timers and buzzer alerts."
      },
      {
        title: "Complete Restaurant Cockpit for $1/Month",
        desc: "Get POS, KDS, recipes, table floor plans, supplier purchasing, and double-entry accounting in one platform without modular price gouging."
      }
    ],
    keyFeatures: [
      { title: "High-Speed Touch POS", desc: "Designed for rapid morning rush lines with modifiers, combos, and barcode lookup." },
      { title: "Interactive Kitchen Display (KDS)", desc: "Cook timers, order bumps, course holds, and station filters (Bakery, Grill, Bar)." },
      { title: "Batch Production & Baking Schedules", desc: "Plan morning sourdough and pastry bake counts from forward pre-orders." },
      { title: "Interactive Table Floor Plan", desc: "Drag-and-drop table layouts, split bills by seat, and table transfer timers." },
      { title: "Wastage & Spoilage Tracking", desc: "Record daily end-of-day food waste and write off costs to accurate GL accounts." },
      { title: "Omnichannel Takeaway & Dine-In", desc: "Switch seamlessly between dine-in table orders and takeaway token counter queues." }
    ],
    operationModes: [
      { badge: "🥐 Bakery & Pastry", name: "Counter & Production", desc: "Weigh scale integration, production batch runs, and takeaway token slips." },
      { badge: "🍽️ Dine-In Restaurant", name: "Table & Floor Plan", desc: "Course-by-course firing, seat splits, and waiter handheld ordering." },
      { badge: "🚀 Cloud Kitchen", name: "KDS Delivery Hub", desc: "High-volume station dispatch and delivery driver pickup timers." }
    ],
    departments: ["Kitchen / Bakery Production", "Front of House / Counter", "Bar & Beverage", "Procurement & Receiving", "Store Management"],
    roles: ["Head Baker", "Sous Chef", "Head Barista", "Floor Manager", "Cashier / Counter Server"],
    faqs: [
      {
        q: "Does Beraxis POS support Kitchen Display Screens (KDS)?",
        a: "Yes. Any tablet, monitor, or smart TV can run the Beraxis KDS screen directly in a browser with audio dings and color-coded wait timers."
      },
      {
        q: "How does ingredient deduction work on menu items?",
        a: "Each menu item links to a Bill of Materials (BOM) recipe. When a pizza or croissant sells at the POS, the exact flour, cheese, and butter amounts deduct from raw stock immediately."
      },
      {
        q: "Can I use my existing barcode scanner and receipt printer?",
        a: "Yes. Beraxis supports standard ESC/POS thermal receipt printers (USB, Network, Bluetooth) and standard barcode scanners."
      }
    ]
  },

  "automotive-garages": {
    slug: "automotive-garages",
    name: "Automotive Workshops & Garages",
    h1: "Auto Repair Shop & Garage Management Software",
    tagline: "Digital Job Cards, VIN Lookup, Parts Inventory & Technician Timesheets",
    metaTitle: "Auto Repair Shop & Garage Management Software | Beraxis AI",
    metaDescription: "All-in-one auto repair shop software: digital job cards, VIN vehicle history lookup, mechanic labor rates, spare parts inventory, and invoicing for $1/month.",
    keywords: [
      "auto repair shop software",
      "garage management software",
      "mechanic job card software",
      "auto workshop ERP",
      "auto parts inventory software",
      "car repair billing software",
      "automotive service center management"
    ],
    themeColor: "from-blue-600 to-indigo-700",
    accentColor: "text-blue-400",
    badge: "🚗 Automotive & Fleet Maintenance",
    painPoints: [
      {
        title: "Lost Mechanic Labor Hours & Paper Job Cards",
        desc: "Greasy paper job cards get misplaced, and unlogged labor hours lead to underbilled customer repair invoices."
      },
      {
        title: "Dead Stock in Spare Parts & Oil Inventories",
        desc: "Without exact vehicle compatibility matching and reorder triggers, garages tie up tens of thousands in obsolete spare parts."
      },
      {
        title: "Customer Distrust on Repair Estimates",
        desc: "Customers hesitate to approve repair recommendations without clear photographic inspection reports and transparent itemized estimates."
      }
    ],
    solutions: [
      {
        title: "Digital Job Cards & Mechanic Time Tracking",
        desc: "Mechanics clock into specific repair operations from tablets, capturing exact billable labor minutes with zero paper waste."
      },
      {
        title: "Automated Parts Markup & Cross-Reference",
        desc: "Scan OEM and aftermarket parts into repair orders with automatic markup formulas and real-time inventory deduction."
      },
      {
        title: "Digital Vehicle Inspections with Photos",
        desc: "Send interactive vehicle health inspection reports with photos via WhatsApp for 1-click customer repair authorization."
      }
    ],
    keyFeatures: [
      { title: "Digital Job Card Workflow", desc: "Track vehicles from Check-In, Diagnosis, Parts Waiting, In-Progress to Road Test." },
      { title: "VIN & License Plate History", desc: "Pull complete past service histories, oil changes, and previous notes in seconds." },
      { title: "Labor Guide & Standard Hours", desc: "Set standard labor rates per hour with mechanic commission bonus splits." },
      { title: "Auto Parts Inventory Matrix", desc: "Cross-reference OEM part numbers with min/max stock reorders." },
      { title: "WhatsApp Estimate Approvals", desc: "Send itemized repair estimates straight to customer smartphones for instant approval." },
      { title: "Voice Diagnostic Notes", desc: "Mechanics dictate vehicle diagnosis while hands remain under the hood." }
    ],
    operationModes: [
      { badge: "🚗 Auto Repair", name: "Service Bay Mode", desc: "Bay allocation, technician labor clocking, and parts dispatch." },
      { badge: "🛞 Tire & Lube", name: "Quick Service Mode", desc: "Fast-lane oil change, tire tread depth tracking, and torque wrench checklists." },
      { badge: "🚛 Fleet Maintenance", name: "Commercial Fleet Mode", desc: "Preventive maintenance schedules, mileage triggers, and corporate invoicing." }
    ],
    departments: ["Service Bays / Workshop", "Parts & Warehousing", "Service Advisors / Front Desk", "Road Testing & QA", "Fleet Billing"],
    roles: ["Workshop Foreman", "Master Diagnostic Technician", "Service Advisor", "Parts Manager", "Auto Electrician"],
    faqs: [
      {
        q: "Can mechanics log hours directly on a tablet?",
        a: "Yes. Mechanics can tap to start and pause labor timers on individual job cards from any smartphone or rugged shop tablet."
      },
      {
        q: "Does Beraxis support customer estimate approval via WhatsApp?",
        a: "Yes. When a quote is ready, Beraxis sends a secure interactive link via WhatsApp where the customer can tap 'Approve Repair'."
      },
      {
        q: "Can I manage fleet commercial accounts with 30-day terms?",
        a: "Yes. Beraxis includes full corporate accounts receivable with credit limits, recurring billing cycles, and automated statement generation."
      }
    ]
  },

  "real-estate": {
    slug: "real-estate",
    name: "Real Estate & Property Management",
    h1: "Real Estate Property Management & Lease ERP",
    tagline: "Lease Contracts, Tenant Portals, Unit Maintenance & Agent Commissions",
    metaTitle: "Real Estate & Property Management ERP | Beraxis AI",
    metaDescription: "Streamline lease contracts, tenant rent collection, unit maintenance tickets, property listings, and agent commission splits in one unified ERP for $1/month.",
    keywords: [
      "real estate property management software",
      "lease management ERP",
      "tenant rent collection software",
      "property maintenance tracking software",
      "brokerage commission tracking",
      "commercial real estate software",
      "Beraxis real estate"
    ],
    themeColor: "from-blue-700 to-cyan-700",
    accentColor: "text-cyan-300",
    badge: "🏢 Property Management & Brokerage",
    painPoints: [
      {
        title: "Overdue Tenant Rent & Delayed Late Fees",
        desc: "Tracking hundreds of lease expiries and manual wire transfers across separate spreadsheets causes delayed rent collections."
      },
      {
        title: "Lost Maintenance Work Orders & Contractor Overcharges",
        desc: "Tenant leak and HVAC complaints get buried in emails, resulting in contractor invoices exceeding approved maintenance budgets."
      },
      {
        title: "Disputed Agent Commission Splits",
        desc: "Complex tiered commission structures cause internal friction when closing multi-party sales transactions."
      }
    ],
    solutions: [
      {
        title: "Automated Lease Billing & Payment Gateways",
        desc: "Auto-generate monthly rent invoices, collect payments online via Stripe or bank transfer, and enforce automated late fee calculations."
      },
      {
        title: "Digital Maintenance Ticketing & Vendor Dispatch",
        desc: "Tenants submit repair tickets with photos; property managers dispatch approved contractors with budget caps."
      },
      {
        title: "Transparent Brokerage Commission Engine",
        desc: "Calculate tiered agent splits, desk fees, and agency royalties automatically upon escrow closing."
      }
    ],
    keyFeatures: [
      { title: "Unit & Building Property Matrix", desc: "Track occupied, vacant, and under-maintenance units across multiple developments." },
      { title: "Lease Contract Generator", desc: "Automate lease agreements, security deposit escrows, and renewal escalations." },
      { title: "Tenant Portal & Rent Collection", desc: "Tenants view payment histories, download tax invoices, and submit maintenance tickets." },
      { title: "Vendor Work Order Budgeting", desc: "Issue approved maintenance work orders with contractor invoice reconciliation." },
      { title: "25M+ Property Investor Leads", desc: "Discover high-net-worth commercial buyers and corporate tenants from the leads pool." },
      { title: "Full Trust & Escrow Accounting", desc: "Segregate owner distributions, security deposits, and operating accounts." }
    ],
    operationModes: [
      { badge: "🏢 Commercial Property", name: "CAM & Triple Net Mode", desc: "Common Area Maintenance (CAM) reconciliations, square-meter billing, and lease tiers." },
      { badge: "🏡 Residential Leasing", name: "Apartment & Villa Mode", desc: "Rent recurring drafts, move-in/out checklists, and utility meter billings." },
      { badge: "🤝 Brokerage & Sales", name: "Deal Pipeline Mode", desc: "Listing syndication, open house CRM, and automated agent commission tiers." }
    ],
    departments: ["Leasing & Tenant Relations", "Property Maintenance", "Brokerage Sales", "Owner Accounts & Escrow", "Asset Management"],
    roles: ["Property Portfolio Director", "Leasing Agent", "Facilities & Maintenance Manager", "Real Estate Broker", "Escrow Accountant"],
    faqs: [
      {
        q: "Does Beraxis support both residential and commercial lease structures?",
        a: "Yes. You can manage residential fixed leases as well as commercial Triple Net (NNN) leases with percentage rent and CAM expense allocations."
      },
      {
        q: "Can owners receive automated monthly payout statements?",
        a: "Yes. Beraxis automatically calculates collected rents minus management fees and maintenance expenses, generating an owner distribution statement."
      },
      {
        q: "Can tenants pay rent online?",
        a: "Yes. Tenants receive an automated invoice link each billing cycle to pay via debit/credit card, bank transfer, or corporate billing."
      }
    ]
  },

  "retail-supermarkets": {
    slug: "retail-supermarkets",
    name: "Retail & Supermarkets",
    h1: "Retail POS & Supermarket Inventory Management",
    tagline: "Barcode Scanners, Multi-Store Stock Transfers & Customer Loyalty",
    metaTitle: "Retail POS & Supermarket Inventory Management Software | Beraxis AI",
    metaDescription: "High-speed retail POS software for supermarkets, boutiques, and multi-store chains. Fast barcode scanning, variant matrices, and lot expiry tracking for $1/month.",
    keywords: [
      "retail POS software",
      "supermarket inventory management",
      "barcode scanner POS software",
      "multi store retail ERP",
      "inventory variant matrix software",
      "grocery store point of sale",
      "omnichannel retail software"
    ],
    themeColor: "from-emerald-500 to-green-700",
    accentColor: "text-emerald-400",
    badge: "🛍️ Multi-Store Retail & Supermarkets",
    painPoints: [
      {
        title: "Slow Checkout Lines & Barcode Glitches",
        desc: "Sluggish POS systems cause cart abandonment, irritated customers, and checkout bottlenecks during peak retail hours."
      },
      {
        title: "Shrinkage & Uncounted Store Transfers",
        desc: "Transferring items between multiple store locations without centralized serial/lot tracking causes rampant inventory leakage."
      },
      {
        title: "Fragmented Offline POS and E-Commerce Inventory",
        desc: "Selling an item in-store while an online shopper orders the same item causes awkward cancellations and disappointed customers."
      }
    ],
    solutions: [
      {
        title: "High-Speed Offline-Resilient POS",
        desc: "Ring up 20+ items per minute with sub-second barcode recognition. If the internet drops, checkout continues seamlessly and syncs when back online."
      },
      {
        title: "Multi-Store Inter-Branch Stock Transfers",
        desc: "Ship inventory between branches with dispatch manifests, receiving verification, and automated in-transit accounting."
      },
      {
        title: "Unified Omnichannel Inventory",
        desc: "A single live inventory ledger powers your physical store POS, warehouse shipping, and online storefront simultaneously."
      }
    ],
    keyFeatures: [
      { title: "Rapid Barcode & Weight Scale POS", desc: "Integrated with weighing scales, barcode laser scanners, and dual customer displays." },
      { title: "Size, Color & Fit Variant Matrix", desc: "Manage clothing and shoe catalogs with multi-attribute grid matrix entries." },
      { title: "Batch & Expiry Date Management", desc: "Alert cashiers and warehouse staff before perishable grocery or cosmetic items expire." },
      { title: "Customer Loyalty & Points Club", desc: "Reward frequent shoppers with tier-based points, gift cards, and birthday coupons." },
      { title: "Automated Supplier Reorder Points", desc: "Auto-generate purchase orders when store shelf inventory dips below minimum safety stock." },
      { title: "End-of-Day Register Z-Reports", desc: "Blind cash counts, credit card reconciliation, and variance tracking per cashier shift." }
    ],
    operationModes: [
      { badge: "🛒 Supermarket & Grocery", name: "Fast Checkout Mode", desc: "Weight barcode scale parsing, bottle returns, and multi-lane cashier lanes." },
      { badge: "👗 Fashion & Boutique", name: "Variant Matrix Mode", desc: "Color/size grids, fitting room holds, and customer VIP styling notes." },
      { badge: "💊 Pharmacy & Health", name: "Lot & Batch Mode", desc: "Prescription doctor tracking, lot expiry date quarantine, and dosage instructions." }
    ],
    departments: ["Store Checkout / Cashiers", "Warehouse & Receiving", "Category Merchandising", "Customer Loyalty", "Store Management"],
    roles: ["Retail Store Manager", "Head Cashier", "Inventory Controller", "Merchandiser", "Loss Prevention Officer"],
    faqs: [
      {
        q: "What happens if the internet connection goes down during store hours?",
        a: "Beraxis POS features full offline caching. Cashiers continue scanning items and printing receipts without interruption. Once reconnected, all transactions sync automatically."
      },
      {
        q: "Can I print barcode labels for custom items?",
        a: "Yes. Beraxis includes an integrated barcode label generator supporting standard thermal barcode printers (Zebra, Brother, Dymo)."
      },
      {
        q: "Can I manage 5 or 10 retail branches under one account?",
        a: "Yes. You can manage unlimited store branches, compare sales per square meter across locations, and transfer stock between branches seamlessly."
      }
    ]
  },

  "construction-contracting": {
    slug: "construction-contracting",
    name: "Construction & Contracting",
    h1: "Construction Project Management & Contractor ERP",
    tagline: "Job Costing, Subcontractor Progress Claims & Equipment Utilization",
    metaTitle: "Construction Project Management & Contractor ERP | Beraxis AI",
    metaDescription: "All-in-one construction ERP software: track milestone job costing, subcontractor progress claims, equipment utilization, and AIA billing for $1/month.",
    keywords: [
      "construction project management software",
      "contractor job costing ERP",
      "subcontractor billing software",
      "construction estimating software",
      "equipment utilization tracking",
      "general contractor management software"
    ],
    themeColor: "from-amber-600 to-yellow-600",
    accentColor: "text-amber-400",
    badge: "🏗️ Commercial & Residential Contracting",
    painPoints: [
      {
        title: "Budget Overruns Hidden Until Job Completion",
        desc: "Without real-time material purchase and labor cost allocation per milestone, contractors discover cost overruns after the project is delivered."
      },
      {
        title: "Disputed Subcontractor Progress Invoices",
        desc: "Subcontractors billing for 80% completion when only 50% of concrete is poured leads to cash flow bleeding and disputes."
      },
      {
        title: "Idle Heavy Equipment Bleeding Depreciation",
        desc: "Excavators, cranes, and specialized tools sit unmonitored across multiple job sites without scheduled operator hours."
      }
    ],
    solutions: [
      {
        title: "Real-Time Milestone Job Costing",
        desc: "Allocate raw materials, equipment hours, and field worker timesheets to specific project phases, keeping profit margins visible in real-time."
      },
      {
        title: "Progressive Subcontractor Milestones",
        desc: "Review and approve subcontractor progress claims against verified engineering completion checklists before releasing payments."
      },
      {
        title: "Jobsite Equipment Fleet Scheduling",
        desc: "Schedule heavy machinery across project sites, track maintenance hours, and bill internal equipment rates to active projects."
      }
    ],
    keyFeatures: [
      { title: "Milestone & Gantt Project Schedules", desc: "Link procurement and trade dependencies with real-time critical path tracking." },
      { title: "Work Breakdown Structure (WBS)", desc: "Track budgets against actuals across Foundations, Framing, Electrical, and Finishing." },
      { title: "Field Daily Logs with Photos", desc: "Site supervisors log daily weather, crew counts, safety incidents, and inspection photos." },
      { title: "Subcontractor Retainage Management", desc: "Hold standard 5% or 10% retainage until punch list signoff and warranty periods." },
      { title: "Change Order Approval Workflow", desc: "Draft change orders with client digital signature approval before executing additional site work." },
      { title: "25M+ Subcontractor & B2B Leads", desc: "Source specialized trade partners, architects, and engineering consultancies." }
    ],
    operationModes: [
      { badge: "🏗️ General Contractor", name: "Turnkey Project Mode", desc: "Architectural milestones, subcontractor retainage, and progressive client billing." },
      { badge: "⚡ Trade Contractor", name: "Specialty Trade Mode", desc: "Service truck dispatch, job material requisition, and time-and-materials billing." },
      { badge: "🚜 Civil & Earthwork", name: "Heavy Equipment Mode", desc: "Machinery hour tracking, bulk aggregate hauling, and site fuel logs." }
    ],
    departments: ["Project Management & Engineering", "Procurement & Site Materials", "Field Operations & Safety", "Subcontractor Relations", "Contract Accounting"],
    roles: ["Project Director", "Site Superintendent", "Quantity Surveyor", "Procurement Officer", "Field Safety Inspector"],
    faqs: [
      {
        q: "Does Beraxis support progress billing and retainage withholding?",
        a: "Yes. Beraxis allows you to bill clients based on verified percentage of completion and automatically withholds contract retainage until final punch list signoff."
      },
      {
        q: "Can site foremen submit daily logs from their mobile phones?",
        a: "Yes. Field supervisors can log work completed, take photos, record crew hours, and note weather conditions directly from smartphones."
      },
      {
        q: "Can I track equipment maintenance hours?",
        a: "Yes. Log engine run hours to schedule oil changes and filter replacements, ensuring your heavy equipment remains operational without costly breakdowns."
      }
    ]
  },

  "education-academies": {
    slug: "education-academies",
    name: "Education & Academies",
    h1: "School & Training Academy Management Software",
    tagline: "Student Admissions, Automated Tuition Fees, Attendance & Timetables",
    metaTitle: "School & Training Academy Management Software | Beraxis AI",
    metaDescription: "All-in-one education ERP: streamline student enrollment, recurring tuition billing, teacher timetables, exam grading, and parent communications for $1/month.",
    keywords: [
      "school management software",
      "training academy ERP",
      "student tuition billing software",
      "student attendance software",
      "academy timetable scheduler",
      "education ERP cloud",
      "tutor academy management system"
    ],
    themeColor: "from-purple-600 to-indigo-700",
    accentColor: "text-purple-400",
    badge: "🎓 K-12, Universities & Training Centers",
    painPoints: [
      {
        title: "Chasing Late Tuition & Disorganized Fee Slips",
        desc: "Manually issuing fee vouchers and tracking overdue installments takes weeks of bursar time and hurts school cash flows."
      },
      {
        title: "Clashing Teacher Timetables & Room Bookings",
        desc: "Scheduling instructors, laboratories, and lecture halls across academic departments in spreadsheets results in double-booked classrooms."
      },
      {
        title: "Fragmented Parent & Student Communications",
        desc: "Parents miss critical notices when announcements are split across unmonitored WhatsApp groups and paper circulars."
      }
    ],
    solutions: [
      {
        title: "Automated Recurring Tuition Invoicing",
        desc: "Generate termly or monthly tuition invoices with sibling discounts, transport fees, and automated WhatsApp/email payment links."
      },
      {
        title: "Conflict-Free Intelligent Timetable Builder",
        desc: "Automatically map teacher specializations, classroom capacities, and curriculum requirements with collision detection."
      },
      {
        title: "Parent Portal & Attendance Alerts",
        desc: "Parents receive instant alerts when a student arrives or misses class, and can download grade report cards securely online."
      }
    ],
    keyFeatures: [
      { title: "Student Admission & Digital Enrollment", desc: "Online application forms, document verification, and student ID generation." },
      { title: "Automated Fee Billing & Payment Gateway", desc: "Support installment plans, scholarships, extracurricular fees, and late penalties." },
      { title: "Teacher Timetable & Room Matrix", desc: "Drag-and-drop lecture hall schedules with teacher availability indicators." },
      { title: "QR & Biometric Student Attendance", desc: "Instant gate or classroom attendance with automated absence notices to parents." },
      { title: "Exam Gradebooks & Report Cards", desc: "Calculate weighted GPAs, grading curves, and generate printable branded report cards." },
      { title: "Teacher Payroll & Sub-Work Hours", desc: "Track teacher lesson hours, substitute coverage, and bonus calculations." }
    ],
    operationModes: [
      { badge: "🏫 K-12 School", name: "Academic Term Mode", desc: "Grade levels, homeroom divisions, bus route allocations, and parent-teacher meetings." },
      { badge: "🥋 Training Academy", name: "Course & Cohort Mode", desc: "Batch registrations, certificate generation, and weekend workshop scheduling." },
      { badge: "💻 EdTech / Tutoring", name: "Hourly Booking Mode", desc: "1-on-1 tutoring sessions, lesson credits packages, and virtual video room links." }
    ],
    departments: ["Academic Administration", "Bursar & Finance Office", "Admissions & Marketing", "Student Affairs & Safety", "Faculty & Staff"],
    roles: ["School Principal / Director", "Academic Coordinator", "School Bursar", "Lead Instructor", "Admissions Officer"],
    faqs: [
      {
        q: "Can Beraxis handle sibling discounts and tiered installment fee plans?",
        a: "Yes. You can configure automatic percentage or fixed discounts for families with multiple enrolled students, and split annual tuition into monthly installments."
      },
      {
        q: "Does Beraxis include attendance tracking for students and staff?",
        a: "Yes. Teachers can mark attendance via tablet in under 60 seconds, or students can scan their student ID barcode at reception gates."
      },
      {
        q: "Can we print official student report cards and certificates?",
        a: "Yes. Beraxis includes customizable PDF templates for report cards, academic transcripts, and course completion certificates with QR verification."
      }
    ]
  },

  "ngos-non-profits": {
    slug: "ngos-non-profits",
    name: "NGOs & Non-Profit Organizations",
    h1: "NGO Grant & Donation Management Software",
    tagline: "Donor Tracking, Grant Budget Allocations, Volunteer Hours & Fund Accounting",
    metaTitle: "NGO Grant & Donation Management Software | Beraxis AI",
    metaDescription: "Audit-ready non-profit ERP software: track international donor grants, fund accounting, charitable project disbursements, and volunteer hours for $1/month.",
    keywords: [
      "NGO management software",
      "non profit ERP software",
      "grant management software",
      "donor tracking software",
      "fund accounting software",
      "charity donation CRM",
      "nonprofit project disbursement software"
    ],
    themeColor: "from-rose-500 to-pink-600",
    accentColor: "text-rose-400",
    badge: "🤝 Non-Profit & Humanitarian Foundations",
    painPoints: [
      {
        title: "Disqualified Donor Grants Due to Commingled Funds",
        desc: "International institutional donors require strict fund accounting to guarantee their grant money is spent only on designated project activities."
      },
      {
        title: "Manual Donor Tax Receipt Issuance",
        desc: "Issuing annual tax-deductible donation receipts manually to thousands of individual donors drains valuable charity staff hours."
      },
      {
        title: "Uncoordinated Volunteer Schedules Across Projects",
        desc: "Scattered volunteer rosters lead to understaffed food drives, medical missions, and emergency relief distribution points."
      }
    ],
    solutions: [
      {
        title: "Strict Fund & Grant Accounting",
        desc: "Ring-fence donor grant funds with multi-currency tracking, ensuring expenditures link directly to designated program budget lines."
      },
      {
        title: "Automated Charitable Tax Receipts",
        desc: "Donors receive instant branded tax-deductible contribution receipts via email upon online or bank donation confirmation."
      },
      {
        title: "Volunteer Coordination & Hour Verification",
        desc: "Volunteers sign up for project shifts online, clock their community service hours, and receive verified certificate letters."
      }
    ],
    keyFeatures: [
      { title: "Donor CRM & Contribution History", desc: "Track individual donors, corporate sponsors, and philanthropic foundations." },
      { title: "Grant Budget vs. Actual Monitoring", desc: "Prevent budget overruns with real-time alerts before project funds are exhausted." },
      { title: "Multi-Currency Humanitarian Disbursements", desc: "Issue local currency procurement orders for international field mission supplies." },
      { title: "Audit-Ready Financial Statements", desc: "Generate Statement of Financial Position and Statement of Activities for regulators." },
      { title: "25M+ Corporate Sponsor Directory", desc: "Reach out directly to corporate CSR heads and philanthropic foundation leaders." },
      { title: "Field Mission Expense Receipts", desc: "Staff capture and submit field expenditure receipts via mobile photos for instant reimbursement." }
    ],
    operationModes: [
      { badge: "🤝 Humanitarian Relief", name: "Field Mission Mode", desc: "Aid kit logistics, beneficiary ration lists, and emergency field cash disbursement." },
      { badge: "🏛️ Foundation & Grants", name: "Grant Allocator Mode", desc: "Proposal evaluation, milestone disbursement tranches, and impact monitoring." },
      { badge: "🌱 Community Charity", name: "Recurring Donor Mode", desc: "Monthly donation drafts, fundraising event ticketing, and volunteer rosters." }
    ],
    departments: ["Program Delivery & Operations", "Donor Development & Grants", "Finance & Compliance", "Volunteer Coordination", "Impact Evaluation"],
    roles: ["Executive Director", "Head of Programs", "Grants Manager", "Chief Financial Officer", "Volunteer Coordinator"],
    faqs: [
      {
        q: "Does Beraxis support non-profit fund accounting?",
        a: "Yes. You can isolate donor grants into restricted and unrestricted funds, ensuring transparent audit trails for international audits (USAID, UN, EU)."
      },
      {
        q: "Can we accept online recurring donations via credit card and crypto?",
        a: "Yes. Beraxis integrates with Stripe, PayPal, and Plisio Crypto to accept one-time or monthly donations with zero platform cut."
      },
      {
        q: "Can we track volunteer community service hours?",
        a: "Yes. Volunteers log their service hours across charitable initiatives, and administrators can export verified volunteer service letters with 1 click."
      }
    ]
  },

  "manufacturing": {
    slug: "manufacturing",
    name: "Discrete & Process Manufacturing",
    h1: "Discrete Manufacturing & Production MRP Software",
    tagline: "Multi-Level BOMs, Work Center Routings & Material Requirements Planning",
    metaTitle: "Discrete Manufacturing & Production MRP Software | Beraxis AI",
    metaDescription: "Modern manufacturing ERP software: multi-level Bill of Materials (BOM), work center routings, production orders, scrap tracking, and shop floor timers for $1/month.",
    keywords: [
      "manufacturing ERP software",
      "production planning MRP software",
      "bill of materials BOM software",
      "work center routing ERP",
      "discrete manufacturing software",
      "shop floor control ERP",
      "Beraxis manufacturing"
    ],
    themeColor: "from-slate-600 to-indigo-800",
    accentColor: "text-slate-300",
    badge: "⚙️ Factory Production & Discrete MRP",
    painPoints: [
      {
        title: "Production Halts Due to Missing Component Raw Materials",
        desc: "Discovering a critical $2 bracket or screw is missing after starting an assembly line wastes thousands in idle factory labor."
      },
      {
        title: "Inaccurate Manufacturing Costing & Scrap Overage",
        desc: "Guessing labor and overhead rates without automated machine timers conceals unprofitable product lines."
      },
      {
        title: "Bottlenecks Across Machine Work Centers",
        desc: "Without scheduled routings, CNC machines sit backlogged while assembly bays wait idle for components."
      }
    ],
    solutions: [
      {
        title: "Multi-Level Bill of Materials (BOM)",
        desc: "Define sub-assemblies, raw components, and operations. When a manufacturing order is planned, raw materials reserve immediately."
      },
      {
        title: "Automated Material Requirements Planning (MRP)",
        desc: "Beraxis analyzes sales orders, lead times, and current stock to draft optimal raw material purchase orders automatically."
      },
      {
        title: "Work Center Scheduling & Machine Clocking",
        desc: "Route production jobs through sequential work centers with barcode job clocking and real-time scrap tracking."
      }
    ],
    keyFeatures: [
      { title: "Multi-Level BOM Architecture", desc: "Supports nested sub-assemblies, revision histories, and phantom BOMs." },
      { title: "Manufacturing Order (MO) Control", desc: "Release, produce, and inspect production batches with stage-by-stage approval." },
      { title: "Work Center Capacity Planning", desc: "Monitor work center loads, machine maintenance downtimes, and shift staffing." },
      { title: "Scrap & By-Product Accounting", desc: "Record scrap rates per operation and allocate by-product value to inventory." },
      { title: "Actual vs. Standard Cost Analysis", desc: "Compare estimated material and labor costs against final actuals to protect gross margins." },
      { title: "Barcoded Shop Floor Dispatch", desc: "Operators scan order barcodes on factory terminals to start and pause operations." }
    ],
    operationModes: [
      { badge: "⚙️ Discrete Assembly", name: "Make-to-Stock Mode", desc: "Standard batch runs, automated reorder thresholds, and warehouse replenishment." },
      { badge: "🛠️ Custom Fabrication", name: "Make-to-Order Mode", desc: "Engineered-to-order BOM customizer, job costing, and milestone delivery." },
      { badge: "⚗️ Process & Batch", name: "Recipe & Mixing Mode", desc: "Weight-based batch blending, potency adjustments, and yield variance tracking." }
    ],
    departments: ["Plant Production & Assembly", "Engineering & BOM Design", "Quality Assurance & Scrap", "Warehouse & Receiving", "Factory Maintenance"],
    roles: ["Plant Operations Director", "Production Supervisor", "Manufacturing Engineer", "Quality Control Inspector", "CNC Machine Operator"],
    faqs: [
      {
        q: "Does Beraxis support nested multi-level BOMs?",
        a: "Yes. You can nest assemblies within assemblies to any depth, with automated cost rollups from raw components to finished goods."
      },
      {
        q: "Can operators clock into production orders from shop floor terminals?",
        a: "Yes. Operators scan order barcodes using touchscreen tablets or barcode wands to record exact labor hours and completed quantities."
      },
      {
        q: "Does it automatically create raw material purchase orders?",
        a: "Yes. The MRP engine checks current component inventory against scheduled production orders and generates draft purchase orders for shortages."
      }
    ]
  },

  "logistics-wholesale": {
    slug: "logistics-wholesale",
    name: "Logistics & Wholesale Distribution",
    h1: "Logistics & Wholesale Distribution ERP",
    tagline: "Wave Picking, Pallet Tracking, Multi-Tier B2B Pricing & Carrier Integrations",
    metaTitle: "Logistics & Wholesale Distribution ERP | Beraxis AI",
    metaDescription: "Modern B2B wholesale distribution ERP: multi-warehouse pallet tracking, tiered customer pricing, wave picking, shipping labels, and CRM leads for $1/month.",
    keywords: [
      "wholesale distribution software",
      "warehouse logistics ERP",
      "pallet tracking software",
      "B2B order management software",
      "wave picking inventory software",
      "logistics fulfillment software cloud"
    ],
    themeColor: "from-cyan-600 to-blue-700",
    accentColor: "text-cyan-400",
    badge: "📦 Wholesale Distribution & Freight",
    painPoints: [
      {
        title: "Misplaced Pallets & Slow Warehouse Picking",
        desc: "Without zone and bin location tracking, warehouse pickers waste hours searching aisles, resulting in delayed customer shipments."
      },
      {
        title: "Chaotic Tiered Pricing Across Hundreds of B2B Accounts",
        desc: "Managing different negotiated price lists for wholesalers, distributors, and retailers manually leads to pricing errors and disputed invoices."
      },
      {
        title: "High Carrier Shipping Costs & Inefficient Palletization",
        desc: "Failing to consolidate orders into optimal freight pallets burns thousands in avoidable LTL (Less-Than-Truckload) shipping charges."
      }
    ],
    solutions: [
      {
        title: "Zone, Aisle, Bin & Pallet Location Matrix",
        desc: "Direct warehouse pickers along optimized pick paths using handheld barcode scanners, cutting pick times by up to 50%."
      },
      {
        title: "Automated Customer-Specific B2B Price Lists",
        desc: "Assign custom volume discounts, tiered margin minimums, and net-30 terms to accounts; correct pricing applies automatically."
      },
      {
        title: "Wave & Batch Order Fulfillment",
        desc: "Group hundreds of individual orders into unified picking waves and generate shipping labels and bill-of-lading (BOL) manifests."
      }
    ],
    keyFeatures: [
      { title: "Dynamic Bin & Pallet Locations", desc: "Track exact shelf and bin coordinates across multiple distribution hubs." },
      { title: "Wholesale B2B Customer Portal", desc: "Wholesale clients log in to view negotiated price lists and place bulk replenishment orders." },
      { title: "Automated Credit Limit Enforcement", desc: "Prevent dispatching goods to B2B clients with past-due unpaid balances." },
      { title: "25M+ Verified B2B Buyer Leads", desc: "Directly prospect wholesale buyers, retail chains, and purchasing agents." },
      { title: "Landed Cost Calculations", desc: "Distribute customs duties, freight tariffs, and insurance into unit inventory valuation." },
      { title: "Carrier Manifests & BOLs", desc: "Generate freight packing slips, container manifests, and delivery receipts." }
    ],
    operationModes: [
      { badge: "📦 B2B Wholesale", name: "High-Volume Case Mode", desc: "Master carton breakdown, pallet minimums, and volume-discount matrices." },
      { badge: "🚚 Freight & 3PL", name: "Third-Party Storage Mode", desc: "Pallet storage billing, pick-and-pack fee automation, and client portals." },
      { badge: "🏪 DSD Van Sales", name: "Route Delivery Mode", desc: "Truck inventory allocation, mobile on-site invoicing, and return bottle tracking." }
    ],
    departments: ["Warehouse & Fulfillment", "B2B Sales & Key Accounts", "Procurement & Freight", "Credit & Collections", "Logistics Operations"],
    roles: ["Logistics Director", "Warehouse Operations Manager", "B2B Account Executive", "Freight Dispatcher", "Inventory Forklift Lead"],
    faqs: [
      {
        q: "Can I assign custom price lists to different wholesale accounts?",
        a: "Yes. Beraxis allows you to create unlimited price lists (e.g. Master Distributor, Wholesale Tier 1, Retail Partner) and assign them to specific accounts."
      },
      {
        q: "Does Beraxis support landed cost accounting for imported shipping containers?",
        a: "Yes. Allocate ocean freight, customs tariffs, and handling fees proportionally to incoming items by value or weight, ensuring accurate cost of goods sold (COGS)."
      },
      {
        q: "Can our wholesale clients order directly through an online portal?",
        a: "Yes. Wholesale buyers receive portal logins to view their negotiated pricing, place purchase orders, and track shipment dispatch statuses."
      }
    ]
  },

  "professional-services": {
    slug: "professional-services",
    name: "Professional Services & Agencies",
    h1: "Professional Services & Agency Management ERP",
    tagline: "Time Tracking, Client Retainers, Project Milestones & Automated Invoicing",
    metaTitle: "Professional Services & Agency Management ERP | Beraxis AI",
    metaDescription: "All-in-one agency software: billable hour tracking, client retainer management, project milestones, automated invoicing, and CRM for $1/month.",
    keywords: [
      "professional services automation PSA",
      "agency management software",
      "agency time tracking billing software",
      "client retainer management software",
      "consulting project accounting",
      "digital agency ERP software"
    ],
    themeColor: "from-purple-700 to-pink-700",
    accentColor: "text-purple-300",
    badge: "💼 Consulting, Agencies & Legal",
    painPoints: [
      {
        title: "Unbilled Hours & Leaking Client Retainers",
        desc: "Consultants failing to log quick 15-minute client phone calls and email reviews costs agencies 10-15% of total billable revenue every month."
      },
      {
        title: "Project Scope Creep Eating Profit Margins",
        desc: "Delivering extra revisions and client feature requests without formal change orders quietly destroys project profitability."
      },
      {
        title: "Manual End-of-Month Invoicing Nightmares",
        desc: "Pulling hours from Clockify, expenses from spreadsheets, and milestones from Asana takes days of administrative chaos every month."
      }
    ],
    solutions: [
      {
        title: "Integrated One-Click Time & Voice Logging",
        desc: "Track billable minutes from desktop or mobile timers, or dictate voice logs that automatically match hours to active client retainer balances."
      },
      {
        title: "Real-Time Project Budget & Margin Monitors",
        desc: "Keep project managers informed with real-time budget burn charts comparing billable hours against client fee caps."
      },
      {
        title: "Automated End-of-Month Retainer Invoicing",
        desc: "Beraxis automatically compiles logged hours, project milestones, and approved expenses into clean, itemized PDF invoices."
      }
    ],
    keyFeatures: [
      { title: "One-Click Billable Timers", desc: "Switch tasks seamlessly with team timers categorized by client, project, and rate." },
      { title: "Monthly Retainer Burn Tracker", desc: "Track prepaid retainer hours with automated rollovers or use-it-or-lose-it expirations." },
      { title: "Milestone & Fixed-Fee Contracts", desc: "Trigger client billing automatically upon deliverable review and signoff." },
      { title: "Client Portal & File Approvals", desc: "Clients review project deliverables, download invoices, and pay via credit card or ACH." },
      { title: "25M+ Corporate Prospect Leads", desc: "Directly identify VP of Marketing, CTO, and C-level decision-makers needing agency services." },
      { title: "Multi-Currency & VAT Compliance", desc: "Bill international clients in USD, EUR, GBP, or AED with compliant tax formatting." }
    ],
    operationModes: [
      { badge: "💼 Marketing Agency", name: "Retainer & Campaign Mode", desc: "Monthly retainers, media spend tracking, and deliverable review workflows." },
      { badge: "⚖️ Legal & Accounting", name: "Matter & Trust Mode", desc: "Client retainer trust accounting, billable hour rates by attorney, and court filings." },
      { badge: "💻 IT & Dev Studio", name: "Sprint & T&M Mode", desc: "Milestone sprints, engineer day rates, and GitHub/GitLab integration webhooks." }
    ],
    departments: ["Client Services & Accounts", "Project Management / Delivery", "Creative & Engineering", "Finance & Billing", "New Business Development"],
    roles: ["Agency Managing Partner", "Client Account Director", "Senior Project Manager", "Creative Director", "Finance Controller"],
    faqs: [
      {
        q: "Does Beraxis support both hourly billing and monthly retainer contracts?",
        a: "Yes. You can manage recurring monthly retainers (with or without hour rollover) as well as time-and-materials and fixed-price projects."
      },
      {
        q: "Can clients review and approve work in a branded portal?",
        a: "Yes. Clients receive access to a sleek portal where they can inspect deliverable milestones, view outstanding invoices, and pay securely online."
      },
      {
        q: "Can team members track time from mobile devices or voice?",
        a: "Yes. Team members can use one-click web timers, mobile apps, or dictate voice entries like 'Log 1.5 hours research for Client X'."
      }
    ]
  }
};
