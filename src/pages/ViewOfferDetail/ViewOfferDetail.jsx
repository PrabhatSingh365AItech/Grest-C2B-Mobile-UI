import React, { useState } from "react";
import AdminNavbar from "../../components/Admin_Navbar";
import SideMenu from "../../components/SideMenu";
import ViewOfferDetailTable from "../../components/ViewOfferDetailTable/ViewOfferDetailTable";
import { useNavigate } from "react-router-dom";
import { IoMdAdd, IoMdSearch } from "react-icons/io";
import * as XLSX from "xlsx";
import axios from "axios";
import styles from "../CompanyListingDetails/CompanyListingDetails.module.css";
import { IoRefresh } from "react-icons/io5";
import { FaDownload } from "react-icons/fa";

const ViewOfferDetail = () => {
  const [sideMenu, setsideMenu] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const navigate = useNavigate();

  const downloadExcelViewOffer = (apiData) => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const formattedData = apiData.map((item) => {
      return {
        "Offer Name": item.offerName,
        Price: item.price,
        "Valid From": new Date(item.validFrom).toLocaleDateString("en-In"),
        "Valid To": new Date(item.validTo).toLocaleDateString("en-In"),
        "Created By": item.createdBy,
        Warranty: item.warranty,
      };
    });

    const wsViewOffer = XLSX.utils.json_to_sheet(formattedData);
    const wbViewOffer = { Sheets: { data: wsViewOffer }, SheetNames: ["data"] };
    const excelBufferViewOffer = XLSX.write(wbViewOffer, {
      bookType: "xlsx",
      type: "array",
    });

    const dataFileViewOffer = new Blob([excelBufferViewOffer], {
      type: fileType,
    });
    saveAs(dataFileViewOffer, "Offers data" + fileExtension);
  };

  const fetchDownloadDataViewOffer = () => {
    const userToken = sessionStorage.getItem("authToken");

    axios
      .get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/offer/getOfferList`,
        {
          headers: {
            authorization: `${userToken}`,
          },
        }
      )
      .then((res) => {
        console.log(res.data);
        downloadExcelViewOffer(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSearchClear = () => {
    setSearchValue("");
  };

  return (
    <div>
      <div className="navbar">
        <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      </div>
      <div>
        <div className="m-2 flex flex-col gap-2 items-center w-[100%]">
          <div className="flex gap-2 items-center justify-center outline-none mt-5 w-[100%]">
            <button
              className={`${styles.bulkdown_button}`}
              onClick={() => {
                sessionStorage.setItem("rowData", JSON.stringify({}));
                sessionStorage.setItem("offerUserName", "");
                navigate("/offers");
              }}
            >
              <IoMdAdd size={24} /> Add Offer
            </button>

            <div className={`${styles.search_bar_wrap}`}>
              <input
                onChange={(e) => setSearchValue(e.target.value)}
                className="text-sm"
                type="text"
                placeholder="Search..."
                value={searchValue}
              />
              <IoMdSearch size={25} />
            </div>
            <div className={styles.icons_box}>
              <IoRefresh onClick={handleSearchClear} className="" size={25} />
            </div>
            <button
              className={`${styles.bulkdown_button}`}
              onClick={fetchDownloadDataViewOffer}
            >
              <FaDownload /> Bulk Download
            </button>
          </div>
        </div>

        <ViewOfferDetailTable
          setSearchValue={setSearchValue}
          searchValue={searchValue}
        />
      </div>
    </div>
  );
};

export default ViewOfferDetail;
