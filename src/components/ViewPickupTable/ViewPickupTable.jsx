import React, { useEffect, useState } from 'react'
import { IoClose } from 'react-icons/io5'
import { BeatLoader } from 'react-spinners'
import axios from 'axios'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { FaDownload } from 'react-icons/fa6'
import styles from './ViewPickupTable.module.css'

const ViewPickupTable = ({ refNo, setShowView, fromOutStand = false }) => {
  const [viewData, setViewData] = useState([])
  const [isTableLoaded, setIsTableLoaded] = useState(false)

  useEffect(() => {
    setIsTableLoaded(true)
    const token = sessionStorage.getItem('authToken')

    const config = {
      method: 'get',
      url: fromOutStand
        ? `${
            import.meta.env.VITE_REACT_APP_ENDPOINT
          }/api/outstanding/devices/${refNo}`
        : `${
            import.meta.env.VITE_REACT_APP_ENDPOINT
          }/api/pickupDevices/devices/${refNo}`,
      headers: { Authorization: token },
    }
    axios
      .request(config)
      .then((response) => {
        console.log(response.data.data)
        setViewData(response.data.data)
        setIsTableLoaded(false)
      })
      .catch((error) => {
        console.log(error)
        setIsTableLoaded(false)
      })
  }, [refNo])

  const closeHandler = () => {
    setShowView(false)
  }

  const downloadExcel = () => {
    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    const fileExtension = '.xlsx'

    const formattedData = viewData.map((item) => {
      return {
        'Lead Id': item.leadsData._id,
        'Lot Id': refNo,
        Date: new Date(item.leadsData.createdAt).toLocaleDateString('en-GB'),
        'Device Name': item.modelName,
        'IMEI No': item.leadsData.modelId,
        'Model Id': item.leadsData.modelId,
        Storage: item.leadsData.storage,
        Price: item.leadsData.price,
        Location: item.location,
      }
    })

    const ws = XLSX.utils.json_to_sheet(formattedData)
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

    const dataFile = new Blob([excelBuffer], { type: fileType })
    saveAs(dataFile, 'Devices_In_Lots_Data' + fileExtension)
  }

  return (
    <div className='flex flex-col'>
      <div className='flex flex-row m-3 items-center'>
        <p className='font-medium opacity-0'>{'Ref No: ' + refNo}</p>
        <IoClose
          size={25}
          className='absolute right-3 text-primary transition ease hover:rotate-[360deg] duration-500'
          onClick={closeHandler}
        />
      </div>
      {isTableLoaded && (
        <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <BeatLoader
            color='var(--primary-color)'
            loading={isTableLoaded}
            size={15}
          />
        </div>
      )}
      <button className={`${styles.bulkdown_button}`} onClick={downloadExcel}>
        <FaDownload /> Bulk Download
      </button>
      <div className='overflow-x-auto m-1'>
        <table className='w-full border border-primary'>
          <thead className='bg-primary text-white'>
            <tr>
              <th className='p-2 min-w-[100px] text-sm md:p-3 md:text-base'>
                Date
              </th>
              <th className='p-2 min-w-[100px] text-sm md:p-3 md:text-base'>
                Device Name
              </th>
              <th className='p-2 min-w-[100px] text-sm md:p-3 md:text-base'>
                RAM
              </th>
              <th className='p-2 min-w-[100px] text-sm md:p-3 md:text-base'>
                Storage
              </th>
              <th className='p-2 min-w-[100px] text-sm md:p-3 md:text-base'>
                IMEI Number
              </th>
              <th className='p-2 min-w-[100px] text-sm md:p-3 md:text-base'>
                Final Price
              </th>
              <th className='p-2 min-w-[100px] text-sm md:p-3 md:text-base'>
                Location
              </th>
            </tr>
          </thead>
          <tbody>
            {viewData.map((val, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-200' : ''}>
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {new Date(val.leadsData.createdAt).toLocaleDateString(
                    'en-GB'
                  )}
                </td>
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {val?.modelName}
                </td>
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {
                    val?.ramConfig.filter(
                      (i) => i.storage === val.leadsData.storage
                    )[0]?.RAM
                  }
                </td>
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {val?.leadsData.storage ? val.leadsData.storage : '512 GB'}
                </td>
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {val?.imei}
                </td>
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {val?.leadsData.price?.toString()[0] === '['
                    ? val?.leadsData.price.$numberDecimal
                    : val?.leadsData.price?.toString()}
                </td>
                <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                  {val?.location}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ViewPickupTable
