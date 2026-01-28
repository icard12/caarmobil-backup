import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Registering a test transaction...');
    const t = await prisma.transaction.create({
        data: {
            type: 'income',
            amount: 500,
            description: 'Test Transaction ' + new Date().toISOString(),
            category: 'Diversos',
            status: 'paid',
            date: new Date(),
            dueDate: new Date()
        }
    });
    console.log('Registered:', t.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
