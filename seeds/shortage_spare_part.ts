import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("shortage_spare_part").del();

  // Inserts seed entries
  await knex("shortage_spare_part").insert([
    { spart_part_id: "02212591", comment: "ETA8/16" },
    { spart_part_id: "03034GRE", comment: "ETA8/17" },
    { spart_part_id: "0303AFTC", comment: "ETA12/25" },
    {
      spart_part_id: "5109ADAA",
      comment: "no supply ,suggest apply different color item 5109ACYX",
    },
    { spart_part_id: "5109BECF", comment: "no supply" },
    { spart_part_id: "5109BGRK", comment: "pending" },
    {
      spart_part_id: "51680276",
      comment:
        "Controlled item,if have pending orders ,please confirm with HQ planner",
    },
    { spart_part_id: "5502AARL", comment: "ETA9/1" },
    { spart_part_id: "5503AAHN", comment: "no supply ,suggest apply 5503AAHJ" },
    {
      spart_part_id: "97071BYU",
      comment:
        "Controlled item,if have pending orders ,please confirm with HQ planner",
    },
    {
      spart_part_id: "97071BYY",
      comment:
        "Controlled item,if have pending orders ,please confirm with HQ planner",
    },
    {
      spart_part_id: "9707AAAF",
      comment:
        "Controlled item,if have pending orders ,please confirm with HQ planner",
    },
    {
      spart_part_id: "9707AAAP",
      comment:
        "Controlled item,if have pending orders ,please confirm with HQ planner",
    },
    {
      spart_part_id: "9707AAAQ",
      comment:
        "Controlled item,if have pending orders ,please confirm with HQ planner",
    },
    {
      spart_part_id: "5502ABBM",
      comment: "suggest apply item 5502ABBK to replace it.",
    },
    {
      spart_part_id: "5502ABDF",
      comment: "suggest apply item 5502ABBM > 5502ABBK to replace it.",
    },
    {
      spart_part_id: "5503AAJN",
      comment:
        "suggest apply item 5503AADG to replace it, ASC need to update the software version",
    },
  ]);
}
