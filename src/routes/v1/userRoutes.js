import express from "express";

import { getPaginatedUsers, getUserById, deleteUserById } from "../../controllers/v1/userController.js";

const router = express.Router();

router.get("/users", getPaginatedUsers);
router.get("/users/:id", getUserById);
router.delete("/users/:id", deleteUserById);

export default router;
