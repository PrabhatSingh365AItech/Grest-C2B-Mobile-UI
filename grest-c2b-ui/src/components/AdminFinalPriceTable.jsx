import React from "react";
import { useSelector } from "react-redux";
const AdminFinalPriceTable = () => {
  const adminAnswer = useSelector((state) => state.adminGradePrice);
  const selectedDevice = JSON.parse(sessionStorage.getItem("selectedDevice"));
  console.log(adminAnswer);
  const category = sessionStorage.getItem("admincategory");
  const calculatedAdminPrice = sessionStorage.getItem("calculatedAdminPrice");

  return (
    <div className="m-2  w-[90%] overflow-x-auto md:m-5 ">
      <table className="w-full border-2 border-[#EC2752]  ">
        <thead className="text-white bg-[#EC2752]">
          <tr>
            <th className="p-2 text-sm md:p-3 md:text-base">Groups</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Values</th>
          </tr>
        </thead>
        {category === "CTG1" && (
          <tbody>
            <tr className="bg-gray-200 ">
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                Model Name
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {selectedDevice.name}
              </td>
            </tr>
            <tr className="bg-gray-200 ">
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                RAM
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {selectedDevice?.selectedConfig?.RAM}
              </td>
            </tr>
            <tr className="bg-gray-200 ">
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                Storage
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {selectedDevice?.selectedConfig?.storage}
              </td>
            </tr>
            {/* <tr className="bg-gray-200 ">
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                Warranty
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {adminAnswer?.Warranty}
              </td>
            </tr>
            <tr>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                Core
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {adminAnswer?.Core}
              </td>
            </tr>
            <tr className="bg-gray-200">
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                Display
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {adminAnswer?.Display}
              </td>
            </tr>
            <tr>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                Major Functions
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {adminAnswer?.Functional_major}
              </td>
            </tr>
            <tr className="bg-gray-200">
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                Minor Functions
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {adminAnswer?.Functional_minor}
              </td>
            </tr>
            <tr>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                Cosmetics
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {adminAnswer?.Cosmetics}
              </td>
            </tr>
            <tr className="bg-gray-200">
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                Final Grade
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {result?.grade}
              </td>
            </tr> */}
            <tr>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                Pricing
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                ₹{parseInt(calculatedAdminPrice)}
              </td>
            </tr>
          </tbody>
        )}
      </table>
    </div>
  );
};

export default AdminFinalPriceTable;
