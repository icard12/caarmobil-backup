import { prisma } from './db.js';
import bcrypt from 'bcryptjs';

async function run() {
    console.log('--- ADMIN STANDARDIZATION ---');
    try {
        // 1. Delete admin@admin.com (and its logs)
        const adminCom = await prisma.user.findUnique({ where: { email: 'admin@admin.com' } });
        if (adminCom) {
            await prisma.systemLog.deleteMany({ where: { userId: adminCom.id } });
            await prisma.user.delete({ where: { id: adminCom.id } });
            console.log('Deleted admin@admin.com and its logs.');
        }

        // 2. Ensure caarmobilei@gmail.com is an admin and has password 'admin'
        const hashedPassword = await bcrypt.hash('admin', 10);
        await prisma.user.upsert({
            where: { email: 'caarmobilei@gmail.com' },
            update: {
                role: 'admin',
                password: hashedPassword
            },
            create: {
                name: 'Administrador Principal',
                email: 'caarmobilei@gmail.com',
                password: hashedPassword,
                role: 'admin'
            }
        });
        console.log('caarmobilei@gmail.com is now the official Admin with password "admin".');

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
run();
