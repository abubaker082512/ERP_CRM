import os
import shutil
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle, Image as RLImage, PageBreak
)

BASE_DIR = r"D:\ERP_CRM"
DECK_ASSETS = os.path.join(BASE_DIR, "scratch", "deck_assets")
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
TOTAL_SLIDES = 9

def draw_growth_deck_bg(canvas_obj, doc):
    w, h = landscape(letter)
    page_num = canvas_obj._pageNumber
    
    canvas_obj.saveState()
    
    # Base dark background (#0B0F19)
    canvas_obj.setFillColor(colors.HexColor("#0B0F19"))
    canvas_obj.rect(0, 0, w, h, fill=1, stroke=0)
    
    # Top glowing gradient accent bar
    canvas_obj.setFillColor(colors.HexColor("#38BDF8"))
    canvas_obj.rect(0, h - 4, w * 0.35, 4, fill=1, stroke=0)
    canvas_obj.setFillColor(colors.HexColor("#818CF8"))
    canvas_obj.rect(w * 0.35, h - 4, w * 0.35, 4, fill=1, stroke=0)
    canvas_obj.setFillColor(colors.HexColor("#34D399"))
    canvas_obj.rect(w * 0.70, h - 4, w * 0.30, 4, fill=1, stroke=0)

    # Ambient soft glow circles
    canvas_obj.setFillColor(colors.HexColor("#111A2E"))
    canvas_obj.circle(40, h - 40, 120, fill=1, stroke=0)
    canvas_obj.circle(w - 50, 50, 140, fill=1, stroke=0)

    # Running Header (on slides 2 to 9)
    if page_num > 1:
        canvas_obj.setFont("Helvetica-Bold", 8)
        canvas_obj.setFillColor(colors.HexColor("#38BDF8"))
        canvas_obj.drawString(36, h - 22, "BERAXIS AI ERP & CRM")
        
        canvas_obj.setFont("Helvetica", 8)
        canvas_obj.setFillColor(colors.HexColor("#64748B"))
        canvas_obj.drawRightString(w - 36, h - 22, "Growth & Financial Expansion Pitch Deck • $62M ARR Scaling Plan")
        
        canvas_obj.setStrokeColor(colors.HexColor("#1E293B"))
        canvas_obj.setLineWidth(0.75)
        canvas_obj.line(36, h - 28, w - 36, h - 28)

    # Running Footer (all slides)
    canvas_obj.setStrokeColor(colors.HexColor("#1E293B"))
    canvas_obj.setLineWidth(0.75)
    canvas_obj.line(36, 26, w - 36, 26)

    canvas_obj.setFont("Helvetica", 7.5)
    canvas_obj.setFillColor(colors.HexColor("#64748B"))
    canvas_obj.drawString(36, 14, "Confidential • Beraxis Systems Inc. • www.beraxis.online • admin@beraxis.online")
    canvas_obj.drawRightString(w - 36, 14, f"Slide {page_num} of {TOTAL_SLIDES}")
    
    canvas_obj.restoreState()


