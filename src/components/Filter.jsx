import React, { useState } from "react";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";

const Filter = ({ data, setTableDataDup }) => {
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerEmailId, setCustomerEmailId] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [productName, setProductName] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearch = () => {
    const res = data.filter(
      (val) =>
        (customerName === "" ||
          val?.userId?.name
            .toLowerCase()
            .includes(customerName.toLowerCase())) &&
        (customerId === "" || val?.userId?._id.includes(customerId)) &&
        (customerEmailId === "" ||
          val?.userId?.email
            .toLowerCase()
            .includes(customerEmailId.toLowerCase())) &&
        (customerMobile === "" || val?.phoneNumber.includes(customerMobile)) &&
        (productName === "" ||
          val?.modelId?.name.toLowerCase().includes(productName.toLowerCase()))
    );
    setTableDataDup(res);
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <div className="p-4 rounded-lg w-full sm:1/2 md:w-2/3 lg:w-1/2  mx-auto">
      <button
        className="text-2xl font-semibold  cursor-pointer"
        onClick={toggleFilter}
      >
        Filter Data
        {isFilterOpen ? (
          <RiArrowUpSLine className="inline-block text-xl" />
        ) : (
          <RiArrowDownSLine className="inline-block text-xl" />
        )}
      </button>
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${
          isFilterOpen ? "" : "hidden"
        }`}
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm  font-medium text-gray-600"
          >
            Customer Name
          </label>
          <input
            id="name"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md"
          />
        </div>
        <div>
          <label
            htmlFor="customerId"
            className="block text-sm font-medium text-gray-600"
          >
            Customer Id
          </label>
          <input
            id="customerId"
            type="text"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-600"
          >
            Customer Email
          </label>
          <input
            id="email"
            type="text"
            value={customerEmailId}
            onChange={(e) => setCustomerEmailId(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md"
          />
        </div>
        <div>
          <label
            htmlFor="mobile"
            className="block text-sm font-medium text-gray-600"
          >
            Customer Mobile No.
          </label>
          <input
            id="mobile"
            type="text"
            value={customerMobile}
            onChange={(e) => setCustomerMobile(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md"
          />
        </div>
        <div>
          <label
            htmlFor="productName"
            className="block text-sm font-medium text-gray-600"
          >
            Product Name
          </label>
          <input
            id="productName"
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md"
          />
        </div>
        <div className="md:col-span-2 text-center">
          <button
            onClick={handleSearch}
            className="bg-primary font-bold text-white rounded-md p-2 w-1/2 mx-auto focus:outline-none"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filter;
