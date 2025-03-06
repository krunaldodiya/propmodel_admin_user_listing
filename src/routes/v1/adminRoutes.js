import express from "express";
import { getAdmins, getAdminCount, createAdmin } from "../../controllers/v1/adminController.js";
import { tokenVerificationMiddleware } from '../../middleware/tokenVerification.js';

const router = express.Router();

// Admin routes
router.get("/admins", tokenVerificationMiddleware, getAdmins);
router.post("/admins", tokenVerificationMiddleware, createAdmin);
router.get("/admins/count", tokenVerificationMiddleware, getAdminCount);

export default router; 