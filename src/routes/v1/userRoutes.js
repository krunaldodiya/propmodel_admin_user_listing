import express from "express";

import { getUsers } from "../../controllers/v1/userController.js";

const router = express.Router();

router.get("/users", getUsers);

export default router;
