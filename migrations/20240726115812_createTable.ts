import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("work_order", (table) => {
    table.increments("id").primary();
    table.string("work_order_id");
    table.string("work_order_number");
    table.string("status");
    table.string("sn");
    table.string("product_series");
    table.string("model_name");
    table.string("internal_name");
    table.string("order_created_date");
    table.string("tat");
    table.string("wip_status");
    table.string("comment");
    table.string("customer_name");
  });

  await knex.schema.createTable("spare_part", (table) => {
    table.increments("id").primary();
    table.string("work_order_id");
    table.string("spart_part");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("spare_part");
  await knex.schema.dropTableIfExists("word_order");
}
