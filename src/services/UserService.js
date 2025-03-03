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
      const user = await this.db("users")
        .select(
          "id",
          "uuid",
          "email",
          "first_name",
          "last_name",
          "phone",
          "status",
          "created_at",
          "updated_at"
        )
        .where("id", id)
        .first();

      if (!user) {
        return {
          error: {
            message: "User not found by id: " + id
          }
        }
      }

      return { data: user, message: "User fetched successfully" };
    } catch (error) {
      console.error('Error in getUserById:', error);
      throw new Error('Failed to fetch user: ' + error.message);
    }
  }

  /**
   * Get users with cursor-based pagination
   * @param {Object} params - Pagination parameters
   * @param {number} [params.cursor] - Last seen user ID
   * @param {number} [params.limit=25] - Number of users to return
   * @param {string} [params.order_by=id] - Column to sort by
   * @param {string} [params.order_by_direction=asc] - Sort direction ('asc' or 'desc')
   * @returns {Promise<Object>} Object containing users and pagination info
   */
  async getUsersWithPagination({ cursor, limit = 25, order_by = 'id', order_by_direction = 'asc' }) {
    try {
      const validColumns = [
        'id',
        'uuid',
        'email',
        'first_name',
        'last_name',
        'phone',
        'status',
        'created_at',
        'updated_at',
        'name' // Alias for first_name + last_name
      ];

      const validDirections = ['asc', 'desc'];

      // Validate order by parameters
      if (!validColumns.includes(order_by)) {
        return {
          error: {
            message: "Invalid sort column. Must be one of: " + validColumns.join(', ')
          }
        }
      }

      if (!validDirections.includes(order_by_direction)) {
        return {
          error: {
            message: "Invalid sort direction. Must be either 'asc' or 'desc'"
          }
        }
      }

      // Build the base query
      let query = this.db("users")
        .select(
          "id",
          "uuid",
          "email",
          "first_name",
          "last_name",
          "phone",
          "status",
          "created_at",
          "updated_at"
        );

      // Handle special case for 'name' column
      if (order_by === 'name') {
        query = query.orderBy('first_name', order_by_direction)
                    .orderBy('last_name', order_by_direction);
      } else {
        query = query.orderBy(order_by, order_by_direction);
      }

      query = query.limit(limit + 1); // Get one extra to determine if there are more

      // Apply cursor if provided
      if (cursor) {
        if (order_by === 'name') {
          // For name sorting, we need to handle the composite sort
          query = query.where(function() {
            this.where('first_name', order_by_direction === 'asc' ? '>' : '<', cursor)
                .orWhere(function() {
                  this.where('first_name', '=', cursor)
                      .where('last_name', order_by_direction === 'asc' ? '>' : '<', cursor);
                });
          });
        } else {
          query = query.where(order_by, order_by_direction === 'asc' ? '>' : '<', cursor);
        }
      }

      // Execute the query
      const users = await query;

      // Check if there are more results
      const hasMore = users.length > limit;
      const paginatedUsers = hasMore ? users.slice(0, -1) : users;
      const nextCursor = hasMore ? paginatedUsers[paginatedUsers.length - 1][order_by === 'name' ? 'first_name' : order_by] : null;

      // Get total count
      const countResult = await this.db("users").count("* as count").first();
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
      throw new Error('Failed to fetch users: ' + error.message);
    }
  }
}

export default UserService;
