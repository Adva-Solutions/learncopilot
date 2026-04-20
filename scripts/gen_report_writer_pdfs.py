"""
Report Writer lesson mock data — version 2 (source-grounded).

Each department gets two PDFs:
  <dept>-template.pdf   — a polished prior example of the target report
  <dept>-source.pdf     — the raw data the agent will be fed to produce a new one

Lineup:
  Architecture  CA Submittal Review Memo   <-  Submittal package (manufacturer data + shop-drawing notes)
  HR            New Hire Onboarding Memo   <-  Hiring-manager intake form + JD
  Marketing     ODA Newsletter             <-  Monthly project-activity log
  Executive     Travel Itinerary           <-  Booking-confirmation bundle + attendee list
  Operations    Contract Review Memo       <-  Contract excerpt with client redlines

Palette: ODA navy #0C1F3F, gold #C5973E. Templates use a branded header
band + serif body. Raw-data PDFs intentionally use different visual
languages per genre so they feel realistically "unprocessed" (form,
table, email stack, redline) rather than polished.
"""

from pathlib import Path
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    Preformatted, KeepTogether,
)

NAVY = HexColor("#0C1F3F")
GOLD = HexColor("#C5973E")
CREAM = HexColor("#FFFDF4")
MUTED = HexColor("#5A5A5A")
INK = HexColor("#1A1A2E")
RED = HexColor("#B00020")
BLUE = HexColor("#0B4C8C")

OUT_DIR = Path(__file__).resolve().parent.parent / "mock-data" / "report-writer"
OUT_DIR.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------------------------------
# STYLES
# --------------------------------------------------------------------------

def tpl_styles():
    s = getSampleStyleSheet()
    return {
        "brand":    ParagraphStyle("brand",    parent=s["Normal"], fontName="Helvetica-Bold", fontSize=9,  textColor=GOLD, leading=11, spaceAfter=2),
        "title":    ParagraphStyle("title",    parent=s["Title"],  fontName="Times-Bold",     fontSize=22, textColor=NAVY, leading=26, spaceAfter=6, alignment=TA_LEFT),
        "subtitle": ParagraphStyle("subtitle", parent=s["Normal"], fontName="Helvetica",      fontSize=10, textColor=MUTED, leading=13, spaceAfter=18),
        "h1":       ParagraphStyle("h1",       parent=s["Heading1"], fontName="Helvetica-Bold", fontSize=11, textColor=NAVY, leading=14, spaceBefore=14, spaceAfter=6),
        "h2":       ParagraphStyle("h2",       parent=s["Heading2"], fontName="Helvetica-Bold", fontSize=9.5, textColor=GOLD, leading=12, spaceBefore=10, spaceAfter=4),
        "body":     ParagraphStyle("body",     parent=s["Normal"], fontName="Times-Roman",    fontSize=10.5, textColor=black, leading=14, spaceAfter=6),
        "bullet":   ParagraphStyle("bullet",   parent=s["Normal"], fontName="Times-Roman",    fontSize=10.5, textColor=black, leading=14, leftIndent=14, bulletIndent=2, spaceAfter=3),
        "caption":  ParagraphStyle("caption",  parent=s["Normal"], fontName="Helvetica-Oblique", fontSize=8.5, textColor=MUTED, leading=11, spaceAfter=4),
    }


def form_styles():
    s = getSampleStyleSheet()
    return {
        "heading": ParagraphStyle("heading", parent=s["Normal"], fontName="Helvetica-Bold", fontSize=13, textColor=NAVY, leading=16, spaceAfter=4),
        "sub":     ParagraphStyle("sub",     parent=s["Normal"], fontName="Helvetica",      fontSize=9,  textColor=MUTED, leading=12, spaceAfter=14),
        "label":   ParagraphStyle("label",   parent=s["Normal"], fontName="Helvetica-Bold", fontSize=8.5,textColor=MUTED, leading=11, spaceAfter=1),
        "value":   ParagraphStyle("value",   parent=s["Normal"], fontName="Helvetica",      fontSize=10.5,textColor=INK,   leading=14, spaceAfter=6),
        "section": ParagraphStyle("section", parent=s["Normal"], fontName="Helvetica-Bold", fontSize=10.5, textColor=NAVY, leading=13, spaceBefore=12, spaceAfter=6),
        "free":    ParagraphStyle("free",    parent=s["Normal"], fontName="Helvetica",      fontSize=10,  textColor=INK,  leading=13, spaceAfter=5),
    }


def tbl_styles():
    """For Marketing raw-data activity log (Airtable-export feel)."""
    s = getSampleStyleSheet()
    return {
        "heading": ParagraphStyle("heading", parent=s["Normal"], fontName="Helvetica-Bold", fontSize=12, textColor=NAVY, leading=15, spaceAfter=2),
        "sub":     ParagraphStyle("sub",     parent=s["Normal"], fontName="Helvetica",      fontSize=9,  textColor=MUTED, leading=12, spaceAfter=14),
    }


def email_styles():
    s = getSampleStyleSheet()
    return {
        "heading": ParagraphStyle("heading", parent=s["Normal"], fontName="Helvetica-Bold", fontSize=13, textColor=NAVY, leading=16, spaceAfter=4),
        "sub":     ParagraphStyle("sub",     parent=s["Normal"], fontName="Helvetica",      fontSize=9,  textColor=MUTED, leading=12, spaceAfter=14),
        "divider": ParagraphStyle("divider", parent=s["Normal"], fontName="Helvetica-Bold", fontSize=9,  textColor=GOLD,  leading=12, spaceBefore=14, spaceAfter=6),
        "emailhdr":ParagraphStyle("emailhdr",parent=s["Normal"], fontName="Helvetica-Bold", fontSize=9.5,textColor=NAVY,  leading=12, spaceAfter=1),
        "emailmeta":ParagraphStyle("emailmeta",parent=s["Normal"], fontName="Helvetica",     fontSize=9,  textColor=MUTED, leading=12, spaceAfter=1),
        "emailbody":ParagraphStyle("emailbody",parent=s["Normal"], fontName="Helvetica",     fontSize=10, textColor=INK,   leading=13.5, spaceAfter=6),
    }


def redline_styles():
    s = getSampleStyleSheet()
    return {
        "heading": ParagraphStyle("heading", parent=s["Normal"], fontName="Helvetica-Bold", fontSize=13, textColor=NAVY, leading=16, spaceAfter=4),
        "sub":     ParagraphStyle("sub",     parent=s["Normal"], fontName="Helvetica",      fontSize=9,  textColor=MUTED, leading=12, spaceAfter=14),
        "clausenum": ParagraphStyle("clausenum", parent=s["Normal"], fontName="Helvetica-Bold", fontSize=10, textColor=NAVY, leading=13, spaceBefore=12, spaceAfter=4),
        "clause":  ParagraphStyle("clause",  parent=s["Normal"], fontName="Times-Roman",    fontSize=10.5, textColor=INK, leading=14, spaceAfter=6),
        "comment": ParagraphStyle("comment", parent=s["Normal"], fontName="Helvetica-Oblique", fontSize=9, textColor=MUTED, leading=12, spaceAfter=6, leftIndent=10, borderPadding=(3,6,3,6)),
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


def build_branded(path, brand_right, story):
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


def build_plain(path, story):
    doc = SimpleDocTemplate(
        str(path), pagesize=LETTER,
        leftMargin=0.75 * inch, rightMargin=0.75 * inch,
        topMargin=0.8 * inch, bottomMargin=0.7 * inch,
    )
    doc.build(story)


# ==========================================================================
# TEMPLATE 1 — ARCHITECTURE: CA Submittal Review Memo (past, closed)
# ==========================================================================

def arch_template():
    S = tpl_styles()
    story = []
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph("CA SUBMITTAL REVIEW MEMO", S["brand"]))
    story.append(Paragraph("Submittal 08-4413.002  &mdash;  Exterior Glazing", S["title"]))
    story.append(Paragraph("88 Richardson Street &middot; Williamsburg, Brooklyn &middot; Reviewed Feb 14, 2026 by D. Lowery, Technical Director", S["subtitle"]))

    story.append(Paragraph("Submittal Identification", S["h1"]))
    story.append(make_table([
        ["Field", "Value"],
        ["Project", "88 Richardson Street, Williamsburg"],
        ["Submittal No.", "08-4413.002 (re-submission of 08-4413.001)"],
        ["Spec section", "08 4413 &mdash; Aluminum-Framed Storefronts"],
        ["Package title", "Exterior glazing &mdash; system shop drawings &amp; product data"],
        ["Submitted by", "Pinnacle Curtainwall (GC: Domain Builders)"],
        ["Date received", "Feb 7, 2026"],
        ["Response due", "Feb 21, 2026 (14 days per spec 01 3300)"],
        ["Disposition", "APPROVED AS NOTED (3 items to clarify at shop-drawing level)"],
    ], [1.6 * inch, 4.4 * inch]))

    story.append(Paragraph("Executive Summary", S["h1"]))
    story.append(Paragraph(
        "The re-submission resolves the two fatal flaws from 001 (mullion depth and "
        "thermal-break spec). The system as now drawn meets the Contract Documents "
        "with three notations that do not require a further re-submission but must "
        "be reflected in shop tickets. Pinnacle may proceed to fabrication after "
        "issuing addendum shop drawings covering items 2 and 3 below. Item 1 is "
        "informational only.",
        S["body"]))

    story.append(Paragraph("Review Comments", S["h1"]))

    story.append(Paragraph("1. Glass make-up &mdash; INFORMATIONAL", S["h2"]))
    story.append(Paragraph(
        "Submitted IGU (1\"): 1/4\" clear LoE-366 &middot; 1/2\" argon &middot; 1/4\" clear. "
        "Matches spec 08 8000 Article 2.02.A and the performance schedule (U-0.29 / "
        "SHGC 0.27). No action required. Noted for the record.",
        S["body"]))

    story.append(Paragraph("2. Mullion-to-slab anchorage &mdash; APPROVED AS NOTED", S["h2"]))
    story.append(Paragraph(
        "Anchor detail 3/A-801 shows the revised 5/8\" HILTI KH-EZ anchor at 16\" o.c., "
        "which matches the structural calculation set stamped by WSP on Jan 24, 2026. "
        "However, the anchor <b>edge distance</b> on shop drawing S-12 is shown as "
        "2-1/2\" where the ICC-ES ESR-3027 minimum for this anchor is 2-3/4\". Revise "
        "anchor location to 2-3/4\" minimum edge distance and reflect on all "
        "subsequent shop tickets. Does not require re-submission.",
        S["body"]))

    story.append(Paragraph("3. Spandrel insulation &mdash; APPROVED AS NOTED", S["h2"]))
    story.append(Paragraph(
        "Spandrel zone shown with 3\" mineral wool plus interior GWB backup. "
        "The spec (07 2100 Article 2.03.B) calls for <b>continuous</b> mineral wool "
        "with sealed joints at every mullion. The shop drawing shows "
        "field-butted joints without the required acoustical sealant bead at the "
        "mullion face. Add the sealant bead to shop tickets.",
        S["body"]))

    story.append(Paragraph("4. Pressure-plate finish &mdash; NO EXCEPTION TAKEN", S["h2"]))
    story.append(Paragraph(
        "Submitted Class 1 anodized finish, AA-M12C22A44, matches ODA's approved "
        "sample 88RS-EXT-04 dated Jan 9, 2026. Confirm mockup panels reflect the "
        "same lot number.",
        S["body"]))

    story.append(PageBreak())

    story.append(Paragraph("Cross-Reference Against Contract Documents", S["h1"]))
    story.append(make_table([
        ["CD reference", "Submittal check", "Status"],
        ["Spec 08 4413  2.01.C  frame depth", "5\" verified on shop sheet S-03", "OK"],
        ["Spec 08 4413  2.02.A  thermal break", "28 mm polyamide confirmed", "OK"],
        ["Spec 08 8000  2.02.A  IGU make-up", "1\" unit, LoE-366 per schedule", "OK"],
        ["Spec 07 2100  2.03.B  insulation", "Field-butted, sealant missing", "Address in ticket"],
        ["ESR-3027      anchor EDN", "Shown as 2-1/2\", reqd 2-3/4\"", "Address in ticket"],
        ["A-801  anchor pattern", "16\" o.c. matches WSP calc", "OK"],
        ["A-802  terracotta tie-in detail", "Matches sample 88RS-EXT-07", "OK"],
    ], [2.3 * inch, 2.5 * inch, 1.2 * inch]))

    story.append(Paragraph("Action Required &mdash; Contractor", S["h1"]))
    story.append(Paragraph(
        "Pinnacle Curtainwall to issue updated shop tickets reflecting notations 2 "
        "and 3 above. Tickets may be distributed directly to fabrication; no formal "
        "re-submission to ODA is required provided the PM (M. Okonkwo) receives a "
        "copy for the project record. Item 1 is informational; item 4 is closed.",
        S["body"]))

    story.append(Paragraph("Distribution", S["h1"]))
    story.append(Paragraph(
        "M. Okonkwo (PM) &middot; D. Reyes (WSP Structural) &middot; A. Hoang (Cosentini) "
        "&middot; Domain Builders (GC) &middot; Pinnacle Curtainwall",
        S["body"]))

    story.append(Paragraph("Reviewed and signed:  D. Lowery, Technical Director  &middot;  ODA Architecture  &middot;  Feb 14, 2026", S["caption"]))

    build_branded(OUT_DIR / "architecture-template.pdf", "CA Submittal Review Memo", story)


