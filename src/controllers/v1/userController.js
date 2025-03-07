import UserService from "../../services/UserService.js";
import {
  userIdSchema,
  updateUserSchema,
} from "../../schemas/validators/userSchema.js";
import roles from "../../utils/roles.js";

/**
 * @endpoint GET /api/v1/users/:id
 * @description Get user by ID
 * @param {number} id - User ID
 */
export const getUserById = async (req, res) => {
  try {
    const { error, value } = userIdSchema.validate(req.params);

    if (error) {
      return res.error(error.details[0].message, 400);
    }

    const userService = new UserService(req.app.locals.db);
    const response = await userService.getUserById(value.id);
    res.success(response.data, response.message);
  } catch (error) {
    if (error.message.includes("not found")) {
      res.error(error.message, 404);
    } else {
      res.error(error.message, 500);
    }
  }
};

/**
 * @endpoint GET /api/v1/users
 * @description Get paginated regular users with cursor-based pagination
 * @query {number} [cursor] - Last seen user ID
 * @query {number} [limit=25] - Number of users to return
 * @query {string} [order_by=id] - Column to sort by
 * @query {string} [order_by_direction=asc] - Sort direction (asc/desc)
 */
export const getUsers = async (req, res) => {
  try {
    const { cursor, limit, order_by, order_by_direction } = req.query;

    const userRoleIds = [roles.USER];

    const userService = new UserService(req.app.locals.db);

    const response = await userService.getUsersWithPagination({
      cursor: cursor ? parseInt(cursor) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      order_by: order_by || "id",
      order_by_direction: order_by_direction || "asc",
      role_ids: userRoleIds,
    });

    res.success(response.data, response.message);
  } catch (error) {
    if (error.message.includes("Invalid sort")) {
      res.error(error.message, 400);
    } else {
      res.error(error.message, 500);
    }
  }
};

/**
 * @endpoint DELETE /api/v1/users/:id
 * @description Delete user by ID
 * @param {number} id - User ID
 */
export const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userService = new UserService(req.app.locals.db);

    const response = await userService.deleteUserById(parseInt(id));
    res.success(null, response.message);
  } catch (error) {
    if (error.message.includes("not found")) {
      res.error(error.message, 404);
    } else {
      res.error(req.t("common.errors.internal_server_error"), 500);
    }
  }
};

/**
 * @endpoint PUT /api/v1/users/:id
 * @description Update user by ID
 * @param {number} id - User ID
 * @param {Object} updateData - User data to update
 */
export const updateUserById = async (req, res) => {
  try {
    // Validate ID
    const { error: idError, value: idValue } = userIdSchema.validate(
      req.params
    );
    if (idError) {
      return res.error(idError.details[0].message, 400);
    }

    // Validate update data
    const { error: updateError, value: updateData } = updateUserSchema.validate(
      req.body
    );
    if (updateError) {
      return res.error(updateError.details[0].message, 400);
    }

    const userService = new UserService(req.app.locals.db);
    const response = await userService.updateUserById(idValue.id, updateData);
    res.success(response.data, response.message);
  } catch (error) {
    if (error.message.includes("not found")) {
      res.error(error.message, 404);
    } else {
      res.error(error.message, 500);
    }
  }
};

export const getPurchasesByUserId = async (req, res) => {
  try {
    const { error, value } = userIdSchema.validate(req.params);

    if (error) {
      return res.error(error.details[0].message, 400);
    }

    const { cursor, limit, order_by, order_by_direction } = req.query;

    const userService = new UserService(req.app.locals.db);

    const response = await userService.getPurchasesByUserId({
      userId: value.id,
      cursor: cursor ? parseInt(cursor) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      order_by: order_by || "id",
      order_by_direction: order_by_direction || "asc",
    });

    res.success(response.data, response.message);
  } catch (error) {
    if (error.message.includes("No purchases found")) {
      res.error(error.message, 404);
    } else if (error.message.includes("not found")) {
      res.error(error.message, 404);
    } else {
      res.error(error.message, 500);
    }
  }
};

export const getUserDevices = async (req, res) => {
  const db = req.app.locals.db;
  const userId = parseInt(req.params.id);

  try {
    // Check if user exists
    const user = await db("users").where("id", userId).first();
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: `User not found by id: ${userId}`,
        },
      });
    }

    // Get user devices
    const devices = await db("user_devices")
      .where("user_id", userId)
      .select(
        "id",
        "browser",
        "os",
        "device",
        "ip",
        "location_info",
        "created_at"
      );

    return res.status(200).json({
      success: true,
      data: {
        devices,
      },
    });
  } catch (error) {
    console.error("Error fetching user devices:", error);
    return res.status(500).json({
      success: false,
      error: {
        message: "Internal server error",
      },
    });
  }
};
