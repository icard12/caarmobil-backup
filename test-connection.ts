import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('Testing connection to DATABASE_URL:', process.env.DATABASE_URL);
    try {
        await prisma.$connect();
        console.log('Successfully connected to the database!');
        const users = await prisma.user.count();
        console.log('User count:', users);
    } catch (error) {
        console.error('Failed to connect to the database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
