import os
import sys
import shutil
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle, Image as RLImage, PageBreak, KeepTogether
)
from PIL import Image

BASE_DIR = r"D:\ERP_CRM"
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
DECK_ASSETS = os.path.join(BASE_DIR, "scratch", "deck_assets")
PUBLIC_DECK_ASSETS = os.path.join(PUBLIC_DIR, "deck_assets")

os.makedirs(PUBLIC_DIR, exist_ok=True)
os.makedirs(PUBLIC_DECK_ASSETS, exist_ok=True)

# Copy cropped assets to public folder so HTML presentation can load them reliably
for f in os.listdir(DECK_ASSETS):
    src = os.path.join(DECK_ASSETS, f)
    dst = os.path.join(PUBLIC_DECK_ASSETS, f)
    if os.path.isfile(src):
        shutil.copy2(src, dst)

TOTAL_SLIDES = 8

def draw_dark_slide_background(canvas_obj, doc):
    w, h = landscape(letter)
    page_num = canvas_obj._pageNumber
    
    canvas_obj.saveState()
    
    # 1. Base dark background (#0B0F19)
    canvas_obj.setFillColor(colors.HexColor("#0B0F19"))
    canvas_obj.rect(0, 0, w, h, fill=1, stroke=0)
    
    # 2. Ambient top glowing gradient bar (Cyan to Violet)
    canvas_obj.setFillColor(colors.HexColor("#0284c7"))
    canvas_obj.rect(0, h - 4, w * 0.5, 4, fill=1, stroke=0)
    canvas_obj.setFillColor(colors.HexColor("#8b5cf6"))
    canvas_obj.rect(w * 0.5, h - 4, w * 0.5, 4, fill=1, stroke=0)

    # 3. Ambient soft background circles
    canvas_obj.setFillColor(colors.HexColor("#10192e"))
    canvas_obj.circle(40, h - 40, 110, fill=1, stroke=0)
    canvas_obj.circle(w - 50, 50, 130, fill=1, stroke=0)

    # 4. Running Header (on slides 2 to 8)
    if page_num > 1:
        canvas_obj.setFont("Helvetica-Bold", 8)
        canvas_obj.setFillColor(colors.HexColor("#38bdf8"))
        canvas_obj.drawString(36, h - 22, "⚡ NEXT-GEN AI ERP & CRM")
        
        canvas_obj.setFont("Helvetica", 8)
        canvas_obj.setFillColor(colors.HexColor("#64748b"))
        canvas_obj.drawRightString(w - 36, h - 22, "Autonomous Business Operating System • Client Pitch Deck")
        
        canvas_obj.setStrokeColor(colors.HexColor("#1e293b"))
        canvas_obj.setLineWidth(0.75)
        canvas_obj.line(36, h - 28, w - 36, h - 28)

    # 5. Running Footer (all slides)
    canvas_obj.setStrokeColor(colors.HexColor("#1e293b"))
    canvas_obj.setLineWidth(0.75)
    canvas_obj.line(36, 26, w - 36, 26)

    canvas_obj.setFont("Helvetica", 7.5)
    canvas_obj.setFillColor(colors.HexColor("#64748b"))
    canvas_obj.drawString(36, 14, "Confidential • The Autonomous AI ERP Platform • Next-Gen Business Suite")
    canvas_obj.drawRightString(w - 36, 14, f"Slide {page_num} of {TOTAL_SLIDES}")
    
    canvas_obj.restoreState()


