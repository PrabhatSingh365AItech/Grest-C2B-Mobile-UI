import * as XLSX from 'xlsx'
import axios from 'axios'
import { saveAs } from 'file-saver'

export const downloadExcel = (apiData) => {
  const fileType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'

  const formattedData = apiData.map((item) => ({
    'Company Name': item.name,
    'Company Code': item.companyCode,
    Address: item.address,
    'Contact Number': item.contactNumber,
    'GST Number': item.gstNumber,
    'PAN Number': item.panNumber,
    Remarks: item.remarks,
  }))

  const ws = XLSX.utils.json_to_sheet(formattedData)
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

  saveAs(new Blob([excelBuffer], { type: fileType }), 'Company_Listing.xlsx')
}

export const handleDownload = async (totalCount) => {
  const token = sessionStorage.getItem('authToken')
  const res = await axios.get(
    `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/company/findAll?page=0&limit=${totalCount}`,
    { headers: { Authorization: token } },
  )
  downloadExcel(res.data.result)
}
