import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Configuração da conexão com PostgreSQL
const connectionString =
	Bun.env.DATABASE_URL || "postgresql://localhost:5432/e_financeira";

// Cliente PostgreSQL
const client = postgres(connectionString);

// Instância do Drizzle
export const db = drizzle(client, { schema });

// Exportar o tipo do banco para uso em outros lugares
export type DbType = typeof db;
