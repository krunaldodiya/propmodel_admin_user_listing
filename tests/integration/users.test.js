import supertest from "supertest";
import app from "src/app.js";
import knex from "knex";
import knexConfig from "src/config/knexConfig.js";
import i18next from "i18next";

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
    it("should show list of users", async () => {
      const response = await makeRequest("get", "/api/v1/users");
      console.log(response.body);

      // expect(response.status).toBe(200);
      // expect(response.body).toHaveProperty("success", true);
      // expect(response.body).toHaveProperty("data");
      // expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
