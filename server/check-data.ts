import { prisma } from './db.ts';

async function run() {
    console.log('--- DB DATA CHECK ---');
    try {
        const adminCom = await prisma.user.findUnique({
            where: { email: 'admin@admin.com' },
            include: { _count: { select: { movements: true, logs: true } } }
        });
        const caarMobil = await prisma.user.findUnique({
            where: { email: 'caarmobilei@gmail.com' },
            include: { _count: { select: { movements: true, logs: true } } }
        });

        console.log('admin@admin.com:', adminCom?._count);
        console.log('caarmobilei@gmail.com:', caarMobil?._count);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
run();
