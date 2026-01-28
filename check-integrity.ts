import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    try {
        console.log('Checking database connection...');
        const count = await prisma.user.count();
        console.log(`Connection successful. User count: ${count}`);

        console.log('Running PRAGMA integrity_check...');
        const result = await prisma.$queryRaw`PRAGMA integrity_check`;
        console.log('Integrity check result:', JSON.stringify(result, null, 2));

        console.log('Checking WAL mode...');
        const wal = await prisma.$queryRaw`PRAGMA journal_mode`;
        console.log('Journal mode:', JSON.stringify(wal, null, 2));
    } catch (e) {
        console.error('Database check failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
