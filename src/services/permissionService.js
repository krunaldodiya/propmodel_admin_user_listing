import { errors } from "../middleware/error/errorHandler.js";

class PermissionService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Get all active permissions
   * @returns {Promise<Array>} Array of permissions
   */
  async getAllPermissions() {
    try {
      return await this.db("permissions").select(
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
   * Create a new permission
   * @param {Object} permissionData - The permission data
   * @returns {Promise<Object>} Created permission
   */
  async createPermission(permissionData) {
    try {
      const existingPermission = await this.db("permissions")
        .where({ name: permissionData.name })
        .first();

      if (existingPermission) {
        throw errors.conflict(
          "Permission already exists",
          "permissions.already_exists"
        );
      }

      const [permission] = await this.db("permissions")
        .insert(permissionData)
        .returning(["id", "name", "description", "created_at", "updated_at"]);

      return permission;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a permission by ID
   * @param {number} id - Permission ID to update
   * @param {Object} permissionData - The permission data to update
   * @returns {Promise<Object>} Updated permission
   */
  async updatePermission(id, permissionData) {
    try {
      // Check if permission exists
      const existingPermission = await this.db("permissions")
        .where({ id })
        .first();

      if (!existingPermission) {
        throw errors.notFound("Permission not found", "permissions.not_found");
      }

      // Update the permission
      const [updated] = await this.db("permissions")
        .where({ id })
        .update(permissionData)
        .returning(["id", "name", "description", "created_at", "updated_at"]);

      return updated || existingPermission;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a permission by ID
   * @param {number} id - Permission ID to delete
   * @returns {Promise<Object>} Deleted permission
   */
  async deletePermission(id) {
    try {
      // Check if permission exists and get its data
      const permission = await this.db("permissions").where({ id }).first();

      if (!permission) {
        throw errors.notFound("Permission not found", "permissions.not_found");
      }

      await this.db("permissions").where({ id }).del();
    } catch (error) {
      throw error;
    }
  }
}

export default PermissionService;
