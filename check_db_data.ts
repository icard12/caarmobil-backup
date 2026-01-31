import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkData() {
    try {
        const userCount = await prisma.user.count();
        const productCount = await prisma.product.count({ where: { isDeleted: false } });
        console.log(`Users: ${userCount}`);
        console.log(`Products: ${productCount}`);

        if (userCount > 0) {
            const firstUser = await prisma.user.findFirst();
            console.log('Sample User:', firstUser.name, firstUser.email);
        }
    } catch (e) {
        console.error('DB Check Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
