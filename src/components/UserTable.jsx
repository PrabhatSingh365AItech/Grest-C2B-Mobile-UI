import React, { useState } from "react";
import CustomerFormDetails from "./CustomerFormDetails";
import CustomerImageDetails from "./CustomerImageDetails";

const UserTable = ({ data }) => {
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [QNAData, setQNAData] = useState([]);
  const dataIndex = null;
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

  function getDeviceDetails(val) {
    if (!val || !val.lead || !val.lead.model) {
      return "-";
    }

    if (val.lead.model.type === "CTG1") {
      if (val.lead.ram) {
        return `${val.lead.ram}/${val.lead.storage}`;
      }
      return val.lead.storage;
    }

    return "-";
  }

  const handleDetailsClick = (value) => {
    setQNAData(value?.lead?.QNA);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowImageModal(false);
  };

  return (
    <div className="m-2 overflow-x-auto md:m-5">
      <table className="w-full border border-primary">
        <thead className="bg-primary text-white">
          <tr className="align-top">
            <th className="p-2 text-sm md:p-3 md:text-base">Date</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Username</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Category</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Product name</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Variant</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Price</th>
            <th className="p-2 text-sm md:p-3 md:text-base min-w-[160px]">
              Final Price Offered to Customer
            </th>
            <th className="p-2 text-sm md:p-3 md:text-base">Unique id</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Customer Name</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Customer Mobile</th>
            <th className="p-2 text-sm md:p-3 md:text-base">
              Customer email id
            </th>

            <th className="p-2 text-sm md:p-3 md:text-base">More Details</th>
          </tr>
        </thead>
        <tbody>
          {data.map((val, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-gray-200" : ""}>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {new Date(val?.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {getUserFullName(val?.user)}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {val?.categoryInfo?.categoryName}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base min-w-[200px]">
                {val?.lead?.model?.name}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base min-w-[170px]">
                {getDeviceDetails(val)}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {val?.lead?.actualPrice}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {val?.lead?.price}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {val?.lead?.uniqueCode}
              </td>
              <td className="p-2  min-w-[200px] text-sm text-center md:p-3 md:text-base">
                {val?.lead?.name}
              </td>
              <td className="p-2  min-w-[200px] text-sm text-center md:p-3 md:text-base">
                {val?.lead?.phoneNumber}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {val?.lead?.emailId}
              </td>

              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                <p
                  onClick={() => handleDetailsClick(val)}
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
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center ">
          <div className="relative p-4 mx-auto bg-white rounded shadow-lg modal-container w-96">
            <div className="modal-content ">
              <CustomerImageDetails
                imageData={data[dataIndex]}
                closeModal={handleCloseModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
