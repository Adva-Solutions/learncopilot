"""
Generate the 10 PDFs for the Report Writer lesson:
  5 structured templates  (<dept>-template.pdf)
  5 messy meeting transcripts  (<dept>-source.pdf)

ODA palette: navy #0C1F3F, gold #C5973E. Structured reports use serif body
(Times) + sans labels (Helvetica) + navy/gold accents. Transcripts use
Courier body with timestamps to read as raw exports.

Output: mock-data/report-writer/*.pdf
"""

from pathlib import Path
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, black, grey
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    Preformatted,
)

NAVY = HexColor("#0C1F3F")
GOLD = HexColor("#C5973E")
CREAM = HexColor("#FFFDF4")
MUTED = HexColor("#5A5A5A")

OUT_DIR = Path(__file__).resolve().parent.parent / "mock-data" / "report-writer"
OUT_DIR.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------------------------------
# STYLES
# --------------------------------------------------------------------------

def structured_styles():
    s = getSampleStyleSheet()
    styles = {
        "brand": ParagraphStyle(
            "brand", parent=s["Normal"], fontName="Helvetica-Bold",
            fontSize=9, textColor=GOLD, leading=11, spaceAfter=2,
        ),
        "title": ParagraphStyle(
            "title", parent=s["Title"], fontName="Times-Bold", fontSize=22,
            textColor=NAVY, leading=26, spaceAfter=6, alignment=TA_LEFT,
        ),
        "subtitle": ParagraphStyle(
            "subtitle", parent=s["Normal"], fontName="Helvetica",
            fontSize=10, textColor=MUTED, leading=13, spaceAfter=18,
        ),
        "h1": ParagraphStyle(
            "h1", parent=s["Heading1"], fontName="Helvetica-Bold",
            fontSize=11, textColor=NAVY, leading=14, spaceBefore=14,
            spaceAfter=6, textTransform=None,
        ),
        "h2": ParagraphStyle(
            "h2", parent=s["Heading2"], fontName="Helvetica-Bold",
            fontSize=9.5, textColor=GOLD, leading=12, spaceBefore=10,
            spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "body", parent=s["Normal"], fontName="Times-Roman",
            fontSize=10.5, textColor=black, leading=14, spaceAfter=6,
        ),
        "bullet": ParagraphStyle(
            "bullet", parent=s["Normal"], fontName="Times-Roman",
            fontSize=10.5, textColor=black, leading=14, leftIndent=14,
            bulletIndent=2, spaceAfter=3,
        ),
        "caption": ParagraphStyle(
            "caption", parent=s["Normal"], fontName="Helvetica-Oblique",
            fontSize=8.5, textColor=MUTED, leading=11, spaceAfter=4,
        ),
    }
    return styles


def transcript_styles():
    s = getSampleStyleSheet()
    return {
        "header": ParagraphStyle(
            "header", parent=s["Normal"], fontName="Helvetica-Bold",
            fontSize=10, textColor=MUTED, leading=13, spaceAfter=2,
        ),
        "title": ParagraphStyle(
            "title", parent=s["Title"], fontName="Courier-Bold", fontSize=13,
            textColor=black, leading=16, spaceAfter=2, alignment=TA_LEFT,
        ),
        "meta": ParagraphStyle(
            "meta", parent=s["Normal"], fontName="Courier", fontSize=9,
            textColor=MUTED, leading=12, spaceAfter=14,
        ),
        "body": ParagraphStyle(
            "body", parent=s["Normal"], fontName="Courier", fontSize=9.2,
            textColor=black, leading=13, spaceAfter=4,
        ),
    }


# --------------------------------------------------------------------------
# HELPERS
# --------------------------------------------------------------------------

