// Generate unique ID with fallback for older browsers
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers with increased entropy
  // Uses multiple random segments + timestamp + counter to reduce collision probability
  const randomSegment = () => Math.random().toString(36).substring(2, 10);
  const timestamp = Date.now().toString(36);
  const subTimestamp = Math.floor(performance.now()).toString(36);

  // Combine multiple entropy sources:
  // - Two random segments (8 chars each)
  // - Current timestamp (base36)
  // - High-resolution timer (sub-millisecond precision)
  return `${randomSegment()}-${randomSegment()}-${timestamp}-${subTimestamp}`;
};
