import supertest from "supertest";
import app from "src/app.js";
import knex from "knex";
import knexConfig from "src/config/knexConfig.js";
import i18next from "i18next";
import { v4 as uuidv4 } from "uuid";

// Create test database instance
const testDb = knex(knexConfig.test);
// Replace app's db with test db
app.locals.db = testDb;

const request = supertest(app);
const db = app.locals.db;

const validApiKey = process.env.API_KEY;

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
  await db("user_devices").del();
  await db("users").del();
});

describe("User Devices API Endpoints", () => {
  describe("GET /api/v1/users/:userId/devices", () => {
    it("should return 401 when no API key is provided", async () => {
      const response = await makeRequest("get", "/api/v1/users/1/devices").set(
        "api_key",
        ""
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should return 404 when user not found", async () => {
      const response = await makeRequest("get", "/api/v1/users/999/devices");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body.error.message).toContain("User not found");
    });

    it("should return empty list when user has no devices", async () => {
      const [userId] = await db("users").insert({
        email: "test@test.com",
        password: "password",
        first_name: "Test",
        last_name: "User",
        uuid: uuidv4(),
      });

      const response = await makeRequest(
        "get",
        `/api/v1/users/${userId}/devices`
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("devices");
      expect(response.body.data.devices).toHaveLength(0);
    });

    it("should return list of user devices", async () => {
      const [userId] = await db("users").insert({
        email: "test@test.com",
        password: "password",
        first_name: "Test",
        last_name: "User",
        uuid: uuidv4(),
      });

      const testDevice = {
        user_id: userId,
        browser: "Chrome",
        os: "Windows",
        device: "Desktop",
        ip: "127.0.0.1",
        location_info: "Test Location",
        created_at: new Date(),
      };

      await db("user_devices").insert(testDevice);

      const response = await makeRequest(
        "get",
        `/api/v1/users/${userId}/devices`
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("devices");
      expect(response.body.data.devices).toHaveLength(1);
      expect(response.body.data.devices[0]).toMatchObject({
        browser: testDevice.browser,
        os: testDevice.os,
        device: testDevice.device,
        ip: testDevice.ip,
        location_info: testDevice.location_info,
      });
    });
  });
});
