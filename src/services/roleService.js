import { errors } from "../middleware/error/errorHandler.js";

class RoleService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Get all active roles
   * @returns {Promise<Array>} Array of roles
   */
  async getAllRoles() {
    try {
      return await this.db("roles").select(
        "id",
        "name",
        "description",
        "created_at",
        "updated_at"
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new role
   * @param {Object} roleData - The role data
   * @returns {Promise<Object>} Created role
   */
  async createRole(roleData) {
    try {
      const existingRole = await this.db("roles")
        .where({ name: roleData.name })
        .first();

      if (existingRole) {
        throw errors.conflict("Role already exists", "roles.already_exists");
      }

      const [role] = await this.db("roles")
        .insert(roleData)
        .returning(["id", "name", "description", "created_at", "updated_at"]);

      return role;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a role by ID
   * @param {number} id - Role ID to update
   * @param {Object} roleData - The role data to update
   * @returns {Promise<Object>} Updated role
   */
  async updateRole(id, roleData) {
    try {
      // Check if role exists
      const existingRole = await this.db("roles").where({ id }).first();

      if (!existingRole) {
        throw errors.notFound("Role not found", "roles.not_found");
      }

      // Update the role
      const [updated] = await this.db("roles")
        .where({ id })
        .update(roleData)
        .returning(["id", "name", "description", "created_at", "updated_at"]);

      return updated || existingRole;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a role by ID
   * @param {number} id - Role ID to delete
   * @returns {Promise<Object>} Deleted role
   */
  async deleteRole(id) {
    try {
      // Check if role exists and get its data
      const role = await this.db("roles").where({ id }).first();

      if (!role) {
        throw errors.notFound("Role not found", "roles.not_found");
      }

      await this.db("roles").where({ id }).del();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Attach permissions to a role
   * @param {number} roleId - Role ID to attach permissions to
   * @param {number[]} permissionIds - Array of permission IDs to attach
   * @returns {Promise<Array>} Array of attached permissions
   */
  async attachPermissions(roleId, permissionIds) {
    try {
      // Check if role exists
      const role = await this.db("roles").where({ id: roleId }).first();
      if (!role) {
        throw errors.notFound("Role not found", "roles.not_found");
      }

      // Check if all permissions exist
      const permissions = await this.db("permissions").whereIn(
        "id",
        permissionIds
      );

      if (permissions.length !== permissionIds.length) {
        throw errors.notFound(
          "One or more permissions not found",
          "permissions.not_found"
        );
      }

      // Start a transaction
      await this.db.transaction(async (trx) => {
        // Delete existing permissions for this role
        await trx("role_permissions").where({ role_id: roleId }).del();

        // Insert new permissions
        const rolePermissions = permissionIds.map((permissionId) => ({
          role_id: roleId,
          permission_id: permissionId,
        }));

        await trx("role_permissions").insert(rolePermissions);
      });

      // Return the newly attached permissions
      return await this.db("role_permissions")
        .where({ role_id: roleId })
        .select("permission_id");
    } catch (error) {
      throw error;
    }
  }
}

export default RoleService;
