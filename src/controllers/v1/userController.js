import UserService from "../../services/UserService.js";

/**
 * @endpoint GET /api/v1/users
 * @description Get paginated users with cursor-based pagination
 * @query {number} [cursor] - Last seen user ID
 * @query {number} [limit=25] - Number of users to return
 */
export const getPaginatedUsers = async (req, res) => {
  try {
    const { cursor, limit } = req.query;
    const userService = new UserService(req.app.locals.db);

    const result = await userService.getUsersWithPagination({
      cursor: cursor ? parseInt(cursor) : undefined,
      limit: limit ? parseInt(limit) : undefined
    });

    res.success(result);
  } catch (error) {
    console.log(error);
    res.error({ error }, 500);
  }
};
