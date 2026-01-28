import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const stockExpenses = await prisma.transaction.findMany({
        where: { category: 'Compra de Estoque' }
    });
    console.log('--- Stock Expenses ---');
    console.log(JSON.stringify(stockExpenses, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