def make_table(data, col_widths):
    t = Table(data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR",  (0, 0), (-1, 0), CREAM),
        ("FONTNAME",   (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",   (0, 0), (-1, 0), 9),
        ("FONTNAME",   (0, 1), (-1, -1), "Times-Roman"),
        ("FONTSIZE",   (0, 1), (-1, -1), 9.5),
        ("ALIGN",      (0, 0), (-1, -1), "LEFT"),
        ("VALIGN",     (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [CREAM, HexColor("#F3EFE0")]),
        ("LEFTPADDING",  (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING",   (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 5),
        ("LINEBELOW", (0, 0), (-1, 0), 1.2, GOLD),
    ]))
    return t


def header_band(canvas, doc, brand_text):
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, doc.pagesize[1] - 0.55 * inch, doc.pagesize[0], 0.55 * inch, fill=1, stroke=0)
    canvas.setFillColor(GOLD)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(0.75 * inch, doc.pagesize[1] - 0.35 * inch, "ODA  ARCHITECTURE")
    canvas.setFillColor(CREAM)
    canvas.setFont("Helvetica", 8.5)
    canvas.drawRightString(doc.pagesize[0] - 0.75 * inch, doc.pagesize[1] - 0.35 * inch, brand_text)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawCentredString(doc.pagesize[0] / 2, 0.35 * inch, f"Page {doc.page}")
    canvas.restoreState()


def build_structured(path, brand_right, story):
    """Render a structured report PDF with ODA branded header band."""
    doc = SimpleDocTemplate(
        str(path), pagesize=LETTER,
        leftMargin=0.9 * inch, rightMargin=0.9 * inch,
        topMargin=0.9 * inch, bottomMargin=0.7 * inch,
    )
    doc.build(
        story,
        onFirstPage=lambda c, d: header_band(c, d, brand_right),
        onLaterPages=lambda c, d: header_band(c, d, brand_right),
    )


def build_transcript(path, title, meta_line, body_text):
    """Render a raw-looking meeting transcript PDF (Courier, minimal chrome)."""
    ts = transcript_styles()
    doc = SimpleDocTemplate(
        str(path), pagesize=LETTER,
        leftMargin=0.75 * inch, rightMargin=0.75 * inch,
        topMargin=0.8 * inch, bottomMargin=0.7 * inch,
    )
    story = [
        Paragraph("MEETING TRANSCRIPT &mdash; AUTO-EXPORTED", ts["header"]),
        Paragraph(title, ts["title"]),
        Paragraph(meta_line, ts["meta"]),
    ]
    # Preformatted keeps line breaks and monospace layout.
    story.append(Preformatted(body_text, ts["body"]))
    doc.build(story)


# --------------------------------------------------------------------------
# CONTENT: 5 STRUCTURED TEMPLATES
# --------------------------------------------------------------------------

def arch_template():
    S = structured_styles()
    story = []
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph("PROJECT STATUS REPORT", S["brand"]))
    story.append(Paragraph("88 Richardson Street", S["title"]))
    story.append(Paragraph("Williamsburg, Brooklyn &middot; Reporting period: March 2026 &middot; Prepared by Maya Okonkwo, Project Manager", S["subtitle"]))

    story.append(Paragraph("Executive Summary", S["h1"]))
    story.append(Paragraph(
        "88 Richardson reached substantial completion on March 27. Certificate of Occupancy was issued April 2. "
        "The 24-story mixed-use building delivered on program (212 residential units, 8,400 SF of ground-floor retail, "
        "two amenity floors) two weeks ahead of the revised schedule and 1.3% under the revised GMP. Client "
        "handoff is scheduled for April 18. This report closes out the project file and documents lessons for "
        "the Navy Yard portfolio to apply to follow-on towers.",
        S["body"]))

    story.append(Paragraph("Project Overview", S["h1"]))
    story.append(Paragraph("Program &amp; statistics", S["h2"]))
    story.append(Paragraph(
        "Mixed-use residential over retail. 212 rental units across studios, 1BR, and 2BR. "
        "Structure: concrete flat-plate over two-story concrete podium. "
        "Envelope: precast concrete rainscreen with terracotta accents. "
        "Gross area 238,000 SF on a 24,100 SF lot.",
        S["body"]))
    story.append(Paragraph("Schedule", S["h2"]))
    story.append(Paragraph(
        "Ground-breaking Q2 2023. Top-out achieved October 2025. TCO issued March 27, 2026. "
        "First tenant move-ins begin May 1.",
        S["body"]))

    story.append(Paragraph("Design Highlights", S["h1"]))
    for line in [
        "Ground floor \u2014 a 22-foot cantilevered soffit creates a covered public passage "
        "that extends the adjacent pocket park through the building, enacting ODA's "
        "<i>porosity for prosperity</i> principle at street level.",
        "Unit layouts \u2014 every unit has operable windows on two exposures, including studios; "
        "this drove a plan shift in CD that preserved daylight after a fourth-floor retail "
        "setback was added.",
        "Amenity stack \u2014 the 14th-floor amenity terrace is continuous with the neighboring "
        "rooftop of 84 Richardson (owner-negotiated easement), doubling the usable outdoor area.",
        "Facade \u2014 pre-cast panels were cast with 5% terra cotta chip aggregate to match "
        "the historic warehouse stock on North 9th; panel weathering across winter was "
        "within tolerance.",
    ]:
        story.append(Paragraph(f"&bull; {line}", S["bullet"]))

    story.append(Paragraph("Consultants &amp; Coordination", S["h1"]))
    story.append(make_table([
        ["Discipline", "Firm", "Lead", "Status"],
        ["Structural", "WSP", "D. Reyes", "Closeout complete"],
        ["MEP", "Cosentini", "A. Hoang", "Punchlist \u2013 97% complete"],
        ["Facade", "Heintges Jrnl", "L. Park", "Closeout complete"],
        ["Civil", "Langan", "R. Okafor", "Closeout complete"],
        ["Lighting", "Tillotson", "S. Klein", "Handoff scheduled 4/15"],
    ], [1.3 * inch, 1.6 * inch, 1.4 * inch, 2.0 * inch]))

    story.append(Paragraph("Schedule &amp; Milestones", S["h1"]))
    story.append(make_table([
        ["Milestone", "Baseline", "Actual", "Variance"],
        ["SD", "Q3 2022", "Q3 2022", "On time"],
        ["DD", "Q1 2023", "Q1 2023", "On time"],
        ["CD", "Q4 2023", "Q4 2023", "On time"],
        ["Top-out", "Sep 2025", "Oct 2025", "+1 month"],
        ["TCO", "Apr 2026", "Mar 27, 2026", "\u22122 weeks"],
        ["Handoff", "May 1, 2026", "Apr 18, 2026", "\u221213 days"],
    ], [1.6 * inch, 1.3 * inch, 1.4 * inch, 2.0 * inch]))

    story.append(PageBreak())

    story.append(Paragraph("Budget", S["h1"]))
    story.append(make_table([
        ["Category", "GMP", "Final", "Delta"],
        ["Shell &amp; Core", "$58.2M", "$57.4M", "\u2212$0.8M"],
        ["Interiors", "$19.4M", "$19.6M", "+$0.2M"],
        ["Amenities", "$4.1M", "$3.9M", "\u2212$0.2M"],
        ["Site &amp; Civil", "$6.8M", "$6.8M", "On target"],
        ["Soft costs", "$7.5M", "$7.3M", "\u2212$0.2M"],
        ["<b>Total</b>", "<b>$96.0M</b>", "<b>$95.0M</b>", "<b>\u22121.0M (\u22121.3%)</b>"],
    ], [1.6 * inch, 1.3 * inch, 1.3 * inch, 2.1 * inch]))

    story.append(Paragraph("Issues Resolved", S["h1"]))
    for line in [
        "Fourth-floor setback change order (ULURP condition, March 2024) \u2014 absorbed "
        "through a plan rework; unit count preserved.",
        "Precast panel winter weathering concern (December 2025) \u2014 monitored over "
        "two freeze-thaw cycles; variance within 0.4mm of spec.",
        "DOB elevator inspection delay (February 2026) \u2014 escalated with expediter; "
        "TCO path preserved.",
    ]:
        story.append(Paragraph(f"&bull; {line}", S["bullet"]))

    story.append(Paragraph("Open Items at Handoff", S["h1"]))
    for line in [
        "Retail tenant signage &mdash; three tenants TBD, landlord review pending.",
        "Rooftop mechanical screen finish &mdash; powder-coat re-do on two panels, "
        "scheduled week of April 15.",
        "Landscape \u2014 second-phase planting contingent on warm weather; ETA May.",
    ]:
        story.append(Paragraph(f"&bull; {line}", S["bullet"]))

    story.append(Paragraph("Client Feedback", S["h1"]))
    story.append(Paragraph(
        "Ownership (Domain Holdings) has indicated intent to award the next Navy Yard tower "
        "(Bldg 284) to ODA on a direct-select basis, pending board vote in May. Cited: ODA's "
        "speed on the ULURP setback rework and the team's handling of the facade weathering "
        "question. Client feedback survey returned a 4.7 / 5 average (n=11 across ownership, "
        "construction, and property management).",
        S["body"]))

    story.append(Paragraph("Next Phase", S["h1"]))
    story.append(Paragraph(
        "Project file is handed over to archives on May 1. The design team rolls onto "
        "412 Nostrand in Bed-Stuy (currently in early DD) and two remaining Domain Holdings "
        "towers (if awarded). Lessons-learned session scheduled for April 22.",
        S["body"]))

    build_structured(OUT_DIR / "architecture-template.pdf", "Project Status Report", story)


def hr_template():
    S = structured_styles()
    story = []
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph("MONTHLY PEOPLE REPORT", S["brand"]))
    story.append(Paragraph("March 2026", S["title"]))
    story.append(Paragraph("Prepared by Sara Levine, Director of People &middot; For the ODA Partner Group", S["subtitle"]))

    story.append(Paragraph("Headline Numbers", S["h1"]))
    story.append(make_table([
        ["Metric", "March", "Feb", "YoY"],
        ["Total headcount", "124", "121", "+9%"],
        ["Voluntary turnover (TTM)", "11.2%", "10.8%", "+1.4 pt"],
        ["Open requisitions", "6", "8", "\u22122"],
        ["Offer-accept rate", "88%", "83%", "+11 pt"],
        ["eNPS (rolling pulse)", "+38", "+35", "+6"],
    ], [2.2 * inch, 1.2 * inch, 1.2 * inch, 1.7 * inch]))

    story.append(Paragraph("Hiring &amp; Promotions", S["h1"]))
    story.append(Paragraph(
        "Three hires closed in March: a Senior Project Architect (joined the Williamsburg "
        "studio, from SOM New York), an Associate on the commercial team (internal transfer "
        "from Chicago office), and a Marketing Coordinator. Two offers are in late-stage "
        "negotiation: a Director of Sustainability (target start May) and a Junior Designer "
        "for the Competitions desk.",
        S["body"]))
    story.append(Paragraph(
        "Promotions: four Associates advanced to Senior Associate this cycle (the March "
        "half-year promotion window). Compensation adjustments effective April 1.",
        S["body"]))

    story.append(Paragraph("Retention &amp; Engagement", S["h1"]))
    story.append(Paragraph(
        "Two voluntary departures this month, both in the 2-3 year tenure bracket. "
        "Exit-interview themes concentrated on project-assignment clarity and compensation "
        "parity with startup-adjacent firms. We are piloting a quarterly assignment "
        "preview session with the studio leads to improve visibility. eNPS ticked up on "
        "the back of the March pulse, led by the competitions and interiors studios.",
        S["body"]))

    story.append(Paragraph("Benefits &amp; Programs", S["h1"]))
    for line in [
        "Q2 benefits survey fielded March 18; 71% response rate. Top-requested enhancements: "
        "expanded mental-health coverage (43%), student-loan assistance (27%), commuter "
        "transit expansion (22%).",
        "Parental leave policy revision (extended to 16 weeks primary / 8 weeks secondary) "
        "takes effect April 1. Communicated firm-wide March 22.",
        "Wellness stipend Q2 tranche ($500 per employee) credited March 31.",
    ]:
        story.append(Paragraph(f"&bull; {line}", S["bullet"]))

    story.append(Paragraph("Learning &amp; Development", S["h1"]))
    story.append(Paragraph(
        "Manager training cohort 2 kicked off March 10 with 11 participants. Focus: "
        "performance conversations, project-assignment decisions, and psychological "
        "safety. Feedback to date is strongly positive (4.6 / 5). Cohort 3 opens in May.",
        S["body"]))
    story.append(Paragraph(
        "Copilot adoption workshop (this course) scheduled for April 23 across five "
        "department tracks; 86 registrations as of month-end.",
        S["body"]))

    story.append(PageBreak())

    story.append(Paragraph("Risk &amp; Watch List", S["h1"]))
    for line in [
        "One senior hire in the structural-design team (18-month tenure) has been "
        "engaged by a recruiter. Scheduled 1:1 with partner-in-charge.",
        "Overtime spiking on the Navy Yard team \u2014 last-week hours-per-head up 12% "
        "month-over-month. COO and studio lead reviewing staffing plan.",
        "Open Director of Sustainability requisition has been open 84 days; revising "
        "the position description to broaden the candidate aperture.",
    ]:
        story.append(Paragraph(f"&bull; {line}", S["bullet"]))

    story.append(Paragraph("Looking Ahead", S["h1"]))
    story.append(Paragraph(
        "April priorities: close the Director of Sustainability and Junior Designer "
        "searches, publish Q2 benefits survey results, and run cohort 3 scoping. "
        "Partner group: requesting 15 minutes at the April 22 meeting to review the "
        "parental-leave comms rollout.",
        S["body"]))

    build_structured(OUT_DIR / "hr-template.pdf", "Monthly People Report", story)


