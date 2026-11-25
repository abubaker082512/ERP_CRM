import os
import shutil
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle, Image as RLImage, PageBreak, KeepInFrame
)

BASE_DIR = r"D:\ERP_CRM"
DECK_ASSETS = os.path.join(BASE_DIR, "public", "deck_assets")
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
FRONTEND_PUBLIC_DIR = os.path.join(BASE_DIR, "frontend", "public")
TOTAL_SLIDES = 12

os.makedirs(PUBLIC_DIR, exist_ok=True)
os.makedirs(FRONTEND_PUBLIC_DIR, exist_ok=True)

def draw_investor_deck_bg(canvas_obj, doc):
    w, h = landscape(letter)
    page_num = canvas_obj._pageNumber
    
    canvas_obj.saveState()
    
    # 1. Base luxury dark background (#070B14)
    canvas_obj.setFillColor(colors.HexColor("#070B14"))
    canvas_obj.rect(0, 0, w, h, fill=1, stroke=0)
    
    # 2. Glowing top gradient accent bar (Cyan -> Purple -> Amber)
    canvas_obj.setFillColor(colors.HexColor("#38BDF8"))
    canvas_obj.rect(0, h - 4, w * 0.34, 4, fill=1, stroke=0)
    canvas_obj.setFillColor(colors.HexColor("#A855F7"))
    canvas_obj.rect(w * 0.34, h - 4, w * 0.33, 4, fill=1, stroke=0)
    canvas_obj.setFillColor(colors.HexColor("#F59E0B"))
    canvas_obj.rect(w * 0.67, h - 4, w * 0.33, 4, fill=1, stroke=0)

    # 3. Soft ambient background glow circles
    canvas_obj.setFillColor(colors.HexColor("#0F172A"))
    canvas_obj.circle(55, h - 55, 135, fill=1, stroke=0)
    canvas_obj.circle(w - 65, 65, 155, fill=1, stroke=0)

    # 4. Running Header (on slides 2 to 12)
    if page_num > 1:
        icon_path = os.path.join(FRONTEND_PUBLIC_DIR, "icon.png")
        if os.path.exists(icon_path):
            canvas_obj.drawImage(icon_path, 36, h - 25, width=13, height=13, mask='auto')
            header_x = 54
        else:
            header_x = 36
        canvas_obj.setFont("Helvetica-Bold", 8.5)
        canvas_obj.setFillColor(colors.HexColor("#38BDF8"))
        canvas_obj.drawString(header_x, h - 22, "BERAXIS AI  |  INTERNATIONAL INVESTOR PITCH DECK (2026)")
        
        canvas_obj.setFont("Helvetica-Bold", 8)
        canvas_obj.setFillColor(colors.HexColor("#34D399"))
        canvas_obj.drawRightString(w - 36, h - 22, "100+ USERS MILESTONE ACHIEVED  •  www.beraxis.online")
        
        canvas_obj.setStrokeColor(colors.HexColor("#1E293B"))
        canvas_obj.setLineWidth(0.75)
        canvas_obj.line(36, h - 28, w - 36, h - 28)

    # 5. Running Footer (all slides)
    canvas_obj.setStrokeColor(colors.HexColor("#1E293B"))
    canvas_obj.setLineWidth(0.75)
    canvas_obj.line(36, 26, w - 36, 26)

    canvas_obj.setFont("Helvetica", 7.8)
    canvas_obj.setFillColor(colors.HexColor("#64748B"))
    canvas_obj.drawString(36, 14, "Confidential Investor Memorandum • BERAXIS AI (HQ: Islamabad, Pakistan) • support@beraxis.online")
    canvas_obj.drawRightString(w - 36, 14, f"Slide {page_num} of {TOTAL_SLIDES}")
    
    canvas_obj.restoreState()


def wrap_centered_slide(flowables, avail_w=720, avail_h=530):
    """Wraps a slide's flowables inside a full-height vertically & horizontally centered container so every slide sits dead-center."""
    kif = KeepInFrame(avail_w, avail_h, flowables, mode='shrink')
    outer = Table([[kif]], colWidths=[avail_w], rowHeights=[avail_h])
    outer.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    return outer


