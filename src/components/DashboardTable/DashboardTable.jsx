import React from 'react'
import NoDataMessage from '../NoDataMessage'

const DashboardTable = ({ tableData }) => {
  const tablevalue = tableData?.total
  const hasData = tableData?.result && tableData.result.length > 0

  if (!hasData) {
    return <NoDataMessage />
  }

  return (
    <div className='m-2 md:m-5 '>
      <div className='w-full '>
        <table className='w-[100%] border border-primary'>
          <thead>
            <tr className='text-primary align-top bg-white '>
              <th className='p-2 text-sm md:p-3 md:text-base'>Total</th>

              <th className='p-2 text-sm md:p-3 md:text-base'>-</th>
              <th className='p-2 text-sm md:p-3 md:text-base'>
                {tablevalue?.totalAvailableForPickup || 0}
              </th>
              <th className='p-2 text-sm md:p-3 md:text-base'>
                {tablevalue?.totalPriceOfferToCustomer || 0}
              </th>
              <th className='p-2 text-sm md:p-3 md:text-base'>
                {tablevalue?.totalAvailableForPickup || 0}
              </th>
              <th className='p-2 text-sm md:p-3 md:text-base'>
                {tablevalue?.totalPriceOfferToCustomer || 0}
              </th>
              <th className='p-2 text-sm md:p-3 md:text-base'>
                {tablevalue?.totalPicked || 0}
              </th>

              <th className='p-2 text-sm md:p-3 md:text-base'>
                {tablevalue?.totalPickedPrice || 0}
              </th>
              <th className='p-2 text-sm md:p-3 md:text-base'>
                {tablevalue?.totalPendingForPickup || 0}
              </th>
              <th className='p-2 text-sm md:p-3 md:text-base'>
                {tablevalue?.totalPendingForPickupPrice || 0}
              </th>
            </tr>
            <tr className='bg-primary text-white align-top'>
              <th className='p-2 text-sm md:p-3 md:text-base'>Purchase Date</th>

              <th className='p-2 text-sm md:p-3 md:text-base'>Store Name</th>
              <th className='p-2 text-sm md:p-3 md:text-base'>
                Available for Pickup
              </th>
              <th className='p-2 text-sm md:p-3 md:text-base'>Store Price</th>
              <th className='p-2 text-sm md:p-3 md:text-base'>
                Total Available Devices
              </th>
              <th className='p-2 text-sm md:p-3 md:text-base'>
                Total Price Offered to Customer
              </th>
              <th className='p-2 text-sm md:p-3 md:text-base'>
                Picked from store
              </th>

              <th className='p-2 text-sm md:p-3 md:text-base'>
                Picked devices price
              </th>
              <th className='p-2 text-sm md:p-3 md:text-base'>
                Pendency of devices
              </th>
              <th className='p-2 text-sm md:p-3 md:text-base'>
                Pendency Payment
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.result.map((entry, index) => (
              <React.Fragment key={index}>
                {entry.data.map((store, storeIndex) => (
                  <tr
                    key={storeIndex}
                    className={index % 2 === 0 ? 'bg-gray-200' : ''}
                  >
                    {storeIndex === 0 ? (
                      <>
                        <td
                          className='p-2 text-sm text-center md:p-3 md:text-base'
                          rowSpan={entry.data.length}
                        >
                          {entry.date}
                        </td>
                      </>
                    ) : null}
                    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                      {store.storeName}
                    </td>
                    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                      {store.availableForPickup}
                    </td>
                    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
                      {store.price}
                    </td>
                    {storeIndex === 0 ? (
                      <>
                        <td
                          className='p-2 text-sm text-center md:p-3 md:text-base'
                          rowSpan={entry.data.length}
                        >
                          {entry.totalAvailableForPickup}
                        </td>
                        <td
                          className='p-2 text-sm text-center md:p-3 md:text-base'
                          rowSpan={entry.data.length}
                        >
                          {entry.priceOfferToCustomer}
                        </td>
                        <td
                          className='p-2 text-sm text-center md:p-3 md:text-base'
                          rowSpan={entry.data.length}
                        >
                          {entry.totalPicked}
                        </td>
                        <td
                          className='p-2 text-sm text-center md:p-3 md:text-base'
                          rowSpan={entry.data.length}
                        >
                          {entry.totalPickedPrice}
                        </td>
                        <td
                          className='p-2 text-sm text-center md:p-3 md:text-base'
                          rowSpan={entry.data.length}
                        >
                          {entry.pendingForPickup}
                        </td>
                        <td
                          className='p-2 text-sm text-center md:p-3 md:text-base'
                          rowSpan={entry.data.length}
                        >
                          {entry.pendingForPickupPrice}
                        </td>
                      </>
                    ) : null}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DashboardTable
