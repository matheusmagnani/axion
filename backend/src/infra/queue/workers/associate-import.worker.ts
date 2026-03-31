import { Job } from 'bullmq';
import { prisma } from '../../database/prisma/client.js';
import type { JobError } from '../types.js';

interface AssociateRow {
  name: string;
  cpf: string;
  email: string;
  phone: string;
}

interface AssociateImportJobData {
  associates: AssociateRow[];
  companyId: number;
  userId: number;
  importJobId: number;
}

export async function processAssociateImport(job: Job<AssociateImportJobData>) {
  const { associates, companyId, importJobId } = job.data;
  const total = associates.length;
  let successCount = 0;
  let errorCount = 0;
  const errors: JobError[] = [];
  const successes: Array<{ row: number; name: string; cpf: string }> = [];

  // Mark as processing
  await prisma.importJob.update({
    where: { id: importJobId },
    data: { status: 'PROCESSING', totalRows: total },
  });

  for (let i = 0; i < associates.length; i++) {
    const row = associates[i];
    const rowNumber = i + 2; // +2 because row 1 is header

    try {
      // Clean CPF and phone
      const cpf = row.cpf.replace(/\D/g, '');
      const phone = row.phone.replace(/\D/g, '');

      // Validate
      if (!row.name || row.name.trim().length < 3) {
        throw new Error('Nome deve ter pelo menos 3 caracteres');
      }
      if (cpf.length !== 11) {
        throw new Error('CPF deve ter 11 dígitos');
      }
      if (phone.length < 10 || phone.length > 11) {
        throw new Error('Telefone inválido');
      }

      // Check for active duplicate
      const existingActive = await prisma.associate.findFirst({
        where: { cpf, companyId, deletedAt: null },
      });

      if (existingActive) {
        throw new Error('Já existe um associado ativo com este CPF');
      }

      // Check for soft-deleted → restore
      const existingDeleted = await prisma.associate.findFirst({
        where: { cpf, companyId, deletedAt: { not: null } },
      });

      if (existingDeleted) {
        await prisma.associate.update({
          where: { id: existingDeleted.id },
          data: {
            name: row.name.trim(),
            cpf,
            email: row.email.trim(),
            phone,
            status: 2,
            deletedAt: null,
          },
        });
      } else {
        await prisma.associate.create({
          data: {
            name: row.name.trim(),
            cpf,
            email: row.email.trim(),
            phone,
            status: 2,
            companyId,
          },
        });
      }

      successCount++;
      successes.push({ row: rowNumber, name: row.name.trim(), cpf });
    } catch (err: unknown) {
      errorCount++;
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      errors.push({
        row: rowNumber,
        name: row.name,
        cpf: row.cpf,
        message,
      });
    }

    // Update progress
    await job.updateProgress({
      total,
      processed: i + 1,
      successCount,
      errorCount,
    });

    // Update ImportJob in DB periodically (every 10 rows or last row)
    if ((i + 1) % 10 === 0 || i === associates.length - 1) {
      await prisma.importJob.update({
        where: { id: importJobId },
        data: { successCount, errorCount },
      });
    }
  }

  // Final update
  await prisma.importJob.update({
    where: { id: importJobId },
    data: {
      status: 'COMPLETED',
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
      successes: successes.length > 0 ? successes : undefined,
    },
  });

  return { success: true, totalRows: total, successCount, errorCount, errors };
}
