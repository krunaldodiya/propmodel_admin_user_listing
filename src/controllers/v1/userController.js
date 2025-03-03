import UserService from "../../services/UserService.js";

/**
 * @endpoint GET /api/v1/users
 * @description Get all users
 */
export const getUsers = async (req, res) => {
  try {
    const userService = new UserService(req.app.locals.db);

    const users = await userService.getAllUsers();

    res.success({ data: users });
  } catch (error) {
    res.error({ error: "there was some issue fetching users" }, 500);
  }
};
