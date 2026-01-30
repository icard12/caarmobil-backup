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

let databaseUrl = process.env.DATABASE_URL;

// Force SSL no-verify for Railway/Render PostgreSQL
if (databaseUrl && !databaseUrl.includes('sslmode=') && (process.env.RAILWAY_ENVIRONMENT || process.env.RENDER || process.env.NODE_ENV === 'production')) {
    if (databaseUrl.includes('?')) {
        databaseUrl += '&sslmode=no-verify';
    } else {
        databaseUrl += '?sslmode=no-verify';
    }
}

console.log('Effective DATABASE_URL:', databaseUrl ? (databaseUrl.includes('sslmode') ? 'CONECTADO (SSL)' : 'CONECTADO') : 'NÃO ENCONTRADO');

export const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl
        }
    }
});
