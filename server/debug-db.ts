import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    try {
        const products = await prisma.product.findMany();
        console.log('Products:', JSON.stringify(products, null, 2));
        const users = await prisma.user.findMany();
        console.log('Users:', JSON.stringify(users, null, 2));
    } catch (e) {
        console.error('ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
