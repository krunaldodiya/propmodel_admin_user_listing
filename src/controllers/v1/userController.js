import UserService from "../../services/UserService.js";

/**
 * @endpoint GET /api/v1/users/:id
 * @description Get user by ID
 * @param {number} id - User ID
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const userService = new UserService(req.app.locals.db);

    const response = await userService.getUserById(parseInt(id));

    res.success(response);
  } catch (error) {
    console.log(error);
    if (error.message.includes('not found')) {
      res.error({ error }, 404);
    } else {
      res.error({ error }, 500);
    }
  }
};

/**
 * @endpoint GET /api/v1/users
 * @description Get paginated users with cursor-based pagination
 * @query {number} [cursor] - Last seen user ID
 * @query {number} [limit=25] - Number of users to return
 * @query {string} [order_by=id] - Column to sort by
 * @query {string} [order_by_direction=asc] - Sort direction (asc/desc)
 */
export const getPaginatedUsers = async (req, res) => {
  try {
    const { cursor, limit, order_by, order_by_direction } = req.query;
    const userService = new UserService(req.app.locals.db);

    const response = await userService.getUsersWithPagination({
      cursor: cursor ? parseInt(cursor) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      order_by: order_by ? order_by : 'id',
      order_by_direction: order_by_direction ? order_by_direction : 'asc'
    });

    res.success(response);
  } catch (error) {
    console.log(error);
    res.error({ error }, 500);
  }
};
