class UserService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object>} User object
   */
  async getUserById(id) {
    try {
      const validColumns = [
        'id',
        'uuid',
        'ref_by_user_id',
        'ref_link_count',
        'role_id',
        'email',
        'first_name',
        'last_name',
        'phone',
        'phone_verified',
        'status',
        'address',
        'country',
        'state',
        'zip',
        'timezone',
        'identity_status',
        'identity_verified_at',
        'affiliate_terms',
        'dashboard_popup',
        'discord_connected',
        'used_free_count',
        'available_count',
        'trail_verification_status',
        'last_login_at',
        'created_at',
        'updated_at'
      ];

      const user = await this.db("users")
        .select(validColumns)
        .where("id", id)
        .first();

      if (!user) {
        throw new Error("User not found by id: " + id);
      }

      return { data: user, message: "User fetched successfully" };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get users with cursor-based pagination
   * @param {Object} params - Pagination parameters
   * @param {number} [params.cursor] - Last seen user ID
   * @param {number} [params.limit=25] - Number of users to return
   * @param {string} [params.order_by=id] - Column to sort by
   * @param {string} [params.order_by_direction=asc] - Sort direction ('asc' or 'desc')
   * @param {number[]} [params.role_ids=[2]] - Array of role IDs to filter by
   * @returns {Promise<Object>} Object containing users and pagination info
   */
  async getUsersWithPagination({ cursor, limit = 25, order_by = 'id', order_by_direction = 'asc', role_ids = [2] }) {
    try {
      const validColumns = [
        'id',
        'uuid',
        'ref_by_user_id',
        'ref_link_count',
        'role_id',
        'email',
        'first_name',
        'last_name',
        'phone',
        'phone_verified',
        'status',
        'address',
        'country',
        'state',
        'zip',
        'timezone',
        'identity_status',
        'identity_verified_at',
        'affiliate_terms',
        'dashboard_popup',
        'discord_connected',
        'used_free_count',
        'available_count',
        'trail_verification_status',
        'last_login_at',
        'created_at',
        'updated_at'
      ];

      const validDirections = ['asc', 'desc'];

      // Validate order by parameters
      if (!validColumns.includes(order_by)) {
        throw new Error("Invalid sort column. Must be one of: " + validColumns.join(', '));
      }

      if (!validDirections.includes(order_by_direction)) {
        throw new Error("Invalid sort direction. Must be either 'asc' or 'desc'");
      }

      // Build the base query
      let query = this.db("users")
        .select(validColumns)
        .whereIn("role_id", role_ids);

      // First order by the requested column
      query = query.orderBy(order_by, order_by_direction);

      // Then add a secondary sort by id to ensure stable pagination
      query = query.orderBy('id', order_by_direction);

      // Get one extra to determine if there are more
      query = query.limit(limit + 1);

      // Apply cursor if provided - always use id for cursor
      if (cursor) {
        query = query.where('id', order_by_direction === 'asc' ? '>' : '<', cursor);
      }

      // Execute the query
      const users = await query;

      // Check if there are more results
      const hasMore = users.length > limit;
      const paginatedUsers = hasMore ? users.slice(0, -1) : users;
      const nextCursor = hasMore ? paginatedUsers[paginatedUsers.length - 1].id : null;

      // Get total count for users with these role IDs
      const countResult = await this.db("users")
        .whereIn("role_id", role_ids)
        .count("* as count")
        .first();

      const total = parseInt(countResult.count);

      return {
        data: {
          users: paginatedUsers,
          pagination: {
            hasMore,
            nextCursor,
            total,
            limit,
            orderBy: {
              column: order_by,
              direction: order_by_direction
            }
          }
        },
        message: "Users fetched successfully"
      };
    } catch (error) {
      console.error('Error in getUsersWithPagination:', error);
      throw error;
    }
  }

  /**
   * Delete user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object>} Success message
   */
  async deleteUserById(id) {
    try {
      const deleted = await this.db("users")
        .where("id", id)
        .del();

      if (!deleted) {
        throw new Error("User not found by id: " + id);
      }

      return { message: "User deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user by ID
   * @param {number} id - User ID
   * @param {Object} updateData - User data to update
   * @returns {Promise<Object>} Updated user data
   */
  async updateUserById(id, updateData) {
    const validColumns = [
      'id',
      'uuid',
      'ref_by_user_id',
      'ref_link_count',
      'role_id',
      'email',
      'first_name',
      'last_name',
      'phone',
      'phone_verified',
      'status',
      'address',
      'country',
      'state',
      'zip',
      'timezone',
      'identity_status',
      'identity_verified_at',
      'affiliate_terms',
      'dashboard_popup',
      'discord_connected',
      'used_free_count',
      'available_count',
      'trail_verification_status',
      'last_login_at',
      'created_at',
      'updated_at'
    ];

    try {
      // Check if user exists
      const existingUser = await this.db("users")
        .where("id", id)
        .first();

      if (!existingUser) {
        throw new Error("User not found by id: " + id);
      }

      // Update user
      const [updatedUser] = await this.db("users")
        .where("id", id)
        .update({
          ...updateData,
          updated_at: this.db.fn.now()
        })
        .returning(validColumns);

      return { data: updatedUser, message: "User updated successfully" };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get purchases by user ID
   * @param {number} userId - User ID
   * @param {number} [limit=10] - Number of purchases to return
   * @param {number} [cursor] - Last seen purchase ID
   * @returns {Promise<Object>} Purchases object
   */
  async getPurchasesByUserId(userId, limit = 10, cursor = null) {
    try {
      const userExists = await this.db("users").where("id", userId).first();

      if (!userExists) {
        throw new Error("User not found by id: " + userId);
      }

      const query = this.db("purchases").select(
        "id",
        "user_id",
        "amount_total",
        "currency",
        "payment_method",
        "payment_status",
        "created_at"
      ).where("user_id", userId);

      if (cursor) {
        query.where("id", ">", cursor);
      }

      const purchases = await query.limit(limit);

      if (purchases.length === 0) {
        throw new Error("No purchases found for user ID: " + userId);
      }

      const nextCursor = purchases[purchases.length - 1].id;

      return { data: { purchases, nextCursor }, message: "Purchases fetched successfully" };
    } catch (error) {
      throw error;
    }
  }
}

export default UserService;
