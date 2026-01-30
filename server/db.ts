import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const projectRoot = process.cwd();

// Load .env only for local development
if (!(process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production')) {
    const envPath = path.join(projectRoot, '.env');
    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
    }
}

let databaseUrl = process.env.DATABASE_URL;

// 1. Reconstruct URL if missing (Common in Railway/Render)
if (!databaseUrl && process.env.PGHOST) {
    databaseUrl = `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE}`;
}

// 2. CRITICAL: Fix Protocol for Prisma
// Prisma STRICTLY requires "postgresql://" or "postgres://". Some providers return "postgres://" which is fine, but others might leave it generic.
if (databaseUrl && (process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production')) {
    // If it starts with neither, assume it needs the prefix or fix it
    if (!databaseUrl.startsWith('postgres://') && !databaseUrl.startsWith('postgresql://')) {
        // Sometimes URL might come as "usuario:senha@host..." without protocol
        databaseUrl = 'postgresql://' + databaseUrl;
    }
}

// 3. Force SSL for Production (Ensures handshakes work)
if (databaseUrl && !databaseUrl.includes('sslmode=') && (process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production')) {
    databaseUrl += databaseUrl.includes('?') ? '&sslmode=no-verify' : '?sslmode=no-verify';
}

// 4. IMPORTANT: Update global env so background tasks (like db push) use the SAME fixed URL
if (databaseUrl) {
    process.env.DATABASE_URL = databaseUrl;
    console.log(`[DB-Config] Database URL configured with protocol: ${databaseUrl.split(':')[0]}`);
} else {
    console.warn('[DB-Config] Warning: DATABASE_URL is undefined.');
}

export const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl || "file:./dev.db"
        }
    }
});
