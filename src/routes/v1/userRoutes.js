import express from "express";

import { getPaginatedUsers } from "../../controllers/v1/userController.js";

const router = express.Router();

router.get("/users", getPaginatedUsers);

export default router;