def marketing_template():
    S = structured_styles()
    story = []
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph("CAMPAIGN PERFORMANCE REPORT", S["brand"]))
    story.append(Paragraph("Q1 2026 &mdash; \u201cWaterfront Wins\u201d", S["title"]))
    story.append(Paragraph("Prepared by Julia Tran, Marketing Director &middot; Distribution: Partners, Studios", S["subtitle"]))

    story.append(Paragraph("Executive Summary", S["h1"]))
    story.append(Paragraph(
        "The \u201cWaterfront Wins\u201d campaign launched January 8 to consolidate ODA's "
        "position on the Brooklyn-Queens waterfront ahead of three high-profile "
        "completions. The campaign combined owned (newsletter, LinkedIn), earned "
        "(Dezeen, Architectural Record, Metropolis), and competition channels. "
        "Objectives were met on 3 of 4 KPIs; the RFP-influenced pipeline target was "
        "exceeded by 18%.",
        S["body"]))

    story.append(Paragraph("Campaign Objectives", S["h1"]))
    for line in [
        "<b>Awareness</b> &mdash; 20% lift in qualified site traffic on waterfront project pages.",
        "<b>Earned media</b> &mdash; secure 5 Tier-1 placements across international architecture press.",
        "<b>Awards</b> &mdash; submit to 6 AIA / waterfront-focused programs; target 2 wins.",
        "<b>Pipeline</b> &mdash; drive 8 RFP-influenced conversations with waterfront developers.",
    ]:
        story.append(Paragraph(f"&bull; {line}", S["bullet"]))

    story.append(Paragraph("Results &amp; KPIs", S["h1"]))
    story.append(make_table([
        ["KPI", "Target", "Actual", "Status"],
        ["Qualified traffic lift", "+20%", "+27%", "Exceeded"],
        ["Tier-1 earned placements", "5", "6", "Exceeded"],
        ["Awards submissions", "6", "6", "On target"],
        ["Awards wins", "2", "1 + 2 pending", "On track"],
        ["RFP-influenced conversations", "8", "11 (+3 intro meetings)", "Exceeded"],
        ["LinkedIn impressions", "400K", "512K", "Exceeded"],
        ["Newsletter open rate", "42%", "39%", "Below target"],
    ], [2.1 * inch, 1.1 * inch, 1.7 * inch, 1.4 * inch]))

    story.append(Paragraph("Channel Breakdown", S["h1"]))
    story.append(Paragraph("Earned media", S["h2"]))
    story.append(Paragraph(
        "Six Tier-1 placements secured: Dezeen feature on 88 Richardson (Jan 22), "
        "Architectural Record cover story on the Navy Yard masterplan (Feb), "
        "Metropolis interview with Principal R. Okorafor (Mar), and three regional "
        "features (NY Times Real Estate, Crain's, Brooklyn Paper).",
        S["body"]))
    story.append(Paragraph("Social", S["h2"]))
    story.append(Paragraph(
        "LinkedIn is driving 71% of qualified traffic. Instagram engagement up 14% "
        "on a lower posting cadence (3x/week vs. 5x/week in Q4) \u2014 quality over "
        "volume is working.",
        S["body"]))
    story.append(Paragraph("Awards", S["h2"]))
    story.append(Paragraph(
        "AIA NY Design Award: win on 88 Richardson (Merit, Multi-Family). Two "
        "pending: AIA Brooklyn (decision April 12) and NYCxDESIGN (decision May).",
        S["body"]))
    story.append(Paragraph("Events", S["h2"]))
    story.append(Paragraph(
        "Co-hosted a Brooklyn Waterfront futures panel with Van Alen Institute "
        "(Feb 24). 240 attendees incl. 14 developers; yielded 4 of the 11 "
        "RFP-influenced conversations.",
        S["body"]))

    story.append(PageBreak())

    story.append(Paragraph("Notable Moments", S["h1"]))
    for line in [
        "Dezeen ran the 88 Richardson feature within 48 hours of our drone-photo "
        "delivery \u2014 fastest turnaround we have had with them.",
        "Principal's Metropolis interview quote (\u201cporosity as urban social "
        "infrastructure\u201d) was picked up in two academic syllabi within 30 days.",
        "AIA Merit win on 88 Richardson unlocks a direct meeting with the ownership's "
        "board on a follow-on tower.",
    ]:
        story.append(Paragraph(f"&bull; {line}", S["bullet"]))

    story.append(Paragraph("What Worked", S["h1"]))
    story.append(Paragraph(
        "Tight integration between awards submissions and earned media \u2014 the "
        "Dezeen feature landed the same week as the AIA submission, reinforcing the "
        "jury narrative. Photography investment ($28K) paid off across six outlets.",
        S["body"]))
    story.append(Paragraph("What Didn't", S["h1"]))
    story.append(Paragraph(
        "Newsletter open rate dipped 3 points under a segmented-list test; the "
        "control list outperformed. Reverting in Q2. Instagram Reels for waterfront "
        "projects under-indexed on engagement \u2014 moving that budget to LinkedIn "
        "video.",
        S["body"]))

    story.append(Paragraph("Recommendations for Q2", S["h1"]))
    for line in [
        "Shift remaining Q2 paid budget from Instagram Reels to LinkedIn video and "
        "programmatic display against named developer accounts.",
        "Re-test newsletter segmentation with a cleaner variable (topic interest, "
        "not project-type).",
        "Secure one international Tier-1 placement (target: Domus or Wallpaper*).",
        "Begin seeding the 412 Nostrand launch for Q3, starting with a Van Alen "
        "co-program.",
    ]:
        story.append(Paragraph(f"&bull; {line}", S["bullet"]))

    build_structured(OUT_DIR / "marketing-template.pdf", "Campaign Performance Report", story)


