import { prisma } from './client.js';

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample associates
  const associates = await Promise.all([
    prisma.associate.upsert({
      where: { cpf: '64908360090' },
      update: {},
      create: {
        name: 'José da Silva',
        cpf: '64908360090',
        email: 'josedasilva@gmail.com',
        phone: '31994040501',
        status: 'ACTIVE',
      },
    }),
    prisma.associate.upsert({
      where: { cpf: '12345678901' },
      update: {},
      create: {
        name: 'Maria Santos',
        cpf: '12345678901',
        email: 'maria.santos@email.com',
        phone: '31999887766',
        status: 'ACTIVE',
      },
    }),
    prisma.associate.upsert({
      where: { cpf: '98765432100' },
      update: {},
      create: {
        name: 'Carlos Oliveira',
        cpf: '98765432100',
        email: 'carlos.oliveira@email.com',
        phone: '31988776655',
        status: 'INACTIVE',
      },
    }),
    prisma.associate.upsert({
      where: { cpf: '11122233344' },
      update: {},
      create: {
        name: 'Ana Paula Ferreira',
        cpf: '11122233344',
        email: 'ana.ferreira@email.com',
        phone: '31977665544',
        status: 'PENDING',
      },
    }),
    prisma.associate.upsert({
      where: { cpf: '55566677788' },
      update: {},
      create: {
        name: 'Roberto Costa',
        cpf: '55566677788',
        email: 'roberto.costa@email.com',
        phone: '31966554433',
        status: 'ACTIVE',
      },
    }),
  ]);

  console.log(`✅ Created ${associates.length} associates`);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