def generate_growth_pitch_deck():
    pdf_path = os.path.join(BASE_DIR, "Beraxis_Growth_and_Financial_Pitch_Deck.pdf")
    page_w, page_h = landscape(letter)
    
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
        id='growth_frame',
        leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0
    )
    template = PageTemplate(id='growth_slide', frames=frame, onPage=draw_growth_deck_bg)
    doc.addPageTemplates([template])

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'GTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=17,
        leading=20,
        textColor=colors.HexColor('#F8FAFC'),
        spaceAfter=2
    )
    subtitle_style = ParagraphStyle(
        'GSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12.5,
        textColor=colors.HexColor('#94A3B8'),
        spaceAfter=8
    )
    card_title_cyan = ParagraphStyle(
        'GTCyan',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor('#38BDF8')
    )
    card_title_purple = ParagraphStyle(
        'GTPurple',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor('#C084FC')
    )
    card_title_green = ParagraphStyle(
        'GTGreen',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor('#34D399')
    )
    card_body = ParagraphStyle(
        'GBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=10.8,
        textColor=colors.HexColor('#CBD5E1')
    )
    quote_box = ParagraphStyle(
        'GQBox',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor('#93C5FD'),
        backColor=colors.HexColor('#0F172A'),
        borderColor=colors.HexColor('#1E293B'),
        borderWidth=0.5,
        borderPadding=4
    )

    story = []

    # =========================================================================
    # SLIDE 1: Cover
    # =========================================================================
    story.append(Spacer(1, 15))
    logo_path = os.path.join(BASE_DIR, "logo2.png")
    if os.path.exists(logo_path):
        story.append(RLImage(logo_path, width=48, height=48))
    story.append(Spacer(1, 10))
    story.append(Paragraph("BERAXIS AI ERP & CRM", ParagraphStyle('CoverT', fontName='Helvetica-Bold', fontSize=26, leading=30, textColor=colors.HexColor('#F8FAFC'))))
    story.append(Spacer(1, 3))
    story.append(Paragraph("Scaling The Autonomous Operating System for Global SMBs ($0.8M → $62M ARR)", ParagraphStyle('CoverSub', fontName='Helvetica-Bold', fontSize=12, leading=16, textColor=colors.HexColor('#38BDF8'))))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "⚡ <b>$34.8B TAM</b> &nbsp;|&nbsp; ⚡ <b>26.6x LTV:CAC</b> &nbsp;|&nbsp; ⚡ <b>84% Gross Margin</b> &nbsp;|&nbsp; ⚡ <b>15-Min Live Setup</b> &nbsp;|&nbsp; ⚡ <b>Built-in Outbound Revenue Engine</b>",
        ParagraphStyle('CoverPoints', fontName='Helvetica', fontSize=8.5, leading=12, textColor=colors.HexColor('#94A3B8'))
    ))
    story.append(Spacer(1, 15))

    pills_row = [
        [
            Paragraph("<font size='13' color='#38BDF8'><b>$34.8B</b></font><br/><font size='7' color='#94A3B8'>Global SMB Market</font>", ParagraphStyle('P1', alignment=1)),
            Paragraph("<font size='13' color='#34D399'><b>$62M ARR</b></font><br/><font size='7' color='#94A3B8'>Year 5 Target</font>", ParagraphStyle('P2', alignment=1)),
            Paragraph("<font size='13' color='#C084FC'><b>26.6x</b></font><br/><font size='7' color='#94A3B8'>LTV : CAC Ratio</font>", ParagraphStyle('P3', alignment=1)),
            Paragraph("<font size='13' color='#FBBF24'><b>1.1 Mo</b></font><br/><font size='7' color='#94A3B8'>CAC Payback Period</font>", ParagraphStyle('P4', alignment=1)),
        ]
    ]
    t_pill = Table(pills_row, colWidths=[175, 175, 175, 175])
    t_pill.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#131D31')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#1E293B')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_pill)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 2: Market Size & TAM / SAM / SOM
    # =========================================================================
    story.append(Paragraph("Massive Market Opportunity: $62B → $136B Global Wave", title_style))
    story.append(Paragraph("Enterprise ERP is moving downmarket to 30M+ SMBs demanding AI automation over consulting delays", subtitle_style))

    chart_tam = os.path.join(DECK_ASSETS, "chart_market_tam.png")
    col_chart_tam = []
    if os.path.exists(chart_tam):
        col_chart_tam.append(RLImage(chart_tam, width=440, height=215))

    col_text_tam = [
        Paragraph("<b>Key Market Growth Drivers:</b>", card_title_cyan),
        Spacer(1, 2),
        Paragraph("• <b>13.8% Industry CAGR:</b> Legacy ERPs are being replaced by lightweight autonomous cloud solutions.<br/>"
                  "• <b>The $34.8B SMB Opportunity:</b> Odoo charges heavy consultant fees; GoHighLevel only does marketing/CRM without true accounting & inventory.<br/>"
                  "• <b>AI As The Catalyst:</b> 88% of SMB owners cite automated invoice OCR and predictive sales as their #1 software upgrade priority.", card_body),
        Spacer(1, 6),
        Paragraph("<b>Beraxis Market Capture Target:</b>", card_title_green),
        Paragraph("Capturing just <b>1.2% of the switchers market</b> represents <b>$98M+ in recurring annual revenue</b>.", card_body)
    ]
    t_tam = Table([[col_text_tam, col_chart_tam]], colWidths=[260, 440])
    t_tam.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_tam)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 3: Competitive Disruption vs Odoo, Zoho, GoHighLevel
    # =========================================================================
    story.append(Paragraph("Competitive Landscape: Beraxis vs. Odoo, Zoho & GoHighLevel", title_style))
    story.append(Paragraph("Why Beraxis wins against CRM-only tools and legacy bloated ERP suites", subtitle_style))

    chart_comp = os.path.join(DECK_ASSETS, "chart_competitor_comparison.png")
    col_chart_comp = []
    if os.path.exists(chart_comp):
        col_chart_comp.append(RLImage(chart_comp, width=440, height=215))

    col_text_comp = [
        Paragraph("<b>Direct Competitor Battlecards:</b>", card_title_purple),
        Spacer(1, 2),
        Paragraph("• <b>vs. Odoo:</b> Odoo takes 3 months of expensive certified consulting; Beraxis deploys in <b>15 minutes</b> with free white-glove data migration.<br/>"
                  "• <b>vs. GoHighLevel (GHL):</b> GHL is great for marketing/CRM but has <b>ZERO accounting, zero inventory, and zero HRMS</b>. Beraxis is a true end-to-end ERP + Outbound engine.<br/>"
                  "• <b>vs. Zoho One:</b> Zoho is 40+ disconnected apps with sync lag; Beraxis runs on a single unified Next.js core.<br/>"
                  "• <b>vs. Tool Sprawl:</b> Replaces HubSpot + QuickBooks + Katana ($960/mo) for only <b>$199/mo</b>.", card_body)
    ]
    t_comp = Table([[col_text_comp, col_chart_comp]], colWidths=[260, 440])
    t_comp.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_comp)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 4: Product Capabilities & Real Interface Showcase
    # =========================================================================
    story.append(Paragraph("Live Product Execution: Next-Gen Unified Workspace", title_style))
    story.append(Paragraph("High-performance interface operating live across 25+ synchronized enterprise modules", subtitle_style))

    dash_img = os.path.join(DECK_ASSETS, "dashboard_hero.jpg")
    col_dash_img = []
    if os.path.exists(dash_img):
        col_dash_img.append(RLImage(dash_img, width=440, height=215))

    col_dash_text = [
        Paragraph("<b>The Core Architecture:</b>", card_title_cyan),
        Spacer(1, 2),
        Paragraph("• <b>Intelligent CRM:</b> 94.2% AI Lead Win-Probability scoring & Sentiment detection.<br/>"
                  "• <b>Automated Accounting:</b> 3-Second OCR bill parsing & automated bank reconciliation.<br/>"
                  "• <b>Predictive Inventory:</b> Multi-warehouse stock tracking & automated Bill of Materials (BOM).<br/>"
                  "• <b>HRMS & Payroll:</b> 1-click salary slip generation & self-service leave requests.", card_body),
        Spacer(1, 6),
        Paragraph("<b>Enterprise Readiness:</b>", card_title_green),
        Paragraph("PostgreSQL multi-tenant architecture with strict role-based access control and bank-grade SSL security.", card_body)
    ]
    t_dash = Table([[col_dash_text, col_dash_img]], colWidths=[260, 440])
    t_dash.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_dash)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 5: Unit Economics & SaaS Health Metrics
    # =========================================================================
    story.append(Paragraph("World-Class Unit Economics: Highly Capital Efficient", title_style))
    story.append(Paragraph("26.6x LTV:CAC with 1.1 month payback period and 84% Gross Margins", subtitle_style))

    chart_unit = os.path.join(DECK_ASSETS, "chart_unit_economics.png")
    col_chart_unit = []
    if os.path.exists(chart_unit):
        col_chart_unit.append(RLImage(chart_unit, width=440, height=215))

    col_text_unit = [
        Paragraph("<b>Unit Economics Breakdown:</b>", card_title_green),
        Spacer(1, 2),
        Paragraph("• <b>Customer Acquisition Cost (CAC):</b> $180 (driven by viral partner referrals & high-intent outbound).<br/>"
                  "• <b>Customer Lifetime Value (LTV):</b> $4,800 (24-month avg retention @ $200/mo blended).<br/>"
                  "• <b>84% Gross Margin:</b> Modern cloud serverless architecture keeps server + AI inference costs under $32/mo/account.<br/>"
                  "• <b>132% Net Revenue Retention (NRR):</b> Accounts expand spend automatically as they consume AI calling minutes and document credits.", card_body)
    ]
    t_unit = Table([[col_text_unit, col_chart_unit]], colWidths=[260, 440])
    t_unit.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_unit)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 6: 5-Year Financial Forecast ($0.8M -> $62M ARR)
    # =========================================================================
    story.append(Paragraph("5-Year Financial Forecast & ARR Scaling Trajectory", title_style))
    story.append(Paragraph("Clear, data-backed pathway to $62M ARR and 18,000+ active enterprise accounts", subtitle_style))

    chart_arr = os.path.join(DECK_ASSETS, "chart_arr_growth.png")
    col_chart_arr = []
    if os.path.exists(chart_arr):
        col_chart_arr.append(RLImage(chart_arr, width=440, height=215))

    col_text_arr = [
        Paragraph("<b>Year-by-Year Growth Targets:</b>", card_title_cyan),
        Spacer(1, 2),
        Paragraph("• <b>Year 1 ($835K ARR):</b> 350 SMBs acquired via direct blitz & founder outbound.<br/>"
                  "• <b>Year 2 ($4.6M ARR):</b> 1,800 Accounts; launch of native AI Cold Email & Voice Calling.<br/>"
                  "• <b>Year 3 ($16.5M ARR):</b> 5,500 Accounts powered by 100+ accounting & agency channel partners.<br/>"
                  "• <b>Year 4 ($34.2M ARR):</b> Global expansion across UK, US, and MENA mid-market.<br/>"
                  "• <b>Year 5 ($62.0M ARR):</b> 18,000+ Accounts; industry benchmark for AI ERP.", card_body)
    ]
    t_arr = Table([[col_text_arr, col_chart_arr]], colWidths=[260, 440])
    t_arr.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_arr)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 7: The Future Growth Flywheel — AI Marketing & Cold Calling
    # =========================================================================
    story.append(Paragraph("The Revenue Engine: Native Marketing, Email & Cold Calling", title_style))
    story.append(Paragraph("Turning Beraxis into an autonomous customer acquisition machine that expands NRR to 132%", subtitle_style))

    flywheel_cards = [
        [
            Paragraph("<b>1. Multi-Channel Marketing Suite</b>", card_title_cyan),
            Paragraph("<b>2. Automated Cold Email Engine</b>", card_title_purple),
            Paragraph("<b>3. Autonomous AI Calling Agents</b>", card_title_green)
        ],
        [
            Paragraph("• Centralized campaign ROI dashboard.<br/>"
                      "• Landing page & lead form generation.<br/>"
                      "• Tracks conversion attribution across Meta & Google.<br/>"
                      "• <b>Replaces HubSpot ($800/mo)</b>", card_body),
            Paragraph("• Built-in mailbox warmup & sender pools.<br/>"
                      "• AI-personalized cold copy generation.<br/>"
                      "• Multi-step follow-ups synced to CRM deals.<br/>"
                      "• <b>Replaces Instantly ($150/mo)</b>", card_body),
            Paragraph("• Voice AI agents dial inbound leads in 60s.<br/>"
                      "• Natural voice qualification & meeting booking.<br/>"
                      "• Full transcripts & sentiment logged in CRM.<br/>"
                      "• <b>Optional human SDR hybrid option</b>", card_body)
        ]
    ]
    t_fly = Table(flywheel_cards, colWidths=[230, 230, 240])
    t_fly.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#131D31')),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#1E293B')),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#334155')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_fly)
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Monetization Impact:</b> Adding usage-based voice calling minutes ($0.12/min) and verified email pools adds an average of <b>+$185/month in expansion ARR per customer</b>.", quote_box))
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 8: Go-To-Market & 30-Day Blitz Execution Roadmap
    # =========================================================================
    story.append(Paragraph("Go-To-Market Execution: 4 Growth Distribution Engines", title_style))
    story.append(Paragraph("Multi-channel acquisition strategy designed to hit 350 paying accounts in Year 1", subtitle_style))

    gtm_cards = [
        [
            Paragraph("<b>1. Direct Network & Outbound</b>", card_title_cyan),
            Paragraph("<b>2. 'Escape Excel' Migration Hook</b>", card_title_green),
            Paragraph("<b>3. Channel Partner Flywheel</b>", card_title_purple),
            Paragraph("<b>4. High-Conversion PQL Loop</b>", card_title_cyan)
        ],
        [
            Paragraph("High-volume LinkedIn DMs, cold email, and WhatsApp outreach offering free lifetime white-glove setup to early adopters.", card_body),
            Paragraph("Free Data Cleanup: Our team formats and migrates messy Excel/Odoo sheets in 24 hours, removing all friction to switch.", card_body),
            Paragraph("Accountants & IT Consultants receive a free multi-tenant client portal + 20% recurring lifetime revenue share.", card_body),
            Paragraph("Self-service 14-day unrestricted trial with 4-step onboarding checklist driving 65%+ Day-0 activation rate.", card_body)
        ]
    ]
    t_gtm = Table(gtm_cards, colWidths=[175, 175, 175, 175])
    t_gtm.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#131D31')),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#1E293B')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#334155')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_gtm)
    story.append(PageBreak())

    # =========================================================================
    # SLIDE 9: The Ask, Capital Allocation & Vision
    # =========================================================================
    story.append(Paragraph("The Growth Pathway: Capital Allocation & Vision", title_style))
    story.append(Paragraph("Deploying growth capital to scale engineering, outbound distribution, and partner channels", subtitle_style))

    alloc_data = [
        [Paragraph("<b>Allocation Category</b>", card_title_cyan), Paragraph("<b>Target Share</b>", card_title_green), Paragraph("<b>Strategic Objective & Expected Return</b>", card_title_cyan)],
        [
            Paragraph("<b>Product & AI Engineering</b>", card_body),
            Paragraph("<b>40%</b>", card_body),
            Paragraph("Scale autonomous voice calling models, improve OCR parsing speed to <1s, and build 50+ integrations.", card_body)
        ],
        [
            Paragraph("<b>Growth & Outbound Sales</b>", card_body),
            Paragraph("<b>35%</b>", card_body),
            Paragraph("Scale SDR outreach, performance marketing, and automated lead acquisition funnels.", card_body)
        ],
        [
            Paragraph("<b>Channel Partner Program</b>", card_body),
            Paragraph("<b>15%</b>", card_body),
            Paragraph("Onboard 250+ accounting and bookkeeping firms across US, UK, and Europe.", card_body)
        ],
        [
            Paragraph("<b>Operations & Support</b>", card_body),
            Paragraph("<b>10%</b>", card_body),
            Paragraph("24/7 dedicated white-glove customer success and migration concierge.", card_body)
        ]
    ]
    t_alloc = Table(alloc_data, colWidths=[160, 100, 440])
    t_alloc.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#131D31')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#334155')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_alloc)
    story.append(Spacer(1, 10))

    final_cta = [
        [
            Paragraph("<font size='12' color='#F8FAFC'><b>Join Us in Building the #1 Autonomous AI ERP & CRM Platform</b></font><br/>"
                      "<font size='8.5' color='#94A3B8'>Transforming how millions of growing businesses manage operations and generate revenue.</font><br/><br/>"
                      "<font size='9.5' color='#38BDF8'><b>🌐 Platform:</b> www.beraxis.online</font> &nbsp;&nbsp;|&nbsp;&nbsp; "
                      "<font size='9.5' color='#34D399'><b>💬 Executive Contact:</b> admin@beraxis.online</font>",
                      ParagraphStyle('FCTA', alignment=1))
        ]
    ]
    t_fcta = Table(final_cta, colWidths=[700])
    t_fcta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0F172A')),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor('#38BDF8')),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_fcta)

    doc.build(story)
    shutil.copy2(pdf_path, os.path.join(PUBLIC_DIR, "Beraxis_Growth_and_Financial_Pitch_Deck.pdf"))
    print(f"Growth Pitch Deck PDF regenerated: {pdf_path}")

if __name__ == "__main__":
    generate_growth_pitch_deck()
