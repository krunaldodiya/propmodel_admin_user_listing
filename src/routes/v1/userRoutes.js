import express from "express";

import {
  getUsers,
  getUserById,
  deleteUserById,
  updateUserById,
  getPurchasesByUserId,
  getUserDevices,
} from "../../controllers/v1/userController.js";
import { tokenVerificationMiddleware } from "../../middleware/tokenVerification.js";

const router = express.Router();

// User routes
router.get("/users", tokenVerificationMiddleware, getUsers);
router.get("/users/:id", tokenVerificationMiddleware, getUserById);
router.put("/users/:id", tokenVerificationMiddleware, updateUserById);
router.delete("/users/:id", tokenVerificationMiddleware, deleteUserById);
router.get(
  "/users/:id/purchases",
  tokenVerificationMiddleware,
  getPurchasesByUserId
);
router.get("/users/:id/devices", tokenVerificationMiddleware, getUserDevices);

export default router;
