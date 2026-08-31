"""
Generate professional PDF for COMPETITIVE_ANALYSIS.md using ReportLab.
"""

import os
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas


class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and print total page numbers."""
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(36, 570, "CERTUS AI FINANCE CONTROLLER — COMPETITIVE INTELLIGENCE DOSSIER")
            self.drawRightString(806, 570, "RAZORPAY AI BUILDATHON 2026 (TRACK 4)")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(36, 564, 806, 564)
            
        # Footer
        self.setFont("Helvetica", 8)
        self.drawString(36, 25, "Confidential & Proprietary — Author: Aditya Singh (Lead Architect & Systems Engineer)")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(806, 25, page_str)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(36, 35, 806, 35)
        
        self.restoreState()


def build_pdf(output_path: str):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=landscape(A4),
        leftMargin=36,
        rightMargin=36,
        topMargin=46,
        bottomMargin=46
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=4,
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#475569"),
        spaceAfter=12,
    )
    
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=12,
        spaceAfter=6,
    )
    
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=8,
        spaceAfter=4,
    )
    
    body_style = ParagraphStyle(
        'Body_Custom',
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#334155"),
        spaceAfter=4,
    )
    
    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#334155"),
        leftIndent=12,
        spaceAfter=2,
    )
    
    table_cell_style = ParagraphStyle(
        'TableCell',
        fontName='Helvetica',
        fontSize=7,
        leading=9.5,
        textColor=colors.HexColor("#1E293B")
    )
    
    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        fontName='Helvetica-Bold',
        fontSize=7,
        leading=9.5,
        textColor=colors.HexColor("#0F172A")
    )
    
    table_header_style = ParagraphStyle(
        'TableHeader',
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10,
        textColor=colors.white,
        alignment=TA_CENTER
    )
    
    winner_cell_style = ParagraphStyle(
        'WinnerCell',
        fontName='Helvetica-Bold',
        fontSize=7,
        leading=9.5,
        textColor=colors.HexColor("#047857")
    )

    story = []

    # Title Banner Box
    title_html = "🏆 CERTUS — COMPREHENSIVE COMPETITIVE INTELLIGENCE & BENCHMARK DOSSIER"
    sub_html = "<b>Razorpay AI Buildathon 2026</b> &nbsp;|&nbsp; <b>Track 04: Autonomous Financial Controller & Revenue Recovery</b><br/>" \
               "<b>Author:</b> Aditya Singh (Lead Architect & Systems Engineer) &nbsp;|&nbsp; <b>Evaluated Repositories:</b> 5 Active Codebases on GitHub"
    
    header_table_data = [[
        Paragraph(title_html, title_style),
    ], [
        Paragraph(sub_html, subtitle_style)
    ]]
    header_table = Table(header_table_data, colWidths=[770])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
        ('PADDING', (0,0), (-1,-1), 10),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('BOTTOMPADDING', (0,1), (-1,1), 8),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))

    # SECTION 1: MASTER COMPARISON MATRIX
    story.append(Paragraph("📊 1. Master Competitor Comparison Matrix (GitHub Landscape)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#2563EB"), spaceBefore=2, spaceAfter=6))
    
    headers = [
        Paragraph("Evaluation Dimension", table_header_style),
        Paragraph("🥇 Certus AI Finance Controller<br/><b>(Our Submission)</b>", table_header_style),
        Paragraph("🥈 LedgerMatch AI<br/>(parthpariwandh)", table_header_style),
        Paragraph("🥉 Sentinel Recovery<br/>(Teena2812)", table_header_style),
        Paragraph("❌ Generic Submissions<br/>(e.g. srikrishna0603)", table_header_style),
        Paragraph("📦 Open-Source Reconcilers<br/>(Pandas / SQL Scripts)", table_header_style),
    ]

    matrix_rows = [
        ("Target Track Focus", "Track 4 (Controller & Recovery)", "Track 4 (Controller)", "Track 3 (Revenue Recovery)", "Generic / Policy Simulator", "General Accounting Scripts"),
        ("Reconciliation Architecture", "3-Way Multi-Rail (Gateway × Bank × ERP)", "2-Way (Gateway × ERP)", "1-Way (Gateway-only)", "1-Way (CSV diff)", "1-Way (Pairwise join)"),
        ("Indian Banking Context", "16-Digit UTR + CMS Narration Regex", "Basic string match", "Gateway ID lookup", "Simple string equality", "Exact string key match"),
        ("Arithmetic Precision", "100% Integer Paisa Quantization (int*100)", "Standard Float (0.1+0.2 drift)", "Standard Float", "Standard Float", "Standard Float"),
        ("Deterministic Invariant Rules", "55 Invariant Rules + Double-Lock Gate", "None (Prompt-based decisions)", "Basic Python thresholds", "Hardcoded join conditions", "Basic equality operators"),
        ("Regulatory Compliance Gate", "9 Deterministic Rules (RBI §6.2, 194-O, CGST)", "None", "Partial (RBI hours only)", "None", "None"),
        ("Multi-LLM Consensus Relay", "4 Providers (Groq → Gemini → OpenAI → Claude)", "1 Model (Single LLM prompt)", "1 Model (Standard agent)", "None / 1 Free API", "None"),
        ("Autonomous Revenue Recovery", "6-Step Loop (Detect → Diagnose → Execute)", "Static anomaly flags only", "Dual-engine retry loop", "Static CSV reporting", "Manual spreadsheet edit"),
        ("Adaptive Strategy Memory", "Recency-Weighted Window (N=50, Decay 0.95)", "None", "Basic success counter", "None", "None"),
        ("Empirical Baseline Benchmark", "Side-by-Side (+10% Lift, 8,345 ops/s)", "None (~100 records only)", "Basic synthetic test", "None", "None"),
        ("Automated Test Coverage", "147 / 147 Passing Pytest Tests", "~10–15 basic tests", "116 / 116 tests", "<5 tests / Untested", "0–5 basic tests"),
        ("UI & Web Visualization", "45+ React Components + 3D WebGL", "Basic Streamlit UI", "CLI Only", "CLI / Jupyter Notebook", "Raw CSV / Terminal"),
        ("Production REST API Layer", "FastAPI + OpenAPI 3.1 Interactive Swagger", "None", "None", "None", "None"),
        ("Audit Trail & Idempotency", "SHA-256 Commitments + Strict Keys", "None", "Basic attempt counter", "None", "None")
    ]

    table_data = [headers]
    for dim, c_certus, c_ledger, c_sentinel, c_generic, c_os in matrix_rows:
        table_data.append([
            Paragraph(dim, table_cell_bold),
            Paragraph(c_certus, winner_cell_style),
            Paragraph(c_ledger, table_cell_style),
            Paragraph(c_sentinel, table_cell_style),
            Paragraph(c_generic, table_cell_style),
            Paragraph(c_os, table_cell_style),
        ])

    col_widths = [130, 150, 125, 125, 120, 120]
    t = Table(table_data, colWidths=col_widths, repeatRows=1)
    
    t_style = [
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0F172A")),
        ('BACKGROUND', (1,1), (1,-1), colors.HexColor("#ECFDF5")),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]
    
    for r in range(1, len(table_data)):
        if r % 2 == 0:
            t_style.append(('BACKGROUND', (0, r), (0, r), colors.HexColor("#F8FAFC")))
            t_style.append(('BACKGROUND', (2, r), (-1, r), colors.HexColor("#F8FAFC")))
            
    t.setStyle(TableStyle(t_style))
    story.append(t)
    story.append(PageBreak())

    # SECTION 2: GRANULAR REPO-BY-REPO BREAKDOWN
    story.append(Paragraph("🔍 2. Granular Repository-by-Repository Competitive Deep-Dive", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#2563EB"), spaceBefore=2, spaceAfter=6))
    
    story.append(Paragraph("🥈 Competitor A: <b>parthpariwandh/ledgermatch-ai</b> (Direct Track 4 Rival)", h2_style))
    story.append(Paragraph("<b>Scope:</b> Track 4 Multi-Source Reconciliation | <b>Stack:</b> Python, Fuzzy Matching, Basic LLM Prompting, Streamlit", body_style))
    story.append(Paragraph("• <b>Their Claims:</b> Reconciles ~100 records using a hybrid rule + LLM agent with basic fuzzy string matching.", bullet_style))
    story.append(Paragraph("• <b>Fatal Flaw 1 (Uncontrolled LLM Math):</b> Feeds raw financial records to an unconstrained LLM prompt. In corporate finance, LLMs hallucinate tax rates and round paise unpredictably. <i>Certus enforces 100% deterministic Python math on integer paise.</i>", bullet_style))
    story.append(Paragraph("• <b>Fatal Flaw 2 (Scale Bottleneck):</b> Only tested on ~100 records. <i>Certus is empirically benchmarked on 1,000+ records at 8,345 records/sec (sub-2ms latency).</i>", bullet_style))
    story.append(Paragraph("• <b>Fatal Flaw 3 (No Active Recovery):</b> LedgerMatch only flags mismatches. <i>Certus features a 6-step loop that auto-generates Razorpay dispute tickets, CMS bank re-fetches, and ERP journal vouchers.</i>", bullet_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph("🥉 Competitor B: <b>Teena2812/sentinel-revenue-recovery</b> (Track 3 Reference Benchmark)", h2_style))
    story.append(Paragraph("<b>Scope:</b> Track 3 Gateway Revenue Recovery | <b>Stack:</b> Python CLI, Dual-Engine Retry, Windowed Memory (116 Tests)", body_style))
    story.append(Paragraph("• <b>Their Claims:</b> 116 unit tests, dual-engine retry mechanism for failed gateway payments, windowed strategy memory.", bullet_style))
    story.append(Paragraph("• <b>Fatal Flaw 1 (Single-Source Blindspot):</b> Sentinel only matches Razorpay gateway payments vs refund logs. It has zero visibility into HDFC/ICICI bank CMS files or Tally/SAP ERP ledgers. <i>Certus is a true 3-way multi-rail operating system.</i>", bullet_style))
    story.append(Paragraph("• <b>Fatal Flaw 2 (No UI & No REST API):</b> Sentinel is strictly a CLI script. <i>Certus provides 45+ React components, 3D WebGL Three.js telemetry, and 7 FastAPI Swagger endpoints.</i>", bullet_style))
    story.append(Paragraph("• <b>Fatal Flaw 3 (Test Coverage):</b> <i>Certus exceeds Sentinel with 147 / 147 verified passing tests</i> across invariant gates, cybersecurity mesh, prompt injection defense, webhooks, circuit breakers, and regulatory laws.", bullet_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph("❌ Competitors C & D: <b>Generic Buildathon Repos & Pandas Join Scripts</b>", h2_style))
    story.append(Paragraph("<b>Scope:</b> Generic CSV Diff / Policy Simulators | <b>Stack:</b> Jupyter Notebooks, Pandas `merge(how='outer')`, Basic CSV exports", body_style))
    story.append(Paragraph("• <b>Why They Fail in Indian Commerce:</b> Bank statements do not have clean IDs; they contain messy narrations (e.g. `CMS/CR/UTR44910283910/RAZORPAY`). Naive exact merges leave <b>>40% of records unlinked</b>. <i>Certus RapidFuzz composite scoring resolves 300 orphan rows per thousand.</i>", bullet_style))
    story.append(Paragraph("• <b>Security Vulnerabilities:</b> Prone to CSV formula injection (`=cmd|' /C ...'`), prompt injection, and IEEE-754 float drift (`0.1 + 0.2 != 0.3`).", bullet_style))
    story.append(Spacer(1, 10))

    # SECTION 3: 5 PROOF POINTS TO WIN 1ST PLACE
    story.append(Paragraph("💎 3. The 5 Definite Proof Points That Win 1st Place for Certus", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#2563EB"), spaceBefore=2, spaceAfter=6))
    
    proof_points = [
        ("1. The 3-Way Cross-Rail Bridge", "Razorpay's dashboard only sees Rail 1 (Gateway). It cannot see whether funds credited to the merchant's HDFC CMS account (Rail 2) or cleared in Tally ERP (Rail 3). Certus is the 3-way bridge solving this multi-crore enterprise blindspot."),
        ("2. Zero-LLM Deterministic Financial Math", "Regulatory compliance (RBI §6.2 contact hours 9AM-6PM IST, Section 194-O TDS 1%, CGST 18%) runs in 100% deterministic Python on integer paise. AI is never allowed to hallucinate financial numbers."),
        ("3. Empirical Baseline Accuracy Gain", "Tested on 1,000 multi-rail records, Certus proves a +10.0% net accuracy lift (90.0% vs 80.0%) over naive exact matching while eliminating false positives via the Double-Lock Gate (≥ 0.75)."),
        ("4. 147 Passing Automated Tests", "147 / 147 unit, invariant, security, circuit breaker, webhook, and integration tests passing in real automated suites."),
        ("5. Enterprise Full-Stack Polish", "45+ modular React components, 3D WebGL multi-rail visualizer, FastAPI OpenAPI 3.1 Swagger docs, Prometheus /metrics telemetry, and SQLite WAL shared memory.")
    ]

    for title, desc in proof_points:
        story.append(Paragraph(f"<b>{title}:</b> {desc}", bullet_style))
        story.append(Spacer(1, 2))

    story.append(Spacer(1, 8))

    # SECTION 4: JURY DEFENSE QUICK REFERENCE TABLE
    story.append(Paragraph("🎯 4. Jury Q&A Defense Quick Reference Table", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#2563EB"), spaceBefore=2, spaceAfter=6))

    qa_headers = [
        Paragraph("Likely Judge Question", table_header_style),
        Paragraph("Your 10-Second Winning Answer", table_header_style),
    ]

    qa_data = [qa_headers, [
        Paragraph("<b>\"Why is Certus better than other hackathon submissions?\"</b>", table_cell_bold),
        Paragraph("<i>\"Other submissions either do single-source matching or delegate mathematical reconciliation to unconstrained LLMs, which hallucinate numbers. Certus is a true 3-way multi-rail controller with 55 deterministic invariant rules on integer paise, a 9-rule regulatory gate, and 147 passing tests.\"</i>", table_cell_style)
    ], [
        Paragraph("<b>\"Why does Razorpay need this if they have a settlement dashboard?\"</b>", table_cell_bold),
        Paragraph("<i>\"Razorpay's dashboard only sees Rail 1 (Gateway). It cannot see whether the funds actually credited to the merchant's HDFC CMS account (Rail 2) or if the invoice cleared in Tally ERP (Rail 3). Certus is the 3-way bridge that ensures cross-rail solvency.\"</i>", table_cell_style)
    ], [
        Paragraph("<b>\"What is your performance trade-off (8.3k vs 186k ops/s)?\"</b>", table_cell_bold),
        Paragraph("<i>\"Exact string hashing is instantaneous but blind. We trade 1.3ms per record for RapidFuzz composite scoring and double-lock consensus, catching 100 additional matched records per thousand while remaining 100x faster than real-time payment gateway traffic.\"</i>", table_cell_style)
    ], [
        Paragraph("<b>\"How do you comply with Indian regulations?\"</b>", table_cell_bold),
        Paragraph("<i>\"Our Compliance Engine (compliance_engine.py) has 9 hard-coded Python rules covering RBI Fair Practices Code §6.2 (contact hours 9AM-6PM IST), Section 194-O TDS (1%/5%), and CGST 18% with fail-closed attempt caps.\"</i>", table_cell_style)
    ]]

    qa_table = Table(qa_data, colWidths=[240, 530])
    qa_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0F172A")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor("#FFFFFF")),
        ('BACKGROUND', (0,2), (-1,2), colors.HexColor("#F8FAFC")),
        ('BACKGROUND', (0,3), (-1,3), colors.HexColor("#FFFFFF")),
        ('BACKGROUND', (0,4), (-1,4), colors.HexColor("#F8FAFC")),
    ]))
    story.append(qa_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {output_path}")


if __name__ == "__main__":
    out_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "docs", "COMPETITIVE_ANALYSIS.pdf"))
    build_pdf(out_file)
