import { prisma } from './client.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding database...');

  // Create company
  const company = await prisma.company.upsert({
    where: { cnpj: '12345678000100' },
    update: {},
    create: {
      companyName: 'Axion Tecnologia Ltda',
      tradeName: 'Axion Tech',
      cnpj: '12345678000100',
      department: 'Tecnologia',
    },
  });

  console.log(`Created company: ${company.companyName}`);

  // Create user
  const hashedPassword = await bcrypt.hash('123456', 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@axion.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@axion.com',
      password: hashedPassword,
      companyId: company.id,
    },
  });

  console.log(`Created user: ${user.email}`);

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
        companyId: company.id,
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
        companyId: company.id,
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
        companyId: company.id,
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
        companyId: company.id,
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
        companyId: company.id,
      },
    }),
  ]);

  console.log(`Created ${associates.length} associates`);

  // Create second company
  const company2 = await prisma.company.upsert({
    where: { cnpj: '98765432000199' },
    update: {},
    create: {
      companyName: 'Nova Soluções Digitais Ltda',
      tradeName: 'Nova Digital',
      cnpj: '98765432000199',
      department: 'Marketing',
    },
  });

  console.log(`Created company: ${company2.companyName}`);

  const user2 = await prisma.user.upsert({
    where: { email: 'admin@novadigital.com' },
    update: {},
    create: {
      name: 'Matheus',
      email: 'admin@novadigital.com',
      password: hashedPassword,
      companyId: company2.id,
    },
  });

  console.log(`Created user: ${user2.email}`);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
