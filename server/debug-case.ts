import { prisma } from './db.js';

async function run() {
    try {
        const users = await prisma.user.findMany();
        console.log('--- DB USERS (DEBUG CASE) ---');
        users.forEach(u => {
            console.log(`- Original: [${u.email}] | Lower: [${u.email.toLowerCase()}]`);
        });
        console.log('-----------------------------');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
run();
