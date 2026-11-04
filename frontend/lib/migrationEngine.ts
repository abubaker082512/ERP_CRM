/**
 * Beraxis Universal Migration Engine
 * Converts exports from QuickBooks, Odoo, HubSpot, Salesforce, Zoho, Toast, Square, and Excel
 * into validated Beraxis ERP & CRM records with zero data loss.
 */

export type MigrationPlatform = 
    | "quickbooks" 
    | "odoo" 
    | "hubspot" 
    | "salesforce" 
    | "zoho" 
    | "toast" 
    | "square" 
    | "custom_csv";

export type TargetEntity = 
    | "customers" 
    | "invoices" 
    | "products" 
    | "chart_of_accounts";

export interface PlatformPreset {
    id: MigrationPlatform;
    name: string;
    description: string;
    badgeColor: string;
    accentColor: string;
    logoIcon: string;
    supportedEntities: TargetEntity[];
    exportSteps: {
        customers: string[];
        invoices: string[];
        products: string[];
        chart_of_accounts: string[];
    };
    sampleHeaders: Record<TargetEntity, string[]>;
}

export interface FieldMapping {
    sourceColumn: string;
    targetField: string;
    confidence: "high" | "medium" | "low" | "manual" | "ignored";
    sampleValue?: string;
    transform?: (val: any) => any;
}

export interface EntityFieldDefinition {
    key: string;
    label: string;
    required: boolean;
    type: "string" | "number" | "date" | "email" | "phone" | "currency";
    description: string;
    synonyms: string[];
    defaultValue?: any;
}

export interface ParsedRow {
    _rawIndex: number;
    _status: "valid" | "warning" | "error" | "duplicate";
    _issues: string[];
    [key: string]: any;
}

export interface MigrationSummary {
    totalRows: number;
    validRows: number;
    warningRows: number;
    duplicateRows: number;
    errorRows: number;
    targetEntity: TargetEntity;
    platform: MigrationPlatform;
    importedAt: string;
    financialTotal?: number;
}

