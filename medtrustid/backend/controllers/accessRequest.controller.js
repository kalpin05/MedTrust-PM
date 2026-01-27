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
  if (!token) {
    const err = new Error("Missing token");
    err.statusCode = 401;
    throw err;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    const err = new Error("Invalid token");
    err.statusCode = 401;
    throw err;
  }
};

export const createAccessRequest = async (req, res) => {
  try {
    const decoded = requireToken(req);

    if (decoded.role !== "staff") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { patientId, purpose } = req.body;
    if (!patientId || !purpose) {
      return res.status(400).json({ error: "patientId and purpose are required" });
    }

    if (!supabase) {
      return res.json({ message: "Access request created (mock)", id: "mock-request-id" });
    }

    const { data, error } = await supabase
      .from("access_requests")
      .insert([
        {
          patient_id: patientId,
          staff_id: decoded.id,
          purpose,
          status: "pending"
        }
      ])
      .select("*")
      .single();

    if (error) throw error;

    res.json({ message: "Access request created", request: data });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    if (err.message?.toLowerCase()?.includes("access_requests") && err.message?.toLowerCase()?.includes("does not exist")) {
      return res.status(500).json({ error: "Supabase table 'access_requests' not found. Run supabase_setup.sql updates." });
    }
    res.status(500).json({ error: err.message });
  }
};

export const listMyAccessRequests = async (req, res) => {
  try {
    const decoded = requireToken(req);

    if (!supabase) {
      return res.json({ requests: [] });
    }

    const column = decoded.role === "staff" ? "staff_id" : "patient_id";

    const { data, error } = await supabase
      .from("access_requests")
      .select("*")
      .eq(column, decoded.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    res.json({ requests: data });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    if (err.message?.toLowerCase()?.includes("access_requests") && err.message?.toLowerCase()?.includes("does not exist")) {
      return res.status(500).json({ error: "Supabase table 'access_requests' not found. Run supabase_setup.sql updates." });
    }
    res.status(500).json({ error: err.message });
  }
};

export const decideAccessRequest = async (req, res) => {
  try {
    const decoded = requireToken(req);

    if (decoded.role !== "patient") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { requestId } = req.params;
    const { status } = req.body;

    if (!requestId || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid requestId/status" });
    }

    if (!supabase) {
      return res.json({ message: `Request ${status} (mock)` });
    }

    const { data: requestRow, error: requestFetchError } = await supabase
      .from("access_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (requestFetchError) throw requestFetchError;

    if (!requestRow || requestRow.patient_id !== decoded.id) {
      return res.status(404).json({ error: "Request not found" });
    }

    const { data: updated, error: updateError } = await supabase
      .from("access_requests")
      .update({ status })
      .eq("id", requestId)
      .select("*")
      .single();

    if (updateError) throw updateError;

    const today = new Date();
    const expiry = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expiryDate = expiry.toISOString().slice(0, 10);

    if (status === "approved") {
      const { error: consentError } = await supabase.from("consents").insert([
        {
          patient_id: requestRow.patient_id,
          requester_id: requestRow.staff_id,
          purpose: requestRow.purpose,
          expiry_date: expiryDate,
          status: "active",
          created_by: requestRow.patient_id
        }
      ]);
      if (consentError) throw consentError;

      const { error: logError } = await supabase.from("access_logs").insert([
        {
          patient_id: requestRow.patient_id,
          staff_id: requestRow.staff_id,
          purpose: requestRow.purpose,
          status: "granted"
        }
      ]);
      if (logError) throw logError;
    }

    if (status === "rejected") {
      const { error: logError } = await supabase.from("access_logs").insert([
        {
          patient_id: requestRow.patient_id,
          staff_id: requestRow.staff_id,
          purpose: requestRow.purpose,
          status: "denied"
        }
      ]);
      if (logError) throw logError;
    }

    res.json({ message: `Request ${status}`, request: updated });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    if (err.message?.toLowerCase()?.includes("access_requests") && err.message?.toLowerCase()?.includes("does not exist")) {
      return res.status(500).json({ error: "Supabase table 'access_requests' not found. Run supabase_setup.sql updates." });
    }
    res.status(500).json({ error: err.message });
  }
};
