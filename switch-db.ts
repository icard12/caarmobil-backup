import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = process.cwd();
const schemaPath = path.join(rootDir, 'prisma', 'schema.prisma');
const envPath = path.join(rootDir, '.env');

const target = process.argv[2];

console.log(`[Switch-DB] Target: ${target}`);
console.log(`[Switch-DB] Root Dir: ${rootDir}`);
console.log(`[Switch-DB] Schema Path: ${schemaPath}`);

if (!fs.existsSync(schemaPath)) {
    console.error(`❌ [Switch-DB] Error: Schema file not found at ${schemaPath}`);
    console.log('[Switch-DB] Listing root directory:');
    try {
        console.log(fs.readdirSync(rootDir).join('\n'));
        if (fs.existsSync(path.join(rootDir, 'prisma'))) {
            console.log('[Switch-DB] Listing prisma directory:');
            console.log(fs.readdirSync(path.join(rootDir, 'prisma')).join('\n'));
        } else {
            console.log('[Switch-DB] prisma directory does not exist.');
        }
    } catch (e) {
        console.error('[Switch-DB] Error listing files:', e);
    }
    process.exit(1);
}

if (target === 'sqlite') {
    console.log('🔄 Switching to SQLite...');
    let schema = fs.readFileSync(schemaPath, 'utf8');
    schema = schema.replace(/provider = "postgresql"/g, 'provider = "sqlite"');
    fs.writeFileSync(schemaPath, schema);

    let env = '';
    if (fs.existsSync(envPath)) {
        env = fs.readFileSync(envPath, 'utf8');
        if (!env.includes('DATABASE_URL="file:./dev.db"')) {
            env = env.replace(/DATABASE_URL=".*"/, 'DATABASE_URL="file:./dev.db"');
            fs.writeFileSync(envPath, env);
        }
    }
    console.log('✅ Switched to SQLite (Local)');
} else if (target === 'postgres') {
    console.log('🔄 Switching to PostgreSQL...');
    let schema = fs.readFileSync(schemaPath, 'utf8');
    schema = schema.replace(/provider = "sqlite"/g, 'provider = "postgresql"');
    fs.writeFileSync(schemaPath, schema);
    console.log('✅ Switched to PostgreSQL (Production)');
} else {
    console.error('❌ Error: Usage: npx tsx switch-db.ts [sqlite|postgres]');
    process.exit(1);
}
