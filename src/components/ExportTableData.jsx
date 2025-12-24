import React from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { IoMdDownload } from "react-icons/io";

const ExportTableData = ({
  selecTime,
  currentTable,
  currentTableTotalCount,
}) => {
  const fetchData = async () => {
    try {
      let endpoint = "";
      if (currentTable === "prospect") {
        endpoint = `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/prospects/findAll?page=${0}&limit=${currentTableTotalCount}&filter=${selecTime}`;
      } else {
        endpoint = `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/prospects/findAllSelled?page=${0}&limit=${currentTableTotalCount}&filter=${selecTime}`;
      }
      const res = await axios.get(endpoint);
      downloadExcelFile(res.data.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };
  const downloadExcelFile = (apiData) => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";

    const fileExten = ".xlsx";
    const formattedData = apiData.map((elem) => {
      return {
        phoneNumber: elem.phoneNumber,
        "User Email": elem.userId?.email,
        "Customer Mobile No.": elem.phoneNumber,
        "Customer Name": elem.name,
        Product: elem.modelId?.name,
        Price: elem.actualPrice,
        "Prospect Id": elem.userId?._id,
        "IMEI No.": elem.documentId?.IMEI,
      };
    });

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    const dataFile = new Blob([excelBuffer], { type: fileType });
    saveAs(dataFile, "Table_Data" + fileExten);
  };
  return (
    <div>
      <button onClick={fetchData}>
        <IoMdDownload size={22} />
      </button>
    </div>
  );
};

export default ExportTableData;
