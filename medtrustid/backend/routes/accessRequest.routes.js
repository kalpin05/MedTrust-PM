import express from "express";
import {
  createAccessRequest,
  listMyAccessRequests,
  decideAccessRequest
} from "../controllers/accessRequest.controller.js";

const router = express.Router();

router.post("/create", createAccessRequest);
router.get("/my", listMyAccessRequests);
router.put("/:requestId/decision", decideAccessRequest);

export default router;