def executive_template():
    S = structured_styles()
    story = []
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph("MONTHLY BOARD BRIEFING", S["brand"]))
    story.append(Paragraph("March 2026", S["title"]))
    story.append(Paragraph("Prepared by Elena Santiago, Managing Director &middot; Distribution: ODA Partner Group", S["subtitle"]))

    story.append(Paragraph("Executive Summary", S["h1"]))
    story.append(Paragraph(
        "March delivered three strategic wins (88 Richardson TCO, AIA Merit award, "
        "Domain Holdings follow-on signal) and one emerging concern (Q2 backlog "
        "thinning on the commercial side). Firm financial position is strong; "
        "utilization is trending above plan; the partner vote on the direct-select "
        "Navy Yard tower is the most important April decision.",
        S["body"]))

    story.append(Paragraph("Business Metrics", S["h1"]))
    story.append(make_table([
        ["Metric", "March", "Plan", "Variance"],
        ["Revenue (MTD)", "$3.9M", "$3.7M", "+5.4%"],
        ["Backlog (EOM)", "$41.2M", "$43.0M", "\u22124.2%"],
        ["Utilization", "71.4%", "68.0%", "+3.4 pt"],
        ["Write-offs", "$84K", "$120K", "Favorable"],
        ["DSO", "52 days", "60 days", "Favorable"],
        ["Headcount", "124", "122", "+2"],
    ], [1.8 * inch, 1.3 * inch, 1.3 * inch, 1.5 * inch]))

    story.append(Paragraph("Major Wins", S["h1"]))
    for line in [
        "88 Richardson received TCO two weeks early and came in 1.3% under GMP. "
        "Ownership has signaled direct-select intent on the next Navy Yard tower; "
        "partner vote requested for April 22.",
        "AIA NY Design Award \u2014 Merit in Multi-Family for 88 Richardson. "
        "Unlocks a direct ownership-board meeting on the follow-on.",
        "Queens City masterplan RFP shortlist: ODA advanced to the final three "
        "(of 17 submissions). Interviews April 16.",
    ]:
        story.append(Paragraph(f"&bull; {line}", S["bullet"]))

    story.append(Paragraph("Project Portfolio Health", S["h1"]))
    story.append(make_table([
        ["Project", "Studio", "Phase", "Status"],
        ["88 Richardson", "Residential", "Closeout", "Green"],
        ["Navy Yard Bldg 284", "Residential", "Pursuit", "Green"],
        ["412 Nostrand", "Mixed-use", "DD", "Green"],
        ["Wynwood Tower", "Commercial", "CD", "Yellow"],
        ["Queens City Masterplan", "Urban", "Pursuit", "Green"],
        ["Boston Seaport", "Commercial", "Pursuit", "Yellow"],
    ], [1.9 * inch, 1.2 * inch, 1.2 * inch, 1.6 * inch]))
    story.append(Paragraph(
        "Wynwood is Yellow on a fee-variance risk tied to a tenant-driven "
        "reprogramming; COO to resolve with ownership by April 30. Boston Seaport "
        "is Yellow on pursuit spend against a 10-week RFP window.",
        S["caption"]))

    story.append(Paragraph("People", S["h1"]))
    story.append(Paragraph(
        "Three hires closed, two offers out. Voluntary turnover TTM 11.2% (+0.4pt). "
        "Director of Sustainability req has been open 84 days and is under review. "
        "Parental-leave policy update (16/8 weeks) rolled out March 22.",
        S["body"]))

    story.append(PageBreak())

    story.append(Paragraph("Market &amp; Industry Signals", S["h1"]))
    for line in [
        "NYC residential construction starts up 4% Q-over-Q; waterfront activity "
        "leading the trend (Marcus &amp; Millichap, March report).",
        "Boston commercial market softening; two peer firms (SOM, Kohn Pedersen Fox) "
        "reported layoffs affecting commercial practices.",
        "Adaptive-reuse inquiries up notably \u2014 we have fielded 7 inbound on "
        "industrial-to-residential conversions this quarter vs. 3 in Q4.",
    ]:
        story.append(Paragraph(f"&bull; {line}", S["bullet"]))

    story.append(Paragraph("Risks", S["h1"]))
    for line in [
        "<b>Q2 backlog (commercial).</b> Current run-rate places commercial-studio "
        "billable hours 8% below plan for June-August. Pursuit calendar skewed "
        "residential. Mitigation: accelerate Boston Seaport and two late-Q2 "
        "hospitality pursuits.",
        "<b>Key-person risk.</b> Senior Project Architect on the Wynwood team "
        "engaged by a recruiter. PIC aware, retention action scheduled.",
        "<b>Insurance renewal.</b> Q3 renewal quote expected to rise 14%; finance "
        "is negotiating a two-year lock.",
    ]:
        story.append(Paragraph(f"&bull; {line}", S["bullet"]))

    story.append(Paragraph("Partner Decisions Requested", S["h1"]))
    for line in [
        "Approve pursuit of the Atlanta mixed-use RFP (est. cost $85K, win prob 22%).",
        "Vote on direct-select acceptance for Navy Yard Bldg 284 contingent on "
        "contract terms.",
        "Approve revised Q2 marketing shift (move $22K from Instagram Reels to "
        "LinkedIn video).",
    ]:
        story.append(Paragraph(f"&bull; {line}", S["bullet"]))

    build_structured(OUT_DIR / "executive-template.pdf", "Monthly Board Briefing", story)


def operations_template():
    S = structured_styles()
    story = []
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph("MONTHLY OPERATIONS DASHBOARD", S["brand"]))
    story.append(Paragraph("March 2026", S["title"]))
    story.append(Paragraph("Prepared by Kyle Rhodes, Resource Manager &middot; For the COO and Studio Leads", S["subtitle"]))

    story.append(Paragraph("Headline Operations Metrics", S["h1"]))
    story.append(make_table([
        ["Metric", "March", "Plan", "Variance"],
        ["Utilization (firm-wide)", "71.4%", "68.0%", "+3.4 pt"],
        ["Billable hours", "14,120", "13,400", "+5.4%"],
        ["Active projects", "38", "36", "+2"],
        ["Avg project fee velocity (MoM)", "+4%", "+3%", "+1 pt"],
        ["Time-entry compliance", "93%", "95%", "\u22122 pt"],
    ], [2.4 * inch, 1.1 * inch, 1.1 * inch, 1.5 * inch]))

    story.append(Paragraph("Resource Allocation by Studio", S["h1"]))
    story.append(make_table([
        ["Studio", "Headcount", "Util.", "On allocation?"],
        ["Residential", "38", "78%", "+3% over plan (healthy)"],
        ["Mixed-use", "22", "74%", "On plan"],
        ["Commercial", "18", "62%", "\u22126% under plan"],
        ["Urban / Masterplan", "12", "69%", "On plan"],
        ["Interiors", "14", "66%", "\u22122% under plan"],
        ["Competitions", "8", "81%", "+11% over \u2014 watch burn-out"],
    ], [1.7 * inch, 1.1 * inch, 1.0 * inch, 2.3 * inch]))

    story.append(Paragraph("Project Pipeline Health", S["h1"]))
    story.append(Paragraph(
        "Of 38 active projects, 33 are on fee and schedule (Green), 4 are Yellow, "
        "and 1 is Red. The Red is Wynwood Tower (tenant-driven reprogramming; "
        "COO resolving with ownership by April 30). Yellow projects are all "
        "fee-variance risks rather than schedule risks.",
        S["body"]))

    story.append(Paragraph("Budget vs. Actuals", S["h1"]))
    story.append(make_table([
        ["Category (MTD)", "Budget", "Actual", "Variance"],
        ["Direct labor", "$1.72M", "$1.78M", "+3.5%"],
        ["Indirect labor", "$0.38M", "$0.36M", "\u22125.3%"],
        ["Consultants (pass-through)", "$0.22M", "$0.24M", "+9.1%"],
        ["Occupancy", "$0.19M", "$0.19M", "On plan"],
        ["Tech &amp; software", "$0.09M", "$0.11M", "+22% \u2014 Copilot pilot"],
        ["Travel &amp; marketing", "$0.14M", "$0.12M", "\u221214%"],
    ], [2.1 * inch, 1.1 * inch, 1.2 * inch, 1.5 * inch]))

    story.append(PageBreak())

    story.append(Paragraph("Tools &amp; Systems Update", S["h1"]))
    for line in [
        "Copilot for M365 licenses rolled out to 86 of 124 staff; remaining rollout "
        "tied to the April 23 workshop.",
        "Deltek migration phase 2 completes April 30; no impact to billing cycle.",
        "Revit 2026 template update deployed March 10 across studios; four tickets "
        "remain open (all cosmetic).",
    ]:
        story.append(Paragraph(f"&bull; {line}", S["bullet"]))

    story.append(Paragraph("Operational Risks", S["h1"]))
    for line in [
        "Commercial studio utilization below plan; April pipeline includes only two "
        "new starts on that side. Actions: pull-forward Boston Seaport kickoff if "
        "award confirmed, and consider short-term loan of two staff to Residential.",
        "Competitions desk utilization at 81% with two late-April deadlines; escalate "
        "to studio lead re: burn-out risk.",
        "Time-entry compliance slipped 2 points; weekly reminders restarted April 1.",
    ]:
        story.append(Paragraph(f"&bull; {line}", S["bullet"]))

    story.append(Paragraph("Looking Ahead", S["h1"]))
    story.append(Paragraph(
        "April priorities: stabilize commercial-studio utilization, close Deltek "
        "phase 2, finish the Copilot rollout, and bring time-entry compliance back "
        "above 95%. Q2 utilization target remains 68% firm-wide.",
        S["body"]))

    build_structured(OUT_DIR / "operations-template.pdf", "Monthly Operations Dashboard", story)


