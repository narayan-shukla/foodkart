const buckets = new Map();
let lastCleanup = Date.now();

export function rateLimit({ windowMs = 60_000, max = 60 } = {}) {
  return (req, res, next) => {
    const now = Date.now();
    if (now - lastCleanup > windowMs) {
      for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
      lastCleanup = now;
    }
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    res.set('RateLimit-Limit', String(max));
    res.set('RateLimit-Remaining', String(Math.max(0, max - bucket.count)));
    if (bucket.count > max) {
      res.set('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
      return res.status(429).json({ success: false, message: 'Too many requests. Try again shortly.' });
    }
    next();
  };
}
