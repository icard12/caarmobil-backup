import { prisma } from './server/db.ts';

async function listUsers() {
    try {
        const users = await prisma.user.findMany();
        console.log('--- USERS ---');
        users.forEach(u => {
            console.log(`ID: ${u.id} | Email: ${u.email} | Name: ${u.name} | Role: ${u.role}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
listUsers();
