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

class NumberedCanvas(canvas.Canvas):
    """Canvas that adds running headers and page numbers (Page X of Y)."""
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
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        if self._pageNumber == 1:
            return  # Skip cover page
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        # Header
        self.drawString(54, 750, "Next-Gen AI ERP & CRM | Sales Campaign & User Onboarding Playbook")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 744, letter[0] - 54, 744)
        
        # Footer
        text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 36, text)
        self.drawString(54, 36, "CONFIDENTIAL - For Internal Sales & Growth Team Use Only")
        self.line(54, 48, letter[0] - 54, 48)
        self.restoreState()


class DeckNumberedCanvas(canvas.Canvas):
    """Canvas for landscape presentation deck."""
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
            self.draw_deck_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_deck_decorations(self, page_count):
        if self._pageNumber == 1:
            return  # Title slide has its own design
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        # Top banner line
        self.setStrokeColor(colors.HexColor("#3b82f6"))
        self.setLineWidth(2)
        self.line(40, 575, landscape(letter)[0] - 40, 575)
        
        # Bottom footer
        self.drawString(40, 20, "Next-Gen AI ERP & CRM  |  Executive Product Deck & Competitive Analysis")
        self.drawRightString(landscape(letter)[0] - 40, 20, f"Slide {self._pageNumber} of {page_count}")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(40, 30, landscape(letter)[0] - 40, 30)
        self.restoreState()


