import express from "express";

import { getPaginatedUsers, getUserById, deleteUserById, updateUserById, getPurchasesByUserId } from "../../controllers/v1/userController.js";

const router = express.Router();

router.get("/users", getPaginatedUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUserById);
router.delete("/users/:id", deleteUserById);
router.get("/users/:id/purchases", getPurchasesByUserId);

export default router;
