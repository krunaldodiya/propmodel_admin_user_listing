// ================================================================================
// Database configuration using Knex.js
// @module dbKnex
// @version 1.0.0
// @description This module provides database connection and configuration using Knex.js
// It supports multiple environments (development, production, test) and includes
// connection testing functionality.
//new URL("./src/db/seeds", import.meta.url).pathname
// ================================================================================

import knex from "knex";
import path from "path";
import fs from "fs/promises";
import knexConfig from "./knexfile.js";

const environment = process.env.NODE_ENV || "development";
const config = knexConfig[environment];

if (!config) {
  throw new Error(`Invalid environment: ${environment}`);
}

const knexInstance = knex(config);
  
// Test database connection
knexInstance.raw('SELECT 1')
  .then(() => {
    console.log('Database connection established successfully');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
    // Do not exit the process here; allow the application to handle the error gracefully
  });

// Database utility functions
// This object contains methods for managing database migrations and seeds
// - createMigration: Creates a new migration file with basic schema
// - runMigrations: Executes pending migrations
// - rollbackMigrations: Reverts the last batch of migrations
// - rollbackSpecificMigration: Reverts a specific migration by name
// - runSeeders: Runs all seed files to populate the database
//- runSpecificSeeder: Runs a specific seed file by name
const dbUtils = {
  async createMigration(migrationName) {
    if (!migrationName) {
      throw new Error("Migration name is required");
    }

    const match = migrationName.match(/^create_(\w+)_table$/);
    const tableName = match ? match[1] : migrationName;
    const migrationsDir = path.resolve("src/db/migrations");

    try {
      const filePath = await knexInstance.migrate.make(migrationName, { directory: migrationsDir });
      const defaultSchema = `
        export async function up(knex) {
          await knex.schema.createTable("${tableName}", (table) => {
            table.increments("id").primary();
            table.timestamps(true, true);
          });
        }

        export async function down(knex) {
          await knex.schema.dropTable("${tableName}");
        }
      `;

      await fs.writeFile(filePath, defaultSchema, "utf-8");
      console.log(`✓ Migration created: ${path.basename(filePath)}`);
      return filePath;
    } catch (error) {
      console.error('✗ Migration creation failed:', error.message);
      throw error;
    }
  },

  async runMigrations() {
    try {
      const result = await knexInstance.migrate.latest({
        directory: './src/db/migrations'
      });
      const [batchNo, log] = result;
      console.log(`✓ Ran ${log.length} migrations in batch #${batchNo}`);
      return result;
    } catch (error) {
      console.error('✗ Migration failed:', error.message);
      throw error;
    }
    // Do not exit the process here
  },

  async rollbackMigrations() {
    try {
      const result = await knexInstance.migrate.rollback({
        directory: './src/db/migrations'
      });
      const [batchNo, log] = result;
      console.log(`✓ Rolled back ${log.length} migrations from batch #${batchNo}`);
      return result;
    } catch (error) {
      console.error('✗ Rollback failed:', error.message);
      throw error;
    }
  },

  async rollbackSpecificMigration(migrationName) {
    if (!migrationName) {
      throw new Error("Migration name is required");
    }
    try {
      const migration = await knexInstance('knex_migrations')
        .select('batch')
        .where('name', migrationName)
        .first();

      if (!migration) {
        throw new Error(`Migration '${migrationName}' not found`);
      }

      const result = await knexInstance.migrate.rollback({
        directory: './src/db/migrations',
        batch: migration.batch
      });
      const [batchNo, log] = result;
      console.log(`✓ Rolled back migration '${migrationName}' from batch #${batchNo}`);
      return result;
    } catch (error) {
      console.error('✗ Specific rollback failed:', error.message);
      throw error;
    }
  },

  async runSeeders() {
    try {
      const result = await knexInstance.seed.run({
        directory: "./src/db/seeds"
      });
      console.log(`✓ Ran ${result.length} seed files`);
    } catch (error) {
      console.error('✗ Seeding failed:', error.message);
      throw error;
    }
  },

  async runSpecificSeeder(seederName) {
    if (!seederName) {
      throw new Error("Seeder name is required");
    }

    try {
      const seedDir = path.resolve("src/db/seeds");
      const files = await fs.readdir(seedDir);
      const seederFile = files.find(file => file.includes(seederName));

      if (!seederFile) {
        throw new Error(`Seeder '${seederName}' not found`);
      }

      await knexInstance.seed.run({
        directory: "./src/db/seeds",
        specific: seederFile
      });
      console.log(`✓ Successfully ran seeder: ${seederName}`);
    } catch (error) {
      console.error('✗ Specific seeder failed:', error.message);
      throw error;
    }
  }
};

export { dbUtils };
export default knexInstance;