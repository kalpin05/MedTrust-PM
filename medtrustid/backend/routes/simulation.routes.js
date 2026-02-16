import express from "express";
import { startSimulation } from "../controllers/simulation.controller.js";

const router = express.Router();

router.post("/start", startSimulation);

export default router;
