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
  await db("roles").del();
});

describe("Role API Endpoints", () => {
  describe("GET /api/v1/roles", () => {
    it("should return empty array when no roles exist", async () => {
      const response = await makeRequest("get", "/api/v1/roles");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should return all roles when roles exist", async () => {
      // Create test roles
      const testRoles = [
        { name: "admin", description: "Administrator" },
        { name: "user", description: "Regular User" },
      ];

      await db("roles").insert(testRoles);

      const response = await makeRequest("get", "/api/v1/roles");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("POST /api/v1/roles", () => {
    it("should return 400 when no payload is provided", async () => {
      const response = await makeRequest("post", "/api/v1/roles").send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("message");
      expect(response.body.error.message).toMatch(/required/i);
    }, 10000);

    it("should return 409 when role with same name already exists", async () => {
      const roleData = {
        name: "test_role",
        description: "Test Role",
      };

      // First create a role
      await makeRequest("post", "/api/v1/roles").send(roleData);

      // Try to create another role with the same name
      const response = await makeRequest("post", "/api/v1/roles").send(
        roleData
      );

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("message");
      expect(response.body.error.message).toBe("Role already exists");
    }, 10000);

    it("should successfully create a new role with valid data", async () => {
      const roleData = {
        name: "new_role",
        description: "New Test Role",
      };

      const response = await makeRequest("post", "/api/v1/roles").send(
        roleData
      );

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toMatchObject({
        name: roleData.name,
        description: roleData.description,
      });

      // Verify role was actually created in database
      const createdRole = await db("roles")
        .where({ name: roleData.name })
        .first();

      expect(createdRole).toBeTruthy();
      expect(createdRole.name).toBe(roleData.name);
      expect(createdRole.description).toBe(roleData.description);
    }, 10000);
  });

  describe("PUT /api/v1/roles/:id", () => {
    it("should return 404 when role does not exist", async () => {
      const response = await makeRequest("put", "/api/v1/roles/999").send({
        description: "updated description",
      });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("message");
      expect(response.body.error.message).toBe("Role not found");
    });

    it("should return 400 when role ID is invalid", async () => {
      const response = await makeRequest("put", "/api/v1/roles/invalid").send({
        description: "updated description",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("message");
      expect(response.body.error.message).toMatch(/must be a number/i);
    });

    it("should return 400 when no update data is provided", async () => {
      // Create a test role first
      const roleData = {
        name: "test_role",
        description: "Test Role",
      };

      const createResponse = await makeRequest("post", "/api/v1/roles").send(
        roleData
      );
      const roleId = createResponse.body.data.id;

      // Try to update without providing any data
      const response = await makeRequest("put", `/api/v1/roles/${roleId}`).send(
        {}
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("message");
      expect(response.body.error.message).toMatch(/at least/i);
    });

    it("should successfully update a role with valid data", async () => {
      // Create a test role
      const roleData = {
        name: "test_role",
        description: "Test Role",
      };

      const createResponse = await makeRequest("post", "/api/v1/roles").send(
        roleData
      );

      const roleId = createResponse.body.data.id;

      // Update the role
      const updateData = {
        name: "updated_role",
        description: "Updated Description",
      };

      const response = await makeRequest("put", `/api/v1/roles/${roleId}`).send(
        updateData
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data.id).toBe(roleId);
    });
  });

  describe("DELETE /api/v1/roles/:id", () => {
    it("should return 404 when role does not exist", async () => {
      const response = await makeRequest("delete", "/api/v1/roles/999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("message");
      expect(response.body.error.message).toBe("Role not found");
    });

    it("should return 400 when role ID is invalid", async () => {
      const response = await makeRequest("delete", "/api/v1/roles/invalid");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("message");
      expect(response.body.error.message).toMatch(/must be a number/i);
    });

    it("should delete a role", async () => {
      // Create a test role
      const roleData = {
        name: "test_role",
        description: "Test Role",
      };

      const createResponse = await makeRequest("post", "/api/v1/roles").send(
        roleData
      );

      const roleId = createResponse.body.data.id;

      // Delete the role
      const deleteResponse = await makeRequest(
        "delete",
        `/api/v1/roles/${roleId}`
      );

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toHaveProperty("success", true);
    });
  });
});
