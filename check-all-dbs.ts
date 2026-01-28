import { PrismaClient } from '@prisma/client';

async function checkDB(name: string, url: string) {
    console.log(`\n--- Checking ${name} (${url}) ---`);
    const p = new PrismaClient({ datasources: { db: { url } } });
    try {
        const productCount = await p.product.count();
        const userCount = await p.user.count();
        const transactionCount = await p.transaction.count();
        console.log(`Success: ${productCount} products, ${userCount} users, ${transactionCount} transactions.`);

        if (productCount > 0) {
            const products = await p.product.findMany({ take: 3, where: { isDeleted: false } });
            console.log('Sample Products:', products.map(p => p.name));
        }
    } catch (e: any) {
        console.log(`Error: ${e.message}`);
    } finally {
        await p.$disconnect();
    }
}

async function main() {
    const base = 'file:C:/Users/CALL MOBILE/Music/project/prisma';
    await checkDB('dev.db', `${base}/dev.db`);
    await checkDB('dev-recovery.db', `${base}/dev-recovery.db`);
    await checkDB('dev.db.corrupt', `${base}/dev.db.corrupt`);
}

main().catch(console.error);
