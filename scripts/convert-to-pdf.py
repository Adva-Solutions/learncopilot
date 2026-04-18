"""
Convert specific .txt files in the mock-data directory to professionally
formatted PDFs using reportlab.

Each PDF has:
  - Document title in a larger font + "ODA Architecture" subtitle
  - Horizontal rule separator
  - Body text with proper paragraph spacing
  - Section headings detected and rendered bold (ALL CAPS lines, ## lines, etc.)
  - Bullet points preserved
  - Footer with page numbers
  - 1-inch margins, Letter page size
  - Body: Helvetica 10pt, Headings: Helvetica-Bold 12pt
"""

import os
import re
import textwrap

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    HRFlowable,
    PageBreak,
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER


# ---------------------------------------------------------------------------
# constants
# ---------------------------------------------------------------------------
BASE_DIR = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "..", "mock-data")
)

FILES = [
    "building-codes/nyc-residential-code-reference.txt",
    "building-codes/nyc-vs-florida-comparison.txt",
    "specifications/project-spec-excerpt.txt",
    "hr/employee-handbook-excerpt.txt",
    "hr/onboarding-checklist.txt",
    "proposals/aia-award-narrative.txt",
    "marketing/oda-newsletter-sample.txt",
    "executive/oda-qbr-q1-2025.txt",
    "executive/property-summary-1.txt",
    "executive/property-summary-2.txt",
]

PAGE_W, PAGE_H = letter
MARGIN = 1 * inch

BRAND_DARK = HexColor("#1a1a2e")
BRAND_ACCENT = HexColor("#2c3e6b")
RULE_COLOR = HexColor("#cccccc")


