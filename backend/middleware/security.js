const buckets = new Map();

const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
};

const rateLimit = ({ windowMs = 60_000, max = 60 } = {}) => (req, res, next) => {
  const now = Date.now();
  const key = `${req.ip}:${req.baseUrl}:${req.path}`;
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }
  current.count += 1;
  if (current.count > max) {
    res.setHeader('Retry-After', Math.ceil((current.resetAt - now) / 1000));
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }
  next();
};

module.exports = { securityHeaders, rateLimit };
