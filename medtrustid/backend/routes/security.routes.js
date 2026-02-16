import express from "express";
import { getAlerts, getStats, resolveAlert } from "../controllers/security.controller.js";
import { startSimulation } from "../controllers/simulation.controller.js";

const router = express.Router();

router.get("/alerts", getAlerts);
router.get("/stats", getStats);
router.post("/simulation/start", startSimulation);
router.post("/alerts/:id/resolve", resolveAlert);

export default router;
