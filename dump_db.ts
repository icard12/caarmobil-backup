import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const transactions = await prisma.transaction.findMany({
        orderBy: { date: 'desc' },
        take: 10
    });
    console.log('--- Transactions ---');
    console.log(JSON.stringify(transactions, null, 2));

    const stats = await prisma.$queryRaw`SELECT type, category, SUM(amount) as total FROM Transaction GROUP BY type, category`;
    console.log('--- Stats Raw ---');
    console.log(stats);
}

main().catch(console.error).finally(() => prisma.$disconnect());
