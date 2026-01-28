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

const databaseUrl = process.env.DATABASE_URL;

console.log('Effective DATABASE_URL:', databaseUrl ? 'CONECTADO (Protegido)' : 'NÃO ENCONTRADO');

if (databaseUrl && databaseUrl.includes('localhost')) {
    if (process.env.RENDER || process.env.RAILWAY_ENVIRONMENT) {
        const platform = process.env.RENDER ? "Render" : "Railway";
        console.error(`ERRO CRÍTICO: O ${platform} está tentando usar "localhost"! Verifique as variáveis de ambiente no painel do ${platform}.`);
    }
}

export const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl
        }
    }
});
