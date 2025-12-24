import React, { useState } from "react";
import CustomerFormDetails from "../CustomerFormDetails";

const QuotesCreatedAdminTable = ({ currentPage, tableData }) => {
  const [showModal, setShowModal] = useState(false);
  const [QNAData, setQNAData] = useState([]);

  const handleDetailsClick = (value) => {
    setQNAData(value.lead.QNA);
    setShowModal(true);
  };
  function getUserFullName(user) {
    if (!user) {
      return "";
    }

    if (user.firstName) {
      return user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName;
    }

    return user.name || "";
  }

  const handleCloseModal = () => {
    setShowModal(false);
  };
  return (
    <div>
      <div className="m-2  md:m-5 overflow-x-auto">
        <table className="w-[220vh]  border border-primary">
          <thead className="bg-primary text-white">
            <tr className="align-top">
              <th className="p-2 text-sm md:p-3 md:text-base align-top">
                Date
              </th>
              <th className="p-2 text-sm md:p-3 md:text-base">Username</th>
              <th className="p-2 text-sm md:p-3 md:text-base">Category</th>
              <th className="p-2 text-sm md:p-3 md:text-base">Product Name</th>
              <th className="p-2 text-sm md:p-3 md:text-base">Variant</th>
              <th className="p-2 text-sm md:p-3 md:text-base min-w-[160px] ">
                Final Price Offered to Customer
              </th>
              <th className="p-2 text-sm md:p-3 md:text-base">Unique Id</th>
              <th className="p-2 text-sm md:p-3 md:text-base">Customer Name</th>
              <th className="p-2 text-sm md:p-3 md:text-base">
                Customer Mobile
              </th>
              <th className="p-2 text-sm md:p-3 md:text-base">
                Customer Email
              </th>
              <th className="p-2 text-sm md:p-3 md:text-base">More Details</th>
            </tr>
          </thead>
          <tbody>
            {tableData !== undefined &&
              tableData.map((data, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-200" : ""}
                >
                  <td className="p-2 text-sm text-center md:p-3 md:text-base">
                    {new Date(data?.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-2 text-sm text-center md:p-3 md:text-base">
                    {getUserFullName(data?.user)}
                  </td>
                  <td className="p-2 text-sm text-center md:p-3 md:text-base">
                    Mobile
                  </td>
                  <td className="p-2 text-sm text-center md:p-3 md:text-base min-w-[200px]">
                    {data.lead?.model?.name}
                  </td>
                  <td className="p-2 text-sm text-center md:p-3 min-w-[150px] md:text-base">
                    {data?.lead?.ram
                      ? `${data?.lead?.ram}/${data?.lead?.storage}`
                      : data?.lead?.storage}
                  </td>
                  <td className="p-2 text-sm min-w-[100px] text-center md:p-3 md:text-base">
                    {data.lead?.price}
                  </td>
                  <td className="p-2 text-sm text-center md:p-3 md:text-base">
                    {data.lead?.uniqueCode}
                  </td>
                  <td className="p-2 text-sm min-w-[200px] text-center md:p-3 md:text-base">
                    {data.lead?.name}
                  </td>
                  <td className="p-2 text-sm text-center md:p-3 md:text-base">
                    {data.lead?.phoneNumber}
                  </td>
                  <td className="p-2 text-sm text-center md:p-3 md:text-base">
                    {data.lead?.emailId}
                  </td>

                  <td className="cursor-pointer p-2 text-sm text-center md:p-3 md:text-base">
                    <p
                      onClick={() => handleDetailsClick(data)}
                      className="cursor-pointer "
                    >
                      Details
                    </p>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center ">
            <div className="relative p-4 mx-auto bg-white rounded shadow-lg modal-container w-96">
              <div className="modal-content ">
                <CustomerFormDetails
                  QNAData={QNAData}
                  closeModal={handleCloseModal}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotesCreatedAdminTable;
