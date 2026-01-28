import { PrismaClient } from '@prisma/client';

async function main() {
    const url = "postgresql://postgres@localhost:5432/postgres";
    console.log('Testing connection to:', url);
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    try {
        await prisma.$connect();
        console.log('SUCCESS: Connected without password!');
    } catch (error) {
        console.log('FAILED: Connection without password failed.');
    } finally {
        await prisma.$disconnect();
    }
}

main();
