import supertest from "supertest";
import app from "src/app.js";
import knex from "knex";
import knexConfig from "src/config/knexConfig.js";
import i18next from "i18next";
import { v4 as uuidv4 } from 'uuid';

// Create test database instance
const testDb = knex(knexConfig.test);
// Replace app's db with test db
app.locals.db = testDb;

const request = supertest(app);
const db = app.locals.db;

// Helper function to make requests with language
const makeRequest = (method, url, lang = "en") => {
  const req = request[method](url);
  if (lang) {
    req.set("Accept-Language", lang);
  }
  return req;
};

// Run migrations before tests
beforeAll(async () => {
  await db.migrate.latest();
  // Wait for i18next to initialize
  await new Promise((resolve) => {
    if (i18next.isInitialized) {
      resolve();
    } else {
      i18next.on("initialized", resolve);
    }
  });
});

// Cleanup after all tests
afterAll(async () => {
  await db.destroy();
  await new Promise((resolve) => setTimeout(resolve, 500));
});

// Clean up tables before each test
beforeEach(async () => {
  await db("users").del();
});

describe("Role API Endpoints", () => {
  describe("GET /api/v1/users", () => {
    it("should show empty list of users", async () => {
      const response = await makeRequest("get", "/api/v1/users");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data.users.length).toBe(0);
    });

    it("should show list of users", async () => {
      await db("users").insert({
        email: "test@test.com",
        password: "password",
        first_name: "Test",
        last_name: "User",
        uuid: uuidv4(),
      });

      const response = await makeRequest("get", "/api/v1/users");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data.users.length).toBe(1);
    });
  });

  describe("GET /api/v1/users/:id", () => {
    it("should return user when found", async () => {
      const [userId] = await db("users").insert({
        email: "test@test.com",
        password: "password",
        first_name: "Test",
        last_name: "User",
        uuid: uuidv4(),
      });

      const response = await makeRequest("get", `/api/v1/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("id", userId);
      expect(response.body.data).toHaveProperty("email", "test@test.com");
    });

    it("should return 404 when user not found", async () => {
      const response = await makeRequest("get", "/api/v1/users/999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body.error.message).toContain("User not found by id: 999");
    });
  });

  describe("DELETE /api/v1/users/:id", () => {
    it("should delete user when found", async () => {
      const [userId] = await db("users").insert({
        email: "test@test.com",
        password: "password",
        first_name: "Test",
        last_name: "User",
        uuid: uuidv4(),
      });

      const response = await makeRequest("delete", `/api/v1/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toContain("deleted successfully");

      // Verify user is actually deleted
      const deletedUser = await db("users").where("id", userId).first();
      expect(deletedUser).toBeUndefined();
    });

    it("should return 404 when user not found", async () => {
      const response = await makeRequest("delete", "/api/v1/users/999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body.error.message).toContain("not found");
    });
  });
});
