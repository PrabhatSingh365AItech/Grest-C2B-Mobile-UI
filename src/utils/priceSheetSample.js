import { generateExcelFile } from '../utils/excelHelper'

export const downloadPriceSheetSample = () => {
  const sampleData = [
    {
      'Sr No.': 1,
      'Model Details': 'Apple iPhone 11',
      Brand: 'Apple',
      Series: '11 series',
      Storage: '128 GB',
      Ram: '4 GB',
      'A+WARRANTY': 45000,
      A: 42000,
      'A-': 40000,
      'A-Limited': 38000,
      'B+': 36000,
      B: 35000,
      'B-': 33000,
      'B-Limited': 31000,
      'C+': 30000,
      C: 28000,
      'C-': 26000,
      'C-Limited': 24000,
      'D+': 23000,
      D: 21000,
      'D-': 19000,
      E: 17000,
    },
  ]

  generateExcelFile(sampleData, 'gradepricing-sample-file')
}
