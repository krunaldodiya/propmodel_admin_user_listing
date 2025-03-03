import PermissionService from "../../services/permissionService.js";

/**
 * @endpoint GET /api/v1/permissions
 * @description Get all active permissions
 */
export const getPermissions = async (req, res) => {
  try {
    const permissionService = new PermissionService(req.app.locals.db);

    const permissions = await permissionService.getAllPermissions();

    res.success(permissions, req.t("permissions.retrieved"));
  } catch (error) {
    res.error(req.t("permissions.errors.fetch"), 500);
  }
};

/**
 * @endpoint POST /api/v1/permissions
 * @description Create a new permission
 */
export const createPermission = async (req, res) => {
  try {
    const permissionService = new PermissionService(req.app.locals.db);

    const permission = await permissionService.createPermission(req.body);

    res.success(permission, req.t("permissions.created"), 201);
  } catch (error) {
    if (error.statusCode === 409) {
      res.error(error.message, error.statusCode);
    } else {
      res.error(req.t("permissions.errors.create"), 500);
    }
  }
};

/**
 * @endpoint PUT /api/v1/permissions/:id
 * @description Update a permission by ID
 */
export const updatePermission = async (req, res) => {
  try {
    const permissionService = new PermissionService(req.app.locals.db);

    const permission = await permissionService.updatePermission(
      req.params.id,
      req.body
    );

    res.success(permission, req.t("permissions.updated"));
  } catch (error) {
    if (error.statusCode === 404 || error.statusCode === 409) {
      res.error(error.message, error.statusCode);
    } else {
      res.error(req.t("permissions.errors.update"), 500);
    }
  }
};

/**
 * @endpoint DELETE /api/v1/permissions/:id
 * @description Delete a permission by ID
 */
export const deletePermission = async (req, res) => {
  try {
    const permissionService = new PermissionService(req.app.locals.db);

    const permission = await permissionService.deletePermission(req.params.id);

    res.success(permission, req.t("permissions.deleted"));
  } catch (error) {
    if (error.statusCode === 404) {
      res.error(error.message, error.statusCode);
    } else {
      res.error(req.t("permissions.errors.delete"), 500);
    }
  }
};
