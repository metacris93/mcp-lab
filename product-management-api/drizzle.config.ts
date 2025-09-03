import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: './src/database/schema.ts',
  out: './src/database/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './database.sqlite'
  },
  verbose: true,
  strict: true,
});