import { Transaction, ModelMetrics } from "@/types/fraud";
import { calculateRisk } from "./scoringEngine";

export const initialTransactions: Transaction[] = [
  // 1. Critical Fraud Case (exact abstract scenario: ₹85,000, new device, foreign location, 3 tx in 2 min)
  {
    id: "TXN-1048",
    timestamp: "15:09:42",
    customerId: "CUST-8492",
    customerName: "Vikram Mehta",
    amount: 85000,
    currency: "INR",
    merchant: "Apple Store Online",
    merchantCategory: "Electronics",
    device: {
      browser: "Headless Chrome v121",
      os: "Linux (Virtual Machine)",
      fingerprintHash: "fp_9f8d3a1",
      isNewDevice: true,
      screenResolution: "800x600",
    },
    location: {
      city: "Lagos",
      country: "Nigeria",
      ipAddress: "197.210.226.41",
      isVpnOrProxy: true,
      distanceFromHomeKm: 7200,
    },
    velocity: {
      last2MinutesCount: 3,
      lastHourCount: 5,
      totalSpentToday: 142000,
    },
    riskScore: 94,
    riskLevel: "HIGH",
    decision: "BLOCKED",
    status: "PROCESSED",
    shapExplanation: [
      {
        feature: "High Velocity Spike",
        contribution: 34,
        direction: "increase",
        rawValue: "3 transactions in 2 min",
        description: "Burst attempt frequency characteristic of automated script or card cracking attack",
      },
      {
        feature: "Anonymous Proxy / VPN Detected",
        contribution: 24,
        direction: "increase",
        rawValue: "Datacenter VPN IP (Tor / ASN 29838)",
        description: "Traffic routed via known anonymizing residential proxy farm",
      },
      {
        feature: "Unrecognized Device Fingerprint",
        contribution: 22,
        direction: "increase",
        rawValue: "New Browser / Linux VM Token",
        description: "Zero session history on this client hardware fingerprint",
      },
      {
        feature: "Impossible Travel / Distance Jump",
        contribution: 21,
        direction: "increase",
        rawValue: "7,200 km jump from Mumbai",
        description: "Impossible physical travel time between Mumbai home IP and Lagos IP in < 1 hour",
      },
      {
        feature: "Amount Deviation",
        contribution: 18,
        direction: "increase",
        rawValue: "₹85,000 (14.2x customer average)",
        description: "Significantly exceeds cardholder standard ₹6,000 average purchase amount",
      },
    ],
    anomalyScore: 0.94,
    ruleFlags: ["HIGH_AMOUNT_OUTLIER", "VELOCITY_BURST_CRITICAL", "NEW_DEVICE_IDENTIFIED", "VPN_PROXY_MASKED", "IMPOSSIBLE_TRAVEL_GEO"],
  },

  // 2. Medium Risk Case (Requires OTP Step-up Auth)
  {
    id: "TXN-1047",
    timestamp: "15:08:15",
    customerId: "CUST-3910",
    customerName: "Ananya Iyer",
    amount: 28500,
    currency: "INR",
    merchant: "Tanishq Jewellers",
    merchantCategory: "Jewelry",
    device: {
      browser: "Safari Mobile v17.2",
      os: "iOS 17 (iPhone 14)",
      fingerprintHash: "fp_44e190b",
      isNewDevice: true,
      screenResolution: "390x844",
    },
    location: {
      city: "Bengaluru",
      country: "India",
      ipAddress: "103.112.44.18",
      isVpnOrProxy: false,
      distanceFromHomeKm: 28,
    },
    velocity: {
      last2MinutesCount: 1,
      lastHourCount: 2,
      totalSpentToday: 32000,
    },
    riskScore: 58,
    riskLevel: "MEDIUM",
    decision: "OTP_REQUIRED",
    status: "PROCESSED",
    shapExplanation: [
      {
        feature: "Unrecognized Device Fingerprint",
        contribution: 22,
        direction: "increase",
        rawValue: "New Device (iOS 17)",
        description: "First time transacting from this smartphone device",
      },
      {
        feature: "Amount Deviation",
        contribution: 14,
        direction: "increase",
        rawValue: "₹28,500 (3.1x avg)",
        description: "Higher than typical grocery/retail tickets",
      },
      {
        feature: "Habitual Geolocation Match",
        contribution: -10,
        direction: "decrease",
        rawValue: "Bengaluru, 28 km",
        description: "Within cardholder primary metropolitan residential perimeter",
      },
    ],
    anomalyScore: 0.42,
    ruleFlags: ["NEW_DEVICE_IDENTIFIED"],
  },

  // 3. Low Risk Case (Auto-Approved)
  {
    id: "TXN-1046",
    timestamp: "15:07:30",
    customerId: "CUST-1192",
    customerName: "Rahul Reddy",
    amount: 1499,
    currency: "INR",
    merchant: "Blinkit Grocery",
    merchantCategory: "Grocery",
    device: {
      browser: "Chrome v122",
      os: "Windows 11",
      fingerprintHash: "fp_aa88102",
      isNewDevice: false,
      screenResolution: "1920x1080",
    },
    location: {
      city: "Hyderabad",
      country: "India",
      ipAddress: "157.48.91.201",
      isVpnOrProxy: false,
      distanceFromHomeKm: 6,
    },
    velocity: {
      last2MinutesCount: 1,
      lastHourCount: 1,
      totalSpentToday: 1499,
    },
    riskScore: 8,
    riskLevel: "LOW",
    decision: "APPROVED",
    status: "PROCESSED",
    shapExplanation: [
      {
        feature: "Trusted Device Token",
        contribution: -14,
        direction: "decrease",
        rawValue: "Known Device ID",
        description: "Authenticated 48 historical purchases over past 8 months",
      },
      {
        feature: "Habitual Geolocation Match",
        contribution: -10,
        direction: "decrease",
        rawValue: "6 km from home",
        description: "Matches regular broadband ISP and geo lat/long",
      },
      {
        feature: "Consistent Spend Profile",
        contribution: -8,
        direction: "decrease",
        rawValue: "₹1,499 (0.8x avg)",
        description: "Standard grocery retail pattern",
      },
    ],
    anomalyScore: 0.05,
    ruleFlags: [],
  },

  // 4. Crypto P2P Fraud Attack
  {
    id: "TXN-1045",
    timestamp: "15:05:12",
    customerId: "CUST-7711",
    customerName: "Rohan Chopra",
    amount: 98000,
    currency: "INR",
    merchant: "Binance P2P Exchange",
    merchantCategory: "Crypto",
    device: {
      browser: "Firefox v118",
      os: "Linux",
      fingerprintHash: "fp_88bc41e",
      isNewDevice: true,
      screenResolution: "1366x768",
    },
    location: {
      city: "Moscow",
      country: "Russia",
      ipAddress: "185.191.171.12",
      isVpnOrProxy: true,
      distanceFromHomeKm: 4800,
    },
    velocity: {
      last2MinutesCount: 4,
      lastHourCount: 7,
      totalSpentToday: 210000,
    },
    riskScore: 97,
    riskLevel: "HIGH",
    decision: "BLOCKED",
    status: "PROCESSED",
    shapExplanation: [
      {
        feature: "High Velocity Spike",
        contribution: 34,
        direction: "increase",
        rawValue: "4 transactions in 2 min",
        description: "Extreme transaction burst frequency",
      },
      {
        feature: "Anonymous Proxy / VPN Detected",
        contribution: 24,
        direction: "increase",
        rawValue: "Russian Proxy",
        description: "Known bulletproof VPN subnet",
      },
      {
        feature: "High-Risk Merchant Sector",
        contribution: 15,
        direction: "increase",
        rawValue: "Crypto Exchange",
        description: "Irreversible digital asset purchase",
      },
    ],
    anomalyScore: 0.98,
    ruleFlags: ["HIGH_AMOUNT_OUTLIER", "VELOCITY_BURST_CRITICAL", "NEW_DEVICE_IDENTIFIED", "VPN_PROXY_MASKED"],
  },

  // 5. Utility Bill (Low Risk)
  {
    id: "TXN-1044",
    timestamp: "15:03:01",
    customerId: "CUST-4412",
    customerName: "Sneha Nair",
    amount: 3240,
    currency: "INR",
    merchant: "Tata Power Electricity",
    merchantCategory: "Utilities",
    device: {
      browser: "Chrome Mobile v122",
      os: "Android 14",
      fingerprintHash: "fp_55102ff",
      isNewDevice: false,
      screenResolution: "1080x2400",
    },
    location: {
      city: "Mumbai",
      country: "India",
      ipAddress: "103.21.125.10",
      isVpnOrProxy: false,
      distanceFromHomeKm: 4,
    },
    velocity: {
      last2MinutesCount: 1,
      lastHourCount: 1,
      totalSpentToday: 3240,
    },
    riskScore: 6,
    riskLevel: "LOW",
    decision: "APPROVED",
    status: "PROCESSED",
    shapExplanation: [
      {
        feature: "Trusted Device Token",
        contribution: -14,
        direction: "decrease",
        rawValue: "Known Android Token",
        description: "High reputation hardware key",
      },
      {
        feature: "Low-Risk Utility / Grocery Merchant",
        contribution: -7,
        direction: "decrease",
        rawValue: "Electricity Utility",
        description: "Recurring municipal bill payment",
      },
    ],
    anomalyScore: 0.04,
    ruleFlags: [],
  },

  // 6. Travel Flight Booking (Medium Risk OTP)
  {
    id: "TXN-1043",
    timestamp: "15:00:20",
    customerId: "CUST-9018",
    customerName: "Aditya Patel",
    amount: 42000,
    currency: "INR",
    merchant: "MakeMyTrip Flights",
    merchantCategory: "Travel",
    device: {
      browser: "Chrome v122",
      os: "macOS Sonoma",
      fingerprintHash: "fp_192aa00",
      isNewDevice: false,
      screenResolution: "2560x1440",
    },
    location: {
      city: "Pune",
      country: "India",
      ipAddress: "49.36.19.45",
      isVpnOrProxy: false,
      distanceFromHomeKm: 140,
    },
    velocity: {
      last2MinutesCount: 1,
      lastHourCount: 2,
      totalSpentToday: 45000,
    },
    riskScore: 48,
    riskLevel: "MEDIUM",
    decision: "OTP_REQUIRED",
    status: "PROCESSED",
    shapExplanation: [
      {
        feature: "Amount Deviation",
        contribution: 14,
        direction: "increase",
        rawValue: "₹42,000 (3.5x avg)",
        description: "Moderate spike above normal weekend ticket size",
      },
      {
        feature: "Trusted Device Token",
        contribution: -14,
        direction: "decrease",
        rawValue: "Known Mac Device",
        description: "Prior authenticated sessions verify cardholder ownership",
      },
    ],
    anomalyScore: 0.35,
    ruleFlags: [],
  },
];

