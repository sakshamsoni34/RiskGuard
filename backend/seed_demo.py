import os
import sys
import json
from datetime import datetime, timezone, timedelta
import random

# Ensure root is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.core.database import engine, Base, SessionLocal
from backend.app.core.security import hash_password, compute_audit_hash
from backend.app.models.user import User
from backend.app.models.transaction import TransactionRecord
from backend.app.models.case import CaseRecord, CaseTransactionLink, CaseNoteRecord
from backend.app.models.audit import AuditLogRecord
from backend.app.models.report import ReportRecord
from backend.app.services.audit import GENESIS_HASH


def seed_database():
    print("Initializing RiskGuard Investigator Database Tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Clean existing demo data for clean idempotency
        db.query(CaseNoteRecord).delete()
        db.query(CaseTransactionLink).delete()
        db.query(CaseRecord).delete()
        db.query(ReportRecord).delete()
        db.query(AuditLogRecord).delete()
        db.query(TransactionRecord).delete()
        db.query(User).delete()
        db.commit()

        print("Seeding Authorized Cyber Cell Demo Officers...")
        officers = [
            User(
                badge_number="CC-8421",
                username="vsharma",
                hashed_password=hash_password("investigator123"),
                full_name="Insp. Vikram Sharma",
                rank="Lead Cyber Investigator",
                cell="FinFraud Triage Unit 4",
                role="INVESTIGATOR",
            ),
            User(
                badge_number="CC-9104",
                username="ppatel",
                hashed_password=hash_password("investigator123"),
                full_name="Sub-Insp. Priya Patel",
                rank="Financial Intelligence Analyst",
                cell="Digital Forensics Division",
                role="INVESTIGATOR",
            ),
            User(
                badge_number="SUP-010",
                username="rnair",
                hashed_password=hash_password("supervisor123"),
                full_name="ACP Rajesh Nair",
                rank="Assistant Commissioner of Police",
                cell="Cyber Command Oversight",
                role="SUPERVISOR",
            ),
            User(
                badge_number="ADM-001",
                username="mdesai",
                hashed_password=hash_password("admin123"),
                full_name="Admin Meera Desai",
                rank="Lead Systems Security Officer",
                cell="Infrastructure Security Unit",
                role="ADMIN",
            ),
        ]
        for officer in officers:
            db.add(officer)
        db.commit()

        print("Seeding Synthetic Transactions...")
        now = datetime.now(timezone.utc)
        categories = ["Electronics", "Jewelry", "Travel", "Gaming", "Crypto", "Grocery", "Utilities"]
        cities = [
            ("Mumbai", "India", 15),
            ("Delhi", "India", 25),
            ("Bengaluru", "India", 40),
            ("Kolkata", "India", 1200),
            ("Hyderabad", "India", 700),
            ("Dubai", "UAE", 1930),
            ("Singapore", "Singapore", 3900),
        ]

        txns = []
        for i in range(1, 61):
            txn_id = f"TXN-{1000 + i}"
            time_offset = now - timedelta(minutes=(60 - i) * 7)
            city_info = random.choice(cities)
            category = random.choice(categories)

            # Assign risk profile
            if i in [2, 3, 4, 15, 28, 42, 55]:
                # Critical / High risk fraud
                amount = random.randint(85000, 290000)
                risk_score = random.uniform(78.0, 96.0)
                risk_level = "CRITICAL" if risk_score >= 90 else "HIGH"
                decision = "BLOCKED"
                is_vpn = True
                is_new_device = True
                velocity = random.randint(3, 7)
                flags = ["RAPID_BURST_VELOCITY", "HIGH_VALUE_OUTFLOW", "TOR_PROXY_DETECTED"]
            elif i in [8, 12, 22, 35, 48]:
                # Medium risk OTP
                amount = random.randint(25000, 75000)
                risk_score = random.uniform(42.0, 68.0)
                risk_level = "MEDIUM"
                decision = "OTP_REQUIRED"
                is_vpn = False
                is_new_device = True
                velocity = 2
                flags = ["NEW_DEVICE_CHALLENGE"]
            else:
                # Legitimate low risk
                amount = random.randint(400, 18500)
                risk_score = random.uniform(4.0, 28.0)
                risk_level = "LOW"
                decision = "APPROVED"
                is_vpn = False
                is_new_device = False
                velocity = 1
                flags = []

            shap_items = [
                {
                    "feature": "amount",
                    "contribution": 32.0 if amount > 50000 else -8.0,
                    "direction": "increase" if amount > 50000 else "decrease",
                    "rawValue": amount,
                    "description": "Transaction amount vs user historical baseline",
                },
                {
                    "feature": "velocity_2min",
                    "contribution": 28.0 if velocity > 2 else -4.0,
                    "direction": "increase" if velocity > 2 else "decrease",
                    "rawValue": velocity,
                    "description": "Rapid successive transaction frequency",
                },
                {
                    "feature": "is_vpn_proxy",
                    "contribution": 22.0 if is_vpn else -6.0,
                    "direction": "increase" if is_vpn else "decrease",
                    "rawValue": is_vpn,
                    "description": "Anonymizing proxy / VPN detection",
                },
            ]

            t = TransactionRecord(
                id=txn_id,
                timestamp=time_offset,
                customer_id=f"CUST-0{100 + (i % 20)}",
                customer_name=f"Fictional User {i}",
                customer_email=f"user{i}@example.org",
                customer_phone=f"+91 98765 {i:05d}",
                amount=float(amount),
                currency="INR",
                merchant=f"Merchant {category} Direct",
                merchant_category=category,
                payment_type="upi" if i % 2 == 0 else "card",
                payment_brand="RuPay" if i % 2 == 0 else "Visa",
                is_new_device=is_new_device,
                device_os="Android 14" if i % 2 == 0 else "iOS 18",
                device_browser="Chrome Mobile" if i % 2 == 0 else "Mobile Safari",
                device_fingerprint=f"fp-hash-{i * 987234:x}",
                ip_address=f"198.51.100.{i % 250}",
                city=city_info[0],
                country=city_info[1],
                is_vpn_or_proxy=is_vpn,
                distance_from_home_km=float(city_info[2]),
                velocity_2min=velocity,
                risk_score=round(risk_score, 1),
                risk_level=risk_level,
                decision=decision,
                status="PROCESSED",
                anomaly_score=round(risk_score / 100.0, 3),
                rule_flags_json=json.dumps(flags),
                shap_explanation_json=json.dumps(shap_items),
                is_synthetic=True,
            )
            txns.append(t)
            db.add(t)
        db.commit()

        print("Seeding Initial Cyber Crime Cases...")
        cases_data = [
            {
                "number": "CR-2026-0842",
                "title": "Mule Account Velocity Burst — Layered UPI Transfers",
                "status": "UNDER_INVESTIGATION",
                "priority": "P1_CRITICAL",
                "assigned": "Insp. Vikram Sharma",
                "mule": "mule-layer4@example.org",
                "suspect": "Apex QuickPay Aggregator (Synthetic)",
                "amount": 284000.0,
                "txns": ["TXN-1002", "TXN-1003", "TXN-1004"],
                "summary": "Rapid successive outward transactions originating from newly provisioned mobile device running via Tor proxy.",
                "tags": ["Mule-Ring", "UPI-Layering", "Velocity-Spike"],
                "notes": [
                    "Flagged initial beneficiary VPA as recurring node in secondary ring. Sent advisory to partner bank.",
                    "Confirmed correlation with 3 other accounts under same subnet 198.51.100.0/24.",
                ],
            },
            {
                "number": "CR-2026-0843",
                "title": "Device Spoofing & High-Value Crypto Drain",
                "status": "ESCALATED",
                "priority": "P2_HIGH",
                "assigned": "Sub-Insp. Priya Patel",
                "mule": "crypto-vault-99@example.org",
                "suspect": "BitGlobal Exchanger (Synthetic)",
                "amount": 145000.0,
                "txns": ["TXN-1015", "TXN-1028"],
                "summary": "Suspicious midnight high-amount transaction with impossible geo-velocity travel jump (>1200km in 10 mins).",
                "tags": ["Crypto", "SIM-Swap", "Fingerprint-Anomaly"],
                "notes": ["Requested telecom call detail records (CDR) and IP allocation logs."],
            },
            {
                "number": "CR-2026-0844",
                "title": "E-Commerce Account Takeover (ATO) Triangulation",
                "status": "NEW",
                "priority": "P3_MEDIUM",
                "assigned": "Insp. Vikram Sharma",
                "mule": "reship-drop3@example.org",
                "suspect": "MegaElectronics Direct (Synthetic)",
                "amount": 62000.0,
                "txns": ["TXN-1042"],
                "summary": "Dormant user account logged in from unexpected OS to purchase high-resale gift cards.",
                "tags": ["ATO", "Gift-Cards", "New-Device"],
                "notes": ["Dossier initialized upon automated heuristic threshold trigger."],
            },
        ]

        for cd in cases_data:
            c = CaseRecord(
                case_number=cd["number"],
                title=cd["title"],
                status=cd["status"],
                priority=cd["priority"],
                assigned_to=cd["assigned"],
                target_mule_account=cd["mule"],
                suspect_entity=cd["suspect"],
                total_amount_at_risk=cd["amount"],
                summary=cd["summary"],
                tags_json=json.dumps(cd["tags"]),
            )
            db.add(c)
            db.commit()
            db.refresh(c)

            for tid in cd["txns"]:
                link = CaseTransactionLink(case_id=c.id, transaction_id=tid)
                db.add(link)

            for note_text in cd["notes"]:
                n = CaseNoteRecord(
                    case_id=c.id,
                    officer_badge="#CC-8421",
                    officer_name="Insp. Vikram Sharma",
                    text=note_text,
                )
                db.add(n)
            db.commit()

        print("Seeding Tamper-Evident SHA-256 Audit Log Chain...")
        audit_events = [
            ("SYSTEM_DAEMON", "RiskGuard Integrity Guard", "SYSTEM_STARTUP", "MODEL", "XGB-V1.0", "Core microservices initialized with SHA-256 hash chaining active."),
            ("#CC-8421", "Insp. Vikram Sharma", "CASE_REGISTERED", "CASE", "CR-2026-0842", "Case file opened: Mule Account Velocity Burst."),
            ("#CC-9104", "Sub-Insp. Priya Patel", "CASE_REGISTERED", "CASE", "CR-2026-0843", "Case file opened: Device Spoofing & High-Value Crypto Drain."),
            ("#CC-8421", "Insp. Vikram Sharma", "TRANSACTION_MANUAL_OVERRIDE", "TRANSACTION", "TXN-1002", "Held transaction under SOP-402 pending beneficiary freeze."),
            ("SUP-010", "ACP Rajesh Nair", "CASE_STATUS_UPDATED", "CASE", "CR-2026-0843", "Escalated case to Senior Cyber Cell Inspector for telecom liaison warrant."),
        ]

        prev_hash = GENESIS_HASH
        for i, (off_id, off_name, action, ent_type, ent_id, details) in enumerate(audit_events):
            t_stamp = (now - timedelta(minutes=(5 - i) * 15)).strftime("%Y-%m-%dT%H:%M:%SZ")
            h = compute_audit_hash(prev_hash, t_stamp, off_id, action, ent_id, details)
            rec = AuditLogRecord(
                timestamp=datetime.strptime(t_stamp, "%Y-%m-%dT%H:%M:%SZ"),
                prev_hash=prev_hash,
                sha256_hash=h,
                officer_id=off_id,
                officer_name=off_name,
                action=action,
                entity_type=ent_type,
                entity_id=ent_id,
                details=details,
            )
            db.add(rec)
            prev_hash = h
        db.commit()

        print("Seeding Initial Sealed Reports...")
        r1 = ReportRecord(
            report_number="IR-2026-041",
            case_id="CR-2026-0842",
            generated_by="Insp. Vikram Sharma (#CC-8421)",
            generated_at=now - timedelta(hours=2),
            title="Preliminary Telemetry & Mule Ring Correlation Report",
            total_transactions=3,
            total_disputed_amount=284000.0,
            primary_typology="Layered Account Velocity Burst",
            sha256_verification_hash="9f83c605ae74f0d15224d312f3d8a983137a178ffeb2b94777d4b415a4f51413",
            status="SEALED",
        )
        r2 = ReportRecord(
            report_number="IR-2026-042",
            case_id="CR-2026-0843",
            generated_by="Sub-Insp. Priya Patel (#CC-9104)",
            generated_at=now - timedelta(hours=5),
            title="Device Identity Anomaly & High-Risk Outflow Brief",
            total_transactions=2,
            total_disputed_amount=145000.0,
            primary_typology="Impossible Travel / Geolocation Jump",
            sha256_verification_hash="ec7f42c6767562095f973f5509705ca652496739e17b8f04c6e94916a445c9be",
            status="DRAFT",
        )
        db.add(r1)
        db.add(r2)
        db.commit()

        print("✅ Database seeding completed successfully!")
        print(f"Seeded: 4 Officers, 60 Transactions, 3 Cases, {len(audit_events)} Audit Logs, 2 Reports.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
