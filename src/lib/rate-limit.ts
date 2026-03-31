const MAX_REQUESTS = 20;
const WINDOW_MS = 60 * 1000; // 1 minute

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  let entry = store.get(ip);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(ip, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  if (entry.timestamps.length >= MAX_REQUESTS) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + WINDOW_MS - now;
    return { allowed: false, retryAfterMs };
  }

  entry.timestamps.push(now);
  return { allowed: true };
}

// For testing
export function resetRateLimitStore(): void {
  store.clear();
}
