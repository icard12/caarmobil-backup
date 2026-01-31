
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const transactions = await prisma.transaction.findMany({
        where: {
            date: {
                gte: today
            }
        }
    });

    console.log('--- Transactions Today ---');
    transactions.forEach(t => {
        console.log(`[${t.id}] ${t.date.toISOString()} | ${t.type} | ${t.category} | ${t.description} | ${t.status} | ${t.amount}`);
    });
    console.log('--------------------------');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
