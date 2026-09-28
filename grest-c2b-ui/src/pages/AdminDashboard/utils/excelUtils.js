import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export const downloadExcel = (apiData) => {
  if (!apiData || !Array.isArray(apiData)) {
    console.error('Invalid data provided for Excel download')
    return
  }

  const fileType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  const fileExtension = '.xlsx'
  const dataMap = new Map()

  apiData.forEach((item) => {
    const {
      date,
      data,
      totalPicked,
      priceOfferToCustomer,
      totalPickedPrice,
      pendingForPickup,
      pendingForPickupPrice,
      totalAvailableForPickup,
    } = item
    if (!dataMap.has(date)) {
      dataMap.set(date, {
        Date: date,
        'Total Available Devices': totalAvailableForPickup,
        'Total Price Offered To Customer': priceOfferToCustomer,
        'Picked from store': totalPicked,
        'Picked devices price': totalPickedPrice,
        'Pendency of devices': pendingForPickup,
        'Pendency Payment': pendingForPickupPrice,
      })
    }
    if (data && Array.isArray(data)) {
      data.forEach((store) => {
        const storeName = store?.storeName
        if (storeName && dataMap.get(date)) {
          dataMap.get(date)[storeName] =
            (dataMap.get(date)[storeName] || 0) +
            (store.availableForPickup || 0)
        }
      })
    }
  })

  const formattedData = Array.from(dataMap.values())
  const ws = XLSX.utils.json_to_sheet(formattedData)
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const dataFile = new Blob([excelBuffer], { type: fileType })
  saveAs(dataFile, 'Admin_Report' + fileExtension)
}
