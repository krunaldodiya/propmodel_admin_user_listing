import express from "express";

import { getUsers, getUserById, deleteUserById, updateUserById, getPurchasesByUserId } from "../../controllers/v1/userController.js";
import { getAdmins } from "../../controllers/v1/adminController.js";

const router = express.Router();

// User routes
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUserById);
router.delete("/users/:id", deleteUserById);
router.get("/users/:id/purchases", getPurchasesByUserId);

// Admin routes
router.get("/admins", getAdmins);

export default router;