export const initialMetrics: ModelMetrics = {
  totalProcessed: 14820,
  fraudBlockedAmount: 4382500, // ₹43,82,500
  fraudAttemptCount: 312,
  otpChallengeCount: 1845,
  autoApprovedCount: 12663,
  precision: 0.942, // 94.2% precision (low false alarms)
  recall: 0.968, // 96.8% recall (catches nearly all fraud)
  f1Score: 0.955,
  prAuc: 0.961, // Critical metric for class imbalance
  rocAuc: 0.991,
  falsePositiveRate: 0.012, // Only 1.2% false declines
  avgLatencyMs: 38, // <40ms XGBoost inference + SHAP computation
};

// Precision-Recall curve coordinates demonstrating threshold trade-offs under class imbalance
export const prCurveData = [
  { threshold: 0.95, recall: 0.72, precision: 0.99, costTradeoff: 450000 },
  { threshold: 0.90, recall: 0.84, precision: 0.98, costTradeoff: 280000 },
  { threshold: 0.85, recall: 0.91, precision: 0.97, costTradeoff: 160000 },
  { threshold: 0.70, recall: 0.968, precision: 0.942, costTradeoff: 82000, isOptimal: true }, // Current calibrated threshold
  { threshold: 0.50, recall: 0.985, precision: 0.86, costTradeoff: 195000 },
  { threshold: 0.35, recall: 0.994, precision: 0.72, costTradeoff: 390000 },
  { threshold: 0.20, recall: 0.998, precision: 0.51, costTradeoff: 680000 },
];

