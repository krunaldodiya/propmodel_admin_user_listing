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
  await db("role_permissions").del();
  await db("permissions").del();
  await db("roles").del();
});

describe("Role Permissions API Endpoints", () => {
  describe("POST /api/v1/roles/:roleId/permissions", () => {
    it("should return 404 when role does not exist", async () => {
      const response = await makeRequest(
        "post",
        "/api/v1/roles/999/permissions"
      ).send({
        permissionIds: [1, 2, 3],
      });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("message");
      expect(response.body.error.message).toBe("Role not found");
    });

    it("should return 400 when permission IDs are not provided", async () => {
      // Create a test role first
      const role = await db("roles")
        .insert({
          name: "test_role",
          description: "Test Role",
        })
        .returning("*");

      const response = await makeRequest(
        "post",
        `/api/v1/roles/${role[0].id}/permissions`
      ).send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("message");
      expect(response.body.error.message).toMatch(/permissionIds.*required/i);
    });

    it("should return 404 when any permission ID does not exist", async () => {
      // Create a test role
      const role = await db("roles")
        .insert({
          name: "test_role",
          description: "Test Role",
        })
        .returning("*");

      // Create some permissions
      const permissions = await db("permissions")
        .insert([
          { name: "create_user", description: "Can create users" },
          { name: "edit_user", description: "Can edit users" },
        ])
        .returning("*");

      const response = await makeRequest(
        "post",
        `/api/v1/roles/${role[0].id}/permissions`
      ).send({
        permissionIds: [permissions[0].id, permissions[1].id, 999],
      });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("message");
      expect(response.body.error.message).toBe(
        "One or more permissions not found"
      );
    });

    it("should successfully attach permissions to role", async () => {
      // Create a test role
      const role = await db("roles")
        .insert({
          name: "test_role",
          description: "Test Role",
        })
        .returning("*");

      // Create some permissions
      const permissions = await db("permissions")
        .insert([
          { name: "create_user", description: "Can create users" },
          { name: "edit_user", description: "Can edit users" },
          { name: "delete_user", description: "Can delete users" },
        ])
        .returning("*");

      const permissionIds = permissions.map((p) => p.id);

      const response = await makeRequest(
        "post",
        `/api/v1/roles/${role[0].id}/permissions`
      ).send({
        permissionIds,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(permissionIds.length);

      // Verify permissions were actually attached in database
      const attachedPermissions = await db("role_permissions").where({
        role_id: role[0].id,
      });

      expect(attachedPermissions).toHaveLength(permissionIds.length);
      expect(attachedPermissions.map((p) => p.permission_id).sort()).toEqual(
        permissionIds.sort()
      );
    });

    it("should replace existing permissions with new ones", async () => {
      // Create a test role
      const role = await db("roles")
        .insert({
          name: "test_role",
          description: "Test Role",
        })
        .returning("*");

      // Create some permissions
      const permissions = await db("permissions")
        .insert([
          { name: "create_user", description: "Can create users" },
          { name: "edit_user", description: "Can edit users" },
          { name: "delete_user", description: "Can delete users" },
          { name: "view_user", description: "Can view users" },
        ])
        .returning("*");

      // Initially attach first two permissions
      await db("role_permissions").insert([
        { role_id: role[0].id, permission_id: permissions[0].id },
        { role_id: role[0].id, permission_id: permissions[1].id },
      ]);

      // Now update with last two permissions
      const newPermissionIds = [permissions[2].id, permissions[3].id];

      const response = await makeRequest(
        "post",
        `/api/v1/roles/${role[0].id}/permissions`
      ).send({
        permissionIds: newPermissionIds,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(newPermissionIds.length);

      // Verify only new permissions are attached in database
      const attachedPermissions = await db("role_permissions").where({
        role_id: role[0].id,
      });

      expect(attachedPermissions).toHaveLength(newPermissionIds.length);
      expect(attachedPermissions.map((p) => p.permission_id).sort()).toEqual(
        newPermissionIds.sort()
      );
    });
  });
});
