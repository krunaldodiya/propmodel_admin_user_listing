import UserService from "../../services/UserService.js";
import roles from "../../utils/roles.js";

/**
 * @endpoint GET /api/v1/admins
 * @description Get paginated admins with cursor-based pagination
 * @query {number} [cursor] - Last seen user ID
 * @query {number} [limit=25] - Number of admins to return
 * @query {string} [order_by=id] - Column to sort by
 * @query {string} [order_by_direction=asc] - Sort direction (asc/desc)
 */
export const getAdmins = async (req, res) => {
  try {
    const { cursor, limit, order_by, order_by_direction } = req.query;

    const adminRoleIds = [
      roles.ADMIN,
      roles.MASTER_ADMIN,
      roles.SUBADMIN,
      roles.CUSTOMER_SUPPORT,
      roles.TECH_SUPPORT,
      roles.MANAGER
    ];

    const userService = new UserService(req.app.locals.db);
    const response = await userService.getUsersWithPagination({
      cursor: cursor ? parseInt(cursor) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      order_by: order_by || 'id',
      order_by_direction: order_by_direction || 'asc',
      role_ids: adminRoleIds
    });

    res.success(response.data, response.message);
  } catch (error) {
    console.error('Error in getAdmins:', error);
    if (error.message.includes('Invalid sort')) {
      res.error(error.message, 400);
    } else {
      res.error(error.message, 500);
    }
  }
};

/**
 * @endpoint GET /api/v1/admins/count
 * @description Get total count of admin users
 */
export const getAdminCount = async (req, res) => {
  try {
    const adminRoleIds = [
      roles.ADMIN,
      roles.MASTER_ADMIN,
      roles.SUBADMIN,
      roles.CUSTOMER_SUPPORT,
      roles.TECH_SUPPORT,
      roles.MANAGER
    ];

    const userService = new UserService(req.app.locals.db);
    const counts = await userService.getAdminCount(adminRoleIds);

    res.success(counts, "Admin counts retrieved successfully");
  } catch (error) {
    console.error('Error in getAdminCount:', error);
    if (error.message.includes('Token cannot be blank')) {
      res.error(error.message, 401);
    } else {
      res.error(error.message, 500);
    }
  }
};