# --------------------------------------------------------------------------
# CONTENT: 5 MEETING TRANSCRIPTS
# --------------------------------------------------------------------------

ARCH_TRANSCRIPT = """\
[00:00:02] MAYA:    Alright we're recording? Yeah ok. So this is the Friday
[00:00:04]          walkthrough at 412 Nostrand, we've got Dan from WSP,
[00:00:08]          Lena from HJ, uh, and Jose. It's April 11, 10:15. We're
[00:00:13]          on the 14th floor. Jose is everything cleared up here?

[00:00:18] JOSE:    Yeah we pulled the scaffold down Monday. You can see
[00:00:22]          the whole south elevation now from this corner.

[00:00:26] MAYA:    Ok good. Dan, show me what you've got.

[00:00:29] DAN:     Ok so. The rebar clash. Um. We flagged it on sheet S-312,
[00:00:35]          where the transfer beam at column line E-7 hits the
[00:00:39]          embed for the facade bracket. You can see it here \u2014
[00:00:42]          the bracket as drawn sits right in the middle of the
[00:00:45]          top-mat congestion. Not going to be constructible as is.

[00:00:49] MAYA:    How bad? Can we field-rotate the bracket?

[00:00:52] DAN:     Field rotate won't work because the cladding panel
[00:00:54]          attaches off a specific point on that bracket. Lena \u2014
[00:00:57]          can you talk to the panel geometry?

[00:01:00] LENA:    Yeah so the panel has to land on that bracket within
[00:01:03]          about a quarter inch tolerance or the joint pattern
[00:01:06]          breaks visually when you look up from the street.

[00:01:10] MAYA:    Mhm.

[00:01:11] LENA:    We could shift the bracket west by eight inches and the
[00:01:14]          panel still works, I'd have to re-run the shop drawing
[00:01:17]          but it's doable. The issue is that puts it into the
[00:01:20]          plenum zone.

[00:01:21] MAYA:    \u2014 which MEP owns.

[00:01:23] DAN:     Right. So the fix is, either WSP thickens the top mat
[00:01:27]          around that column to give us clearance \u2014 probably a
[00:01:29]          half-day exercise on our end, no real cost \u2014 or we
[00:01:32]          coordinate the plenum route-around with Cosentini.

[00:01:35] MAYA:    Who's faster?

[00:01:36] DAN:     Us. Cosentini has two open coordination packages already.

[00:01:40] MAYA:    Ok do it your way. Jose you good with that?

[00:01:43] JOSE:    If it's a half day it's a half day, fine, but we need
[00:01:46]          the revised sheets by Wednesday or we hold the pour
[00:01:49]          on the 15th floor.

[00:01:50] MAYA:    Dan?

[00:01:51] DAN:     Tuesday EOD.

[00:01:52] MAYA:    Ok. Next thing. The precast panels.

[00:01:56] LENA:    Yeah so. The shipment for the east elevation. Um. It
[00:02:01]          was supposed to arrive today. The precaster called me
[00:02:04]          yesterday afternoon, there's a truck issue in the fleet,
[00:02:07]          they're saying Monday is the earliest.

[00:02:10] MAYA:    Monday meaning when.

[00:02:11] LENA:    Monday the 14th, so uh, three days late.

[00:02:14] JOSE:    That pushes my crane schedule because I had the other
[00:02:17]          south panels going up Tuesday through Thursday. If the
[00:02:20]          east shipment lands Monday I can still get it in the
[00:02:23]          queue but I need to pay the crane crew OT on Thursday.

[00:02:26] MAYA:    How much?

[00:02:27] JOSE:    Maybe nine thousand.

[00:02:29] MAYA:    \u2014 nope. No OT. Let me think. Can we flip the
[00:02:32]          sequence \u2014 east panels Tuesday, south panels start
[00:02:35]          Wednesday?

[00:02:36] JOSE:    If they land Monday by noon I can do that, yeah. But
[00:02:39]          if they land at 4pm Monday I can't.

[00:02:41] LENA:    Let me call them right now and see if we can get a
[00:02:44]          before-noon commitment.

[00:02:45] MAYA:    Yes please. Text me.

[00:02:47] LENA:    Yeah.

[00:02:48] MAYA:    Ok last thing. Jose, the tenant showroom change.

[00:02:52] JOSE:    Yeah. So the retail tenant in the northeast corner.
[00:02:55]          They came back with a, um, different showroom layout.
[00:02:58]          They want the entrance on Nostrand, not on the side
[00:03:01]          street. Which we already built the storefront for.

[00:03:04] MAYA:    When did this come in?

[00:03:05] JOSE:    Wednesday. Tenant broker emailed the client.

[00:03:08] MAYA:    Ok \u2014 that's a change order. That's not a field
[00:03:10]          decision. I need to push back. Let me call Asha at the
[00:03:13]          client side this afternoon.

[00:03:15] JOSE:    Ok. In the meantime we keep going with what's on the
[00:03:18]          drawings?

[00:03:18] MAYA:    Yes. Nothing changes until I get back to you. Don't
[00:03:21]          stop the storefront install.

[00:03:23] JOSE:    Got it.

[00:03:24] MAYA:    Ok. Dan anything else from your side?

[00:03:27] DAN:     Two small things. The slab elevation on level 11,
[00:03:30]          northeast corner, came out of the last pour a quarter
[00:03:33]          inch high. We flagged it, it's within tolerance but
[00:03:36]          for the flooring guy to know. And uh, the stair
[00:03:39]          pressurization shaft detail at the roof \u2014 we need
[00:03:41]          the final Cosentini layout or we can't finalize the
[00:03:44]          concrete.

[00:03:45] MAYA:    I'll chase Cosentini today. What's the deadline on that.

[00:03:48] DAN:     End of next week or we hold the roof pour.

[00:03:51] MAYA:    Ok. Lena?

[00:03:52] LENA:    Nothing else. Except the DOB inspector is coming
[00:03:55]          Wednesday for the facade mockup inspection.

[00:03:57] MAYA:    Wednesday what time.

[00:03:58] LENA:    10am.

[00:03:59] MAYA:    I'll be here. Ok good. Anything else?

[00:04:02] JOSE:    No we're good.

[00:04:03] MAYA:    Ok. Thanks everybody.

[00:04:05]          [END OF RECORDING]
"""

