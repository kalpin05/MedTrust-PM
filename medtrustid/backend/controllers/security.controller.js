import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

export const getAlerts = async (req, res) => {
    try {
        if (!supabase) return res.json({ alerts: [] });

        const { data, error } = await supabase
            .from('security_alerts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50); // Get latest 50

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getStats = async (req, res) => {
    try {
        if (!supabase) return res.json({ activeAlerts: 0, blockedIps: 0 });

        // Count active alerts
        const { count: activeAlerts, error: err1 } = await supabase
            .from('security_alerts')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Active');

        // Count blocked IPs
        const { count: blockedIps, error: err2 } = await supabase
            .from('blocked_ips')
            .select('*', { count: 'exact', head: true });

        if (err1) throw err1;
        if (err2) throw err2;

        res.json({
            activeAlerts: activeAlerts || 0,
            blockedIps: blockedIps || 0,
            systemHealth: activeAlerts > 5 ? 'Critical' : activeAlerts > 0 ? 'Warning' : 'Healthy'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const resolveAlert = async (req, res) => {
    try {
        const { id } = req.params;

        if (!supabase) return res.json({ message: "Mock success" });

        const { error } = await supabase
            .from('security_alerts')
            .update({ status: 'Resolved', resolved_at: new Date() })
            .eq('id', id);

        if (error) throw error;

        res.json({ message: "Alert resolved" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
