import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from datetime import datetime, timezone
import hashlib


def generate_pdf_report(
    report_number: str,
    case_number: str,
    title: str,
    officer_name: str,
    total_amount: float,
    total_txns: int,
    typology: str,
    output_dir: str = "./reports_generated",
) -> tuple[str, str]:
    os.makedirs(output_dir, exist_ok=True)
    filename = f"{report_number}.pdf"
    filepath = os.path.join(output_dir, filename)

    c = canvas.Canvas(filepath, pagesize=letter)
    width, height = letter

    # Watermark
    c.saveState()
    c.setFont("Helvetica-Bold", 45)
    c.setFillColor(colors.Color(0.85, 0.85, 0.9, alpha=0.12))
    c.translate(width / 2, height / 2)
    c.rotate(35)
    c.drawCentredString(0, 0, "CYBER CELL • CONFIDENTIAL")
    c.restoreState()

    # Header Bar
    c.setFillColor(colors.HexColor("#0d1424"))
    c.rect(0, height - 80, width, 80, fill=1, stroke=0)

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(40, height - 40, "CYBER CRIME CELL — INVESTIGATION REPORT")
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.HexColor("#a5b4fc"))
    c.drawString(40, height - 58, "GOVERNMENT OF INDIA • FIN-FRAUD INTELLIGENCE UNIT 4")

    # Metadata Box
    c.setFillColor(colors.HexColor("#1e293b"))
    c.setFont("Helvetica-Bold", 12)
    c.drawString(40, height - 110, f"Dossier No: {report_number}")
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawString(40, height - 128, f"Case File: {case_number} | Certifying Officer: {officer_name}")

    # Divider
    c.setStrokeColor(colors.HexColor("#cbd5e1"))
    c.setLineWidth(1)
    c.line(40, height - 140, width - 40, height - 140)

    # Narrative
    c.setFillColor(colors.HexColor("#0f172a"))
    c.setFont("Helvetica-Bold", 12)
    c.drawString(40, height - 165, f"Subject: {title}")

    c.setFont("Helvetica", 10)
    c.setFillColor(colors.HexColor("#334155"))
    c.drawString(40, height - 195, f"Primary Typology: {typology}")
    c.drawString(40, height - 215, f"Total Disputed / Flagged Volume: INR {total_amount:,.2f}")
    c.drawString(40, height - 235, f"Corroborating Evidence Transactions: {total_txns} items linked")
    c.drawString(40, height - 255, f"Timestamp of Certification: {datetime.now(timezone.utc).isoformat()}")

    # Legal Disclaimer (Sec 65B)
    c.setFillColor(colors.HexColor("#f8fafc"))
    c.rect(40, height - 350, width - 80, 75, fill=1, stroke=1)
    c.setStrokeColor(colors.HexColor("#e2e8f0"))

    c.setFillColor(colors.HexColor("#b45309"))
    c.setFont("Helvetica-Bold", 9)
    c.drawString(50, height - 290, "INDIAN EVIDENCE ACT SEC 65B STATUTORY DECLARATION:")
    c.setFillColor(colors.HexColor("#64748b"))
    c.setFont("Helvetica", 8)
    disclaimer_text = (
        "This electronic briefing compiles algorithmic risk assessments and SHAP attribution models for investigative "
        "prioritization. Output does not constitute conclusive proof of guilt without independent corroborating bank certification."
    )
    c.drawString(50, height - 310, disclaimer_text[:95])
    c.drawString(50, height - 325, disclaimer_text[95:])

    # Compute PDF content hash
    c.save()

    with open(filepath, "rb") as f:
        file_hash = hashlib.sha256(f.read()).hexdigest()

    return filepath, file_hash