HR_TRANSCRIPT = """\
[00:00:01] SARA:    Hey team. Ok we're recording. April HR sync, April 10.
[00:00:05]          Marcus, Ash, Priya all here. Let's go. Marcus you want
[00:00:08]          to start with hiring?

[00:00:10] MARCUS:  Yeah. So, the big number first. We have two offers out
[00:00:14]          right now. Director of Sustainability and the Junior
[00:00:17]          Designer for Competitions. The Director is the more
[00:00:20]          urgent one because we've been sitting on this req for,
[00:00:23]          um, eighty-something days.

[00:00:24] SARA:    Eighty-four.

[00:00:25] MARCUS:  Eighty-four, yeah. The candidate we have out is ok not
[00:00:29]          great. She's solid on the sustainability side but she
[00:00:32]          doesn't have strong waterfront experience which is kind
[00:00:35]          of what the studios wanted. I think we get her for 185
[00:00:38]          and she accepts, but I want to flag it, we might be
[00:00:40]          settling. We should think about rewriting the JD.

[00:00:43] SARA:    I was going to bring that up. Can we rewrite it to be
[00:00:46]          more like, Head of Sustainability and Climate Strategy,
[00:00:49]          broader \u2014 and then hire two people, a director and
[00:00:52]          a senior.

[00:00:53] MARCUS:  Yeah. Honestly I like that better. Let me draft
[00:00:56]          something this week. If our current candidate accepts,
[00:00:59]          she can be the senior and we open the director search
[00:01:02]          fresh.

[00:01:02] SARA:    Ok let's do that. What about the Junior Designer?

[00:01:05] MARCUS:  Junior Designer offer went out Tuesday. The candidate
[00:01:08]          asked for an extra day to think. I'm expecting yes by
[00:01:11]          Friday.

[00:01:12] SARA:    Ok. Anything else on hiring?

[00:01:14] MARCUS:  Nope. March hiring closed. Three hires. Senior PA,
[00:01:18]          Associate internal transfer, Marketing Coord. I pushed
[00:01:21]          the numbers to you yesterday.

[00:01:22] SARA:    Got it. Ok, Ash \u2014 retention.

[00:01:25] ASH:     So the thing I want to flag, and this is not a surprise,
[00:01:29]          but \u2014 you remember we had that 18-month structural
[00:01:32]          guy on the Wynwood team who was getting hit by that
[00:01:35]          recruiter? He resigned. Tuesday.

[00:01:37] SARA:    Damnit. Ok.

[00:01:38] ASH:     Yeah. He took the offer. He's going to, um, a startup,
[00:01:42]          one of those modular construction companies, I forget
[00:01:45]          the name. The base is about the same as ours but the
[00:01:48]          equity made the difference. His last day is April 24.

[00:01:52] SARA:    Two weeks. Ok. Who does the PIC conversation?

[00:01:55] ASH:     PIC already did the retention attempt, that was two
[00:01:58]          weeks ago. He made his decision before we even opened
[00:02:01]          the counter.

[00:02:02] SARA:    Ugh. Ok. Is there a replacement plan?

[00:02:04] ASH:     The Wynwood studio lead is redistributing his load
[00:02:07]          internally, and we're going to post externally for a
[00:02:10]          mid-level structural PA. I'll open the req Monday.

[00:02:12] SARA:    Ok. What's the theme from exits? Any pattern?

[00:02:15] ASH:     This one and the February one were both compensation
[00:02:18]          driven, not culture. The January one was the
[00:02:21]          assignment clarity thing. So, mixed bag.

[00:02:23] SARA:    Priya, the assignment preview pilot \u2014 where are we?

[00:02:25] PRIYA:   It ran for the first time in February. The competitions
[00:02:28]          studio did it, and the residential studio did a lighter
[00:02:31]          version of it. The feedback from staff was very
[00:02:34]          positive. Four-point-six out of five from competitions,
[00:02:37]          four-point-four from residential.

[00:02:39] SARA:    Good. Rollout?

[00:02:40] PRIYA:   Proposing we make it standard across all studios
[00:02:43]          starting the April cycle. So the studio leads spend
[00:02:46]          an hour a month showing people what's in the pipeline
[00:02:49]          and what assignments are coming up.

[00:02:51] SARA:    Yes. Let's do that. Write up a one-pager and send to
[00:02:54]          the partners for awareness, not approval.

[00:02:56] PRIYA:   Will do.

[00:02:57] SARA:    Ok. Benefits survey.

[00:02:59] ASH:     71% response rate, closed March 31. Headlines. Top
[00:03:03]          request by a wide margin is mental health coverage
[00:03:06]          expansion. 43% of respondents picked it. Number two is
[00:03:09]          student loan assistance, 27%. Number three commuter
[00:03:12]          transit, 22%. The parental leave announcement actually
[00:03:15]          showed up in open-text comments a lot, very positive.

[00:03:18] SARA:    Did the mental health request come with specifics?

[00:03:21] ASH:     Yeah. A lot of people asked for increased session
[00:03:24]          caps, and for in-network therapists in Brooklyn
[00:03:27]          specifically. We are not well covered in Brooklyn.

[00:03:30] SARA:    Ok. Can you put together a two-option memo for the
[00:03:33]          partners. Option A is we expand the session cap with
[00:03:36]          the current carrier, option B is we switch carriers.
[00:03:39]          Need costs.

[00:03:40] ASH:     By end of month?

[00:03:41] SARA:    Yes. Ok. L&D.

[00:03:43] PRIYA:   Manager training cohort 2 \u2014 11 participants \u2014
[00:03:46]          3 sessions done of 6, feedback is 4.6 average. Cohort
[00:03:50]          3 opens May 1, I'll send the signup Monday. Copilot
[00:03:53]          workshop on April 23 \u2014 86 registrations as of
[00:03:56]          today, we capped it at 100, so we're close to full.

[00:03:59] SARA:    Good. Ok risks. I want to put overtime on the Navy Yard
[00:04:02]          team on the partner report this month. It's up 12%
[00:04:05]          month over month. That's the kind of thing that turns
[00:04:08]          into a retention issue two months later.

[00:04:10] ASH:     Agree. I'll loop in the studio lead.

[00:04:12] SARA:    Ok. Anything I'm missing?

[00:04:14] MARCUS:  Just, uh, the April offer for the Director \u2014 do
[00:04:17]          we wait to hear from her before rewriting the JD, or
[00:04:20]          do both in parallel?

[00:04:21] SARA:    Parallel. Don't slow down.

[00:04:23] MARCUS:  Ok.

[00:04:24] SARA:    Ok thanks everyone.

[00:04:25]          [END OF RECORDING]
"""

MARKETING_TRANSCRIPT = """\
[00:00:00] JULIA:   Ok let's start. Marketing weekly, April 11. Tom, Wren,
[00:00:04]          Omar here. First thing. AIA Brooklyn deadline is Monday.
[00:00:08]          Where are we.

[00:00:09] OMAR:    Graphics for the submission are 80% done. I need two
[00:00:12]          things from Tom \u2014 the final project description
[00:00:14]          copy for 412 Nostrand, and uh, the confirmed
[00:00:17]          photographer credit line.

[00:00:18] TOM:     Project description I'll send you by EOD today. The
[00:04:20]          photographer credit \u2014 we agreed with Matthieu last
[00:00:24]          week. I have it in email. I'll forward it now.

[00:00:26] OMAR:    Ok. If I have both by Monday morning I'm fine. If not,
[00:00:29]          I'm stuck.

[00:00:30] JULIA:   Tom, EOD today not Monday.

[00:00:31] TOM:     Yep.

[00:00:32] JULIA:   Ok, Dezeen.

[00:00:33] TOM:     Dezeen. Big one. Their editor Amy wants a first-look
[00:00:37]          interview with Ricardo on the Wynwood project next
[00:00:40]          week. She wants it to tie into his Metropolis piece
[00:00:43]          last month \u2014 the whole 'porosity as urban social
[00:00:46]          infrastructure' angle. Carry that through.

[00:00:48] JULIA:   When next week.

[00:00:49] TOM:     Thursday afternoon their time, so Thursday morning
[00:00:52]          ours. An hour, video, recorded. We give them two
[00:00:55]          renders exclusive for 48 hours.

[00:00:57] JULIA:   I need to check Ricardo's calendar but I assume yes.
[00:01:00]          Omar, renders \u2014 Wynwood. Ready?

[00:01:02] OMAR:    Render set is ready. I need to strip out the confidential
[00:01:05]          anchor tenant logo from the lobby render though. 20
[00:01:08]          minutes of work.

[00:01:08] JULIA:   Do it.

[00:01:09] OMAR:    Yes.

[00:01:10] JULIA:   Ok. Tom lock Ricardo for Thursday and circle back to
[00:01:13]          Amy with a yes. Ok. Wren, social.

[00:01:17] WREN:    So the numbers. Last week LinkedIn impressions 142K,
[00:01:21]          instagram 38K, reach both up slightly. Top post was
[00:01:24]          the AIA Merit win announcement, 18K organic reach, 240
[00:01:27]          comments, which is \u2014 that's a really strong week
[00:01:30]          for us.

[00:01:31] JULIA:   Good. What about the Wynwood teaser campaign.

[00:01:33] WREN:    Teaser ran Wednesday and Friday. It's ok. It's not
[00:01:37]          bad. Instagram Reels engagement was weak though \u2014
[00:01:40]          1.2% which is like half of what we usually get.

[00:01:42] JULIA:   That matches what the Q1 report flagged. Ok, honestly?
[00:01:46]          Let's just stop with Reels. For the waterfront projects.
[00:01:49]          Shift that cadence to LinkedIn video.

[00:01:51] WREN:    Yes. I'll build out the next two weeks on LinkedIn
[00:01:54]          instead.

[00:01:55] JULIA:   Ok. Photoshoot. We've got a conflict.

[00:01:57] TOM:     Yeah. Matthieu is booked on the 15th which was our
[00:02:00]          day for the Navy Yard shoot. He's shooting for a
[00:02:03]          developer on the 16th and 17th. He said he can do
[00:02:06]          the 18th instead.

[00:02:07] JULIA:   The 18th is a Saturday.

[00:02:08] TOM:     Yeah. He's willing to.

[00:02:09] JULIA:   Cost?

[00:02:10] TOM:     Same. He's not charging weekend.

[00:02:11] JULIA:   Ok then yes. 18th. Wren, we'll need the crew scheduled.

[00:02:14] WREN:    Ok. I'll confirm with the site super for weekend access.

[00:02:17] JULIA:   Ok. Omar, newsletter.

[00:02:19] OMAR:    Draft is in your inbox. April issue. The cover story
[00:02:23]          is the AIA Merit win, second piece is the Van Alen
[00:02:26]          panel recap, third is a Q2 forward look.

[00:02:28] JULIA:   Open rate target?

[00:02:30] OMAR:    We reverted to the non-segmented list after Q1, like
[00:02:33]          we said we would. So I'm predicting 41-42%.

[00:02:35] JULIA:   Ok. Good. Send me the draft tonight, I'll review, goes
[00:02:38]          out Tuesday.

[00:02:39] OMAR:    Will do.

[00:02:40] JULIA:   Ok. Last thing. Q2 paid budget reallocation. Partner
[00:02:44]          approval came through. The $22K is moving from
[00:02:47]          Instagram Reels to LinkedIn video and the account-based
[00:02:50]          programmatic that we talked about for named developer
[00:02:53]          accounts. Wren I'll loop you into the planning meeting
[00:02:56]          with the agency Friday.

[00:02:57] WREN:    Ok.

[00:02:58] JULIA:   Ok anything else. Going once.

[00:03:00] TOM:     The Architectural Record follow-up piece they wanted
[00:03:03]          on the Navy Yard masterplan \u2014 they confirmed it's
[00:03:06]          going in the July issue, not June. FYI.

[00:03:08] JULIA:   Ok good to know. Anyone else?

[00:03:10] WREN:    No.

[00:03:11] OMAR:    No.

[00:03:12] JULIA:   Ok, 26 minutes, go.

[00:03:14]          [END OF RECORDING]
"""

