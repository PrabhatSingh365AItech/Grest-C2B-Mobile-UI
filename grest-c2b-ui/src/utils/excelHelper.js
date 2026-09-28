import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

/**
 * Generates and downloads an Excel file from the provided data
 * @param {Array} data - Array of objects to convert to Excel
 * @param {string} fileName - Name of the file (without extension)
 */
export const generateExcelFile = (data, fileName) => {
  const fileType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  const fileExtension = '.xlsx'

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const dataFile = new Blob([excelBuffer], { type: fileType })
  saveAs(dataFile, `${fileName}${fileExtension}`)
}
