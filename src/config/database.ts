import knex, { Knex } from "knex";
import { config } from "./env";

const knexConfig: Knex.Config = {
  client: "pg",
  connection: config.DATABASE_URL,
  pool: { min: 2, max: 10 },
  migrations: {
    directory: "./src/db/migrations",
    extension: "ts",
  },
  seeds: {
    directory: "./src/db/seeds",
    extension: "ts",
  },
};

const db: Knex = knex(knexConfig);

export default db;
