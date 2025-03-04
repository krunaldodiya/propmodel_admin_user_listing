/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('purchases', (table) => {
    table.increments('id').primary();
    table.integer('user_id').notNullable();
    table.decimal('amount_total', 8, 2).notNullable();
    table.string('currency', 10).notNullable().defaultTo('USD');
    table.string('payment_method');
    table.smallint('payment_status').notNullable().defaultTo(0);
    table.smallint('is_paid_aff_commission');
    table.text('user_data');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.decimal('original_amount', 8, 2);
    table.float('discount');
    table.string('discount_code', 100);
    table.integer('discount_id');
    table.boolean('already_paid').notNullable().defaultTo(false);
    table.text('payment_transaction_id');
    table.text('payment_response');
    table.integer('payment_attempt_count').defaultTo(0);

    // Indexes
    table.index('user_id');
    table.index('payment_status');

    // Foreign Keys
    table.foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('purchases');
}
