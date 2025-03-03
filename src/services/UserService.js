class UserService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Get users with cursor-based pagination
   * @param {Object} params - Pagination parameters
   * @param {number} [params.cursor] - Last seen user ID
   * @param {number} [params.limit=25] - Number of users to return
   * @returns {Promise<Object>} Object containing users and pagination info
   */
  async getUsersWithPagination({ cursor, limit = 25 } = {}) {
    try {
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
        )
        .orderBy("id", "asc")
        .limit(limit + 1); // Get one extra to determine if there are more

      // Apply cursor if provided
      if (cursor) {
        query = query.where("id", ">", cursor);
      }

      // Execute the query
      const users = await query;

      // Check if there are more results
      const hasMore = users.length > limit;
      const paginatedUsers = hasMore ? users.slice(0, -1) : users;
      const nextCursor = hasMore ? paginatedUsers[paginatedUsers.length - 1].id : null;

      // Get total count
      const countResult = await this.db("users").count("* as count").first();
      const total = parseInt(countResult.count);

      return {
        users: paginatedUsers,
        pagination: {
          hasMore,
          nextCursor,
          total,
          limit
        }
      };
    } catch (error) {
      console.error('Error in getUsersWithPagination:', error);
      throw new Error('Failed to fetch users: ' + error.message);
    }
  }
}

export default UserService;