def build_playbook_pdf():
    pdf_path = os.path.join(BASE_DIR, "Sales_Campaign_and_Onboarding_Playbook.pdf")
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#0f172a'),
        alignment=0
    )
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#475569'),
        alignment=0
    )
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor('#1e3a8a'),
        spaceBefore=14,
        spaceAfter=6
    )
    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=10,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#334155'),
        spaceAfter=6
    )
    bullet_style = ParagraphStyle(
        'CustomBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155'),
        leftIndent=12,
        spaceAfter=3
    )
    quote_style = ParagraphStyle(
        'QuoteBlock',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1e293b'),
        backColor=colors.HexColor('#f1f5f9'),
        borderColor=colors.HexColor('#3b82f6'),
        borderWidth=1,
        borderPadding=8,
        spaceBefore=6,
        spaceAfter=8
    )
    badge_style = ParagraphStyle(
        'Badge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white,
        alignment=1
    )

    story = []

    # --- COVER / HEADER ---
    logo_path = os.path.join(BASE_DIR, "logo2.png")
    if os.path.exists(logo_path):
        story.append(RLImage(logo_path, width=45, height=45))
        story.append(Spacer(1, 10))

    story.append(Paragraph("30-DAY FAST-TRACK USER ACQUISITION & ONBOARDING PLAYBOOK", title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("A Practical Field Manual for Sales, Marketing, and Customer Success Teams", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#2563eb'), spaceAfter=14))

    # Executive Overview
    story.append(Paragraph("1. Executive Campaign Strategy & 30-Day Targets", h1_style))
    story.append(Paragraph(
        "This playbook outlines the aggressive 30-day sprint to acquire, activate, and retain maximum users for our <b>Next-Gen AI ERP & CRM Platform</b>. Our core value proposition is cutting Time-to-Value (TTV) from 3 months (traditional ERPs like Odoo/SAP) to <b>under 15 minutes</b> through AI automation, zero-friction setup, and free white-glove data migration.",
        body_style
    ))

    # Metric Table
    metric_data = [
        [Paragraph("<b>Metric Goal</b>", body_style), Paragraph("<b>30-Day Target</b>", body_style), Paragraph("<b>Primary Channel / Mechanism</b>", body_style)],
        [Paragraph("New Workspace Signups", body_style), Paragraph("<b>250+ Companies</b>", body_style), Paragraph("Cold Outbound, LinkedIn, Referral Network", body_style)],
        [Paragraph("D0 Setup Completion", body_style), Paragraph("<b>≥ 65%</b>", body_style), Paragraph("15-Min In-App Interactive Checklist", body_style)],
        [Paragraph("White-Glove Migrations", body_style), Paragraph("<b>40+ Accounts</b>", body_style), Paragraph("Free Excel/Odoo Data Cleanup Concierge", body_style)],
        [Paragraph("Accountant / IT Partners", body_style), Paragraph("<b>10 Active Partners</b>", body_style), Paragraph("Free Multi-Client Portal + 20% Rev-Share", body_style)],
        [Paragraph("PQL to Paid Conversion", body_style), Paragraph("<b>15% - 20%</b>", body_style), Paragraph("Founding Member Lifetime Pricing Offer", body_style)]
    ]
    t = Table(metric_data, colWidths=[140, 100, 260])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t)
    story.append(Spacer(1, 14))

    # Section 2: 4-Week Acquisition Sprint Calendar
    story.append(Paragraph("2. 4-Week Execution Roadmap", h1_style))
    
    weeks = [
        ("Week 1: Direct Network & Founder-Led Outreach", [
            "<b>Objective:</b> Land first 50 beta accounts and stress-test onboarding.",
            "<b>Action:</b> Launch personal LinkedIn DMs and WhatsApp outreach to direct network and local SMBs.",
            "<b>Offer:</b> 'Beta Founding Member' — Free lifetime onboarding + 1,000 bonus AI OCR credits."
        ]),
        ("Week 2: 'Escape Spreadsheet & Odoo Hell' Migration Blitz", [
            "<b>Objective:</b> Target frustrated Excel and legacy ERP users.",
            "<b>Action:</b> Deploy cold emails and outreach focused on our <i>Free White-Glove Data Migration</i> service.",
            "<b>Lead Magnet:</b> Free 2026 SME Cash Flow & Inventory Optimization Template."
        ]),
        ("Week 3: Channel Partner Flywheel (Accountants & IT Agencies)", [
            "<b>Objective:</b> Build 1-to-many distribution.",
            "<b>Action:</b> Pitch local bookkeeping firms and fractional CFOs. Offer them our multi-tenant accounting dashboard.",
            "<b>Incentive:</b> 20% recurring lifetime commission on every client they bring."
        ]),
        ("Week 4: Urgency Push & Scarcity Closing", [
            "<b>Objective:</b> Convert active free trials and PQLs to paid subscribers.",
            "<b>Action:</b> Host 20-minute live demo webinar; send 'Last Chance for Founding Pricing' email triggers."
        ])
    ]

    for title, points in weeks:
        story.append(Paragraph(f"• <b>{title}</b>", h2_style))
        for pt in points:
            story.append(Paragraph(f"  - {pt}", bullet_style))
    story.append(Spacer(1, 10))

    # Section 3: Future AI Growth Engine (Marketing, Cold Email & Cold Calling)
    story.append(Paragraph("3. Future Growth Levers: Built-in AI Marketing, Cold Email & AI Cold Calling", h1_style))
    story.append(Paragraph(
        "Unlike traditional ERPs that only record existing operations, our platform is expanding into an <b>Autonomous Revenue Generation Engine</b> that brings in new business for our clients:",
        body_style
    ))

    features = [
        ("1. Integrated Multi-Channel Marketing Suite", "Manage lead generation campaigns, landing pages, and social tracking directly inside the CRM."),
        ("2. Automated Cold Email Outreach Engine", "Built-in email warmup, sequence automation, and AI-personalized copywriting that sends targeted outreach to prospects and tracks replies directly into the Sales Pipeline."),
        ("3. AI Voice Agent & Autonomous Cold Calling (Add-on / Minimal Fee)", "Equip users with AI voice agents that dial inbound leads in seconds, conduct initial qualification calls, book meetings onto the ERP calendar, and log call sentiment transcripts automatically into the lead card."),
        ("4. Human Support Agent Hybrid Option", "For enterprise clients who prefer human touch, offering dedicated SDR support agents powered by our ERP platform at an affordable monthly fee.")
    ]
    for feat_title, feat_desc in features:
        story.append(Paragraph(f"<b>{feat_title}</b>: {feat_desc}", bullet_style))

    story.append(Spacer(1, 12))

    # Page Break for Outreach Scripts & Handout
    story.append(PageBreak())

    # Section 4: Sales Team Outreach Scripts
    story.append(Paragraph("4. Ready-to-Send Sales Scripts & Templates", h1_style))
    
    story.append(Paragraph("A. LinkedIn InMail / Direct Message Script (For SMB Owners & Ops Managers)", h2_style))
    story.append(Paragraph(
        "<i>\"Hi {{FirstName}},<br/><br/>"
        "Saw that you're scaling operations at {{CompanyName}}. Most business owners I speak with are losing 10+ hours a week jumping between fragmented tools for invoicing, stock tracking, and sales follow-ups.<br/><br/>"
        "We built a Next-Gen AI ERP & CRM that automates manual entry with instant receipt/bill OCR, auto-scores sales leads, and predicts inventory re-order dates.<br/><br/>"
        "We are offering <b>free white-glove data migration</b> this week (our engineering team imports all your existing Excel/Odoo data for you at no charge).<br/><br/>"
        "Open to a quick 5-minute look at our interactive demo?\"</i>",
        quote_style
    ))

    story.append(Paragraph("B. 3-Step Cold Email Sequence", h2_style))
    
    story.append(Paragraph("<b>Email 1 (Day 1) — Problem / Solution Pitch</b>", body_style))
    story.append(Paragraph("<b>Subject:</b> Tired of manual invoice typing and scattered spreadsheets, {{FirstName}}?", bullet_style))
    story.append(Paragraph(
        "<i>\"Hi {{FirstName}},<br/>"
        "If your team is still spending hours manually keying in supplier invoices, chasing pipeline updates, or guessing inventory levels, there is a much faster way.<br/><br/>"
        "Our AI ERP unifies Sales, Accounting, and Inventory into one clean, ultra-fast workspace:<br/>"
        "• <b>AI OCR Scanner:</b> Drop any PDF invoice and auto-populate accounting entries.<br/>"
        "• <b>Smart CRM:</b> Predicts deal close probability and automates follow-ups.<br/>"
        "• <b>Predictive Inventory:</b> Alerts you before stockouts happen.<br/><br/>"
        "You can explore the full platform for 14 days without a credit card: <b>[Launch Demo Workspace]</b><br/><br/>"
        "Best,<br/>{{YourName}}\"</i>",
        quote_style
    ))

    story.append(Paragraph("<b>Email 2 (Day 4) — Free Migration Concierge Hook</b>", body_style))
    story.append(Paragraph("<b>Subject:</b> We will migrate your data for free (this week only)", bullet_style))
    story.append(Paragraph(
        "<i>\"Hi {{FirstName}},<br/>"
        "The hardest part of switching software is moving customer and inventory records. That's why our tech team will do it for you.<br/><br/>"
        "Send us your Excel sheets or Odoo exports, and we'll format and load your entire company dataset within 24 hours.<br/><br/>"
        "Claim your free migration slot here: <b>[Book Free Migration Session]</b>\"</i>",
        quote_style
    ))

    story.append(Paragraph("C. WhatsApp Quick Pitch (High Conversion for Local SMBs)", h2_style))
    story.append(Paragraph(
        "<i>\"👋 Hey {{FirstName}}, quick update: We just launched an AI-powered ERP & CRM platform that automates sales, inventory, and accounting receipts without the complex setup of Odoo.<br/><br/>"
        "🚀 Try the live demo in 60 seconds: [YOUR_URL]<br/><br/>"
        "Reply 'MIGRATE' if you'd like our team to upload your data for free today!\"</i>",
        quote_style
    ))

    story.append(Spacer(1, 10))
    story.append(Paragraph("5. Sales Objection Handling Guide", h1_style))
    
    objections = [
        ("Objection: 'We already use Excel / Google Sheets and it's free.'", 
         "<b>Response:</b> 'Excel is free, but human error and manual data entry cost your team 15+ hours every week. With our AI, you drop invoices and receipts in, and your books and stock balance update automatically.'"),
        ("Objection: 'We looked at Odoo/SAP, but implementation is too long and complex.'", 
         "<b>Response:</b> 'That's exactly why we built this. Odoo takes 3 months of consulting. Our platform runs out of the box in 15 minutes, and our team does the data setup for you for free.'"),
        ("Objection: 'What if we need marketing and cold outbound later?'", 
         "<b>Response:</b> 'Our platform has an upcoming native Cold Email & AI Calling engine, meaning you won't need to purchase third-party tools like Lemlist, Instantly, or Bland AI.'")
    ]
    for obj, resp in objections:
        story.append(Paragraph(f"• <b>{obj}</b>", body_style))
        story.append(Paragraph(resp, bullet_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Playbook PDF built successfully: {pdf_path}")


def build_presentation_deck_pdf():
    pdf_path = os.path.join(BASE_DIR, "NextGen_AI_ERP_Presentation.pdf")
    # Landscape Letter
    page_w, page_h = landscape(letter)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=landscape(letter),
        leftMargin=40,
        rightMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    
    slide_title = ParagraphStyle(
        'SlideTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=4
    )
    slide_subtitle = ParagraphStyle(
        'SlideSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#475569'),
        spaceAfter=12
    )
    card_title = ParagraphStyle(
        'CardTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#1e3a8a')
    )
    card_body = ParagraphStyle(
        'CardBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#334155')
    )
    
    story = []

    # -------------------------------------------------------------
    # SLIDE 1: Title Slide (Cover)
    # -------------------------------------------------------------
    story.append(Spacer(1, 40))
    logo_path = os.path.join(BASE_DIR, "Logo.png")
    if os.path.exists(logo_path):
        story.append(RLImage(logo_path, width=160, height=100))
    story.append(Spacer(1, 20))
    story.append(Paragraph("NEXT-GEN AI ERP & CRM PLATFORM", ParagraphStyle('T1', fontName='Helvetica-Bold', fontSize=26, leading=30, textColor=colors.HexColor('#0f172a'))))
    story.append(Spacer(1, 6))
    story.append(Paragraph("The Autonomous Operating System for High-Growth Businesses", ParagraphStyle('T2', fontName='Helvetica', fontSize=14, leading=18, textColor=colors.HexColor('#2563eb'))))
    story.append(Spacer(1, 15))
    story.append(Paragraph("Replacing Legacy ERP Complexity with Instant AI Automation • Sales • Invoicing • Inventory • Marketing & Cold Outbound", ParagraphStyle('T3', fontName='Helvetica', fontSize=10, leading=14, textColor=colors.HexColor('#64748b'))))
    story.append(PageBreak())

    # -------------------------------------------------------------
    # SLIDE 2: The Core Problem vs Our Solution
    # -------------------------------------------------------------
    story.append(Paragraph("The Problem: Legacy ERPs & Spreadsheet Fragmentation", slide_title))
    story.append(Paragraph("Why modern businesses are ditching legacy ERPs like Odoo, SAP, and manual Excel spreadsheets", slide_subtitle))
    
    prob_sol_data = [
        [Paragraph("<b>Traditional ERPs (Odoo / SAP / Zoho)</b>", card_title), Paragraph("<b>Next-Gen AI ERP (Our Platform)</b>", card_title)],
        [
            Paragraph("❌ <b>3-6 Months Implementation:</b> Requires costly certified consultants.<br/>"
                      "❌ <b>High Manual Overhead:</b> Staff manually enters invoices, leads, and bills.<br/>"
                      "❌ <b>Clunky, Legacy UX:</b> Steep learning curves leading to low employee adoption.<br/>"
                      "❌ <b>Siloed Tools:</b> Requires separate software for cold outreach, calling, and marketing.<br/>"
                      "❌ <b>Unpredictable Costs:</b> Hidden fees per app, module, and user license.", card_body),
            Paragraph("✅ <b>Live in 15 Minutes:</b> Zero-friction setup with 1-click data migration.<br/>"
                      "✅ <b>AI-Powered Automation:</b> OCR scans receipts & bills, AI scores sales leads.<br/>"
                      "✅ <b>Modern High-Speed Interface:</b> Built on Next.js for instant responsiveness.<br/>"
                      "✅ <b>Integrated Revenue Engine:</b> Upcoming native Cold Email & AI Cold Calling.<br/>"
                      "✅ <b>Transparent Pricing:</b> All modules included with generous AI credits.", card_body)
        ]
    ]
    t_ps = Table(prob_sol_data, colWidths=[340, 340])
    t_ps.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,1), colors.HexColor('#fef2f2')),
        ('BACKGROUND', (1,0), (1,1), colors.HexColor('#f0fdf4')),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(t_ps)
    story.append(PageBreak())

    # -------------------------------------------------------------
    # SLIDE 3: Live System Screenshot & UX Architecture
    # -------------------------------------------------------------
    story.append(Paragraph("Product Showcase: Clean, Modern Architecture", slide_title))
    story.append(Paragraph("Live capture of the enterprise workspace & intelligent module dashboard", slide_subtitle))
    
    post_login_path = os.path.join(BASE_DIR, "scratch", "post_login_screenshot.png")
    if not os.path.exists(post_login_path):
        post_login_path = os.path.join(BASE_DIR, "scratch", "homepage_screenshot.png")
    
    col_left = [
        Paragraph("<b>Unified Modular Ecosystem:</b>", card_title),
        Spacer(1, 4),
        Paragraph("• <b>Sales & Pipeline:</b> Visual Kanban boards with real-time deal probability scoring.", card_body),
        Paragraph("• <b>Smart Accounting:</b> Automated P&L, balance sheets, and tax ledger reports.", card_body),
        Paragraph("• <b>Warehouse & Inventory:</b> Multi-location stock tracking with AI reorder alerts.", card_body),
        Paragraph("• <b>HRMS & Payroll:</b> Employee directory, leaves management, and salary slips.", card_body),
        Spacer(1, 10),
        Paragraph("<b>Instant Time-to-Value:</b>", card_title),
        Spacer(1, 4),
        Paragraph("Users can switch between departments seamlessly without losing state or context.", card_body)
    ]
    
    col_right = []
    if os.path.exists(post_login_path):
        col_right.append(RLImage(post_login_path, width=420, height=262))
    
    t_showcase = Table([[col_left, col_right]], colWidths=[260, 430])
    t_showcase.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_showcase)
    story.append(PageBreak())

    # -------------------------------------------------------------
    # SLIDE 4: Core Module Deep-Dive (CRM, Accounting, Operations)
    # -------------------------------------------------------------
    story.append(Paragraph("Core Feature Differentiation Matrix", slide_title))
    story.append(Paragraph("How each core module outperforms market alternatives", slide_subtitle))

    diff_table_data = [
        [Paragraph("<b>Module</b>", card_title), Paragraph("<b>Key Capability</b>", card_title), Paragraph("<b>AI Advantage over Competitors</b>", card_title)],
        [
            Paragraph("<b>Intelligent CRM</b>", card_body),
            Paragraph("Lead capture, visual pipeline, activity tracking, meeting booking.", card_body),
            Paragraph("<b>AI Lead Scoring & Sentiment:</b> Rates conversion probability and flags churn risks in email threads.", card_body)
        ],
        [
            Paragraph("<b>Automated Accounting</b>", card_body),
            Paragraph("Invoicing, vendor bills, bank reconciliation, financial reports.", card_body),
            Paragraph("<b>OCR Auto-Parsing:</b> Auto-extracts line items and totals from PDF receipts in seconds.", card_body)
        ],
        [
            Paragraph("<b>Smart Inventory & MRP</b>", card_body),
            Paragraph("SKU tracking, warehouse transfers, Bill of Materials (BOM).", card_body),
            Paragraph("<b>Predictive Demand Forecasting:</b> Analyzes historical sales velocity to prevent stockouts.", card_body)
        ],
        [
            Paragraph("<b>HRMS & Payroll</b>", card_body),
            Paragraph("Attendance, leave requests, employee records, payroll calculation.", card_body),
            Paragraph("<b>Smart Employee Insights:</b> Automated payroll ledger generation and leave balance tracking.", card_body)
        ]
    ]
    t_diff = Table(diff_table_data, colWidths=[120, 260, 300])
    t_diff.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_diff)
    story.append(PageBreak())

    # -------------------------------------------------------------
    # SLIDE 5: The Future Roadmap — AI Marketing, Cold Email & Cold Calling
    # -------------------------------------------------------------
    story.append(Paragraph("The Revenue Engine: Built-in Marketing & Outbound Calling", slide_title))
    story.append(Paragraph("Transforming ERP from a back-office recording system into an active growth driver", slide_subtitle))

    road_cards = [
        [
            Paragraph("<b>1. Multi-Channel Marketing Suite</b>", card_title),
            Paragraph("<b>2. Automated Cold Email Engine</b>", card_title),
            Paragraph("<b>3. AI Voice & Cold Calling Agents</b>", card_title)
        ],
        [
            Paragraph("• Centralized campaign dashboard.<br/>"
                      "• Landing page & lead form builder.<br/>"
                      "• Multi-channel attribution tracking (Meta, Google, LinkedIn).<br/>"
                      "• Leads funnel directly into CRM stages.", card_body),
            Paragraph("• Built-in email warmup & inbox rotation.<br/>"
                      "• AI-generated personalized outreach copy.<br/>"
                      "• Automated multi-step follow-ups.<br/>"
                      "• Seamless lead conversion on reply.", card_body),
            Paragraph("• Autonomous AI phone agents for outbound dials.<br/>"
                      "• Conducts qualification & books meetings on calendar.<br/>"
                      "• Real-time speech transcription & sentiment analysis.<br/>"
                      "• Optional human SDR support add-on at low monthly fee.", card_body)
        ]
    ]
    t_road = Table(road_cards, colWidths=[225, 225, 230])
    t_road.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#eff6ff')),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#bfdbfe')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_road)
    story.append(Spacer(1, 14))
    story.append(Paragraph(
        "<b>Monetization Model for Growth Add-ons:</b> Included standard tier + minimal pay-as-you-go fees for AI voice calling minutes and verified email sending pools, providing extreme ROI for SMBs.",
        ParagraphStyle('Note', fontName='Helvetica-Oblique', fontSize=9, leading=13, textColor=colors.HexColor('#1e40af'), alignment=1)
    ))
    story.append(PageBreak())

    # -------------------------------------------------------------
    # SLIDE 6: 30-Day Acquisition Strategy & Conclusion
    # -------------------------------------------------------------
    story.append(Paragraph("30-Day Launch Plan: Scaling to Maximum Users", slide_title))
    story.append(Paragraph("How we capture and onboard hundreds of businesses in our first month", slide_subtitle))

    sprint_data = [
        [Paragraph("<b>Phase</b>", card_title), Paragraph("<b>Growth Play</b>", card_title), Paragraph("<b>Key Conversion Hook</b>", card_title)],
        [
            Paragraph("<b>Week 1</b>", card_body),
            Paragraph("Founder Network & Direct LinkedIn/WhatsApp Blitz", card_body),
            Paragraph("<b>'Founding Member'</b> 14-day full access + free concierge data migration.", card_body)
        ],
        [
            Paragraph("<b>Week 2</b>", card_body),
            Paragraph("'Escape Excel' Cold Email Migration Campaign", card_body),
            Paragraph("<b>Free Data Cleanup:</b> We format and load their Excel records in 24 hours.", card_body)
        ],
        [
            Paragraph("<b>Week 3</b>", card_body),
            Paragraph("Channel Partners (Bookkeepers & IT Consultants)", card_body),
            Paragraph("<b>Partner Portal:</b> Free multi-client access + 20% recurring revenue share.", card_body)
        ],
        [
            Paragraph("<b>Week 4</b>", card_body),
            Paragraph("Scarcity Push & Trial-to-Paid Conversion", card_body),
            Paragraph("<b>Lifetime AI Credit Lock:</b> Lock in founding pricing before general launch.", card_body)
        ]
    ]
    t_sprint = Table(sprint_data, colWidths=[80, 280, 320])
    t_sprint.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_sprint)
    story.append(Spacer(1, 15))
    story.append(Paragraph("<b>Ready to Onboard?</b> Visit <u>http://localhost:3000</u> | Contact our Growth Team for instant setup.", ParagraphStyle('Contact', fontName='Helvetica-Bold', fontSize=10, leading=14, textColor=colors.HexColor('#2563eb'), alignment=1)))

    doc.build(story, canvasmaker=DeckNumberedCanvas)
    print(f"Presentation PDF built successfully: {pdf_path}")


