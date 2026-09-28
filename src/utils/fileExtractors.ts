import * as XLSX from 'xlsx';

export interface FileDataResult {
  filename: string;
  fileType: 'pdf' | 'csv' | 'xlsx' | 'txt';
  text: string;
  base64?: string;
  mimeType: string;
}

/**
 * Reads any supported file (PDF, CSV, XLSX, TXT) and returns text content and base64 representation.
 */
export async function readFileData(file: File): Promise<FileDataResult> {
  const name = file.name.toLowerCase();
  let fileType: 'pdf' | 'csv' | 'xlsx' | 'txt' = 'txt';
  let mimeType = file.type || 'text/plain';

  if (name.endsWith('.pdf')) {
    fileType = 'pdf';
    mimeType = 'application/pdf';
  } else if (name.endsWith('.csv')) {
    fileType = 'csv';
    mimeType = 'text/csv';
  } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    fileType = 'xlsx';
    mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  } else {
    fileType = 'txt';
    mimeType = 'text/plain';
  }

  // Base64 reader
  const base64Promise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const b64 = res.includes(',') ? res.split(',')[1] : res;
      resolve(b64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  if (fileType === 'xlsx') {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    let textCombined = '';
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      textCombined += `=== Sheet: ${sheetName} ===\n${csv}\n\n`;
    });
    const base64 = await base64Promise;
    return {
      filename: file.name,
      fileType,
      text: textCombined,
      base64,
      mimeType,
    };
  }

  if (fileType === 'csv' || fileType === 'txt') {
    const text = await file.text();
    const base64 = await base64Promise;
    return {
      filename: file.name,
      fileType,
      text,
      base64,
      mimeType,
    };
  }

  // For PDF
  const base64 = await base64Promise;
  // Fallback text preview from PDF if available
  let text = `[PDF Document: ${file.name}, size: ${(file.size / 1024).toFixed(1)} KB]`;
  return {
    filename: file.name,
    fileType,
    text,
    base64,
    mimeType,
  };
}
