import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkMovements() {
    try {
        const movementCount = await prisma.stockMovement.count();
        const logCount = await prisma.systemLog.count();
        const productCount = await prisma.product.count({ where: { isDeleted: false } });

        console.log(`StockMovements: ${movementCount}`);
        console.log(`SystemLogs: ${logCount}`);
        console.log(`Products: ${productCount}`);

        if (movementCount > 0) {
            const lastMovements = await prisma.stockMovement.findMany({
                take: 5,
                orderBy: { date: 'desc' },
                include: { product: true }
            });
            console.log('Last 5 Movements:', JSON.stringify(lastMovements, null, 2));
        }

        if (logCount > 0) {
            const lastLogs = await prisma.systemLog.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' }
            });
            console.log('Last 5 Logs:', JSON.stringify(lastLogs, null, 2));
        }
    } catch (e) {
        console.error('Check Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

checkMovements();