// -----------------------------------------------------------------------------
// Platform Presets & Export Guides
// -----------------------------------------------------------------------------
export const PLATFORM_PRESETS: Record<MigrationPlatform, PlatformPreset> = {
    quickbooks: {
        id: "quickbooks",
        name: "QuickBooks (Online & Desktop)",
        description: "Migrate Customers, Invoices, Items & Chart of Accounts from Intuit QuickBooks.",
        badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        accentColor: "#2CA01C",
        logoIcon: "QB",
        supportedEntities: ["customers", "invoices", "products", "chart_of_accounts"],
        exportSteps: {
            customers: [
                "Open QuickBooks and navigate to Sales > Customers.",
                "Click the Export to Excel / CSV icon (top right above customer list).",
                "Save the generated `.csv` or `.xlsx` file and drop it here."
            ],
            invoices: [
                "Navigate to Reports > Invoices / Transaction List by Customer.",
                "Set date range to 'All Dates' or your desired historical horizon.",
                "Click the Export button (Envelope/Download icon) > Export to CSV."
            ],
            products: [
                "Navigate to Sales > Products and Services.",
                "Click the Export icon above the table.",
                "Export Items, SKU, and Quantity on Hand to CSV."
            ],
            chart_of_accounts: [
                "Navigate to Accounting > Chart of Accounts.",
                "Click the Batch Actions or Table Export icon > Export to Excel/CSV."
            ]
        },
        sampleHeaders: {
            customers: ["Customer", "Company", "Email", "Phone", "Open Balance", "Billing Address", "City", "State", "ZIP"],
            invoices: ["Date", "Transaction Type", "No.", "Customer", "Due Date", "Amount", "Balance", "Status"],
            products: ["Product/Service Name", "SKU", "Type", "Sales Price", "Cost", "Quantity on Hand", "Reorder Point"],
            chart_of_accounts: ["Account", "Account Type", "Detail Type", "QuickBooks Balance", "Currency"]
        }
    },
    odoo: {
        id: "odoo",
        name: "Odoo ERP (Community & Enterprise)",
        description: "Direct CSV export from Odoo res.partner, account.move, and product.template.",
        badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        accentColor: "#714B67",
        logoIcon: "OD",
        supportedEntities: ["customers", "invoices", "products", "chart_of_accounts"],
        exportSteps: {
            customers: [
                "In Odoo, navigate to Contacts (or CRM > Customers).",
                "Select all contacts using the top checkbox.",
                "Click Action > Export > Choose 'I want to update data (import-compatible)' > CSV."
            ],
            invoices: [
                "Navigate to Invoicing / Accounting > Customers > Invoices.",
                "Filter by Posted / All.",
                "Click Action > Export > Select Partner, Number, Date, Total, and Status."
            ],
            products: [
                "Navigate to Inventory > Products > Products.",
                "Select all items > Action > Export > CSV."
            ],
            chart_of_accounts: [
                "Navigate to Accounting > Configuration > Chart of Accounts.",
                "Click Action > Export > Code, Name, Account Type."
            ]
        },
        sampleHeaders: {
            customers: ["Name", "Display Name", "Email", "Phone", "Mobile", "Street", "City", "Country/Name", "Total Invoiced"],
            invoices: ["Number", "Customer/Name", "Invoice Date", "Due Date", "Total", "Untaxed Amount", "Payment State", "Status"],
            products: ["Name", "Internal Reference", "Sales Price", "Cost", "Quantity On Hand", "Product Category/Name"],
            chart_of_accounts: ["Code", "Name", "Type", "Internal Group", "Opening Balance"]
        }
    },
    hubspot: {
        id: "hubspot",
        name: "HubSpot CRM",
        description: "Import Contacts, Companies, and Pipeline Deals exported from HubSpot.",
        badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        accentColor: "#FF7A59",
        logoIcon: "HS",
        supportedEntities: ["customers", "invoices"],
        exportSteps: {
            customers: [
                "In HubSpot, go to CRM > Contacts (or Companies).",
                "Click 'Export' button in the upper right.",
                "Choose CSV format and 'All contacts on all pages'. Check includes all properties."
            ],
            invoices: [
                "Go to Sales > Invoices (or Deals).",
                "Click Export > CSV format > All properties."
            ],
            products: [
                "Go to Settings > Objects > Products > Actions > Export to CSV."
            ],
            chart_of_accounts: [
                "HubSpot does not manage GL. Use QuickBooks or Excel preset for COA."
            ]
        },
        sampleHeaders: {
            customers: ["First Name", "Last Name", "Email", "Phone Number", "Company Name", "Associated Company", "Lifecycle Stage", "Lead Status"],
            invoices: ["Invoice Number", "Associated Deals", "Total Amount", "Amount Billed", "Status", "Issue Date", "Due Date"],
            products: ["Product Name", "SKU", "Unit Price", "Cost of Goods Sold"],
            chart_of_accounts: ["Account Code", "Account Name", "Type"]
        }
    },
    salesforce: {
        id: "salesforce",
        name: "Salesforce CRM",
        description: "Direct report export from Salesforce Accounts, Contacts, and Opportunities.",
        badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        accentColor: "#00A1E0",
        logoIcon: "SF",
        supportedEntities: ["customers", "invoices", "products"],
        exportSteps: {
            customers: [
                "In Salesforce, open Reports > New Report > Accounts & Contacts.",
                "Add columns: Account Name, Contact Name, Email, Phone, Billing City, Annual Revenue.",
                "Run report > Click triangle next to Edit > Export > Details Only > CSV."
            ],
            invoices: [
                "Open Reports > Opportunities with Products or Invoices > Export to CSV."
            ],
            products: [
                "Open Reports > Products Report > Export > CSV."
            ],
            chart_of_accounts: []
        },
        sampleHeaders: {
            customers: ["Account Name", "Full Name", "Email", "Phone", "Billing Street", "Billing City", "Billing State/Province", "Annual Revenue"],
            invoices: ["Opportunity Name", "Amount", "Stage", "Close Date", "Account Name", "Invoice ID"],
            products: ["Product Name", "Product Code", "Active", "Standard Price"],
            chart_of_accounts: []
        }
    },
    zoho: {
        id: "zoho",
        name: "Zoho CRM & Books",
        description: "Migrate customer rosters, items, and invoices from Zoho Books or Zoho CRM.",
        badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        accentColor: "#D62027",
        logoIcon: "ZH",
        supportedEntities: ["customers", "invoices", "products", "chart_of_accounts"],
        exportSteps: {
            customers: [
                "In Zoho Books / CRM, go to Customers > Hamburger Menu (top right) > Export Customers.",
                "Choose 'CSV' as the export file format.",
                "Click Export."
            ],
            invoices: [
                "Go to Sales > Invoices > Top Right Menu > Export Invoices > CSV."
            ],
            products: [
                "Go to Items > Menu > Export Items > CSV."
            ],
            chart_of_accounts: [
                "Go to Accountant > Chart of Accounts > Export > CSV."
            ]
        },
        sampleHeaders: {
            customers: ["Customer Name", "Company Name", "Contact Email", "Phone", "Outstanding Receivables", "Billing Address"],
            invoices: ["Invoice Number", "Customer Name", "Invoice Date", "Due Date", "Total", "Balance Due", "Status"],
            products: ["Item Name", "SKU", "Rate", "Purchase Rate", "Stock on Hand", "Reorder Level"],
            chart_of_accounts: ["Account Code", "Account Name", "Account Type", "Current Balance"]
        }
    },
    toast: {
        id: "toast",
        name: "Toast POS",
        description: "Restaurant menu items, guests, orders, and sales mix exports from Toast.",
        badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        accentColor: "#F46036",
        logoIcon: "TO",
        supportedEntities: ["customers", "invoices", "products"],
        exportSteps: {
            customers: [
                "In Toast POS backend, navigate to Guests / Loyalty > Export Guests > CSV."
            ],
            invoices: [
                "Navigate to Reports > Order Details / Sales Summary > Export > CSV."
            ],
            products: [
                "Navigate to Menus > Menu Items > Export Menu Data > CSV."
            ],
            chart_of_accounts: []
        },
        sampleHeaders: {
            customers: ["Guest Name", "Email", "Phone", "Lifetime Visits", "Total Spend", "Last Visit"],
            invoices: ["Order #", "Server", "Paid Date", "Subtotal", "Tax", "Tip", "Total", "Payment Method"],
            products: ["Menu Item", "POS Name", "Category", "Price", "Cost", "PLU/SKU", "Kitchen Station"],
            chart_of_accounts: []
        }
    },
    square: {
        id: "square",
        name: "Square POS & Invoicing",
        description: "Item catalog, customer directory, and invoices exported from Square Dashboard.",
        badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        accentColor: "#006AFF",
        logoIcon: "SQ",
        supportedEntities: ["customers", "invoices", "products"],
        exportSteps: {
            customers: [
                "In Square Dashboard, go to Customers > Directory.",
                "Click Export Customers > All Customers > Export CSV."
            ],
            invoices: [
                "Go to Invoices > Actions > Export Invoices > CSV."
            ],
            products: [
                "Go to Items > Item Library > Actions > Export Library > Excel / CSV."
            ],
            chart_of_accounts: []
        },
        sampleHeaders: {
            customers: ["Reference ID", "First Name", "Last Name", "Email Address", "Phone Number", "Total Spent", "Total Visits"],
            invoices: ["Invoice ID", "Customer Name", "Created Date", "Due Date", "Total", "Amount Paid", "Status"],
            products: ["Item Name", "Variation Name", "SKU", "Price", "Current Quantity", "Category"],
            chart_of_accounts: []
        }
    },
    custom_csv: {
        id: "custom_csv",
        name: "Custom CSV / Excel Spreadsheets",
        description: "Universal spreadsheet importer with smart heuristic column mapping.",
        badgeColor: "bg-slate-500/10 text-slate-300 border-slate-500/20",
        accentColor: "#64748B",
        logoIcon: "XL",
        supportedEntities: ["customers", "invoices", "products", "chart_of_accounts"],
        exportSteps: {
            customers: [
                "Export your customer table from any ERP or spreadsheet as `.csv`.",
                "Ensure columns have clear headers like Name, Email, Phone, Balance, Address."
            ],
            invoices: [
                "Export invoice registers with Date, Number, Customer, Amount, Status."
            ],
            products: [
                "Export products with Item Name, SKU/Barcode, Price, Cost, Stock."
            ],
            chart_of_accounts: [
                "Export account listings with Code, Name, Type, and Opening Balance."
            ]
        },
        sampleHeaders: {
            customers: ["Name", "Company", "Email", "Phone", "Balance", "Address", "City"],
            invoices: ["Invoice_Number", "Date", "Customer", "Amount", "Due_Date", "Status"],
            products: ["Title", "SKU", "Unit_Price", "Cost", "Stock_Quantity", "Category"],
            chart_of_accounts: ["Account_Number", "Account_Name", "Type", "Balance"]
        }
    }
};

