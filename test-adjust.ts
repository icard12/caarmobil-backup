import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const productId = 'b74019be-c2fa-4e86-851d-c17371239b4e';
    const userId = 'a2848682-d6d9-4383-85a9-d4d162ff30ac';

    console.log('--- Attempting Manual Adjustment ---');

    const [updatedProduct, movement] = await prisma.$transaction([
        prisma.product.update({
            where: { id: productId },
            data: { stock: { increment: 1 } }
        }),
        prisma.stockMovement.create({
            data: {
                productId,
                userId,
                type: 'entry',
                quantity: 1,
                reason: 'Teste Manual via Script'
            }
        })
    ]);

    console.log('Success!');
    console.log('Updated Stock:', updatedProduct.stock);
    console.log('Movement Record:', JSON.stringify(movement, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
