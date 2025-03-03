import express from "express";
import {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "../../controllers/v1/permissionController.js";
import { requestHandler } from "../../middleware/request/requestHandler.js";
import {
  createPermissionSchema,
  updatePermissionSchema,
  permissionIdSchema,
} from "../../schemas/validators/permissionSchema.js";

const router = express.Router();

router.get("/", getPermissions);
router.post("/", requestHandler(createPermissionSchema), createPermission);
router.put(
  "/:id",
  requestHandler(permissionIdSchema, "params"),
  requestHandler(updatePermissionSchema),
  updatePermission
);
router.delete(
  "/:id",
  requestHandler(permissionIdSchema, "params"),
  deletePermission
);

export default router;