EXEC_TRANSCRIPT = """\
[00:00:00] RICHARD: Alright. Leadership weekly. April 14. Richard, Jing,
[00:00:04]          Elena, Victor, Sara. Let's keep it tight today I have
[00:00:07]          a 10 o'clock. Elena, business.

[00:00:10] ELENA:   Ok so top three. 88 Richardson closed. TCO on the 27th,
[00:00:15]          handoff Thursday. Actuals came in 1.3% under GMP.
[00:00:18]          Ownership wants the next Navy Yard tower direct select
[00:00:21]          and we need a partner vote. I'm proposing we vote
[00:00:24]          April 22. I'll send a prep memo Friday.

[00:00:26] RICHARD: Yes on the 22nd. What's the fee structure going to be.

[00:00:29] ELENA:   Same structure as 88 Richardson, probably slightly
[00:00:32]          better given the direct-select. I'll have a range
[00:00:35]          before the vote.

[00:00:36] RICHARD: Ok. Second thing.

[00:00:38] ELENA:   Commercial backlog. June through August we are running
[00:00:41]          8% under plan. Wynwood is soaking up what's there. If
[00:00:45]          we don't land Boston Seaport or something equivalent
[00:00:48]          in the next 60 days we have a utilization problem in
[00:00:51]          the commercial studio.

[00:00:52] RICHARD: Boston Seaport is how likely.

[00:00:54] ELENA:   Honestly 35% at best.

[00:00:56] RICHARD: Not great. Jing, what's the commercial-studio appetite
[00:00:59]          for hospitality or institutional.

[00:01:01] JING:    Hospitality yes. Institutional only for the right
[00:01:04]          partner. I'd rather we do hospitality honestly, the
[00:01:07]          design opportunity is better.

[00:01:08] RICHARD: Ok. Victor, sandbox me the numbers. If commercial is
[00:01:11]          down 8% for the quarter what does it mean.

[00:01:13] VICTOR:  In dollar terms, about 380K of revenue over the three
[00:01:17]          months, if nothing else fills the gap. We can absorb
[00:01:20]          that within the year because residential is over-plan.
[00:01:23]          But if it extends into Q3 it gets harder.

[00:01:25] RICHARD: Ok. Elena, pursuit calendar \u2014 we need two more
[00:01:28]          commercial pursuits in the pipeline within 30 days.
[00:01:31]          What do we have.

[00:01:32] ELENA:   The Atlanta mixed-use RFP. 85K pursuit cost, 22% win
[00:01:35]          probability. That's on the partner vote list.

[00:01:37] RICHARD: Any others.

[00:01:38] ELENA:   Kansas City convention annex is RFQing. Lower fee but
[00:01:42]          steady work. And there's a San Diego biotech campus
[00:01:45]          that came inbound through Sara's network last week.

[00:01:47] SARA:    Yeah \u2014 biotech. It's the one Paul at Willow called
[00:01:50]          me about. I haven't screened it yet.

[00:01:51] RICHARD: Screen it this week. Ok third item Elena.

[00:01:54] ELENA:   The RFP for Queens City masterplan \u2014 we're on the
[00:01:57]          shortlist, final three out of 17. Interview April 16.
[00:02:01]          I'll lead with Jing, Ricardo, and Maya from the
[00:02:04]          residential side.

[00:02:05] RICHARD: Good. Jing, are you prepped.

[00:02:07] JING:    Prepped. We're doing a dry run Wednesday.

[00:02:09] RICHARD: Ok. Sara \u2014 people.

[00:02:11] SARA:    Big one first. The Wynwood structural senior resigned.
[00:02:15]          He took the modular startup offer. Last day April 24.
[00:02:18]          PIC tried to counter two weeks ago, decision was made.
[00:02:21]          Marcus is opening the replacement req Monday. Studio
[00:02:24]          lead is redistributing.

[00:02:25] RICHARD: Damnit. That's the second one in that bracket.

[00:02:27] SARA:    I know.

[00:02:28] RICHARD: Do the exits say anything.

[00:02:30] SARA:    These last two were compensation, not culture. Equity
[00:02:33]          at startups we can't match. I don't know how to solve
[00:02:36]          that structurally.

[00:02:37] RICHARD: Ok let's not solve it right now. But put it on the
[00:02:40]          board agenda for May. Long-term retention tools for
[00:02:43]          senior technical staff. What else.

[00:02:44] SARA:    Benefits survey done. Top ask is expanded mental health.
[00:02:47]          I'm bringing a two-option memo to partners by month
[00:02:50]          end. And parental leave update went out, reception
[00:02:53]          was very good.

[00:02:54] RICHARD: Good. Victor, anything financial beyond what Elena
[00:02:57]          flagged.

[00:02:58] VICTOR:  One thing. Insurance renewal. Q3 quote is coming in at
[00:03:01]          a 14% increase. I'm negotiating a two-year lock at
[00:03:04]          10%. I'll get a final by early May.

[00:03:06] RICHARD: Do it.

[00:03:07] VICTOR:  Yep.

[00:03:08] RICHARD: Board prep.

[00:03:09] ELENA:   Board meets April 22. Standard financial pack, plus the
[00:03:12]          Navy Yard direct-select vote, plus the Atlanta pursuit
[00:03:15]          approval, plus the marketing reallocation \u2014 which
[00:03:18]          the partners already approved, I'm just listing it so
[00:03:21]          the board sees it.

[00:03:22] RICHARD: What's the one-line state-of-the-firm message for the
[00:03:25]          briefing.

[00:03:26] ELENA:   Strong quarter driven by residential execution and
[00:03:29]          earned media. One material watch item is the Q2
[00:03:32]          commercial backlog.

[00:03:33] RICHARD: That's fine. Jing \u2014 anything design I should know.

[00:03:36] JING:    Two things quickly. The AIA Merit unlocked a direct
[00:03:39]          meeting with 88 Richardson's ownership board on the
[00:03:42]          next tower, Elena's tracking. And the Competitions
[00:03:45]          desk is burning hot, three big deadlines in April. I
[00:03:48]          want permission to loan one person in from Urban for
[00:03:51]          six weeks.

[00:03:52] RICHARD: Approved. Coordinate with Kyle. Ok I have to jump.
[00:03:55]          Good meeting. Elena send the prep memo by Friday.

[00:03:57] ELENA:   Will do.

[00:03:58]          [END OF RECORDING]
"""