# ==========================================================================
# SOURCE 1 — ARCHITECTURE: Submittal package (contractor transmittal + data)
# ==========================================================================

def arch_source():
    S = tpl_styles()
    story = []
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph("SUBMITTAL &mdash; CONTRACTOR TRANSMITTAL", S["brand"]))
    story.append(Paragraph("Submittal 05-1200.001  &mdash;  Structural Steel", S["title"]))
    story.append(Paragraph("412 Nostrand Avenue &middot; Bed-Stuy, Brooklyn &middot; Transmitted Apr 10, 2026 by Falcone Ironworks via Procore", S["subtitle"]))

    story.append(Paragraph("Transmittal Cover", S["h1"]))
    story.append(make_table([
        ["Field", "Value"],
        ["Project", "412 Nostrand Avenue"],
        ["To", "ODA Architecture, Attn: PM"],
        ["From", "Falcone Ironworks, Inc. (subcontractor to Meridian Construction)"],
        ["Submittal #", "05-1200.001"],
        ["Spec section referenced", "05 1200 &mdash; Structural Steel Framing"],
        ["Package contents", "Shop drawings (42 sheets) + product data (4 sheets) + mill certs (6 pages)"],
        ["Submission type", "First submission"],
        ["Date needed by", "Apr 24, 2026 (per CM schedule, steel erection begins May 4)"],
        ["Contractor comments", "See \u201cNotes from Falcone\u201d below."],
    ], [1.8 * inch, 4.2 * inch]))

    story.append(Paragraph("Notes from Falcone (verbatim from transmittal)", S["h1"]))
    story.append(Paragraph(
        "\u201cPlease see attached the first submission for the structural steel at 412 "
        "Nostrand. A few items for the design team's attention:",
        S["body"]))
    story.append(Paragraph(
        "&bull; We have substituted the ASTM A992 W-shapes called for in the spec with "
        "ASTM A913 Grade 65 on the transfer beams at grid E, per the value "
        "engineering request in RFI-019. All other W-shapes remain A992.",
        S["bullet"]))
    story.append(Paragraph(
        "&bull; Connection details at grid E-7 (sheets 05-12 through 05-17) reflect the "
        "revised rebar layout per WSP's Mar 28 sketch. Please confirm coordination "
        "with the façade bracket embed at this location.",
        S["bullet"]))
    story.append(Paragraph(
        "&bull; Mill certs attached cover the first two fabrication runs. Remaining runs "
        "will be submitted as delivered.",
        S["bullet"]))
    story.append(Paragraph(
        "&bull; We have flagged three open coordination items in the Revit model that we "
        "would like to discuss: (1) beam pocket dimensions at the elevator core; "
        "(2) HSS column base-plate thickness at grid B; (3) the moment-frame "
        "connection at the penthouse.",
        S["bullet"]))
    story.append(Paragraph(
        "Please advise on return time. We're lined up for fab starting May 2.\u201d "
        "&mdash; P. Falcone, Project Manager",
        S["body"]))

    story.append(PageBreak())

    story.append(Paragraph("Product Data Summary (extracted from manufacturer sheets)", S["h1"]))
    story.append(make_table([
        ["Item", "Submitted", "Reference"],
        ["W-shapes, typ", "ASTM A992 / Fy 50 ksi", "ArcelorMittal mill cert MC-0421"],
        ["W-shapes, transfer beams at grid E", "ASTM A913 Gr 65 / Fy 65 ksi (substitution)", "Nucor-Yamato mill cert NY-2203"],
        ["HSS columns", "ASTM A500 Gr C / Fy 50 ksi", "Atlas Tube data sheet AT-22"],
        ["Bolts, high-strength", "ASTM F3125 Gr A325, Type 1", "Nucor Fastener product data"],
        ["Welding electrodes", "AWS A5.1 E70XX", "Lincoln Electric data sheet"],
        ["Shear studs", "3/4\" dia x 4-3/4\" / Nelson type B", "Nelson Stud product data"],
        ["Fireproofing note", "Intumescent paint per spec 07 8100 (separate submittal)", "N/A here"],
    ], [2.0 * inch, 2.6 * inch, 1.4 * inch]))

    story.append(Paragraph("Shop Drawing Index (42 sheets total)", S["h1"]))
    story.append(make_table([
        ["Range", "Content"],
        ["S-01 to S-05", "General notes, column schedule, bolt schedule"],
        ["S-06 to S-12", "Foundation-to-steel interface details"],
        ["S-13 to S-24", "Typical floor framing, levels 1-14"],
        ["S-25 to S-31", "Transfer framing at grids E and F (levels 2-4)"],
        ["S-32 to S-36", "Mechanical-floor framing (level 14)"],
        ["S-37 to S-40", "Roof framing incl. screen wall"],
        ["S-41 to S-42", "Connection details &mdash; moment frames, base plates"],
    ], [1.4 * inch, 4.6 * inch]))

    story.append(Paragraph("Outstanding RFIs referenced in this submittal", S["h1"]))
    story.append(make_table([
        ["RFI #", "Subject", "Status"],
        ["RFI-019", "A913 Gr 65 substitution at transfer beams", "Approved 3/31"],
        ["RFI-022", "Rebar layout revision at grid E-7 top mat", "Approved 4/1"],
        ["RFI-027", "Moment connection at penthouse &mdash; W14 vs W16", "Open (this submittal may address)"],
        ["RFI-029", "Base-plate thickness at HSS columns grid B", "Open"],
    ], [0.9 * inch, 3.7 * inch, 1.4 * inch]))

    story.append(Paragraph("End of contractor transmittal. Full shop-drawing set (42 sheets) and mill certificates attached in Procore package ID 412N-SUB-051.", S["caption"]))

    build_branded(OUT_DIR / "architecture-source.pdf", "Submittal Package", story)


# ==========================================================================
# TEMPLATE 2 — HR: New Hire Onboarding Memo (past)
# ==========================================================================

