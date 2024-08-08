import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("substitution_spare_part").del();

  // Inserts seed entries
  await knex("substitution_spare_part").insert([
    { from: "0235ABSK", to: "0235AAMB" },
    { from: "0235AGJB", to: "0235AJLY" },
    { from: "2310AABP", to: "2310AACG" },
    { from: "0235AJXU", to: "0235AHFW" },
    { from: "0407AAAF", to: "04071773" },
  ]);
}
