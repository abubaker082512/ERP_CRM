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
SCREENSHOT_DIR = os.path.join(BASE_DIR, "scratch")

class BaseDeckCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []
        self.deck_title = "Next-Gen AI ERP & CRM"
        self.deck_subtitle = "Presentation"

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
            return  # Skip cover slide
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#475569"))
        
        # Top banner accent line
        self.setStrokeColor(colors.HexColor("#2563eb"))
        self.setLineWidth(2)
        self.line(36, 575, landscape(letter)[0] - 36, 575)
        
        # Top running header
        self.drawString(36, 582, self.deck_title.upper())
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#94a3b8"))
        self.drawRightString(landscape(letter)[0] - 36, 582, self.deck_subtitle)

        # Bottom footer
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawString(36, 18, "Next-Gen AI ERP & CRM Platform • Confidential & Proprietary")
        self.drawRightString(landscape(letter)[0] - 36, 18, f"Slide {self._pageNumber} of {page_count}")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(36, 28, landscape(letter)[0] - 36, 28)
        self.restoreState()


class InternalSalesDeckCanvas(BaseDeckCanvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.deck_title = "Internal Sales Playbook & Enablement Deck"
        self.deck_subtitle = "Strategy • Battlecards • Pitch Scripts • Closing Playbook"


class ClientPitchDeckCanvas(BaseDeckCanvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.deck_title = "Next-Gen AI ERP & CRM Platform"
        self.deck_subtitle = "Client Product Overview • Live Capabilities • Business ROI"


def get_common_styles():
    styles = getSampleStyleSheet()
    
    slide_title = ParagraphStyle(
        'DeckSlideTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=2
    )
    slide_subtitle = ParagraphStyle(
        'DeckSlideSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#475569'),
        spaceAfter=10
    )
    card_title = ParagraphStyle(
        'DeckCardTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13.5,
        textColor=colors.HexColor('#1e3a8a')
    )
    card_body = ParagraphStyle(
        'DeckCardBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=colors.HexColor('#334155')
    )
    badge_style = ParagraphStyle(
        'DeckBadge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#1d4ed8')
    )
    quote_style = ParagraphStyle(
        'DeckQuote',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11.5,
        textColor=colors.HexColor('#1e293b'),
        backColor=colors.HexColor('#f8fafc'),
        borderColor=colors.HexColor('#cbd5e1'),
        borderWidth=0.5,
        borderPadding=6
    )
    
    return {
        'slide_title': slide_title,
        'slide_subtitle': slide_subtitle,
        'card_title': card_title,
        'card_body': card_body,
        'badge_style': badge_style,
        'quote_style': quote_style,
    }