def hr_template():
    S = tpl_styles()
    story = []
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph("NEW HIRE ONBOARDING MEMO", S["brand"]))
    story.append(Paragraph("Priya Desai  &mdash;  Senior Project Architect", S["title"]))
    story.append(Paragraph("Start date: March 2, 2026 &middot; Residential Studio &middot; Hiring manager: M. Okonkwo &middot; Prepared Feb 22, 2026 by Sara Levine, People Team", S["subtitle"]))

    story.append(Paragraph("Welcome Context", S["h1"]))
    story.append(Paragraph(
        "Priya joins the Residential Studio from SOM New York, where she spent six "
        "years leading waterfront multi-family work. At ODA she will lead the "
        "day-to-day design coordination on 412 Nostrand (currently DD) and take a "
        "supporting role on the follow-on Navy Yard tower pending the partner vote. "
        "Her onboarding plan is calibrated for a lateral senior hire: front-loaded "
        "project context and relationships, lighter on generic process training.",
        S["body"]))

    story.append(Paragraph("Week 1 &mdash; Land and Orient", S["h1"]))
    for line in [
        "<b>Day 1 (Mon 3/2)</b> &mdash; IT setup + badge (9:30, with ASH); kickoff breakfast with studio (10:30); 1:1 with Maya (11:30); desk setup.",
        "<b>Day 2</b> &mdash; Design-review shadow on 412 Nostrand (2pm); 1:1 with the PA on Nostrand to absorb open RFIs and the façade history.",
        "<b>Day 3</b> &mdash; 1:1 with Eran (Principal) &mdash; context on firm direction; lunch with Residential studio leads.",
        "<b>Day 4</b> &mdash; Walk 88 Richardson with the PM (closeout site visit) to see ODA detail language executed.",
        "<b>Day 5</b> &mdash; 1:1 with People Team (this document review); open-office hours.",
        "<b>Onboarding buddy:</b> D. Chen (Senior PA, Williamsburg).",
        "<b>IT &amp; software:</b> Revit 2026, Bluebeam, Rhino, Outlook, Teams, Copilot M365 (license provisioned 2/28).",
    ]:
        story.append(Paragraph(f"&bull; {line}", S["bullet"]))

    story.append(Paragraph("30-Day Plan &mdash; Embed into 412 Nostrand", S["h1"]))
    for line in [
        "Own the weekly coordination meeting with WSP (structural) and Cosentini (MEP). M. Okonkwo will sit in for weeks 1&ndash;2 then step out.",
        "Review the current DD drawing set; surface three areas of concern to Maya by end of week 3.",
        "Begin the drawing-set reorganization in Revit (branching into CD families) &mdash; target milestone April 1.",
        "Attend one consultant walkthrough and one client meeting to be introduced on the record.",
        "<b>Success criteria at 30 days:</b> Priya is running the weekly consultant sync without the PM present, and has written at least one RFI response in her own name.",
    ]:
        story.append(Paragraph(f"&bull; {line}", S["bullet"]))

    story.append(Paragraph("60-Day Plan &mdash; Broaden and Contribute", S["h1"]))
    for line in [
        "Lead one DD-to-CD transition decision end-to-end (scope TBD with Maya, likely the façade-bracket resolution tied to the rebar clash).",
        "Present to the Residential Studio at the April 17 design review on one detail-design thread of her choosing (established ODA practice: new seniors present within 60 days).",
        "Begin shadowing the Navy Yard pursuit team (observer status, 1-2 hrs/wk).",
        "<b>Success criteria at 60 days:</b> Priya's design-review presentation lands cleanly; feedback from peers is positive; Maya has progressively offloaded 40&ndash;50% of 412 Nostrand day-to-day decisions.",
    ]:
        story.append(Paragraph(f"&bull; {line}", S["bullet"]))

    story.append(PageBreak())

    story.append(Paragraph("90-Day Plan &mdash; Full Senior PA Operating Mode", S["h1"]))
    for line in [
        "Own the CD package for 412 Nostrand end-to-end as Senior PA.",
        "Take a named seat on the Navy Yard pursuit (if awarded at the April 22 partner vote) with a defined scope.",
        "First formal performance conversation with Maya and the People Team.",
        "<b>Success criteria at 90 days:</b> Fully independent on 412 Nostrand CDs; one Navy Yard pursuit contribution visible to partners; one external-facing moment (client meeting or consultant coordination) she has run solo.",
    ]:
        story.append(Paragraph(f"&bull; {line}", S["bullet"]))

    story.append(Paragraph("Risk &amp; Adjustment Triggers", S["h1"]))
    for line in [
        "If the 412 Nostrand DD slides or the rebar-clash resolution is still open at day 30, Maya retains lead on the Tuesday consultant sync.",
        "If the Navy Yard vote slips past April 22, the 60-day pursuit shadow shifts to the Boston Seaport pursuit instead.",
        "If Priya raises early-warning flags about scope or tempo, People Team schedules a check-in within 48 hours &mdash; Sara Levine is the escalation path.",
    ]:
        story.append(Paragraph(f"&bull; {line}", S["bullet"]))

    story.append(Paragraph("Check-in Cadence", S["h1"]))
    story.append(make_table([
        ["Week", "With", "Format"],
        ["Week 1 Friday", "Sara Levine (People)", "30 min  &mdash;  how's the landing"],
        ["Week 2 Tuesday", "M. Okonkwo (PM)", "60 min  &mdash;  drawing-set orientation"],
        ["Day 30", "Maya + Sara", "60 min  &mdash;  first formal checkpoint"],
        ["Day 60", "Maya + Studio Lead", "60 min  &mdash;  design-review debrief"],
        ["Day 90", "Maya + Sara + Studio Lead", "90 min  &mdash;  formal performance conversation"],
    ], [1.3 * inch, 2.2 * inch, 2.5 * inch]))

    story.append(Paragraph("Distribution:  Priya Desai (new hire), M. Okonkwo (PM), Residential Studio Lead, Sara Levine (People).", S["caption"]))

    build_branded(OUT_DIR / "hr-template.pdf", "New Hire Onboarding Memo", story)


# ==========================================================================
# SOURCE 2 — HR: Hiring-manager intake form + JD (raw)
# ==========================================================================

def hr_source():
    F = form_styles()
    story = []
    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph("HIRING MANAGER INTAKE FORM", F["heading"]))
    story.append(Paragraph("Submitted to People Team via SharePoint form &middot; April 9, 2026", F["sub"]))

    # Field pairs
    def kv(label, value):
        story.append(Paragraph(label, F["label"]))
        story.append(Paragraph(value, F["value"]))

    kv("Position title", "Director of Sustainability &amp; Climate Strategy")
    kv("Department / Studio", "Firm-wide (reports to Managing Director, dotted line to Design Principal)")
    kv("Hiring manager", "Elena Santiago (MD)")
    kv("Target start date", "May 18, 2026 (flexible &mdash; within 6 weeks of offer)")
    kv("Level / Band", "Director &mdash; equivalent to Senior Associate")
    kv("Seat location", "NYC HQ, Dumbo (hybrid 3 days on-site)")
    kv("Direct reports (now)", "None. Will hire a Senior Sustainability Analyst in Q3 (req to be opened after Director lands).")
    kv("Status", "OPEN &mdash; previously req'd as \"Director of Sustainability\" (closed, being re-scoped broader per March HR team sync)")

    story.append(Paragraph("Projects this role will touch on arrival", F["section"]))
    kv("Primary",
       "88 Richardson closeout (LEED Gold cert pending); Navy Yard Bldg 284 (pursuit &rarr; SD). "
       "Wynwood Tower (CD phase) &mdash; climate-resilience review at owner's request.")
    kv("Secondary",
       "412 Nostrand (DD &rarr; CD); Queens City Masterplan if awarded; firm-wide adaptive-reuse "
       "inquiries (currently 7 open inbound conversations).")
    kv("Longer-horizon",
       "Firm's first embodied-carbon baseline &mdash; target Q4 2026.")

    story.append(Paragraph("Tech stack expected", F["section"]))
    kv("Required fluency", "Tally, One Click LCA, or EC3 (embodied carbon); Revit (read + comment); Excel advanced.")
    kv("Nice to have", "Python / basic scripting; experience with LEED v5 draft; familiarity with PHIUS.")
    kv("Ecosystem",
       "M365 (Outlook/Teams/SharePoint/Copilot); Bluebeam for drawing markup; Asana for task tracking. "
       "We are NOT on Slack.")

    story.append(Paragraph("What \u201cgreat\u201d looks like at 90 days", F["section"]))
    kv("Deliverable 1",
       "Embodied-carbon baseline methodology approved by partners &mdash; a short memo and a "
       "working spreadsheet model, applied retroactively to 2 completed projects.")
    kv("Deliverable 2",
       "Climate-resilience review of Wynwood tenant reprogramming, with one recommendation "
       "landed in the CD set.")
    kv("Deliverable 3",
       "Position paper on ODA's sustainability posture for client-facing use &mdash; target the "
       "Van Alen co-program in Q3.")

    story.append(PageBreak())

    story.append(Paragraph("Culture / team fit notes (HM verbatim)", F["section"]))
    story.append(Paragraph(
        "\u201cThis person has to be comfortable being the only sustainability voice in a room "
        "of very opinionated designers. We need someone who frames decisions as trade-offs, "
        "not as moralism. Able to push back on Eran when the design hero move has a carbon "
        "cost, but able to do it with a path forward, not a wall. Someone who has navigated "
        "a firm transition on embodied carbon is ideal &mdash; we are at Year Zero on this.\u201d",
        F["free"]))

    story.append(Paragraph("Open questions for People Team", F["section"]))
    for line in [
        "Comp band confirmed? Last discussion was $185&ndash;215K base. Please confirm before first recruiter screen.",
        "Title: can we post as \"Director of Sustainability &amp; Climate Strategy\" or does Finance want the shorter form? Asked for clarification 4/7, no reply.",
        "Relocation budget if the right candidate is in Boston/DC? Historically we have paid up to $25K; confirm this year's ceiling.",
        "Can we run this search alongside a supporting Senior-level req simultaneously? Would move faster if both pipelines are active.",
    ]:
        story.append(Paragraph(f"\u2022  {line}", F["free"]))

    story.append(Paragraph("Onboarding-specific asks", F["section"]))
    for line in [
        "Please schedule Day-1 1:1 with Eran within the first 72 hours (not typical for lateral hires, but this role needs the Principal stamp to be effective).",
        "Please arrange a site walk at 88 Richardson in the first 10 days &mdash; the closeout is the fastest way to absorb ODA's detail language.",
        "Flag for the onboarding buddy pairing: pair with a designer, not another MD-track hire. Someone with strong design intuition who can counter-balance the technical frame of the role.",
        "This person will likely be nervous about being the only sustainability voice &mdash; please lean in on early wins at 30 days, not 90.",
    ]:
        story.append(Paragraph(f"\u2022  {line}", F["free"]))

    story.append(Paragraph("Attachments referenced", F["section"]))
    story.append(Paragraph(
        "(A) Job description &mdash; final version v3 approved by Elena Mar 24. (B) Comp "
        "benchmark pulled by Marcus Mar 25 &mdash; saved in /People/Open Reqs/DIR-SUS-2026.",
        F["free"]))

    # --- embedded JD summary ---
    story.append(Paragraph("&mdash;&mdash;&mdash; Attached: Job Description (excerpt) &mdash;&mdash;&mdash;", F["section"]))
    story.append(Paragraph("Director of Sustainability &amp; Climate Strategy &mdash; ODA Architecture", F["heading"]))
    story.append(Paragraph(
        "<b>Role summary.</b> Lead ODA's sustainability and climate-strategy practice firm-wide. "
        "Build our embodied-carbon baseline from first principles. Embed climate resilience into "
        "design reviews across all studios. Represent ODA externally on sustainability matters "
        "&mdash; publications, panels, client conversations. Collaborate with partners, studios, "
        "and external consultants.",
        F["free"]))
    story.append(Paragraph(
        "<b>Key responsibilities.</b> Methodology ownership for embodied-carbon measurement. "
        "Climate-resilience review integration across active projects. External-facing thought "
        "leadership (target: 3 industry moments per year). Coordinate with our Engineering "
        "consultants (WSP, Cosentini) on MEP + structural sustainability decisions. Build the "
        "second-hire pipeline (Senior Sustainability Analyst) to land in Q3.",
        F["free"]))
    story.append(Paragraph(
        "<b>Qualifications.</b> 10+ years in practice. Fluent with Tally, EC3, or equivalent "
        "LCA tooling. LEED AP BD+C minimum; PHIUS or equivalent a plus. Demonstrated track "
        "record of shifting a firm's sustainability posture. Strong writer. Comfortable in a "
        "design-forward culture.",
        F["free"]))

    build_plain(OUT_DIR / "hr-source.pdf", story)


