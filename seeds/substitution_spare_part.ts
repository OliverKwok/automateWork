import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("substitution_spare_part").del();

  // Inserts seed entries
  await knex("substitution_spare_part").insert([
    { from: "5163AECM", to: "9908151659" },
    { from: "0235ABSK", to: "0235AAMB" },
    { from: "0235AGJB", to: "0235AJLY" },
    { from: "0235AGJB", to: "0235AJMA" },
    { from: "2310AABP", to: "2310AACG" },
    { from: "0235AJXU", to: "0235AHFW" },
    { from: "0407AAAF", to: "04071773" },
    { from: "0303AAAK", to: "0303AAAP" },
    { from: "03034DMH", to: "03034GRE" },
    { from: "0235ALQY", to: "0235AJMA" },
    { from: "0235ALQY", to: "0235AGJB" },
    { from: "0235ALQY", to: "0235AJLY" },
    { from: "0235ALUC", to: "0235AHDQ" },
    { from: "0235ALQM", to: "0235AKUT" },
    { from: "0235ALQL", to: "0235AKUR" },
    { from: "2306AAAU", to: "2306AACB" },
    { from: "0235ALQQ", to: "0235ALGJ" },
    { from: "0235ALQD", to: "0235AJLM" },
    { from: "0235AHGD", to: "0235ALPR" },
    { from: "0235AHGE", to: "0235ALPS" },
    { from: "0235AHGF", to: "0235ALPT" },
    { from: "0235AHGJ", to: "0235ALPU" },
    { from: "0235AFDG", to: "0235ALQB" },
    { from: "0235AFDK", to: "0235ALQC" },
    { from: "0235AJLM", to: "0235ALQD" },
    { from: "0235AKUR", to: "0235ALQL" },
    { from: "0235AKUT", to: "0235ALQM" },
    { from: "0235ALGJ", to: "0235ALQQ" },
    { from: "0235AGJB", to: "0235ALQY" },
    { from: "0235AJLN", to: "0235ALRA" },
    { from: "0235AKHM", to: "0235ALRD" },
    { from: "0235AKHN", to: "0235ALRE" },
    { from: "0235AKHP", to: "0235ALRF" },
    { from: "0235AKHW", to: "0235ALRH" },
    { from: "0235AKHV", to: "0235ALRJ" },
    { from: "0235AKHX", to: "0235ALRK" },
    { from: "0235AGLR", to: "0235ALRW" },
    { from: "0235AHDQ", to: "0235ALUC" },
    { from: "0235AKES", to: "0235AMFG" },
    { from: "5168ABNJ", to: "5168ABLB" },
  ]);
}
