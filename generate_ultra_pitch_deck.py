import os
import sys
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

BASE_DIR = r"D:\ERP_CRM"
DECK_ASSETS = os.path.join(BASE_DIR, "scratch", "deck_assets")

class DarkThemeDeckCanvas(canvas.Canvas):
    """Draws a modern, rich dark luxury ERP background on every slide with subtle glowing gradients."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_dark_background(num_pages)
            super().showPage()
        super().save()

    def draw_dark_background(self, page_count):
        self.saveState()
        w, h = landscape(letter)
        
        # Base deep slate / dark canvas background (#0B0F19)
        self.setFillColor(colors.HexColor("#0B0F19"))
        self.rect(0, 0, w, h, fill=1, stroke=0)
        
        # Subtle glowing top gradient bar (Cyan to Indigo accent)
        self.setFillColor(colors.HexColor("#0284c7"))
        self.rect(0, h - 4, w * 0.5, 4, fill=1, stroke=0)
        self.setFillColor(colors.HexColor("#6366f1"))
        self.rect(w * 0.5, h - 4, w * 0.5, 4, fill=1, stroke=0)

        # Ambient background glow circles (subtle dark blue/purple mesh)
        self.setFillColor(colors.HexColor("#0f172a"))
        self.circle(40, h - 40, 120, fill=1, stroke=0)
        self.circle(w - 60, 60, 140, fill=1, stroke=0)

        # Header for internal slides
        if self._pageNumber > 1:
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#0ea5e9"))
            self.drawString(36, h - 24, "⚡ NEXT-GEN AI ERP & CRM")
            
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748b"))
            self.drawRightString(w - 36, h - 24, "Autonomous Business Operating System")
            
            # Subtle top separator line
            self.setStrokeColor(colors.HexColor("#1e293b"))
            self.setLineWidth(0.75)
            self.line(36, h - 30, w - 36, h - 30)

        # Footer for all slides
        self.setStrokeColor(colors.HexColor("#1e293b"))
        self.setLineWidth(0.75)
        self.line(36, 26, w - 36, 26)

        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawString(36, 14, "Confidential • The Autonomous AI ERP Platform • All Rights Reserved")
        self.drawRightString(w - 36, 14, f"Slide {self._pageNumber} of {page_count}")
        
        self.restoreState()


def build_premium_client_pitch_deck():
    pdf_path = os.path.join(BASE_DIR, "Client_Executive_Pitch_and_Demo_Deck.pdf")
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=landscape(letter),
        leftMargin=36,
        rightMargin=36,
        topMargin=32,
        bottomMargin=32
    )

    styles = getSampleStyleSheet()

    # Dark theme typography
    title_style = ParagraphStyle(
        'DarkTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#f8fafc'),
        spaceAfter=2
    )
    subtitle_style = ParagraphStyle(
        'DarkSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#94a3b8'),
        spaceAfter=8
    )
    card_title_cyan = ParagraphStyle(
        'CardTitleCyan',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#38bdf8')
    )
    card_title_green = ParagraphStyle(
        'CardTitleGreen',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#34d399')
    )
    card_title_purple = ParagraphStyle(
        'CardTitlePurple',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#c084fc')
    )
    card_title_red = ParagraphStyle(
        'CardTitleRed',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#f87171')
    )
    card_body_dark = ParagraphStyle(
        'CardBodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=11,
        textColor=colors.HexColor('#cbd5e1')
    )
    stat_big_text = ParagraphStyle(
        'StatBig',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=20,
        textColor=colors.HexColor('#38bdf8'),
        alignment=1
    )
    stat_label_text = ParagraphStyle(
        'StatLabel',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#94a3b8'),
        alignment=1
    )
    quote_dark_style = ParagraphStyle(
        'QuoteDark',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7.8,
        leading=11,
        textColor=colors.HexColor('#93c5fd'),
        backColor=colors.HexColor('#0f172a'),
        borderColor=colors.HexColor('#1e293b'),
        borderWidth=0.5,
        borderPadding=5
    )

    story = []

    # =========================================================================
    # SLIDE 1: Premium Dark Cover
    # =========================================================================
    story.append(Spacer(1, 35))
    logo_path = os.path.join(BASE_DIR, "Logo.png")
    if os.path.exists(logo_path):
        story.append(RLImage(logo_path, width=140, height=88))
    story.append(Spacer(1, 10))
    story.append(Paragraph("NEXT-GEN AI ERP & CRM PLATFORM", ParagraphStyle('CoverT', fontName='Helvetica-Bold', fontSize=26, leading=30, textColor=colors.HexColor('#f8fafc'))))
    story.append(Spacer(1, 4))
    story.append(Paragraph("The Autonomous Operating System for High-Growth Enterprises", ParagraphStyle('CoverSub', fontName='Helvetica-Bold', fontSize=13, leading=17, textColor=colors.HexColor('#38bdf8'))))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "⚡ <b>15-Minute Setup</b> &nbsp;|&nbsp; ⚡ <b>3-Sec AI OCR Invoice Processing</b> &nbsp;|&nbsp; ⚡ <b>Predictive CRM</b> &nbsp;|&nbsp; ⚡ <b>Native Outbound Revenue Engine</b>",
        ParagraphStyle('CoverPoints', fontName='Helvetica', fontSize=9, leading=13, textColor=colors.HexColor('#94a3b8'))
    ))
    story.append(Spacer(1, 15))

    # Metric summary pills on cover
    cover_pills = [
        [
            Paragraph("<font size='14' color='#38bdf8'><b>15 Min</b></font><br/><font size='7' color='#94a3b8'>Time to Go-Live</font>", ParagraphStyle('CP1', alignment=1)),
            Paragraph("<font size='14' color='#34d399'><b>3 Sec</b></font><br/><font size='7' color='#94a3b8'>OCR Receipt Ingestion</font>", ParagraphStyle('CP2', alignment=1)),
            Paragraph("<font size='14' color='#c084fc'><b>94.2%</b></font><br/><font size='7' color='#94a3b8'>AI Lead Scoring Accuracy</font>", ParagraphStyle('CP3', alignment=1)),
            Paragraph("<font size='14' color='#fbbf24'><b>$42k+</b></font><br/><font size='7' color='#94a3b8'>Avg Annual Client Savings</font>", ParagraphStyle('CP4', alignment=1)),
        ]
    ]
    t_cp = Table(cover_pills, colWidths=[175, 175, 175, 175])
    t_cp.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#1e293b')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#334155')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_cp)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 2: Hard Facts & The Shift (Legacy ERPs vs AI Core)
    # =========================================================================
    story.append(Paragraph("The Reality: Why Traditional Business Software is Failing You", title_style))
    story.append(Paragraph("Industry data shows why businesses are actively abandoning legacy tools like Odoo, SAP, and spreadsheets", subtitle_style))

    # 4 Hard Stats Cards
    stats_row = [
        [
            Paragraph("<font color='#f87171'><b>73%</b></font>", stat_big_text),
            Paragraph("<font color='#f87171'><b>15.2 Hrs/Wk</b></font>", stat_big_text),
            Paragraph("<font color='#38bdf8'><b>15 Mins</b></font>", stat_big_text),
            Paragraph("<font color='#34d399'><b>$42,300+</b></font>", stat_big_text),
        ],
        [
            Paragraph("Of legacy ERP implementations (Odoo/SAP) fail or exceed budget by >50% (Gartner)", stat_label_text),
            Paragraph("Wasted per company re-typing numbers across spreadsheets, QuickBooks & CRM", stat_label_text),
            Paragraph("Time required to go live on our AI platform with automated data onboarding", stat_label_text),
            Paragraph("Average annual hard cost saved by consolidating tools and automating data entry", stat_label_text),
        ]
    ]
    t_stat = Table(stats_row, colWidths=[175, 175, 175, 175])
    t_stat.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#131d31')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#1e293b')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_stat)
    story.append(Spacer(1, 10))

    comp_comparison = [
        [
            Paragraph("<b>❌ The Legacy Trap (Odoo / SAP / Excel Sprawl)</b>", card_title_red),
            Paragraph("<b>✅ The Next-Gen AI Operating System</b>", card_title_green)
        ],
        [
            Paragraph("• <b>3 to 6 Months of Expensive Setup:</b> Trapped paying $150/hr consultant fees.<br/>"
                      "• <b>Endless Manual Data Entry:</b> Typing supplier bills, copying numbers to Excel.<br/>"
                      "• <b>Siloed Tools:</b> Paying separately for CRM, Accounting, Inventory & Outbound tools.<br/>"
                      "• <b>Blind Decision Making:</b> Outdated weekly reports that hide cash flow risks.", card_body_dark),
            Paragraph("• <b>Live in 15 Minutes:</b> Zero-friction setup with 1-click import & free migration.<br/>"
                      "• <b>3-Second AI OCR Scanner:</b> Drop PDF invoices & auto-populate the ledger.<br/>"
                      "• <b>All-in-One Synchronized Core:</b> CRM, Books, Warehouse, HR & Calling unified.<br/>"
                      "• <b>Predictive AI Forecasting:</b> Real-time cash flow & demand prediction.", card_body_dark)
        ]
    ]
    t_comp = Table(comp_comparison, colWidths=[350, 350])
    t_comp.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#1c1917')),
        ('BACKGROUND', (1,0), (1,-1), colors.HexColor('#064e3b')),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#292524')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_comp)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 3: Live Workspace & Dashboard Showcase
    # =========================================================================
    story.append(Paragraph("Live Product Showcase: High-Performance Architecture", title_style))
    story.append(Paragraph("An intuitive Next.js enterprise interface designed for effortless daily operation", subtitle_style))

    dash_img_path = os.path.join(DECK_ASSETS, "dashboard_hero.jpg")
    if not os.path.exists(dash_img_path):
        dash_img_path = os.path.join(BASE_DIR, "scratch", "post_login_screenshot.png")

    col_dash_text = [
        Paragraph("<b>Single Unified Command Center:</b>", card_title_cyan),
        Spacer(1, 3),
        Paragraph("• <b>Zero Learning Curve:</b> Clutter-free interface that any employee can master on Day 1.<br/>"
                  "• <b>Live Cross-Department Sync:</b> Confirming a Sales Order automatically reserves warehouse stock and prepares the draft invoice in Finance.<br/>"
                  "• <b>Enterprise Security & Roles:</b> Granular role-based permissions ensure staff only access authorized data.<br/>"
                  "• <b>Instant Global Search:</b> Find any client, invoice, PO, or SKU in under 200ms.", card_body_dark),
        Spacer(1, 8),
        Paragraph("<b>Real-Time KPI Tracking:</b>", card_title_purple),
        Spacer(1, 3),
        Paragraph("• Daily Cash Flow & Burn Rate<br/>• Sales Conversion Velocity<br/>• Stock Depletion Warnings", card_body_dark)
    ]

    col_dash_img = []
    if os.path.exists(dash_img_path):
        col_dash_img.append(RLImage(dash_img_path, width=440, height=235))

    t_dash_show = Table([[col_dash_text, col_dash_img]], colWidths=[260, 440])
    t_dash_show.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_dash_show)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 4: Core Module Deep Dive — CRM & OCR Accounting
    # =========================================================================
    story.append(Paragraph("Intelligent Sales CRM & Automated OCR Accounting", title_style))
    story.append(Paragraph("Transforming manual operations into automated, AI-accelerated workflows", subtitle_style))

    crm_acc_img_path = os.path.join(DECK_ASSETS, "crm_accounting_view.jpg")
    
    col_feat_text = [
        Paragraph("<b>💼 Intelligent Sales CRM</b>", card_title_cyan),
        Paragraph("• <b>Visual Kanban Pipeline:</b> Drag-and-drop deals across stages.<br/>"
                  "• <b>AI Lead Scoring (94% Accuracy):</b> Predicts which leads will close.<br/>"
                  "• <b>Email Sentiment Alerts:</b> Flags client dissatisfaction early.<br/>"
                  "• <b>1-Click Quote-to-Order:</b> Turn proposals into signed deals instantly.", card_body_dark),
        Spacer(1, 8),
        Paragraph("<b>📈 Automated Accounting & Invoicing</b>", card_title_green),
        Paragraph("• <b>3-Sec OCR Bill Ingestion:</b> Drop supplier PDF invoices and auto-fill line items, VAT, and general ledger.<br/>"
                  "• <b>Auto Bank Reconciliation:</b> Matches statement lines in seconds.<br/>"
                  "• <b>Real-Time Financials:</b> Instant P&L, Balance Sheet, and Tax Ledger.", card_body_dark)
    ]

    col_feat_img = []
    if os.path.exists(crm_acc_img_path):
        col_feat_img.append(RLImage(crm_acc_img_path, width=440, height=235))
    else:
        post_login = os.path.join(BASE_DIR, "scratch", "post_login_screenshot.png")
        if os.path.exists(post_login):
            col_feat_img.append(RLImage(post_login, width=440, height=235))

    t_feat = Table([[col_feat_text, col_feat_img]], colWidths=[260, 440])
    t_feat.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_feat)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 5: Core Module Deep Dive — Smart Inventory & HRMS
    # =========================================================================
    story.append(Paragraph("Smart Inventory, Manufacturing (MRP) & HRMS", title_style))
    story.append(Paragraph("End-to-end operational visibility from warehouse logistics to employee payroll", subtitle_style))

    inv_img_path = os.path.join(DECK_ASSETS, "inventory_ops_view.jpg")
    
    col_inv_text = [
        Paragraph("<b>🏭 Smart Inventory & Manufacturing (MRP)</b>", card_title_purple),
        Paragraph("• <b>Multi-Warehouse Tracking:</b> Track inventory across stores, warehouses, and fulfillment centers in real time.<br/>"
                  "• <b>AI Demand Forecasting:</b> Automatically calculates safety stock and prevents stockouts based on sales velocity.<br/>"
                  "• <b>Multi-Level Bill of Materials (BOM):</b> Automated raw material consumption on production orders.<br/>"
                  "• <b>Auto-PO Reordering:</b> Auto-drafts Purchase Orders when stock reaches reorder levels.", card_body_dark),
        Spacer(1, 8),
        Paragraph("<b>👥 HRMS, Attendance & Automated Payroll</b>", card_title_cyan),
        Paragraph("• <b>Employee Directory:</b> Secure contracts & employee profiles.<br/>"
                  "• <b>Leave Management:</b> 1-click vacation & sick leave approval.<br/>"
                  "• <b>Automated Payroll Runs:</b> Generates salary slips and tax deductions in one click.", card_body_dark)
    ]

    col_inv_img = []
    if os.path.exists(inv_img_path):
        col_inv_img.append(RLImage(inv_img_path, width=440, height=235))

    t_inv = Table([[col_inv_text, col_inv_img]], colWidths=[260, 440])
    t_inv.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_inv)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 6: Autonomous Revenue Engine — Marketing, Cold Email & AI Calling
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
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_growth)
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>The All-in-One Advantage:</b> Stop paying for 8 different software licenses. Our upcoming revenue engine brings pipeline generation and ERP operations into one continuous loop.", quote_dark_style))
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 7: Measurable Financial ROI
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
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_roi)
    story.append(Spacer(1, 10))

    banner_roi = [
        [Paragraph("<font size='11' color='#34d399'><b>TOTAL ESTIMATED CLIENT VALUE: +$42,324 / YEAR IN MEASURABLE ROI</b></font><br/><font size='8' color='#cbd5e1'>The platform pays for itself within the first 30 days of active deployment.</font>", ParagraphStyle('RBanner', alignment=1))]
    ]
    t_rb = Table(banner_roi, colWidths=[700])
    t_rb.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#1e293b')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#10b981')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
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
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_lcd)
    story.append(Spacer(1, 15))

    cta_box = [
        [
            Paragraph("<font size='13' color='#f8fafc'><b>Ready to Upgrade to the Future of Business Management?</b></font><br/>"
                      "<font size='9' color='#94a3b8'>Launch your private workspace in 60 seconds or book a personalized 1-on-1 walkthrough.</font><br/><br/>"
                      "<font size='10' color='#38bdf8'><b>🌐 Web Platform:</b> http://localhost:3000</font> &nbsp;&nbsp;|&nbsp;&nbsp; "
                      "<font size='10' color='#34d399'><b>💬 Priority Onboarding:</b> support@erp-platform.com</font>",
                      ParagraphStyle('CTABox', alignment=1))
        ]
    ]
    t_cta = Table(cta_box, colWidths=[700])
    t_cta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0f172a')),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor('#0ea5e9')),
        ('TOPPADDING', (0,0), (-1,-1), 14),
        ('BOTTOMPADDING', (0,0), (-1,-1), 14),
    ]))
    story.append(t_cta)

    doc.build(story, canvasmaker=DarkThemeDeckCanvas)
    print(f"Ultra-Premium Client Pitch Deck built: {pdf_path}")


def build_premium_interactive_html_portal():
    html_path = os.path.join(BASE_DIR, "Client_Pitch_Deck_Interactive.html")
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Next-Gen AI ERP & CRM - Client Presentation</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #0b0f19; color: #f8fafc; overflow-x: hidden; }
        .slide { display: none; min-height: 100vh; padding: 4rem 3rem; }
        .slide.active { display: flex; flex-direction: column; justify-content: center; }
        .glass-panel { background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .glow-cyan { box-shadow: 0 0 35px rgba(14, 165, 233, 0.2); }
        .glow-purple { box-shadow: 0 0 35px rgba(168, 85, 247, 0.2); }
        .gradient-text-cyan { background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .gradient-text-gold { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    </style>
</head>
<body class="relative bg-[#0b0f19] text-slate-100 selection:bg-cyan-500 selection:text-white">

    <!-- Ambient Glowing Background Mesh -->
    <div class="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>
    <div class="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none"></div>

    <!-- Top Navigation Bar -->
    <div class="fixed top-0 left-0 right-0 h-16 glass-panel z-50 flex items-center justify-between px-8 border-b border-slate-800/80">
        <div class="flex items-center gap-3">
            <span class="text-xl font-extrabold tracking-tight gradient-text-cyan">NextGen AI ERP</span>
            <span class="text-xs bg-cyan-500/10 text-cyan-400 px-2.5 py-0.5 rounded-full border border-cyan-500/20 font-medium">Enterprise Pitch</span>
        </div>
        <div class="flex items-center gap-4">
            <span id="slideIndicator" class="text-xs font-semibold text-slate-400 tracking-wider">SLIDE 1 / 8</span>
            <button onclick="prevSlide()" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition">◀ Prev</button>
            <button onclick="nextSlide()" class="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition shadow-lg shadow-cyan-600/20">Next ▶</button>
            <a href="Client_Executive_Pitch_and_Demo_Deck.pdf" download class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 text-cyan-400">
                📥 PDF
            </a>
        </div>
    </div>

    <!-- SLIDE 1: Cover -->
    <section class="slide active" id="slide-1">
        <div class="max-w-5xl mx-auto text-center space-y-6">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold text-xs tracking-wide">
                <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span> THE AUTONOMOUS ENTERPRISE PLATFORM
            </div>
            <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Run Your Entire Business Smarter, Faster & <br/><span class="gradient-text-cyan">On Autopilot</span>
            </h1>
            <p class="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
                Replacing 6-month legacy ERP headaches with 15-minute setup, 3-second OCR invoice ingestion, predictive sales scoring, and native outbound revenue engines.
            </p>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 max-w-4xl mx-auto text-left">
                <div class="glass-panel p-4 rounded-xl border-cyan-500/30 glow-cyan">
                    <div class="text-2xl font-extrabold text-cyan-400">15 Mins</div>
                    <div class="text-xs text-slate-400 mt-0.5">Time to Go-Live</div>
                </div>
                <div class="glass-panel p-4 rounded-xl border-emerald-500/30">
                    <div class="text-2xl font-extrabold text-emerald-400">3 Seconds</div>
                    <div class="text-xs text-slate-400 mt-0.5">AI OCR Receipt Scan</div>
                </div>
                <div class="glass-panel p-4 rounded-xl border-purple-500/30 glow-purple">
                    <div class="text-2xl font-extrabold text-purple-400">94.2%</div>
                    <div class="text-xs text-slate-400 mt-0.5">AI Lead Scoring</div>
                </div>
                <div class="glass-panel p-4 rounded-xl border-amber-500/30">
                    <div class="text-2xl font-extrabold text-amber-400">$42,300+</div>
                    <div class="text-xs text-slate-400 mt-0.5">Avg Annual Client ROI</div>
                </div>
            </div>

            <div class="pt-6">
                <button onclick="nextSlide()" class="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white hover:opacity-95 shadow-xl shadow-cyan-500/20 transition">
                    Explore Client Presentation →
                </button>
            </div>
        </div>
    </section>

    <!-- SLIDE 2: Hard Facts & Shift -->
    <section class="slide" id="slide-2">
        <div class="max-w-6xl mx-auto w-full space-y-6">
            <div class="text-center space-y-1">
                <h2 class="text-3xl font-extrabold">The Reality: Why Traditional Business Software is Failing You</h2>
                <p class="text-slate-400 text-sm">Industry benchmarks show why modern companies are abandoning legacy ERPs & spreadsheets</p>
            </div>

            <div class="grid md:grid-cols-2 gap-6">
                <div class="glass-panel p-6 rounded-2xl border-red-500/30 bg-red-950/10 space-y-4">
                    <h3 class="text-lg font-bold text-red-400 flex items-center gap-2">
                        <span>❌ The Legacy Trap (Odoo / SAP / Excel Sprawl)</span>
                    </h3>
                    <ul class="space-y-3 text-xs text-slate-300">
                        <li>• <b class="text-white">73% of Implementations Fail:</b> Complex consulting projects taking 3-6 months and thousands in fees.</li>
                        <li>• <b class="text-white">15.2 Hours Wasted Weekly:</b> Employees manually typing supplier invoices and copying numbers to Excel.</li>
                        <li>• <b class="text-white">Siloed Subscriptions:</b> Paying separately for HubSpot ($300), QuickBooks ($90), Katana ($350).</li>
                        <li>• <b class="text-white">Delayed Decision Making:</b> Waiting weeks for accountants to compile outdated financial reports.</li>
                    </ul>
                </div>

                <div class="glass-panel p-6 rounded-2xl border-emerald-500/30 bg-emerald-950/10 space-y-4">
                    <h3 class="text-lg font-bold text-emerald-400 flex items-center gap-2">
                        <span>✅ The Next-Gen AI Operating System</span>
                    </h3>
                    <ul class="space-y-3 text-xs text-slate-300">
                        <li>• <b class="text-white">Live in 15 Minutes:</b> Zero-friction activation with 1-click import and free data migration.</li>
                        <li>• <b class="text-white">3-Second OCR Ingestion:</b> Drop any supplier PDF receipt and auto-create ledger entries.</li>
                        <li>• <b class="text-white">All-in-One Synchronized Core:</b> Sales CRM, Books, Warehouse, HR & Outbound in 1 workspace.</li>
                        <li>• <b class="text-white">Predictive AI Analytics:</b> Real-time cash flow, inventory reorder alerts, and deal win probability.</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- SLIDE 3: Live Workspace Screenshot -->
    <section class="slide" id="slide-3">
        <div class="max-w-6xl mx-auto w-full space-y-4">
            <div class="flex justify-between items-end">
                <div>
                    <h2 class="text-3xl font-extrabold">Live Product Interface: Built for Speed</h2>
                    <p class="text-slate-400 text-sm">Ultra-responsive Next.js 14 command center uniting every department</p>
                </div>
                <span class="text-xs bg-slate-800 text-cyan-400 px-3 py-1 rounded-full border border-slate-700">Real Dashboard Capture</span>
            </div>

            <div class="grid md:grid-cols-12 gap-6 items-center">
                <div class="md:col-span-4 space-y-3">
                    <div class="glass-panel p-4 rounded-xl border-cyan-500/30">
                        <h4 class="font-bold text-cyan-400 text-sm">⚡ Zero Learning Curve</h4>
                        <p class="text-xs text-slate-300 mt-1">Clutter-free UI that any employee can master on Day 1.</p>
                    </div>
                    <div class="glass-panel p-4 rounded-xl border-purple-500/30">
                        <h4 class="font-bold text-purple-400 text-sm">⚡ Instant Department Sync</h4>
                        <p class="text-xs text-slate-300 mt-1">Sales Order confirmation automatically updates stock & drafts invoice.</p>
                    </div>
                    <div class="glass-panel p-4 rounded-xl border-emerald-500/30">
                        <h4 class="font-bold text-emerald-400 text-sm">⚡ Role-Based Security</h4>
                        <p class="text-xs text-slate-300 mt-1">Granular permissions keep financial records strictly protected.</p>
                    </div>
                </div>

                <div class="md:col-span-8">
                    <div class="glass-panel p-2 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl glow-cyan">
                        <img src="./scratch/deck_assets/dashboard_hero.jpg" alt="Live Dashboard" class="w-full h-auto rounded-xl object-cover hover:scale-[1.02] transition duration-500">
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- SLIDE 4: CRM & Accounting Deep Dive -->
    <section class="slide" id="slide-4">
        <div class="max-w-6xl mx-auto w-full space-y-4">
            <div>
                <h2 class="text-3xl font-extrabold">Intelligent CRM & Automated Accounting</h2>
                <p class="text-slate-400 text-sm">AI OCR Scanning and Predictive Deal Scoring</p>
            </div>

            <div class="grid md:grid-cols-12 gap-6 items-center">
                <div class="md:col-span-4 space-y-4 text-xs text-slate-300">
                    <div class="glass-panel p-4 rounded-xl border-cyan-500/30 space-y-2">
                        <h4 class="font-bold text-cyan-400 text-sm">💼 Intelligent CRM</h4>
                        <p>• <b>AI Lead Scoring:</b> 94.2% accuracy predicting deal closure.</p>
                        <p>• <b>Email Sentiment Alerts:</b> Flag frustrated accounts early.</p>
                        <p>• <b>1-Click Quotes to Orders:</b> Accelerate deal closure.</p>
                    </div>

                    <div class="glass-panel p-4 rounded-xl border-emerald-500/30 space-y-2">
                        <h4 class="font-bold text-emerald-400 text-sm">📈 Automated Accounting</h4>
                        <p>• <b>3-Sec OCR Scanner:</b> Drop PDF bills, auto-fill ledger.</p>
                        <p>• <b>Automated Bank Feeds:</b> Instant reconciliation.</p>
                        <p>• <b>Real-Time Financials:</b> Live P&L and Balance Sheet.</p>
                    </div>
                </div>

                <div class="md:col-span-8">
                    <div class="glass-panel p-2 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                        <img src="./scratch/deck_assets/crm_accounting_view.jpg" alt="CRM & Accounting" class="w-full h-auto rounded-xl object-cover hover:scale-[1.02] transition duration-500">
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- SLIDE 5: Inventory & HRMS -->
    <section class="slide" id="slide-5">
        <div class="max-w-6xl mx-auto w-full space-y-4">
            <div>
                <h2 class="text-3xl font-extrabold">Smart Inventory, Manufacturing & HRMS</h2>
                <p class="text-slate-400 text-sm">Complete logistics and employee operations under one roof</p>
            </div>

            <div class="grid md:grid-cols-12 gap-6 items-center">
                <div class="md:col-span-4 space-y-4 text-xs text-slate-300">
                    <div class="glass-panel p-4 rounded-xl border-purple-500/30 space-y-2">
                        <h4 class="font-bold text-purple-400 text-sm">🏭 Smart Inventory & MRP</h4>
                        <p>• <b>Multi-Warehouse Tracking:</b> Real-time location balances.</p>
                        <p>• <b>Predictive Demand:</b> Forecast stockouts before they hit.</p>
                        <p>• <b>Bill of Materials (BOM):</b> Automated raw material consumption.</p>
                    </div>

                    <div class="glass-panel p-4 rounded-xl border-cyan-500/30 space-y-2">
                        <h4 class="font-bold text-cyan-400 text-sm">👥 HRMS & Payroll</h4>
                        <p>• <b>Centralized Directory:</b> Staff records & contracts.</p>
                        <p>• <b>Leave Requests:</b> Self-service approval flows.</p>
                        <p>• <b>1-Click Payroll:</b> Salary slips & tax calculations.</p>
                    </div>
                </div>

                <div class="md:col-span-8">
                    <div class="glass-panel p-2 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                        <img src="./scratch/deck_assets/inventory_ops_view.jpg" alt="Inventory & HRMS" class="w-full h-auto rounded-xl object-cover hover:scale-[1.02] transition duration-500">
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- SLIDE 6: Autonomous Growth Engine -->
    <section class="slide" id="slide-6">
        <div class="max-w-6xl mx-auto w-full space-y-6">
            <div class="text-center space-y-1">
                <span class="text-xs bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full border border-purple-500/30 font-semibold">Autonomous Revenue Engine</span>
                <h2 class="text-3xl font-extrabold mt-2">We Don't Just Record Business — We Help You Win It</h2>
                <p class="text-slate-400 text-sm">Native Marketing, Cold Emailing, and AI Voice Calling Agents</p>
            </div>

            <div class="grid md:grid-cols-3 gap-6">
                <div class="glass-panel p-6 rounded-2xl space-y-3 border-cyan-500/30 glow-cyan">
                    <div class="text-2xl">📊</div>
                    <h3 class="font-bold text-cyan-400 text-lg">1. Marketing Suite</h3>
                    <p class="text-xs text-slate-300 leading-relaxed">Centralized campaign tracking, landing page builder, and multi-channel attribution. Leads flow directly into CRM stages.</p>
                    <div class="text-[11px] text-cyan-300 bg-cyan-950/40 p-2.5 rounded-lg border border-cyan-500/20">Replaces HubSpot Marketing ($800/mo)</div>
                </div>

                <div class="glass-panel p-6 rounded-2xl space-y-3 border-purple-500/30 glow-purple">
                    <div class="text-2xl">✉️</div>
                    <h3 class="font-bold text-purple-400 text-lg">2. Cold Email Engine</h3>
                    <p class="text-xs text-slate-300 leading-relaxed">Automated mailbox warmup, AI-generated personalized outreach copy, and sequence follow-ups directly synced to CRM deals.</p>
                    <div class="text-[11px] text-purple-300 bg-purple-950/40 p-2.5 rounded-lg border border-purple-500/20">Replaces Lemlist / Instantly ($150/mo)</div>
                </div>

                <div class="glass-panel p-6 rounded-2xl space-y-3 border-emerald-500/30">
                    <div class="text-2xl">📞</div>
                    <h3 class="font-bold text-emerald-400 text-lg">3. AI Cold Calling</h3>
                    <p class="text-xs text-slate-300 leading-relaxed">Autonomous AI voice agents that dial inbound leads in 60s, qualify prospects, and book calendar meetings (with human SDR support option).</p>
                    <div class="text-[11px] text-emerald-300 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/20">Transcripts & Sentiment logged in CRM</div>
                </div>
            </div>
        </div>
    </section>

    <!-- SLIDE 7: Concrete Financial ROI -->
    <section class="slide" id="slide-7">
        <div class="max-w-5xl mx-auto w-full space-y-6">
            <div class="text-center space-y-1">
                <h2 class="text-3xl font-extrabold">Measurable ROI: Why This Platform Pays for Itself</h2>
                <p class="text-slate-400 text-sm">Hard-dollar annual savings for a typical 25-person growing company</p>
            </div>

            <div class="glass-panel rounded-2xl overflow-hidden border border-slate-800">
                <table class="w-full text-left text-xs">
                    <thead class="bg-slate-900/80 text-slate-300 border-b border-slate-800">
                        <tr>
                            <th class="p-4">Expense Category</th>
                            <th class="p-4 text-red-400">Old Fragmented Approach</th>
                            <th class="p-4 text-emerald-400">With Next-Gen AI ERP</th>
                            <th class="p-4 text-cyan-400">Your Net Annual Return</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800 text-slate-300">
                        <tr>
                            <td class="p-4 font-bold text-white">Software Subscriptions</td>
                            <td class="p-4">HubSpot + QuickBooks + Katana + Gusto = $960/mo</td>
                            <td class="p-4 text-emerald-300 font-semibold">Single Unified ERP = $199/mo</td>
                            <td class="p-4 font-bold text-emerald-400">+$9,132 / Year Saved</td>
                        </tr>
                        <tr>
                            <td class="p-4 font-bold text-white">Manual Invoicing Labor</td>
                            <td class="p-4">15.2 hrs/wk typing supplier bills and receipts</td>
                            <td class="p-4 text-emerald-300 font-semibold">3-sec OCR extraction & auto-reconcile</td>
                            <td class="p-4 font-bold text-emerald-400">+$14,592 / Year Saved</td>
                        </tr>
                        <tr>
                            <td class="p-4 font-bold text-white">Prevented Stockouts</td>
                            <td class="p-4">Lost orders from stockouts & delayed quotes</td>
                            <td class="p-4 text-emerald-300 font-semibold">AI Demand Forecast + 1-Click Quotes</td>
                            <td class="p-4 font-bold text-emerald-400">+$18,600 / Year Captured</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="p-4 glass-panel rounded-xl border-emerald-500/40 bg-emerald-950/20 text-center">
                <span class="text-xl font-extrabold text-emerald-400">TOTAL ESTIMATED CLIENT VALUE: +$42,324 / YEAR IN MEASURABLE ROI</span>
                <p class="text-xs text-slate-400 mt-0.5">The platform pays for itself within the first 30 days of active deployment.</p>
            </div>
        </div>
    </section>

    <!-- SLIDE 8: Zero-Risk Onboarding & Close -->
    <section class="slide" id="slide-8">
        <div class="max-w-4xl mx-auto text-center space-y-8">
            <div>
                <h2 class="text-4xl font-extrabold">100% Zero-Risk Onboarding Guarantee</h2>
                <p class="text-slate-400 text-sm mt-1">We handle the entire transition so you experience zero business downtime</p>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                <div class="glass-panel p-4 rounded-xl border-cyan-500/30">
                    <span class="text-xs text-cyan-400 font-bold">1. 14-DAY TRIAL</span>
                    <h4 class="font-bold text-white text-sm mt-1">Full Access</h4>
                    <p class="text-[11px] text-slate-400 mt-1">No credit card required to start.</p>
                </div>
                <div class="glass-panel p-4 rounded-xl border-emerald-500/30">
                    <span class="text-xs text-emerald-400 font-bold">2. FREE MIGRATION</span>
                    <h4 class="font-bold text-white text-sm mt-1">Data Concierge</h4>
                    <p class="text-[11px] text-slate-400 mt-1">We format & load your Excel data.</p>
                </div>
                <div class="glass-panel p-4 rounded-xl border-purple-500/30">
                    <span class="text-xs text-purple-400 font-bold">3. 15-MIN JUMPSTART</span>
                    <h4 class="font-bold text-white text-sm mt-1">Fast Setup</h4>
                    <p class="text-[11px] text-slate-400 mt-1">Interactive checklist & sample data.</p>
                </div>
                <div class="glass-panel p-4 rounded-xl border-amber-500/30">
                    <span class="text-xs text-amber-400 font-bold">4. DEDICATED HELP</span>
                    <h4 class="font-bold text-white text-sm mt-1">Direct Line</h4>
                    <p class="text-[11px] text-slate-400 mt-1">Private WhatsApp/Slack channel.</p>
                </div>
            </div>

            <div class="p-8 glass-panel rounded-2xl border border-cyan-500/40 glow-cyan space-y-4">
                <h3 class="text-2xl font-bold">Ready to Experience the Autonomous AI ERP?</h3>
                <p class="text-slate-300 text-sm">Launch your private workspace today or schedule a personalized team demo.</p>
                <div class="flex justify-center gap-4 pt-2">
                    <a href="http://localhost:3000" target="_blank" class="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-white transition shadow-lg shadow-cyan-600/30">
                        🚀 Launch Live Workspace
                    </a>
                    <a href="Client_Executive_Pitch_and_Demo_Deck.pdf" download class="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-white transition border border-slate-700">
                        📥 Download Executive PDF Deck
                    </a>
                </div>
            </div>
        </div>
    </section>

    <script>
        let currentSlide = 1;
        const totalSlides = 8;

        function showSlide(index) {
            document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
            const target = document.getElementById(`slide-${index}`);
            if (target) {
                target.classList.add('active');
                currentSlide = index;
                document.getElementById('slideIndicator').innerText = `SLIDE ${currentSlide} / ${totalSlides}`;
            }
        }

        function nextSlide() {
            if (currentSlide < totalSlides) showSlide(currentSlide + 1);
        }

        function prevSlide() {
            if (currentSlide > 1) showSlide(currentSlide - 1);
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'Space') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
        });
    </script>
</body>
</html>
"""
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Interactive Client Pitch Portal built: {html_path}")


if __name__ == "__main__":
    build_premium_client_pitch_deck()
    build_premium_interactive_html_portal()
