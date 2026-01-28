import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const transactions = await prisma.transaction.findMany({ take: 10, orderBy: { date: 'desc' } });
    console.log('--- Recent Transactions ---');
    transactions.forEach(t => {
        console.log(`ID: ${t.id}, Desc: ${t.description}, Date: ${t.date.toISOString()}, Type: ${t.type}, Category: ${t.category}, Amount: ${t.amount}`);
    });

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log('\nJS Engine "Today" starts at:', today.toISOString());
    console.log('Current machine time:', now.toISOString());

    const todayT = await prisma.transaction.findMany({
        where: {
            date: { gte: today }
        }
    });
    console.log(`\nTransactions found for "today": ${todayT.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
