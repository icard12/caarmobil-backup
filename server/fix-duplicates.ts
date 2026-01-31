
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
        },
        orderBy: { date: 'asc' }
    });

    console.log('\n--- DETAILED TRANSACTIONS TODAY ---');
    if (transactions.length === 0) {
        console.log('No transactions found for today.');
    }

    const duplicates: string[] = [];

    for (let i = 0; i < transactions.length; i++) {
        const t1 = transactions[i];
        console.log(`[${t1.id}] ${t1.date.toISOString()} | ${t1.category} | ${t1.description} | ${t1.status} | MT ${t1.amount}`);

        for (let j = i + 1; j < transactions.length; j++) {
            const t2 = transactions[j];

            // Criteria for "Duplicate": 
            // Same amount, same category, same description (or starts with same), 
            // same status, and within 30 seconds of each other.
            const timeDiff = Math.abs(t1.date.getTime() - t2.date.getTime());

            if (
                t1.amount === t2.amount &&
                t1.category === t2.category &&
                t1.status === t2.status &&
                timeDiff < 30000 // 30 seconds
            ) {
                console.log(`>>> POTENTIAL DUPLICATE FOUND: [${t1.id}] and [${t2.id}]`);
                duplicates.push(t2.id);
            }
        }
    }

    if (duplicates.length > 0) {
        console.log(`\nRemoving ${duplicates.length} duplicate transactions...`);
        const result = await prisma.transaction.deleteMany({
            where: {
                id: { in: duplicates }
            }
        });
        console.log(`Deleted ${result.count} records.`);
    } else {
        console.log('\nNo matching duplicates found to auto-delete.');
    }

    console.log('-----------------------------------\n');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