// -----------------------------------------------------------------------------
// Target Entity Definitions & Heuristic Synonyms
// -----------------------------------------------------------------------------
export const TARGET_ENTITY_FIELDS: Record<TargetEntity, EntityFieldDefinition[]> = {
    customers: [
        {
            key: "name",
            label: "Customer / Contact Name",
            required: true,
            type: "string",
            description: "Primary contact or company display name",
            synonyms: ["name", "customer", "customer name", "contact name", "client", "full name", "display name", "company", "account name", "guest name"]
        },
        {
            key: "company",
            label: "Company / Organization",
            required: false,
            type: "string",
            description: "Corporate or legal entity name",
            synonyms: ["company", "company name", "organization", "account", "business", "business name", "associated company"]
        },
        {
            key: "email",
            label: "Email Address",
            required: false,
            type: "email",
            description: "Primary contact email address for quotes and invoices",
            synonyms: ["email", "e-mail", "email address", "contact email", "customer email", "electronic mail", "billing email"]
        },
        {
            key: "phone",
            label: "Phone / WhatsApp",
            required: false,
            type: "phone",
            description: "Direct dial or mobile contact number",
            synonyms: ["phone", "phone number", "telephone", "mobile", "mobile phone", "cell", "cell phone", "tel", "whatsapp", "contact number"]
        },
        {
            key: "balance",
            label: "Outstanding Balance",
            required: false,
            type: "currency",
            defaultValue: 0,
            description: "Current historical accounts receivable balance",
            synonyms: ["balance", "open balance", "outstanding balance", "receivables", "ar balance", "total due", "outstanding receivables", "balance due", "amount due"]
        },
        {
            key: "address",
            label: "Billing Address",
            required: false,
            type: "string",
            description: "Street address line",
            synonyms: ["address", "billing address", "street", "street address", "billing street", "address line 1", "addr"]
        },
        {
            key: "city",
            label: "City",
            required: false,
            type: "string",
            description: "City or municipality",
            synonyms: ["city", "billing city", "town", "municipality"]
        },
        {
            key: "country",
            label: "Country",
            required: false,
            type: "string",
            defaultValue: "United States",
            description: "Country of residence",
            synonyms: ["country", "country/name", "billing country", "nation", "state", "region"]
        }
    ],
    invoices: [
        {
            key: "number",
            label: "Invoice Number",
            required: true,
            type: "string",
            description: "Official document or sequential reference number",
            synonyms: ["invoice number", "invoice #", "number", "no.", "no", "invoice id", "transaction number", "doc number", "order #", "reference"]
        },
        {
            key: "partner_name",
            label: "Customer / Client",
            required: true,
            type: "string",
            description: "Name of the billed customer",
            synonyms: ["customer", "customer name", "client", "partner", "partner/name", "account name", "billed to", "guest"]
        },
        {
            key: "date",
            label: "Invoice Date",
            required: true,
            type: "date",
            description: "Issue date of the invoice",
            synonyms: ["date", "invoice date", "issue date", "created date", "txn date", "bill date", "paid date"]
        },
        {
            key: "due_date",
            label: "Due Date",
            required: false,
            type: "date",
            description: "Payment due date",
            synonyms: ["due date", "payment due", "terms date", "expire date"]
        },
        {
            key: "amount_total",
            label: "Total Amount",
            required: true,
            type: "currency",
            description: "Grand total invoice amount including tax",
            synonyms: ["amount", "total", "total amount", "grand total", "subtotal", "invoice amount", "amount total", "balance"]
        },
        {
            key: "status",
            label: "Payment Status",
            required: false,
            type: "string",
            defaultValue: "Posted",
            description: "Current invoice state (Paid, Posted, Draft, Overdue)",
            synonyms: ["status", "payment status", "state", "payment state", "invoice status", "stage"]
        }
    ],
    products: [
        {
            key: "name",
            label: "Product / Item Name",
            required: true,
            type: "string",
            description: "Name of the product, service, or menu item",
            synonyms: ["name", "item name", "product name", "product/service name", "title", "menu item", "pos name", "item"]
        },
        {
            key: "sku",
            label: "SKU / Internal Code",
            required: false,
            type: "string",
            description: "Stock keeping unit, barcode, or internal reference",
            synonyms: ["sku", "code", "product code", "internal reference", "barcode", "plu", "plu/sku", "item number", "item #"]
        },
        {
            key: "list_price",
            label: "Sales Price",
            required: true,
            type: "currency",
            description: "Standard retail or selling price",
            synonyms: ["price", "sales price", "unit price", "rate", "retail price", "selling price", "standard price", "amount"]
        },
        {
            key: "standard_price",
            label: "Cost Price",
            required: false,
            type: "currency",
            defaultValue: 0,
            description: "Cost of goods sold (COGS) or purchase rate",
            synonyms: ["cost", "cost price", "purchase rate", "cogs", "cost of goods", "buy price"]
        },
        {
            key: "qty_available",
            label: "Quantity on Hand",
            required: false,
            type: "number",
            defaultValue: 0,
            description: "Current physical stock quantity",
            synonyms: ["quantity on hand", "qty on hand", "stock", "stock quantity", "quantity", "current quantity", "on hand", "inventory"]
        },
        {
            key: "category",
            label: "Category",
            required: false,
            type: "string",
            defaultValue: "All",
            description: "Product family or category",
            synonyms: ["category", "product category", "type", "menu category", "department", "group"]
        }
    ],
    chart_of_accounts: [
        {
            key: "code",
            label: "Account Code",
            required: true,
            type: "string",
            description: "General ledger account code (e.g., 1000, 2000)",
            synonyms: ["code", "account code", "account number", "account #", "number", "gl code"]
        },
        {
            key: "name",
            label: "Account Name",
            required: true,
            type: "string",
            description: "Account title (e.g., Accounts Receivable, Sales Revenue)",
            synonyms: ["account", "account name", "name", "title", "description"]
        },
        {
            key: "user_type",
            label: "Account Type",
            required: true,
            type: "string",
            description: "Asset, Liability, Equity, Revenue, Expense",
            synonyms: ["type", "account type", "category", "classification", "detail type", "group"]
        },
        {
            key: "opening_balance",
            label: "Opening Balance",
            required: false,
            type: "currency",
            defaultValue: 0,
            description: "Starting balance at migration time",
            synonyms: ["balance", "quickbooks balance", "opening balance", "current balance", "amount"]
        }
    ]
};