# ==========================================================================
# TEMPLATE 3 — MARKETING: ODA Newsletter (past issue)
# ==========================================================================

def marketing_template():
    S = tpl_styles()
    story = []
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph("ODA MONTHLY  &mdash;  MARCH 2026", S["brand"]))
    story.append(Paragraph("The Richardson Issue", S["title"]))
    story.append(Paragraph("Subject line: \u201cSubstantial completion on the Brooklyn waterfront &mdash; plus what else we're up to.\u201d &middot; Open-target 42% &middot; Audience: clients, peers, press", S["subtitle"]))

    story.append(Paragraph("Lead Story &mdash; 88 Richardson Reaches Completion", S["h1"]))
    story.append(Paragraph(
        "After three years on the Williamsburg waterfront, 88 Richardson Street "
        "received its Certificate of Occupancy on April 2 &mdash; two weeks ahead "
        "of the revised schedule and 1.3% under the revised GMP. The 24-story "
        "mixed-use building delivers 212 rental residences, 8,400 square feet of "
        "ground-floor retail, and a 14th-floor amenity terrace that steps "
        "continuously onto the rooftop of the neighbor at 84 Richardson &mdash; a "
        "small urban gift we negotiated into the easement during design development.",
        S["body"]))
    story.append(Paragraph(
        "The ground plane is the move we care about most. A 22-foot cantilevered "
        "soffit creates a covered public passage that extends the adjacent pocket "
        "park through the building and out the other side. It is the clearest "
        "built expression to date of what we have been calling "
        "<i>porosity for prosperity</i>: urban form that invites the city through, "
        "rather than turning its back. First tenant move-ins begin May 1. "
        "Photography by Matthieu Salvaing.",
        S["body"]))
    story.append(Paragraph("Image: 88-Richardson-hero-01.jpg &middot; Credit: Matthieu Salvaing", S["caption"]))

    story.append(Paragraph("Studio Updates", S["h1"]))

    story.append(Paragraph("AIA Merit &mdash; Multi-Family", S["h2"]))
    story.append(Paragraph(
        "88 Richardson received the AIA NY Design Award, Merit, in the Multi-Family "
        "category this month. The jury cited the ground-plane porosity and the "
        "envelope's terracotta-chip precast as key moves. Two further submissions "
        "(AIA Brooklyn, NYCxDESIGN) are under review.",
        S["body"]))

    story.append(Paragraph("412 Nostrand &mdash; DD underway", S["h2"]))
    story.append(Paragraph(
        "Design Development is well underway on a 16-story mixed-use building in "
        "Bed-Stuy. A 22-foot façade offset at the second floor reads the historic "
        "setback line of the block without copying it. Groundbreaking targeted Q3.",
        S["body"]))

    story.append(Paragraph("Queens City Masterplan &mdash; final three", S["h2"]))
    story.append(Paragraph(
        "ODA has been shortlisted to the final three of seventeen firms for the "
        "Queens City Masterplan RFP. Interviews are scheduled for April 16 with a "
        "decision expected in early May.",
        S["body"]))

    story.append(Paragraph("Recent Press", S["h1"]))
    story.append(make_table([
        ["Publication", "Piece", "Date"],
        ["Dezeen", "Feature &mdash; \u201c88 Richardson and the Brooklyn waterfront\u201d", "Mar 22"],
        ["Architectural Record", "Cover story &mdash; Navy Yard masterplan", "Mar issue"],
        ["Metropolis", "Interview with Eran on \u201cporosity as urban social infrastructure\u201d", "Mar 18"],
        ["NY Times Real Estate", "Short &mdash; 88 Richardson openings", "Mar 24"],
    ], [1.8 * inch, 3.4 * inch, 1.0 * inch]))

    story.append(PageBreak())

    story.append(Paragraph("Upcoming", S["h1"]))
    for line in [
        "<b>Apr 16</b> &mdash; Queens City Masterplan interview.",
        "<b>Apr 22</b> &mdash; Partner vote on Navy Yard Bldg 284 direct-select.",
        "<b>Apr 23</b> &mdash; Firm-wide Copilot workshop (86 registrations).",
        "<b>May 1</b> &mdash; 88 Richardson first tenant move-ins.",
        "<b>Q3</b> &mdash; Van Alen co-program: 412 Nostrand seed conversation.",
    ]:
        story.append(Paragraph(f"&bull; {line}", S["bullet"]))

    story.append(Paragraph("Philosophy Note", S["h1"]))
    story.append(Paragraph(
        "A reader wrote in last month asking whether \u201cporosity\u201d is a political "
        "commitment or a design tactic. Our answer: neither. It is a standard we "
        "hold ourselves to &mdash; the test we run at every ground-floor review. "
        "Does this building give back to the street, or take from it? At 88 "
        "Richardson the 22-foot soffit gives back. At 412 Nostrand the setback at "
        "level two will give back. If a project cannot pass that test, we do not "
        "believe we have finished designing it yet.",
        S["body"]))

    story.append(Paragraph("Credits", S["h1"]))
    story.append(Paragraph(
        "Editor: Julia Tran. Design: Omar Haidari. Copy: Eran Chen &amp; Tom Mercer. "
        "Photography: Matthieu Salvaing (88 Richardson hero and ground-plane); "
        "ODA archive (412 Nostrand render, Queens City diagram, Navy Yard aerial).",
        S["body"]))

    story.append(Paragraph("This issue distributed to 3,104 subscribers. Unsubscribe or manage preferences via the footer link.", S["caption"]))

    build_branded(OUT_DIR / "marketing-template.pdf", "Monthly Newsletter", story)


# ==========================================================================
# SOURCE 3 — MARKETING: Project-activity log for April (raw)
# ==========================================================================

