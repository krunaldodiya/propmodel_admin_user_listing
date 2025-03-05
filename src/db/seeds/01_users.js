import { faker } from '@faker-js/faker';
import roles from '../../utils/roles.js';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("users").del();

  // Create regular users
  const regularUsers = Array.from({ length: 5 }).map(() => ({
    uuid: faker.string.uuid(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    role_id: roles.USER,
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
  }));

  // Create admin users with different admin roles
  const adminRoles = [roles.ADMIN, roles.MASTER_ADMIN, roles.SUBADMIN, roles.CUSTOMER_SUPPORT];
  const adminUsers = adminRoles.map(roleId => ({
    uuid: faker.string.uuid(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    role_id: roleId,
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
  }));

  // Insert all users
  await knex("users").insert([...regularUsers, ...adminUsers]);
}

export async function down(knex) {
  await knex("users").del();
}
