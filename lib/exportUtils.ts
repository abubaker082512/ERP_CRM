/**
 * Comprehensive Export and Download Utilities
 * Supports:
 * - PDF document generation and printing (Quotations, Sales Orders, Invoices, Purchase Orders, Reports, Agreements)
 * - CSV export
 * - Excel (.xlsx/.xls formatted XML) spreadsheet export
 */

export interface DocumentLineItem {
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export interface QuotationDocumentData {
    documentNumber: string;
    documentType?: "Quotation" | "Sales Order" | "Proforma Invoice";
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
    date: string;
    expirationDate?: string;
    status: string;
    currency?: string;
    lines: DocumentLineItem[];
    amountTotal: number;
    taxAmount?: number;
    notes?: string;
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
    companyEmail?: string;
}

export interface PurchaseDocumentData {
    documentNumber: string;
    documentType?: "Request for Quotation" | "Purchase Order";
    vendorName: string;
    vendorEmail?: string;
    vendorAddress?: string;
    date: string;
    deadline?: string;
    status: string;
    currency?: string;
    lines: DocumentLineItem[];
    amountTotal: number;
    notes?: string;
}

export interface ReportDocumentData {
    title: string;
    subtitle?: string;
    dateGenerated?: string;
    summaryCards?: { label: string; value: string }[];
    headers: string[];
    rows: (string | number)[][];
}

/**
 * Downloads data as a CSV file
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
    const csvContent = [
        headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(","),
        ...rows.map(row =>
            row.map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
        )
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Downloads data as an Excel XML Spreadsheet (.xls) readable by MS Excel, Numbers, and Google Sheets
 */
export function exportToExcel(filename: string, headers: string[], rows: (string | number)[][], sheetName = "Sheet1") {
    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#7C3AED" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Cell">
   <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Currency">
   <NumberFormat ss:Format="$#,##0.00"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${escapeXml(sheetName)}">
  <Table>
   <Row>`;

    headers.forEach(header => {
        xml += `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(header)}</Data></Cell>`;
    });
    xml += `</Row>`;

    rows.forEach(row => {
        xml += `<Row>`;
        row.forEach(cell => {
            const isNum = typeof cell === "number" && !isNaN(cell);
            const val = cell ?? "";
            xml += `<Cell ss:StyleID="Cell"><Data ss:Type="${isNum ? "Number" : "String"}">${escapeXml(String(val))}</Data></Cell>`;
        });
        xml += `</Row>`;
    });

    xml += `  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename.endsWith(".xls") ? filename : `${filename}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case "<": return "&lt;";
            case ">": return "&gt;";
            case "&": return "&amp;";
            case "'": return "&apos;";
            case '"': return "&quot;";
            default: return c;
        }
    });
}

/**
 * Generates and triggers print/PDF download for Quotations, Sales Orders, and Invoices
 */
export function printQuotationPDF(doc: QuotationDocumentData) {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
        alert("Please allow popups to download and print PDF documents.");
        return;
    }

    const docTitle = doc.documentType || "Quotation";
    const currency = doc.currency || "$";
    const company = doc.companyName || "ABT IT Innovation PVT LTD.";
    const companyAddr = doc.companyAddress || "Tower B, Cyber City, Tech Park, Suite 400";
    const companyContact = doc.companyPhone ? `${doc.companyPhone} • ${doc.companyEmail || ""}` : "support@beraxis.com • www.beraxis.com";

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>${docTitle} - ${doc.documentNumber}</title>
    <style>
        @page {
            size: A4;
            margin: 15mm;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
        }
        body {
            background-color: #ffffff;
            padding: 24px;
            font-size: 13px;
            line-height: 1.5;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #7c3aed;
            padding-bottom: 16px;
            margin-bottom: 24px;
        }
        .company-logo {
            font-size: 22px;
            font-weight: 800;
            color: #7c3aed;
            letter-spacing: -0.5px;
        }
        .company-info {
            font-size: 11px;
            color: #64748b;
            margin-top: 4px;
        }
        .doc-badge {
            text-align: right;
        }
        .doc-title {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .doc-number {
            font-size: 14px;
            font-weight: 600;
            color: #7c3aed;
            margin-top: 2px;
        }
        .doc-status {
            display: inline-block;
            margin-top: 4px;
            padding: 3px 10px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            border-radius: 9999px;
            background-color: #f1f5f9;
            color: #475569;
        }
        .status-sale { background-color: #dcfce7; color: #166534; }
        .status-sent { background-color: #e0e7ff; color: #3730a3; }
        .status-draft { background-color: #f1f5f9; color: #475569; }

        .meta-grid {
            display: flex;
            justify-content: space-between;
            margin-bottom: 28px;
            gap: 20px;
        }
        .meta-col {
            flex: 1;
            background: #f8fafc;
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        .meta-label {
            font-size: 10px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 4px;
        }
        .meta-val {
            font-size: 13px;
            font-weight: 600;
            color: #0f172a;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }
        th {
            background-color: #7c3aed;
            color: #ffffff;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            padding: 10px 12px;
            text-align: left;
        }
        th.text-right, td.text-right { text-align: right; }
        th.text-center, td.text-center { text-align: center; }
        td {
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 12px;
        }
        tr:nth-child(even) td {
            background-color: #f8fafc;
        }

        .summary-wrap {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 30px;
        }
        .summary-table {
            width: 280px;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 12px;
            color: #64748b;
        }
        .summary-row.total {
            border-top: 2px solid #7c3aed;
            padding-top: 10px;
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
        }
        .summary-row.total .val {
            color: #7c3aed;
        }

        .footer {
            margin-top: 40px;
            border-top: 1px solid #e2e8f0;
            padding-top: 16px;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #94a3b8;
        }
        .signature-box {
            margin-top: 24px;
            display: flex;
            justify-content: space-between;
        }
        .sign-col {
            width: 200px;
            border-top: 1px dashed #94a3b8;
            padding-top: 6px;
            text-align: center;
            font-size: 11px;
            color: #64748b;
        }

        @media print {
            body { padding: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="company-logo">${escapeXml(company)}</div>
            <div class="company-info">${escapeXml(companyAddr)}</div>
            <div class="company-info">${escapeXml(companyContact)}</div>
        </div>
        <div class="doc-badge">
            <div class="doc-title">${escapeXml(docTitle)}</div>
            <div class="doc-number">${escapeXml(doc.documentNumber)}</div>
            <span class="doc-status status-${doc.status.toLowerCase()}">${escapeXml(doc.status)}</span>
        </div>
    </div>

    <div class="meta-grid">
        <div class="meta-col">
            <div class="meta-label">Customer / Recipient</div>
            <div class="meta-val">${escapeXml(doc.customerName)}</div>
            ${doc.customerEmail ? `<div style="font-size:11px;color:#64748b;margin-top:2px;">${escapeXml(doc.customerEmail)}</div>` : ""}
            ${doc.customerAddress ? `<div style="font-size:11px;color:#64748b;">${escapeXml(doc.customerAddress)}</div>` : ""}
        </div>
        <div class="meta-col">
            <div class="meta-label">Date Issued</div>
            <div class="meta-val">${escapeXml(doc.date)}</div>
        </div>
        <div class="meta-col">
            <div class="meta-label">Valid Until</div>
            <div class="meta-val">${escapeXml(doc.expirationDate || "30 Days from issue")}</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 45%;">Item & Description</th>
                <th class="text-center" style="width: 15%;">Quantity</th>
                <th class="text-right" style="width: 20%;">Unit Price</th>
                <th class="text-right" style="width: 20%;">Total</th>
            </tr>
        </thead>
        <tbody>
            ${doc.lines.length > 0 ? doc.lines.map(line => `
                <tr>
                    <td>
                        <strong>${escapeXml(line.name || "Product")}</strong>
                        ${line.description && line.description !== line.name ? `<br/><span style="font-size:11px;color:#64748b;">${escapeXml(line.description)}</span>` : ""}
                    </td>
                    <td class="text-center">${line.quantity}</td>
                    <td class="text-right">${currency}${(line.unitPrice || 0).toFixed(2)}</td>
                    <td class="text-right" style="font-weight:600;">${currency}${(line.subtotal || line.quantity * line.unitPrice || 0).toFixed(2)}</td>
                </tr>
            `).join("") : `
                <tr>
                    <td><strong>Standard Consultation & Services</strong></td>
                    <td class="text-center">1</td>
                    <td class="text-right">${currency}${(doc.amountTotal || 0).toFixed(2)}</td>
                    <td class="text-right" style="font-weight:600;">${currency}${(doc.amountTotal || 0).toFixed(2)}</td>
                </tr>
            `}
        </tbody>
    </table>

    <div class="summary-wrap">
        <div class="summary-table">
            <div class="summary-row">
                <span>Subtotal:</span>
                <span style="font-weight:600;color:#0f172a;">${currency}${(doc.amountTotal || 0).toFixed(2)}</span>
            </div>
            ${doc.taxAmount ? `
            <div class="summary-row">
                <span>Estimated Tax:</span>
                <span>${currency}${doc.taxAmount.toFixed(2)}</span>
            </div>` : ""}
            <div class="summary-row total">
                <span>Total Due:</span>
                <span class="val">${currency}${((doc.amountTotal || 0) + (doc.taxAmount || 0)).toFixed(2)}</span>
            </div>
        </div>
    </div>

    ${doc.notes ? `
    <div style="background:#f8fafc;padding:12px;border-radius:6px;border:1px solid #e2e8f0;margin-bottom:20px;">
        <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:4px;">Terms & Notes</div>
        <div style="font-size:11px;color:#475569;">${escapeXml(doc.notes)}</div>
    </div>` : `
    <div style="background:#f8fafc;padding:12px;border-radius:6px;border:1px solid #e2e8f0;margin-bottom:20px;">
        <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:4px;">Terms & Conditions</div>
        <div style="font-size:11px;color:#475569;">Payment is due within 30 days of quotation confirmation. Thank you for your business!</div>
    </div>`}

    <div class="signature-box">
        <div class="sign-col">Authorized Signature</div>
        <div class="sign-col">Customer Acceptance</div>
    </div>

    <div class="footer">
        <div>Generated by BERAXIS ERP Platform • Confidential</div>
        <div>Page 1 of 1</div>
    </div>

    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 300);
        };
    </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
}

/**
 * Generates and prints RFQ / Purchase Order PDF
 */
export function printPurchaseOrderPDF(doc: PurchaseDocumentData) {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
        alert("Please allow popups to download and print PDF documents.");
        return;
    }

    const docTitle = doc.documentType || "Purchase Order";
    const currency = doc.currency || "$";

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>${docTitle} - ${doc.documentNumber}</title>
    <style>
        @page { size: A4; margin: 15mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1e293b; }
        body { background-color: #ffffff; padding: 24px; font-size: 13px; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 24px; }
        .company-logo { font-size: 22px; font-weight: 800; color: #059669; }
        .doc-badge { text-align: right; }
        .doc-title { font-size: 24px; font-weight: 800; color: #0f172a; text-transform: uppercase; }
        .doc-number { font-size: 14px; font-weight: 600; color: #059669; margin-top: 2px; }
        .meta-grid { display: flex; justify-content: space-between; margin-bottom: 28px; gap: 20px; }
        .meta-col { flex: 1; background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .meta-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
        .meta-val { font-size: 13px; font-weight: 600; color: #0f172a; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { background-color: #059669; color: #ffffff; font-weight: 600; font-size: 11px; text-transform: uppercase; padding: 10px 12px; text-align: left; }
        th.text-right, td.text-right { text-align: right; }
        th.text-center, td.text-center { text-align: center; }
        td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
        tr:nth-child(even) td { background-color: #f8fafc; }
        .summary-wrap { display: flex; justify-content: flex-end; margin-bottom: 30px; }
        .summary-table { width: 280px; }
        .summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; color: #64748b; }
        .summary-row.total { border-top: 2px solid #059669; padding-top: 10px; font-size: 16px; font-weight: 800; color: #0f172a; }
        .summary-row.total .val { color: #059669; }
        .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }
        @media print { body { padding: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="company-logo">ABT IT Innovation PVT LTD.</div>
            <div style="font-size:11px;color:#64748b;">Tower B, Cyber City, Tech Park</div>
            <div style="font-size:11px;color:#64748b;">procurement@beraxis.com</div>
        </div>
        <div class="doc-badge">
            <div class="doc-title">${escapeXml(docTitle)}</div>
            <div class="doc-number">${escapeXml(doc.documentNumber)}</div>
        </div>
    </div>

    <div class="meta-grid">
        <div class="meta-col">
            <div class="meta-label">Vendor / Supplier</div>
            <div class="meta-val">${escapeXml(doc.vendorName)}</div>
        </div>
        <div class="meta-col">
            <div class="meta-label">Date</div>
            <div class="meta-val">${escapeXml(doc.date)}</div>
        </div>
        <div class="meta-col">
            <div class="meta-label">Order Deadline</div>
            <div class="meta-val">${escapeXml(doc.deadline || "Standard")}</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 50%;">Product / Description</th>
                <th class="text-center" style="width: 15%;">Quantity</th>
                <th class="text-right" style="width: 15%;">Unit Price</th>
                <th class="text-right" style="width: 20%;">Total</th>
            </tr>
        </thead>
        <tbody>
            ${doc.lines.length > 0 ? doc.lines.map(line => `
                <tr>
                    <td><strong>${escapeXml(line.name)}</strong></td>
                    <td class="text-center">${line.quantity}</td>
                    <td class="text-right">${currency}${(line.unitPrice || 0).toFixed(2)}</td>
                    <td class="text-right" style="font-weight:600;">${currency}${(line.subtotal || line.quantity * line.unitPrice || 0).toFixed(2)}</td>
                </tr>
            `).join("") : `
                <tr>
                    <td><strong>Direct Procurement Item</strong></td>
                    <td class="text-center">1</td>
                    <td class="text-right">${currency}${(doc.amountTotal || 0).toFixed(2)}</td>
                    <td class="text-right" style="font-weight:600;">${currency}${(doc.amountTotal || 0).toFixed(2)}</td>
                </tr>
            `}
        </tbody>
    </table>

    <div class="summary-wrap">
        <div class="summary-table">
            <div class="summary-row total">
                <span>Total Amount:</span>
                <span class="val">${currency}${(doc.amountTotal || 0).toFixed(2)}</span>
            </div>
        </div>
    </div>

    <div class="footer">
        <div>Generated by BERAXIS ERP Platform</div>
        <div>Page 1 of 1</div>
    </div>

    <script>
        window.onload = function() { setTimeout(function() { window.print(); }, 300); };
    </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
}

/**
 * Generates and prints generic System and Module Reports in PDF
 */
export function printReportPDF(report: ReportDocumentData) {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
        alert("Please allow popups to download and print PDF reports.");
        return;
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>${report.title} - Report</title>
    <style>
        @page { size: A4 landscape; margin: 12mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1e293b; }
        body { background-color: #ffffff; padding: 20px; font-size: 12px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #7c3aed; padding-bottom: 12px; margin-bottom: 20px; }
        .report-title { font-size: 20px; font-weight: 800; color: #0f172a; }
        .report-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
        .cards { display: flex; gap: 12px; margin-bottom: 20px; }
        .card { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; }
        .card-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; }
        .card-val { font-size: 18px; font-weight: 800; color: #7c3aed; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
        th { background-color: #7c3aed; color: #ffffff; font-weight: 600; text-transform: uppercase; padding: 8px 10px; text-align: left; }
        td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) td { background-color: #f8fafc; }
        .footer { margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
        @media print { body { padding: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="report-title">${escapeXml(report.title)}</div>
            <div class="report-sub">${escapeXml(report.subtitle || "ABT IT Innovation PVT LTD. • Executive Summary")}</div>
        </div>
        <div style="text-align:right;font-size:11px;color:#64748b;">
            Generated: ${escapeXml(report.dateGenerated || new Date().toLocaleString())}
        </div>
    </div>

    ${report.summaryCards && report.summaryCards.length > 0 ? `
    <div class="cards">
        ${report.summaryCards.map(c => `
            <div class="card">
                <div class="card-label">${escapeXml(c.label)}</div>
                <div class="card-val">${escapeXml(c.value)}</div>
            </div>
        `).join("")}
    </div>` : ""}

    <table>
        <thead>
            <tr>
                ${report.headers.map(h => `<th>${escapeXml(h)}</th>`).join("")}
            </tr>
        </thead>
        <tbody>
            ${report.rows.map(row => `
                <tr>
                    ${row.map(cell => `<td>${escapeXml(String(cell ?? ""))}</td>`).join("")}
                </tr>
            `).join("")}
        </tbody>
    </table>

    <div class="footer">
        <div>BERAXIS Enterprise Resource Planning • Confidential</div>
        <div>Report Export</div>
    </div>

    <script>
        window.onload = function() { setTimeout(function() { window.print(); }, 300); };
    </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
}
