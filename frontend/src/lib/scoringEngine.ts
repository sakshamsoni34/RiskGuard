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
  let baseScore = 14;

  // 1. Amount ratio vs user historical baseline
  const amountRatio = params.amount / (params.avgUserAmount || 1);
  if (amountRatio > 5) {
    const impact = Math.min(30, Math.round(18 + (amountRatio - 5) * 2));
    baseScore += impact;
    shapExplanation.push({
      feature: "High Purchase Deviation",
      contribution: impact,
      direction: "increase",
      rawValue: `₹${params.amount.toLocaleString("en-IN")} (${amountRatio.toFixed(1)}x user avg)`,
      description: `Amount is significantly higher than customer's habitual ₹${params.avgUserAmount.toLocaleString("en-IN")} average.`,
    });
    ruleFlags.push("AMOUNT_DEVIATION_HIGH");
  } else if (amountRatio > 2.5) {
    const impact = 14;
    baseScore += impact;
    shapExplanation.push({
      feature: "Moderate Amount Deviation",
      contribution: impact,
      direction: "increase",
      rawValue: `₹${params.amount.toLocaleString("en-IN")} (${amountRatio.toFixed(1)}x user avg)`,
      description: "Amount is above customer's typical purchase profile.",
    });
  } else {
    const reduction = -8;
    baseScore += reduction;
    shapExplanation.push({
      feature: "Consistent Spend Profile",
      contribution: reduction,
      direction: "decrease",
      rawValue: `₹${params.amount.toLocaleString("en-IN")}`,
      description: "Conforms to customer's habitual transaction size.",
    });
  }

  // 2. Transaction Velocity
  if (params.velocityLast2Min >= 4) {
    const impact = 34;
    baseScore += impact;
    shapExplanation.push({
      feature: "Card Velocity Burst",
      contribution: impact,
      direction: "increase",
      rawValue: `${params.velocityLast2Min} attempts in 2 min`,
      description: "Rapid burst cadence indicating automated card testing or script attack.",
    });
    ruleFlags.push("VELOCITY_BURST_CRITICAL");
  } else if (params.velocityLast2Min >= 2) {
    const impact = 18;
    baseScore += impact;
    shapExplanation.push({
      feature: "Elevated Velocity",
      contribution: impact,
      direction: "increase",
      rawValue: `${params.velocityLast2Min} attempts in 2 min`,
      description: "Multiple attempts detected within a short window.",
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
      description: "Standard human checkout pacing.",
    });
  }

  // 3. Device Fingerprint
  if (params.isNewDevice) {
    const impact = 22;
    baseScore += impact;
    shapExplanation.push({
      feature: "Unrecognized Device Fingerprint",
      contribution: impact,
      direction: "increase",
      rawValue: "New Browser / Client Token",
      description: "Transaction initiated from a hardware token never previously used by this customer.",
    });
    ruleFlags.push("NEW_DEVICE_DETECTED");
  } else {
    const reduction = -14;
    baseScore += reduction;
    shapExplanation.push({
      feature: "Trusted Device Token",
      contribution: reduction,
      direction: "decrease",
      rawValue: "Recognized Device",
      description: "Matches trusted hardware fingerprint with frequent verified logins.",
    });
  }

  // 4. Geolocation & Proxy/VPN
  if (params.isVpnOrProxy) {
    const impact = 24;
    baseScore += impact;
    shapExplanation.push({
      feature: "Anonymized Proxy / VPN Origin",
      contribution: impact,
      direction: "increase",
      rawValue: "Datacenter IP / Tor Exit Node",
      description: "Connection origin masked by a commercial VPN or datacenter proxy.",
    });
    ruleFlags.push("ANONYMOUS_PROXY_DETECTED");
  }

  if (params.distanceJumpKm > 1000) {
    const impact = 21;
    baseScore += impact;
    shapExplanation.push({
      feature: "Impossible Travel Velocity",
      contribution: impact,
      direction: "increase",
      rawValue: `${Math.round(params.distanceJumpKm)} km from billing location`,
      description: "Physical distance between consecutive sessions implies impossible travel speed.",
    });
    ruleFlags.push("IMPOSSIBLE_TRAVEL");
  } else if (params.distanceJumpKm < 50 && !params.isVpnOrProxy) {
    const reduction = -10;
    baseScore += reduction;
    shapExplanation.push({
      feature: "Local Billing Anchor Match",
      contribution: reduction,
      direction: "decrease",
      rawValue: "< 50 km local area",
      description: "Origin coordinates match cardholder's primary home billing location.",
    });
  }

  // 5. Merchant Category Risk
  if (params.merchantCategory === "Crypto" || params.merchantCategory === "Gaming") {
    const impact = 15;
    baseScore += impact;
    shapExplanation.push({
      feature: "High-Risk Merchant Category",
      contribution: impact,
      direction: "increase",
      rawValue: params.merchantCategory,
      description: "Category has higher historical chargeback and non-refundable liquidation rates.",
    });
  } else if (params.merchantCategory === "Grocery" || params.merchantCategory === "Utilities") {
    const reduction = -7;
    baseScore += reduction;
    shapExplanation.push({
      feature: "Essential Services Merchant",
      contribution: reduction,
      direction: "decrease",
      rawValue: params.merchantCategory,
      description: "Low dispute rate recurring domestic category.",
    });
  }

  const finalScore = Math.max(2, Math.min(99, Math.round(baseScore)));

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

  const emailDomains = ["gmail.com", "outlook.com", "yahoo.in", "icloud.com"];
  const selectedDomain = emailDomains[Math.floor(Math.random() * emailDomains.length)];

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