# ==============================================================================
# DECK 1: INTERNAL SALES TEAM ENABLEMENT & STRATEGY DECK
# ==============================================================================
def build_sales_team_deck():
    pdf_path = os.path.join(BASE_DIR, "Sales_Team_Internal_Enablement_Deck.pdf")
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=landscape(letter),
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    s = get_common_styles()
    story = []

    # Slide 1: Cover
    story.append(Spacer(1, 40))
    logo_path = os.path.join(BASE_DIR, "Logo.png")
    if os.path.exists(logo_path):
        story.append(RLImage(logo_path, width=150, height=94))
    story.append(Spacer(1, 15))
    story.append(Paragraph("SALES TEAM ENABLEMENT & REVENUE PLAYBOOK", ParagraphStyle('CoverT', fontName='Helvetica-Bold', fontSize=24, leading=28, textColor=colors.HexColor('#0f172a'))))
    story.append(Spacer(1, 4))
    story.append(Paragraph("Target Personas • Competitive Battlecards • Pitch Frameworks • Objection Handling • Outbound Growth Engine", ParagraphStyle('CoverSub', fontName='Helvetica', fontSize=12, leading=16, textColor=colors.HexColor('#2563eb'))))
    story.append(Spacer(1, 15))
    story.append(Paragraph("INTERNAL USE ONLY — Proprietary Sales Strategy & 30-Day Closing Playbook", ParagraphStyle('CoverFoot', fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=colors.HexColor('#64748b'))))
    story.append(PageBreak())

    # Slide 2: Ideal Customer Profiles (ICP) & Persona Mapping
    story.append(Paragraph("1. Target Customer Personas & Buying Triggers", s['slide_title']))
    story.append(Paragraph("Who we sell to, what keeps them awake at night, and what triggers an immediate switch", s['slide_subtitle']))
    
    icp_table_data = [
        [Paragraph("<b>Target Segment</b>", s['card_title']), Paragraph("<b>Key Pain Point / Status Quo</b>", s['card_title']), Paragraph("<b>Winning Sales Angle</b>", s['card_title']), Paragraph("<b>Primary Decision Maker</b>", s['card_title'])],
        [
            Paragraph("<b>Growing SMBs (10–100 Staff)</b>", s['card_body']),
            Paragraph("Drowning in 5+ disconnected tools (Excel, Trello, QuickBooks, HubSpot). High monthly SaaS bloat.", s['card_body']),
            Paragraph("<b>Unified All-in-One:</b> Replace 4 subscriptions with 1 platform. Cut software bill by 60%.", s['card_body']),
            Paragraph("CEO / Managing Director / Founder", s['card_body'])
        ],
        [
            Paragraph("<b>Wholesale, Distribution & Retail</b>", s['card_body']),
            Paragraph("Stockouts, messy manual reorders, lost inventory tracking, delayed customer invoicing.", s['card_body']),
            Paragraph("<b>AI Demand Forecasting:</b> Automated reorder points and instant barcode/SKU tracking.", s['card_body']),
            Paragraph("Operations Manager / Warehouse Head", s['card_body'])
        ],
        [
            Paragraph("<b>B2B Services & Agencies</b>", s['card_body']),
            Paragraph("Lost leads in messy inboxes, slow proposal generation, manual payment chasing.", s['card_body']),
            Paragraph("<b>AI CRM & Automated Billing:</b> AI scores hot leads and auto-sends recurring invoices.", s['card_body']),
            Paragraph("Head of Sales / VP Revenue", s['card_body'])
        ],
        [
            Paragraph("<b>Accounting & Bookkeeping Firms</b>", s['card_body']),
            Paragraph("Manual data entry of client receipts and chasing missing invoices every month-end.", s['card_body']),
            Paragraph("<b>OCR Auto-Scan + Partner Portal:</b> Multi-client accounting dashboard + 20% recurring revenue share.", s['card_body']),
            Paragraph("Managing Partner / Senior Accountant", s['card_body'])
        ]
    ]
    t_icp = Table(icp_table_data, colWidths=[140, 210, 240, 130])
    t_icp.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_icp)
    story.append(PageBreak())

    # Slide 3: Competitive Battlecards (vs Odoo, Zoho, SAP, Excel)
    story.append(Paragraph("2. Competitive Battlecards: How to Win Every Deal", s['slide_title']))
    story.append(Paragraph("Direct comparison matrix and tactical kill-points against incumbent competitors", s['slide_subtitle']))

    battle_data = [
        [Paragraph("<b>Competitor</b>", s['card_title']), Paragraph("<b>Their Weakness (Where they fail)</b>", s['card_title']), Paragraph("<b>Our Advantage (How we win)</b>", s['card_title']), Paragraph("<b>Kill Shot Sales Question</b>", s['card_title'])],
        [
            Paragraph("<b>Odoo</b>", s['card_body']),
            Paragraph("• Requires expensive certified consultants.<br/>• 3–6 month implementation delay.<br/>• Paid app store add-on fees add up fast.", s['card_body']),
            Paragraph("• <b>15-Minute Live Setup:</b> 1-click import.<br/>• <b>Native AI layer:</b> Built-in OCR & lead scoring.<br/>• <b>Free White-Glove Migration</b> by our team.", s['card_body']),
            Paragraph("<i>\"How much did your last Odoo consultant quote you just for initial configuration and data migration?\"</i>", s['card_body'])
        ],
        [
            Paragraph("<b>Zoho One</b>", s['card_body']),
            Paragraph("• Fragmented experience (40+ separate apps stitched together).<br/>• Slow sync and bloated user interface.", s['card_body']),
            Paragraph("• <b>Single Unified Core:</b> Single Next.js database.<br/>• No sync delays between CRM, Books & Stock.<br/>• Modern, intuitive UI.", s['card_body']),
            Paragraph("<i>\"How many times has Zoho's CRM failed to sync real-time stock balances with Zoho Books?\"</i>", s['card_body'])
        ],
        [
            Paragraph("<b>Excel / Sheets</b>", s['card_body']),
            Paragraph("• High human error & broken formulas.<br/>• Zero audit trail, security risks.<br/>• 10+ hours wasted on manual data entry.", s['card_body']),
            Paragraph("• <b>Automated OCR:</b> Drop bills & auto-log ledger.<br/>• Role-based permissions & audit history.<br/>• Real-time multi-user collaboration.", s['card_body']),
            Paragraph("<i>\"How many hours a week does your team spend re-typing numbers from supplier PDFs into Excel?\"</i>", s['card_body'])
        ]
    ]
    t_battle = Table(battle_data, colWidths=[90, 210, 210, 210])
    t_battle.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_battle)
    story.append(PageBreak())

    # Slide 4: 5-Step Demo & Pitch Framework
    story.append(Paragraph("3. The 5-Step High-Conversion Pitch Framework", s['slide_title']))
    story.append(Paragraph("Follow this structured 20-minute flow on client discovery and demo calls", s['slide_subtitle']))

    steps_data = [
        [
            Paragraph("<b>Stage 1: Discovery (4 Mins)</b>", s['card_title']),
            Paragraph("<b>Stage 2: The Core Pain (3 Mins)</b>", s['card_title']),
            Paragraph("<b>Stage 3: The AI Magic Demo (8 Mins)</b>", s['card_title']),
            Paragraph("<b>Stage 4: Free Migration Hook (3 Mins)</b>", s['card_title']),
            Paragraph("<b>Stage 5: Close & Trial (2 Mins)</b>", s['card_title'])
        ],
        [
            Paragraph("• What tools do you use today?<br/>• Where are invoices or leads falling through the cracks?<br/>• How many hours spent on spreadsheets?", s['card_body']),
            Paragraph("• Frame the cost of inaction ($3,000+/mo in lost time).<br/>• Show why modular bloat slows down their sales team.", s['card_body']),
            Paragraph("• <b>Drop an invoice PDF:</b> Show 3-sec OCR extraction.<br/>• <b>Show CRM:</b> AI Lead Scoring.<br/>• <b>Show Inventory:</b> Forecast chart.", s['card_body']),
            Paragraph("• Remove switching friction:<br/><i>\"Our engineers will clean and migrate all your customer and stock data for free this week.\"</i>", s['card_body']),
            Paragraph("• Activate 14-day full trial.<br/>• Send self-guided onboarding checklist.<br/>• Schedule Day-3 check-in call.", s['card_body'])
        ]
    ]
    t_steps = Table(steps_data, colWidths=[140, 140, 160, 140, 140])
    t_steps.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#eff6ff')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#bfdbfe')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_steps)
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Key Rule for Sales Reps:</b> Never show raw configuration settings in the first 10 minutes. Lead with the <b>AI OCR Scanner</b> and <b>AI Lead Scoring</b> to deliver immediate visual impact!", s['quote_style']))
    story.append(PageBreak())

    # Slide 5: Selling Future Features — Marketing, Cold Email & AI Cold Calling
    story.append(Paragraph("4. Upsell & Vision: Marketing, Cold Email & AI Cold Calling", s['slide_title']))
    story.append(Paragraph("How to pitch our upcoming native revenue-generation engine to close enterprise accounts today", s['slide_subtitle']))

    upsell_data = [
        [Paragraph("<b>Upcoming Engine</b>", s['card_title']), Paragraph("<b>How It Works & What It Replaces</b>", s['card_title']), Paragraph("<b>How the Sales Team Pitches It Today</b>", s['card_title'])],
        [
            Paragraph("<b>Native Cold Email Engine</b>", s['card_body']),
            Paragraph("• Replaces tools like Lemlist / Instantly ($100–$200/mo).<br/>• Automated mailbox warmup, AI personalization, multi-step sequences.<br/>• Replies instantly create opportunities in the CRM pipeline.", s['card_body']),
            Paragraph("<i>\"Why pay for separate cold email software? Our platform generates leads and auto-pushes interested replies directly into your sales reps' pipeline.\"</i>", s['card_body'])
        ],
        [
            Paragraph("<b>Autonomous AI Cold Calling Agents</b>", s['card_body']),
            Paragraph("• AI voice agents that call new leads within 60 seconds of form submission.<br/>• Qualifies budget, authority, need, and books meetings on calendar.<br/>• Transcribes conversation and attaches sentiment report to lead card.", s['card_body']),
            Paragraph("<i>\"Your reps will never have to dial unqualified cold numbers again. Our AI agent dials, qualifies, and books meetings directly into your sales calendar.\"</i>", s['card_body'])
        ],
        [
            Paragraph("<b>Hybrid Dedicated SDR Option</b>", s['card_body']),
            Paragraph("• For enterprise clients requiring human callers.<br/>• Managed SDR support agents operated on top of our AI platform for a minimal fee.", s['card_body']),
            Paragraph("<i>\"We offer a complete turnkey pipeline solution: software + trained human/AI SDR dialing for a fraction of agency cost.\"</i>", s['card_body'])
        ]
    ]
    t_upsell = Table(upsell_data, colWidths=[150, 280, 290])
    t_upsell.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_upsell)
    story.append(PageBreak())

    # Slide 6: Objection Handling & Closing Tactics
    story.append(Paragraph("5. Tactical Objection Handling Masterclass", s['slide_title']))
    story.append(Paragraph("Memorize these exact responses to overcome the top 4 buyer hesitations", s['slide_subtitle']))

    obj_cards = [
        [
            Paragraph("<b>1. 'We don't have time to switch software right now.'</b>", s['card_title']),
            Paragraph("<b>2. 'Why not just stick with QuickBooks or Excel?'</b>", s['card_title'])
        ],
        [
            Paragraph("<b>Response:</b> <i>\"I completely understand. That's why we don't ask you to do the heavy lifting. Our migration team takes your existing spreadsheet or export, maps it, and loads your workspace in 24 hours. You don't have to pause operations for a single day.\"</i>", s['card_body']),
            Paragraph("<b>Response:</b> <i>\"QuickBooks is great for basic accounting, but it doesn't score your sales leads, automate warehouse reorders, or scan invoices with AI. With us, you get full CRM, Inventory, and Accounting in one place for less than you pay today.\"</i>", s['card_body'])
        ],
        [
            Paragraph("<b>3. 'Is our data secure and GDPR compliant?'</b>", s['card_title']),
            Paragraph("<b>4. 'What happens if we need help after signing up?'</b>", s['card_title'])
        ],
        [
            Paragraph("<b>Response:</b> <i>\"Yes. We use enterprise-grade PostgreSQL with isolated tenant security, SSL encryption in transit and at rest, and strict role-based access control so your staff only sees what you permit.\"</i>", s['card_body']),
            Paragraph("<b>Response:</b> <i>\"You get a dedicated WhatsApp / Slack direct line with our engineering team, live chat support, and free onboarding assistance for every department head.\"</i>", s['card_body'])
        ]
    ]
    t_obj = Table(obj_cards, colWidths=[360, 360])
    t_obj.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#f8fafc')),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor('#f8fafc')),
        ('BACKGROUND', (0,2), (0,2), colors.HexColor('#f8fafc')),
        ('BACKGROUND', (1,2), (1,2), colors.HexColor('#f8fafc')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_obj)

    doc.build(story, canvasmaker=InternalSalesDeckCanvas)
    print(f"Sales Team Enablement Deck built: {pdf_path}")


