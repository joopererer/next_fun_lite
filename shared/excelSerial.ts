/** Excel serial date epoch (1899-12-30 UTC). Shared by excelImport and excelExport. */
export const EXCEL_EPOCH_MS = Date.UTC(1899, 11, 30)

export function dateToExcelSerial(d: Date): number {
  const ms = d.getTime() - EXCEL_EPOCH_MS
  return ms / 86400000
}
