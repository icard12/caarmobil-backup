import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const projectRoot = process.cwd();

// Load .env explicitly if it exists (Ensures local dev works even if NODE_ENV is odd)
const envPath = path.join(projectRoot, '.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

let databaseUrl = process.env.DATABASE_URL;

// 1. Search for ANY environment variable that looks like a Postgres URL
// (Railway provides DATABASE_URL automatically when a Postgres plugin is added)
if (!databaseUrl) {
    const pgVars = ['DATABASE_URL', 'POSTGRES_URL', 'DATABASE_PUBLIC_URL', 'PGURL'];
    for (const key of pgVars) {
        if (process.env[key] && (process.env[key]?.startsWith('postgres://') || process.env[key]?.startsWith('postgresql://'))) {
            console.log(`[DB-Config] Discovered database URL in: ${key}`);
            databaseUrl = process.env[key];
            break;
        }
    }
}

// 2. Reconstruct URL from parts if still missing
if (!databaseUrl && process.env.PGHOST) {
    databaseUrl = `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE}`;
}

// 3. CRITICAL: Fix Protocol for Prisma
if (databaseUrl && (process.env.RAILWAY_ENVIRONMENT || process.env.RENDER || process.env.NODE_ENV === 'production')) {
    if (!databaseUrl.startsWith('postgres://') && !databaseUrl.startsWith('postgresql://')) {
        databaseUrl = 'postgresql://' + databaseUrl;
    }
}

// 4. Force SSL for Production (Required by most cloud DBs like Railway/Supabase)
if (databaseUrl && (process.env.RAILWAY_ENVIRONMENT || process.env.RENDER || process.env.NODE_ENV === 'production')) {
    if (!databaseUrl.includes('sslmode=')) {
        databaseUrl += databaseUrl.includes('?') ? '&sslmode=no-verify' : '?sslmode=no-verify';
    }

    // SECURITY: Prevent connecting to localhost in production/Railway
    if (databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')) {
        console.error('❌ [DB-Config] ERROR: Detected localhost URL in production environment!');
        // We will NOT overwrite it here to allow local production testing IF explicitly intended,
        // but Railway should never provide localhost.
    }
}

// 5. Fallback for Production
if (!databaseUrl && (process.env.RAILWAY_ENVIRONMENT || process.env.RENDER || process.env.NODE_ENV === 'production')) {
    console.error('❌ [DB-Config] CRITICAL: No DATABASE_URL found!');
}

// 6. Update global env for Prisma Client
if (databaseUrl) {
    process.env.DATABASE_URL = databaseUrl;
    const masked = databaseUrl.replace(/:([^:@]+)@/, ':****@');
    console.log(`[DB-Config] Active URL: ${masked}`);
} else {
    console.warn('[DB-Config] No DATABASE_URL found, falling back to local SQLite.');
}

export const prisma = new PrismaClient({
    datasources: {
        db: {
            // Check if we have a valid URL logic, otherwise default to sqlite local
            url: databaseUrl || "file:./dev.db"
        }
    }
});
