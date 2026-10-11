import { Transaction, RiskLevel, DecisionAction, ShapValue, SimulationParams } from "@/types/fraud";

/**
 * Emulates the production XGBoost classifier + Isolation Forest Anomaly model + TreeSHAP explainability
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
  let baseScore = 12; // Baseline population log-odds converted to prior probability

  // 1. Amount ratio vs user historical baseline
  const amountRatio = params.amount / (params.avgUserAmount || 1);
  if (amountRatio > 5) {
    const impact = Math.min(30, Math.round(18 + (amountRatio - 5) * 2));
    baseScore += impact;
    shapExplanation.push({
      feature: "Amount Deviation",
      contribution: impact,
      direction: "increase",
      rawValue: `₹${params.amount.toLocaleString("en-IN")} (${amountRatio.toFixed(1)}x user average)`,
      description: `Transaction amount is substantially higher than customer habitual average (₹${params.avgUserAmount.toLocaleString("en-IN")})`,
    });
    ruleFlags.push("HIGH_AMOUNT_OUTLIER");
  } else if (amountRatio > 2.5) {
    const impact = 14;
    baseScore += impact;
    shapExplanation.push({
      feature: "Amount Deviation",
      contribution: impact,
      direction: "increase",
      rawValue: `₹${params.amount.toLocaleString("en-IN")} (${amountRatio.toFixed(1)}x avg)`,
      description: "Amount moderately above normal user baseline",
    });
  } else {
    const reduction = -8;
    baseScore += reduction;
    shapExplanation.push({
      feature: "Consistent Spend Profile",
      contribution: reduction,
      direction: "decrease",
      rawValue: `₹${params.amount.toLocaleString("en-IN")}`,
      description: "Amount perfectly conforms to historical cardholder spending baseline",
    });
  }

  // 2. Transaction Velocity (e.g. 3 transactions in 2 minutes)
  if (params.velocityLast2Min >= 4) {
    const impact = 34;
    baseScore += impact;
    shapExplanation.push({
      feature: "High Velocity Spike",
      contribution: impact,
      direction: "increase",
      rawValue: `${params.velocityLast2Min} transactions in 2 min`,
      description: "Rapid burst velocity detected, characteristic of automated carding or script attacks",
    });
    ruleFlags.push("VELOCITY_BURST_CRITICAL");
  } else if (params.velocityLast2Min >= 2) {
    const impact = 18;
    baseScore += impact;
    shapExplanation.push({
      feature: "Elevated Velocity",
      contribution: impact,
      direction: "increase",
      rawValue: `${params.velocityLast2Min} transactions in 2 min`,
      description: "Multiple attempts observed in a compressed time interval",
    });
    ruleFlags.push("VELOCITY_ELEVATED");
  } else {
    const reduction = -6;
    baseScore += reduction;
    shapExplanation.push({
      feature: "Normal Velocity",
      contribution: reduction,
      direction: "decrease",
      rawValue: `${params.velocityLast2Min} tx / 2 min`,
      description: "Standard pacing between transactions; no robotic cadence",
    });
  }

  // 3. Device Fingerprint Anomaly
  if (params.isNewDevice) {
    const impact = 22;
    baseScore += impact;
    shapExplanation.push({
      feature: "Unrecognized Device Fingerprint",
      contribution: impact,
      direction: "increase",
      rawValue: "New Browser / OS Token",
      description: "Transaction initiated from a hardware hash never previously associated with this profile",
    });
    ruleFlags.push("NEW_DEVICE_IDENTIFIED");
  } else {
    const reduction = -14;
    baseScore += reduction;
    shapExplanation.push({
      feature: "Trusted Device Token",
      contribution: reduction,
      direction: "decrease",
      rawValue: "Known Device ID",
      description: "Matches trusted device fingerprint with >30 successful prior sessions",
    });
  }

  // 4. Geolocation & Proxy/VPN Anomalies
  if (params.isVpnOrProxy) {
    const impact = 24;
    baseScore += impact;
    shapExplanation.push({
      feature: "Anonymous Proxy / VPN Detected",
      contribution: impact,
      direction: "increase",
      rawValue: "Datacenter IP / Tor Exit Node",
      description: "Connection origin routed through an anonymizing datacenter or proxy tunnel",
    });
    ruleFlags.push("VPN_PROXY_MASKED");
  }

  if (params.distanceJumpKm > 1000) {
    const impact = 21;
    baseScore += impact;
    shapExplanation.push({
      feature: "Impossible Travel / Distance Jump",
      contribution: impact,
      direction: "increase",
      rawValue: `${Math.round(params.distanceJumpKm)} km from habitual area`,
      description: "Geographic coordinates represent an impossible travel velocity jump from previous origin",
    });
    ruleFlags.push("IMPOSSIBLE_TRAVEL_GEO");
  } else if (params.distanceJumpKm < 50 && !params.isVpnOrProxy) {
    const reduction = -10;
    baseScore += reduction;
    shapExplanation.push({
      feature: "Habitual Geolocation Match",
      contribution: reduction,
      direction: "decrease",
      rawValue: "<50 km domestic anchor",
      description: "Origin matches user primary residence / recurring payment coordinates",
    });
  }

  // 5. Merchant Category Risk
  if (params.merchantCategory === "Crypto" || params.merchantCategory === "Gaming") {
    const impact = 15;
    baseScore += impact;
    shapExplanation.push({
      feature: "High-Risk Merchant Sector",
      contribution: impact,
      direction: "increase",
      rawValue: params.merchantCategory,
      description: "Merchant classification possesses higher systemic non-refundable chargeback rates",
    });
  } else if (params.merchantCategory === "Grocery" || params.merchantCategory === "Utilities") {
    const reduction = -7;
    baseScore += reduction;
    shapExplanation.push({
      feature: "Low-Risk Utility / Grocery Merchant",
      contribution: reduction,
      direction: "decrease",
      rawValue: params.merchantCategory,
      description: "Low-risk staple category with minimal fraud syndication incidence",
    });
  }

  // Bound the final score between 1 and 99
  const finalScore = Math.max(2, Math.min(99, Math.round(baseScore)));

  // Anomaly score (Isolation Forest representation)
  const anomalyFactors = (params.isNewDevice ? 0.3 : 0) +
    (params.isVpnOrProxy ? 0.35 : 0) +
    (params.velocityLast2Min >= 3 ? 0.35 : 0.05);
  const anomalyScore = parseFloat(Math.min(0.98, Math.max(0.04, anomalyFactors)).toFixed(2));

  // Determine Tier and Decision according to Abstract:
  // Low (< 35): Approved automatically
  // Medium (35 - 70): OTP verification required
  // High (> 70): Blocked or marked for fraud analyst attention
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

  // Sort SHAP values by absolute contribution magnitude
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

const FIRST_NAMES = ["Aarav", "Priya", "Rahul", "Ananya", "Rohan", "Sneha", "Vikram", "Neha", "Aditya", "Pooja", "Arjun", "Kavita"];
const LAST_NAMES = ["Sharma", "Verma", "Patel", "Reddy", "Mehta", "Iyer", "Nair", "Gupta", "Deshmukh", "Chopra"];
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

/**
 * Generates a realistic random transaction with configurable fraud probability
 */
export function generateRandomTransaction(forceFraud: boolean = false): Transaction {
  globalTxCounter += 1;
  const isFraud = forceFraud || Math.random() < 0.14; // ~14% elevated stream rate for demo visualization
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
    // Mimic the abstract example: e.g. ₹85,000 from new device, new location, 3 tx in 2 min
    amount = Math.random() < 0.6 ? Math.floor(Math.random() * 45000) + 65000 : Math.floor(Math.random() * 95000) + 30000;
    isNewDevice = true;
    velocityLast2Min = Math.floor(Math.random() * 4) + 3;
    isVpnOrProxy = Math.random() < 0.75;
    locationItem = CITIES[Math.floor(Math.random() * 4) + 5]; // Foreign location
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

  return {
    id: `TXN-${globalTxCounter}`,
    timestamp: timeString,
    customerId: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: `${firstName} ${lastName}`,
    amount,
    currency: "INR",
    merchant: merchantObj.name,
    merchantCategory: merchantObj.category,
    device: {
      browser: isNewDevice ? "Headless Chrome v122" : "Chrome v122 (Windows 11)",
      os: isNewDevice ? "Linux (Unknown Hardware)" : "Windows 11 x64",
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