def marketing_source():
    T = tbl_styles()
    story = []
    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph("PROJECT ACTIVITY LOG  &mdash;  APRIL 2026", T["heading"]))
    story.append(Paragraph("Exported from Airtable \u201cMarketing Activity\u201d base &middot; Pulled by Julia Tran at 2026-04-19 17:04 EDT &middot; 31 rows", T["sub"]))

    rows = [
        ["Date", "Project / Item", "Category", "Description", "Credits / Notes", "Image refs"],
        ["Apr 1",  "88 Richardson", "Milestone",    "TCO issued.",                                               "PM: M. Okonkwo",                         "88R-HERO-01.jpg"],
        ["Apr 2",  "88 Richardson", "Press",        "Dezeen feature published",                                  "Editor: A. Phan; hero render + 3 photos",  "88R-HERO-01.jpg, 88R-LOBBY-04.jpg"],
        ["Apr 3",  "Navy Yard 284", "Pursuit",      "Letter of interest received from Domain Holdings",          "TBC with partners re: vote path",          "(none)"],
        ["Apr 4",  "412 Nostrand",  "Milestone",    "DD review with client; client signed off",                  "PA: D. Chen; PM: Maya",                    "412N-DD-SET-01.pdf thumb"],
        ["Apr 5",  "AIA Brooklyn",  "Awards",       "Submission for 88 Richardson; final package",               "Graphics: Omar; writing: Tom",              "AIA-BKLYN-SUBMITTAL.pdf"],
        ["Apr 7",  "Wynwood Tower", "Press",        "Architect's Newspaper picked up the AIA Merit news",        "N/A",                                       "(none)"],
        ["Apr 8",  "88 Richardson", "Event",        "Ownership walkthrough w/ press; 14 attended",              "Julia, Tom, Eran + Ricardo",                "IMG-4402.jpg (raw, not edited)"],
        ["Apr 9",  "412 Nostrand",  "Photoshoot",   "Scheduled w/ Matthieu for April 18 (Saturday)",             "Site access confirmed; weekend OK",         "(planning)"],
        ["Apr 10", "Queens City",   "Pursuit",      "Shortlist announcement &mdash; final three",                "Interview April 16",                        "QC-MASTERPLAN-AXON.png"],
        ["Apr 10", "Wynwood",       "Press",        "Dezeen Amy requested Ricardo interview &mdash; April 17",   "Coordinate; deliver 2 renders exclusive",   "WYN-RENDER-01.jpg, WYN-RENDER-02.jpg"],
        ["Apr 11", "Firm",          "Comms",        "April newsletter editorial plan locked &mdash; Richardson hero","Editor: Julia; goes out Apr 22",         "(newsletter layout)"],
        ["Apr 12", "88 Richardson", "Awards",       "AIA NY Merit, Multi-Family &mdash; WIN",                    "Announce Apr 14 morning",                   "AIA-NY-MERIT-LOGO.png"],
        ["Apr 14", "88 Richardson", "Social",       "LinkedIn post on AIA win &mdash; top week perf 18K reach",  "240 comments; draft in Canva",              "88R-AIA-LI-CARD.png"],
        ["Apr 14", "Firm",          "Social",       "Instagram Reels paused for waterfront projects; pivot LI video","Per Q1 perf read",                       "(strategy)"],
        ["Apr 15", "412 Nostrand",  "Milestone",    "DD &rarr; CD handoff kickoff internal",                      "Maya, D. Chen, + new hire Priya",          "(internal)"],
        ["Apr 15", "Navy Yard 284", "Event",        "Van Alen co-program seed convo w/ M. Ortiz",                "Schedule Q3 public event",                  "(none)"],
        ["Apr 16", "Queens City",   "Pursuit",      "Interview day. Final three. 90 min; good energy.",         "Interviewers: Richard, Jing, Maya, Elena",  "(no press yet)"],
        ["Apr 17", "Wynwood",       "Press",        "Ricardo &lt;&gt; Dezeen Amy interview &mdash; 60 min, recorded","Feature due May 6",                      "WYN-RICARDO-PORTRAIT.jpg"],
        ["Apr 18", "Navy Yard 284", "Photoshoot",   "Rescheduled from 4/15 &mdash; Matthieu, Saturday",          "No weekend upcharge",                       "(shot list in planning)"],
        ["Apr 19", "Firm",          "Newsletter",   "April issue editorial handed to Omar for layout",           "Target send: Apr 22",                       "(layout in InDesign)"],
        ["Apr 20", "88 Richardson", "Press",        "NYT Real Estate short on first move-ins (May 1)",           "Editor: R. Chen",                           "(waiting on go-ahead)"],
        ["Apr 21", "Firm",          "Comms",        "Partner vote brief to board for Apr 22",                    "Elena leads; marketing supports visuals",    "(slide deck)"],
        ["Apr 22", "Firm",          "Comms",        "Newsletter April sent &mdash; subject: Richardson Issue",   "3,104 recipients",                          "(sent)"],
        ["Apr 22", "Navy Yard 284", "Decision",     "Partner vote &mdash; approved, direct-select accepted",     "PM assignment: Maya",                       "(none)"],
        ["Apr 23", "Firm",          "Event",        "Firm-wide Copilot workshop &mdash; 86 registrations",       "Content: Adva",                             "(event photos pending)"],
        ["Apr 24", "Wynwood",       "Social",       "LinkedIn preview ahead of Dezeen feature",                  "Wait until Dezeen goes live",                "WYN-RENDER-01.jpg"],
        ["Apr 25", "Queens City",   "Decision",     "Shortlist decision expected early May &mdash; hold",        "Nothing externally yet",                    "(holding)"],
        ["Apr 26", "412 Nostrand",  "Photoshoot",   "Postponed to Apr 29 (weather)",                             "Rescheduled",                               "(to come)"],
        ["Apr 28", "Firm",          "Hire",         "Director of Sustainability Priya D. hire announced internal","People Team owns; may be in newsletter May","PD-HEADSHOT.jpg"],
        ["Apr 29", "412 Nostrand",  "Photoshoot",   "Shot delivered, 48 images, selects pending",                "M. Salvaing",                               "412N-IMG-001 .. -048"],
        ["Apr 30", "Firm",          "Finance",      "Q2 marketing reallocation executed ($22K Reels &rarr; LI)",  "Approved by partners",                     "(memo)"],
    ]

    t = Table(rows, colWidths=[0.55*inch, 1.05*inch, 0.75*inch, 2.25*inch, 1.55*inch, 1.15*inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR",  (0, 0), (-1, 0), CREAM),
        ("FONTNAME",   (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",   (0, 0), (-1, 0), 8),
        ("FONTNAME",   (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE",   (0, 1), (-1, -1), 7.5),
        ("ALIGN",      (0, 0), (-1, -1), "LEFT"),
        ("VALIGN",     (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, HexColor("#F4F0E6")]),
        ("LEFTPADDING",  (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING",   (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 3),
        ("LINEBELOW", (0, 0), (-1, 0), 1, GOLD),
        ("GRID", (0, 0), (-1, -1), 0.25, HexColor("#D0CFC0")),
    ]))
    story.append(t)

    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph(
        "Notes field contains abbreviations used internally: TBC = to be "
        "confirmed; N/A = not applicable; PM/PA/PIC = Project Manager / Project "
        "Architect / Principal-in-Charge. Image references point to the "
        "marketing server folder /Projects/[ProjectName]/ (not linked here).",
        T["sub"]))

    build_plain(OUT_DIR / "marketing-source.pdf", story)


# ==========================================================================
# TEMPLATE 4 — EXECUTIVE: Travel Itinerary (past polished trip)
# ==========================================================================

def executive_template():
    S = tpl_styles()
    story = []
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph("TRAVEL ITINERARY", S["brand"]))
    story.append(Paragraph("Tel Aviv &amp; Jerusalem  &mdash;  Jan 13&ndash;17, 2026", S["title"]))
    story.append(Paragraph("Traveler: Eran Chen (Founding Principal) &middot; Prepared Jan 6, 2026 by Thalia Scagliola, Executive Assistant &middot; Version 3 (final)", S["subtitle"]))

    story.append(Paragraph("Trip Summary", S["h1"]))
    story.append(make_table([
        ["Field", "Value"],
        ["Purpose", "Client meetings (3); site visit (1); panel (1); press (2)"],
        ["Departure", "Mon Jan 12, 10:45 PM &mdash; EWR &rarr; TLV (EL AL LY 27)"],
        ["Return", "Fri Jan 16, 11:45 PM &mdash; TLV &rarr; EWR (EL AL LY 28) &mdash; arrives Sat Jan 17, 5:05 AM"],
        ["Hotels", "Beit Yakov (Tel Aviv, Jan 13&ndash;15) &middot; The David Citadel (Jerusalem, Jan 15&ndash;16)"],
        ["Car service", "Limoline Israel &mdash; Driver Tomer, +972-55-555-1301 (bilingual)"],
        ["Local ODA contact", "Lily Golabchi (ODA TLV), +972-54-555-7788"],
    ], [1.3 * inch, 4.7 * inch]))

    story.append(Paragraph("Day 1 &mdash; Tue Jan 13 (Tel Aviv)", S["h1"]))
    for line in [
        "<b>05:05</b> Arrive TLV. Tomer meeting at kerb (green Mercedes E-Class, license 99-123-77).",
        "<b>06:30</b> Check-in at Beit Yakov. Breakfast en-suite booked.",
        "<b>10:00</b> ODA TLV studio visit &mdash; Rothschild Blvd 42, 4th floor. Lily G. escorting.",
        "<b>13:00</b> Lunch with <b>David Arbel</b> (Arbel &amp; Partners, developer) &mdash; HaBasta, Allenby St. Booked in his name.",
        "<b>16:00</b> Site walk &mdash; Yehuda HaLevi Tower (SD phase). Meet PM Nir at ground-floor kiosk.",
        "<b>20:00</b> Dinner with Roni Khazen (family friend, architect). Tabula, Neve Tzedek.",
    ]:
        story.append(Paragraph(f"&bull; {line}", S["bullet"]))

    story.append(Paragraph("Day 2 &mdash; Wed Jan 14 (Tel Aviv)", S["h1"]))
    for line in [
        "<b>08:30</b> Breakfast with <b>Yael Ben-David</b> &mdash; Moses, Allenby St. (Yael is EVP, Menora Mivtachim &mdash; potential client on the hospitality arm).",
        "<b>10:30</b> ODA TLV internal design review &mdash; 3 projects, 90 min block.",
        "<b>13:00</b> Lunch (light) at studio; deskside catch-ups.",
        "<b>15:30</b> <b>Calcalist</b> sit-down interview &mdash; reporter Maya Koren. 45 min. Topic: ODA's US&ndash;Israel practice, porosity as urban tactic. Recorded.",
        "<b>18:30</b> Back to Beit Yakov.",
        "<b>20:30</b> Dinner with <b>Gidi Bar-Aharon</b> (Bar-Aharon Holdings) &mdash; Ouzeria. Follow-up on the 2025 Jerusalem conversation. Thalia to coordinate post-dinner.",
    ]:
        story.append(Paragraph(f"&bull; {line}", S["bullet"]))

    story.append(Paragraph("Day 3 &mdash; Thu Jan 15 (TLV &rarr; Jerusalem)", S["h1"]))
    for line in [
        "<b>08:00</b> Check out Beit Yakov. Luggage to Tomer.",
        "<b>09:30</b> Drive to Jerusalem (approx. 1h).",
        "<b>11:00</b> Check in at The David Citadel &mdash; King David 7. Room booked under Chen/2N.",
        "<b>12:30</b> Lunch with <b>Ehud Kimmerling</b> (Hebrew University, Faculty of Architecture) &mdash; faculty club. Non-commercial; long-form conversation.",
        "<b>15:00</b> <b>Panel</b> at the Israel Museum &mdash; \u201cCities, Porosity, and the Public\u201d. Panelists: Eran Chen, Sigal Barnir, Oded Halaf, moderator Dana Karidi. 90 min + Q&amp;A + 30 min mingle.",
        "<b>19:00</b> Dinner with the <b>Jerusalem Foundation</b> board &mdash; The David Citadel, rooftop. Semi-formal.",
    ]:
        story.append(Paragraph(f"&bull; {line}", S["bullet"]))

    story.append(PageBreak())

    story.append(Paragraph("Day 4 &mdash; Fri Jan 16 (Jerusalem &rarr; TLV &rarr; EWR)", S["h1"]))
    for line in [
        "<b>09:00</b> Breakfast with <b>Naama Shapira</b> (Shapira Foundation) &mdash; in-hotel.",
        "<b>11:00</b> Private tour &mdash; <b>Israel Museum</b> Ardon Collection with curator. 60 min.",
        "<b>13:00</b> Check out The David Citadel.",
        "<b>13:30</b> Drive TLV airport (~1h drive to LOD, then airport).",
        "<b>16:00</b> Meeting at TLV airport lounge with <b>Roy Keren</b> (ICL Group, potential campus project). 90 min, no written output planned.",
        "<b>19:00</b> Early dinner, airport.",
        "<b>21:45</b> Check-in opens. <b>23:45</b> Departure EL AL LY 28 &rarr; EWR. Seat 2A (window, aisle left). Arrives Sat Jan 17, 05:05 AM.",
    ]:
        story.append(Paragraph(f"&bull; {line}", S["bullet"]))

    story.append(Paragraph("Key Contacts &mdash; Meeting-by-Meeting Briefing", S["h1"]))
    story.append(make_table([
        ["Name", "Role", "Context"],
        ["David Arbel", "Arbel &amp; Partners, developer", "Long-standing. Looking at ODA for a Tel Aviv boutique project. LinkedIn: /in/david-arbel-tlv"],
        ["Yael Ben-David", "EVP, Menora Mivtachim", "New. Warm intro via Lily G. Hospitality arm RFP in Q2. LinkedIn: /in/yael-bendavid"],
        ["Maya Koren", "Reporter, Calcalist", "First interview. Prefer English; will translate."],
        ["Gidi Bar-Aharon", "Bar-Aharon Holdings", "Renewed conversation. Jerusalem mixed-use inquiry."],
        ["Ehud Kimmerling", "Professor, Hebrew U", "Academic. Guest critic invitation probable."],
        ["Dana Karidi", "Panel moderator", "TV Host (Yes Docu). Expect press follow-up."],
        ["Naama Shapira", "Shapira Foundation", "Philanthropic; possible pro-bono."],
        ["Roy Keren", "ICL Group", "Campus project at Rotem Plain. Very early."],
    ], [1.4 * inch, 1.8 * inch, 2.8 * inch]))

    story.append(Paragraph("Emergency &amp; Logistics", S["h1"]))
    story.append(Paragraph(
        "US consulate Tel Aviv: +972-3-519-7575. Embassy emergencies 24/7. "
        "Beit Yakov front desk: +972-3-525-1234 (Eran's name on file). "
        "The David Citadel: +972-2-621-1111. "
        "EL AL US support: +1-800-223-6700.",
        S["body"]))

    story.append(Paragraph("Distribution: Eran Chen, Thalia Scagliola, Lily Golabchi (TLV).", S["caption"]))

    build_branded(OUT_DIR / "executive-template.pdf", "Travel Itinerary", story)


# ==========================================================================
# SOURCE 4 — EXECUTIVE: Booking-confirmation bundle (raw emails + attendees)
# ==========================================================================

def executive_source():
    E = email_styles()
    story = []
    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph("TRIP BOOKING BUNDLE &mdash; LONDON, MAY 2026", E["heading"]))
    story.append(Paragraph("Forwarded confirmations + meeting contacts &middot; Gathered by Thalia Scagliola for itinerary build &middot; Last updated Apr 19", E["sub"]))

    def email_block(from_, date, to, subject, body):
        story.append(Paragraph("\u2500 FWD \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500", E["divider"]))
        story.append(Paragraph(f"<b>From:</b>  {from_}", E["emailhdr"]))
        story.append(Paragraph(f"<b>Sent:</b>  {date}", E["emailmeta"]))
        story.append(Paragraph(f"<b>To:</b>    {to}", E["emailmeta"]))
        story.append(Paragraph(f"<b>Subject:</b> {subject}", E["emailmeta"]))
        story.append(Spacer(1, 0.08 * inch))
        for para in body:
            story.append(Paragraph(para, E["emailbody"]))

    email_block(
        "no-reply@britishairways.com",
        "Mon, Apr 7, 2026, 11:42 AM EDT",
        "thalia@oda-architecture.com",
        "Your e-ticket &mdash; BA 178  EWR &rarr; LHR  May 18, 2026",
        [
            "Dear Mr. Eran Chen,",
            "Thank you for booking with British Airways. Your e-ticket is confirmed.",
            "<b>Booking reference:</b> 4QK9PT",
            "<b>Outbound:</b>  BA 178  Newark (EWR) &rarr; London Heathrow (LHR).  Dep May 18 21:05 EDT / Arr May 19 08:45 BST.  Duration 06:40.  Seat 3K.  Club World.  Aircraft 777-300ER.",
            "<b>Return:</b>  BA 177  London Heathrow (LHR) &rarr; Newark (EWR).  Dep May 22 14:10 BST / Arr May 22 17:00 EDT.  Duration 07:50.  Seat 1A.  Club World.",
            "Baggage: 2 x 32 kg.  Lounge access at T5 (Galleries First).",
            "Manage your booking at ba.com. &mdash; British Airways",
        ],
    )

    email_block(
        "reservations@theneduc.com",
        "Tue, Apr 8, 2026, 3:17 PM EDT",
        "thalia@oda-architecture.com",
        "The Ned &mdash; Reservation confirmation &mdash; Chen",
        [
            "Dear Ms. Scagliola,",
            "We are delighted to confirm the following reservation for Mr. Eran Chen:",
            "<b>Check-in:</b>  Tue May 19, 2026  (from 15:00)  <b>Check-out:</b>  Fri May 22, 2026  (by 11:00).  3 nights.",
            "<b>Room type:</b>  Heritage Grand (approximately 42 sqm).  Breakfast included.  City rate.",
            "<b>Confirmation no.:</b>  NED-2026-38114.  Credit card on file guarantees the booking.",
            "Airport transfer: please reply with flight number and we will arrange a driver at your expense, or you may use the hotel's preferred partner London Chauffeurs (&pound;120 one way from LHR).",
            "Kind regards, Reservations team. The Ned, 27 Poultry, London EC2R 8AJ.",
        ],
    )

    email_block(
        "richard.soames@soames-parker.co.uk",
        "Wed, Apr 9, 2026, 6:04 AM EDT",
        "eran@oda-architecture.com; thalia@oda-architecture.com",
        "RE: London week &mdash; confirming our Wednesday",
        [
            "Eran, Thalia &mdash;",
            "Wednesday 21 May works. 10:30 at our offices (20 Ely Place, Holborn), 90 min planned. I will have Jo Faulkner (our Head of Residential) in the room and probably our MD Priya. We'd like to walk you through the two waterfront schemes we discussed at MIPIM and understand how ODA might collaborate.",
            "Lunch after &mdash; we'll book somewhere nearby, probably Rules. Confirmed.",
            "Thalia &mdash; if Eran has a hard stop we can compress, just flag.",
            "Best,",
            "Richard &mdash; Richard Soames, Managing Partner, Soames &amp; Parker Developments.",
            "richard.soames@soames-parker.co.uk  |  +44 7700 900 814",
        ],
    )

    email_block(
        "j.okoro@royal-academy.ac.uk",
        "Thu, Apr 10, 2026, 10:30 AM EDT",
        "eran@oda-architecture.com",
        "Royal Academy of Arts &mdash; Architecture talk, Thu May 21",
        [
            "Dear Eran,",
            "Further to our call &mdash; we are delighted to confirm you as our speaker for the Architecture Thursday talk on May 21, 2026. 18:30 for 19:00 start, 45 min talk + 30 min Q&amp;A, followed by a reception in the Keeper's House until 21:30.",
            "Expected audience: ~220 (RA members, architecture students, press). Press list attached separately.",
            "We'll send a technical rider for your slides by end of next week. Please let Thalia CC our producer Sam Abbott (sam.abbott@royal-academy.ac.uk) for the logistics.",
            "Warmly, Joyce Okoro, Programme Director, Royal Academy of Arts, Architecture.",
        ],
    )

    email_block(
        "editorial@worldofinteriors.co.uk",
        "Fri, Apr 11, 2026, 7:55 AM EDT",
        "tom@oda-architecture.com; thalia@oda-architecture.com",
        "Interview with Eran Chen &mdash; World of Interiors",
        [
            "Hi Tom, Thalia &mdash;",
            "Confirming the interview on Friday May 22 at 11:00 at the Ned (will meet in the lobby). 60 min. Our photographer Elena will also come and take 3&ndash;4 frames of Eran in a quiet corner &mdash; no formal shoot, just editorial. Feature will run in the August issue.",
            "Topic framing as discussed: ODA's European ambitions, how porosity plays in dense European contexts, 88 Richardson as a precedent.",
            "Please confirm.",
            "Thanks &mdash; Clara Whitfield, Features Editor, World of Interiors.",
        ],
    )

    email_block(
        "london.chauffeurs@lcltd.co.uk",
        "Mon, Apr 14, 2026, 5:02 AM EDT",
        "thalia@oda-architecture.com",
        "London Chauffeurs &mdash; quote &amp; confirmation &mdash; Chen",
        [
            "Dear Ms. Scagliola,",
            "Quoted service for Mr. Chen, May 19&ndash;22:",
            "- LHR &rarr; The Ned, May 19 morning (meet at arrivals): &pound;120.",
            "- Standby for May 19&ndash;22, dispatched by app: &pound;55/hr, 4 hr minimum per dispatch.",
            "- The Ned &rarr; LHR, May 22 11:30: &pound;120.",
            "Confirming: Driver James Warrington will meet Mr. Chen at Arrivals T5, London Heathrow, morning of May 19. Sign with ODA ARCHITECTURE. Mobile: +44 7700 900 211.",
            "Best regards &mdash; London Chauffeurs reservations.",
        ],
    )

    # --- attendees / bios section
    story.append(Paragraph("\u2500 ATTENDEES &amp; CONTACTS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500", E["divider"]))
    story.append(Paragraph("Pulled from LinkedIn + ZoomInfo &middot; for Thalia to format into the itinerary contact section", E["emailmeta"]))

    attendees = [
        ("Richard Soames",  "Managing Partner, Soames &amp; Parker Developments",
         "London. 30y track record in UK waterfront and urban residential. Recently closed a 600-unit scheme in Rotherhithe. Met Eran at MIPIM 2025. LinkedIn: /in/richard-soames-dev. richard.soames@soames-parker.co.uk"),
        ("Priya Krishnan",  "Managing Director, Soames &amp; Parker Developments",
         "New to Soames &amp; Parker (joined Jan 2026) from Grosvenor. Known for brokering local-authority partnerships. LinkedIn: /in/priya-krishnan-mdprop"),
        ("Jo Faulkner",     "Head of Residential, Soames &amp; Parker Developments",
         "Leads their residential practice. Bristol-based originally; moved to London 2022. Heavy on typology diversification. LinkedIn: /in/jo-faulkner-res"),
        ("Joyce Okoro",     "Programme Director, Architecture, Royal Academy of Arts",
         "Runs the RA's architecture programme. Curated the 2024 \u201cArchitecture Now\u201d series. Published her own essay book last year. LinkedIn: /in/joyce-okoro-ra"),
        ("Sam Abbott",      "Producer, Royal Academy (Architecture Thursdays)",
         "First point of contact for logistics. sam.abbott@royal-academy.ac.uk"),
        ("Clara Whitfield", "Features Editor, World of Interiors",
         "At WoI since 2019. Known for long-form profiles. Will bring photographer Elena Frost. LinkedIn: /in/clara-whitfield-woi"),
        ("Elena Frost",     "Photographer, World of Interiors",
         "Editorial portraiture. Not a full shoot &mdash; 3-4 frames in-context."),
        ("James Warrington","Driver, London Chauffeurs",
         "+44 7700 900 211. Will be at LHR T5 arrivals morning of May 19."),
    ]
    for name, role, bio in attendees:
        story.append(Paragraph(f"<b>{name}</b>  &mdash;  {role}", E["emailhdr"]))
        story.append(Paragraph(bio, E["emailbody"]))

    story.append(Paragraph("\u2500 TO-DO FOR THALIA \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500", E["divider"]))
    for line in [
        "Confirm WoI interview with Clara by Apr 22.",
        "Get tech rider from RA producer Sam Abbott &mdash; expected by Apr 17; chase if late.",
        "Eran flagged he wants an RA-area afternoon walkabout &mdash; see if Soane's Museum or Bartlett is open on May 21 afternoon before the talk.",
        "Book Tuesday May 19 evening dinner &mdash; Eran prefers Barrafina Covent Garden if a 4-top is available.",
        "Triple-check passport expiration and ESTA/eTA status for UK entry.",
    ]:
        story.append(Paragraph(f"&bull; {line}", E["emailbody"]))

    build_plain(OUT_DIR / "executive-source.pdf", story)


# ==========================================================================
# TEMPLATE 5 — OPERATIONS: Contract Review Memo (past, completed)
# ==========================================================================

def operations_template():
    S = tpl_styles()
    story = []
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph("CONTRACT REVIEW MEMO", S["brand"]))
    story.append(Paragraph("Owner-Architect Agreement &mdash; 412 Nostrand Ave.", S["title"]))
    story.append(Paragraph("Client: Nostrand Partners, LLC &middot; Reviewed Feb 3, 2026 by J. Hedaya, Director of Operations &middot; Disposition: Executed Feb 14 after three revisions", S["subtitle"]))

    story.append(Paragraph("Contract Identification", S["h1"]))
    story.append(make_table([
        ["Field", "Value"],
        ["Contract instrument", "AIA B101-2017, modified"],
        ["Client entity", "Nostrand Partners, LLC (SPE; parent: Domain Holdings)"],
        ["Project", "412 Nostrand Avenue, Bed-Stuy, Brooklyn &mdash; 16-story mixed-use"],
        ["Basic services", "SD through CA, full services"],
        ["Proposed fee", "Fixed + percentage hybrid &mdash; see fee section below"],
        ["Counterparty counsel", "Feldman Rosen LLP"],
        ["Review disposition", "EXECUTED with three rounds of redlines. Six issues resolved; two accepted as ODA-standard-equivalent; one concession documented."],
    ], [1.7 * inch, 4.3 * inch]))

    story.append(Paragraph("Executive Summary", S["h1"]))
    story.append(Paragraph(
        "The B101 as proposed was broadly acceptable but had three terms that "
        "required substantive pushback (scope creep on reimbursables, an "
        "indemnification cap below ODA standard, and a termination-for-convenience "
        "clause with inadequate notice). All three were resolved in the final "
        "version. One concession was made on hourly rate transparency (ODA agreed "
        "to share rate schedule on request; historically we decline). "
        "Insurance compliance was confirmed. No escalation to partners was required.",
        S["body"]))

    story.append(Paragraph("Scope of Services &mdash; Flags", S["h1"]))
    story.append(Paragraph("1. Reimbursable expenses &mdash; RESOLVED (Round 1)", S["h2"]))
    story.append(Paragraph(
        "As proposed, &sect;11.8 defined reimbursables as \u201croutine travel, "
        "reprographics, and out-of-pocket costs.\u201d This is narrower than ODA "
        "standard, which includes all third-party consultant pass-through, model "
        "fabrication, photography, and renderings. Pushback was accepted; final "
        "language mirrors ODA's standard schedule (AIA B101 default + photography "
        "+ model fabrication explicit).",
        S["body"]))

    story.append(Paragraph("2. Sustainability consultant scope &mdash; RESOLVED (Round 2)", S["h2"]))
    story.append(Paragraph(
        "Client proposed that LEED documentation be subsumed into the base fee. "
        "ODA pushed back: LEED documentation is a separately scoped add-service "
        "per ODA's standard. Compromise: LEED-admin at a capped hourly fee not to "
        "exceed 1.2% of construction cost. Client accepted.",
        S["body"]))

    story.append(Paragraph("Fee Structure &mdash; Flags", S["h1"]))
    story.append(Paragraph("3. Percentage basis &mdash; ACCEPTABLE", S["h2"]))
    story.append(Paragraph(
        "Base fee = 6.8% of Construction Cost up to $68M; 5.5% over that ceiling. "
        "This is consistent with ODA's schedule for 412 Nostrand typology. No "
        "change.",
        S["body"]))
    story.append(Paragraph("4. Hourly rate disclosure &mdash; CONCESSION", S["h2"]))
    story.append(Paragraph(
        "Client requested the right to audit our hourly rate schedule for "
        "additional-services billing. Standard ODA practice is to decline, citing "
        "confidentiality of the rate schedule. J. Hedaya consulted with Elena "
        "and Richard; given the size of the project and the multi-project "
        "relationship with the parent (Domain Holdings, 88 Richardson), a "
        "concession was made: rate schedule may be shared on request subject to "
        "NDA. <b>Documented as a deviation from ODA standard.</b>",
        S["body"]))

    story.append(PageBreak())

    story.append(Paragraph("Termination &amp; Assignment &mdash; Flags", S["h1"]))
    story.append(Paragraph("5. Termination for convenience &mdash; RESOLVED (Round 1)", S["h2"]))
    story.append(Paragraph(
        "As proposed, client could terminate with 14 days notice. ODA standard is "
        "30 days minimum. Pushback accepted; final language is 30 days plus "
        "payment of all services through termination date plus a 10% "
        "wind-down fee.",
        S["body"]))
    story.append(Paragraph("6. Assignment &mdash; RESOLVED (Round 2)", S["h2"]))
    story.append(Paragraph(
        "Client proposed right to assign contract to any affiliate without "
        "consent. ODA's counter: client may assign to a controlled-affiliate (same "
        "ultimate parent) with notice; assignment to any other entity requires "
        "ODA's written consent. Accepted.",
        S["body"]))

    story.append(Paragraph("Liability &amp; Indemnification &mdash; Flags", S["h1"]))
    story.append(Paragraph("7. Liability cap &mdash; RESOLVED (Round 3)", S["h2"]))
    story.append(Paragraph(
        "As proposed, the liability cap was the greater of total fees paid or "
        "$1M. ODA standard is greater of total fees OR professional liability "
        "insurance limits ($5M PL), whichever is greater. Final: aligned with "
        "ODA standard, capped at $5M or total fees, whichever is greater.",
        S["body"]))
    story.append(Paragraph("8. Mutual indemnification &mdash; ACCEPTABLE", S["h2"]))
    story.append(Paragraph(
        "Mutual indemnification for negligence, with carve-outs for gross "
        "negligence and willful misconduct. Standard B101 language. No change.",
        S["body"]))

    story.append(Paragraph("Insurance Compliance", S["h1"]))
    story.append(make_table([
        ["Coverage", "Required", "ODA current", "Status"],
        ["Professional liability", "$5M per claim / $5M aggregate", "$5M / $10M", "OK (exceeds)"],
        ["General liability", "$2M per occurrence", "$2M / $4M", "OK"],
        ["Auto liability", "$1M combined single limit", "$1M", "OK"],
        ["Workers' comp / employer's liability", "Statutory + $500K ELL", "Statutory + $1M", "OK (exceeds)"],
        ["Excess / umbrella", "$5M", "$5M", "OK"],
        ["Additional insured (Nostrand Partners + Domain)", "Required, primary &amp; noncontributory", "Endorsement issued Feb 10", "OK"],
    ], [1.7 * inch, 1.8 * inch, 1.4 * inch, 1.1 * inch]))

    story.append(Paragraph("Recommendation", S["h1"]))
    story.append(Paragraph(
        "Execute as finalized. One deviation from ODA standard (hourly rate "
        "disclosure subject to NDA) is documented above and was made with "
        "partner awareness. All other terms at or above ODA standard. No "
        "further review required. Distribute countersigned copy to Finance "
        "for billing setup.",
        S["body"]))

    story.append(Paragraph("Distribution", S["h1"]))
    story.append(Paragraph(
        "E. Santiago (MD); V. Patel (CFO); M. Okonkwo (PM 412 Nostrand); "
        "ODA standard-contracts archive.",
        S["body"]))

    story.append(Paragraph("Reviewed and signed:  J. Hedaya, Director of Operations  &middot;  ODA Architecture  &middot;  Feb 14, 2026", S["caption"]))

    build_branded(OUT_DIR / "operations-template.pdf", "Contract Review Memo", story)


# ==========================================================================
# SOURCE 5 — OPERATIONS: Contract excerpt with client redlines (raw)
# ==========================================================================

def operations_source():
    R = redline_styles()
    story = []
    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph("CONTRACT REDLINE &mdash; CLIENT RETURN", R["heading"]))
    story.append(Paragraph("Project: Wynwood Tower &mdash; Restaurant &amp; Lobby Fit-Out  &middot;  Client counsel: Kaplan Marcus LLP  &middot;  Returned Apr 17, 2026  &middot;  Round 1 redlines", R["sub"]))

    def clause(num, title, text, comment=None):
        story.append(Paragraph(f"&sect; {num}  &mdash;  {title}", R["clausenum"]))
        story.append(Paragraph(text, R["clause"]))
        if comment:
            story.append(Paragraph(f"<i>[CLIENT COMMENT:  {comment}]</i>", R["comment"]))

    # Styling convention for inline redlines:
    #   added text  -> <font color="#0B4C8C"><u>text</u></font>
    #   deleted     -> <font color="#B00020"><strike>text</strike></font>

    clause("3.2", "Basic Services &mdash; Scope",
           "Architect shall provide the Basic Services described in the AIA B101-2017 "
           "as modified, comprising Schematic Design through Construction Administration "
           "for the restaurant and lobby fit-out at the Wynwood Tower property. "
           "<font color='#0B4C8C'><u>Basic Services shall also include coordination "
           "with the Tenant's separate brand consultant and the Tenant's AV/IT vendor, "
           "at no additional cost to Owner, through close-out.</u></font>",
           "We need the Architect to own the coordination with Tenant's brand "
           "consultant Edge Studio and with AV/IT vendor Neat. Not a change order.")

    clause("4.1", "Deliverables &mdash; Schedule",
           "The Architect shall deliver Schematic Design within <font color='#B00020'><strike>ten (10)</strike></font> "
           "<font color='#0B4C8C'><u>six (6)</u></font> weeks of written notice to proceed. "
           "Design Development within <font color='#B00020'><strike>ten (10)</strike></font> "
           "<font color='#0B4C8C'><u>eight (8)</u></font> weeks thereafter. "
           "Construction Documents within <font color='#B00020'><strike>twelve (12)</strike></font> "
           "<font color='#0B4C8C'><u>ten (10)</u></font> weeks of DD approval.",
           "Opening night is tied to a lease milestone. We need the schedule "
           "compressed across every phase. Non-negotiable.")

    clause("8.1", "Compensation &mdash; Basic Services",
           "Compensation for Basic Services shall be a fixed fee of "
           "<font color='#B00020'><strike>$485,000</strike></font> "
           "<font color='#0B4C8C'><u>$395,000</u></font> "
           "(United States Dollars), invoiced monthly against percent-complete.",
           "Fee reduction reflects the compressed schedule and the reduced "
           "construction cost (see revised scope). Happy to discuss.")

    clause("8.4", "Compensation &mdash; Reimbursable Expenses",
           "Reimbursable Expenses shall include: routine travel inside "
           "<font color='#B00020'><strike>the United States</strike></font> "
           "<font color='#0B4C8C'><u>the New York metropolitan area only</u></font>; "
           "reprographics; models; renderings; <font color='#B00020'><strike>photography</strike></font>; "
           "and courier. <font color='#0B4C8C'><u>All Reimbursable Expenses in excess of "
           "$5,000 (five thousand dollars) in any calendar month require prior written "
           "Owner approval.</u></font>",
           "We will handle professional project photography separately. "
           "Reimbursables inside NYC only &mdash; any out-of-market travel is "
           "pre-approved.")

    clause("9.3", "Compensation &mdash; Hourly Rate Schedule",
           "Services performed outside the Basic Services scope shall be billed at the "
           "Architect's standard hourly rate schedule. "
           "<font color='#0B4C8C'><u>The Architect shall, upon Owner's request, deliver a "
           "full and unredacted hourly rate schedule for Owner's audit; Owner shall be "
           "entitled to dispute any rate deemed above market, and the parties shall "
           "negotiate in good faith to resolve.</u></font>",
           "We'd like transparency on hourly rates. Given our relationship "
           "(multi-project) we think this is reasonable.")

    clause("11.2", "Termination &mdash; For Convenience",
           "Owner may terminate this Agreement for convenience upon "
           "<font color='#B00020'><strike>thirty (30) days'</strike></font> "
           "<font color='#0B4C8C'><u>ten (10) days'</u></font> prior written notice, "
           "in which case Architect shall be entitled to compensation for services "
           "properly performed through the termination date, "
           "<font color='#B00020'><strike>plus a wind-down fee equal to ten percent (10%) "
           "of the fees billed as of the termination date</strike></font>.",
           "Ten days is all the notice we can commit to. Wind-down fee "
           "struck &mdash; we're a good client, no wind-down needed.")

    clause("11.5", "Assignment",
           "Neither party may assign this Agreement without the prior written consent of "
           "the other, which shall not be unreasonably withheld, <font color='#0B4C8C'><u>except "
           "that Owner may assign this Agreement to any affiliate, subsidiary, successor, "
           "joint-venture partner, or lender without Architect's consent, provided that "
           "Architect receives notice of such assignment within thirty (30) days thereof.</u></font>",
           "We need flexibility on assignment. Our capital stack includes "
           "lenders who may require assignability.")

    clause("12.1", "Indemnification",
           "Architect shall indemnify Owner and its affiliates, officers, directors, and "
           "employees from any and all "
           "<font color='#B00020'><strike>claims arising out of Architect's negligent acts, errors, or omissions</strike></font> "
           "<font color='#0B4C8C'><u>claims, losses, damages, costs, or expenses of any kind or character arising out of or related to this Agreement or the Services performed hereunder, regardless of fault</u></font>. "
           "Owner's obligation to indemnify Architect is "
           "<font color='#B00020'><strike>reciprocal</strike></font> <font color='#0B4C8C'><u>limited to Owner's own negligent acts</u></font>.",
           "Standard risk allocation for our portfolio. Our insurance requires "
           "broad indemnity from our consultants.")

    clause("12.4", "Limitation of Liability",
           "Architect's aggregate liability to Owner under this Agreement shall not exceed "
           "<font color='#B00020'><strike>the greater of (i) total fees paid under this Agreement or (ii) five million dollars ($5,000,000)</strike></font> "
           "<font color='#0B4C8C'><u>total fees paid under this Agreement, not to exceed three hundred thousand dollars ($300,000)</u></font>.",
           "We need our exposure capped more tightly. The project is not a "
           "$5M risk from our side.")

    clause("13.2", "Insurance",
           "Architect shall maintain Professional Liability insurance with limits of "
           "not less than <font color='#B00020'><strike>five million dollars ($5,000,000)</strike></font> "
           "<font color='#0B4C8C'><u>ten million dollars ($10,000,000)</u></font> per claim "
           "and in the aggregate. Owner and its affiliates "
           "<font color='#0B4C8C'><u>and its lenders and joint-venture partners</u></font> "
           "shall be named as additional insureds, on a "
           "<font color='#B00020'><strike>primary and non-contributory</strike></font> "
           "<font color='#0B4C8C'><u>primary, non-contributory, and waiver-of-subrogation</u></font> "
           "basis.",
           "Our lenders require broader insurance coverage and additional-insured "
           "status. $10M PL is their threshold.")

    story.append(Paragraph("&mdash; END OF CLAUSE REDLINES &mdash;", R["sub"]))
    story.append(Paragraph(
        "Cover note from Kaplan Marcus: \u201cThese are the redlines from this round. "
        "Client wants to move fast. Let's close this by Friday if possible. Call if "
        "anything is a dealbreaker; otherwise please return your counter-redlines. "
        "&mdash; DK.\u201d",
        R["comment"]))

    build_plain(OUT_DIR / "operations-source.pdf", story)


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

    print("Generating raw-data source PDFs...")
    arch_source()
    hr_source()
    marketing_source()
    executive_source()
    operations_source()

    print("\nGenerated files:")
    for p in sorted(OUT_DIR.glob("*.pdf")):
        size_kb = p.stat().st_size / 1024
        print(f"  {p.name}  ({size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