def build_interactive_html_deck():
    html_path = os.path.join(BASE_DIR, "presentation_deck.html")
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Next-Gen AI ERP & CRM - Presentation Deck</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #0b0f19; color: #f8fafc; overflow-x: hidden; }
        .slide { display: none; min-height: 100vh; padding: 3rem 4rem; }
        .slide.active { display: flex; flex-direction: column; justify-content: center; }
        .glass-card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .gradient-text { background: linear-gradient(135deg, #60a5fa 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    </style>
</head>
<body class="relative">

    <!-- Top Navigation Bar -->
    <div class="fixed top-0 left-0 right-0 h-16 glass-card z-50 flex items-center justify-between px-8">
        <div class="flex items-center gap-3">
            <span class="text-xl font-bold gradient-text">NextGen AI ERP</span>
            <span class="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">Executive Deck</span>
        </div>
        <div class="flex items-center gap-4">
            <span id="slideIndicator" class="text-sm font-semibold text-slate-400">Slide 1 / 6</span>
            <button onclick="prevSlide()" class="p-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold transition">◀</button>
            <button onclick="nextSlide()" class="p-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold transition">▶</button>
        </div>
    </div>

    <!-- SLIDE 1: Cover -->
    <section class="slide active" id="slide-1">
        <div class="max-w-4xl mx-auto text-center space-y-6">
            <div class="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold text-sm">
                ⚡ The Autonomous Operating System for SMBs
            </div>
            <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight">
                Next-Generation <br/><span class="gradient-text">AI ERP & CRM Platform</span>
            </h1>
            <p class="text-xl text-slate-400 max-w-2xl mx-auto">
                Replacing legacy ERP complexity with 15-minute setup, OCR invoice automation, predictive sales scoring, and autonomous growth engines.
            </p>
            <div class="pt-8 flex justify-center gap-4">
                <button onclick="nextSlide()" class="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-bold hover:opacity-90 shadow-lg shadow-blue-500/20">
                    Explore Platform Presentation →
                </button>
            </div>
        </div>
    </section>

    <!-- SLIDE 2: Problem vs Solution -->
    <section class="slide" id="slide-2">
        <div class="max-w-6xl mx-auto w-full space-y-8">
            <div class="text-center">
                <h2 class="text-3xl font-bold">The Shift: Legacy ERPs vs. Next-Gen AI ERP</h2>
                <p class="text-slate-400 mt-2">Why businesses are migrating away from Odoo, SAP, and spreadsheets</p>
            </div>
            <div class="grid md:grid-cols-2 gap-8">
                <div class="glass-card p-8 rounded-2xl border-red-500/20 bg-red-950/10 space-y-4">
                    <h3 class="text-xl font-bold text-red-400 flex items-center gap-2">❌ Legacy ERPs (Odoo / SAP / Zoho)</h3>
                    <ul class="space-y-3 text-sm text-slate-300">
                        <li>• <b>3-6 Months Setup:</b> Requires expensive certified consultants.</li>
                        <li>• <b>Manual Data Typing:</b> Staff spends hours inputting receipts and invoices.</li>
                        <li>• <b>Clunky, Fragmented UX:</b> Complex menus that cause employee resistance.</li>
                        <li>• <b>Disconnected Outbound:</b> No native cold email or calling engine.</li>
                        <li>• <b>Expensive Add-Ons:</b> Surprise charges for basic connectors.</li>
                    </ul>
                </div>
                <div class="glass-card p-8 rounded-2xl border-green-500/20 bg-green-950/10 space-y-4">
                    <h3 class="text-xl font-bold text-green-400 flex items-center gap-2">✅ Next-Gen AI ERP (Our Platform)</h3>
                    <ul class="space-y-3 text-sm text-slate-300">
                        <li>• <b>15-Minute Activation:</b> 1-click data import and self-guided wizard.</li>
                        <li>• <b>AI OCR Automation:</b> Instant receipt and bill parsing into accounting.</li>
                        <li>• <b>Modern React/Next.js UI:</b> Blazing fast, intuitive, and mobile-ready.</li>
                        <li>• <b>Integrated Growth Suite:</b> Native Cold Email & AI Cold Calling.</li>
                        <li>• <b>Transparent Pricing:</b> All modules unified with generous AI credits.</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- SLIDE 3: Product Screenshot Showcase -->
    <section class="slide" id="slide-3">
        <div class="max-w-6xl mx-auto w-full space-y-6">
            <div class="flex justify-between items-end">
                <div>
                    <h2 class="text-3xl font-bold">Real Product Interface & Live Workspace</h2>
                    <p class="text-slate-400">Streamlined navigation across CRM, Accounting, Inventory, and HRMS</p>
                </div>
                <span class="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">Live Next.js 14 Build</span>
            </div>
            <div class="grid md:grid-cols-12 gap-8 items-center">
                <div class="md:col-span-4 space-y-4">
                    <div class="glass-card p-5 rounded-xl">
                        <h4 class="font-bold text-blue-400">📊 AI-Assisted CRM</h4>
                        <p class="text-xs text-slate-300 mt-1">Lead win-probability scoring & deal health alerts.</p>
                    </div>
                    <div class="glass-card p-5 rounded-xl">
                        <h4 class="font-bold text-indigo-400">🧾 Instant OCR Invoicing</h4>
                        <p class="text-xs text-slate-300 mt-1">Extract line items from PDF supplier bills in 3 seconds.</p>
                    </div>
                    <div class="glass-card p-5 rounded-xl">
                        <h4 class="font-bold text-purple-400">📦 Predictive Inventory</h4>
                        <p class="text-xs text-slate-300 mt-1">Automated stock forecasting based on sales velocity.</p>
                    </div>
                </div>
                <div class="md:col-span-8">
                    <div class="glass-card p-2 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                        <img src="./scratch/post_login_screenshot.png" alt="Product Screenshot" class="w-full h-auto rounded-xl object-cover hover:scale-105 transition duration-500">
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- SLIDE 4: Core Module Deep Dive -->
    <section class="slide" id="slide-4">
        <div class="max-w-6xl mx-auto w-full space-y-6">
            <div class="text-center">
                <h2 class="text-3xl font-bold">Comprehensive All-in-One Capabilities</h2>
                <p class="text-slate-400">Everything needed to run an enterprise under one roof</p>
            </div>
            <div class="grid md:grid-cols-4 gap-6">
                <div class="glass-card p-6 rounded-2xl space-y-3">
                    <div class="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg">💼</div>
                    <h3 class="font-bold text-lg">Intelligent CRM</h3>
                    <p class="text-xs text-slate-300 leading-relaxed">Visual Kanban pipelines, AI deal scoring, automated email sync, and meeting booking.</p>
                </div>
                <div class="glass-card p-6 rounded-2xl space-y-3">
                    <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">📈</div>
                    <h3 class="font-bold text-lg">Accounting & Tax</h3>
                    <p class="text-xs text-slate-300 leading-relaxed">Double-entry ledger, automated bank reconciliation, OCR bills, and one-click financial statements.</p>
                </div>
                <div class="glass-card p-6 rounded-2xl space-y-3">
                    <div class="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-lg">🏭</div>
                    <h3 class="font-bold text-lg">Inventory & MRP</h3>
                    <p class="text-xs text-slate-300 leading-relaxed">Multi-warehouse stock, Bill of Materials (BOM), serial tracking, and automated replenishment.</p>
                </div>
                <div class="glass-card p-6 rounded-2xl space-y-3">
                    <div class="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-lg">👥</div>
                    <h3 class="font-bold text-lg">HRMS & Payroll</h3>
                    <p class="text-xs text-slate-300 leading-relaxed">Employee directory, automated salary slips, leave tracking, and team attendance.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- SLIDE 5: Future Marketing & Cold Outbound Engine -->
    <section class="slide" id="slide-5">
        <div class="max-w-6xl mx-auto w-full space-y-6">
            <div class="text-center">
                <span class="text-xs bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full border border-purple-500/30 font-semibold">Future Roadmap & Monetization</span>
                <h2 class="text-3xl font-bold mt-2">Autonomous Revenue Engine: Marketing & Cold Calling</h2>
                <p class="text-slate-400">Empowering users to generate pipeline directly inside the ERP</p>
            </div>
            <div class="grid md:grid-cols-3 gap-6">
                <div class="glass-card p-6 rounded-2xl space-y-4 border-blue-500/30">
                    <h3 class="font-bold text-xl text-blue-400">1. Marketing Suite</h3>
                    <p class="text-sm text-slate-300">Lead generation campaign tracking, landing page creation, and multi-channel marketing attribution.</p>
                    <div class="text-xs text-blue-300 bg-blue-900/30 p-3 rounded-lg">✓ Connects directly to CRM deal pipeline</div>
                </div>
                <div class="glass-card p-6 rounded-2xl space-y-4 border-indigo-500/30">
                    <h3 class="font-bold text-xl text-indigo-400">2. Cold Email Engine</h3>
                    <p class="text-sm text-slate-300">Automated inbox warmup, AI-personalized email sequences, and high-deliverability sending pools.</p>
                    <div class="text-xs text-indigo-300 bg-indigo-900/30 p-3 rounded-lg">✓ Replaces Lemlist / Instantly ($100+/mo savings)</div>
                </div>
                <div class="glass-card p-6 rounded-2xl space-y-4 border-purple-500/30">
                    <h3 class="font-bold text-xl text-purple-400">3. AI Cold Calling & Voice</h3>
                    <p class="text-sm text-slate-300">Autonomous AI phone agents that dial leads, qualify interest, book calendar appointments, or route to human SDRs for a minimal fee.</p>
                    <div class="text-xs text-purple-300 bg-purple-900/30 p-3 rounded-lg">✓ Real-time transcript & sentiment logged in CRM</div>
                </div>
            </div>
        </div>
    </section>

    <!-- SLIDE 6: 30-Day Campaign & Call to Action -->
    <section class="slide" id="slide-6">
        <div class="max-w-4xl mx-auto text-center space-y-8">
            <h2 class="text-4xl font-bold">30-Day User Acquisition & Onboarding Sprint</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                <div class="glass-card p-4 rounded-xl">
                    <span class="text-xs text-blue-400 font-bold">WEEK 1</span>
                    <h4 class="font-bold mt-1 text-sm">Direct Blitz</h4>
                    <p class="text-xs text-slate-400 mt-1">50 Beta Accounts & Founder DMs</p>
                </div>
                <div class="glass-card p-4 rounded-xl">
                    <span class="text-xs text-emerald-400 font-bold">WEEK 2</span>
                    <h4 class="font-bold mt-1 text-sm">Migration Blitz</h4>
                    <p class="text-xs text-slate-400 mt-1">Free Excel/Odoo Data Cleanup</p>
                </div>
                <div class="glass-card p-4 rounded-xl">
                    <span class="text-xs text-amber-400 font-bold">WEEK 3</span>
                    <h4 class="font-bold mt-1 text-sm">Partner Flywheel</h4>
                    <p class="text-xs text-slate-400 mt-1">Accountant & Consultant Portals</p>
                </div>
                <div class="glass-card p-4 rounded-xl">
                    <span class="text-xs text-purple-400 font-bold">WEEK 4</span>
                    <h4 class="font-bold mt-1 text-sm">Founding Lock</h4>
                    <p class="text-xs text-slate-400 mt-1">Scarcity & PQL-to-Paid Push</p>
                </div>
            </div>
            <div class="p-8 glass-card rounded-2xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/40">
                <h3 class="text-2xl font-bold">Ready to Equip Your Sales & Growth Team?</h3>
                <p class="text-slate-300 text-sm mt-2">Download the comprehensive PDF Playbook and start onboarding users today.</p>
                <div class="mt-6 flex justify-center gap-4">
                    <a href="Sales_Campaign_and_Onboarding_Playbook.pdf" download class="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white transition">
                        📥 Download Sales Playbook (PDF)
                    </a>
                    <a href="NextGen_AI_ERP_Presentation.pdf" download class="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-white transition border border-slate-600">
                        📊 Download Slide Deck (PDF)
                    </a>
                </div>
            </div>
        </div>
    </section>

    <script>
        let currentSlide = 1;
        const totalSlides = 6;

        function showSlide(index) {
            document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
            const target = document.getElementById(`slide-${index}`);
            if (target) {
                target.classList.add('active');
                currentSlide = index;
                document.getElementById('slideIndicator').innerText = `Slide ${currentSlide} / ${totalSlides}`;
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
    print(f"Interactive Presentation HTML built successfully: {html_path}")

if __name__ == "__main__":
    build_playbook_pdf()
    build_presentation_deck_pdf()
    build_interactive_html_deck()
