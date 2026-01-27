import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.log("Warning: Supabase credentials not configured. Using mock mode.");
}

export const register = async (req, res) => {
  try {
    const { name, email, password, role = "patient" } = req.body;

    const hash = await bcrypt.hash(password, 10);

    if (!supabase) {
      const token = jwt.sign({ id: "mock-id", email, role }, process.env.JWT_SECRET);
      return res.json({ message: "Registered", token, user: { name, email, role } });
    }

    const { data, error } = await supabase
      .from("users")
      .insert([{ name, email, password: hash, role }])
      .select("id,name,email,role")
      .single();

    if (error) throw error;

    const token = jwt.sign({ id: data.id, email: data.email, role: data.role }, process.env.JWT_SECRET);

    res.json({ message: "Registered", token, user: data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!supabase) {
      // Mock mode - return fake success
      const token = jwt.sign(
        { id: "mock-user-id" },
        process.env.JWT_SECRET
      );
      return res.json({
        token,
        name: "Mock User"
      });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user)
      return res.status(404).json({ error: "Not found" });

    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
