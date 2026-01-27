import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const { default: authRoutes } = await import("./routes/auth.routes.js");
const { default: consentRoutes } = await import("./routes/consent.routes.js");
const { default: accessRequestRoutes } = await import("./routes/accessRequest.routes.js");
const { default: patientRoutes } = await import("./routes/patient.routes.js");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/consent", consentRoutes);
app.use("/api/access-requests", accessRequestRoutes);
app.use("/api/patients", patientRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("MedTrustID Server running on", PORT);
});
