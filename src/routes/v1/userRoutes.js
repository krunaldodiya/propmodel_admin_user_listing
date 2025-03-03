import express from "express";

import { getPaginatedUsers, getUserById } from "../../controllers/v1/userController.js";

const router = express.Router();

router.get("/users", getPaginatedUsers);
router.get("/users/:id", getUserById);

export default router;
