import { faker } from '@faker-js/faker';
import roles from '../../utils/roles.js';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("users").del();

  // Create regular users with mixed status
  const regularUsers = Array.from({ length: 5 }).map(() => ({
    uuid: faker.string.uuid(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    role_id: roles.USER,
    status: faker.helpers.arrayElement([0, 1]), // randomly assign active/inactive status
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
  }));

  // Create admin users with different admin roles
  const adminRoles = [roles.ADMIN, roles.MASTER_ADMIN, roles.SUBADMIN, roles.CUSTOMER_SUPPORT];
  const adminUsers = adminRoles.map(roleId => {
    const isActive = faker.datatype.boolean(); // 50% chance of being active
    const recentLogin = isActive && faker.datatype.boolean(); // 50% chance of recent login for active users

    return {
      uuid: faker.string.uuid(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      role_id: roleId,
      status: isActive ? 1 : 0,
      last_login_at: recentLogin ? faker.date.recent({ days: 5 }) : null, // login within last 5 days
      created_at: faker.date.recent(),
      updated_at: faker.date.recent(),
    };
  });

  // Insert all users
  await knex("users").insert([...regularUsers, ...adminUsers]);
}

export async function down(knex) {
  await knex("users").del();
}
