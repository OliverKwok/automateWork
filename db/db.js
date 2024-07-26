const knex = require("knex");
const knexFile = require("../knexfile.ts");

const environment = process.env.NODE_ENV || "development";

module.exports = knex(knexFile[environment]);