// -----------------------------------------------------------------------------
// Universal File Parser (CSV, TSV, JSON)
// -----------------------------------------------------------------------------
export function parseDelimitedText(rawText: string): { headers: string[]; rows: string[][] } {
    const cleanText = rawText.replace(/^\uFEFF/, ""); // Strip BOM
    const lines = cleanText.split(/\r\n|\n|\r/).filter(line => line.trim().length > 0);
    
    if (lines.length === 0) {
        return { headers: [], rows: [] };
    }

    // Auto-detect delimiter: comma vs tab vs semicolon
    const sampleLine = lines[0];
    const commas = (sampleLine.match(/,/g) || []).length;
    const tabs = (sampleLine.match(/\t/g) || []).length;
    const semicolons = (sampleLine.match(/;/g) || []).length;
    
    let delimiter = ",";
    if (tabs > commas && tabs > semicolons) delimiter = "\t";
    else if (semicolons > commas && semicolons > tabs) delimiter = ";";

    const parseLine = (line: string): string[] => {
        const tokens: string[] = [];
        let cur = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    cur += '"';
                    i++; // skip escaped quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === delimiter && !inQuotes) {
                tokens.push(cur.trim());
                cur = "";
            } else {
                cur += char;
            }
        }
        tokens.push(cur.trim());
        return tokens;
    };

    const headers = parseLine(lines[0]).map(h => h.replace(/^["']|["']$/g, "").trim());
    const rows = lines.slice(1).map(line => parseLine(line).map(cell => cell.replace(/^["']|["']$/g, "").trim()));

    return { headers, rows };
}

// -----------------------------------------------------------------------------
// AI Heuristic Column Matcher
// -----------------------------------------------------------------------------
export function autoMapColumns(
    sourceHeaders: string[],
    targetEntity: TargetEntity,
    sampleRows: string[][] = []
): FieldMapping[] {
    const targetFields = TARGET_ENTITY_FIELDS[targetEntity];
    const mappings: FieldMapping[] = [];
    const usedTargetKeys = new Set<string>();

    for (let colIdx = 0; colIdx < sourceHeaders.length; colIdx++) {
        const sourceHeader = sourceHeaders[colIdx];
        const normalizedSource = sourceHeader.toLowerCase().replace(/[^a-z0-9]/g, "");
        const sampleValue = sampleRows[0]?.[colIdx] || "";

        let bestMatch: { field: EntityFieldDefinition; confidence: "high" | "medium" | "low" } | null = null;

        for (const field of targetFields) {
            if (usedTargetKeys.has(field.key)) continue;

            const normalizedKey = field.key.toLowerCase().replace(/[^a-z0-9]/g, "");
            const normalizedLabel = field.label.toLowerCase().replace(/[^a-z0-9]/g, "");

            // Exact match
            if (normalizedSource === normalizedKey || normalizedSource === normalizedLabel) {
                bestMatch = { field, confidence: "high" };
                break;
            }

            // Synonym match
            for (const syn of field.synonyms) {
                const normalizedSyn = syn.toLowerCase().replace(/[^a-z0-9]/g, "");
                if (normalizedSource === normalizedSyn) {
                    bestMatch = { field, confidence: "high" };
                    break;
                } else if (normalizedSource.includes(normalizedSyn) || normalizedSyn.includes(normalizedSource)) {
                    if (!bestMatch) {
                        bestMatch = { field, confidence: "medium" };
                    }
                }
            }
        }

        if (bestMatch) {
            usedTargetKeys.add(bestMatch.field.key);
            mappings.push({
                sourceColumn: sourceHeader,
                targetField: bestMatch.field.key,
                confidence: bestMatch.confidence,
                sampleValue
            });
        } else {
            mappings.push({
                sourceColumn: sourceHeader,
                targetField: "ignore",
                confidence: "unmapped" as any,
                sampleValue
            });
        }
    }

    return mappings;
}

// -----------------------------------------------------------------------------
// Type Coercion & Currency Sanitization
// -----------------------------------------------------------------------------
export function sanitizeCurrency(val: any): number {
    if (typeof val === "number") return val;
    if (!val) return 0;
    const str = String(val).trim();
    // Handle negatives in parentheses ($1,250.00)
    const isNegative = str.startsWith("-") || (str.startsWith("(") && str.endsWith(")"));
    const cleaned = str.replace(/[^0-9.]/g, "");
    const num = parseFloat(cleaned);
    if (isNaN(num)) return 0;
    return isNegative ? -num : num;
}

export function sanitizeDate(val: any): string {
    if (!val) return new Date().toISOString().split("T")[0];
    const str = String(val).trim();
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split("T")[0];
    }
    return str;
}

// -----------------------------------------------------------------------------
// Validation & Simulation Engine
// -----------------------------------------------------------------------------
export function validateAndSimulateMigration(
    sourceHeaders: string[],
    rawRows: string[][],
    mappings: FieldMapping[],
    targetEntity: TargetEntity,
    existingItems: any[] = []
): { parsedRows: ParsedRow[]; summary: MigrationSummary } {
    const fieldsDef = TARGET_ENTITY_FIELDS[targetEntity];
    const requiredKeys = fieldsDef.filter(f => f.required).map(f => f.key);

    const mappingLookup: Record<string, string> = {};
    mappings.forEach(m => {
        if (m.targetField && m.targetField !== "ignore") {
            mappingLookup[m.sourceColumn] = m.targetField;
        }
    });

    const parsedRows: ParsedRow[] = [];
    let validCount = 0;
    let warningCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    let financialSum = 0;

    // Create lookup set of existing keys to detect duplicates
    const existingKeySet = new Set<string>();
    existingItems.forEach(item => {
        if (targetEntity === "customers") {
            if (item.name) existingKeySet.add(item.name.toLowerCase().trim());
            if (item.email) existingKeySet.add(item.email.toLowerCase().trim());
        } else if (targetEntity === "invoices") {
            if (item.number) existingKeySet.add(item.number.toLowerCase().trim());
        } else if (targetEntity === "products") {
            if (item.name) existingKeySet.add(item.name.toLowerCase().trim());
            if (item.sku) existingKeySet.add(item.sku.toLowerCase().trim());
        } else if (targetEntity === "chart_of_accounts") {
            if (item.code) existingKeySet.add(item.code.toLowerCase().trim());
        }
    });

    rawRows.forEach((row, rowIdx) => {
        const rowData: Record<string, any> = {};
        const issues: string[] = [];

        // Apply column mapping
        sourceHeaders.forEach((header, colIdx) => {
            const targetFieldKey = mappingLookup[header];
            if (targetFieldKey) {
                const rawVal = row[colIdx];
                const fieldDef = fieldsDef.find(f => f.key === targetFieldKey);

                if (fieldDef?.type === "currency" || fieldDef?.type === "number") {
                    rowData[targetFieldKey] = sanitizeCurrency(rawVal);
                } else if (fieldDef?.type === "date") {
                    rowData[targetFieldKey] = sanitizeDate(rawVal);
                } else {
                    rowData[targetFieldKey] = rawVal ? String(rawVal).trim() : (fieldDef?.defaultValue || "");
                }
            }
        });

        // Check required fields
        let hasMissingRequired = false;
        requiredKeys.forEach(reqKey => {
            if (!rowData[reqKey] || String(rowData[reqKey]).trim().length === 0) {
                issues.push(`Missing required field: ${reqKey}`);
                hasMissingRequired = true;
            }
        });

        // Check duplicates
        let isDuplicate = false;
        if (targetEntity === "customers") {
            const name = (rowData.name || "").toLowerCase().trim();
            const email = (rowData.email || "").toLowerCase().trim();
            if ((name && existingKeySet.has(name)) || (email && existingKeySet.has(email))) {
                isDuplicate = true;
                issues.push("Duplicate record exists in current workspace");
            }
        } else if (targetEntity === "invoices") {
            const num = (rowData.number || "").toLowerCase().trim();
            if (num && existingKeySet.has(num)) {
                isDuplicate = true;
                issues.push(`Invoice #${rowData.number} already exists`);
            }
        } else if (targetEntity === "products") {
            const name = (rowData.name || "").toLowerCase().trim();
            const sku = (rowData.sku || "").toLowerCase().trim();
            if ((name && existingKeySet.has(name)) || (sku && existingKeySet.has(sku))) {
                isDuplicate = true;
                issues.push("Product / SKU already exists in catalog");
            }
        }

        // Determine status
        let status: "valid" | "warning" | "error" | "duplicate" = "valid";
        if (hasMissingRequired) {
            status = "error";
            errorCount++;
        } else if (isDuplicate) {
            status = "duplicate";
            duplicateCount++;
        } else if (issues.length > 0) {
            status = "warning";
            warningCount++;
        } else {
            validCount++;
        }

        // Accumulate financial totals
        if (targetEntity === "invoices" && rowData.amount_total) {
            financialSum += Number(rowData.amount_total) || 0;
        } else if (targetEntity === "customers" && rowData.balance) {
            financialSum += Number(rowData.balance) || 0;
        }

        parsedRows.push({
            _rawIndex: rowIdx,
            _status: status,
            _issues: issues,
            ...rowData
        });
    });

    return {
        parsedRows,
        summary: {
            totalRows: rawRows.length,
            validRows: validCount,
            warningRows: warningCount,
            duplicateRows: duplicateCount,
            errorRows: errorCount,
            targetEntity,
            platform: "custom_csv",
            importedAt: new Date().toISOString(),
            financialTotal: financialSum
        }
    };
}

// -----------------------------------------------------------------------------
// Execution & Storage Ingestion
// -----------------------------------------------------------------------------
export function commitMigrationToStorage(
    targetEntity: TargetEntity,
    validatedRows: ParsedRow[]
): { committedCount: number; targetStorageKey: string } {
    if (typeof window === "undefined") return { committedCount: 0, targetStorageKey: "" };

    const rowsToImport = validatedRows.filter(r => r._status === "valid" || r._status === "warning");
    let storageKey = "";

    if (targetEntity === "customers") {
        storageKey = "crm_leads";
        const currentData = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const transformed = rowsToImport.map((row, idx) => ({
            id: `MIG-${Date.now()}-${idx}`,
            name: row.name || "Customer",
            company: row.company || row.name || "",
            email: row.email || "",
            phone: row.phone || "",
            status: "Won",
            type: "customer",
            expected_revenue: Number(row.balance) || 0,
            address: row.address || "",
            city: row.city || "",
            country: row.country || "United States",
            source: "Legacy Software Migration",
            createdAt: new Date().toISOString()
        }));

        localStorage.setItem(storageKey, JSON.stringify([...transformed, ...currentData]));
        window.dispatchEvent(new Event("storage"));
        return { committedCount: transformed.length, targetStorageKey: "/crm" };
    } 
    
    if (targetEntity === "invoices") {
        storageKey = "accounting_invoices";
        const currentData = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const transformed = rowsToImport.map((row, idx) => ({
            id: `INV-MIG-${Date.now()}-${idx}`,
            number: row.number || `INV-${Date.now().toString().slice(-4)}`,
            partner_name: row.partner_name || "Customer",
            date: row.date || new Date().toISOString().split("T")[0],
            due_date: row.due_date || new Date().toISOString().split("T")[0],
            amount: Number(row.amount_total) || 0,
            status: row.status?.toLowerCase().includes("paid") ? "Paid" : "Posted",
            payment_state: row.status?.toLowerCase().includes("paid") ? "paid" : "not_paid",
            source: "Legacy Software Migration",
            createdAt: new Date().toISOString()
        }));

        localStorage.setItem(storageKey, JSON.stringify([...transformed, ...currentData]));
        window.dispatchEvent(new Event("storage"));
        return { committedCount: transformed.length, targetStorageKey: "/accounting" };
    } 
    
    if (targetEntity === "products") {
        storageKey = "inventory_products";
        const currentData = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const transformed = rowsToImport.map((row, idx) => ({
            id: `PROD-MIG-${Date.now()}-${idx}`,
            name: row.name || "Migrated Product",
            sku: row.sku || `SKU-${Date.now().toString().slice(-4)}`,
            price: Number(row.list_price) || 0,
            cost: Number(row.standard_price) || 0,
            stock: Number(row.qty_available) || 0,
            category: row.category || "All",
            source: "Legacy Software Migration",
            createdAt: new Date().toISOString()
        }));

        localStorage.setItem(storageKey, JSON.stringify([...transformed, ...currentData]));
        window.dispatchEvent(new Event("storage"));
        return { committedCount: transformed.length, targetStorageKey: "/inventory" };
    }

    if (targetEntity === "chart_of_accounts") {
        storageKey = "chart_of_accounts";
        const currentData = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const transformed = rowsToImport.map((row, idx) => ({
            id: `ACC-MIG-${Date.now()}-${idx}`,
            code: row.code || `100${idx}`,
            name: row.name || "Migrated Account",
            user_type: row.user_type || "Asset",
            balance: Number(row.opening_balance) || 0,
            source: "Legacy Software Migration",
            createdAt: new Date().toISOString()
        }));

        localStorage.setItem(storageKey, JSON.stringify([...transformed, ...currentData]));
        window.dispatchEvent(new Event("storage"));
        return { committedCount: transformed.length, targetStorageKey: "/accounting/configuration" };
    }

    return { committedCount: 0, targetStorageKey: "" };
}
