import * as XLSX from 'xlsx'
import Papa from 'papaparse'

const isExcelFile = (file) =>
  file?.type?.includes('sheet') || file?.type?.includes('excel')

const applyPreview = (headers, rows, setPreviewHeaders, setPreviewData) => {
  if (!headers?.length || !rows?.length) {
    return
  }
  setPreviewHeaders(headers)
  setPreviewData(rows)
}

const handleExcelPreview = (
  arrayBuffer,
  maxRows,
  setPreviewHeaders,
  setPreviewData,
) => {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]
  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

  if (!json.length) {
    return
  }

  const headers = json[0]
  const rows = maxRows ? json.slice(1, maxRows + 1) : json.slice(1)

  applyPreview(headers, rows, setPreviewHeaders, setPreviewData)
}

const handleCsvPreview = (
  textData,
  maxRows,
  setPreviewHeaders,
  setPreviewData,
) => {
  Papa.parse(textData, {
    header: true,
    preview: maxRows || 0,
    skipEmptyLines: true,
    complete: ({ data, meta }) => {
      if (!data?.length) {
        return
      }
      const rows = data.map((row) => Object.values(row))
      applyPreview(meta.fields, rows, setPreviewHeaders, setPreviewData)
    },
  })
}

export const generatePreview = (
  inputFile,
  setPreviewHeaders,
  setPreviewData,
  setError,
  maxRows = null,
) => {
  const reader = new FileReader()
  const excel = isExcelFile(inputFile)

  reader.onload = (e) => {
    try {
      excel
        ? handleExcelPreview(
            e.target.result,
            maxRows,
            setPreviewHeaders,
            setPreviewData,
          )
        : handleCsvPreview(
            e.target.result,
            maxRows,
            setPreviewHeaders,
            setPreviewData,
          )
    } catch {
      setError('Could not generate a preview for this file.')
    }
  }

  excel ? reader.readAsArrayBuffer(inputFile) : reader.readAsText(inputFile)
}

export const buildCSVAndDownload = (headers, rows, filename) => {
  const escapeCsvCell = (cell) => {
    const value = String(cell ?? '')
    return /,|"|\n/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
  }

  const csvRows = [headers, ...rows]
  const csvBody = csvRows
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\n')

  const csvContent = `data:text/csv;charset=utf-8,${csvBody}`

  const link = document.createElement('a')
  link.href = encodeURI(csvContent)
  link.download = filename

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
