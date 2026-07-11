import { config } from "dotenv";

config();

export const databaseConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "123456",
  database: process.env.DB_NAME || "ecopost",
  ssl: process.env.DB_SSL === "true",
  dialect: "postgres" as const,
};

export default databaseConfig;
