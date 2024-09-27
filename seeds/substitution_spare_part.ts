import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("substitution_spare_part").del();

  // Inserts seed entries
  await knex("substitution_spare_part").insert([
    { from: "0235ABSK", to: ["0235AAMB"] },
    { from: "0235AGJB", to: ["0235AJLY", "0235AJMA"] },
    { from: "2310AABP", to: ["2310AACG"] },
    { from: "0235AJXU", to: ["0235AHFW"] },
    { from: "0407AAAF", to: ["04071773"] },
    { from: "0303AAAK", to: ["0303AAAP"] },
    { from: "03034DMH", to: ["03034GRE"] },
    { from: "0235ALQY", to: ["0235AJMA", "0235AGJB"] },
    { from: "0235ALUC", to: ["0235AHDQ"] },
    { from: "0235ALQM", to: ["0235AKUT"] },
    { from: "0235ALQL", to: ["0235AKUR"] },
    { from: "5163AECM", to: ["9908151659"] },
    { from: "2306AAAU", to: ["2306AACB"] },
    { from: "0235ALQQ", to: ["0235ALGJ"] },
  ]);
}
