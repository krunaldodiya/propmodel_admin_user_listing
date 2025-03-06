import UserService from "../../services/UserService.js";
import roles from "../../utils/roles.js";
import { createAdminSchema } from "../../schemas/validators/createAdminSchema.js";

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
    if (error.message.includes('Token cannot be blank')) {
      res.error(error.message, 401);
    } else {
      res.error(error.message, 500);
    }
  }
};

/**
 * @endpoint POST /api/v1/admins
 * @description Create a new admin user
 * @body {string} first_name - First name of the admin
 * @body {string} last_name - Last name of the admin
 * @body {string} email - Email of the admin
 * @body {string} phone - Phone number of the admin
 * @body {string} address - Address of the admin
 * @body {string} postal_code - Postal code of the admin
 * @body {string} town_city - Town or city of the admin
 * @body {string} state - State of the admin
 * @body {string} country - Country of the admin
 */
export const createAdmin = async (req, res) => {
  try {
    // Validate the request payload
    const { error } = createAdminSchema.validate(req.body);

    if (error) {
      return res.error(error.details[0].message, 400);
    }

    // Extract the validated data
    const { first_name, last_name, email, phone, address, postal_code, city, state, country } = req.body;

    // Insert the new admin into the database
    const newAdmin = await req.app.locals.db("users").insert({
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      zip: postal_code,
      state,
      country,
      role_id: roles.ADMIN
    });

    // Return success response
    res.success(newAdmin, "Admin created successfully", 201);
  } catch (error) {
    res.error(error.message, 500);
  }
};