// Very simple distance heuristic based on pincode/city string
export function estimateDeliveryMinutes(location) {
  const normalized = location.toLowerCase();

  // Example heuristics; tweak as needed
  if (/\b(100|110|560|400)\d{3}\b/.test(normalized)) {
    // major metro pincodes (example)
    return 20;
  }

  if (/\b(mumbai|delhi|bengaluru|bangalore|hyderabad|chennai|pune|kolkata)\b/.test(normalized)) {
    return 25;
  }

  if (/\b(india)\b/.test(normalized)) {
    return 35;
  }

  // fallback estimate
  return 30 + Math.min(15, normalized.length);
}



