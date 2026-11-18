import os
import shutil
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle, Image as RLImage, PageBreak
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
        canvas_obj.setFont("Helvetica-Bold", 8.5)
        canvas_obj.setFillColor(colors.HexColor("#38BDF8"))
        canvas_obj.drawString(36, h - 22, "BERAXIS AI  |  INTERNATIONAL INVESTOR PITCH DECK (2026)")
        
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
    canvas_obj.drawString(36, 14, "Confidential Investor Memorandum • BERAXIS AI Systems Inc. (Miami, FL & Islamabad) • support@beraxis.online")
    canvas_obj.drawRightString(w - 36, 14, f"Slide {page_num} of {TOTAL_SLIDES}")
    
    canvas_obj.restoreState()


def generate_international_investor_deck():
    pdf_path = os.path.join(BASE_DIR, "Beraxis_Investor_Pitch_Deck.pdf")
    page_w, page_h = landscape(letter) # 792 x 612
    
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
        id='investor_frame',
        leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0
    )
    template = PageTemplate(id='investor_slide', frames=frame, onPage=draw_investor_deck_bg)
    doc.addPageTemplates([template])

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'ITitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=19,
        leading=23,
        textColor=colors.HexColor('#F8FAFC'),
        spaceAfter=3
    )
    subtitle_style = ParagraphStyle(
        'ISubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#94A3B8'),
        spaceAfter=11
    )
    card_title_cyan = ParagraphStyle(
        'ITCyan',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#38BDF8')
    )
    card_title_purple = ParagraphStyle(
        'ITPurple',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#C084FC')
    )
    card_title_green = ParagraphStyle(
        'ITGreen',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#34D399')
    )
    card_title_amber = ParagraphStyle(
        'ITAmber',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#FBBF24')
    )
    card_body = ParagraphStyle(
        'IBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.6,
        leading=12.4,
        textColor=colors.HexColor('#CBD5E1')
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
        borderPadding=7
    )

    story = []

    # =========================================================================
    # SLIDE 1: Cover Slide
    # =========================================================================
    story.append(Spacer(1, 25))
    logo_path = os.path.join(BASE_DIR, "logo2.png")
    if os.path.exists(logo_path):
        story.append(RLImage(logo_path, width=50, height=50))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "<font color='#34D399'><b>★ 100+ ACTIVE USERS MILESTONE ACHIEVED (ZERO PAID AD SPEND) ★</b></font>",
        ParagraphStyle('MilestoneBadge', fontName='Helvetica-Bold', fontSize=9.5, leading=13, alignment=0)
    ))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "BERAXIS AI",
        ParagraphStyle('CoverT', fontName='Helvetica-Bold', fontSize=32, leading=36, textColor=colors.HexColor('#F8FAFC'), alignment=0)
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "The Autonomous AI ERP & CRM Operating System Replacing Legacy SaaS Sprawl",
        ParagraphStyle('CoverSub', fontName='Helvetica-Bold', fontSize=13.5, leading=18, textColor=colors.HexColor('#38BDF8'), alignment=0)
    ))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "Unifying <b>28 Enterprise Modules</b> (GAAP Accounting, CRM, Touch POS, Multi-Warehouse Inventory, HRMS & MRP), "
        "<b>12 Turnkey Industry Archetypes</b>, <b>25M+ Verified Global B2B Leads</b>, and a <b>Streaming Duplex AI Voice Pilot</b> into one platform.",
        ParagraphStyle('CoverDesc', fontName='Helvetica', fontSize=9.5, leading=14, textColor=colors.HexColor('#CBD5E1'), alignment=0)
    ))
    story.append(Spacer(1, 18))

    pills_row_1 = [
        [
            Paragraph("<font size='15' color='#34D399'><b>100+ Users</b></font><br/><font size='7.5' color='#94A3B8'>Organic Launch Milestone</font>", ParagraphStyle('P1', alignment=1)),
            Paragraph("<font size='15' color='#38BDF8'><b>28 Modules</b></font><br/><font size='7.5' color='#94A3B8'>+ 12 Industry Blueprints</font>", ParagraphStyle('P2', alignment=1)),
            Paragraph("<font size='15' color='#C084FC'><b>25M+ Leads</b></font><br/><font size='7.5' color='#94A3B8'>Built-In B2B Directory</font>", ParagraphStyle('P3', alignment=1)),
            Paragraph("<font size='15' color='#FBBF24'><b>26.6x</b></font><br/><font size='7.5' color='#94A3B8'>LTV:CAC (84% Margin)</font>", ParagraphStyle('P4', alignment=1)),
        ]
    ]
    t_pill = Table(pills_row_1, colWidths=[178, 178, 178, 178])
    t_pill.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0F172A')),
        ('GRID', (0,0), (-1,-1), 0.75, colors.HexColor('#1E293B')),
        ('TOPPADDING', (0,0), (-1,-1), 11),
        ('BOTTOMPADDING', (0,0), (-1,-1), 11),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_pill)
    story.append(Spacer(1, 14))
    story.append(Paragraph(
        "<b>Live Platform:</b> https://www.beraxis.online &nbsp;&nbsp;|&nbsp;&nbsp; "
        "<b>US HQ:</b> Miami, Florida &nbsp;&nbsp;|&nbsp;&nbsp; "
        "<b>Engineering Hub:</b> Islamabad &nbsp;&nbsp;|&nbsp;&nbsp; "
        "<b>Contact:</b> +1 (970) 780-7993",
        ParagraphStyle('CoverFoot', fontName='Helvetica', fontSize=8.5, leading=12, textColor=colors.HexColor('#94A3B8'))
    ))
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 2: The Problem
    # =========================================================================
    story.append(Spacer(1, 12))
    story.append(Paragraph("The Problem: The $960/Mo SaaS Tax & The ERP Consultant Trap", title_style))
    story.append(Paragraph("30 Million+ growing SMBs are caught between fragmented point tools and broken legacy ERP implementations", subtitle_style))

    prob_cards = [
        [
            Paragraph("<b>1. Fragmented Tool Sprawl ($960+/mo)</b>", card_title_cyan),
            Paragraph("<b>2. The Legacy ERP Consultant Trap</b>", card_title_purple),
            Paragraph("<b>3. Empty CRMs & 50-Click Fatigue</b>", card_title_amber)
        ],
        [
            Paragraph(
                "To operate a 15-person company, founders are forced to stitch together 5+ disconnected subscriptions:<br/><br/>"
                "• <b>HubSpot CRM:</b> $300/mo<br/>"
                "• <b>QuickBooks Online:</b> $90/mo<br/>"
                "• <b>Katana / Cin7 Inventory:</b> $350/mo<br/>"
                "• <b>Gusto Payroll:</b> $120/mo<br/>"
                "• <b>Apollo / Instantly Leads:</b> $100/mo<br/><br/>"
                "<b>Result:</b> $960+/month in software bills and <b>15.2 hours wasted every week</b> manually re-typing data across silos.",
                card_body
            ),
            Paragraph(
                "When SMBs try to consolidate on legacy ERPs like <b>Odoo, SAP, or NetSuite</b>, they hit a wall:<br/><br/>"
                "• <b>73% of legacy ERP projects</b> fail or exceed budget.<br/>"
                "• <b>$15,000–$50,000</b> in mandatory implementation partner fees ($150–$200/hr consultants).<br/>"
                "• <b>3 to 6 months</b> of complex setup before going live.<br/>"
                "• <b>The Upgrade Trap:</b> Odoo Community strips dynamic accounting; custom Python/XML modules break on every version upgrade.",
                card_body
            ),
            Paragraph(
                "Traditional software was built for data entry clerks, not fast-moving founders:<br/><br/>"
                "• <b>Empty CRM Tax:</b> Salesforce and HubSpot charge up to $300/seat for an empty database with zero leads included.<br/>"
                "• <b>Menu Fatigue:</b> Creating an invoice or checking warehouse stock requires 12+ clicks across nested menus.<br/>"
                "• <b>Zero Autonomous Execution:</b> Legacy ERPs passively record the past instead of actively driving new revenue.",
                card_body
            )
        ]
    ]
    t_prob = Table(prob_cards, colWidths=[235, 240, 235])
    t_prob.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#111C33')),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#0F172A')),
        ('GRID', (0,0), (-1,-1), 0.75, colors.HexColor('#1E293B')),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_prob)
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "<b>The Market Gap:</b> Businesses do not want 10 separate SaaS bills or a $25,000 Odoo consultant. They want an <b>instant, self-configuring AI Operating System</b> that runs finances, inventory, POS, and customer acquisition out of the box.",
        quote_box
    ))
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 3: The Solution — BERAXIS AI
    # =========================================================================
    story.append(Spacer(1, 12))
    story.append(Paragraph("The Solution: BERAXIS AI — Autonomous Business OS in 30 Seconds", title_style))
    story.append(Paragraph("One unified cloud platform replacing Odoo, HubSpot, QuickBooks, Square, and Apollo with native Dual-Brain AI", subtitle_style))

    dash_img = os.path.join(DECK_ASSETS, "dashboard_hero.jpg")
    col_dash_img = []
    if os.path.exists(dash_img):
        col_dash_img.append(RLImage(dash_img, width=420, height=230))

    col_sol_text = [
        Paragraph("<b>4 Core Technological Breakthroughs:</b>", card_title_cyan),
        Spacer(1, 4),
        Paragraph(
            "<b>1. 30-Second Industry Blueprints (Zero Consultants):</b><br/>"
            "Select from 12 global industry archetypes. BERAXIS AI auto-configures your Chart of Accounts, tax rules, POS layouts, and role permissions in 1 click.<br/><br/>"
            "<b>2. 3.1-Second AI Receipt & Invoice OCR:</b><br/>"
            "Drop any supplier PDF or paper receipt into the workspace; AI extracts line items, tax codes, and posts balanced double-entry journal entries automatically.<br/><br/>"
            "<b>3. Streaming Duplex AI Voice Pilot:</b><br/>"
            "Speak naturally to run operations: <i>'Draft an invoice for Acme Corp for $1,500'</i> or <i>'Show today's register P&L'</i>.<br/><br/>"
            "<b>4. 25,000,000+ Built-In B2B Leads Engine:</b><br/>"
            "Pre-loaded global corporate directory with verified emails, direct dials, and 94.2% AI win-probability scoring.",
            card_body
        )
    ]
    t_sol = Table([[col_sol_text, col_dash_img]], colWidths=[280, 430])
    t_sol.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_sol)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 4: Live Traction & The 100+ Users Milestone
    # =========================================================================
    story.append(Spacer(1, 12))
    story.append(Paragraph("Live Traction & Validation: 100+ Active Users Milestone Achieved", title_style))
    story.append(Paragraph("Explosive early adoption, verified organic search momentum, and enterprise-grade production readiness", subtitle_style))

    traction_pills = [
        [
            Paragraph("<font size='16' color='#34D399'><b>100+ Users</b></font><br/><font size='7.5' color='#94A3B8'>Active Early-Adopter Workspaces</font>", ParagraphStyle('TP1', alignment=1)),
            Paragraph("<font size='16' color='#38BDF8'><b>$0 CAC</b></font><br/><font size='7.5' color='#94A3B8'>100% Organic Growth To Date</font>", ParagraphStyle('TP2', alignment=1)),
            Paragraph("<font size='16' color='#C084FC'><b>307 Routes</b></font><br/><font size='7.5' color='#94A3B8'>Live Pre-Rendered Production Pages</font>", ParagraphStyle('TP3', alignment=1)),
            Paragraph("<font size='16' color='#FBBF24'><b>428+ / Wk</b></font><br/><font size='7.5' color='#94A3B8'>Google Search Impressions (+3,000%)</font>", ParagraphStyle('TP4', alignment=1)),
        ]
    ]
    t_tpills = Table(traction_pills, colWidths=[178, 178, 178, 178])
    t_tpills.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#111C33')),
        ('GRID', (0,0), (-1,-1), 0.75, colors.HexColor('#1E293B')),
        ('TOPPADDING', (0,0), (-1,-1), 9),
        ('BOTTOMPADDING', (0,0), (-1,-1), 9),
    ]))
    story.append(t_tpills)
    story.append(Spacer(1, 10))

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
                "• Ranking for high-intent commercial queries: <i>'Odoo alternative'</i>, <i>'affordable cloud ERP options with monthly subscription pricing'</i> (+3,000% spike), and <i>'CRM for padel club'</i>.",
                card_body
            ),
            Paragraph(
                "• <b>Global Merchant of Record (MoR):</b> Live checkout integrated via Creem, Paddle, Stripe, DirectPay, and 30+ Cryptocurrencies.<br/>"
                "• <b>Dual-Presence Operations:</b> US Office in Miami, FL + dedicated R&D and Operations Center in Islamabad.<br/>"
                "• <b>99.9% Uptime SLA:</b> Multi-tenant PostgreSQL with strict Row-Level Security (RLS) and 256-bit encryption.",
                card_body
            )
        ]
    ]
    t_tdet = Table(traction_details, colWidths=[235, 240, 235])
    t_tdet.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#0B1120')),
        ('GRID', (0,0), (-1,-1), 0.75, colors.HexColor('#1E293B')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 9),
        ('RIGHTPADDING', (0,0), (-1,-1), 9),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_tdet)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 5: Product Scope — 28 Enterprise Modules & 12 Industry Archetypes
    # =========================================================================
    story.append(Spacer(1, 12))
    story.append(Paragraph("Unmatched Product Depth: 28 Unified Apps & 12 Industry Blueprints", title_style))
    story.append(Paragraph("Built from the ground up on a single unified schema — zero third-party plugin dependencies", subtitle_style))

    scope_table = [
        [
            Paragraph("<b>Financial & Accounting Core</b>", card_title_cyan),
            Paragraph("<b>CRM, POS & Revenue Engine</b>", card_title_green),
            Paragraph("<b>Supply Chain, MRP & HR</b>", card_title_purple),
            Paragraph("<b>12 Turnkey Industry Archetypes</b>", card_title_amber)
        ],
        [
            Paragraph(
                "• GAAP/IFRS Double-Entry Ledger<br/>"
                "• Automated Trial Balance & P&L<br/>"
                "• Real-Time Balance Sheets<br/>"
                "• 3.1s AI Receipt & Bill OCR<br/>"
                "• Multi-Currency & Tax Engine<br/>"
                "• Invoicing & Recurring Billing<br/>"
                "• Multi-Company Consolidation",
                card_body
            ),
            Paragraph(
                "• Visual Kanban Deal Pipeline<br/>"
                "• 25M+ Verified B2B Leads Pool<br/>"
                "• 94.2% AI Win-Probability Score<br/>"
                "• Omnichannel Touch POS<br/>"
                "• Barcode & Split-Bill Checkout<br/>"
                "• E-Commerce Storefront<br/>"
                "• Native Cold Email & AI Calling",
                card_body
            ),
            Paragraph(
                "• Multi-Warehouse Inventory<br/>"
                "• Batch, Lot & Serial Tracking<br/>"
                "• Discrete Manufacturing (MRP)<br/>"
                "• Bill of Materials (BOM)<br/>"
                "• Purchase Orders & Vendor RFQs<br/>"
                "• HRMS, Attendance & Payroll<br/>"
                "• Project WBS, E-Sign & Helpdesk",
                card_body
            ),
            Paragraph(
                "1. Padel & Sports Clubs<br/>"
                "2. Dental & Medical Clinics (EMR)<br/>"
                "3. Bakeries & Restaurants (KDS)<br/>"
                "4. Automotive Repair Garages<br/>"
                "5. Real Estate & Lease Mgmt<br/>"
                "6. Retail & Supermarkets<br/>"
                "7. Construction & Contracting<br/>"
                "8. Schools & Academies<br/>"
                "9. NGOs & Grant Tracking<br/>"
                "10. Discrete Manufacturing<br/>"
                "11. Logistics & Wholesale<br/>"
                "12. Professional Services",
                card_body
            )
        ]
    ]
    t_scope = Table(scope_table, colWidths=[175, 178, 178, 180])
    t_scope.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#111C33')),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#0F172A')),
        ('GRID', (0,0), (-1,-1), 0.75, colors.HexColor('#1E293B')),
        ('TOPPADDING', (0,0), (-1,-1), 9),
        ('BOTTOMPADDING', (0,0), (-1,-1), 9),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_scope)
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "<b>Competitive Moat:</b> Replicating BERAXIS AI's 28-module unified architecture, 12 industry engines, and Dual-Brain AI Copilot would require 24+ months and $4M+ in engineering R&D for any new entrant.",
        quote_box
    ))
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 6: Market Opportunity ($62B -> $136B)
    # =========================================================================
    story.append(Spacer(1, 12))
    story.append(Paragraph("Massive Market Opportunity: $62B → $136B Global Wave", title_style))
    story.append(Paragraph("Enterprise ERP is moving downmarket to 30M+ SMBs demanding AI automation over expensive consulting delays", subtitle_style))

    chart_tam = os.path.join(DECK_ASSETS, "chart_market_tam.png")
    col_chart_tam = []
    if os.path.exists(chart_tam):
        col_chart_tam.append(RLImage(chart_tam, width=425, height=230))

    col_text_tam = [
        Paragraph("<b>TAM / SAM / SOM Breakdown:</b>", card_title_cyan),
        Spacer(1, 4),
        Paragraph(
            "• <b>$136B Global TAM (13.8% CAGR):</b> Global Cloud ERP & CRM software market expanding rapidly through 2030.<br/><br/>"
            "• <b>$34.8B Serviceable Market (SAM):</b> 30M+ SMBs across North America, Europe, UK, MENA, and APAC actively replacing spreadsheets and legacy ERPs.<br/><br/>"
            "• <b>$98M+ Serviceable Obtainable Market (SOM):</b> Capturing just 1.2% of SMBs switching from Odoo, HubSpot, and QuickBooks represents $98M+ in high-margin recurring revenue.",
            card_body
        )
    ]
    t_tam = Table([[col_text_tam, col_chart_tam]], colWidths=[280, 430])
    t_tam.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_tam)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 7: Competitive Landscape
    # =========================================================================
    story.append(Spacer(1, 12))
    story.append(Paragraph("Competitive Disruption: BERAXIS AI vs. Legacy Giants", title_style))
    story.append(Paragraph("The only platform combining full GAAP ERP, 25M+ B2B Leads, and Duplex Voice AI at 1/20th the TCO", subtitle_style))

    chart_comp = os.path.join(DECK_ASSETS, "chart_competitor_comparison.png")
    col_chart_comp = []
    if os.path.exists(chart_comp):
        col_chart_comp.append(RLImage(chart_comp, width=425, height=230))

    col_text_comp = [
        Paragraph("<b>Why BERAXIS AI Wins Head-to-Head:</b>", card_title_purple),
        Spacer(1, 4),
        Paragraph(
            "• <b>vs. Odoo ERP:</b> Odoo requires 90 days & $15,000+ in consultants, and strips accounting from Community. BERAXIS AI activates in 30 seconds with full accounting and zero consultant fees.<br/><br/>"
            "• <b>vs. HubSpot & Salesforce:</b> They charge $300–$800/mo for CRM alone with zero accounting, POS, or inventory. BERAXIS AI includes CRM + 25M leads + full ERP.<br/><br/>"
            "• <b>vs. QuickBooks Online:</b> QuickBooks charges $85–$200/mo for basic bookkeeping with no CRM, no B2B leads, and expensive POS addons.",
            card_body
        )
    ]
    t_comp = Table([[col_text_comp, col_chart_comp]], colWidths=[280, 430])
    t_comp.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_comp)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 8: Business Model & Disruptive PLG Pricing Wedge
    # =========================================================================
    story.append(Spacer(1, 12))
    story.append(Paragraph("Business Model: Product-Led Wedge → High-ARPU Enterprise Expansion", title_style))
    story.append(Paragraph("Frictionless entry eliminates buyer resistance while usage-based AI & multi-seat scaling drive 132% NRR", subtitle_style))

    pricing_tiers = [
        [
            Paragraph("<b>Tier 1: Forever Free (PQL Wedge)</b>", card_title_green),
            Paragraph("<b>Tier 2: Standard Suite ($1 Launch → $31.10/mo)</b>", card_title_cyan),
            Paragraph("<b>Tier 3: Custom Pro & Usage ($46.80/mo + Usage)</b>", card_title_purple)
        ],
        [
            Paragraph(
                "<b>Price:</b> $0 Forever (No Credit Card)<br/><br/>"
                "• Pick <b>any 1 full ERP module</b> (CRM, POS, or Accounting) free forever.<br/>"
                "• Unlimited records & transactions.<br/>"
                "• 50 Starter B2B Lead Previews.<br/><br/>"
                "<b>Strategic Role:</b> Viral top-of-funnel customer acquisition hook that converts 65%+ of visitors into active workspaces.",
                card_body
            ),
            Paragraph(
                "<b>Price:</b> $1/mo Early Bird ($12/yr) | $31.10/mo Regular<br/><br/>"
                "• Unlocks <b>all 28 enterprise modules</b>.<br/>"
                "• <b>1,500 verified B2B lead credits/mo</b>.<br/>"
                "• 3.1s AI Receipt OCR & Voice Pilot.<br/>"
                "• 12 Industry Blueprints.<br/><br/>"
                "<b>Strategic Role:</b> Irresistible land-and-expand offer that undercuts Odoo & QuickBooks by 90%+.",
                card_body
            ),
            Paragraph(
                "<b>Price:</b> $15.99 Early Bird | $46.80/mo + Consumption<br/><br/>"
                "• Multi-company & multi-branch consolidation.<br/>"
                "• Custom white-label branding.<br/>"
                "• Native Cold Email & AI Voice Calling engine.<br/>"
                "• Usage expansion: AI calling minutes ($0.12/min), extra OCR & B2B lead packs (+$185/mo avg ARPU expansion).",
                card_body
            )
        ]
    ]
    t_price = Table(pricing_tiers, colWidths=[235, 240, 235])
    t_price.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#111C33')),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#0F172A')),
        ('GRID', (0,0), (-1,-1), 0.75, colors.HexColor('#1E293B')),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_price)
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "<b>The Land-and-Expand Economics:</b> Customers enter via the Free or $1 Early Bird wedge. Once their accounting ledger, inventory, and POS run on BERAXIS AI, switching costs become high, and multi-seat + AI usage upgrades scale blended ARPU to <b>$200+/month</b>.",
        quote_box
    ))
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 9: Unit Economics
    # =========================================================================
    story.append(Spacer(1, 12))
    story.append(Paragraph("World-Class Unit Economics: 26.6x LTV:CAC & 84% Gross Margin", title_style))
    story.append(Paragraph("Serverless edge architecture and programmatic organic distribution yield best-in-class capital efficiency", subtitle_style))

    chart_unit = os.path.join(DECK_ASSETS, "chart_unit_economics.png")
    col_chart_unit = []
    if os.path.exists(chart_unit):
        col_chart_unit.append(RLImage(chart_unit, width=425, height=230))

    col_text_unit = [
        Paragraph("<b>Institutional SaaS Metrics:</b>", card_title_green),
        Spacer(1, 4),
        Paragraph(
            "• <b>Blended CAC ($180):</b> Driven by 307 programmatic SEO pages, viral 1-App Free tier, and 30% partner referral loops.<br/><br/>"
            "• <b>Customer LTV ($4,800):</b> System-of-record stickiness across accounting + inventory + POS yields <2.5% monthly churn.<br/><br/>"
            "• <b>84% SaaS Gross Margin:</b> Next.js 15 + FastAPI + multi-tenant Supabase RLS keeps infrastructure + AI inference costs ultra-lean.<br/><br/>"
            "• <b>1.1-Month CAC Payback & 132% NRR:</b> Rapid capital recycling.",
            card_body
        )
    ]
    t_unit = Table([[col_text_unit, col_chart_unit]], colWidths=[280, 430])
    t_unit.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_unit)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 10: Go-To-Market (GTM) — 4 Scalable Global Distribution Engines
    # =========================================================================
    story.append(Spacer(1, 12))
    story.append(Paragraph("Go-To-Market Strategy: 4 Scalable Global Distribution Engines", title_style))
    story.append(Paragraph("Repeatable, low-CAC acquisition channels scaling from 100+ users to 10,000+ global businesses", subtitle_style))

    gtm_cards = [
        [
            Paragraph("<b>1. Programmatic SEO Engine</b>", card_title_cyan),
            Paragraph("<b>2. Agency & CPA Partner Portal</b>", card_title_purple),
            Paragraph("<b>3. 24-Hr White-Glove Migration</b>", card_title_green),
            Paragraph("<b>4. Autonomous AI Dogfooding</b>", card_title_amber)
        ],
        [
            Paragraph(
                "• <b>307 Static SEO Pages</b> targeting high-intent buyer keywords (<i>'Odoo Alternative'</i>, <i>'$1 Cloud ERP'</i>, <i>'Padel Club CRM'</i>).<br/>"
                "• Already generating <b>428+ weekly Google impressions</b> and compounding organically every week.",
                card_body
            ),
            Paragraph(
                "• Live <b>30% Recurring Revenue Share</b> affiliate portal (<i>/affiliates</i>).<br/>"
                "• Bookkeepers, CPAs, and IT agencies onboard 10–50 SMB clients at once to replace expensive QuickBooks/Odoo setups.",
                card_body
            ),
            Paragraph(
                "• Eliminates the #1 ERP switching barrier.<br/>"
                "• AI schema mapper + engineering concierge migrates messy Odoo, QuickBooks, or Excel sheets in <b>under 24 hours for free</b>.",
                card_body
            ),
            Paragraph(
                "• We use BERAXIS AI's own <b>25M+ B2B Lead Directory</b>, Cold Email Engine, and AI Voice Calling agents to prospect 10,000+ SMBs/month at near-zero marginal cost.",
                card_body
            )
        ]
    ]
    t_gtm = Table(gtm_cards, colWidths=[178, 178, 178, 178])
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
    story.append(t_gtm)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 11: 5-Year Financial Forecast ($835K -> $62M ARR)
    # =========================================================================
    story.append(Spacer(1, 12))
    story.append(Paragraph("5-Year Financial Forecast: Pathway from 100+ Users to $62M ARR", title_style))
    story.append(Paragraph("Clear, milestone-driven scaling trajectory across North America, Europe, UK, and MENA", subtitle_style))

    chart_arr = os.path.join(DECK_ASSETS, "chart_arr_growth.png")
    col_chart_arr = []
    if os.path.exists(chart_arr):
        col_chart_arr.append(RLImage(chart_arr, width=425, height=230))

    col_text_arr = [
        Paragraph("<b>5-Year ARR & Account Projection:</b>", card_title_cyan),
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
    t_arr = Table([[col_text_arr, col_chart_arr]], colWidths=[280, 430])
    t_arr.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_arr)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 12: Capital Allocation, Leadership & Investment Close
    # =========================================================================
    story.append(Spacer(1, 12))
    story.append(Paragraph("The Investment Opportunity: Scaling Category Leadership", title_style))
    story.append(Paragraph("Deploying strategic growth capital to accelerate global distribution, AI autonomy, and channel partnerships", subtitle_style))

    alloc_data = [
        [Paragraph("<b>Use of Funds Category</b>", card_title_cyan), Paragraph("<b>Allocation</b>", card_title_green), Paragraph("<b>Execution Milestones & Expected ROI</b>", card_title_cyan)],
        [
            Paragraph("<b>1. Autonomous AI & Product R&D</b>", card_body),
            Paragraph("<b>40%</b>", card_body),
            Paragraph("Sub-second Duplex Voice Pilot v2, autonomous bookkeeping agents, mobile native apps, and 50+ global banking/tax integrations.", card_body)
        ],
        [
            Paragraph("<b>2. Global GTM & Outbound Engine</b>", card_body),
            Paragraph("<b>35%</b>", card_body),
            Paragraph("Scale performance acquisition, AI outbound calling fleets, and high-intent search capture across US, UK, Europe, and MENA.", card_body)
        ],
        [
            Paragraph("<b>3. Channel Partner Ecosystem</b>", card_body),
            Paragraph("<b>15%</b>", card_body),
            Paragraph("Onboard 250+ CPA firms, bookkeepers, and ERP migration agencies on our 30% recurring partner program to drive bulk SMB migrations.", card_body)
        ],
        [
            Paragraph("<b>4. Enterprise Security & Concierge</b>", card_body),
            Paragraph("<b>10%</b>", card_body),
            Paragraph("SOC-2 Type II certification, ISO-27001 compliance, and 24/7 white-glove data migration engineers.", card_body)
        ]
    ]
    t_alloc = Table(alloc_data, colWidths=[175, 85, 450])
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
    story.append(t_alloc)
    story.append(Spacer(1, 14))

    final_cta = [
        [
            Paragraph(
                "<font size='13' color='#F8FAFC'><b>Partner With BERAXIS AI — The Future of Autonomous Enterprise Operations</b></font><br/>"
                "<font size='9' color='#34D399'><b>✓ 100+ Active Users Milestone Achieved &nbsp;&nbsp;|&nbsp;&nbsp; ✓ 28 Live Enterprise Modules &nbsp;&nbsp;|&nbsp;&nbsp; ✓ 26.6x LTV:CAC</b></font><br/><br/>"
                "<font size='9.5' color='#38BDF8'><b>🌐 Live Platform:</b> https://www.beraxis.online</font> &nbsp;&nbsp;•&nbsp;&nbsp; "
                "<font size='9.5' color='#C084FC'><b>📧 Investor Relations:</b> support@beraxis.online</font> &nbsp;&nbsp;•&nbsp;&nbsp; "
                "<font size='9.5' color='#FBBF24'><b>📞 Direct / WhatsApp:</b> +1 (970) 780-7993</font>",
                ParagraphStyle('FCTA', alignment=1, leading=14)
            )
        ]
    ]
    t_fcta = Table(final_cta, colWidths=[710])
    t_fcta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0F172A')),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor('#38BDF8')),
        ('TOPPADDING', (0,0), (-1,-1), 11),
        ('BOTTOMPADDING', (0,0), (-1,-1), 11),
    ]))
    story.append(t_fcta)

    doc.build(story)

    # Copy to all public destinations so links work everywhere
    for target in [
        os.path.join(BASE_DIR, "Beraxis_Growth_and_Financial_Pitch_Deck.pdf"),
        os.path.join(PUBLIC_DIR, "Beraxis_Investor_Pitch_Deck.pdf"),
        os.path.join(PUBLIC_DIR, "Beraxis_Growth_and_Financial_Pitch_Deck.pdf"),
        os.path.join(FRONTEND_PUBLIC_DIR, "Beraxis_Investor_Pitch_Deck.pdf"),
        os.path.join(FRONTEND_PUBLIC_DIR, "Beraxis_Growth_and_Financial_Pitch_Deck.pdf"),
    ]:
        shutil.copy2(pdf_path, target)
    print(f"Successfully generated 12-slide International Investor Pitch Deck PDF: {pdf_path}")

if __name__ == "__main__":
    generate_international_investor_deck()
