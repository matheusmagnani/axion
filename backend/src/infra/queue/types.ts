export interface JobProgress {
  total: number;
  processed: number;
  successCount: number;
  errorCount: number;
}

export interface JobResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: JobError[];
}

export interface JobError {
  row: number;
  name?: string;
  cpf?: string;
  message: string;
}

export interface JobStatusResponse {
  id: number;
  jobId: string;
  queueName: string;
  status: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: JobError[] | null;
  createdAt: string;
  updatedAt: string;
}
