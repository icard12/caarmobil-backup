const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function recover() {
    console.log('Starting data recovery...');

    // Healthy target
    const targetPrisma = new PrismaClient({
        datasources: { db: { url: 'file:C:/Users/CALL MOBILE/Music/project/prisma/dev-recovery.db' } }
    });

    // Corrupt source
    const sourcePrisma = new PrismaClient({
        datasources: { db: { url: 'file:C:/Users/CALL MOBILE/Music/project/prisma/dev.db.corrupt' } }
    });

    try {
        console.log('Recovering Users...');
        try {
            const users = await sourcePrisma.user.findMany();
            for (const user of users) {
                await targetPrisma.user.upsert({
                    where: { id: user.id },
                    update: user,
                    create: user
                });
            }
            console.log(`Recovered ${users.length} users.`);
        } catch (e) {
            console.error('Failed to recover users:', e.message);
        }

        console.log('Recovering Products...');
        try {
            const products = await sourcePrisma.product.findMany();
            for (const product of products) {
                await targetPrisma.product.upsert({
                    where: { id: product.id },
                    update: product,
                    create: product
                });
            }
            console.log(`Recovered ${products.length} products.`);
        } catch (e) {
            console.error('Failed to recover products:', e.message);
        }

        console.log('Recovering Transactions...');
        try {
            const transactions = await sourcePrisma.transaction.findMany();
            for (const tx of transactions) {
                await targetPrisma.transaction.upsert({
                    where: { id: tx.id },
                    update: tx,
                    create: tx
                });
            }
            console.log(`Recovered ${transactions.length} transactions.`);
        } catch (e) {
            console.error('Failed to recover transactions:', e.message);
        }

    } catch (globalError) {
        console.error('Critical recovery error:', globalError);
    } finally {
        await sourcePrisma.$disconnect();
        await targetPrisma.$disconnect();
    }
}

recover();
