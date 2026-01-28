import { prisma } from './db.ts';
import bcrypt from 'bcryptjs';

async function main() {
    const email = 'caarmobilei@gmail.com';
    const password = 'admin';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'admin'
        },
        create: {
            name: 'Administrador',
            email,
            password: hashedPassword,
            role: 'admin',
            avatar: ''
        }
    });

    console.log(`User ${email} is now ready with password: ${password}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