OPS_TRANSCRIPT = """\
[00:00:01] SARA:    Ok ops standup April 12. Kyle, Priya, James. Let's go.
[00:00:05]          Kyle utilization.

[00:00:07] KYLE:    Last week firm-wide was 72.1%. Target is 68. So healthy
[00:00:11]          overall. But the breakdown matters. Residential 81,
[00:00:15]          Competitions 83, Commercial 60.

[00:00:18] SARA:    60 is the problem.

[00:00:19] KYLE:    60 is the problem. June-August forecast for commercial
[00:00:22]          puts us at 58. There's a real gap.

[00:00:24] SARA:    Ok I've been talking to Elena about this. For the ops
[00:00:27]          side what are our levers. One is short-term loan
[00:00:30]          from commercial to residential. Who would go.

[00:00:32] KYLE:    I could move up to three people if the studio leads
[00:00:35]          agree. Residential will absorb it. But commercial
[00:00:38]          loses bench for the Boston Seaport pursuit if we do
[00:00:41]          that now.

[00:00:42] SARA:    Right. Ok let's hold the loan decision until we know
[00:00:45]          on Seaport. What else.

[00:00:46] KYLE:    The other thing is Competitions \u2014 they're at 83%
[00:00:49]          and Jing asked Richard for a loan from Urban for six
[00:00:52]          weeks. That was approved Monday. One person coming
[00:00:55]          in tomorrow.

[00:00:56] SARA:    Good. Ok moving on. Priya \u2014 budget.

[00:00:58] PRIYA:   March actuals closed Monday. Direct labor came in 3.5%
[00:01:02]          over. Most of that is the competitions burn.
[00:01:05]          Consultants over by 9 \u2014 that's the Wynwood
[00:01:07]          tenant-reprogramming thing, pass-through, not our P&L.
[00:01:10]          Tech spend over by 22%, that's the Copilot licenses.
[00:01:13]          We expected that.

[00:01:14] SARA:    Net?

[00:01:15] PRIYA:   Net we came in 1.1% under plan on margin. Solid month.

[00:01:19] SARA:    Ok good. Invoicing.

[00:01:20] PRIYA:   So this is a thing. 412 Nostrand. The March invoice
[00:01:24]          didn't go out on time. The project manager, Maya, was
[00:01:27]          at a site walkthrough Friday and didn't approve the
[00:01:30]          time-entry cutoff batch. So we had to push the invoice
[00:01:33]          to this week. That's about 145K slipping one cycle.

[00:01:36] SARA:    How does that affect DSO.

[00:01:37] PRIYA:   If the client pays in their usual 30 days we still
[00:01:40]          close Q2 clean. But we've had this project manager
[00:01:43]          miss the cutoff twice now, first time in January.

[00:01:46] SARA:    Ok. James, add Maya on the time-entry compliance
[00:01:49]          dashboard we're sending to the partners this month.
[00:01:52]          And Priya \u2014 I'll talk to her PIC.

[00:01:54] PRIYA:   Ok.

[00:01:55] SARA:    James \u2014 time-entry compliance firm-wide.

[00:01:57] JAMES:   Firm-wide 93%. Down from 95 last month. The weekly
[00:02:01]          reminder emails restarted April 1 but they haven't
[00:02:04]          bitten yet. Biggest violators are on the Residential
[00:02:07]          side, ironic given their utilization.

[00:02:09] SARA:    Names?

[00:02:10] JAMES:   I'll send you a list. It's about 12 people who are
[00:02:13]          persistent late submitters.

[00:02:14] SARA:    Ok. I want that by end of day. And can you set up \u2014
[00:02:17]          if someone is 10 days late, the reminder should CC
[00:02:20]          their studio lead. Automated.

[00:02:22] JAMES:   I can do that in Deltek. I'll set it up this week.

[00:02:24] SARA:    Ok. Tools. Deltek phase 2.

[00:02:27] JAMES:   On track for April 30. Data migration tests ran this
[00:02:31]          weekend clean. The only risk is the custom dashboard
[00:02:34]          for Resource Management \u2014 the vendor said they'd
[00:02:37]          have it ready by Tuesday and they haven't shown yet.
[00:02:40]          If they don't deliver Tuesday I need to escalate.

[00:02:42] SARA:    Ok tell me Tuesday if we're escalating. Kyle,
[00:02:45]          rollover stuff.

[00:02:46] KYLE:    So. The senior structural architect on Wynwood \u2014
[00:02:49]          his replacement. PIC wants me to fill from outside,
[00:02:52]          but we might be able to do an internal move from
[00:02:55]          Navy Yard. I'm proposing we screen both paths in
[00:02:58]          parallel. I'll coordinate with Marcus.

[00:02:59] SARA:    Yes. And \u2014 the Navy Yard team overtime, that's
[00:03:02]          still running hot. I want the studio lead in here
[00:03:05]          next week for fifteen minutes. Can you schedule.

[00:03:07] KYLE:    Yep.

[00:03:08] SARA:    Ok. Anything else.

[00:03:10] PRIYA:   Q2 utilization target \u2014 confirmed 68% firm-wide?

[00:03:13] SARA:    Yes. Same as Q1.

[00:03:14] PRIYA:   Ok. Just wanted to confirm before I set the
[00:03:17]          forecasts.

[00:03:18] JAMES:   Copilot rollout \u2014 86 of 124 staff provisioned. The
[00:03:22]          workshop on April 23 covers the rest.

[00:03:24] SARA:    Ok. Good. 22 minutes. Done. Thanks everyone.

[00:03:27]          [END OF RECORDING]
"""


# --------------------------------------------------------------------------
# MAIN
# --------------------------------------------------------------------------

def main():
    print("Generating structured templates...")
    arch_template()
    hr_template()
    marketing_template()
    executive_template()
    operations_template()

    print("Generating meeting transcripts...")
    build_transcript(
        OUT_DIR / "architecture-source.pdf",
        "412 Nostrand Site Walkthrough",
        "Fri Apr 11, 2026 / 10:15 AM / Auto-transcribed via Teams Rooms / 5:02 length",
        ARCH_TRANSCRIPT,
    )
    build_transcript(
        OUT_DIR / "hr-source.pdf",
        "April HR Team Sync",
        "Thu Apr 10, 2026 / 2:00 PM / Auto-transcribed via Teams / 4:30 length",
        HR_TRANSCRIPT,
    )
    build_transcript(
        OUT_DIR / "marketing-source.pdf",
        "Marketing Weekly Sync",
        "Fri Apr 11, 2026 / 10:00 AM / Auto-transcribed via Zoom / 3:14 length",
        MARKETING_TRANSCRIPT,
    )
    build_transcript(
        OUT_DIR / "executive-source.pdf",
        "Leadership Weekly",
        "Mon Apr 14, 2026 / 8:30 AM / Auto-transcribed via Teams Rooms / 4:02 length",
        EXEC_TRANSCRIPT,
    )
    build_transcript(
        OUT_DIR / "operations-source.pdf",
        "Operations Standup",
        "Sat Apr 12, 2026 / 9:00 AM / Auto-transcribed via Zoom / 3:27 length",
        OPS_TRANSCRIPT,
    )

    print("\nGenerated files:")
    for p in sorted(OUT_DIR.glob("*.pdf")):
        size_kb = p.stat().st_size / 1024
        print(f"  {p.name}  ({size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
