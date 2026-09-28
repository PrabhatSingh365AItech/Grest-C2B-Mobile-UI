import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const processQNAData = (qnaArray) => {
  const questionData = {}
  let index = 1

  if (!qnaArray?.[0] || typeof qnaArray[0] !== 'object') {
    return questionData
  }

  for (const group in qnaArray[0]) {
    if (Array.isArray(qnaArray[0][group])) {
      qnaArray[0][group].forEach((qna) => {
        questionData[`Q${index}. ${qna?.quetion}`] = qna?.key
        index++
      })
    }
  }

  return questionData
}

const processDeviceReport = (deviceReport) => {
  if (!deviceReport || typeof deviceReport !== 'object') {
    return 'N/A'
  }

  const selectedIssues = Object.entries(deviceReport)
    .filter(
      ([, value]) => value === true || value === 'Yes' || value === 'true',
    )
    .map(([key]) => key)

  return selectedIssues.length > 0 ? selectedIssues.join(', ') : 'No Issues'
}

const getVariantInfo = (val) => {
  if (val?.modelId?.type === 'CTG1') {
    return `${
      val?.storage && val?.ram ? `${val?.ram}/${val?.storage}` : val?.storage
    }`
  }
  return '-'
}

export const downloadExcelLeadsompleted = (apiData) => {
  const fileType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  const fileExtension = '.xlsx'

  const formattedData = apiData.map((item) => {
    const questionData = processQNAData(item?.QNA)
    const deviceReportSummary = processDeviceReport(item.deviceReport)

    return {
      'Date Created': new Date(item?.updatedAt).toLocaleDateString('en-IN'),
      'Company Name':
        item.companyId?.name || item.store?.companyId?.name || 'N/A',
      'Purchase Grade': item.purchaseGrade || 'N/A',
      'Store Name.': item.store?.storeName || 'N/A',
      'Store user Mobile No.': item.phoneNumber,
      'User Email': item.userId?.email,
      'Customer Mobile No.': item.phoneNumber,
      'Customer Name': item.name,
      Product: item.modelId?.name,
      Variant: getVariantInfo(item),
      'Device Issues': deviceReportSummary,
      Price: item.actualPrice,
      'Final Price Offered to Customer': item?.price,
      'Order Id': item?.uniqueCode,
      'IMEI No.': item.documentId?.IMEI,
      ...questionData,
    }
  })

  const wsLeadsCompleted = XLSX.utils.json_to_sheet(formattedData)
  const wbLeadsCompleted = {
    Sheets: { data: wsLeadsCompleted },
    SheetNames: ['data'],
  }
  const excelBufferLeadsCompleted = XLSX.write(wbLeadsCompleted, {
    bookType: 'xlsx',
    type: 'array',
  })

  const dataFileLeadsCompleted = new Blob([excelBufferLeadsCompleted], {
    type: fileType,
  })
  saveAs(dataFileLeadsCompleted, 'Leads_Completed' + fileExtension)
}
