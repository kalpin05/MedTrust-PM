import express from "express";
import {
  createConsent,
  revokeConsent,
  getConsents,
  getCurrentPatientConsents,
  getStaffConsents
} from "../controllers/consent.controller.js";

const router = express.Router();

router.post("/create", createConsent);
router.put("/:consentId/revoke", revokeConsent);
router.get("/patient/current", getCurrentPatientConsents);
router.get("/patient/:patientId", getConsents);
router.get("/staff/consents", getStaffConsents);

export default router;
