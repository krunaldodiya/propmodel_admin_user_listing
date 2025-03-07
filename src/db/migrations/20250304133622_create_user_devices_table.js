/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("user_devices", function (table) {
    table.increments("id").primary();
    table.integer("user_id").notNullable();
    table.string("browser", 255).nullable();
    table.string("os", 255).nullable();
    table.string("device", 255).nullable();
    table.string("ip", 255).nullable();
    table.string("location_info", 255).notNullable();
    table.datetime("created_at").notNullable();

    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.index("user_id");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable("user_devices");
}
