import UserService from "../../services/UserService.js";

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

    const result = await userService.getUsersWithPagination({
      cursor: cursor ? parseInt(cursor) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      order_by: order_by ? order_by : 'id',
      order_by_direction: order_by_direction ? order_by_direction : 'asc'
    });

    res.success(result);
  } catch (error) {
    console.log(error);
    res.error({ error }, 500);
  }
};
