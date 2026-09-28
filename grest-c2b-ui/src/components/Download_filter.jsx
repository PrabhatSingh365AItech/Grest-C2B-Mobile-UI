import React from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function DownloadFilter({
  currentTable,
  currentTableTotalCount,
  saveparamSell,
  saveparamProspect,
}) {
  const fetchData = async (e) => {
    e.preventDefault();
    try {
      let endpoint = "";
      if (currentTable === "prospect") {
        endpoint = `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/prospects/findAll?page=${0}&limit=${currentTableTotalCount}&${saveparamProspect}`;
        console.log(endpoint);
      } else {
        endpoint = `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/prospects/findAllSelled?page=${0}&limit=${currentTableTotalCount}&${saveparamSell}`;
        console.log(endpoint);
      }
      const response = await axios.get(endpoint);
      downloadExcel(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const downloadExcel = (apiData) => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const formattedData = apiData.map((item) => {
      return {
        phoneNumber: item.phoneNumber,
        "User Email": item.userId?.email,
        "Customer Mobile No.": item.phoneNumber,
        "Customer Name": item.name,
        Product: item.modelId?.name,
        Price: item.actualPrice,
        "Prospect Id": item.userId?._id,
        "IMEI No.": item.documentId?.IMEI,
      };
    });

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    const dataFile = new Blob([excelBuffer], { type: fileType });
    saveAs(dataFile, "Table_filter_Data" + fileExtension);
  };

  return (
    <>
      <button
        onClick={fetchData}
        className="bg-primary relative top-5 font-bold text-white rounded-md p-2 h-[40px] w-1/2 focus:outline-none"
      >
        Download
      </button>
    </>
  );
}
export default DownloadFilter;
