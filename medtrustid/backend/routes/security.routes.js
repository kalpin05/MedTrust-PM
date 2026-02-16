import express from "express";
import { getAlerts, getStats, resolveAlert } from "../controllers/security.controller.js";

const router = express.Router();

router.get("/alerts", getAlerts);
router.get("/stats", getStats);
router.post("/alerts/:id/resolve", resolveAlert);

export default router;
