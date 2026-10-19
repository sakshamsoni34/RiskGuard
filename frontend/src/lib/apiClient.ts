/**
 * RiskGuard Investigator — Unified Typed API Client
 * Built for same-origin proxy requests (/api/v1/*) with graceful fallback to mock data.
 */

import {
  Transaction,
  ModelMetrics,
  InvestigationCase,
  AuditLogEntry,
  InvestigationReport,
  SimulationParams,
} from "@/types/fraud";
import { initialTransactions, initialMetrics } from "./mockData";
import { calculateRisk } from "./scoringEngine";

export interface ApiResponse<T> {
  data: T;
  error?: string;
  source: "backend" | "synthetic_cache";
}

// Initial synthetic cases for Phase 1 demo
export const mockCases: InvestigationCase[] = [
  {
    id: "case-2026-001",
    caseNumber: "CR-2026-0842",
    title: "Mule Account Velocity Burst — Layered UPI Transfers",
    status: "UNDER_INVESTIGATION",
    priority: "P1_CRITICAL",
    assignedTo: "Insp. Vikram Sharma",
    targetMuleAccount: "mule-layer4@example.org",
    suspectEntity: "Apex QuickPay Aggregator (Synthetic)",
    totalAmountAtRisk: 284000,
    transactionIds: ["TXN-1002", "TXN-1003", "TXN-1004"],
    createdAt: "2026-10-18T10:14:00Z",
    updatedAt: "2026-10-19T06:30:00Z",
    tags: ["Mule-Ring", "UPI-Layering", "Velocity-Spike"],
    summary:
      "Rapid successive outward transactions originating from newly provisioned mobile device running via Tor proxy.",
    notes: [
      {
        id: "note-1",
        officerBadge: "#CC-8421",
        officerName: "Insp. V. Sharma",
        timestamp: "2026-10-18T11:00:00Z",
        text: "Flagged initial beneficiary VPA as recurring node in secondary ring. Sent advisory to partner bank.",
      },
      {
        id: "note-2",
        officerBadge: "#CC-8421",
        officerName: "Insp. V. Sharma",
        timestamp: "2026-10-19T06:30:00Z",
        text: "Confirmed correlation with 3 other accounts under same subnet 198.51.100.0/24.",
      },
    ],
  },
  {
    id: "case-2026-002",
    caseNumber: "CR-2026-0843",
    title: "Device Spoofing & High-Value Crypto Drain",
    status: "ESCALATED",
    priority: "P2_HIGH",
    assignedTo: "Sub-Insp. Priya Patel",
    targetMuleAccount: "crypto-vault-99@example.org",
    suspectEntity: "BitGlobal Exchanger (Synthetic)",
    totalAmountAtRisk: 145000,
    transactionIds: ["TXN-1001", "TXN-1005"],
    createdAt: "2026-10-17T14:22:00Z",
    updatedAt: "2026-10-18T18:45:00Z",
    tags: ["Crypto", "SIM-Swap", "Fingerprint-Anomaly"],
    summary:
      "Suspicious midnight high-amount transaction with impossible geo-velocity travel jump (>1200km in 10 mins).",
    notes: [
      {
        id: "note-1",
        officerBadge: "#CC-9104",
        officerName: "Sub-Insp. P. Patel",
        timestamp: "2026-10-17T15:00:00Z",
        text: "Requested telecom call detail records (CDR) and IP allocation logs.",
      },
    ],
  },
  {
    id: "case-2026-003",
    caseNumber: "CR-2026-0844",
    title: "E-Commerce Account Takeover (ATO) Triangulation",
    status: "NEW",
    priority: "P3_MEDIUM",
    assignedTo: "Insp. Vikram Sharma",
    targetMuleAccount: "reship-drop3@example.org",
    suspectEntity: "MegaElectronics Direct (Synthetic)",
    totalAmountAtRisk: 62000,
    transactionIds: ["TXN-1006"],
    createdAt: "2026-10-19T02:10:00Z",
    updatedAt: "2026-10-19T02:10:00Z",
    tags: ["ATO", "Gift-Cards", "New-Device"],
    summary: "Dormant user account logged in from unexpected OS to purchase high-resale gift cards.",
    notes: [],
  },
];

