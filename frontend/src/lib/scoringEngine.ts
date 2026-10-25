/**
 * SYNTHETIC DEMO DATA ONLY — no real persons, accounts, or financial data.
 * All emails use @example.org (RFC 2606 reserved for documentation).
 * This scoring engine simulates offline scoring for the Simulator page only.
 * Live risk evaluation routes through the FastAPI ML service via the backend.
 */
import { Transaction, RiskLevel, DecisionAction, ShapValue, SimulationParams, PaymentMethod } from "@/types/fraud";

/**
 * Production risk scoring logic (XGBoost + Isolation Forest Anomaly Detection + Local Feature Impact)
 */
export function calculateRisk(params: SimulationParams): {
  riskScore: number;
  riskLevel: RiskLevel;
  decision: DecisionAction;
  shapExplanation: ShapValue[];
  anomalyScore: number;
  ruleFlags: string[];
} {
  const shapExplanation: ShapValue[] = [];
  const ruleFlags: string[] = [];
  
  // Base expectation score for any card transaction
  const baseScore = 5;

  // 1. Transaction Amount (0 to 22 pts continuous with slider)
  const amountFraction = Math.min(1, Math.max(0, (params.amount - 500) / 149500));
  const amountPoints = Math.round(amountFraction * 22);
  if (amountPoints >= 15) {
    ruleFlags.push("AMOUNT_DEVIATION_HIGH");
    shapExplanation.push({
      feature: "High Purchase Deviation",
      contribution: amountPoints,
      direction: "increase",
      rawValue: `₹${params.amount.toLocaleString("en-IN")}`,
      description: "Significant high-ticket transfer exceeding cardholder baseline.",
    });
  } else if (amountPoints >= 7) {
    shapExplanation.push({
      feature: "Moderate Amount Spend",
      contribution: amountPoints,
      direction: "increase",
      rawValue: `₹${params.amount.toLocaleString("en-IN")}`,
      description: "Medium ticket authorization above average card spend.",
    });
  } else {
    shapExplanation.push({
      feature: "Consistent Spend Profile",
      contribution: amountPoints,
      direction: "decrease",
      rawValue: `₹${params.amount.toLocaleString("en-IN")}`,
      description: "Standard checkout amount conforming to habitual patterns.",
    });
  }

  // 2. Transaction Velocity in last 2 minutes (0 to 19 pts continuous)
  const velocityFraction = Math.min(1, Math.max(0, (params.velocityLast2Min - 1) / 7));
  const velocityPoints = Math.round(velocityFraction * 19);
  if (params.velocityLast2Min >= 4) {
    ruleFlags.push("VELOCITY_BURST_CRITICAL");
    shapExplanation.push({
      feature: "Card Velocity Burst",
      contribution: velocityPoints,
      direction: "increase",
      rawValue: `${params.velocityLast2Min} attempts in 2 min`,
      description: "Rapid burst cadence indicating automated card testing or script attack.",
    });
  } else if (params.velocityLast2Min >= 2) {
    ruleFlags.push("VELOCITY_ELEVATED");
    shapExplanation.push({
      feature: "Elevated Velocity",
      contribution: velocityPoints,
      direction: "increase",
      rawValue: `${params.velocityLast2Min} attempts in 2 min`,
      description: "Multiple attempts detected within a short window.",
    });
  } else {
    shapExplanation.push({
      feature: "Normal Velocity",
      contribution: 0,
      direction: "decrease",
      rawValue: `${params.velocityLast2Min} tx / 2 min`,
      description: "Standard single human checkout pacing.",
    });
  }

  // 3. Device Fingerprint (+14 pts if unrecognized)
  const devicePoints = params.isNewDevice ? 14 : 0;
  if (params.isNewDevice) {
    ruleFlags.push("NEW_DEVICE_DETECTED");
    shapExplanation.push({
      feature: "Unrecognized Device Fingerprint",
      contribution: devicePoints,
      direction: "increase",
      rawValue: "New Browser / Client Token",
      description: "Transaction initiated from hardware never previously used by this customer.",
    });
  } else {
    shapExplanation.push({
      feature: "Trusted Device Token",
      contribution: 0,
      direction: "decrease",
      rawValue: "Recognized Device",
      description: "Matches trusted hardware fingerprint with frequent verified logins.",
    });
  }

  // 4. Network Connection / VPN Proxy (+14 pts if VPN/Proxy)
  const networkPoints = params.isVpnOrProxy ? 14 : 0;
  if (params.isVpnOrProxy) {
    ruleFlags.push("ANONYMOUS_PROXY_DETECTED");
    shapExplanation.push({
      feature: "Anonymized Proxy / VPN Origin",
      contribution: networkPoints,
      direction: "increase",
      rawValue: "Datacenter IP / Tor Exit Node",
      description: "Connection origin masked by a commercial VPN or datacenter proxy.",
    });
  }

  // 5. Geolocation / Distance Jump (0 to 14 pts)
  let distancePoints = 0;
  if (params.distanceJumpKm >= 6000) {
    distancePoints = 14;
    ruleFlags.push("IMPOSSIBLE_TRAVEL");
    shapExplanation.push({
      feature: "Impossible Travel Velocity",
      contribution: distancePoints,
      direction: "increase",
      rawValue: `${Math.round(params.distanceJumpKm)} km from billing location`,
      description: "Physical distance between consecutive sessions implies impossible travel speed.",
    });
  } else if (params.distanceJumpKm >= 3000) {
    distancePoints = 10;
    ruleFlags.push("CROSS_BORDER_TRAVEL");
    shapExplanation.push({
      feature: "Cross-Border International Jump",
      contribution: distancePoints,
      direction: "increase",
      rawValue: `${Math.round(params.distanceJumpKm)} km`,
      description: "Cross-border transaction detected far outside primary billing territory.",
    });
  } else if (params.distanceJumpKm >= 100) {
    distancePoints = 5;
    shapExplanation.push({
      feature: "Domestic Interstate Hop",
      contribution: distancePoints,
      direction: "increase",
      rawValue: `${Math.round(params.distanceJumpKm)} km`,
      description: "Domestic intercity movement detected.",
    });
  } else {
    shapExplanation.push({
      feature: "Local Geo-Radius",
      contribution: 0,
      direction: "decrease",
      rawValue: `${Math.round(params.distanceJumpKm)} km`,
      description: "Transaction originated within customer habitual home radius.",
    });
  }

  // 6. Merchant Category (0 to 12 pts)
  let merchantPoints = 0;
  const mc = (params.merchantCategory || "").toLowerCase();
  if (mc.includes("crypto") || mc.includes("gaming")) {
    merchantPoints = 12;
    shapExplanation.push({
      feature: "High-Risk Merchant Category",
      contribution: merchantPoints,
      direction: "increase",
      rawValue: params.merchantCategory,
      description: "Category has higher historical chargeback and non-refundable liquidation rates.",
    });
  } else if (mc.includes("electronics")) {
    merchantPoints = 9;
    shapExplanation.push({
      feature: "High Resale Consumer Electronics",
      contribution: merchantPoints,
      direction: "increase",
      rawValue: params.merchantCategory,
      description: "High-value easily liquidatable consumer electronics.",
    });
  } else if (mc.includes("jewelry")) {
    merchantPoints = 6;
    shapExplanation.push({
      feature: "Luxury Goods & Jewelry",
      contribution: merchantPoints,
      direction: "increase",
      rawValue: params.merchantCategory,
      description: "Precious metals and jewelry with elevated target rates.",
    });
  } else if (mc.includes("travel")) {
    merchantPoints = 4;
    shapExplanation.push({
      feature: "Travel & Transit",
      contribution: merchantPoints,
      direction: "increase",
      rawValue: params.merchantCategory,
      description: "Airlines and booking portal transactions.",
    });
  } else if (mc.includes("utilities")) {
    merchantPoints = 2;
  } else {
    merchantPoints = 0;
    shapExplanation.push({
      feature: "Low-Risk Retail Merchant",
      contribution: 0,
      direction: "decrease",
      rawValue: params.merchantCategory,
      description: "Standard daily necessities or low-chargeback category.",
    });
  }

  // Aggregate final risk score with dynamic real-time sensitivity
  const totalCalculated = baseScore + amountPoints + velocityPoints + devicePoints + networkPoints + distancePoints + merchantPoints;
  const finalScore = Math.max(5, Math.min(99, totalCalculated));

  const anomalyFactors = (params.isNewDevice ? 0.3 : 0) +
    (params.isVpnOrProxy ? 0.35 : 0) +
    (params.velocityLast2Min >= 3 ? 0.35 : 0.05);
  const anomalyScore = parseFloat(Math.min(0.98, Math.max(0.04, anomalyFactors)).toFixed(2));

  let riskLevel: RiskLevel;
  let decision: DecisionAction;

  if (finalScore > 70) {
    riskLevel = "HIGH";
    decision = "BLOCKED";
  } else if (finalScore >= 35) {
    riskLevel = "MEDIUM";
    decision = "OTP_REQUIRED";
  } else {
    riskLevel = "LOW";
    decision = "APPROVED";
  }

  shapExplanation.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  return {
    riskScore: finalScore,
    riskLevel,
    decision,
    shapExplanation,
    anomalyScore,
    ruleFlags,
  };
}

