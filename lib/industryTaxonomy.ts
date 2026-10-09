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
  | "fitness_sports_club";

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
      "/attendances"
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
      "/crm",
      "/crm/leads-pool",
      "/sales",
      "/accounting",
      "/documents",
      "/team",
      "/employees",
      "/payroll",
      "/meet",
      "/sign"
    ],
    specializedRoutes: [
      { name: "Project Timesheets", href: "/timesheets", icon: "Clock" },
      { name: "Project Milestones", href: "/project", icon: "CheckSquare" },
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
      "/timesheets"
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
      "/helpdesk"
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
      "/barcode"
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
      "/crm/leads-pool"
    ],
    specializedRoutes: [
      { name: "Club & Facility Hub", href: "/club", icon: "Dumbbell" },
      { name: "Court & Bay Matrix", href: "/club", icon: "Calendar" },
      { name: "Membership Passes", href: "/club", icon: "CreditCard" }
    ],
    defaultDepartments: ["Front Desk & Court Operations", "Fitness Coaching & Personal Trainers", "Pro Shop & Clubhouse Cafe", "Facility & Court Maintenance", "Member Relations & Sales"],
    defaultRoles: ["Club Operations Director", "Head Padel / Tennis Coach", "Head Fitness Trainer", "Front Desk Concierge", "Court Maintenance Lead", "Membership Sales Lead"]
  }
];

export function getIndustryById(id: string): IndustryArchetype {
  return GLOBAL_INDUSTRIES.find(i => i.id === id) || GLOBAL_INDUSTRIES[0];
}
