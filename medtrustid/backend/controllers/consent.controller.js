import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export const createConsent = async (req, res) => {
  try {
    const { patientId, requesterId, purpose, expiry } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Missing token" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }

    if (!requesterId || !purpose || !expiry) {
      return res.status(400).json({ error: "requesterId, purpose, expiry are required" });
    }

    const resolvedPatientId = patientId || decoded.id;

    if (!supabase) {
      return res.json({ message: "Consent created (mock)", id: "mock-consent-id" });
    }

    const { data, error } = await supabase
      .from("consents")
      .insert([{
        patient_id: resolvedPatientId,
        requester_id: requesterId,
        purpose,
        expiry_date: expiry,
        status: "active",
        created_by: decoded.id
      }]);

    if (error) throw error;

    res.json({ message: "Consent created", id: data[0].id });

  } catch (err) {
    if (err.message?.toLowerCase()?.includes("consents") && err.message?.toLowerCase()?.includes("does not exist")) {
      return res.status(500).json({ error: "Supabase table 'consents' not found. Run supabase_setup.sql." });
    }
    res.status(500).json({ error: err.message });
  }
};

export const getStaffConsents = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "staff") {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (!supabase) {
      return res.json({ consents: [] });
    }

    const { data, error } = await supabase
      .from("consents")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    res.json({ consents: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCurrentPatientConsents = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!supabase) {
      return res.json({ consents: [] });
    }

    const { data, error } = await supabase
      .from("consents")
      .select("*")
      .eq("patient_id", decoded.id);

    if (error) throw error;

    res.json({ consents: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const revokeConsent = async (req, res) => {
  try {
    const { consentId } = req.params;
    
    if (!supabase) {
      return res.json({ message: "Consent revoked (mock)" });
    }

    const { error } = await supabase
      .from("consents")
      .update({ status: "revoked" })
      .eq("id", consentId);

    if (error) throw error;

    res.json({ message: "Consent revoked" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getConsents = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    if (!supabase) {
      return res.json({ consents: [
        { id: "1", purpose: "Treatment", status: "active", requester: "Hospital Staff" },
        { id: "2", purpose: "Pharmacy", status: "revoked", requester: "Pharmacy System" }
      ]});
    }

    const { data, error } = await supabase
      .from("consents")
      .select("*")
      .eq("patient_id", patientId);

    if (error) throw error;

    res.json({ consents: data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
