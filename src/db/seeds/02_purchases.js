import { faker } from '@faker-js/faker';

export async function seed(knex) {
  await knex("purchases").del();

  const users = await knex("users").select("id");

  const purchases = Array.from({ length: 10 }).map(() => ({
    user_id: faker.helpers.arrayElement(users).id, // Select a random user ID from existing users
    amount_total: parseFloat(faker.commerce.price()),
    currency: "USD",
    payment_status: 1,
    created_at: new Date(),
  }));

  await knex("purchases").insert(purchases);
}

export async function down(knex) {
  await knex("purchases").del();
} 