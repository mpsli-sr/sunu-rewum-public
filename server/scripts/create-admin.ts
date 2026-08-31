import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@sunu.sn';
  const password = 'Admin123!';
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: hashed,
      role: 'ADMIN',
      verified: true,
    },
    create: {
      email,
      passwordHash: hashed,
      firstName: 'Admin',
      lastName: 'Sunu',
      role: 'ADMIN',
      verified: true,
    },
  });

  console.log('✅ Admin créé :', user.email, 'rôle :', user.role);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
