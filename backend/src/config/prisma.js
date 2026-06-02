import pg from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

// Cria a conexão nativa com o Postgres usando a URL do .env
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// Inicializa o Prisma passando o adaptador moderno
const prisma = new PrismaClient({ adapter });

export default prisma;