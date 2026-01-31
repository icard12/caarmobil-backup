import { PrismaClient } from '@prisma/client';

async function test() {
    console.log('Testing dev-recovery.db with absolute path...');
    // Note: SQLite absolute path on Windows needs 3 slashes if it starts with a drive letter, 
    // but Prisma handled file:C:/path/to/db usually.
    const url = 'file:C:/Users/CALL MOBILE/Music/project/prisma/dev-recovery.db';
    const prisma = new PrismaClient({ datasources: { db: { url } } });

    try {
        const count = await prisma.product.count({ where: { isDeleted: false } });
        console.log(`Success! Found ${count} products.`);
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

test();