# ---------------------------------------------------------------------------
# styles
# ---------------------------------------------------------------------------
def _build_styles():
    """Return a dict of named ParagraphStyles."""
    base = getSampleStyleSheet()
    styles = {}

    styles["title"] = ParagraphStyle(
        "DocTitle",
        parent=base["Title"],
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=20,
        textColor=BRAND_DARK,
        alignment=TA_LEFT,
        spaceAfter=2,
    )

    styles["subtitle"] = ParagraphStyle(
        "Subtitle",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=13,
        textColor=BRAND_ACCENT,
        alignment=TA_LEFT,
        spaceAfter=6,
    )

    styles["heading"] = ParagraphStyle(
        "SectionHeading",
        parent=base["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=15,
        textColor=BRAND_DARK,
        spaceBefore=14,
        spaceAfter=6,
    )

    styles["subheading"] = ParagraphStyle(
        "SubHeading",
        parent=base["Heading3"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=BRAND_DARK,
        spaceBefore=8,
        spaceAfter=4,
    )

    styles["body"] = ParagraphStyle(
        "BodyText",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=13,
        textColor=BRAND_DARK,
        spaceBefore=2,
        spaceAfter=4,
    )

    styles["bullet"] = ParagraphStyle(
        "Bullet",
        parent=styles["body"],
        leftIndent=18,
        bulletIndent=6,
        spaceBefore=1,
        spaceAfter=1,
    )

    styles["checkbox"] = ParagraphStyle(
        "Checkbox",
        parent=styles["body"],
        leftIndent=24,
        bulletIndent=6,
        spaceBefore=1,
        spaceAfter=1,
    )

    styles["indented"] = ParagraphStyle(
        "Indented",
        parent=styles["body"],
        leftIndent=24,
        spaceBefore=1,
        spaceAfter=1,
    )

    styles["footer"] = ParagraphStyle(
        "Footer",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10,
        textColor=HexColor("#888888"),
        alignment=TA_CENTER,
    )

    return styles


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------
def _escape(text: str) -> str:
    """Escape XML-special characters for reportlab Paragraph."""
    text = text.replace("&", "&amp;")
    text = text.replace("<", "&lt;")
    text = text.replace(">", "&gt;")
    return text


_SEPARATOR_RE = re.compile(r"^[=\-]{5,}$")
_HEADING_ALL_CAPS_RE = re.compile(
    r"^[A-Z][A-Z0-9 /\-:&,()\'\"]{4,}$"
)


def _is_separator(line: str) -> bool:
    return bool(_SEPARATOR_RE.match(line.strip()))


def _is_heading(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return False
    # lines starting with ##
    if stripped.startswith("##"):
        return True
    # ALL-CAPS lines of reasonable length (section headings)
    if _HEADING_ALL_CAPS_RE.match(stripped) and len(stripped) <= 120:
        return True
    # Numbered section headers like "1.01 SUMMARY" or "SECTION 3:"
    if re.match(r"^\d+\.\d+\s+[A-Z]", stripped):
        return True
    if re.match(r"^SECTION\s+\d", stripped):
        return True
    if re.match(r"^PART\s+\d", stripped):
        return True
    return False


def _is_subheading(line: str) -> bool:
    """Detect sub-headings like 'Key Facts:', 'Type A (full turning radius):', etc."""
    stripped = line.strip()
    if not stripped:
        return False
    # Lines that end with a colon and are relatively short, mixed case
    if stripped.endswith(":") and len(stripped) <= 80 and not stripped.startswith("-") and not stripped.startswith("["):
        # Must start with a letter and not be a regular sentence
        if re.match(r"^[A-Z]", stripped) and stripped.count(" ") <= 10:
            return True
    return False


def _is_bullet(line: str) -> bool:
    stripped = line.strip()
    return stripped.startswith("- ") or stripped.startswith("* ")


def _is_checkbox(line: str) -> bool:
    stripped = line.strip()
    return stripped.startswith("[ ]") or stripped.startswith("[x]") or stripped.startswith("[X]")


def _is_indented_content(line: str) -> bool:
    """Lines that start with significant whitespace (like spec sub-items)."""
    if line and not line.strip():
        return False
    return len(line) > 0 and len(line) - len(line.lstrip()) >= 4


def _derive_title(filename: str, first_lines: list) -> str:
    """Try to derive a meaningful document title from the filename or content."""
    # Look at first few non-empty, non-separator lines for a title
    for ln in first_lines[:5]:
        stripped = ln.strip()
        if stripped and not _is_separator(stripped):
            # Clean up and return
            cleaned = stripped.strip("=- ")
            if cleaned:
                return cleaned
    # Fallback: derive from filename
    base = os.path.splitext(os.path.basename(filename))[0]
    return base.replace("-", " ").replace("_", " ").title()


# ---------------------------------------------------------------------------
# page template with footer
# ---------------------------------------------------------------------------
def _footer_callback(canvas, doc):
    """Draw page number footer on every page."""
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(HexColor("#888888"))
    page_num_text = f"Page {doc.page}"
    canvas.drawCentredString(PAGE_W / 2, 0.5 * inch, page_num_text)

    # thin rule above footer
    canvas.setStrokeColor(HexColor("#dddddd"))
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, 0.7 * inch, PAGE_W - MARGIN, 0.7 * inch)
    canvas.restoreState()


# ---------------------------------------------------------------------------
# main conversion
# ---------------------------------------------------------------------------
def convert_file(txt_path: str, pdf_path: str, styles: dict):
    """Read a .txt file and produce a formatted PDF."""

    with open(txt_path, "r", encoding="utf-8") as fh:
        raw_lines = fh.readlines()

    # Strip trailing newlines
    lines = [ln.rstrip("\n").rstrip("\r") for ln in raw_lines]

    # Derive title from the first meaningful line(s)
    title_text = _derive_title(txt_path, lines)

    # Build document
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=MARGIN,
    )

    story = []

    # -- Header block --
    story.append(Paragraph(_escape(title_text), styles["title"]))
    story.append(Paragraph("ODA Architecture", styles["subtitle"]))
    story.append(Spacer(1, 4))
    story.append(
        HRFlowable(
            width="100%",
            thickness=1.5,
            color=BRAND_ACCENT,
            spaceBefore=2,
            spaceAfter=12,
        )
    )

    # -- Body --
    # Skip the very first lines that we already used as a title
    # (skip initial separators and the title line itself)
    skip_initial = True
    title_stripped = title_text.strip()

    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Skip the initial title block (first occurrence of the title text and
        # surrounding separators / blank lines)
        if skip_initial:
            if not stripped or _is_separator(stripped) or stripped == title_stripped:
                i += 1
                continue
            else:
                skip_initial = False
                # Don't skip this line -- fall through

        # Separator lines -> horizontal rule
        if _is_separator(stripped):
            story.append(
                HRFlowable(
                    width="100%",
                    thickness=0.5,
                    color=RULE_COLOR,
                    spaceBefore=6,
                    spaceAfter=6,
                )
            )
            i += 1
            continue

        # Blank lines -> small spacer
        if not stripped:
            story.append(Spacer(1, 6))
            i += 1
            continue

        # Checkbox items
        if _is_checkbox(stripped):
            # Replace [ ] with a unicode ballot box
            display = stripped.replace("[ ]", "\u2610").replace("[x]", "\u2611").replace("[X]", "\u2611")
            story.append(
                Paragraph(_escape(display), styles["checkbox"])
            )
            i += 1
            continue

        # Bullet points
        if _is_bullet(stripped):
            bullet_text = stripped[2:]  # remove "- " or "* "
            story.append(
                Paragraph(
                    f"\u2022  {_escape(bullet_text)}",
                    styles["bullet"],
                )
            )
            i += 1
            continue

        # Section headings (ALL CAPS, ## prefix, SECTION/PART numbering)
        if _is_heading(stripped):
            heading_text = stripped.lstrip("#").strip()
            # Clean up separator chars sometimes embedded
            heading_text = heading_text.strip("=- ")
            if heading_text:
                story.append(
                    Paragraph(_escape(heading_text), styles["heading"])
                )
            i += 1
            continue

        # Sub-headings (mixed case ending with colon, short)
        if _is_subheading(stripped) and not _is_indented_content(line):
            story.append(
                Paragraph(_escape(stripped), styles["subheading"])
            )
            i += 1
            continue

        # Indented content (spec sub-items, code-like blocks)
        if _is_indented_content(line) and not _is_heading(stripped):
            story.append(
                Paragraph(_escape(stripped), styles["indented"])
            )
            i += 1
            continue

        # Regular body text -- accumulate consecutive non-special lines into
        # a single paragraph for proper reflowing.
        para_parts = [stripped]
        j = i + 1
        while j < len(lines):
            next_line = lines[j]
            next_stripped = next_line.strip()
            if (
                not next_stripped
                or _is_separator(next_stripped)
                or _is_heading(next_stripped)
                or _is_bullet(next_stripped)
                or _is_checkbox(next_stripped)
                or _is_subheading(next_stripped)
                or _is_indented_content(next_line)
            ):
                break
            para_parts.append(next_stripped)
            j += 1

        full_text = " ".join(para_parts)
        story.append(Paragraph(_escape(full_text), styles["body"]))
        i = j

    # Build
    doc.build(story, onFirstPage=_footer_callback, onLaterPages=_footer_callback)


def main():
    styles = _build_styles()
    successes = []
    failures = []

    for rel_path in FILES:
        txt_path = os.path.normpath(os.path.join(BASE_DIR, rel_path))
        pdf_path = os.path.splitext(txt_path)[0] + ".pdf"

        if not os.path.isfile(txt_path):
            print(f"  SKIP  {rel_path}  (file not found)")
            failures.append(rel_path)
            continue

        try:
            convert_file(txt_path, pdf_path, styles)
            print(f"  OK    {rel_path}  ->  {os.path.basename(pdf_path)}")
            successes.append(rel_path)
        except Exception as exc:
            print(f"  FAIL  {rel_path}  ({exc})")
            failures.append(rel_path)

    print()
    print(f"Done. {len(successes)} converted, {len(failures)} failed.")


if __name__ == "__main__":
    main()
