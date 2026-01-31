import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- INICIANDO RESET DO SISTEMA ---');
    try {
        // Ordem importa devido às chaves estrangeiras (PricePart -> ServiceOrder/Product, etc)
        console.log('Limpando movimentações e chaves estrangeiras...');
        await prisma.stockMovement.deleteMany();
        await prisma.servicePart.deleteMany();
        await prisma.serviceOrder.deleteMany();
        await prisma.permissionRequest.deleteMany();
        await prisma.systemLog.deleteMany();
        await prisma.pettyCash.deleteMany();
        await prisma.transaction.deleteMany();
        await prisma.product.deleteMany();

        console.log('Limpando usuários (o admin padrão será recriado pelo servidor)...');
        await prisma.user.deleteMany();

        console.log('✅ SISTEMA RESTAURADO COM SUCESSO!');
        console.log('Agora podes reiniciar o servidor e entrar com:');
        console.log('Email: caarmobilei@gmail.com');
        console.log('Senha: admin');
    } catch (error) {
        console.error('❌ ERRO AO RESTAURAR SISTEMA:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
