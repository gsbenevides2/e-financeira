import process from "node:process";
import type { Config } from "drizzle-kit";

export default {
	schema: "./src/backend/db/schema.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL || "postgresql://localhost:5432/e_financeira",
	},
	verbose: true,
	strict: true,
} satisfies Config;
