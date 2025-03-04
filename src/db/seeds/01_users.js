import { faker } from '@faker-js/faker';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("users").del();

  const users = Array.from({ length: 10 }).map(() => ({
    uuid: faker.string.uuid(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
  }));

  await knex("users").insert(users);
}

export async function down(knex) {
  await knex("users").del();
}
