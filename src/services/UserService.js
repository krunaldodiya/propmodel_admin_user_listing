class UserService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Get all active roles
   * @returns {Promise<Array>} Array of roles
   */
  async getAllUsers() {
    try {
      return await this.db("users").select("id");
    } catch (error) {
      throw error;
    }
  }
}

export default UserService;
