import { prisma } from './db.js';

async function run() {
    try {
        const users = await prisma.user.findMany();
        console.log('--- DB USERS ---');
        users.forEach(u => console.log(`- ${u.email} (${u.name})`));
        console.log('----------------');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
run();
