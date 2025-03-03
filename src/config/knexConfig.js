import './env.js';
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "../..");

const defaultConfig = {
  migrations: {
    directory: join(rootDir, "src/db/migrations"),
  },
  seeds: {
    directory: join(rootDir, "src/db/seeds"),
  },
};

const pgConfig = {
  ...defaultConfig,
  client: "pg",
  pool: {
    min: 2,
    max: 10,
  },
  acquireConnectionTimeout: 10000,
};

export default {
  test: {
    ...defaultConfig,
    client: "sqlite3",
    connection: {
      filename: ":memory:",
    },
    useNullAsDefault: true,
    debug: false,
  },
  development: {
    ...pgConfig,
    connection: {
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    },
    debug: false,
    asyncStackTraces: false,
  },
  staging: {
    ...pgConfig,
    connection: {
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    },
    pool: {
      min: 1,
      max: 5,
    },
    debug: true,
    asyncStackTraces: true,
  },
  production: {
    ...pgConfig,
    connection: {
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    },
    pool: {
      min: 2,
      max: 10,
    },
    debug: false,
    asyncStackTraces: false,
    acquireConnectionTimeout: 60000,
  },
};
