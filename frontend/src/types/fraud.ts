export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DecisionAction = 'APPROVED' | 'OTP_REQUIRED' | 'BLOCKED';
export type CaseStatus = 'NEW' | 'UNDER_INVESTIGATION' | 'PENDING_APPROVAL' | 'ESCALATED' | 'CLOSED';
export type CasePriority = 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';

export interface OfficerUser {
  id: string;
  badgeNumber: string;
  name: string;
  rank: string;
  cell: string;
  role: 'INVESTIGATOR' | 'SUPERVISOR' | 'ADMIN' | 'READONLY';
  unit: string;
}

export interface CaseNote {
  id: string;
  officerBadge: string;
  officerName: string;
  timestamp: string;
  text: string;
}

export interface InvestigationCase {
  id: string;
  caseNumber: string;
  title: string;
  status: CaseStatus;
  priority: CasePriority;
  assignedTo: string;
  targetMuleAccount?: string;
  suspectEntity?: string;
  totalAmountAtRisk: number;
  transactionIds: string[];
  createdAt: string;
  updatedAt: string;
  tags: string[];
  notes: CaseNote[];
  summary: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  officerId: string;
  officerName: string;
  action: string;
  entityType: 'TRANSACTION' | 'CASE' | 'MODEL' | 'REPORT' | 'USER_SESSION';
  entityId: string;
  ipAddress: string;
  sha256Hash: string;
  details: string;
}

export interface InvestigationReport {
  id: string;
  reportNumber: string;
  caseId: string;
  generatedBy: string;
  generatedAt: string;
  title: string;
  totalTransactions: number;
  totalDisputedAmount: number;
  primaryTypology: string;
  sha256VerificationHash: string;
  status: 'DRAFT' | 'SEALED' | 'DISPATCHED_TO_LEGAL';
}

export interface ShapValue {
  feature: string;
  contribution: number; // e.g. +24 or -12
  direction: 'increase' | 'decrease';
  rawValue: string | number;
  description: string;
}

export interface DeviceInfo {
  browser: string;
  os: string;
  fingerprintHash: string;
  isNewDevice: boolean;
  screenResolution: string;
}

export interface GeoLocation {
  city: string;
  country: string;
  ipAddress: string;
  isVpnOrProxy: boolean;
  distanceFromHomeKm: number;
}

export interface TransactionVelocity {
  last2MinutesCount: number;
  lastHourCount: number;
  totalSpentToday: number;
}

export interface PaymentMethod {
  type: 'card' | 'upi' | 'netbanking';
  brand?: 'Visa' | 'Mastercard' | 'RuPay';
  last4?: string;
  upiHandle?: string;
  bankName?: string;
}

export interface Transaction {
  id: string;
  timestamp: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  currency: string;
  merchant: string;
  merchantCategory: 'Electronics' | 'Jewelry' | 'Grocery' | 'Travel' | 'Gaming' | 'Crypto' | 'Utilities';
  paymentMethod: PaymentMethod;
  device: DeviceInfo;
  location: GeoLocation;
  velocity: TransactionVelocity;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  decision: DecisionAction;
  status: 'PROCESSED' | 'REVIEWED' | 'MANUALLY_OVERRIDDEN';
  shapExplanation: ShapValue[];
  anomalyScore: number;
  ruleFlags: string[];
}

export interface ModelMetrics {
  totalProcessed: number;
  fraudBlockedAmount: number;
  fraudAttemptCount: number;
  otpChallengeCount: number;
  autoApprovedCount: number;
  precision: number;
  recall: number;
  f1Score: number;
  prAuc: number;
  rocAuc: number;
  falsePositiveRate: number;
  avgLatencyMs: number;
}

export interface SimulationParams {
  amount: number;
  currency: string;
  merchantCategory: string;
  isNewDevice: boolean;
  velocityLast2Min: number;
  isVpnOrProxy: boolean;
  distanceJumpKm: number;
  avgUserAmount: number;
}
