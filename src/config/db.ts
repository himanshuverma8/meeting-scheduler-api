import * as schema from '../db/schema.js';
import { env } from './env.js';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const pool = new Pool({ connectionString: env.DATABASE_URL });
pool.on('error', (err) => console.error('DB pool error:', err.message));
export const db = drizzle(pool, { schema });