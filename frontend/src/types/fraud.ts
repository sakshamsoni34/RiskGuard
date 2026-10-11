export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type DecisionAction = 'APPROVED' | 'OTP_REQUIRED' | 'BLOCKED';

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
