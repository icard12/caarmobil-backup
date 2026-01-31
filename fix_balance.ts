import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const deleted = await prisma.transaction.deleteMany({
        where: { category: 'Compra de Estoque' }
    });
    console.log(`Deleted ${deleted.count} automatic stock expenses.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