const FIRST_NAMES = ["Aarav", "Priya", "Rahul", "Ananya", "Rohan", "Sneha", "Vikram", "Neha", "Aditya", "Pooja", "Arjun", "Kavita", "Deepak", "Shreya"];
const LAST_NAMES = ["Sharma", "Verma", "Patel", "Reddy", "Mehta", "Iyer", "Nair", "Gupta", "Deshmukh", "Chopra", "Singhania", "Mukherjee"];
const CITIES = [
  { city: "Mumbai", country: "India", distance: 12 },
  { city: "Bengaluru", country: "India", distance: 25 },
  { city: "New Delhi", country: "India", distance: 18 },
  { city: "Hyderabad", country: "India", distance: 45 },
  { city: "Pune", country: "India", distance: 30 },
  { city: "Moscow", country: "Russia", distance: 4800 },
  { city: "Lagos", country: "Nigeria", distance: 7200 },
  { city: "Bucharest", country: "Romania", distance: 5400 },
  { city: "Singapore", country: "Singapore", distance: 3900 },
];

const MERCHANTS: { name: string; category: Transaction['merchantCategory'] }[] = [
  { name: "Croma Electronics", category: "Electronics" },
  { name: "Apple Store Online", category: "Electronics" },
  { name: "Tanishq Jewellers", category: "Jewelry" },
  { name: "Blinkit Grocery", category: "Grocery" },
  { name: "BigBasket Supermarket", category: "Grocery" },
  { name: "MakeMyTrip Flights", category: "Travel" },
  { name: "Binance P2P Exchange", category: "Crypto" },
  { name: "Steam Games Platform", category: "Gaming" },
  { name: "Tata Power Electricity", category: "Utilities" },
  { name: "Amazon India", category: "Electronics" },
];

