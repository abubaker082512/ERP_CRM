export type GlobalIndustryId =
  | "food_beverage"
  | "retail_supermarket"
  | "professional_services"
  | "manufacturing"
  | "healthcare_wellness"
  | "logistics_wholesale"
  | "real_estate"
  | "automotive_workshop"
  | "construction_contracting"
  | "education_academies"
  | "fitness_sports_club"
  | "ngos"
  | "call_center"
  | "hospitality_travel"
  | "agriculture_agritech";

export type OperationMode = {
  id: string;
  name: string;
  description: string;
  badge: string;
};

export type IndustryArchetype = {
  id: GlobalIndustryId;
  name: string;
  tagline: string;
  description: string;
  iconName: string; // lucide icon identifier
  themeColor: string; // e.g. "bg-amber-600"
  accentColor: string; // e.g. "text-amber-400"
  borderColor: string;
  subSectors: string[];
  operationModes: OperationMode[];
  defaultModules: string[]; // module hrefs that are enabled by default
  specializedRoutes: { name: string; href: string; icon: string }[];
  defaultDepartments: string[];
  defaultRoles: string[];
};

export const GLOBAL_INDUSTRIES: IndustryArchetype[] = [
  {
    id: "food_beverage",
    name: "Food & Beverage (F&B)",
    tagline: "Cafes, Bakeries, QSR, Fine Dining & Cloud Kitchens",
    description: "Tailored for food service operations with table layouts, KDS, ingredient recipes, and takeaway token queues.",
    iconName: "UtensilsCrossed",
    themeColor: "bg-amber-600",
    accentColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    subSectors: [
      "Artisan Bakery & Pastry Shop",
      "Specialty Coffee Cafe",
      "Quick Service Restaurant (QSR)",
      "Fine Dining & Bistro",
      "Cloud / Ghost Kitchen",
      "Bar, Pub & Brewery",
      "Event Catering & Food Truck"
    ],
    operationModes: [
      { id: "hybrid", name: "Dine-In + Takeaway", description: "Full table management with fast takeaway counter.", badge: "🍽️+🥡 Hybrid" },
      { id: "dine_in", name: "Dine-In Only", description: "Floor plan seating, course ordering & split bills.", badge: "🍽️ Dine-In" },
      { id: "takeaway", name: "Takeaway & Bakery Counter", description: "Fast barcode & touch screen with buzzer numbering.", badge: "🥡 Takeaway" },
      { id: "cloud_kitchen", name: "Cloud Kitchen & Delivery", description: "Direct dispatch integration and high-volume KDS.", badge: "🚀 Cloud" }
    ],
    defaultModules: [
      "/pos",
      "/pos/kds",
      "/pos/recipes",
      "/pos/tables",
      "/inventory",
      "/purchase",
      "/accounting",
      "/planning",
      "/employees",
      "/timesheets",
      "/attendances",
      "/reports",
      "/crm/leads-pool"
    ],
    specializedRoutes: [
      { name: "Kitchen Display (KDS)", href: "/pos/kds", icon: "Flame" },
      { name: "Recipe & BOM Costing", href: "/pos/recipes", icon: "BookOpen" },
      { name: "Floor Plan & Tables", href: "/pos/tables", icon: "LayoutGrid" }
    ],
    defaultDepartments: ["Kitchen & Culinary", "Front of House / Service", "Bar & Beverage", "Bakery Production", "Store Management"],
    defaultRoles: ["Head Chef", "Sous Chef", "Head Barista", "Floor Supervisor", "Pastry Baker", "Restaurant Manager"]
  },
  {
    id: "retail_supermarket",
    name: "Retail & Supermarkets",
    tagline: "Boutiques, Supermarkets, Electronics & Pharmacies",
    description: "High-speed barcode scanning, size/color variant matrix, expiry date lot tracking, and customer loyalty.",
    iconName: "ShoppingBag",
    themeColor: "bg-emerald-600",
    accentColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    subSectors: [
      "Fashion & Apparel Boutique",
      "Supermarket & Grocery Store",
      "Electronics & Appliance Retail",
      "Pharmacy & Health Store",
      "Hardware & Building Materials",
      "Cosmetics & Beauty Store"
    ],
    operationModes: [
      { id: "counter_pos", name: "Multi-Counter Barcode Scan", description: "High-throughput POS with thermal receipt printer.", badge: "🏷️ In-Store" },
      { id: "omnichannel", name: "Omnichannel (Store + E-com)", description: "Synchronized stock across physical store and online.", badge: "🌐 Omni" },
      { id: "wholesale_retail", name: "Retail & B2B Wholesaler", description: "Tiered pricing and bulk carton pack support.", badge: "📦 Bulk" }
    ],
    defaultModules: [
      "/pos",
      "/barcode",
      "/inventory",
      "/purchase",
      "/sales",
      "/accounting",
      "/crm",
      "/crm/leads-pool",
      "/contacts",
      "/employees",
      "/attendances",
      "/reports"
    ],
    specializedRoutes: [
      { name: "Barcode Label Hub", href: "/barcode", icon: "Barcode" },
      { name: "Stock & Variants", href: "/inventory", icon: "Package" }
    ],
    defaultDepartments: ["Sales & Cashiers", "Inventory & Stockroom", "Purchasing & Merchandising", "Store Operations"],
    defaultRoles: ["Store Manager", "Chief Cashier", "Inventory Specialist", "Merchandiser", "Sales Associate"]
  },
  {
    id: "professional_services",
    name: "Professional Services & Consulting",
    tagline: "Agencies, Law, Accounting, IT & Design Studios",
    description: "Billable timesheets, project milestone tracking, client document portals, and retainer management.",
    iconName: "Briefcase",
    themeColor: "bg-blue-600",
    accentColor: "text-blue-400",
    borderColor: "border-blue-500/30",
    subSectors: [
      "Software & IT Engineering Agency",
      "Legal Practice & Law Firm",
      "Accounting & CPA Audit Firm",
      "Design, Branding & Creative Studio",
      "Management Consulting Practice",
      "Architecture & Engineering Consultancy"
    ],
    operationModes: [
      { id: "hourly_billable", name: "Hourly Timesheet Billing", description: "Log client hours and convert directly to invoices.", badge: "⏱️ Hourly" },
      { id: "fixed_milestone", name: "Milestone & SOW Projects", description: "Deliverables, phases, and stage-gate billing.", badge: "🚩 Milestone" },
      { id: "monthly_retainer", name: "Monthly Retainer Advisory", description: "Recurring retainer pool with hours drawdown.", badge: "🔄 Retainer" }
    ],
    defaultModules: [
      "/project",
      "/timesheets",
      "/calendar",
      "/appointments",
      "/crm",
      "/crm/leads-pool",
      "/sales",
      "/accounting",
      "/documents",
      "/team",
      "/employees",
      "/payroll",
      "/meet",
      "/sign",
      "/forms",
      "/reports"
    ],
    specializedRoutes: [
      { name: "Project Timesheets", href: "/timesheets", icon: "Clock" },
      { name: "Project Milestones", href: "/project", icon: "CheckSquare" },
      { name: "Client Booking Calendar", href: "/appointments", icon: "Calendar" },
      { name: "Client Document Vault", href: "/documents", icon: "FileText" }
    ],
    defaultDepartments: ["Client Strategy", "Engineering & Dev", "Creative Design", "Finance & Billing", "Human Resources"],
    defaultRoles: ["Managing Partner", "Principal Consultant", "Lead Architect", "Account Director", "Project Manager"]
  },
  {
    id: "manufacturing",
    name: "Manufacturing & Fabrication",
    tagline: "Discrete, Food/Chemical Process & CNC Machine Shops",
    description: "Multi-level BOM, work center capacity routing, production work orders, and quality control (QC) checkpoints.",
    iconName: "Cog",
    themeColor: "bg-orange-600",
    accentColor: "text-orange-400",
    borderColor: "border-orange-500/30",
    subSectors: [
      "Discrete Product Manufacturing",
      "Food & Beverage Batch Processing",
      "Textile & Garment Factory",
      "Metal & CNC Custom Fabrication",
      "Chemical & Pharmaceutical Batching"
    ],
    operationModes: [
      { id: "make_to_stock", name: "Make-to-Stock (MTS)", description: "High volume scheduled factory runs for warehouse inventory.", badge: "🏭 MTS" },
      { id: "make_to_order", name: "Make-to-Order (MTO)", description: "Custom production triggered directly by Sales Orders.", badge: "🛠️ MTO" }
    ],
    defaultModules: [
      "/manufacturing",
      "/inventory",
      "/purchase",
      "/planning",
      "/accounting",
      "/employees",
      "/attendances",
      "/barcode",
      "/reports",
      "/crm/leads-pool"
    ],
    specializedRoutes: [
      { name: "Production Work Orders", href: "/manufacturing", icon: "Cog" },
      { name: "Bill of Materials (BOM)", href: "/manufacturing/bom", icon: "Layers" }
    ],
    defaultDepartments: ["Production & Assembly", "Quality Control (QC)", "Plant Maintenance", "Supply Chain & Sourcing"],
    defaultRoles: ["Plant Operations Director", "Production Supervisor", "QC Lead Inspector", "CNC Machine Operator"]
  },
  {
    id: "healthcare_wellness",
    name: "Healthcare, Clinics & Salons",
    tagline: "Medical Clinics, Dental, Spas, Salons & Therapy",
    description: "Doctor & practitioner appointments, patient health treatment records, service duration timeslots, and room scheduling.",
    iconName: "Stethoscope",
    themeColor: "bg-cyan-600",
    accentColor: "text-cyan-400",
    borderColor: "border-cyan-500/30",
    subSectors: [
      "Medical & Specialist Clinic",
      "Dental Practice",
      "Physiotherapy & Rehabilitation",
      "Luxury Spa & Wellness Center",
      "Hair & Beauty Salon"
    ],
    operationModes: [
      { id: "appointment_only", name: "Appointments & Sessions", description: "Structured timeslots with automated reminders.", badge: "📅 Booking" },
      { id: "walkin_appointment", name: "Walk-In Queue + Bookings", description: "Live waiting room queue with scheduled bookings.", badge: "🩺 Walk-In" }
    ],
    defaultModules: [
      "/appointments",
      "/calendar",
      "/contacts",
      "/pos",
      "/accounting",
      "/employees",
      "/planning",
      "/documents",
      "/forms",
      "/reports",
      "/crm/leads-pool"
    ],
    specializedRoutes: [
      { name: "Appointment Booking", href: "/appointments", icon: "Calendar" },
      { name: "Staff Shifts & Rooms", href: "/planning", icon: "Clock" }
    ],
    defaultDepartments: ["Clinical Staff", "Reception & Front Desk", "Therapy & Treatments", "Administration"],
    defaultRoles: ["Clinical Director", "Lead Practitioner / Doctor", "Head Therapist", "Practice Manager"]
  },
  {
    id: "automotive_workshop",
    name: "Automotive & Workshops",
    tagline: "Auto Repair Garages, Dealerships & Parts Centers",
    description: "Vehicle repair job cards, VIN history lookup, mechanic labor time tracking, and spare parts catalog.",
    iconName: "Wrench",
    themeColor: "bg-red-600",
    accentColor: "text-red-400",
    borderColor: "border-red-500/30",
    subSectors: [
      "Auto Repair & Service Garage",
      "Auto Dealership & Showroom",
      "Auto Spare Parts Retailer",
      "Car Detailing & Wrap Studio",
      "Fleet Maintenance Facility"
    ],
    operationModes: [
      { id: "garage_service", name: "Vehicle Service & Repair", description: "Job cards, labor billing, and mechanic dispatch.", badge: "🔧 Service" },
      { id: "parts_sales", name: "Parts Counter & Trade Sales", description: "Fast VIN parts lookup and trade discounts.", badge: "🔩 Parts" }
    ],
    defaultModules: [
      "/automotive",
      "/inventory",
      "/pos",
      "/purchase",
      "/accounting",
      "/crm",
      "/crm/leads-pool",
      "/employees",
      "/timesheets",
      "/reports"
    ],
    specializedRoutes: [
      { name: "Vehicle Job Cards", href: "/automotive", icon: "Wrench" },
      { name: "Parts & Inventory", href: "/inventory", icon: "Package" }
    ],
    defaultDepartments: ["Service Bay & Diagnostics", "Parts & Store", "Service Advisory", "Vehicle Sales"],
    defaultRoles: ["Workshop Supervisor", "Master Diagnostic Mechanic", "Service Advisor", "Parts Manager"]
  },
  {
    id: "real_estate",
    name: "Real Estate & Property",
    tagline: "Brokerages, Property Management & Tenant Leases",
    description: "Property and unit directory, tenant lease contracts, automated rent invoicing, and maintenance ticket dispatch.",
    iconName: "Building",
    themeColor: "bg-indigo-600",
    accentColor: "text-indigo-400",
    borderColor: "border-indigo-500/30",
    subSectors: [
      "Residential Property Management",
      "Commercial Leasing Agency",
      "Real Estate Sales Brokerage",
      "Short-Stay / Vacation Rentals",
      "Facility & Community Management"
    ],
    operationModes: [
      { id: "leasing_management", name: "Tenant Lease & Invoicing", description: "Long-term lease cycles with auto-generated monthly rent.", badge: "🏢 Leases" },
      { id: "sales_brokerage", name: "Property Brokerage & Escrow", description: "Listing pipeline, commission splits, and client CRM.", badge: "🤝 Brokerage" }
    ],
    defaultModules: [
      "/real-estate",
      "/crm",
      "/crm/leads-pool",
      "/accounting",
      "/documents",
      "/sign",
      "/contacts",
      "/employees",
      "/helpdesk",
      "/forms",
      "/reports"
    ],
    specializedRoutes: [
      { name: "Property & Lease Hub", href: "/real-estate", icon: "Building" },
      { name: "Digital Lease Signing", href: "/sign", icon: "PenTool" }
    ],
    defaultDepartments: ["Property Management", "Leasing & Sales", "Maintenance & Repairs", "Finance & Accounts"],
    defaultRoles: ["Property Portfolio Manager", "Senior Leasing Agent", "Maintenance Coordinator", "Accounts Controller"]
  },
  {
    id: "education_academies",
    name: "Education & Academies",
    tagline: "Schools, Training Institutes, Gyms & Academies",
    description: "Course schedules, student & member directory, daily roll-call attendance, and recurring tuition billing.",
    iconName: "GraduationCap",
    themeColor: "bg-teal-600",
    accentColor: "text-teal-400",
    borderColor: "border-teal-500/30",
    subSectors: [
      "Training Academy & Institute",
      "Private School & College",
      "Fitness Gym & Martial Arts Academy",
      "Music, Art & Dance Studio",
      "Online Bootcamp & Coaching"
    ],
    operationModes: [
      { id: "term_tuition", name: "Semester & Term Courses", description: "Fixed-batch enrollments with scheduled roll calls.", badge: "🎓 Courses" },
      { id: "monthly_membership", name: "Monthly Gym / Studio Passes", description: "Recurring billing and attendance check-in.", badge: "💪 Membership" }
    ],
    defaultModules: [
      "/education",
      "/calendar",
      "/contacts",
      "/accounting",
      "/employees",
      "/surveys",
      "/knowledge",
      "/forms",
      "/reports",
      "/crm/leads-pool"
    ],
    specializedRoutes: [
      { name: "Course & Academy Hub", href: "/education", icon: "GraduationCap" },
      { name: "Knowledge Base", href: "/knowledge", icon: "BookOpen" }
    ],
    defaultDepartments: ["Faculty & Instructors", "Student Admissions", "Academic Administration", "Finance & Bursar"],
    defaultRoles: ["Academic Dean", "Lead Instructor / Coach", "Admissions Director", "Registrar"]
  },
  {
    id: "logistics_wholesale",
    name: "Logistics, Wholesale & 3PL",
    tagline: "B2B Wholesalers, Import/Export & Distribution",
    description: "Multi-warehouse bin locations, pick/pack/ship freight routing, tiered volume price lists, and fleet dispatch.",
    iconName: "Truck",
    themeColor: "bg-purple-600",
    accentColor: "text-purple-400",
    borderColor: "border-purple-500/30",
    subSectors: [
      "B2B Wholesale Distributor",
      "Import & Export Trading House",
      "3PL Fulfillment & Warehousing",
      "Freight & Courier Dispatch"
    ],
    operationModes: [
      { id: "wholesale_distribution", name: "Wholesale & Pallet Supply", description: "High volume orders, trade credit, and carton allocations.", badge: "📦 Wholesale" },
      { id: "fulfillment_3pl", name: "Pick / Pack / Ship Logistics", description: "Barcode bin location scanning and freight manifest.", badge: "🚚 3PL" }
    ],
    defaultModules: [
      "/inventory",
      "/purchase",
      "/sales",
      "/accounting",
      "/crm",
      "/crm/leads-pool",
      "/contacts",
      "/employees",
      "/barcode",
      "/reports"
    ],
    specializedRoutes: [
      { name: "Warehouse Operations", href: "/inventory/operations", icon: "Package" },
      { name: "Multi-Warehouses", href: "/inventory/warehouses", icon: "Building" }
    ],
    defaultDepartments: ["Warehouse Operations", "Logistics & Fleet", "B2B Sales", "Procurement"],
    defaultRoles: ["Logistics Director", "Warehouse Manager", "Freight Coordinator", "Wholesale Account Lead"]
  },
  {
    id: "construction_contracting",
    name: "Construction & Contracting",
    tagline: "General Contractors, MEP, Fitouts & Builders",
    description: "Job site daily logs, subcontractor compliance, material requisitions, and progress milestone billing.",
    iconName: "HardHat",
    themeColor: "bg-yellow-600",
    accentColor: "text-yellow-400",
    borderColor: "border-yellow-500/30",
    subSectors: [
      "General Construction Contractor",
      "MEP (Mechanical, Electrical, Plumbing)",
      "Interior Fitout & Architecture",
      "Civil Engineering & Infrastructure"
    ],
    operationModes: [
      { id: "fixed_contract", name: "Progress Billing Contracts", description: "AIA milestone billing with retention deductions.", badge: "🏗️ Milestone" },
      { id: "time_material", name: "Cost Plus / Time & Material", description: "Actual labor, equipment, and subcontractor pass-through.", badge: "⚡ Cost-Plus" }
    ],
    defaultModules: [
      "/project",
      "/timesheets",
      "/purchase",
      "/accounting",
      "/documents",
      "/team",
      "/employees",
      "/sign",
      "/reports",
      "/crm/leads-pool"
    ],
    specializedRoutes: [
      { name: "Site Projects & Gantt", href: "/project", icon: "CheckSquare" },
      { name: "Labor Timesheets", href: "/timesheets", icon: "Clock" }
    ],
    defaultDepartments: ["Site Engineering", "Project Management", "Subcontractor Sourcing", "Safety & Compliance"],
    defaultRoles: ["Project Executive", "Site Superintendent", "Quantity Surveyor", "Safety Inspector"]
  },
  {
    id: "fitness_sports_club",
    name: "Gyms, Fitness & Sports / Padel Clubs",
    tagline: "Padel Clubs, Fitness Gyms, Martial Arts & Sports Arenas",
    description: "Court & arena bookings, membership tiers & pass renewals, biometric turnstile check-in, class schedules, and pro-shop POS.",
    iconName: "Dumbbell",
    themeColor: "bg-emerald-600",
    accentColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    subSectors: [
      "Padel & Racquet Club (Indoor/Outdoor)",
      "Fitness Gym & Strength Center",
      "CrossFit, Boxing & Martial Arts Dojo",
      "Yoga, Pilates & Wellness Studio",
      "Swimming Pool & Aquatic Club",
      "Multi-Sport & Turf Arena",
      "Golf Simulator & Country Club"
    ],
    operationModes: [
      { id: "court_facility_booking", name: "Court & Arena Booking", description: "60/90-min court reservations with racket & ball rental add-ons.", badge: "🎾 Court Booking" },
      { id: "membership_tiers", name: "Tiered Memberships & Passes", description: "Monthly/annual memberships with RFID & turnstile check-in.", badge: "🎟️ Membership" },
      { id: "class_personal_training", name: "Group Classes & PT Sessions", description: "Class schedules, trainer rosters, and punch-card packages.", badge: "🏋️ Group & PT" }
    ],
    defaultModules: [
      "/club",
      "/pos",
      "/appointments",
      "/calendar",
      "/attendances",
      "/accounting",
      "/contacts",
      "/employees",
      "/planning",
      "/sign",
      "/forms",
      "/reports",
      "/crm/leads-pool"
    ],
    specializedRoutes: [
      { name: "Club & Facility Hub", href: "/club", icon: "Dumbbell" },
      { name: "Court & Bay Matrix", href: "/club", icon: "Calendar" },
      { name: "Membership Passes", href: "/club", icon: "CreditCard" }
    ],
    defaultDepartments: ["Front Desk & Court Operations", "Fitness Coaching & Personal Trainers", "Pro Shop & Clubhouse Cafe", "Facility & Court Maintenance", "Member Relations & Sales"],
    defaultRoles: ["Club Operations Director", "Head Padel / Tennis Coach", "Head Fitness Trainer", "Front Desk Concierge", "Court Maintenance Lead", "Membership Sales Lead"]
  },
  {
    id: "ngos",
    name: "NGOs (Non-Governmental & Non-Profits)",
    tagline: "Humanitarian Aid, Foundations, Charities & Grant Programs",
    description: "Donor & grant lifecycle tracking, restricted fund accounting, field relief distribution, volunteer rosters, and impact reporting.",
    iconName: "HeartHandshake",
    themeColor: "bg-rose-600",
    accentColor: "text-rose-400",
    borderColor: "border-rose-500/30",
    subSectors: [
      "Humanitarian & Disaster Relief NGO",
      "Charitable Foundation & Endowment",
      "International Development Organization",
      "Environmental & Climate Action NGO",
      "Education, Health & Social Welfare Trust",
      "Advocacy, Civil Society & Non-Profit"
    ],
    operationModes: [
      { id: "grant_donor_fund", name: "Grant & Donor Fund Management", description: "Track institutional grants, recurring donors, and restricted fund allocations.", badge: "🤝 Grants & Donors" },
      { id: "field_relief_ops", name: "Field Relief & Aid Distribution", description: "Manage field projects, relief kit inventory, and beneficiary outreach.", badge: "🌍 Field Operations" },
      { id: "volunteer_campaigns", name: "Volunteer & Fundraising Campaigns", description: "Coordinate volunteer mobilization, community events, and public pledges.", badge: "❤️ Campaigns" }
    ],
    defaultModules: [
      "/ngos",
      "/crm",
      "/crm/leads-pool",
      "/accounting",
      "/project",
      "/contacts",
      "/documents",
      "/employees",
      "/surveys",
      "/sign",
      "/calendar",
      "/forms",
      "/reports"
    ],
    specializedRoutes: [
      { name: "NGOs & Grants Hub", href: "/ngos", icon: "HeartHandshake" },
      { name: "Field Projects & Impact", href: "/project", icon: "CheckSquare" },
      { name: "Beneficiary Surveys", href: "/surveys", icon: "MessageSquare" }
    ],
    defaultDepartments: [
      "Donor Relations & Fundraising",
      "Grants & Compliance",
      "Field Operations & Programs",
      "Finance & Fund Accounting",
      "Volunteer Coordination"
    ],
    defaultRoles: [
      "Executive Director",
      "Country Director",
      "Head of Grants & Partnerships",
      "Program Manager",
      "Fundraising & Donor Lead",
      "Field Operations Coordinator"
    ]
  },
  {
    id: "call_center",
    name: "Call Center, BPO & Outbound Sales",
    tagline: "Lead Sheets, Agent Dialer, Restricted Access & Public Intake Forms",
    description: "Built for outbound telemarketing, inbound support desks, and BPO teams managing Google Sheets/Excel lead lists with strict agent permissions.",
    iconName: "Headphones",
    themeColor: "bg-cyan-600",
    accentColor: "text-cyan-400",
    borderColor: "border-cyan-500/30",
    subSectors: [
      "Outbound Telemarketing & Lead Gen",
      "Inbound Customer Support & Helpdesk",
      "BPO & Multi-Campaign Operations",
      "Appointment Setting & Qualification"
    ],
    operationModes: [
      { id: "outbound_dialer", name: "Outbound Dialer & Lead Sheet", description: "Import Excel/Google Sheets, restrict agent visibility, and track call outcomes.", badge: "📞 Outbound" },
      { id: "inbound_bpo", name: "Inbound Desk & Public Forms", description: "Capture web inquiries via public forms directly into agent queues.", badge: "🎧 Inbound" },
      { id: "hybrid_bpo", name: "Full Multi-Campaign BPO", description: "Simultaneous outbound campaigns, public intake forms, and manager approvals.", badge: "⚡ Hybrid" }
    ],
    defaultModules: [
      "/call-center",
      "/forms",
      "/crm",
      "/spreadsheets",
      "/helpdesk",
      "/contacts",
      "/team",
      "/approvals",
      "/attendances",
      "/payroll",
      "/reports",
      "/crm/leads-pool"
    ],
    specializedRoutes: [
      { name: "Call Center & Lead Sheet", href: "/call-center", icon: "PhoneCall" },
      { name: "Public Lead Forms", href: "/forms", icon: "ClipboardList" },
      { name: "CRM Pipeline", href: "/crm", icon: "Target" },
      { name: "Sheets (Excel)", href: "/spreadsheets", icon: "FileSpreadsheet" }
    ],
    defaultDepartments: [
      "Outbound Sales & Telemarketing",
      "Inbound Support Desk",
      "Quality Assurance & Coaching",
      "Lead Data & Operations",
      "HR & Shift Scheduling"
    ],
    defaultRoles: [
      "Call Center Director",
      "Floor Supervisor / Team Lead",
      "Senior Telemarketer / Closer",
      "Support Agent",
      "QA Analyst"
    ]
  },
  {
    id: "hospitality_travel",
    name: "Hospitality, Hotels, Resorts & Travel",
    tagline: "Hotels, Resorts, Event Venues, Tour Operators & Travel Agencies",
    description: "Guest room & event bookings, restaurant & room-service POS, housekeeping shifts, travel package itineraries, and invoicing.",
    iconName: "Building",
    themeColor: "bg-violet-600",
    accentColor: "text-violet-400",
    borderColor: "border-violet-500/30",
    subSectors: [
      "Boutique Hotel & Luxury Resort",
      "Serviced Apartments & Guest House",
      "Travel Agency & Tour Operator",
      "Event, Banquet & Wedding Venue",
      "Holiday Rental & Hospitality Group"
    ],
    operationModes: [
      { id: "hotel_resort_ops", name: "Hotel Rooms, F&B & Front Desk", description: "Room check-in/out, restaurant POS, housekeeping & guest billing.", badge: "🏨 Hotel & F&B" },
      { id: "travel_tour_agency", name: "Travel Packages & Bookings", description: "Client itineraries, visa/flight bookings, CRM leads, and agency billing.", badge: "✈️ Travel Agency" },
      { id: "event_banquet_venue", name: "Event & Banquet Management", description: "Hall reservations, catering packages, contracts & milestone payments.", badge: "🎉 Events" }
    ],
    defaultModules: [
      "/real-estate",
      "/appointments",
      "/pos",
      "/pos/kds",
      "/pos/tables",
      "/crm",
      "/forms",
      "/calendar",
      "/accounting",
      "/inventory",
      "/employees",
      "/planning",
      "/attendances",
      "/helpdesk",
      "/reports",
      "/crm/leads-pool"
    ],
    specializedRoutes: [
      { name: "Rooms & Units Hub", href: "/real-estate", icon: "Building" },
      { name: "Bookings & Reservations", href: "/appointments", icon: "Calendar" },
      { name: "Restaurant & Room POS", href: "/pos", icon: "ShoppingBag" }
    ],
    defaultDepartments: [
      "Front Desk & Concierge",
      "Housekeeping & Facilities",
      "Food, Beverage & Banquet",
      "Travel Desk & Reservations",
      "Finance & Guest Billing"
    ],
    defaultRoles: [
      "General Manager",
      "Front Office Manager",
      "Executive Housekeeper",
      "Travel & Tour Consultant",
      "Event & Banquet Coordinator"
    ]
  },
  {
    id: "agriculture_agritech",
    name: "Agriculture, Farming, Livestock & Solar/Energy",
    tagline: "Agribusiness, Crop & Dairy Farms, Solar Installers & Field Services",
    description: "Crop/livestock batch inventory, feed & fertilizer BOM recipes, field installation projects, equipment maintenance, and wholesale distribution.",
    iconName: "Truck",
    themeColor: "bg-lime-600",
    accentColor: "text-lime-400",
    borderColor: "border-lime-500/30",
    subSectors: [
      "Commercial Crop & Greenhouse Farming",
      "Dairy, Poultry & Livestock Ranch",
      "Agri-Input, Seed & Fertilizer Supply",
      "Solar, Renewable Energy & Field Installation",
      "Cold Chain & Produce Export"
    ],
    operationModes: [
      { id: "farm_batch_production", name: "Farm & Livestock Batch Yield", description: "Track feed/fertilizer inputs, harvest batches, warehouse stock & B2B sales.", badge: "🌾 Farm & Yield" },
      { id: "field_solar_install", name: "Solar & Field Engineering", description: "Site surveys, equipment BOMs, installation projects, and maintenance tickets.", badge: "☀️ Field & Solar" }
    ],
    defaultModules: [
      "/inventory",
      "/manufacturing",
      "/purchase",
      "/sales",
      "/project",
      "/accounting",
      "/crm",
      "/forms",
      "/employees",
      "/attendances",
      "/barcode",
      "/reports",
      "/crm/leads-pool"
    ],
    specializedRoutes: [
      { name: "Stock & Warehouses", href: "/inventory", icon: "Package" },
      { name: "Batch & BOM Processing", href: "/manufacturing", icon: "Cog" },
      { name: "Field Projects", href: "/project", icon: "CheckSquare" }
    ],
    defaultDepartments: [
      "Farm & Field Operations",
      "Storage, Cold Chain & Logistics",
      "Procurement & Inputs",
      "Wholesale & Export Sales",
      "Equipment & Site Maintenance"
    ],
    defaultRoles: [
      "Farm / Operations Director",
      "Agronomist / Field Engineer",
      "Warehouse & Cold-Chain Supervisor",
      "Procurement Officer",
      "Wholesale Sales Manager"
    ]
  }
];

