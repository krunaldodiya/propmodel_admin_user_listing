/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("permissions").del();

  // Insert seed entries
  await knex("permissions").insert([
    {
      name: "admin",
      description: "Administrator with full access",
    },
    {
      name: "user",
      description: "Regular user with limited access",
    },
    {
      name: "moderator",
      description: "Moderator with elevated access",
    },
  ]);
}
