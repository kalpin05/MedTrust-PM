import { checkRateLimit, isIpBlocked } from "../services/anomalyDetection.js";

export const securityMonitor = async (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';

    // Check if IP is blocked
    const blocked = await isIpBlocked(ip);
    if (blocked) {
        return res.status(403).json({ error: "Access denied. Your IP has been blocked due to suspicious activity." });
    }

    // Rate limiting check
    const allowed = await checkRateLimit(ip);
    if (!allowed) {
        return res.status(429).json({ error: "Too many requests. Please try again later." });
    }

    // Log request (basic)
    // console.log(`[MONITOR] ${req.method} ${req.url} - IP: ${ip}`);

    next();
};