export interface BusinessExplanationResult {
  industryId: GlobalIndustryId;
  subSector: string;
  operationMode: string;
  suggestedCompanyName: string;
  recommendedModules: string[];
  matchedKeywords: string[];
  summary: string;
}

export function analyzeBusinessExplanation(description: string): BusinessExplanationResult {
  const text = (description || "").trim();
  const lower = text.toLowerCase();

  let industryId: GlobalIndustryId = "professional_services";
  let subSector = "";
  let operationMode = "";
  const extraModules = new Set<string>(["/dashboard", "/reports", "/settings", "/crm/leads-pool"]);
  const matchedKeywords: string[] = [];

  const has = (...words: string[]) => {
    for (const w of words) {
      if (lower.includes(w)) {
        if (!matchedKeywords.includes(w)) matchedKeywords.push(w);
        return true;
      }
    }
    return false;
  };

  // 1. Primary Industry Archetype Detection
  if (has("call center", "call centre", "bpo", "telemarketing", "outbound", "dialer", "cold call", "dispatch", "lead generation", "customer support center")) {
    industryId = "call_center";
    subSector = has("inbound", "support") ? "Inbound Customer Support & Helpdesk" : "BPO & Multi-Campaign Operations";
    operationMode = "hybrid_bpo";
  } else if (has("restaurant", "cafe", "coffee", "bakery", "pastry", "pizza", "burger", "bistro", "kitchen", "catering", "food truck", "dine", "qsr", "bar", "cloud kitchen")) {
    industryId = "food_beverage";
    subSector = has("bake", "pastry") ? "Artisan Bakery & Pastry Shop" : has("cafe", "coffee") ? "Specialty Coffee Cafe" : has("cloud") ? "Cloud / Ghost Kitchen" : "Quick Service Restaurant (QSR)";
    operationMode = has("cloud", "delivery") ? "cloud_kitchen" : "hybrid";
  } else if (has("supermarket", "grocery", "retail", "boutique", "store", "mart", "fashion", "apparel", "clothing", "electronics", "hardware store", "cosmetics", "minimart", "cashier")) {
    industryId = "retail_supermarket";
    subSector = has("supermarket", "grocery", "mart") ? "Supermarket & Grocery Store" : has("fashion", "cloth", "boutique", "apparel") ? "Fashion & Apparel Boutique" : has("electronic") ? "Electronics & Appliance Retail" : "Supermarket & Grocery Store";
    operationMode = has("online", "ecom", "website") ? "omnichannel" : "counter_pos";
  } else if (has("clinic", "hospital", "doctor", "dental", "dentist", "medical", "patient", "pharmacy", "salon", "spa", "wellness", "therapy", "physiotherapy", "aesthetic")) {
    industryId = "healthcare_wellness";
    subSector = has("dental", "dentist") ? "Dental Practice" : has("salon", "hair", "beauty") ? "Hair & Beauty Salon" : has("spa") ? "Luxury Spa & Wellness Center" : "Medical & Specialist Clinic";
    operationMode = "walkin_appointment";
  } else if (has("hotel", "resort", "motel", "hostel", "guest house", "travel", "tour", "tourism", "banquet", "event venue", "hospitality", "wedding hall")) {
    industryId = "hospitality_travel";
    subSector = has("travel", "tour") ? "Travel Agency & Tour Operator" : has("event", "banquet", "wedding") ? "Event, Banquet & Wedding Venue" : "Boutique Hotel & Luxury Resort";
    operationMode = has("travel", "tour") ? "travel_tour_agency" : "hotel_resort_ops";
  } else if (has("padel", "gym", "fitness", "sports", "club", "turf", "arena", "crossfit", "yoga", "pilates", "martial arts", "swimming", "court", "country club")) {
    industryId = "fitness_sports_club";
    subSector = has("padel", "tennis", "court", "racquet") ? "Padel & Racquet Club (Indoor/Outdoor)" : has("yoga", "pilates") ? "Yoga, Pilates & Wellness Studio" : "Fitness Gym & Strength Center";
    operationMode = has("padel", "court", "arena", "turf") ? "court_facility_booking" : "membership_tiers";
  } else if (has("auto", "car", "vehicle", "garage", "workshop", "mechanic", "repair", "detailing", "dealership", "spare parts", "tire", "tyre")) {
    industryId = "automotive_workshop";
    subSector = has("dealer", "showroom") ? "Auto Dealership & Showroom" : has("parts") ? "Auto Spare Parts Retailer" : "Auto Repair & Service Garage";
    operationMode = "garage_service";
  } else if (has("factory", "manufactur", "production", "assembly", "cnc", "fabrication", "textile", "garment", "mill", "packaging", "plant", "chemical")) {
    industryId = "manufacturing";
    subSector = has("textile", "garment") ? "Textile & Garment Factory" : has("cnc", "metal") ? "Metal & CNC Custom Fabrication" : "Discrete Product Manufacturing";
    operationMode = has("custom", "order") ? "make_to_order" : "make_to_stock";
  } else if (has("real estate", "property", "broker", "leasing", "tenant", "landlord", "rental", "apartment", "housing", "realtor")) {
    industryId = "real_estate";
    subSector = has("broker", "sale") ? "Real Estate Sales Brokerage" : "Residential Property Management";
    operationMode = has("broker", "sale") ? "sales_brokerage" : "leasing_management";
  } else if (has("construction", "contractor", "builder", "civil", "mep", "fitout", "architecture", "engineering", "renovation", "plumbing", "electrical")) {
    industryId = "construction_contracting";
    subSector = has("mep", "plumbing", "electrical") ? "MEP (Mechanical, Electrical, Plumbing)" : has("fitout", "interior") ? "Interior Fitout & Architecture" : "General Construction Contractor";
    operationMode = "fixed_contract";
  } else if (has("school", "college", "university", "academy", "education", "training", "institute", "student", "tuition", "coaching", "bootcamp", "e-learning")) {
    industryId = "education_academies";
    subSector = has("school", "college") ? "Private School & College" : "Training Academy & Institute";
    operationMode = "term_tuition";
  } else if (has("logistic", "warehouse", "wholesale", "distributor", "import", "export", "freight", "3pl", "courier", "shipping", "supply chain", "fleet", "trading")) {
    industryId = "logistics_wholesale";
    subSector = has("import", "export", "trading") ? "Import & Export Trading House" : has("3pl", "warehouse") ? "3PL Fulfillment & Warehousing" : "B2B Wholesale Distributor";
    operationMode = "wholesale_distribution";
  } else if (has("ngo", "non-profit", "nonprofit", "charity", "foundation", "humanitarian", "donor", "grant", "relief", "welfare", "trust")) {
    industryId = "ngos";
    subSector = "Humanitarian & Disaster Relief NGO";
    operationMode = "grant_donor_fund";
  } else if (has("farm", "agriculture", "agritech", "crop", "livestock", "dairy", "poultry", "solar", "renewable", "energy", "greenhouse")) {
    industryId = "agriculture_agritech";
    subSector = has("solar", "energy") ? "Solar, Renewable Energy & Field Installation" : has("dairy", "poultry", "livestock") ? "Dairy, Poultry & Livestock Ranch" : "Commercial Crop & Greenhouse Farming";
    operationMode = has("solar", "energy") ? "field_solar_install" : "farm_batch_production";
  } else {
    industryId = "professional_services";
    subSector = has("law", "legal") ? "Legal Practice & Law Firm" : has("account", "cpa", "tax", "audit") ? "Accounting & CPA Audit Firm" : has("design", "marketing", "creative", "media") ? "Design, Branding & Creative Studio" : "Software & IT Engineering Agency";
    operationMode = "hourly_billable";
  }

  const ind = getIndustryById(industryId);
  if (!subSector) subSector = ind.subSectors[0] || "";
  if (!operationMode) operationMode = ind.operationModes[0]?.id || "default";

  // Start with industry's default modules
  ind.defaultModules.forEach(m => extraModules.add(m));

  // 2. Additive Capability Detection (Cross-Industry Hybrid Businesses!)
  // If a user describes multiple business needs (e.g. "We run a supermarket AND a restaurant with online shop and call center"),
  // automatically enable every mentioned module too!
  if (has("pos", "point of sale", "cashier", "checkout", "counter", "billing counter")) extraModules.add("/pos");
  if (has("kitchen", "kds", "chef", "cooking", "dine", "menu")) {
    extraModules.add("/pos");
    extraModules.add("/pos/kds");
    extraModules.add("/pos/tables");
    extraModules.add("/pos/recipes");
  }
  if (has("barcode", "scanner", "sku", "label")) {
    extraModules.add("/barcode");
    extraModules.add("/inventory");
  }
  if (has("inventory", "stock", "warehouse", "product", "item", "supply")) extraModules.add("/inventory");
  if (has("purchase", "vendor", "supplier", "procurement", "buying")) extraModules.add("/purchase");
  if (has("invoice", "accounting", "finance", "ledger", "tax", "vat", "billing", "expense", "profit")) extraModules.add("/accounting");
  if (has("sale", "quotation", "order", "b2b")) extraModules.add("/sales");
  if (has("crm", "lead", "deal", "pipeline", "client", "prospect", "sales team")) {
    extraModules.add("/crm");
    extraModules.add("/contacts");
  }
  if (has("call", "dialer", "campaign", "telemarketing", "agent", "outbound")) extraModules.add("/call-center");
  if (has("form", "intake", "submission", "registration", "inquiry")) extraModules.add("/forms");
  if (has("employee", "staff", "hr", "salary", "payroll", "attendance", "shift", "leave", "hiring", "recruit")) {
    extraModules.add("/employees");
    extraModules.add("/payroll");
    extraModules.add("/attendances");
    extraModules.add("/team");
  }
  if (has("recruit", "hiring", "job opening", "applicant", "cv")) extraModules.add("/recruitment");
  if (has("project", "task", "milestone", "timesheet", "agile", "client work")) {
    extraModules.add("/project");
    extraModules.add("/timesheets");
    extraModules.add("/todo");
  }
  if (has("manufactur", "bom", "factory", "recipe", "production", "work order")) extraModules.add("/manufacturing");
  if (has("website", "online store", "ecommerce", "e-commerce", "shop online")) {
    extraModules.add("/website");
    extraModules.add("/shop");
  }
  if (has("appointment", "booking", "schedule", "reservation", "calendar")) {
    extraModules.add("/appointments");
    extraModules.add("/calendar");
  }
  if (has("contract", "signature", "nda", "sign", "agreement")) {
    extraModules.add("/sign");
    extraModules.add("/employees/contracts");
  }
  if (has("support", "ticket", "helpdesk", "complaint", "issue")) extraModules.add("/helpdesk");
  if (has("excel", "sheet", "spreadsheet", "word", "doc", "presentation", "slide", "ppt")) {
    extraModules.add("/spreadsheets");
    extraModules.add("/documents");
    extraModules.add("/slides");
  }
  if (has("approval", "manager", "hierarchy", "permission")) {
    extraModules.add("/approvals");
    extraModules.add("/team");
  }

  // Always include core collaboration & BI apps for paid workspaces
  extraModules.add("/reports");
  extraModules.add("/forms");
  extraModules.add("/team");
  extraModules.add("/approvals");

  const recommendedModules = Array.from(extraModules);
  const suggestedCompanyName =
    text.length >= 3 && text.length <= 28 && !text.includes(" ")
      ? text
      : `${ind.name.split(" ")[0].replace(",", "")} Workspace`;

  return {
    industryId,
    subSector,
    operationMode,
    suggestedCompanyName,
    recommendedModules,
    matchedKeywords,
    summary: `Configured for ${ind.name} (${subSector}) with ${recommendedModules.length} tailored ERP & CRM apps.`
  };
}

export function getIndustryById(id: string): IndustryArchetype {
  return GLOBAL_INDUSTRIES.find(i => i.id === id) || GLOBAL_INDUSTRIES[0];
}
