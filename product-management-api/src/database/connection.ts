import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";

// Create database connection
const sqlite = new Database("./database.sqlite");

// Enable foreign keys
sqlite.pragma("foreign_keys = ON");

// Create drizzle instance
export const db = drizzle(sqlite, { schema });

// Close database connection
export const closeDatabase = () => {
	sqlite.close();
};
