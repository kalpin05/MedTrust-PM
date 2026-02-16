import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

// In-memory store for rate limiting (simple implementation)
// In production, use Redis
const requestCounts = {};
const failedLogins = {};

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 100;
const MAX_FAILED_LOGINS = 5;

// Cleanup old entries
setInterval(() => {
    const now = Date.now();
    for (const ip in requestCounts) {
        if (now - requestCounts[ip].startTime > RATE_LIMIT_WINDOW) {
            delete requestCounts[ip];
        }
    }
    for (const ip in failedLogins) {
        if (now - failedLogins[ip].startTime > RATE_LIMIT_WINDOW * 5) { // Keep login failures longer
            delete failedLogins[ip];
        }
    }
}, RATE_LIMIT_WINDOW);

export const checkRateLimit = async (ip) => {
    const now = Date.now();

    // Initialize if not exists
    if (!requestCounts[ip]) {
        requestCounts[ip] = { count: 0, startTime: now };
    }

    const data = requestCounts[ip];

    // Reset if window passed
    if (now - data.startTime > RATE_LIMIT_WINDOW) {
        data.count = 0;
        data.startTime = now;
    }

    data.count++;

    if (data.count > MAX_REQUESTS_PER_MINUTE) {
        await createAlert(ip, 'DDoS', 'High', `High request rate: ${data.count} req/min`);
        // Auto-block
        await blockIp(ip, 'Rate limit exceeded');
        return false; // Block request
    }

    return true; // Allow request
};

export const recordFailedLogin = async (ip, email) => {
    const now = Date.now();

    if (!failedLogins[ip]) {
        failedLogins[ip] = { count: 0, startTime: now };
    }

    failedLogins[ip].count++;

    if (failedLogins[ip].count >= MAX_FAILED_LOGINS) {
        await createAlert(ip, 'BruteForce', 'Critical', `Multiple failed logins for IP ${ip} (Target: ${email})`);
        await blockIp(ip, 'Brute force detected');
    }
};

const createAlert = async (ip, type, severity, message) => {
    if (!supabase) return;

    console.log(`[SECURITY ALERT] ${type} (${severity}): ${message} - IP: ${ip}`);

    try {
        await supabase.from('security_alerts').insert([{
            type,
            severity,
            message,
            source_ip: ip,
            status: 'Active'
        }]);
    } catch (err) {
        console.error("Failed to create alert:", err);
    }
};

const blockIp = async (ip, reason) => {
    if (!supabase) return;

    console.log(`[BLOCKING IP] ${ip} - Reason: ${reason}`);

    try {
        await supabase.from('blocked_ips').upsert([{
            ip_address: ip,
            reason,
            expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // Block for 30 mins
        }]);
    } catch (err) {
        console.error("Failed to block IP:", err);
    }
};

export const isIpBlocked = async (ip) => {
    if (!supabase) return false;

    try {
        const { data, error } = await supabase
            .from('blocked_ips')
            .select('*')
            .eq('ip_address', ip)
            .single();

        if (error || !data) return false;

        // Check if expired
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
            // Unblock if expired
            await supabase.from('blocked_ips').delete().eq('ip_address', ip);
            return false;
        }

        return true;
    } catch (err) {
        return false;
    }
};
