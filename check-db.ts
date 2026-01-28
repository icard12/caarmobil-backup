import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Root DB ---');
    await checkDB('file:./dev.db');
    console.log('\n--- Checking Prisma Dir DB ---');
    await checkDB('file:./prisma/dev.db');
}

async function checkDB(url: string) {
    const p = new PrismaClient({ datasources: { db: { url } } });
    try {
        const productCount = await p.product.count();
        const movementCount = await p.stockMovement.count();
        const transactionCount = await p.transaction.count();
        const userCount = await p.user.count();

        console.log({
            url,
            productCount,
            movementCount,
            transactionCount,
            userCount
        });
    } catch (e: any) {
        console.log(`Could not check DB at ${url}: ${e.message}`);
    } finally {
        await p.$disconnect();
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