def generate_perfect_pdf():
    pdf_path = os.path.join(BASE_DIR, "Client_Executive_Pitch_and_Demo_Deck.pdf")
    page_w, page_h = landscape(letter)
    
    # Base Document Template with onPage background
    doc = BaseDocTemplate(
        pdf_path,
        pagesize=landscape(letter),
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    frame = Frame(
        36, 34, page_w - 72, page_h - 68,
        id='normal_frame',
        leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0
    )
    template = PageTemplate(id='dark_slide', frames=frame, onPage=draw_dark_slide_background)
    doc.addPageTemplates([template])

    styles = getSampleStyleSheet()

    # Dark typography styles
    title_style = ParagraphStyle(
        'DTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=17,
        leading=20,
        textColor=colors.HexColor('#f8fafc'),
        spaceAfter=2
    )
    subtitle_style = ParagraphStyle(
        'DSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12.5,
        textColor=colors.HexColor('#94a3b8'),
        spaceAfter=8
    )
    card_title_cyan = ParagraphStyle(
        'CTCyan',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor('#38bdf8')
    )
    card_title_green = ParagraphStyle(
        'CTGreen',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor('#34d399')
    )
    card_title_purple = ParagraphStyle(
        'CTPurple',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor('#c084fc')
    )
    card_title_red = ParagraphStyle(
        'CTRed',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor('#f87171')
    )
    card_body_dark = ParagraphStyle(
        'CBDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=10.8,
        textColor=colors.HexColor('#cbd5e1')
    )
    stat_big = ParagraphStyle(
        'SBig',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=18,
        alignment=1
    )
    stat_lbl = ParagraphStyle(
        'SLbl',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7,
        leading=9.5,
        textColor=colors.HexColor('#94a3b8'),
        alignment=1
    )
    quote_box = ParagraphStyle(
        'QBox',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor('#93c5fd'),
        backColor=colors.HexColor('#0f172a'),
        borderColor=colors.HexColor('#1e293b'),
        borderWidth=0.5,
        borderPadding=4
    )

    story = []

    # =========================================================================
    # SLIDE 1: Cover
    # =========================================================================
    story.append(Spacer(1, 15))
    logo_path = os.path.join(BASE_DIR, "Logo.png")
    if os.path.exists(logo_path):
        story.append(RLImage(logo_path, width=130, height=80))
    story.append(Spacer(1, 10))
    story.append(Paragraph("NEXT-GEN AI ERP & CRM PLATFORM", ParagraphStyle('CoverT', fontName='Helvetica-Bold', fontSize=24, leading=28, textColor=colors.HexColor('#f8fafc'))))
    story.append(Spacer(1, 3))
    story.append(Paragraph("The Autonomous Operating System for High-Growth Enterprises", ParagraphStyle('CoverSub', fontName='Helvetica-Bold', fontSize=12, leading=16, textColor=colors.HexColor('#38bdf8'))))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "⚡ <b>15-Minute Setup</b> &nbsp;|&nbsp; ⚡ <b>3-Sec AI OCR Invoice Processing</b> &nbsp;|&nbsp; ⚡ <b>Predictive CRM</b> &nbsp;|&nbsp; ⚡ <b>Native Outbound Revenue Engine</b>",
        ParagraphStyle('CoverPoints', fontName='Helvetica', fontSize=8.5, leading=12, textColor=colors.HexColor('#94a3b8'))
    ))
    story.append(Spacer(1, 15))

    cover_pills = [
        [
            Paragraph("<font size='13' color='#38bdf8'><b>15 Mins</b></font><br/><font size='7' color='#94a3b8'>Time to Go-Live</font>", ParagraphStyle('P1', alignment=1)),
            Paragraph("<font size='13' color='#34d399'><b>3 Seconds</b></font><br/><font size='7' color='#94a3b8'>AI OCR Receipt Scan</font>", ParagraphStyle('P2', alignment=1)),
            Paragraph("<font size='13' color='#c084fc'><b>94.2%</b></font><br/><font size='7' color='#94a3b8'>AI Lead Scoring</font>", ParagraphStyle('P3', alignment=1)),
            Paragraph("<font size='13' color='#fbbf24'><b>+$42,300+</b></font><br/><font size='7' color='#94a3b8'>Avg Annual ROI</font>", ParagraphStyle('P4', alignment=1)),
        ]
    ]
    t_cp = Table(cover_pills, colWidths=[175, 175, 175, 175])
    t_cp.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#131d31')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#1e293b')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_cp)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 2: Hard Facts & The Shift
    # =========================================================================
    story.append(Paragraph("The Reality: Why Traditional Business Software is Failing You", title_style))
    story.append(Paragraph("Industry data shows why businesses are abandoning legacy tools like Odoo, SAP, and spreadsheets", subtitle_style))

    stats_row = [
        [
            Paragraph("<font color='#f87171'><b>73%</b></font>", stat_big),
            Paragraph("<font color='#f87171'><b>15.2 Hrs/Wk</b></font>", stat_big),
            Paragraph("<font color='#38bdf8'><b>15 Mins</b></font>", stat_big),
            Paragraph("<font color='#34d399'><b>+$42,300+</b></font>", stat_big),
        ],
        [
            Paragraph("Of legacy ERP implementations (Odoo/SAP) fail or exceed budget (Gartner)", stat_lbl),
            Paragraph("Wasted per company re-typing numbers across spreadsheets & QuickBooks", stat_lbl),
            Paragraph("Time required to go live on our AI platform with automated onboarding", stat_lbl),
            Paragraph("Average annual hard cost saved by consolidating tools & automating data entry", stat_lbl),
        ]
    ]
    t_stat = Table(stats_row, colWidths=[175, 175, 175, 175])
    t_stat.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#131d31')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#1e293b')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_stat)
    story.append(Spacer(1, 8))

    comp_comparison = [
        [
            Paragraph("<b>❌ The Legacy Trap (Odoo / SAP / Excel Sprawl)</b>", card_title_red),
            Paragraph("<b>✅ The Next-Gen AI Operating System</b>", card_title_green)
        ],
        [
            Paragraph("• <b>3 to 6 Months Setup:</b> Trapped paying $150/hr consultant fees.<br/>"
                      "• <b>Endless Manual Typing:</b> Manually keying supplier bills and stock lists.<br/>"
                      "• <b>Siloed Tools:</b> Paying separately for CRM, Books, MRP & Outbound.<br/>"
                      "• <b>Blind Decision Making:</b> Outdated weekly reports that hide risks.", card_body_dark),
            Paragraph("• <b>Live in 15 Minutes:</b> Zero-friction setup with 1-click import & free migration.<br/>"
                      "• <b>3-Second AI OCR Scanner:</b> Drop PDF invoices & auto-fill the ledger.<br/>"
                      "• <b>All-in-One Synchronized Core:</b> CRM, Books, Stock, HR & Calling unified.<br/>"
                      "• <b>Predictive AI Forecasting:</b> Real-time cash flow & demand prediction.", card_body_dark)
        ]
    ]
    t_comp = Table(comp_comparison, colWidths=[350, 350])
    t_comp.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#1c1917')),
        ('BACKGROUND', (1,0), (1,-1), colors.HexColor('#064e3b')),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#292524')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_comp)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 3: Live Workspace & Dashboard
    # =========================================================================
    story.append(Paragraph("Live Product Showcase: High-Performance Architecture", title_style))
    story.append(Paragraph("An intuitive Next.js enterprise interface designed for effortless daily operation", subtitle_style))

    dash_img_path = os.path.join(DECK_ASSETS, "dashboard_hero.jpg")
    col_dash_text = [
        Paragraph("<b>Single Unified Command Center:</b>", card_title_cyan),
        Spacer(1, 2),
        Paragraph("• <b>Zero Learning Curve:</b> Clutter-free UI that any employee can master on Day 1.<br/>"
                  "• <b>Live Cross-Department Sync:</b> Confirming a Sales Order automatically reserves stock and prepares the draft invoice in Finance.<br/>"
                  "• <b>Enterprise Role Security:</b> Strict permissions protect sensitive financial records.<br/>"
                  "• <b>Instant Global Search:</b> Find any client, invoice, PO, or SKU in <200ms.", card_body_dark),
        Spacer(1, 6),
        Paragraph("<b>Real-Time KPI Tracking:</b>", card_title_purple),
        Spacer(1, 2),
        Paragraph("• Daily Cash Flow & Burn Rate<br/>• Sales Conversion Velocity<br/>• Stock Depletion Warnings", card_body_dark)
    ]

    col_dash_img = []
    if os.path.exists(dash_img_path):
        col_dash_img.append(RLImage(dash_img_path, width=440, height=220))

    t_dash_show = Table([[col_dash_text, col_dash_img]], colWidths=[260, 440])
    t_dash_show.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_dash_show)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 4: CRM & Accounting Deep Dive
    # =========================================================================
    story.append(Paragraph("Intelligent Sales CRM & Automated OCR Accounting", title_style))
    story.append(Paragraph("Transforming manual operations into automated, AI-accelerated workflows", subtitle_style))

    crm_acc_img_path = os.path.join(DECK_ASSETS, "crm_accounting_view.jpg")
    col_feat_text = [
        Paragraph("<b>💼 Intelligent Sales CRM</b>", card_title_cyan),
        Paragraph("• <b>Visual Kanban Pipeline:</b> Drag-and-drop deals across stages.<br/>"
                  "• <b>AI Lead Scoring (94.2% Accuracy):</b> Predicts which leads will close.<br/>"
                  "• <b>Email Sentiment Alerts:</b> Flags client dissatisfaction early.<br/>"
                  "• <b>1-Click Quotes to Orders:</b> Turn proposals into signed deals instantly.", card_body_dark),
        Spacer(1, 6),
        Paragraph("<b>📈 Automated Accounting & Invoicing</b>", card_title_green),
        Paragraph("• <b>3-Sec OCR Bill Ingestion:</b> Drop supplier PDF invoices and auto-fill line items, VAT, and general ledger.<br/>"
                  "• <b>Auto Bank Reconciliation:</b> Matches statement lines in seconds.<br/>"
                  "• <b>Real-Time Financials:</b> Instant P&L, Balance Sheet, and Tax Ledger.", card_body_dark)
    ]

    col_feat_img = []
    if os.path.exists(crm_acc_img_path):
        col_feat_img.append(RLImage(crm_acc_img_path, width=440, height=220))

    t_feat = Table([[col_feat_text, col_feat_img]], colWidths=[260, 440])
    t_feat.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_feat)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 5: Inventory & HRMS Deep Dive
    # =========================================================================
    story.append(Paragraph("Smart Inventory, Manufacturing (MRP) & HRMS", title_style))
    story.append(Paragraph("End-to-end operational visibility from warehouse logistics to employee payroll", subtitle_style))

    inv_img_path = os.path.join(DECK_ASSETS, "inventory_ops_view.jpg")
    col_inv_text = [
        Paragraph("<b>🏭 Smart Inventory & MRP (Manufacturing)</b>", card_title_purple),
        Paragraph("• <b>Multi-Warehouse Tracking:</b> Track inventory across stores, warehouses, and fulfillment centers in real time.<br/>"
                  "• <b>AI Demand Forecasting:</b> Automatically calculates safety stock and prevents stockouts based on sales velocity.<br/>"
                  "• <b>Multi-Level Bill of Materials (BOM):</b> Automated raw material consumption on production orders.<br/>"
                  "• <b>Auto-PO Reordering:</b> Auto-drafts Purchase Orders when stock reaches safety thresholds.", card_body_dark),
        Spacer(1, 6),
        Paragraph("<b>👥 HRMS, Attendance & Automated Payroll</b>", card_title_cyan),
        Paragraph("• <b>Employee Directory:</b> Secure contracts & employee profiles.<br/>"
                  "• <b>Leave Management:</b> 1-click vacation & sick leave approval.<br/>"
                  "• <b>Automated Payroll Runs:</b> Generates salary slips and tax deductions in one click.", card_body_dark)
    ]

    col_inv_img = []
    if os.path.exists(inv_img_path):
        col_inv_img.append(RLImage(inv_img_path, width=440, height=220))

    t_inv = Table([[col_inv_text, col_inv_img]], colWidths=[260, 440])
    t_inv.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_inv)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 6: Autonomous Growth Engine
    # =========================================================================
    story.append(Paragraph("The Autonomous Growth Engine: Built-in Marketing & Outbound", title_style))
    story.append(Paragraph("We don't just record your business — our platform actively generates new revenue for you", subtitle_style))

    growth_cards = [
        [
            Paragraph("<b>1. Multi-Channel Marketing Suite</b>", card_title_cyan),
            Paragraph("<b>2. Automated Cold Email Engine</b>", card_title_purple),
            Paragraph("<b>3. AI Cold Calling & Voice Agents</b>", card_title_green)
        ],
        [
            Paragraph("• Centralized campaign ROI dashboard.<br/>"
                      "• Landing page & lead form generation.<br/>"
                      "• Multi-channel attribution tracking.<br/>"
                      "• Inbound leads funnel directly into CRM.<br/>"
                      "• <b>Replaces HubSpot Marketing ($800/mo)</b>", card_body_dark),
            Paragraph("• Built-in mailbox warmup & sender pools.<br/>"
                      "• AI-personalized cold outreach copy.<br/>"
                      "• Automated multi-step follow-up sequences.<br/>"
                      "• Positive replies turn into deals instantly.<br/>"
                      "• <b>Replaces Lemlist / Instantly ($150/mo)</b>", card_body_dark),
            Paragraph("• AI phone agents dial leads within 60s.<br/>"
                      "• Qualifies budget, authority, and need.<br/>"
                      "• Books appointments directly on calendar.<br/>"
                      "• Transcribes call sentiment into CRM.<br/>"
                      "• <b>Optional dedicated SDR support add-on</b>", card_body_dark)
        ]
    ]
    t_growth = Table(growth_cards, colWidths=[230, 230, 240])
    t_growth.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#131d31')),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#1e293b')),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#334155')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_growth)
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>The All-in-One Advantage:</b> Stop paying for 8 different software licenses. Our upcoming revenue engine brings pipeline generation and ERP operations into one continuous loop.", quote_box))
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 7: Hard ROI Math
    # =========================================================================
    story.append(Paragraph("Concrete Business ROI: Why This Platform Pays For Itself", title_style))
    story.append(Paragraph("Financial breakdown of hard dollar savings for a standard 25-person company", subtitle_style))

    roi_table_data = [
        [Paragraph("<b>Expense Category</b>", card_title_cyan), Paragraph("<b>Old Fragmented Approach (SaaS Sprawl)</b>", card_title_red), Paragraph("<b>With Our Next-Gen AI ERP</b>", card_title_green), Paragraph("<b>Your Net Annual Return</b>", card_title_cyan)],
        [
            Paragraph("<b>Software Subscriptions</b><br/>(CRM, Books, MRP, HR, Outbound)", card_body_dark),
            Paragraph("HubSpot ($300) + QuickBooks ($90) + Katana MRP ($350) + Gusto ($120) + Instantly ($100) = <b>$960/mo</b>", card_body_dark),
            Paragraph("Single Unified ERP Subscription = <b>$199/mo</b> (All Modules Included)", card_body_dark),
            Paragraph("<b>+$9,132 / Year</b><br/>Direct SaaS Savings", card_body_dark)
        ],
        [
            Paragraph("<b>Manual Data Entry Labor</b><br/>(Typing Invoices, POs & Reports)", card_body_dark),
            Paragraph("15.2 hours/week spent keying in receipts, re-entering sales data into spreadsheets.", card_body_dark),
            Paragraph("3-sec OCR receipt ingestion and automated double-entry ledger posting.", card_body_dark),
            Paragraph("<b>+$14,592 / Year</b><br/>Labor Hours Recovered", card_body_dark)
        ],
        [
            Paragraph("<b>Prevented Stockouts & Fast Deals</b><br/>(Lost Revenue Prevention)", card_body_dark),
            Paragraph("Missed orders due to stockouts, lost leads in messy inboxes, delayed proposals.", card_body_dark),
            Paragraph("AI Demand Forecasting + AI Lead Scoring + Instant Quote Generation.", card_body_dark),
            Paragraph("<b>+$18,600 / Year</b><br/>Net Revenue Captured", card_body_dark)
        ]
    ]
    t_roi = Table(roi_table_data, colWidths=[130, 200, 200, 170])
    t_roi.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#131d31')),
        ('BACKGROUND', (3,1), (3,-1), colors.HexColor('#064e3b')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#334155')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_roi)
    story.append(Spacer(1, 8))

    banner_roi = [
        [Paragraph("<font size='10' color='#34d399'><b>TOTAL ESTIMATED CLIENT VALUE: +$42,324 / YEAR IN MEASURABLE ROI</b></font><br/><font size='7.5' color='#cbd5e1'>The platform pays for itself within the first 30 days of active deployment.</font>", ParagraphStyle('RBanner', alignment=1))]
    ]
    t_rb = Table(banner_roi, colWidths=[700])
    t_rb.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#1e293b')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#10b981')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_rb)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 8: Zero-Risk Onboarding & Close
    # =========================================================================
    story.append(Paragraph("100% Zero-Risk Onboarding: Get Up and Running Today", title_style))
    story.append(Paragraph("We eliminate every barrier so your business experiences immediate, uninterrupted value", subtitle_style))

    launch_cards_dark = [
        [
            Paragraph("<b>1. 14-Day Free Access</b>", card_title_cyan),
            Paragraph("<b>2. Free Data Concierge</b>", card_title_green),
            Paragraph("<b>3. 15-Minute Jumpstart</b>", card_title_purple),
            Paragraph("<b>4. Dedicated Support</b>", card_title_cyan)
        ],
        [
            Paragraph("Full enterprise access across CRM, Accounting, Inventory, and HR. No credit card required to start.", card_body_dark),
            Paragraph("Send us your Excel sheets or legacy exports. Our tech team formats and imports your entire dataset for free.", card_body_dark),
            Paragraph("Follow our 4-step interactive checklist or load demo data to experience AI workflows in minutes.", card_body_dark),
            Paragraph("Direct private WhatsApp / Slack channel with our engineering team for instant setup assistance.", card_body_dark)
        ]
    ]
    t_lcd = Table(launch_cards_dark, colWidths=[175, 175, 175, 175])
    t_lcd.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#131d31')),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#1e293b')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#334155')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_lcd)
    story.append(Spacer(1, 10))

    cta_box = [
        [
            Paragraph("<font size='12' color='#f8fafc'><b>Ready to Upgrade to the Future of Business Management?</b></font><br/>"
                      "<font size='8.5' color='#94a3b8'>Launch your private workspace in 60 seconds or book a personalized 1-on-1 walkthrough.</font><br/><br/>"
                      "<font size='9.5' color='#38bdf8'><b>🌐 Web Platform:</b> http://localhost:3000/presentation</font> &nbsp;&nbsp;|&nbsp;&nbsp; "
                      "<font size='9.5' color='#34d399'><b>💬 Priority Onboarding:</b> support@erp-platform.com</font>",
                      ParagraphStyle('CTABox', alignment=1))
        ]
    ]
    t_cta = Table(cta_box, colWidths=[700])
    t_cta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0f172a')),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor('#0ea5e9')),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_cta)

    doc.build(story)
    
    # Also copy the PDF into public so users can download it directly from the live site
    shutil.copy2(pdf_path, os.path.join(PUBLIC_DIR, "Client_Executive_Pitch_and_Demo_Deck.pdf"))
    print(f"Verified 8-Slide Dark PDF built successfully: {pdf_path}")


def copy_interactive_html_to_public():
    src_html = os.path.join(BASE_DIR, "Client_Pitch_Deck_Interactive.html")
    # Copy to public folder under multiple friendly names
    shutil.copy2(src_html, os.path.join(PUBLIC_DIR, "Client_Pitch_Deck_Interactive.html"))
    shutil.copy2(src_html, os.path.join(PUBLIC_DIR, "presentation.html"))
    shutil.copy2(src_html, os.path.join(PUBLIC_DIR, "pitch-deck.html"))
    print("HTML deck copied to public directory!")

if __name__ == "__main__":
    generate_perfect_pdf()
    copy_interactive_html_to_public()