// Confusion Matrix under heavy class imbalance (e.g. 10,000 transactions with 2% fraud prevalence)
export const confusionMatrixData = {
  truePositive: 194, // Real Fraud caught
  falsePositive: 12, // Legitimate blocked (false decline friction)
  trueNegative: 9788, // Legitimate smoothly approved
  falseNegative: 6, // Fraud missed (slippage loss)
  estimatedFraudPreventedINR: 16800000, // ₹1.68 Crore
  frictionCostINR: 42000, // Very low friction cost
};

// Global SHAP Feature Importance across the entire population
export const shapGlobalImportance = [
  { feature: "Transaction Velocity (2m burst)", meanAbsShap: 28.4, type: "behavioral" },
  { feature: "Amount Ratio vs Customer Baseline", meanAbsShap: 24.1, type: "financial" },
  { feature: "Device Fingerprint Novelty", meanAbsShap: 21.6, type: "device" },
  { feature: "VPN / Tor / Datacenter IP", meanAbsShap: 19.8, type: "network" },
  { feature: "Geo-Distance Jump (Impossible Travel)", meanAbsShap: 16.3, type: "geographic" },
  { feature: "Merchant Sector Risk Index", meanAbsShap: 12.2, type: "merchant" },
  { feature: "Hour of Day / Diurnal Pattern", meanAbsShap: 7.9, type: "temporal" },
];

// Hourly volume & risk trends for the main dashboard chart
export const hourlyTrendData = [
  { time: "09:00", volume: 640, lowRisk: 580, medRisk: 48, highRisk: 12 },
  { time: "10:00", volume: 820, lowRisk: 740, medRisk: 62, highRisk: 18 },
  { time: "11:00", volume: 1100, lowRisk: 990, medRisk: 88, highRisk: 22 },
  { time: "12:00", volume: 1350, lowRisk: 1210, medRisk: 112, highRisk: 28 },
  { time: "13:00", volume: 1280, lowRisk: 1150, medRisk: 104, highRisk: 26 },
  { time: "14:00", volume: 1420, lowRisk: 1260, medRisk: 125, highRisk: 35 },
  { time: "15:00", volume: 1680, lowRisk: 1490, medRisk: 146, highRisk: 44 },
];
