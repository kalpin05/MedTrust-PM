import express from "express";
import { searchPatients } from "../controllers/patient.controller.js";

const router = express.Router();

router.get("/search", searchPatients);

export default router;
