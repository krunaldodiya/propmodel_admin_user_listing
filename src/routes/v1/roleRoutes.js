import express from "express";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  attachPermissions,
} from "../../controllers/v1/roleController.js";
import { requestHandler } from "../../middleware/request/requestHandler.js";
import {
  createRoleSchema,
  updateRoleSchema,
  roleIdSchema,
} from "../../schemas/validators/roleSchema.js";
import { attachPermissionsSchema } from "../../schemas/validators/rolePermissionSchema.js";

const router = express.Router();

router.get("/", getRoles);
router.post("/", requestHandler(createRoleSchema), createRole);
router.put(
  "/:id",
  requestHandler(roleIdSchema, "params"),
  requestHandler(updateRoleSchema),
  updateRole
);
router.delete("/:id", requestHandler(roleIdSchema, "params"), deleteRole);
router.post(
  "/:id/permissions",
  requestHandler(roleIdSchema, "params"),
  requestHandler(attachPermissionsSchema),
  attachPermissions
);

export default router;
