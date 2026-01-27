import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

const requireToken = (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return { error: "Missing token", statusCode: 401 };
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return { error: "Invalid token", statusCode: 401 };
  }
};

export const searchPatients = async (req, res) => {
  try {
    const decoded = requireToken(req);
    if (decoded?.statusCode) return res.status(decoded.statusCode).json({ error: decoded.error });

    if (decoded.role !== "staff") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const q = (req.query.q || "").toString().trim();
    if (!q) return res.json({ patients: [] });

    if (!supabase) return res.json({ patients: [] });

    const { data, error } = await supabase
      .from("users")
      .select("id,name,email,role,created_at")
      .eq("role", "patient")
      .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(20);

    if (error) throw error;

    res.json({ patients: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