// Initial synthetic audit log entries
export const mockAuditLogs: AuditLogEntry[] = [
  {
    id: "aud-001",
    timestamp: "2026-10-19T08:45:12Z",
    officerId: "#CC-8421",
    officerName: "Insp. Vikram Sharma",
    action: "EVALUATE_SCORE_OVERRIDE",
    entityType: "TRANSACTION",
    entityId: "TXN-1002",
    ipAddress: "10.0.14.88",
    sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    details: "Risk score 92 verified; confirmed manual hold per SOP-402.",
  },
  {
    id: "aud-002",
    timestamp: "2026-10-19T08:12:00Z",
    officerId: "#CC-8421",
    officerName: "Insp. Vikram Sharma",
    action: "OPEN_CASE_INVESTIGATION",
    entityType: "CASE",
    entityId: "CR-2026-0842",
    ipAddress: "10.0.14.88",
    sha256Hash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    details: "Created investigation file linking 3 transactions to suspected mule cluster.",
  },
  {
    id: "aud-003",
    timestamp: "2026-10-19T07:30:25Z",
    officerId: "#CC-9104",
    officerName: "Sub-Insp. Priya Patel",
    action: "CASE_STATUS_TRANSITION",
    entityType: "CASE",
    entityId: "CR-2026-0843",
    ipAddress: "10.0.14.92",
    sha256Hash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
    details: "Escalated case to Senior Cyber Cell Inspector for telecom liaison warrant.",
  },
  {
    id: "aud-004",
    timestamp: "2026-10-19T06:00:10Z",
    officerId: "SYSTEM_DAEMON",
    officerName: "RiskGuard Integrity Guard",
    action: "CHAIN_INTEGRITY_CHECK",
    entityType: "MODEL",
    entityId: "XGB-V1.0",
    ipAddress: "127.0.0.1",
    sha256Hash: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    details: "Routine SHA-256 block verification completed. 104 entries verified intact.",
  },
];

// Initial synthetic reports
export const mockReports: InvestigationReport[] = [
  {
    id: "rep-001",
    reportNumber: "IR-2026-041",
    caseId: "CR-2026-0842",
    title: "Preliminary Telemetry & Mule Ring Correlation Report",
    generatedBy: "Insp. Vikram Sharma (#CC-8421)",
    generatedAt: "2026-10-19T07:00:00Z",
    totalTransactions: 3,
    totalDisputedAmount: 284000,
    primaryTypology: "Layered Account Velocity Burst",
    sha256VerificationHash: "9f83c605ae74f0d15224d312f3d8a983137a178ffeb2b94777d4b415a4f51413",
    status: "SEALED",
  },
  {
    id: "rep-002",
    reportNumber: "IR-2026-042",
    caseId: "CR-2026-0843",
    title: "Device Identity Anomaly & High-Risk Outflow Brief",
    generatedBy: "Sub-Insp. Priya Patel (#CC-9104)",
    generatedAt: "2026-10-18T16:30:00Z",
    totalTransactions: 2,
    totalDisputedAmount: 145000,
    primaryTypology: "Impossible Travel / Geolocation Jump",
    sha256VerificationHash: "ec7f42c6767562095f973f5509705ca652496739e17b8f04c6e94916a445c9be",
    status: "DRAFT",
  },
];

class ApiClient {
  private isOfflineOnly: boolean = false;

  async getTransactions(limit: number = 50): Promise<ApiResponse<Transaction[]>> {
    try {
      const res = await fetch(`/api/v1/transactions?limit=${limit}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        return { data, source: "backend" };
      }
    } catch {
      // Fallback
    }
    return {
      data: initialTransactions,
      source: "synthetic_cache",
    };
  }

  async getCases(): Promise<ApiResponse<InvestigationCase[]>> {
    try {
      const res = await fetch("/api/v1/cases", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        return { data, source: "backend" };
      }
    } catch {
      // Fallback
    }
    return {
      data: mockCases,
      source: "synthetic_cache",
    };
  }

  async getAuditLogs(): Promise<ApiResponse<AuditLogEntry[]>> {
    try {
      const res = await fetch("/api/v1/audit/logs", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        return { data, source: "backend" };
      }
    } catch {
      // Fallback
    }
    return {
      data: mockAuditLogs,
      source: "synthetic_cache",
    };
  }

  async getReports(): Promise<ApiResponse<InvestigationReport[]>> {
    try {
      const res = await fetch("/api/v1/reports", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        return { data, source: "backend" };
      }
    } catch {
      // Fallback
    }
    return {
      data: mockReports,
      source: "synthetic_cache",
    };
  }

  async getMetrics(): Promise<ApiResponse<ModelMetrics>> {
    try {
      const res = await fetch("/api/v1/models/metrics", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        return { data, source: "backend" };
      }
    } catch {
      // Graceful fallback to mock data
    }
    return { data: initialMetrics, source: "synthetic_cache" };
  }

  async evaluateSimulation(params: SimulationParams) {
    try {
      const res = await fetch("/api/v1/transactions/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: params.amount,
          currency: params.currency,
          merchant_category: params.merchantCategory,
          is_new_device: params.isNewDevice,
          velocity_2min: params.velocityLast2Min,
          is_vpn_proxy: params.isVpnOrProxy,
          distance_jump_km: params.distanceJumpKm,
          avg_user_amount: params.avgUserAmount,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        return { data: result, source: "backend" as const };
      }
    } catch {
      // Fallback
    }

    const fallback = calculateRisk(params);
    return { data: fallback, source: "synthetic_cache" as const };
  }
}

export const apiClient = new ApiClient();
