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
  await new Promise((resolve) => setTimeout(resolve, 500)); // Allow connections to close gracefully
});

// Clean up tables before each test
beforeEach(async () => {
  await db("permissions").del();
});

describe("Permission API Endpoints", () => {
  describe("GET /api/v1/permissions", () => {
    it("should return empty array when no permissions exist", async () => {
      const response = await makeRequest("get", "/api/v1/permissions");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should return all permissions when permissions exist", async () => {
      // Create test permissions
      const testPermissions = [
        {
          name: "admin permission",
          description: "Administrator level permissions",
        },
        {
          name: "user permission",
          description: "Regular User level permissions",
        },
      ];

      await db("permissions").insert(testPermissions);

      const response = await makeRequest("get", "/api/v1/permissions");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("POST /api/v1/permissions", () => {
    it("should return 400 when no payload is provided", async () => {
      const response = await makeRequest("post", "/api/v1/permissions").send(
        {}
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("message");
      expect(response.body.error.message).toMatch(/required/i);
    }, 10000);

    it("should return 409 when permission with same name already exists", async () => {
      const permissionData = {
        name: "test_permission",
        description: "Test Permission",
      };

      // First create a permission
      await makeRequest("post", "/api/v1/permissions").send(permissionData);

      // Try to create another permission with the same name
      const response = await makeRequest("post", "/api/v1/permissions").send(
        permissionData
      );

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("message");
      expect(response.body.error.message).toBe("Permission already exists");
    }, 10000);

    it("should successfully create a new permission with valid data", async () => {
      const permissionData = {
        name: "new_permission",
        description: "New Test Permission",
      };

      const response = await makeRequest("post", "/api/v1/permissions").send(
        permissionData
      );

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toMatchObject({
        name: permissionData.name,
        description: permissionData.description,
      });

      // Verify permission was actually created in database
      const createdRole = await db("permissions")
        .where({ name: permissionData.name })
        .first();

      expect(createdRole).toBeTruthy();
      expect(createdRole.name).toBe(permissionData.name);
      expect(createdRole.description).toBe(permissionData.description);
    }, 10000);
  });

  describe("PUT /api/v1/permissions/:id", () => {
    it("should return 404 when permission does not exist", async () => {
      const response = await makeRequest("put", "/api/v1/permissions/999").send(
        {
          description: "updated permissions",
        }
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("message");
      expect(response.body.error.message).toBe("Permission not found");
    });

    it("should return 400 when permission ID is invalid", async () => {
      const response = await makeRequest(
        "put",
        "/api/v1/permissions/invalid"
      ).send({
        description: "updated permissions",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("message");
      expect(response.body.error.message).toMatch(/must be a number/i);
    });

    it("should return 400 when no update data is provided", async () => {
      // Create a test permission first
      const permissionData = {
        name: "test_permission",
        description: "Test Permission",
      };

      const createResponse = await makeRequest(
        "post",
        "/api/v1/permissions"
      ).send(permissionData);
      const permissionId = createResponse.body.data.id;

      // Try to update without providing any data
      const response = await makeRequest(
        "put",
        `/api/v1/permissions/${permissionId}`
      ).send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("message");
      expect(response.body.error.message).toMatch(/at least/i);
    });

    it("should successfully update a permission with valid data", async () => {
      // Create a test permission
      const permissionData = {
        name: "test_permission",
        description: "Test Permission",
      };

      const createResponse = await makeRequest(
        "post",
        "/api/v1/permissions"
      ).send(permissionData);

      const permissionId = createResponse.body.data.id;

      // Update the permission
      const updateData = {
        name: "updated_permission",
        description: "Updated Description",
      };

      const response = await makeRequest(
        "put",
        `/api/v1/permissions/${permissionId}`
      ).send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data.id).toBe(permissionId);
    });
  });

  describe("DELETE /api/v1/permissions/:id", () => {
    it("should return 404 when permission does not exist", async () => {
      const response = await makeRequest("delete", "/api/v1/permissions/999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("message");
      expect(response.body.error.message).toBe("Permission not found");
    });

    it("should return 400 when permission ID is invalid", async () => {
      const response = await makeRequest(
        "delete",
        "/api/v1/permissions/invalid"
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("message");
      expect(response.body.error.message).toMatch(/must be a number/i);
    });

    it("should delete a permission", async () => {
      // Create a test permission
      const permissionData = {
        name: "test_permission",
        description: "Test Permission",
      };

      const createResponse = await makeRequest(
        "post",
        "/api/v1/permissions"
      ).send(permissionData);

      const permissionId = createResponse.body.data.id;

      // Delete the permission
      const deleteResponse = await makeRequest(
        "delete",
        `/api/v1/permissions/${permissionId}`
      );

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toHaveProperty("success", true);
    });
  });
});