# ==============================================================================
# DECK 2: CLIENT-FACING PRESENTATION & PRODUCT DEMO DECK
# ==============================================================================
def build_client_pitch_deck():
    pdf_path = os.path.join(BASE_DIR, "Client_Executive_Pitch_and_Demo_Deck.pdf")
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=landscape(letter),
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    s = get_common_styles()
    story = []

    # Slide 1: Cover Slide
    story.append(Spacer(1, 40))
    logo_path = os.path.join(BASE_DIR, "Logo.png")
    if os.path.exists(logo_path):
        story.append(RLImage(logo_path, width=150, height=94))
    story.append(Spacer(1, 15))
    story.append(Paragraph("NEXT-GEN AI ERP & CRM PLATFORM", ParagraphStyle('CoverT', fontName='Helvetica-Bold', fontSize=26, leading=30, textColor=colors.HexColor('#0f172a'))))
    story.append(Spacer(1, 4))
    story.append(Paragraph("The All-In-One Intelligent Operating System for Growing Enterprises", ParagraphStyle('CoverSub', fontName='Helvetica', fontSize=13, leading=17, textColor=colors.HexColor('#2563eb'))))
    story.append(Spacer(1, 15))
    story.append(Paragraph("Unified CRM • Automated Accounting & OCR • Predictive Inventory • HRMS • Native Growth Suite", ParagraphStyle('CoverFoot', fontName='Helvetica', fontSize=9.5, leading=13.5, textColor=colors.HexColor('#64748b'))))
    story.append(PageBreak())

    # Slide 2: Why Modern Businesses Are Upgrading
    story.append(Paragraph("Why Traditional Software is Slowing Your Business Down", s['slide_title']))
    story.append(Paragraph("Eliminate the hidden costs of disconnected spreadsheets and legacy ERP systems", s['slide_subtitle']))

    pains_data = [
        [
            Paragraph("<b>The Old Way: Fragmented & Slow</b>", s['card_title']),
            Paragraph("<b>The Next-Gen Way: Unified & Autonomous</b>", s['card_title'])
        ],
        [
            Paragraph("❌ <b>Multiple Disconnected Subscriptions:</b> Paying for CRM, Invoicing, Inventory, and Payroll separately.<br/>"
                      "❌ <b>Hours of Manual Data Re-Entry:</b> Manually typing supplier bills, invoices, and stock counts.<br/>"
                      "❌ <b>Delayed Decision Making:</b> Waiting days for accountants or ops teams to compile monthly reports.<br/>"
                      "❌ <b>Costly 6-Month Implementations:</b> Legacy ERPs (Odoo, SAP) demand huge consulting fees.<br/>"
                      "❌ <b>Lost Sales Opportunities:</b> Leads slip through cracks without automated scoring or follow-up.", s['card_body']),
            Paragraph("✅ <b>100% Unified Business Core:</b> Sales, Finance, Warehouse, and HR live in one synchronized platform.<br/>"
                      "✅ <b>Instant AI OCR Ingestion:</b> Drop receipt/bill PDFs and auto-create ledger entries in 3 seconds.<br/>"
                      "✅ <b>Live Real-Time Insights:</b> Instant cash flow, revenue tracking, and inventory health metrics.<br/>"
                      "✅ <b>Live in 15 Minutes:</b> Zero-friction setup with 1-click data import and free migration.<br/>"
                      "✅ <b>AI Lead Scoring & Automated CRM:</b> Predicts deal win probabilities and triggers automated tasks.", s['card_body'])
        ]
    ]
    t_pains = Table(pains_data, colWidths=[360, 360])
    t_pains.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,1), colors.HexColor('#fef2f2')),
        ('BACKGROUND', (1,0), (1,1), colors.HexColor('#f0fdf4')),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_pains)
    story.append(PageBreak())

    # Slide 3: Live Product Showcase (Real Screenshots)
    story.append(Paragraph("Live Product Interface: Built for Speed & Simplicity", s['slide_title']))
    story.append(Paragraph("High-performance Next.js workspace designed for effortless daily operation", s['slide_subtitle']))

    post_login_path = os.path.join(SCREENSHOT_DIR, "post_login_screenshot.png")
    if not os.path.exists(post_login_path):
        post_login_path = os.path.join(SCREENSHOT_DIR, "homepage_screenshot.png")

    show_left = [
        Paragraph("<b>Designed for Modern Teams:</b>", s['card_title']),
        Spacer(1, 4),
        Paragraph("• <b>Zero Learning Curve:</b> Clean, clutter-free UI that employees master on Day 1.", s['card_body']),
        Paragraph("• <b>Instant Cross-Module Sync:</b> When a Sales Order is confirmed, inventory reserves automatically and the draft invoice is created.", s['card_body']),
        Paragraph("• <b>Enterprise Role Security:</b> Strict granular permissions ensure employees only access their assigned modules.", s['card_body']),
        Spacer(1, 10),
        Paragraph("<b>Key Modules at Your Fingertips:</b>", s['card_title']),
        Spacer(1, 4),
        Paragraph("1. CRM & Deals Pipeline<br/>2. Invoicing & Ledger Books<br/>3. Warehouse & Stock Movements<br/>4. HRMS, Leaves & Payroll", s['card_body'])
    ]
    
    show_right = []
    if os.path.exists(post_login_path):
        show_right.append(RLImage(post_login_path, width=430, height=265))

    t_show = Table([[show_left, show_right]], colWidths=[270, 450])
    t_show.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_show)
    story.append(PageBreak())

    # Slide 4: Deep Dive - Sales CRM & Automated Accounting
    story.append(Paragraph("Module Spotlight: Intelligent CRM & Automated Accounting", s['slide_title']))
    story.append(Paragraph("How our AI features save your team 10+ hours every week", s['slide_subtitle']))

    mod_data = [
        [
            Paragraph("<b>💼 Intelligent CRM & Sales Module</b>", s['card_title']),
            Paragraph("<b>📈 Automated Accounting & OCR Billing</b>", s['card_title'])
        ],
        [
            Paragraph("• <b>Visual Kanban Pipeline:</b> Drag-and-drop deals across customized stages from lead to closed-won.<br/>"
                      "• <b>AI Lead Scoring:</b> Proprietary algorithm analyzes deal size, engagement patterns, and conversion probability.<br/>"
                      "• <b>Email Sentiment Analysis:</b> Identifies customer frustration early to prevent lost accounts.<br/>"
                      "• <b>1-Click Quotes to Sales Orders:</b> Convert approved proposals into confirmed orders instantly.", s['card_body']),
            Paragraph("• <b>Instant OCR Invoice Scanner:</b> Upload supplier PDF bills or receipts; AI auto-fills line items, tax, and totals in seconds.<br/>"
                      "• <b>Automated Bank Reconciliation:</b> Matches bank statement feeds with open customer payments.<br/>"
                      "• <b>Double-Entry General Ledger:</b> Compliant Chart of Accounts, P&L, Balance Sheet, and Tax reports.<br/>"
                      "• <b>Automated Payment Reminders:</b> Get paid faster with auto-triggered email follow-ups.", s['card_body'])
        ]
    ]
    t_mod = Table(mod_data, colWidths=[360, 360])
    t_mod.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#eff6ff')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#bfdbfe')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_mod)
    story.append(PageBreak())

    # Slide 5: Deep Dive - Smart Inventory, MRP & HRMS
    story.append(Paragraph("Module Spotlight: Smart Inventory, Manufacturing & HRMS", s['slide_title']))
    story.append(Paragraph("Complete operational control from factory floor and warehouse to payroll", s['slide_subtitle']))

    ops_data = [
        [
            Paragraph("<b>🏭 Smart Inventory & MRP (Manufacturing)</b>", s['card_title']),
            Paragraph("<b>👥 HRMS, Attendance & Automated Payroll</b>", s['card_title'])
        ],
        [
            Paragraph("• <b>Multi-Warehouse Tracking:</b> Real-time visibility across multiple stock locations, stores, and fulfillment hubs.<br/>"
                      "• <b>Predictive Demand Forecasting:</b> AI analyzes historical sales velocity to calculate reorder quantities.<br/>"
                      "• <b>Bill of Materials (BOM):</b> Multi-level manufacturing recipes with automated raw material deduction.<br/>"
                      "• <b>Automated Reorder Triggers:</b> Generates Purchase Orders automatically when stock reaches safety levels.", s['card_body']),
            Paragraph("• <b>Centralized Employee Directory:</b> Secure database for contracts, personal records, and emergency contacts.<br/>"
                      "• <b>Leave & Attendance Tracking:</b> Self-service portal for employees to request vacation and sick days.<br/>"
                      "• <b>Automated Payroll Processing:</b> Generates monthly payroll ledgers and salary slips in one click.<br/>"
                      "• <b>Role-Based User Permissions:</b> Assign department-level access with single sign-on security.", s['card_body'])
        ]
    ]
    t_ops = Table(ops_data, colWidths=[360, 360])
    t_ops.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f8fafc')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_ops)
    story.append(PageBreak())

    # Slide 6: The Future Engine — Marketing & AI Cold Calling
    story.append(Paragraph("Future-Proof Growth: Built-in Marketing & Outbound Calling", s['slide_title']))
    story.append(Paragraph("Transforming your ERP into an autonomous customer acquisition machine", s['slide_subtitle']))

    future_data = [
        [
            Paragraph("<b>1. Multi-Channel Marketing Suite</b>", s['card_title']),
            Paragraph("<b>2. Automated Cold Email Engine</b>", s['card_title']),
            Paragraph("<b>3. AI Cold Calling & Voice Agents</b>", s['card_title'])
        ],
        [
            Paragraph("• Centralized marketing campaign manager.<br/>"
                      "• Landing page & lead form generation.<br/>"
                      "• Track ad ROI from Meta, Google, and LinkedIn.<br/>"
                      "• Inbound leads flow directly into CRM.", s['card_body']),
            Paragraph("• Built-in mailbox warmup & sending pools.<br/>"
                      "• AI-written personalized cold outreach sequences.<br/>"
                      "• Automated follow-ups until reply received.<br/>"
                      "• Replaces expensive 3rd-party tools.", s['card_body']),
            Paragraph("• Autonomous AI phone agents dial prospects in seconds.<br/>"
                      "• Conducts natural voice qualification & objection handling.<br/>"
                      "• Books appointments directly onto your calendar.<br/>"
                      "• Optional dedicated human SDR support available.", s['card_body'])
        ]
    ]
    t_future = Table(future_data, colWidths=[240, 240, 240])
    t_future.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#eff6ff')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#bfdbfe')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_future)
    story.append(Spacer(1, 12))
    story.append(Paragraph("<b>No More Juggling 10 Tools:</b> Our upcoming outbound suite means you won't need separate subscriptions for Lemlist, Bland AI, or external marketing dashboards.", s['quote_style']))
    story.append(PageBreak())

    # Slide 7: Client Business ROI & Guaranteed Value
    story.append(Paragraph("Measurable Business ROI: Why the Platform Pays for Itself", s['slide_title']))
    story.append(Paragraph("Concrete financial and operational returns for a typical 25-person company", s['slide_subtitle']))

    roi_data = [
        [Paragraph("<b>Cost Category</b>", s['card_title']), Paragraph("<b>Traditional Fragmented Approach</b>", s['card_title']), Paragraph("<b>With Our Next-Gen AI ERP</b>", s['card_title']), Paragraph("<b>Annual Client Savings</b>", s['card_title'])],
        [
            Paragraph("<b>Software Subscriptions</b><br/>(CRM, Books, Inventory, HR)", s['card_body']),
            Paragraph("HubSpot ($300) + QuickBooks ($90) + Katana MRP ($350) + Gusto ($120) = <b>$860 / mo</b>", s['card_body']),
            Paragraph("Single Unified ERP Subscription = <b>$199 / mo</b>", s['card_body']),
            Paragraph("<b>$7,932 / Year Saved</b> in SaaS fees", s['card_body'])
        ],
        [
            Paragraph("<b>Manual Data Entry & Invoicing</b>", s['card_body']),
            Paragraph("15 hours/week spent typing receipts, copying numbers to spreadsheets.", s['card_body']),
            Paragraph("Instant OCR scanning and automated bank reconciliation.", s['card_body']),
            Paragraph("<b>$14,400 / Year Saved</b> in labor efficiency", s['card_body'])
        ],
        [
            Paragraph("<b>Prevented Stockouts & Lost Sales</b>", s['card_body']),
            Paragraph("Lost orders due to unpredicted inventory shortages and slow quotes.", s['card_body']),
            Paragraph("AI Demand Forecasting & 1-Click Quote-to-Order conversion.", s['card_body']),
            Paragraph("<b>$20,000+ / Year Captured</b> in retained revenue", s['card_body'])
        ]
    ]
    t_roi = Table(roi_data, colWidths=[140, 200, 200, 180])
    t_roi.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
        ('BACKGROUND', (3,1), (3,-1), colors.HexColor('#f0fdf4')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_roi)
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Total Estimated Annual Value:</b> Over <b>$42,000+ per year</b> in direct cost savings and efficiency gains for a growing mid-sized business.", s['quote_style']))
    story.append(PageBreak())

    # Slide 8: Zero-Risk Onboarding & Get Started
    story.append(Paragraph("Get Started Today: 100% Zero-Risk Onboarding", s['slide_title']))
    story.append(Paragraph("We handle the transition so you experience immediate results without business disruption", s['slide_subtitle']))

    launch_cards = [
        [
            Paragraph("<b>1. 14-Day Free Access</b>", s['card_title']),
            Paragraph("<b>2. Free Data Concierge</b>", s['card_title']),
            Paragraph("<b>3. 15-Minute Jumpstart</b>", s['card_title']),
            Paragraph("<b>4. Dedicated Support</b>", s['card_title'])
        ],
        [
            Paragraph("Test all modules (Sales, Books, Inventory, HR) with full team access. No credit card required.", s['card_body']),
            Paragraph("Send us your Excel sheets or Odoo exports. Our engineering team formats and loads your records for free.", s['card_body']),
            Paragraph("Follow our 4-step quickstart checklist or load demo data to experience immediate AI workflows.", s['card_body']),
            Paragraph("Direct WhatsApp & Slack channel with our product specialists for immediate onboarding help.", s['card_body'])
        ]
    ]
    t_launch = Table(launch_cards, colWidths=[180, 180, 180, 180])
    t_launch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#eff6ff')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#bfdbfe')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_launch)
    story.append(Spacer(1, 20))
    
    closing_banner = [
        [
            Paragraph("<font size='12'><b>Ready to Experience the Next Generation of Business Management?</b></font><br/>"
                      "Schedule a customized 1-on-1 walkthrough or launch your private trial workspace today.<br/>"
                      "<b>Web:</b> <u>http://localhost:3000</u>  |  <b>Support:</b> support@erp-platform.com", 
                      ParagraphStyle('Banner', fontName='Helvetica', fontSize=9.5, leading=14, textColor=colors.HexColor('#0f172a'), alignment=1))
        ]
    ]
    t_cb = Table(closing_banner, colWidths=[720])
    t_cb.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#e0f2fe')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#38bdf8')),
        ('TOPPADDING', (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(t_cb)

    doc.build(story, canvasmaker=ClientPitchDeckCanvas)
    print(f"Client Pitch Deck built: {pdf_path}")


if __name__ == "__main__":
    build_sales_team_deck()
    build_client_pitch_deck()
