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
    await db("users").del();
});

describe("Admin API Endpoints", () => {
    describe("GET /api/v1/admins", () => {
        it("should return 401 when no API key is provided", async () => {
            const response = await makeRequest("get", "/api/v1/admins").set("api_key", "");

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("success", false);
        });

        it("should show empty list of admins", async () => {
            const response = await makeRequest("get", "/api/v1/admins");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("data");
            expect(response.body.data.users.length).toBe(0);
        });

        it("should show list of admins", async () => {
            // Insert admin users with different role IDs
            await db("users").insert([
                {
                    role_id: 1, // ADMIN
                    email: "admin@test.com",
                    password: "password",
                    first_name: "Admin",
                    last_name: "User",
                    uuid: uuidv4(),
                },
                {
                    role_id: 3, // MASTER_ADMIN
                    email: "master@test.com",
                    password: "password",
                    first_name: "Master",
                    last_name: "Admin",
                    uuid: uuidv4(),
                }
            ]);

            const response = await makeRequest("get", "/api/v1/admins");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("data");
            expect(response.body.data.users.length).toBe(2);
        });

        it("should return paginated admins", async () => {
            // Insert multiple admin users
            const adminUsers = Array.from({ length: 3 }).map((_, index) => ({
                role_id: 1, // ADMIN
                email: `admin${index}@test.com`,
                password: "password",
                first_name: `Admin${index}`,
                last_name: "User",
                uuid: uuidv4(),
            }));

            await db("users").insert(adminUsers);

            // Test first page with limit
            const responseFirstPage = await makeRequest("get", "/api/v1/admins?limit=2");

            expect(responseFirstPage.status).toBe(200);
            expect(responseFirstPage.body).toHaveProperty("success", true);
            expect(responseFirstPage.body.data.users.length).toBe(2);
            expect(responseFirstPage.body.data.pagination.hasMore).toBe(true);
            expect(responseFirstPage.body.data.pagination.nextCursor).toBeDefined();

            // Test second page using cursor
            const nextCursor = responseFirstPage.body.data.pagination.nextCursor;
            const responseSecondPage = await makeRequest("get", `/api/v1/admins?limit=2&cursor=${nextCursor}`);

            expect(responseSecondPage.status).toBe(200);
            expect(responseSecondPage.body).toHaveProperty("success", true);
            expect(responseSecondPage.body.data.users.length).toBe(1);
            expect(responseSecondPage.body.data.pagination.hasMore).toBe(false);
        });
    });
});