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

const validApiKey = process.env.API_KEY; // Mock API key for testing

// Helper function to make requests with language
const makeRequest = (method, url, lang = "en") => {
  const req = request[method](url).set("api_key", validApiKey);

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

describe("User API Endpoints", () => {
  describe("GET /api/v1/users", () => {
    it("should return 401 when no API key is provided", async () => {
      const response = await makeRequest("get", "/api/v1/users").set("api_key", "");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should show empty list of users", async () => {
      const response = await makeRequest("get", "/api/v1/users");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data.users.length).toBe(0);
    });

    it("should show list of users", async () => {
      await db("users").insert({
        role_id: 2,
        email: "test@test.com",
        password: "password",
        first_name: "Test",
        last_name: "User",
        uuid: uuidv4(),
      });

      const response = await makeRequest("get", "/api/v1/users");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("users");
      expect(response.body.data.users.length).toBe(1);
    });
  });

  describe("GET /api/v1/users/:id", () => {
    it("should return 401 when no API key is provided", async () => {
      const response = await makeRequest("get", "/api/v1/users").set("api_key", "");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("success", false);
    });

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
    it("should return 401 when no API key is provided", async () => {
      const response = await makeRequest("get", "/api/v1/users").set("api_key", "");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("success", false);
    });

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

  describe("PUT /api/v1/users/:id", () => {
    it("should return 401 when no API key is provided", async () => {
      const response = await makeRequest("get", "/api/v1/users").set("api_key", "");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should update user when found", async () => {
      const [userId] = await db("users").insert({
        email: "test@test.com",
        password: "password",
        first_name: "Test",
        last_name: "User",
        uuid: uuidv4(),
      });

      const updateData = {
        first_name: "Updated",
        last_name: "Name",
        email: "updated@test.com"
      };

      const response = await makeRequest("put", `/api/v1/users/${userId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toContain("updated successfully");

      // Verify user is actually updated
      const updatedUser = await db("users").where("id", userId).first();
      expect(updatedUser.first_name).toBe(updateData.first_name);
      expect(updatedUser.last_name).toBe(updateData.last_name);
      expect(updatedUser.email).toBe(updateData.email);
    });

    it("should return 404 when user not found", async () => {
      const updateData = {
        first_name: "Updated",
        last_name: "Name",
        email: "updated@test.com"
      };

      const response = await makeRequest("put", "/api/v1/users/999")
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body.error.message).toContain("not found");
    });

    it("should validate required fields", async () => {
      const [userId] = await db("users").insert({
        email: "test@test.com",
        password: "password",
        first_name: "Test",
        last_name: "User",
        uuid: uuidv4(),
      });

      const response = await makeRequest("put", `/api/v1/users/${userId}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body.error.message).toBe("At least one field must be provided for update");
    });
  });

  describe("GET /api/v1/users/:id/purchases", () => {
    it("should return 401 when no API key is provided", async () => {
      const response = await makeRequest("get", "/api/v1/users/1/purchases").set("api_key", "");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should return purchases for a valid user ID", async () => {
      const [userId] = await db("users").insert({
        email: "test@test.com",
        password: "password",
        first_name: "Test",
        last_name: "User",
        uuid: uuidv4(),
      });

      await db("purchases").insert({
        user_id: userId,
        amount_total: 100.00,
        currency: "USD",
        payment_method: "credit_card",
        payment_status: 1,
      });

      const response = await makeRequest("get", `/api/v1/users/${userId}/purchases`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("purchases");
      expect(response.body.data.purchases.length).toBeGreaterThan(0);
    });

    it("should return 404 when user has no purchases", async () => {
      const [userId] = await db("users").insert({
        email: "test@test.com",
        password: "password",
        first_name: "Test",
        last_name: "User",
        uuid: uuidv4(),
      });

      // Ensure no purchases are inserted for this user
      const response = await makeRequest("get", `/api/v1/users/${userId}/purchases`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body.error.message).toContain("No purchases found for user ID: " + userId);
    });

    it("should return 404 when user not found", async () => {
      const response = await makeRequest("get", "/api/v1/users/999/purchases");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body.error.message).toContain("User not found by id: 999");
    });

    it("should return paginated purchases for a valid user ID", async () => {
      const [userId] = await db("users").insert({
        email: "test@test.com",
        password: "password",
        first_name: "Test",
        last_name: "User",
        uuid: uuidv4(),
      });

      // Insert multiple purchases for the user
      await db("purchases").insert([
        { user_id: userId, amount_total: 100.00, currency: "USD", payment_method: "credit_card", payment_status: 1 },
        { user_id: userId, amount_total: 200.00, currency: "USD", payment_method: "credit_card", payment_status: 1 },
        { user_id: userId, amount_total: 300.00, currency: "USD", payment_method: "credit_card", payment_status: 1 },
      ]);

      // Fetch the first page of purchases
      const responseFirstPage = await makeRequest("get", `/api/v1/users/${userId}/purchases?limit=2`);

      expect(responseFirstPage.status).toBe(200);
      expect(responseFirstPage.body).toHaveProperty("success", true);
      expect(responseFirstPage.body.data).toHaveProperty("purchases");
      expect(responseFirstPage.body.data.purchases.length).toBe(2);

      console.log({responseFirstPage: responseFirstPage.body.data})

      // Fetch the next page of purchases using the cursor
      const nextCursor = responseFirstPage.body.data.nextCursor;
      const responseSecondPage = await makeRequest("get", `/api/v1/users/${userId}/purchases?limit=2&cursor=${nextCursor}`);

      console.log({responseSecondPage: responseSecondPage.body.data})

      expect(responseSecondPage.status).toBe(200);
      expect(responseSecondPage.body).toHaveProperty("success", true);
      expect(responseSecondPage.body.data).toHaveProperty("purchases");
      expect(responseSecondPage.body.data.purchases.length).toBe(1);

      // Ensure no more purchases are returned
      const responseNoMorePurchases = await makeRequest("get", `/api/v1/users/${userId}/purchases?limit=2&cursor=${nextCursor + 1}`);
      expect(responseNoMorePurchases.status).toBe(404);
      expect(responseNoMorePurchases.body).toHaveProperty("success", false);
      expect(responseNoMorePurchases.body.error.message).toContain("No purchases found for user ID: " + userId);
    });
  });
});
