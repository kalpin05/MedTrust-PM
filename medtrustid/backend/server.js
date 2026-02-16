import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const { default: authRoutes } = await import("./routes/auth.routes.js");
const { default: consentRoutes } = await import("./routes/consent.routes.js");
const { default: accessRequestRoutes } = await import("./routes/accessRequest.routes.js");
const { default: patientRoutes } = await import("./routes/patient.routes.js");
const { default: securityRoutes } = await import("./routes/security.routes.js");
const { default: simulationRoutes } = await import("./routes/simulation.routes.js");
import { securityMonitor } from "./middleware/securityMonitor.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(securityMonitor); // Apply global security monitoring

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/consent", consentRoutes);
app.use("/api/access-requests", accessRequestRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/simulation", simulationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("MedTrustID Server running on", PORT);
});
