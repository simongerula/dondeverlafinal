interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

function cleanup(key: string, windowMs: number) {
  const entry = store.get(key);
  if (!entry) return;
  const cutoff = Date.now() - windowMs;
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
  if (entry.timestamps.length === 0) store.delete(key);
}

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { success: boolean; remaining: number; reset: number } {
  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  const now = Date.now();
  const cutoff = now - windowMs;
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  const remaining = Math.max(0, maxRequests - entry.timestamps.length);
  const reset = entry.timestamps.length > 0
    ? entry.timestamps[0] + windowMs
    : now + windowMs;

  if (entry.timestamps.length >= maxRequests) {
    return { success: false, remaining: 0, reset };
  }

  entry.timestamps.push(now);
  return { success: true, remaining: remaining - 1, reset };
}

setInterval(() => {
  for (const key of store.keys()) {
    cleanup(key, 60_000);
  }
}, 60_000);
