import { checkRateLimit, isIpBlocked, scanPayload } from "../services/anomalyDetection.js";

export const securityMonitor = async (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';

    // Simulation-specific headers for malware detection demo
    const simFilename = req.headers['x-simulation-filename'];
    const simHash = req.headers['x-simulation-hash'];
    const simSourceIp = req.headers['x-simulation-source-ip'];

    // If simulation IP is provided, use it for monitoring instead of localhost
    const effectiveIp = simSourceIp || ip;

    // Check for malware if simulation headers are present
    if (simFilename || simHash) {
        const isSafe = await scanPayload(effectiveIp, simFilename, simHash);
        if (!isSafe) {
            return res.status(403).json({ error: `Security Alert: Malicious activity detected from ${effectiveIp}` });
        }
    }

    // Whitelist localhost for simulation/demo purposes (unless sim header overrides)
    if (!simSourceIp && (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1')) {
        return next();
    }

    // Check if IP is blocked
    const blocked = await isIpBlocked(effectiveIp);
    if (blocked) {
        return res.status(403).json({ error: "Access denied. Your IP has been blocked due to suspicious activity." });
    }

    // Rate limiting check
    const allowed = await checkRateLimit(effectiveIp);
    if (!allowed) {
        return res.status(429).json({ error: "Too many requests. Please try again later." });
    }

    next();
};