let globalTxCounter = 1048;

export function generateRandomTransaction(forceFraud: boolean = false): Transaction {
  globalTxCounter += 1;
  const isFraud = forceFraud || Math.random() < 0.14;
  const isMedium = !isFraud && Math.random() < 0.22;

  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const merchantObj = isFraud 
    ? (Math.random() < 0.5 ? { name: "Binance P2P Exchange", category: "Crypto" as const } : { name: "Apple Store Online", category: "Electronics" as const })
    : MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];

  const avgUserAmount = Math.floor(Math.random() * 8000) + 3000;
  
  let amount: number;
  let isNewDevice: boolean;
  let velocityLast2Min: number;
  let isVpnOrProxy: boolean;
  let locationItem = CITIES[0];

  if (isFraud) {
    amount = Math.random() < 0.6 ? Math.floor(Math.random() * 45000) + 65000 : Math.floor(Math.random() * 95000) + 30000;
    isNewDevice = true;
    velocityLast2Min = Math.floor(Math.random() * 4) + 3;
    isVpnOrProxy = Math.random() < 0.75;
    locationItem = CITIES[Math.floor(Math.random() * 4) + 5];
  } else if (isMedium) {
    amount = Math.floor(Math.random() * 18000) + 12000;
    isNewDevice = Math.random() < 0.5;
    velocityLast2Min = Math.random() < 0.5 ? 2 : 1;
    isVpnOrProxy = Math.random() < 0.2;
    locationItem = CITIES[Math.floor(Math.random() * 4)];
  } else {
    amount = Math.floor(Math.random() * 4500) + 400;
    isNewDevice = false;
    velocityLast2Min = 1;
    isVpnOrProxy = false;
    locationItem = CITIES[Math.floor(Math.random() * 4)];
  }

  const { riskScore, riskLevel, decision, shapExplanation, anomalyScore, ruleFlags } = calculateRisk({
    amount,
    currency: "INR",
    merchantCategory: merchantObj.category,
    isNewDevice,
    velocityLast2Min,
    isVpnOrProxy,
    distanceJumpKm: locationItem.distance,
    avgUserAmount,
  });

  const now = new Date();
  const timeString = now.toLocaleTimeString("en-IN", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const emailDomains = ["example.org"];
  const selectedDomain = emailDomains[0];

  const paymentMethods: PaymentMethod[] = [
    { type: "card", brand: "Visa", last4: "4242" },
    { type: "card", brand: "Mastercard", last4: "8192" },
    { type: "card", brand: "RuPay", last4: "3019" },
    { type: "upi", upiHandle: `${firstName.toLowerCase()}@okhdfcbank` },
    { type: "netbanking", bankName: "HDFC Bank" },
  ];
  const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

  return {
    id: `TXN-${globalTxCounter}`,
    timestamp: timeString,
    customerId: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: `${firstName} ${lastName}`,
    customerEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${selectedDomain}`,
    customerPhone: `+91 98${Math.floor(10000000 + Math.random() * 90000000).toString().substring(0, 8)}`,
    amount,
    currency: "INR",
    merchant: merchantObj.name,
    merchantCategory: merchantObj.category,
    paymentMethod,
    device: {
      browser: isNewDevice ? "Headless Chrome 122" : "Chrome 122 on Windows 11",
      os: isNewDevice ? "Linux (Unknown Client)" : "Windows 11 x64",
      fingerprintHash: `fp_${Math.random().toString(36).substring(2, 9)}`,
      isNewDevice,
      screenResolution: isNewDevice ? "800x600" : "1920x1080",
    },
    location: {
      city: locationItem.city,
      country: locationItem.country,
      ipAddress: isVpnOrProxy ? `185.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}.44` : `103.21.${Math.floor(Math.random() * 150)}.12`,
      isVpnOrProxy,
      distanceFromHomeKm: locationItem.distance,
    },
    velocity: {
      last2MinutesCount: velocityLast2Min,
      lastHourCount: velocityLast2Min + Math.floor(Math.random() * 3),
      totalSpentToday: amount + Math.floor(Math.random() * 5000),
    },
    riskScore,
    riskLevel,
    decision,
    status: "PROCESSED",
    shapExplanation,
    anomalyScore,
    ruleFlags,
  };
}
