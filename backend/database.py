"""
BankMitra SQLite Database Interface
Zero real customer data. Demonstrates local synthetic case storage and audit trails.
"""
import sqlite3
import os
from pathlib import Path
from typing import List, Dict, Any, Optional

DB_PATH = os.environ.get(
    "BANKMITRA_DB_PATH",
    str(Path(__file__).resolve().parent / "bankmitra.db")
)

def get_connection(db_path: str = DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db(db_path: str = DB_PATH) -> None:
    """Initialize schema for cases, barrier_assessments, interventions, outcomes, service_directory, audit_events."""
    conn = get_connection(db_path)
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS service_directory (
        service_id TEXT PRIMARY KEY,
        institution TEXT NOT NULL,
        service_type TEXT NOT NULL,
        location_label TEXT NOT NULL,
        authorised_status BOOLEAN NOT NULL DEFAULT 1,
        verification_source TEXT NOT NULL,
        last_verified_at TEXT NOT NULL,
        contact_route TEXT NOT NULL,
        is_synthetic BOOLEAN NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS cases (
        case_id TEXT PRIMARY KEY,
        customer_token TEXT NOT NULL UNIQUE,
        region TEXT NOT NULL DEFAULT 'Central Zone',
        workflow_stage TEXT NOT NULL DEFAULT 'ASSESSMENT',
        status_source TEXT NOT NULL,
        review_date TEXT NOT NULL,
        inactivity_band TEXT NOT NULL,
        account_origin TEXT NOT NULL,
        consent_status TEXT NOT NULL,
        contact_permission BOOLEAN NOT NULL DEFAULT 1,
        preferred_channel TEXT NOT NULL,
        source_authorisation TEXT NOT NULL,
        is_synthetic BOOLEAN NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS barrier_assessments (
        assessment_id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL UNIQUE,
        barrier_primary TEXT NOT NULL,
        barrier_secondary TEXT,
        evidence_source TEXT NOT NULL,
        confidence_label TEXT NOT NULL,
        customer_confirmed BOOLEAN NOT NULL DEFAULT 0,
        recorded_at TEXT NOT NULL,
        notes TEXT,
        is_synthetic BOOLEAN NOT NULL DEFAULT 1,
        FOREIGN KEY(case_id) REFERENCES cases(case_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS interventions (
        intervention_id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL UNIQUE,
        rule_id TEXT NOT NULL,
        intervention_type TEXT NOT NULL,
        service_id TEXT,
        destination_verified BOOLEAN NOT NULL DEFAULT 0,
        assigned_channel TEXT NOT NULL,
        customer_decision TEXT NOT NULL DEFAULT 'PENDING_DECISION',
        completion_status TEXT NOT NULL DEFAULT 'NOT_OFFERED',
        offered_at TEXT NOT NULL,
        completed_at TEXT,
        explanation_note TEXT,
        is_synthetic BOOLEAN NOT NULL DEFAULT 1,
        FOREIGN KEY(case_id) REFERENCES cases(case_id) ON DELETE CASCADE,
        FOREIGN KEY(service_id) REFERENCES service_directory(service_id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS outcomes (
        outcome_id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL UNIQUE,
        barrier_resolved_self_reported BOOLEAN NOT NULL DEFAULT 0,
        barrier_resolved_verified BOOLEAN NOT NULL DEFAULT 0,
        account_status_after TEXT NOT NULL DEFAULT 'INOPERATIVE_UNCHANGED',
        meaningful_use_status TEXT NOT NULL DEFAULT 'NOT_MEASURED_YET',
        outcome_source TEXT NOT NULL DEFAULT 'UNVERIFIED',
        follow_up_date TEXT,
        opt_out BOOLEAN NOT NULL DEFAULT 0,
        notes TEXT,
        is_synthetic BOOLEAN NOT NULL DEFAULT 1,
        FOREIGN KEY(case_id) REFERENCES cases(case_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_events (
        event_id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        actor_role TEXT NOT NULL,
        action TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        details TEXT NOT NULL,
        purpose_code TEXT NOT NULL,
        is_synthetic BOOLEAN NOT NULL DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_cases_customer_token ON cases(customer_token);
    CREATE INDEX IF NOT EXISTS idx_audit_case_id ON audit_events(case_id);
    """)

    # Column migrations for existing tables
    cursor.execute("PRAGMA table_info(cases)")
    case_cols = [row["name"] for row in cursor.fetchall()]
    if "region" not in case_cols:
        cursor.execute("ALTER TABLE cases ADD COLUMN region TEXT NOT NULL DEFAULT 'Central Zone'")
    if "workflow_stage" not in case_cols:
        cursor.execute("ALTER TABLE cases ADD COLUMN workflow_stage TEXT NOT NULL DEFAULT 'ASSESSMENT'")

    conn.commit()
    conn.close()

def log_audit_event(
    case_id: str,
    actor_role: str,
    action: str,
    details: str,
    purpose_code: str = "FINANCIAL_INCLUSION_REVIEW",
    db_path: str = DB_PATH
) -> str:
    import uuid
    from datetime import datetime, timezone
    
    event_id = f"EVT-{uuid.uuid4().hex[:8].upper()}"
    ts = datetime.now(timezone.utc).isoformat()
    conn = get_connection(db_path)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO audit_events (event_id, case_id, actor_role, action, timestamp, details, purpose_code, is_synthetic)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    """, (event_id, case_id, actor_role, action, ts, details, purpose_code))
    conn.commit()
    conn.close()
    return event_id
