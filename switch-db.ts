import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
const envPath = path.join(__dirname, '.env');

const target = process.argv[2];

if (target === 'sqlite') {
    // Switch to SQLite
    let schema = fs.readFileSync(schemaPath, 'utf8');
    schema = schema.replace(/provider = "postgresql"/, 'provider = "sqlite"');
    fs.writeFileSync(schemaPath, schema);

    let env = fs.readFileSync(envPath, 'utf8');
    if (!env.includes('DATABASE_URL="file:./dev.db"')) {
        env = env.replace(/DATABASE_URL=".*"/, 'DATABASE_URL="file:./dev.db"');
        fs.writeFileSync(envPath, env);
    }
    console.log('✅ Switched to SQLite (Local)');
} else if (target === 'postgres') {
    // Switch to Postgres
    let schema = fs.readFileSync(schemaPath, 'utf8');
    schema = schema.replace(/provider = "sqlite"/, 'provider = "postgresql"');
    fs.writeFileSync(schemaPath, schema);

    console.log('✅ Switched to PostgreSQL (Production/Render)');
} else {
    console.log('Usage: npx tsx switch-db.ts [sqlite|postgres]');
}
