import { PrismaClient } from '@prisma/client';

async function checkDb(url: string, label: string) {
    console.log(`\n--- Checking ${label} (${url}) ---`);
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: `file:${url}`
            }
        }
    });

    try {
        const users = await prisma.user.count();
        const products = await prisma.product.count();
        const transactions = await prisma.transaction.count();
        const movements = await prisma.stockMovement.count();

        console.log(`Users: ${users}`);
        console.log(`Products: ${products}`);
        console.log(`Transactions: ${transactions}`);
        console.log(`Movements: ${movements}`);

        if (users > 0) {
            const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
            console.log(`Admin email: ${admin?.email || 'None'}`);
        }
    } catch (error) {
        console.error(`Error checking ${label}:`, error.message);
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    await checkDb('./prisma/dev-recovery.db', 'Recovery DB');
    await checkDb('./prisma/dev.db', 'Dev DB');
}

main();
