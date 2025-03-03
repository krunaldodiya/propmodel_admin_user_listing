/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("users", function (table) {
    table.increments("id").primary();
    table.uuid("uuid");
    table.integer("ref_by_user_id").defaultTo(0);
    table.integer("ref_link_count").defaultTo(0);
    table.integer("role_id").defaultTo(null).index();
    table.string("email").unique().index();
    table.string("password");
    table.string("first_name").defaultTo(null);
    table.string("last_name").defaultTo(null);
    table.string("phone").defaultTo(null);
    table.integer("phone_verified").defaultTo(0);
    table.integer("sent_activation_mail_count").defaultTo(0);
    table.integer("status").defaultTo(0).index(); // 0: inactive, 1: active, 2: banned
    table.string("reset_pass_hash").defaultTo(null);
    table.string("address").defaultTo(null);
    table.string("country").defaultTo(null);
    table.string("state").defaultTo(null);
    table.string("zip").defaultTo(null);
    table.string("timezone").defaultTo(null);
    table.string("2fa_app_secret").defaultTo(null);
    table.integer("2fa_sms_enabled").defaultTo(0);
    table.string("identity_status").defaultTo(null);
    table.timestamp("identity_verified_at").defaultTo(null);
    table.integer("affiliate_terms").defaultTo(0);
    table.integer("dashboard_popup").defaultTo(0);
    table.integer("discord_connected").defaultTo(0);
    table.integer("used_free_count").defaultTo(0);
    table.integer("available_count").defaultTo(0);
    table.integer("trail_verification_status").defaultTo(0).index(); // 0: not verified, 1: verified, 2: rejected
    table.timestamp("last_login_at").defaultTo(null);
    table.timestamps(true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable("users");
}
