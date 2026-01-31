import { prisma } from './db.js';

async function run() {
    console.log('--- DB CLASH RESOLUTION ---');
    try {
        // 1. Delete the "extra" caarmobilei account if it exists
        const count = await prisma.user.deleteMany({
            where: { email: 'caarmobilei@gmail.com' }
        });
        console.log(`Deleted ${count.count} existing caarmobilei@gmail.com accounts.`);

        // 2. Rename admin@admin.com to caarmobilei@gmail.com
        const updated = await prisma.user.updateMany({
            where: { email: 'admin@admin.com' },
            data: { email: 'caarmobilei@gmail.com' }
        });
        console.log(`Updated ${updated.count} admin@admin.com account(s) to caarmobilei@gmail.com.`);

    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await prisma.$disconnect();
        console.log('Migration script finished.');
    }
}
run();