def generate_international_investor_deck():
    os.makedirs(os.path.join(BASE_DIR, "scratch"), exist_ok=True)
    pdf_path = os.path.join(BASE_DIR, "scratch", "tmp_investor_deck.pdf")
    page_w, page_h = landscape(letter) # 792 x 612
    
    doc = BaseDocTemplate(
        pdf_path,
        pagesize=landscape(letter),
        leftMargin=36,
        rightMargin=36,
        topMargin=34,
        bottomMargin=32
    )

    frame = Frame(
        36, 32, page_w - 72, page_h - 66,
        id='investor_frame',
        leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0
    )
    template = PageTemplate(id='investor_slide', frames=frame, onPage=draw_investor_deck_bg)
    doc.addPageTemplates([template])

    styles = getSampleStyleSheet()

    # Centered slide titles & subtitles
    title_style = ParagraphStyle(
        'ITitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#F8FAFC'),
        alignment=1,
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'ISubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#94A3B8'),
        alignment=1,
        spaceAfter=14
    )
    card_title_cyan = ParagraphStyle(
        'ITCyan',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#38BDF8'),
        alignment=1
    )
    card_title_purple = ParagraphStyle(
        'ITPurple',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#C084FC'),
        alignment=1
    )
    card_title_green = ParagraphStyle(
        'ITGreen',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#34D399'),
        alignment=1
    )
    card_title_amber = ParagraphStyle(
        'ITAmber',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#FBBF24'),
        alignment=1
    )
    card_body = ParagraphStyle(
        'IBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.2,
        textColor=colors.HexColor('#CBD5E1')
    )
    card_body_center = ParagraphStyle(
        'IBodyCenter',
        parent=card_body,
        alignment=1
    )
    quote_box = ParagraphStyle(
        'IQBox',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#93C5FD'),
        backColor=colors.HexColor('#0F172A'),
        borderColor=colors.HexColor('#1E293B'),
        borderWidth=0.75,
        borderPadding=7,
        alignment=1
    )

    story = []

    # =========================================================================
    # SLIDE 1: Centered Cover Slide
    # =========================================================================
    s1 = []
    logo_path = os.path.join(FRONTEND_PUBLIC_DIR, "logo-full.png")
    if not os.path.exists(logo_path):
        logo_path = os.path.join(FRONTEND_PUBLIC_DIR, "icon.png")
    if os.path.exists(logo_path):
        img_logo = RLImage(logo_path, width=196, height=52)
        img_logo.hAlign = 'CENTER'
        s1.append(img_logo)
    s1.append(Spacer(1, 12))
    s1.append(Paragraph(
        "<font color='#34D399'><b>[ MILESTONE ACHIEVED: 100+ ACTIVE USERS ONBOARDED WITH $0 PAID AD SPEND ]</b></font>",
        ParagraphStyle('MilestoneBadge', fontName='Helvetica-Bold', fontSize=10, leading=14, alignment=1)
    ))
    s1.append(Spacer(1, 8))
    s1.append(Paragraph(
        "BERAXIS AI",
        ParagraphStyle('CoverT', fontName='Helvetica-Bold', fontSize=34, leading=38, textColor=colors.HexColor('#F8FAFC'), alignment=1)
    ))
    s1.append(Spacer(1, 4))
    s1.append(Paragraph(
        "The Autonomous AI ERP &amp; CRM Operating System Replacing Legacy SaaS Sprawl",
        ParagraphStyle('CoverSub', fontName='Helvetica-Bold', fontSize=13.5, leading=18, textColor=colors.HexColor('#38BDF8'), alignment=1)
    ))
    s1.append(Spacer(1, 8))
    s1.append(Paragraph(
        "Unifying <b>28 Enterprise Modules</b> (GAAP Accounting, CRM, Touch POS, Multi-Warehouse Inventory, HRMS &amp; MRP),<br/>"
        "<b>15 Turnkey Industry Archetypes & 1-Click AI Auto-Setup</b>, <b>25M+ Verified Global B2B Leads</b>, and a <b>Streaming Duplex AI Voice Pilot</b>.",
        ParagraphStyle('CoverDesc', fontName='Helvetica', fontSize=9.5, leading=14, textColor=colors.HexColor('#CBD5E1'), alignment=1)
    ))
    s1.append(Spacer(1, 18))

    pills_row_1 = [
        [
            Paragraph("<font size='15' color='#34D399'><b>100+ Users</b></font><br/><font size='7.5' color='#94A3B8'>Organic Launch Milestone</font>", ParagraphStyle('P1', alignment=1)),
            Paragraph("<font size='15' color='#38BDF8'><b>28 Modules</b></font><br/><font size='7.5' color='#94A3B8'>+ 15 Industry Blueprints</font>", ParagraphStyle('P2', alignment=1)),
            Paragraph("<font size='15' color='#C084FC'><b>25M+ Leads</b></font><br/><font size='7.5' color='#94A3B8'>Built-In B2B Directory</font>", ParagraphStyle('P3', alignment=1)),
            Paragraph("<font size='15' color='#FBBF24'><b>26.6x</b></font><br/><font size='7.5' color='#94A3B8'>LTV:CAC (84% Margin)</font>", ParagraphStyle('P4', alignment=1)),
        ]
    ]
    t_pill = Table(pills_row_1, colWidths=[178, 178, 178, 178], hAlign='CENTER')
    t_pill.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0F172A')),
        ('GRID', (0,0), (-1,-1), 0.75, colors.HexColor('#1E293B')),
        ('TOPPADDING', (0,0), (-1,-1), 11),
        ('BOTTOMPADDING', (0,0), (-1,-1), 11),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    s1.append(t_pill)
    s1.append(Spacer(1, 16))
    s1.append(Paragraph(
        "<b>Investment Round:</b> <font color='#34D399'>Raising $3.0M USD (Up to 30% Equity)</font> &nbsp;&nbsp;|&nbsp;&nbsp; "
        "<b>Headquarters:</b> Islamabad, Pakistan &nbsp;&nbsp;|&nbsp;&nbsp; "
        "<b>Early Bird:</b> $1/mo → <b>Regular:</b> $24.99/user/mo &nbsp;&nbsp;|&nbsp;&nbsp; "
        "<b>Web:</b> www.beraxis.online",
        ParagraphStyle('CoverFoot', fontName='Helvetica', fontSize=8.5, leading=12, textColor=colors.HexColor('#94A3B8'), alignment=1)
    ))
    story.append(wrap_centered_slide(s1))
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 2: The Problem (Centered)
    # =========================================================================
    s2 = [
        Paragraph("The Problem: The $960/Mo SaaS Tax & The ERP Consultant Trap", title_style),
        Paragraph("30 Million+ growing SMBs are caught between fragmented point tools and broken legacy ERP implementations", subtitle_style)
    ]
    prob_cards = [
        [
            Paragraph("<b>1. Fragmented Tool Sprawl ($960+/mo)</b>", card_title_cyan),
            Paragraph("<b>2. The Legacy ERP Consultant Trap</b>", card_title_purple),
            Paragraph("<b>3. Empty CRMs & 50-Click Fatigue</b>", card_title_amber)
        ],
        [
            Paragraph(
                "To operate a 15-person company, founders stitch together 5+ disconnected subscriptions:<br/><br/>"
                "• <b>HubSpot CRM:</b> $300/mo<br/>"
                "• <b>QuickBooks Online:</b> $90/mo<br/>"
                "• <b>Katana / Cin7 Inventory:</b> $350/mo<br/>"
                "• <b>Gusto Payroll:</b> $120/mo<br/>"
                "• <b>Apollo / Instantly Leads:</b> $100/mo<br/><br/>"
                "<b>Result:</b> $960+/month in bills and <b>15.2 hrs/wk wasted</b> re-typing data.",
                card_body
            ),
            Paragraph(
                "When SMBs try to consolidate on legacy ERPs like <b>Odoo, SAP, or NetSuite</b>, they hit a wall:<br/><br/>"
                "• <b>73% of legacy ERP projects</b> fail or exceed budget.<br/>"
                "• <b>$15,000–$50,000</b> in mandatory $150/hr consultant fees.<br/>"
                "• <b>3 to 6 months</b> of complex setup before going live.<br/>"
                "• <b>Upgrade Trap:</b> Odoo Community strips dynamic accounting; custom modules break on upgrades.",
                card_body
            ),
            Paragraph(
                "Traditional software was built for data entry clerks, not fast-moving founders:<br/><br/>"
                "• <b>Empty CRM Tax:</b> Salesforce and HubSpot charge up to $300/seat with zero leads included.<br/>"
                "• <b>Menu Fatigue:</b> Creating an invoice or checking stock requires 12+ submenu clicks.<br/>"
                "• <b>Zero Autonomy:</b> Legacy ERPs passively record the past instead of driving new revenue.",
                card_body
            )
        ]
    ]
    t_prob = Table(prob_cards, colWidths=[235, 240, 235], hAlign='CENTER')
    t_prob.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#111C33')),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#0F172A')),
        ('GRID', (0,0), (-1,-1), 0.75, colors.HexColor('#1E293B')),
        ('TOPPADDING', (0,0), (-1,-1), 9),
        ('BOTTOMPADDING', (0,0), (-1,-1), 9),
        ('LEFTPADDING', (0,0), (-1,-1), 9),
        ('RIGHTPADDING', (0,0), (-1,-1), 9),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    s2.append(t_prob)
    s2.append(Spacer(1, 10))
    s2.append(Paragraph(
        "<b>The Market Gap:</b> Businesses do not want 10 separate SaaS bills or a $25,000 Odoo consultant. They want an <b>instant, self-configuring AI Operating System</b>.",
        quote_box
    ))
    story.append(wrap_centered_slide(s2))
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 3: The Solution — BERAXIS AI (Latest Frontpage Hero Screenshot)
    # =========================================================================
    s3 = [
        Paragraph("The Solution: BERAXIS AI — Autonomous Business OS in 30 Seconds", title_style),
        Paragraph("One unified cloud platform replacing Odoo, HubSpot, QuickBooks, Square, and Apollo with native Dual-Brain AI", subtitle_style)
    ]
    dash_img = os.path.join(DECK_ASSETS, "dashboard_hero.jpg")
    col_dash_img = []
    if os.path.exists(dash_img):
        col_dash_img.append(RLImage(dash_img, width=420, height=236))

    col_sol_text = [
        Paragraph("<b>4 Core Technological Breakthroughs:</b>", ParagraphStyle('SolH', parent=card_title_cyan, alignment=0)),
        Spacer(1, 4),
        Paragraph(
            "<b>1. 1-Click 'Explain Your Business' AI Auto-Setup (15 Industries):</b><br/>"
            "Select from 15 global industry archetypes with our 1-Click 'Explain Your Business' Auto-Setup Engine. BERAXIS AI auto-configures your Chart of Accounts, tax rules, POS layouts, and role permissions in 1 click.<br/><br/>"
            "<b>2. 3.1-Second AI Receipt & Invoice OCR:</b><br/>"
            "Drop any supplier PDF or paper receipt into the workspace; AI extracts line items, tax codes, and posts balanced double-entry journal entries automatically.<br/><br/>"
            "<b>3. Streaming Duplex AI Voice Pilot:</b><br/>"
            "Speak naturally to run operations: <i>'Draft an invoice for Acme Corp for $1,500'</i> or <i>'Show today's register P&L'</i>.<br/><br/>"
            "<b>4. 25,000,000+ Built-In B2B Leads Engine:</b><br/>"
            "Pre-loaded global corporate directory with verified emails, direct dials, and 94.2% AI win-probability scoring.",
            card_body
        )
    ]
    t_sol = Table([[col_sol_text, col_dash_img]], colWidths=[280, 430], hAlign='CENTER')
    t_sol.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    s3.append(t_sol)
    story.append(wrap_centered_slide(s3))
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 4: Live Traction & The 100+ Users Milestone (Centered)
    # =========================================================================
    s4 = [
        Paragraph("Live Traction & Validation: 100+ Active Users Milestone Achieved", title_style),
        Paragraph("Explosive early adoption, verified organic search momentum, and enterprise-grade production readiness", subtitle_style)
    ]
    traction_pills = [
        [
            Paragraph("<font size='15' color='#34D399'><b>100+ Users</b></font><br/><font size='7.5' color='#94A3B8'>Active Early-Adopter Workspaces</font>", ParagraphStyle('TP1', alignment=1)),
            Paragraph("<font size='15' color='#38BDF8'><b>$0 CAC</b></font><br/><font size='7.5' color='#94A3B8'>100% Organic Growth To Date</font>", ParagraphStyle('TP2', alignment=1)),
            Paragraph("<font size='15' color='#C084FC'><b>307 Routes</b></font><br/><font size='7.5' color='#94A3B8'>Live Pre-Rendered Production Pages</font>", ParagraphStyle('TP3', alignment=1)),
            Paragraph("<font size='15' color='#FBBF24'><b>428+ / Wk</b></font><br/><font size='7.5' color='#94A3B8'>Google Search Impressions (+3,000%)</font>", ParagraphStyle('TP4', alignment=1)),
        ]
    ]
    t_tpills = Table(traction_pills, colWidths=[178, 178, 178, 178], hAlign='CENTER')
    t_tpills.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#111C33')),
        ('GRID', (0,0), (-1,-1), 0.75, colors.HexColor('#1E293B')),
        ('TOPPADDING', (0,0), (-1,-1), 9),
        ('BOTTOMPADDING', (0,0), (-1,-1), 9),
    ]))
    s4.append(t_tpills)
    s4.append(Spacer(1, 12))

    traction_details = [
        [
            Paragraph("<b>1. The 100+ Users Milestone</b>", card_title_green),
            Paragraph("<b>2. Google Search Console Velocity</b>", card_title_cyan),
            Paragraph("<b>3. Live Payment & Global Infrastructure</b>", card_title_purple)
        ],
        [
            Paragraph(
                "• Surpassed <b>100+ onboarded users and business entities</b> across retail, sports clubs, clinics, agencies, and wholesale.<br/>"
                "• Achieved with <b>$0 paid marketing spend</b> through Product-Led Growth (PLG), community distribution, and organic discovery.<br/>"
                "• High activation driven by the <b>1-App Free Forever</b> wedge and 30-second self-service workspace initialization.",
                card_body
            ),
            Paragraph(
                "• <b>64+ Core Sitemap Hubs & 307 Static Routes</b> indexed by Googlebot within weeks of launch.<br/>"
                "• <b>428+ Weekly Organic Impressions</b> in Google Search Console, peaking at 100+ impressions/day.<br/>"
                "• Ranking for high-intent commercial queries: <i>'Odoo alternative'</i>, <i>'affordable cloud ERP'</i> (+3,000% spike), and <i>'CRM for padel club'</i>.",
                card_body
            ),
            Paragraph(
                "• <b>Global Merchant of Record (MoR):</b> Live checkout integrated via Creem, Paddle, Stripe, DirectPay, and 30+ Cryptocurrencies.<br/>"
                "• <b>Headquarters &amp; R&amp;D Hub:</b> Centrally operated from Islamabad, Pakistan with capital-efficient engineering velocity.<br/>"
                "• <b>99.9% Uptime SLA:</b> Multi-tenant PostgreSQL with strict Row-Level Security (RLS) and 256-bit encryption.",
                card_body
            )
        ]
    ]
    t_tdet = Table(traction_details, colWidths=[235, 240, 235], hAlign='CENTER')
    t_tdet.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#0B1120')),
        ('GRID', (0,0), (-1,-1), 0.75, colors.HexColor('#1E293B')),
        ('TOPPADDING', (0,0), (-1,-1), 9),
        ('BOTTOMPADDING', (0,0), (-1,-1), 9),
        ('LEFTPADDING', (0,0), (-1,-1), 9),
        ('RIGHTPADDING', (0,0), (-1,-1), 9),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    s4.append(t_tdet)
    story.append(wrap_centered_slide(s4))
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 5: Product Scope — 28 Enterprise Modules & Live Internal Views
    # =========================================================================
    s5 = [
        Paragraph("Unmatched Product Depth: 28 Unified Apps & 15 Industry Blueprints", title_style),
        Paragraph("Live inside the BERAXIS AI system: Unified Apps Cockpit & Real-Time Executive Financial Command Center", subtitle_style)
    ]
    apps_img_path = os.path.join(DECK_ASSETS, "feature_showcase_2.jpg")
    dash_view_path = os.path.join(DECK_ASSETS, "analytics_growth_view.jpg")
    col_apps_img = []
    col_dash_view = []
    if os.path.exists(apps_img_path):
        col_apps_img.append(RLImage(apps_img_path, width=345, height=194))
        col_apps_img.append(Spacer(1, 4))
        col_apps_img.append(Paragraph("<b>Live System View 1:</b> All 28+ Unified Enterprise Apps Cockpit (<i>/apps</i>)", card_body_center))
    if os.path.exists(dash_view_path):
        col_dash_view.append(RLImage(dash_view_path, width=345, height=194))
        col_dash_view.append(Spacer(1, 4))
        col_dash_view.append(Paragraph("<b>Live System View 2:</b> Executive Overview &amp; Pipeline Analytics (<i>/dashboard</i>)", card_body_center))

    t_screens = Table([[col_apps_img, col_dash_view]], colWidths=[355, 355], hAlign='CENTER')
    t_screens.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    s5.append(t_screens)

    scope_pills = [
        [
            Paragraph("<b>Financial Core</b><br/><font size='7.8' color='#CBD5E1'>GAAP Ledger, Trial Balance, P&amp;L, 3.1s AI OCR, Multi-Currency</font>", ParagraphStyle('SP1', fontName='Helvetica', fontSize=8.5, leading=11.5, textColor=colors.HexColor('#38BDF8'), alignment=1)),
            Paragraph("<b>CRM, POS &amp; Leads</b><br/><font size='7.8' color='#CBD5E1'>Visual Kanban CRM, 25M+ B2B Leads, Touch POS, Split-Bills</font>", ParagraphStyle('SP2', fontName='Helvetica', fontSize=8.5, leading=11.5, textColor=colors.HexColor('#34D399'), alignment=1)),
            Paragraph("<b>Supply Chain &amp; HR</b><br/><font size='7.8' color='#CBD5E1'>Multi-Warehouse Stock, MRP/BOM, HRMS, 1-Click Payroll, E-Sign</font>", ParagraphStyle('SP3', fontName='Helvetica', fontSize=8.5, leading=11.5, textColor=colors.HexColor('#C084FC'), alignment=1)),
            Paragraph("<b>15 Industry Engines</b><br/><font size='7.8' color='#CBD5E1'>Padel Clubs, Clinics, Dining, Garages, Real Estate, Retail, NGOs</font>", ParagraphStyle('SP4', fontName='Helvetica', fontSize=8.5, leading=11.5, textColor=colors.HexColor('#FBBF24'), alignment=1)),
        ]
    ]
    t_spills = Table(scope_pills, colWidths=[178, 178, 178, 178], hAlign='CENTER')
    t_spills.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0F172A')),
        ('GRID', (0,0), (-1,-1), 0.75, colors.HexColor('#1E293B')),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    s5.append(t_spills)
    story.append(wrap_centered_slide(s5))
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 6: Market Opportunity ($62B -> $136B)
    # =========================================================================
    s6 = [
        Paragraph("Massive Market Opportunity: $62B → $136B Global Wave", title_style),
        Paragraph("Enterprise ERP is moving downmarket to 30M+ SMBs demanding AI automation over expensive consulting delays", subtitle_style)
    ]
    chart_tam = os.path.join(DECK_ASSETS, "chart_market_tam.png")
    col_chart_tam = []
    if os.path.exists(chart_tam):
        col_chart_tam.append(RLImage(chart_tam, width=420, height=230))

    col_text_tam = [
        Paragraph("<b>TAM / SAM / SOM Breakdown:</b>", ParagraphStyle('TamH', parent=card_title_cyan, alignment=0)),
        Spacer(1, 4),
        Paragraph(
            "• <b>$136B Global TAM (13.8% CAGR):</b> Global Cloud ERP & CRM software market expanding rapidly through 2030.<br/><br/>"
            "• <b>$34.8B Serviceable Market (SAM):</b> 30M+ SMBs across North America, Europe, UK, MENA, and APAC actively replacing spreadsheets and legacy ERPs.<br/><br/>"
            "• <b>$98M+ Serviceable Obtainable Market (SOM):</b> Capturing just 1.2% of SMBs switching from Odoo, HubSpot, and QuickBooks represents $98M+ in high-margin recurring revenue.",
            card_body
        )
    ]
    t_tam = Table([[col_text_tam, col_chart_tam]], colWidths=[280, 430], hAlign='CENTER')
    t_tam.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    s6.append(t_tam)
    story.append(wrap_centered_slide(s6))
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 7: Competitive Landscape
    # =========================================================================
    s7 = [
        Paragraph("Competitive Disruption: BERAXIS AI vs. Legacy Giants", title_style),
        Paragraph("The only platform combining full GAAP ERP, 25M+ B2B Leads, and Duplex Voice AI at 1/20th the TCO", subtitle_style)
    ]
    chart_comp = os.path.join(DECK_ASSETS, "chart_competitor_comparison.png")
    col_chart_comp = []
    if os.path.exists(chart_comp):
        col_chart_comp.append(RLImage(chart_comp, width=420, height=230))

    col_text_comp = [
        Paragraph("<b>Why BERAXIS AI Wins Head-to-Head:</b>", ParagraphStyle('CompH', parent=card_title_purple, alignment=0)),
        Spacer(1, 4),
        Paragraph(
            "• <b>vs. Odoo ERP:</b> Odoo requires 90 days & $15,000+ in consultants, and strips accounting from Community. BERAXIS AI activates in 30 seconds with full accounting and zero consultant fees.<br/><br/>"
            "• <b>vs. HubSpot & Salesforce:</b> They charge $300–$800/mo for CRM alone with zero accounting, POS, or inventory. BERAXIS AI includes CRM + 25M leads + full ERP.<br/><br/>"
            "• <b>vs. QuickBooks Online:</b> QuickBooks charges $85–$200/mo for basic bookkeeping with no CRM, no B2B leads, and expensive POS addons.",
            card_body
        )
    ]
    t_comp = Table([[col_text_comp, col_chart_comp]], colWidths=[280, 430], hAlign='CENTER')
    t_comp.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    s7.append(t_comp)
    story.append(wrap_centered_slide(s7))
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 8: Business Model & Disruptive PLG Pricing Wedge
    # =========================================================================
    s8 = [
        Paragraph("Business Model: $1.00 Early Bird Wedge → $24.99/User/Mo Standard Scale", title_style),
        Paragraph("Frictionless $1.00 USD launch pricing drives rapid adoption before scaling to $24.99 USD per user per month", subtitle_style)
    ]
    pricing_tiers = [
        [
            Paragraph("<b>Tier 1: Forever Free (PQL Wedge)</b>", card_title_green),
            Paragraph("<b>Tier 2: Early Bird ($1.00/User/Mo)</b>", card_title_cyan),
            Paragraph("<b>Tier 3: Standard Full Suite ($24.99/User/Mo)</b>", card_title_purple)
        ],
        [
            Paragraph(
                "<b>Price:</b> $0 Forever (No Credit Card)<br/><br/>"
                "• Pick <b>any 1 full ERP module</b> (CRM, POS, or Accounting) free forever.<br/>"
                "• Unlimited records &amp; transactions.<br/>"
                "• 50 Starter B2B Lead Previews.<br/><br/>"
                "<b>Strategic Role:</b> Viral top-of-funnel customer acquisition hook that converts 65%+ of visitors into active workspaces.",
                card_body
            ),
            Paragraph(
                "<b>Launch Offer:</b> $1.00 USD / user / month<br/><br/>"
                "• Limited-time Early Bird introductory rate ($12/yr billed annually).<br/>"
                "• Unlocks <b>all 28+ enterprise modules</b>.<br/>"
                "• <b>1,500 verified B2B lead credits/mo</b>.<br/>"
                "• 3.1s AI Receipt OCR &amp; Voice Pilot.<br/><br/>"
                "<b>Strategic Role:</b> Zero-friction land-and-expand wedge to rapidly capture market share from Odoo &amp; QuickBooks.",
                card_body
            ),
            Paragraph(
                "<b>Post-Early Bird Rate:</b> $24.99 USD / user / month<br/><br/>"
                "• Standard recurring per-seat pricing as early-bird cohorts graduate and teams add staff seats.<br/>"
                "• Multi-company &amp; multi-branch consolidation.<br/>"
                "• Native Cold Email &amp; AI Voice Calling engine.<br/>"
                "• Usage expansion: AI calling minutes ($0.12/min), extra OCR &amp; B2B lead packs (+132% NRR).",
                card_body
            )
        ]
    ]
    t_price = Table(pricing_tiers, colWidths=[235, 240, 235], hAlign='CENTER')
    t_price.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#111C33')),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#0F172A')),
        ('GRID', (0,0), (-1,-1), 0.75, colors.HexColor('#1E293B')),
        ('TOPPADDING', (0,0), (-1,-1), 9),
        ('BOTTOMPADDING', (0,0), (-1,-1), 9),
        ('LEFTPADDING', (0,0), (-1,-1), 9),
        ('RIGHTPADDING', (0,0), (-1,-1), 9),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    s8.append(t_price)
    s8.append(Spacer(1, 10))
    s8.append(Paragraph(
        "<b>The Land-and-Expand Economics:</b> Early adopters onboard at <b>$1.00 USD/user/mo</b>; post-launch accounts and additional team seats scale at <b>$24.99 USD/user/mo</b> (a 10-user SMB generates $249.90/mo + AI usage credits).",
        quote_box
    ))
    story.append(wrap_centered_slide(s8))
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 9: Unit Economics
    # =========================================================================
    s9 = [
        Paragraph("World-Class Unit Economics: 26.6x LTV:CAC & 84% Gross Margin", title_style),
        Paragraph("Serverless edge architecture and programmatic organic distribution yield best-in-class capital efficiency", subtitle_style)
    ]
    chart_unit = os.path.join(DECK_ASSETS, "chart_unit_economics.png")
    col_chart_unit = []
    if os.path.exists(chart_unit):
        col_chart_unit.append(RLImage(chart_unit, width=420, height=230))

    col_text_unit = [
        Paragraph("<b>Institutional SaaS Metrics:</b>", ParagraphStyle('UnitH', parent=card_title_green, alignment=0)),
        Spacer(1, 4),
        Paragraph(
            "• <b>Blended CAC ($180):</b> Driven by 307 programmatic SEO pages, viral 1-App Free tier, and 30% partner referral loops.<br/><br/>"
            "• <b>Customer LTV ($4,800):</b> System-of-record stickiness across accounting + inventory + POS yields <2.5% monthly churn.<br/><br/>"
            "• <b>84% SaaS Gross Margin:</b> Next.js 15 + FastAPI + multi-tenant Supabase RLS keeps infrastructure + AI inference costs ultra-lean.<br/><br/>"
            "• <b>1.1-Month CAC Payback & 132% NRR:</b> Rapid capital recycling.",
            card_body
        )
    ]
    t_unit = Table([[col_text_unit, col_chart_unit]], colWidths=[280, 430], hAlign='CENTER')
    t_unit.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    s9.append(t_unit)
    story.append(wrap_centered_slide(s9))
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 10: Go-To-Market (GTM) — 4 Scalable Global Distribution Engines
    # =========================================================================
    s10 = [
        Paragraph("Go-To-Market Strategy: 4 Scalable Global Distribution Engines", title_style),
        Paragraph("Repeatable, low-CAC acquisition channels scaling from 100+ users to 18,000+ global businesses", subtitle_style)
    ]
    gtm_cards = [
        [
            Paragraph("<b>1. Programmatic SEO Engine</b>", card_title_cyan),
            Paragraph("<b>2. Agency & CPA Partner Portal</b>", card_title_purple),
            Paragraph("<b>3. 24-Hr White-Glove Migration</b>", card_title_green),
            Paragraph("<b>4. Autonomous AI Dogfooding</b>", card_title_amber)
        ],
        [
            Paragraph(
                "• <b>307 Static SEO Pages</b> targeting high-intent buyer keywords (<i>'Odoo Alternative'</i>, <i>'$1 Cloud ERP'</i>, <i>'Padel Club CRM'</i>).<br/><br/>"
                "• Already generating <b>428+ weekly Google impressions</b> and compounding organically every week.",
                card_body
            ),
            Paragraph(
                "• Live <b>30% Recurring Revenue Share</b> affiliate portal (<i>/affiliates</i>).<br/><br/>"
                "• Bookkeepers, CPAs, and IT agencies onboard 10–50 SMB clients at once to replace expensive QuickBooks/Odoo setups.",
                card_body
            ),
            Paragraph(
                "• Eliminates the #1 ERP switching barrier.<br/><br/>"
                "• AI schema mapper + engineering concierge migrates messy Odoo, QuickBooks, or Excel sheets in <b>under 24 hours for free</b>.",
                card_body
            ),
            Paragraph(
                "• We use BERAXIS AI's own <b>25M+ B2B Lead Directory</b>, Cold Email Engine, and AI Voice Calling agents to prospect 10,000+ SMBs/month at near-zero marginal cost.",
                card_body
            )
        ]
    ]
    t_gtm = Table(gtm_cards, colWidths=[178, 178, 178, 178], hAlign='CENTER')
    t_gtm.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#111C33')),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#0F172A')),
        ('GRID', (0,0), (-1,-1), 0.75, colors.HexColor('#1E293B')),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    s10.append(t_gtm)
    story.append(wrap_centered_slide(s10))
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 11: 5-Year Financial Forecast ($835K -> $62M ARR)
    # =========================================================================
    s11 = [
        Paragraph("5-Year Financial Forecast: Pathway from 100+ Users to $62M ARR", title_style),
        Paragraph("Clear, milestone-driven scaling trajectory across North America, Europe, UK, and MENA", subtitle_style)
    ]
    chart_arr = os.path.join(DECK_ASSETS, "chart_arr_growth.png")
    col_chart_arr = []
    if os.path.exists(chart_arr):
        col_chart_arr.append(RLImage(chart_arr, width=420, height=230))

    col_text_arr = [
        Paragraph("<b>5-Year ARR & Account Projection:</b>", ParagraphStyle('ArrH', parent=card_title_cyan, alignment=0)),
        Spacer(1, 4),
        Paragraph(
            "• <b>Current Milestone:</b> 100+ Active Users onboarded organically.<br/><br/>"
            "• <b>Year 1 ($835K ARR):</b> 1,500 Free Users / 350 Paying SMBs via SEO, PLG wedge & direct outbound.<br/><br/>"
            "• <b>Year 2 ($4.6M ARR):</b> 1,800 Paying Accounts + AI Voice Calling & Lead Pool credit monetization.<br/><br/>"
            "• <b>Year 3 ($16.5M ARR):</b> 5,500 Paying Accounts powered by 250+ accounting & agency channel partners.<br/><br/>"
            "• <b>Year 4 ($34.2M ARR):</b> 10,500 Accounts across US, UK, EU & GCC.<br/><br/>"
            "• <b>Year 5 ($62.0M ARR):</b> 18,000+ Accounts at 84% Gross Margin.",
            card_body
        )
    ]
    t_arr = Table([[col_text_arr, col_chart_arr]], colWidths=[280, 430], hAlign='CENTER')
    t_arr.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    s11.append(t_arr)
    story.append(wrap_centered_slide(s11))
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 12: Capital Allocation, Leadership & Investment Close
    # =========================================================================
    s12 = [
        Paragraph("The Investment Ask: Raising $3.0M USD for Up to 30% Equity", title_style),
        Paragraph("Deploying $3,000,000 USD in growth capital to accelerate global distribution, AI autonomy, and channel partnerships", subtitle_style)
    ]
    alloc_data = [
        [Paragraph("<b>Use of Funds Category</b>", card_title_cyan), Paragraph("<b>Allocation ($3.0M)</b>", card_title_green), Paragraph("<b>Execution Milestones &amp; Expected ROI</b>", card_title_cyan)],
        [
            Paragraph("<b>1. Autonomous AI &amp; Product R&amp;D</b>", card_body_center),
            Paragraph("<b>40% ($1.20M)</b>", card_body_center),
            Paragraph("Sub-second Duplex Voice Pilot v2, autonomous bookkeeping agents, mobile native apps, and 50+ global banking/tax integrations.", card_body)
        ],
        [
            Paragraph("<b>2. Global GTM &amp; Outbound Engine</b>", card_body_center),
            Paragraph("<b>35% ($1.05M)</b>", card_body_center),
            Paragraph("Scale performance acquisition, AI outbound calling fleets, and high-intent search capture across US, UK, Europe, and MENA.", card_body)
        ],
        [
            Paragraph("<b>3. Channel Partner Ecosystem</b>", card_body_center),
            Paragraph("<b>15% ($450K)</b>", card_body_center),
            Paragraph("Onboard 250+ CPA firms, bookkeepers, and ERP migration agencies on our 30% recurring partner program to drive bulk SMB migrations.", card_body)
        ],
        [
            Paragraph("<b>4. Enterprise Security &amp; Concierge</b>", card_body_center),
            Paragraph("<b>10% ($300K)</b>", card_body_center),
            Paragraph("SOC-2 Type II certification, ISO-27001 compliance, and 24/7 white-glove data migration engineers.", card_body)
        ]
    ]
    t_alloc = Table(alloc_data, colWidths=[175, 105, 430], hAlign='CENTER')
    t_alloc.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#111C33')),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#0F172A')),
        ('GRID', (0,0), (-1,-1), 0.75, colors.HexColor('#1E293B')),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    s12.append(t_alloc)
    s12.append(Spacer(1, 14))

    final_cta = [
        [
            Paragraph(
                "<font size='13' color='#F8FAFC'><b>Investment Round: Raising $3,000,000 USD for Up to 30% Equity</b></font><br/>"
                "<font size='9' color='#34D399'><b>[ 100+ Active Users Milestone Achieved &nbsp;&nbsp;|&nbsp;&nbsp; 28 Live Enterprise Modules &nbsp;&nbsp;|&nbsp;&nbsp; 26.6x LTV:CAC ]</b></font><br/><br/>"
                "<font size='9.5' color='#38BDF8'><b>Live Platform:</b> https://www.beraxis.online</font> &nbsp;&nbsp;•&nbsp;&nbsp; "
                "<font size='9.5' color='#C084FC'><b>Investor Relations:</b> support@beraxis.online</font> &nbsp;&nbsp;•&nbsp;&nbsp; "
                "<font size='9.5' color='#FBBF24'><b>Direct / WhatsApp:</b> +1 (970) 780-7993</font>",
                ParagraphStyle('FCTA', alignment=1, leading=14)
            )
        ]
    ]
    t_fcta = Table(final_cta, colWidths=[710], hAlign='CENTER')
    t_fcta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0F172A')),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor('#38BDF8')),
        ('TOPPADDING', (0,0), (-1,-1), 11),
        ('BOTTOMPADDING', (0,0), (-1,-1), 11),
    ]))
    s12.append(t_fcta)
    story.append(wrap_centered_slide(s12))

    doc.build(story)

    # Copy to all public destinations so links work everywhere
    for target in [
        os.path.join(BASE_DIR, "Beraxis_Investor_Pitch_Deck.pdf"),
        os.path.join(BASE_DIR, "Beraxis_Growth_and_Financial_Pitch_Deck.pdf"),
        os.path.join(PUBLIC_DIR, "Beraxis_Investor_Pitch_Deck.pdf"),
        os.path.join(PUBLIC_DIR, "Beraxis_Growth_and_Financial_Pitch_Deck.pdf"),
        os.path.join(FRONTEND_PUBLIC_DIR, "Beraxis_Investor_Pitch_Deck.pdf"),
        os.path.join(FRONTEND_PUBLIC_DIR, "Beraxis_Growth_and_Financial_Pitch_Deck.pdf"),
    ]:
        try:
            shutil.copy2(pdf_path, target)
        except Exception as e:
            print(f"Note: could not overwrite {target} (likely open in viewer): {e}")
    print(f"Successfully generated 12-slide Centered International Investor Pitch Deck PDF!")

if __name__ == "__main__":
    generate_international_investor_deck()
