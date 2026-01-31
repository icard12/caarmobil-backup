import { prisma } from './server/db.ts';
import bcrypt from 'bcryptjs';

async function testUpdate() {
    try {
        const email = 'caarmobilei@gmail.com';
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log('User not found');
            return;
        }

        console.log('User found:', user.email);

        // Try to hash a sample password
        const hashed = await bcrypt.hash('admin', 10);
        console.log('Sample hash:', hashed);

        // Try to update something
        const updated = await prisma.user.update({
            where: { id: user.id },
            data: { name: 'Administrador (Teste)' }
        });
        console.log('Update successful:', updated.name);

        // Restore name
        await prisma.user.update({
            where: { id: user.id },
            data: { name: 'Administrador' }
        });
        console.log('Name restored.');

    } catch (e) {
        console.error('Update test failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}
testUpdate();
