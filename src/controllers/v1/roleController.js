import RoleService from "../../services/roleService.js";

/**
 * @endpoint GET /api/v1/roles
 * @description Get all active roles
 */
export const getRoles = async (req, res) => {
  try {
    const roleService = new RoleService(req.app.locals.db);

    const roles = await roleService.getAllRoles();

    res.success(roles, req.t("roles.retrieved"));
  } catch (error) {
    res.error(req.t("roles.errors.fetch"), 500);
  }
};

/**
 * @endpoint POST /api/v1/roles
 * @description Create a new role
 */
export const createRole = async (req, res) => {
  try {
    const roleService = new RoleService(req.app.locals.db);

    const role = await roleService.createRole(req.body);

    res.success(role, req.t("roles.created"), 201);
  } catch (error) {
    if (error.statusCode === 409) {
      res.error(error.message, error.statusCode);
    } else {
      res.error(req.t("roles.errors.create"), 500);
    }
  }
};

/**
 * @endpoint PUT /api/v1/roles/:id
 * @description Update a role by ID
 */
export const updateRole = async (req, res) => {
  try {
    const roleService = new RoleService(req.app.locals.db);

    const role = await roleService.updateRole(req.params.id, req.body);

    res.success(role, req.t("roles.updated"));
  } catch (error) {
    if (error.statusCode === 404 || error.statusCode === 409) {
      res.error(error.message, error.statusCode);
    } else {
      res.error(req.t("roles.errors.update"), 500);
    }
  }
};

/**
 * @endpoint DELETE /api/v1/roles/:id
 * @description Delete a role by ID
 */
export const deleteRole = async (req, res) => {
  try {
    const roleService = new RoleService(req.app.locals.db);

    const role = await roleService.deleteRole(req.params.id);

    res.success(role, req.t("roles.deleted"));
  } catch (error) {
    if (error.statusCode === 404) {
      res.error(error.message, error.statusCode);
    } else {
      res.error(req.t("roles.errors.delete"), 500);
    }
  }
};

/**
 * @endpoint POST /api/v1/roles/:id/permissions
 * @description Attach permissions to a role
 */
export const attachPermissions = async (req, res) => {
  try {
    const roleService = new RoleService(req.app.locals.db);
    const { permissionIds } = req.body;

    const attachedPermissions = await roleService.attachPermissions(
      req.params.id,
      permissionIds
    );

    res.success(attachedPermissions, req.t("roles.permissions.attached"));
  } catch (error) {
    if (error.statusCode === 404) {
      res.error(error.message, error.statusCode);
    } else {
      res.error(req.t("roles.errors.attach_permissions"), 500);
    }
  }
};
