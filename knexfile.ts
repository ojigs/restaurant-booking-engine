import type { Knex } from "knex";
import { config } from "./src/config/env";

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: config.DATABASE_URL,
    migrations: {
      directory: "./src/database/migrations",
    },
    seeds: {
      directory: "./src/database/seeds",
    },
  },
};

export default knexConfig;
