import { env } from "@/env";
import * as schema from "@/db/schema";
import { PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Singleton cache for development to prevent connection exhaustion during hot reloads
let databaseSingleton: PostgresJsDatabase<typeof schema> | undefined;
let pgSingleton: ReturnType<typeof postgres> | undefined;

function initDatabase() {
  let database: PostgresJsDatabase<typeof schema>;
  let pg: ReturnType<typeof postgres>;

  // Production: always create a new connection
  if (env.NODE_ENV === "production") {
    // Disable prepared statements if using "Transaction" pool mode since it is not supported
    pg = postgres(env.DATABASE_URL, { prepare: false });
    database = drizzle(pg, { schema });
  } else {
    // Development: reuse singleton to avoid multiple connections
    if (!databaseSingleton || !pgSingleton) {
      // Disable prepared statements if using "Transaction" pool mode since it is not supported
      pgSingleton = postgres(env.DATABASE_URL, { prepare: false });
      databaseSingleton = drizzle(pgSingleton, { schema });
    }
    pg = pgSingleton;
    database = databaseSingleton;
  }

  return { database, pg };
}

export const { database, pg } = initDatabase();
