import { useState, useRef, useCallback, useEffect } from 'react';
import { UploadSimple, FileXls, Trash, DownloadSimple, Warning } from '@phosphor-icons/react';
import * as XLSX from 'xlsx';

export interface ColumnConfig {
  key: string;
  label: string;
  aliases?: string[];
  required?: boolean;
}

interface SpreadsheetReaderProps {
  columns: ColumnConfig[];
  onDataReady: (data: Record<string, string>[]) => void;
  onSelectionChange?: (selectedData: Record<string, string>[]) => void;
  selectable?: boolean;
  templateData?: Record<string, string>[];
  templateFileName?: string;
}

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function mapColumns(
  headers: string[],
  columns: ColumnConfig[],
): Record<number, string> {
  const mapping: Record<number, string> = {};

  headers.forEach((header, index) => {
    const normalized = normalizeHeader(header);

    for (const col of columns) {
      const labelNorm = normalizeHeader(col.label);
      const aliasNorms = (col.aliases || []).map(normalizeHeader);

      if (normalized === labelNorm || aliasNorms.includes(normalized)) {
        mapping[index] = col.key;
        break;
      }
    }
  });

  return mapping;
}

export function SpreadsheetReader({
  columns,
  onDataReady,
  onSelectionChange,
  selectable = false,
  templateData,
  templateFileName = 'modelo.xlsx',
}: SpreadsheetReaderProps) {
  const [parsedData, setParsedData] = useState<Record<string, string>[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(new Set());
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notify parent when selection changes
  useEffect(() => {
    if (!selectable || !onSelectionChange || parsedData.length === 0) return;
    const selected = parsedData.filter((_, i) => selectedIndexes.has(i));
    onSelectionChange(selected);
  }, [selectedIndexes, parsedData, selectable, onSelectionChange]);

  const processFile = useCallback(
    (file: File) => {
      setError('');
      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, {
            header: 1,
          });

          if (jsonData.length < 2) {
            setError('A planilha deve conter pelo menos um cabeçalho e uma linha de dados.');
            return;
          }

          const headers = jsonData[0].map(String);
          const mapping = mapColumns(headers, columns);
          const mappedKeys = Object.values(mapping);

          // Check required columns
          const missingRequired = columns
            .filter((c) => c.required !== false)
            .filter((c) => !mappedKeys.includes(c.key));

          if (missingRequired.length > 0) {
            setError(
              `Colunas não encontradas: ${missingRequired.map((c) => c.label).join(', ')}`,
            );
            return;
          }

          // Map rows
          const rows: Record<string, string>[] = [];
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.every((cell) => !cell && cell !== 0)) continue;

            const mappedRow: Record<string, string> = {};
            for (const [colIndex, key] of Object.entries(mapping)) {
              mappedRow[key] = String(row[Number(colIndex)] ?? '').trim();
            }
            rows.push(mappedRow);
          }

          if (rows.length === 0) {
            setError('Nenhuma linha de dados encontrada na planilha.');
            return;
          }

          setParsedData(rows);
          // Select all by default
          setSelectedIndexes(new Set(rows.map((_, i) => i)));
          onDataReady(rows);
        } catch {
          setError('Erro ao ler a planilha. Verifique o formato do arquivo.');
        }
      };

      reader.readAsArrayBuffer(file);
    },
    [columns, onDataReady],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClear = () => {
    setParsedData([]);
    setSelectedIndexes(new Set());
    setFileName('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onDataReady([]);
  };

  const handleToggleRow = (index: number) => {
    setSelectedIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleToggleAll = () => {
    if (selectedIndexes.size === parsedData.length) {
      setSelectedIndexes(new Set());
    } else {
      setSelectedIndexes(new Set(parsedData.map((_, i) => i)));
    }
  };

  const handleDownloadTemplate = () => {
    const headers = columns.map((c) => c.label);
    const exampleRow = templateData?.[0]
      ? columns.map((c) => templateData[0][c.key] || '')
      : [];

    const wsData = [headers];
    if (exampleRow.length > 0) wsData.push(exampleRow);

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Modelo');
    XLSX.writeFile(wb, templateFileName);
  };

  const allSelected = parsedData.length > 0 && selectedIndexes.size === parsedData.length;
  const someSelected = selectedIndexes.size > 0 && !allSelected;

  return (
    <div className="space-y-4">
      {/* Template download */}
      <button
        type="button"
        onClick={handleDownloadTemplate}
        className="flex items-center gap-2 text-sm text-app-secondary/70 hover:text-app-secondary transition-colors"
      >
        <DownloadSimple className="w-4 h-4" />
        Baixar planilha modelo
      </button>

      {/* Drop zone */}
      {parsedData.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-200
            ${
              isDragging
                ? 'border-app-secondary bg-app-secondary/10'
                : 'border-app-secondary/30 hover:border-app-secondary/60'
            }
          `}
        >
          <UploadSimple className="w-10 h-10 mx-auto mb-3 text-app-secondary/50" />
          <p className="text-sm text-app-secondary/70">
            Arraste a planilha aqui ou{' '}
            <span className="text-app-secondary underline">clique para selecionar</span>
          </p>
          <p className="text-xs text-app-secondary/70 mt-1">.xlsx, .xls, .csv</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <Warning className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* File info + preview */}
      {parsedData.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileXls className="w-5 h-5 text-green-400" />
              <span className="text-sm text-app-secondary">{fileName}</span>
              <span className="text-xs text-app-secondary/60">
                {selectable
                  ? `(${selectedIndexes.size}/${parsedData.length} selecionados)`
                  : `(${parsedData.length} ${parsedData.length === 1 ? 'registro' : 'registros'})`}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-app-secondary/60 hover:text-red-400 transition-colors"
              title="Remover arquivo"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>

          {/* Preview table */}
          <div className="max-h-[240px] overflow-auto rounded-lg border border-app-secondary/20">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-app-bg/50">
                  {selectable && (
                    <th className="px-3 py-2 text-left w-8">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected;
                        }}
                        onChange={handleToggleAll}
                        className="accent-app-secondary cursor-pointer"
                      />
                    </th>
                  )}
                  <th className="px-3 py-2 text-left text-app-secondary/60 font-medium">#</th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-3 py-2 text-left text-app-secondary/60 font-medium"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.slice(0, 50).map((row, i) => (
                  <tr
                    key={i}
                    className={`border-t border-app-secondary/10 ${
                      selectable && !selectedIndexes.has(i) ? 'opacity-40' : ''
                    }`}
                  >
                    {selectable && (
                      <td className="px-3 py-1.5">
                        <input
                          type="checkbox"
                          checked={selectedIndexes.has(i)}
                          onChange={() => handleToggleRow(i)}
                          className="accent-app-secondary cursor-pointer"
                        />
                      </td>
                    )}
                    <td className="px-3 py-1.5 text-app-secondary/60">{i + 1}</td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-3 py-1.5 text-app-secondary/80"
                      >
                        {row[col.key] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedData.length > 50 && (
              <p className="text-center text-xs text-app-secondary/60 py-2">
                Mostrando 50 de {parsedData.length} registros
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
