import os
import shutil
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, PageBreak, HRFlowable
)
from reportlab.pdfgen import canvas

BASE_DIR = r"D:\ERP_CRM"
PUBLIC_DIR = os.path.join(BASE_DIR, "public")

class NumberedCanvas(canvas.Canvas):
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
            self.draw_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_decorations(self, page_count):
        if self._pageNumber == 1:
            return
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        # Top header
        self.drawString(54, 750, "BERAXIS AI ERP & CRM  |  Official Launch Campaign Toolkit")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 744, letter[0] - 54, 744)
        
        # Bottom footer
        self.drawString(54, 36, "Confidential • Launch Marketing Pack • www.beraxis.online")
        self.drawRightString(letter[0] - 54, 36, f"Page {self._pageNumber} of {page_count}")
        self.line(54, 48, letter[0] - 54, 48)
        self.restoreState()


def build_launch_toolkit_pdf():
    pdf_path = os.path.join(BASE_DIR, "Launch_Campaign_Social_and_Video_Toolkit.pdf")
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CoverT',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#0F172A')
    )
    sub_style = ParagraphStyle(
        'CoverSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#2563EB')
    )
    h1_style = ParagraphStyle(
        'SecH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#1E3A8A'),
        spaceBefore=14,
        spaceAfter=6
    )
    h2_style = ParagraphStyle(
        'SecH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=8,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor('#334155')
    )
    quote_style = ParagraphStyle(
        'ScriptBox',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=colors.HexColor('#0F172A'),
        backColor=colors.HexColor('#F8FAFC'),
        borderColor=colors.HexColor('#CBD5E1'),
        borderWidth=0.5,
        borderPadding=8,
        spaceBefore=4,
        spaceAfter=6
    )

    story = []

    # Header / Logo
    logo_path = os.path.join(BASE_DIR, "logo2.png")
    if os.path.exists(logo_path):
        story.append(RLImage(logo_path, width=42, height=42))
        story.append(Spacer(1, 8))

    story.append(Paragraph("BERAXIS AI ERP & CRM — LAUNCH MARKETING TOOLKIT", title_style))
    story.append(Spacer(1, 3))
    story.append(Paragraph("Social Media Posts • Video Scripts • Email Sequences • Launch Promo Codes", sub_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563EB'), spaceAfter=12))

    # Pricing & Promo Codes Summary
    story.append(Paragraph("1. Launch Packages & Promo Code Reference", h1_style))
    
    pricing_data = [
        [Paragraph("<b>Package Tier</b>", body_style), Paragraph("<b>Regular Price</b>", body_style), Paragraph("<b>Launch Special Offer</b>", body_style), Paragraph("<b>Promo Code</b>", body_style), Paragraph("<b>Key Highlights</b>", body_style)],
        [
            Paragraph("<b>Starter Free Tier</b>", body_style),
            Paragraph("$0 / mo", body_style),
            Paragraph("<b>100% FREE FOREVER</b>", body_style),
            Paragraph("<i>None Needed</i>", body_style),
            Paragraph("1 Module with 1 App of choice forever free + unlimited seats.", body_style)
        ],
        [
            Paragraph("<b>Standard Package</b>", body_style),
            Paragraph("$31.10 / mo", body_style),
            Paragraph("<b>$9.99 for 1 Month</b>", body_style),
            Paragraph("<b>LAUNCH9</b><br/>or <b>BERAXIS9</b>", body_style),
            Paragraph("All 28 ERP modules + OCR Invoice Ingestion + 94.2% AI Lead Scoring.", body_style)
        ],
        [
            Paragraph("<b>Custom / Pro Tier</b>", body_style),
            Paragraph("$46.80 / mo", body_style),
            Paragraph("<b>$15.99 / mo (Early Bird Lock)</b>", body_style),
            Paragraph("<b>EARLYBIRD15</b><br/>or <b>BERAXIS15</b>", body_style),
            Paragraph("Everything in Standard + Multi-Company + Native Outbound Cold Email & AI Calling.", body_style)
        ]
    ]
    t_price = Table(pricing_data, colWidths=[90, 65, 110, 85, 150])
    t_price.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#E2E8F0')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_price)
    story.append(Spacer(1, 10))

    # Social Media Content
    story.append(Paragraph("2. Social Media Launch Posts (Copy & Paste)", h1_style))
    story.append(Paragraph("A. LinkedIn Founder Launch Post (High Trust & Engagement)", h2_style))
    story.append(Paragraph(
        "<i>\"Why does running a business in 2026 still require 5 different software subscriptions?<br/><br/>"
        "Most SMBs are paying $300 for HubSpot, $90 for QuickBooks, $350 for Katana inventory, and $100 for cold outreach tools ($960+/mo tool sprawl).<br/><br/>"
        "Today, we are officially launching <b>BERAXIS</b> (https://www.beraxis.online) — the Next-Gen Autonomous AI ERP & CRM that unites CRM, Accounting, Inventory, HRMS, and Outbound Calling in one workspace.<br/><br/>"
        "🎉 <b>LAUNCH OFFERS:</b><br/>"
        "• 🟢 1 Module Package: 100% FREE FOREVER (No Credit Card Required)<br/>"
        "• 🚀 Standard All-Module Suite: $9.99 for 1 month with code [<b>LAUNCH9</b>]<br/>"
        "• 🔥 Early Bird Custom Pro Tier: $15.99/month lifetime lock with code [<b>EARLYBIRD15</b>]<br/><br/>"
        "Plus, FREE white-glove data migration for the first 50 companies this week!\"</i>",
        quote_style
    ))

    story.append(Paragraph("B. Twitter / X Viral Launch Thread Hook", h2_style))
    story.append(Paragraph(
        "<i>\"We spent 12 months building an AI-native operating system to kill the $900/month SaaS tool sprawl for SMBs.<br/><br/>"
        "Today, @Beraxis is officially LIVE. 🚀<br/>"
        "⚡ 3-Sec AI OCR Invoice Ingestion<br/>"
        "⚡ 94.2% AI Lead Win-Probability Scoring<br/>"
        "⚡ Predictive Multi-Warehouse Stock Reordering<br/>"
        "⚡ Native Cold Emailing & AI Voice Calling Agents<br/><br/>"
        "Try 1 module free forever, or get all 28 modules for $9.99 with code LAUNCH9: https://www.beraxis.online\"</i>",
        quote_style
    ))

    story.append(PageBreak())

    # Video Scripts
    story.append(Paragraph("3. High-Converting Video Scripts & Storyboards", h1_style))
    
    story.append(Paragraph("A. 60-Second Short-Form Video Script (TikTok / Reels / YouTube Shorts)", h2_style))
    
    video_storyboard = [
        [Paragraph("<b>Time</b>", body_style), Paragraph("<b>Visual / Screen Recording Action</b>", body_style), Paragraph("<b>Voiceover Script</b>", body_style)],
        [
            Paragraph("0:00 - 0:08", body_style),
            Paragraph("Montage of expensive SaaS invoices ($960/mo) and red cross over messy spreadsheets.", body_style),
            Paragraph("<i>\"If you're running a business and still paying almost $1,000 a month for 5 different software tools that don't talk to each other... stop scrolling.\"</i>", body_style)
        ],
        [
            Paragraph("0:08 - 0:22", body_style),
            Paragraph("Show smooth Beraxis login and modern dark-mode dashboard loading in 1 second.", body_style),
            Paragraph("<i>\"This is Beraxis — the Next-Gen AI ERP that unifies your CRM, accounting, inventory, and payroll in one clean workspace.\"</i>", body_style)
        ],
        [
            Paragraph("0:22 - 0:38", body_style),
            Paragraph("Drag a PDF invoice into Accounting -> line items and tax auto-fill in 3 seconds.", body_style),
            Paragraph("<i>\"Drop any supplier PDF bill, and our AI extracts line items, VAT, and ledger balances in three seconds. No more manual typing.\"</i>", body_style)
        ],
        [
            Paragraph("0:38 - 0:50", body_style),
            Paragraph("Swipe through CRM Kanban showing 94.2% AI win scoring badges and inventory alerts.", body_style),
            Paragraph("<i>\"Your sales reps get AI lead win scoring, your warehouse gets automated reorder alerts, and your team gets native cold email outreach.\"</i>", body_style)
        ],
        [
            Paragraph("0:50 - 1:00", body_style),
            Paragraph("Launch offer graphic: Free Tier + $9.99 Standard code LAUNCH9 + $15.99 Early Bird code EARLYBIRD15.", body_style),
            Paragraph("<i>\"Use 1 module 100% free forever. Or unlock all 28 modules for just $9.99 this month with code LAUNCH9. Head to beraxis.online now!\"</i>", body_style)
        ]
    ]
    t_vid = Table(video_storyboard, colWidths=[65, 185, 250])
    t_vid.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#E2E8F0')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_vid)
    story.append(Spacer(1, 10))

    # Email Sequences
    story.append(Paragraph("4. Launch Email Campaign Sequences", h1_style))
    story.append(Paragraph("Email 1: Official Launch Announcement", h2_style))
    story.append(Paragraph(
        "<b>Subject:</b> 🚀 It's live: Say goodbye to messy spreadsheets & Odoo headaches<br/>"
        "<i>\"Hi {{FirstName}},<br/><br/>"
        "Today, we're thrilled to officially launch BERAXIS (https://www.beraxis.online) — the Next-Gen AI ERP & CRM that unites your entire business into one high-speed workspace.<br/><br/>"
        "⚡ <b>3-Sec OCR Ingestion:</b> Drop supplier bills and auto-post general ledger entries.<br/>"
        "⚡ <b>AI Lead Scoring:</b> 94.2% accuracy predicting deal closure.<br/>"
        "⚡ <b>Predictive Inventory:</b> Multi-warehouse stock tracking and auto-PO reorders.<br/><br/>"
        "🎁 <b>LAUNCH SPECIALS:</b><br/>"
        "1. 🟢 Free Forever: 1 Module Package 100% Free with 1 App.<br/>"
        "2. 🚀 Standard Package: $9.99 for 1 month with code [<b>LAUNCH9</b>].<br/>"
        "3. 🔥 Early Bird Pro Tier: $15.99/mo lifetime lock with code [<b>EARLYBIRD15</b>].<br/><br/>"
        "👉 Start here: https://www.beraxis.online\"</i>",
        quote_style
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    shutil.copy2(pdf_path, os.path.join(PUBLIC_DIR, "Launch_Campaign_Social_and_Video_Toolkit.pdf"))
    print(f"Launch Toolkit PDF built: {pdf_path}")

if __name__ == "__main__":
    build_launch_toolkit_pdf()
