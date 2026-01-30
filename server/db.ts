import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const projectRoot = process.cwd();

// --- LÓGICA DE PRODUÇÃO (RENDER / RAILWAY) ---
// Se estivermos em produção, ignoramos o .env e usamos as variáveis do sistema
if (process.env.RENDER || process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production') {
    console.log(`--- AMBIENTE DE PRODUÇÃO DETECTADO (${process.env.RENDER ? "Render" : "Railway"}) ---`);
    console.log('Usando variáveis de ambiente do sistema.');
} else {
    // Só carrega .env se existir localmente
    const envPath = path.join(projectRoot, '.env');
    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
        console.log('--- AMBIENTE LOCAL DETECTADO ---');
    }
}

// Debug environment variables (masked)
console.log('[Env Check] Variables starting with DATABASE or PG:');
Object.keys(process.env).forEach(key => {
    if (key.startsWith('DATABASE') || key.startsWith('PG')) {
        const val = process.env[key];
        console.log(`  - ${key}: ${val ? (val.length > 5 ? val.substring(0, 5) + '...' : 'SET') : 'EMPTY'}`);
    }
});

let databaseUrl = process.env.DATABASE_URL;

// Fallback if DATABASE_URL is missing but PGPASSWORD/PGHOST are there (Common in some cloud setups)
if (!databaseUrl && process.env.PGHOST && process.env.PGDATABASE) {
    console.log('[DB] DATABASE_URL missing, attempting to reconstruct from PG variables...');
    databaseUrl = `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE}`;
}

// Force SSL no-verify for Railway/Render PostgreSQL
if (databaseUrl && !databaseUrl.includes('sslmode=') && (process.env.RAILWAY_ENVIRONMENT || process.env.RENDER || process.env.NODE_ENV === 'production')) {
    if (databaseUrl.includes('?')) {
        databaseUrl += '&sslmode=no-verify';
    } else {
        databaseUrl += '?sslmode=no-verify';
    }
}

console.log('Effective DATABASE_URL:', databaseUrl ? (databaseUrl.includes('sslmode') ? 'CONFIGURADO (SSL)' : 'CONFIGURADO') : '⚠️ NÃO ENCONTRADO ⚠️');

export const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl || "file:./dev.db" // Fallback to local instead of crashing if possible
        }
    }
});
