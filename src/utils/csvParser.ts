export interface ParsedSheetRow {
  id: string;
  fecha: string;
  monto: number;
  beneficiario: string;
  glosa: string;
  rawFecha: string;
  rawMonto: string;
}

export interface SheetParseResult {
  rows: ParsedSheetRow[];
  totalMontoSum: number;
  positiveMontoSum: number;
  negativeMontoSum: number;
  rowCount: number;
  headersFound: string[];
}

export function parseAmount(raw: string): number {
  if (!raw) return 0;
  // Remove currency words, spaces, keeping digits, dots, commas, negative sign
  let str = raw.trim().replace(/[^0-9.,-]/g, '');
  if (!str) return 0;

  // Handle formats like 1.250,50 vs 1,250.50
  if (str.includes(',') && str.includes('.')) {
    if (str.indexOf('.') < str.indexOf(',')) {
      // 1.250,50 -> 1250.50
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // 1,250.50 -> 1250.50
      str = str.replace(/,/g, '');
    }
  } else if (str.includes(',')) {
    // Check if comma is decimal separator e.g. 150,50
    const parts = str.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      str = str.replace(',', '.');
    } else {
      str = str.replace(/,/g, '');
    }
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

export function parseCSVString(csvText: string): SheetParseResult {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  // Split lines respecting quotes
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && csvText[i + 1] === '\n') {
        i++; // skip \n
      }
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length === 0) {
    return {
      rows: [],
      totalMontoSum: 0,
      positiveMontoSum: 0,
      negativeMontoSum: 0,
      rowCount: 0,
      headersFound: [],
    };
  }

  // Helper to split a single CSV line into cells
  const parseCSVLine = (line: string): string[] => {
    const cells: string[] = [];
    let cell = '';
    let inside = false;

    // Detect delimiter (, or ;)
    const delimiter = line.includes(';') && !line.includes(',') ? ';' : ',';

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inside && line[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inside = !inside;
        }
      } else if (c === delimiter && !inside) {
        cells.push(cell.trim());
        cell = '';
      } else {
        cell += c;
      }
    }
    cells.push(cell.trim());
    return cells;
  };

  // Header row
  const headerCells = parseCSVLine(lines[0]).map((h) =>
    h.toUpperCase().replace(/^"|"$/g, '').trim()
  );

  // Column index detection
  let fechaIdx = headerCells.findIndex((h) => h.includes('FECHA') || h.includes('DATE'));
  let montoIdx = headerCells.findIndex((h) => h.includes('MONTO') || h.includes('AMOUNT') || h.includes('VALOR'));
  let beneficiarioIdx = headerCells.findIndex(
    (h) => h.includes('BENEFICIARIO') || h.includes('PAYEE') || h.includes('CLIENTE')
  );
  let glosaIdx = headerCells.findIndex(
    (h) => h.includes('GLOSA') || h.includes('DESCRIP') || h.includes('CONCEPTO') || h.includes('DETALLE')
  );

  // Fallback defaults if headers not matched by name
  if (fechaIdx === -1) fechaIdx = 0;
  if (montoIdx === -1) montoIdx = 1;
  if (beneficiarioIdx === -1) beneficiarioIdx = 2;
  if (glosaIdx === -1) glosaIdx = 3;

  const rows: ParsedSheetRow[] = [];
  let totalMontoSum = 0;
  let positiveMontoSum = 0;
  let negativeMontoSum = 0;

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCSVLine(lines[i]);
    if (cells.length < 2) continue; // Skip empty/invalid lines

    const rawFecha = cells[fechaIdx] || '';
    const rawMonto = cells[montoIdx] || '0';
    const beneficiario = (cells[beneficiarioIdx] || '').replace(/^"|"$/g, '');
    const glosa = (cells[glosaIdx] || '').replace(/^"|"$/g, '');

    const numericMonto = parseAmount(rawMonto);

    // Format fecha YYYY-MM-DD if possible, else preserve
    let fecha = rawFecha.replace(/^"|"$/g, '').trim();
    if (fecha.includes('/')) {
      const parts = fecha.split('/');
      if (parts.length === 3) {
        // Assume DD/MM/YYYY or YYYY/MM/DD
        if (parts[0].length === 4) {
          fecha = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        } else if (parts[2].length === 4) {
          fecha = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
    }

    if (!fecha) {
      fecha = new Date().toISOString().split('T')[0];
    }

    totalMontoSum += numericMonto;
    if (numericMonto > 0) {
      positiveMontoSum += numericMonto;
    } else {
      negativeMontoSum += Math.abs(numericMonto);
    }

    rows.push({
      id: `sheet-tx-${i}-${fecha}-${numericMonto}`,
      fecha,
      monto: numericMonto,
      beneficiario: beneficiario || 'Beneficiario',
      glosa: glosa || 'Sin glosa',
      rawFecha,
      rawMonto,
    });
  }

  return {
    rows,
    totalMontoSum,
    positiveMontoSum,
    negativeMontoSum,
    rowCount: rows.length,
    headersFound: headerCells,
  };
}
