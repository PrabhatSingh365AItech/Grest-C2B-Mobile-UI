import styles from "./LiquidatorListingTable.module.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BeatLoader } from "react-spinners";
import {
  IoIosCheckmarkCircle,
  IoIosCloseCircle,
  IoMdAdd,
  IoMdSearch,
} from "react-icons/io";
import { IoRefresh } from "react-icons/io5";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaDownload } from "react-icons/fa6";

import AdminNavbar from "../../components/Admin_Navbar";
import SideMenu from "../../components/SideMenu";
import LiquidatorEdit from "../../components/LiquidatorEdit/LiquidatorEdit";
import { useNavigate } from "react-router-dom";

const succTextColor = "text-green-500";
const failTextColor = "text-[#EC2752]";

const downloadExcel = (dataDown, curPage) => {
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";

  const formattedData = dataDown.map((item) => {
    return {
      "Company Name": item?.name,
      "Unique Code": item?.uniqueCode,
      Email: item.email,
      "Phone Number": item.phoneNumber,
      "Created At": new Date(item.createdAt).toLocaleDateString("en-GB"),
      Address: item.address,
    };
  });

  const wss = XLSX.utils.json_to_sheet(formattedData);
  const wbb = { Sheets: { data: wss }, SheetNames: ["data"] };
  const excelBufferr = XLSX.write(wbb, { bookType: "xlsx", type: "array" });
  const dataFile = new Blob([excelBufferr], { type: fileType });
  saveAs(dataFile, `Liquidators_Data_${curPage}${fileExtension}`);
};

const LiquidatorListingTable = () => {
  const token = sessionStorage.getItem("authToken");
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [liquidatorEditData, setLiquidatorEditData] = useState();
  const [searchValue, setSearchValue] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);
  const [editBoxOpen, setEditBoxOpen] = useState(false);
  const [selectedStr, setSelectedStr] = useState();
  const [curPage, setCurPage] = useState(0);
  const [sucBox, setSucBox] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [confBox, setConfBox] = useState(false);
  const [failBox, setFailBox] = useState(false);
  const [uploadBox, setUploadBox] = useState(false);

  const getData = () => {
    setIsTableLoaded(true);
    const config = {
      method: "get",
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/liquidators/findall?limit=10&page=${curPage}&search`,
      headers: { Authorization: token },
    };
    axios
      .request(config)
      .then((response) => {
        console.log(response.data.data);
        setData(response.data.data);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        console.log(error);
        setErrMsg("Failed to load data");
        setFailBox(true);
        setIsTableLoaded(false);
      });
  };

  const getDataBySearch = () => {
    setIsTableLoaded(true);
    if (searchValue === "") {
      setIsTableLoaded(false);
      setErrMsg("Search Box is empty");
      setFailBox(true);
      return;
    }
    const config = {
      method: "get",
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/liquidators/findAll?page=${0}&limit=999&search=${searchValue}`,
      headers: { Authorization: token },
    };
    axios
      .request(config)
      .then((response) => {
        setData(response.data.data);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        setErrMsg("Failed to load data");
        setFailBox(true);
        setIsTableLoaded(false);
      });
  };
  useEffect(() => {
    getData();
  }, [curPage]);

  const handleSearchClear = () => {
    getData();
    setSearchValue("");
  };
  useEffect(() => {
    if (editSuccess) {
      if (searchValue === "") {
        getData();
      } else {
        getDataBySearch();
      }
      setErrMsg("Succesfully updated liquidator details");
      setSucBox(true);
      setEditSuccess(false);
      setEditBoxOpen(false);
    }
  }, [editSuccess]);

  const editHandler = (liquidatorData) => {
    setLiquidatorEditData(liquidatorData);
    setEditBoxOpen(true);
  };

  const deleteConfHandler = (liquidatorData) => {
    setConfBox(true);
    setSelectedStr(liquidatorData);
  };

  return (
    <div className={`${styles.pickedup_page}`}>
      <ExtComps
        sucBox={sucBox}
        errMsg={errMsg}
        setSucBox={setSucBox}
        isTableLoaded={isTableLoaded}
        setIsTableLoaded={setIsTableLoaded}
        failBox={failBox}
        setFailBox={setFailBox}
        confBox={confBox}
        setConfBox={setConfBox}
        setErrMsg={setErrMsg}
        editBoxOpen={editBoxOpen}
        setEditBoxOpen={setEditBoxOpen}
        uploadBox={uploadBox}
        setUploadBox={setUploadBox}
        searchValue={searchValue}
        liquidatorEditData={liquidatorEditData}
        setEditSuccess={setEditSuccess}
        selectedStr={selectedStr}
        getData={getData}
        getDataBySearch={getDataBySearch}
      />
      <div className="m-2 flex flex-col gap-2 items-center w-[100%]">
        <div className="flex gap-2 items-center justify-center outline-none mt-5 w-[100%]">
          <button
            className={`${styles.bulkdown_button}`}
            onClick={() => {
              navigate("/liquidatorlisting");
            }}
          >
            <IoMdAdd /> Add Liquidator
          </button>
          {/* <button
            className={`${styles.bulkdown_button}`}
            onClick={sampleDownloadHandler}
          >
            <FaDownload /> Download Sample
          </button>
          <button
            className={`${styles.bulkdown_button}`}
            onClick={() => {
              setUploadBox(true);
            }}
          >
            <FaUpload /> Bulk upload
          </button> */}
          <div className={`${styles.search_bar_wrap}`}>
            <input
              onChange={(e) => setSearchValue(e.target.value)}
              className="text-sm"
              type="text"
              value={searchValue}
              placeholder="Search liquidator Name/Email/Id"
            />
            <IoMdSearch  size={25}  onClick={() => getDataBySearch()}/>
          </div>
          <div className={styles.icons_box}>
            <IoRefresh  size={25} onClick={handleSearchClear} className="" />
          </div>
          <button
            onClick={() => downloadExcel(data, curPage)}
            className={`${styles.bulkdown_button}`}
          >
            <FaDownload /> Bulk Download
          </button>
        </div>
      </div>
      <LiquidatorTable
        data={data}
        searchValue={searchValue}
        curPage={curPage}
        setCurPage={setCurPage}
        setIsTableLoaded={setIsTableLoaded}
        editHandler={editHandler}
        deleteConfHandler={deleteConfHandler}
      />
    </div>
  );
};
export default LiquidatorListingTable;

const ExtComps = ({
  sucBox,
  errMsg,
  setSucBox,
  isTableLoaded,
  setIsTableLoaded,
  failBox,
  setFailBox,
  confBox,
  setConfBox,
  setErrMsg,
  editBoxOpen,
  setEditBoxOpen,
  uploadBox,
  setUploadBox,
  searchValue,
  liquidatorEditData,
  setEditSuccess,
  selectedStr,
  getData,
  getDataBySearch,
}) => {
  const utoken = sessionStorage.getItem("authToken");
  const [sideMenu, setsideMenu] = useState(false);
  const [file, setFile] = useState(null);

  const deleteHandler = (id) => {
    setIsTableLoaded(true);
    setConfBox(false);

    const config = {
      method: "put",
      url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/liquidators/delete`,
      headers: {
        Authorization: utoken,
      },
      data: { id },
    };
    axios
      .request(config)
      .then((response) => {
        if (searchValue === "") {
          getData();
        } else {
          getDataBySearch();
        }
        setSucBox(true);
        setErrMsg(`Succesfully deleted liquidator`);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        setErrMsg("Failed to deleted liquidator");
        setIsTableLoaded(false);
        setFailBox(true);
      });
  };


  const handleBulkSubmit = (event) => {
    event.preventDefault();
    setIsTableLoaded(true);
    const formData = new FormData();
    formData.append("file", file);
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/liquidators/uploadStores`,
        formData,
        {
          headers: {
            Authorization: utoken,
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((res) => {
        setErrMsg("Succesfully uploaded liquidators data");
        getData();
        setIsTableLoaded(false);
        setSucBox(true);
      })
      .catch((error) => {
        console.log(error);
        setFailBox(true);
        setErrMsg("Failed to upload liquidator data");
        setIsTableLoaded(false);
      });
  };
  const handleExcelFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };
  return (
    <React.Fragment>
      {editBoxOpen && (
        <div className={`${styles.edit_page}`}>
          <LiquidatorEdit
            setEditSuccess={setEditSuccess}
            setEditBoxOpen={setEditBoxOpen}
            liquidatorData={liquidatorEditData}
          />
        </div>
      )}
      <div className="flex items-center py-4  w-screen border-b-2h-16 bg-white HEADER ">
        <div className="navbar">
          <AdminNavbar setsideMenu={setsideMenu}  sideMenu={sideMenu}/>
          <SideMenu sideMenu={sideMenu} setsideMenu={setsideMenu} />
        </div>
      </div>
      {sucBox && (
        <div className="fixed top-0 left-0 z-50  w-full  flex items-center justify-centerh-full bg-black bg-opacity-50">
          <div className={`${styles.err_mod_box} ${succTextColor}`}>
            <IoIosCheckmarkCircle  size={90}  className={succTextColor}/>
            <h6 className={succTextColor}>Success!</h6>
            <p className="text-slate-500">{errMsg}</p>
            <button
              className={"bg-green-500 text-white"}
              onClick={() => setSucBox(false)}
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {failBox && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className={`${styles.err_mod_box}   ${failTextColor}`}>
            <IoIosCloseCircle className={failTextColor} size={90} />
            <h6 className={failTextColor}>Error!</h6>
            <p className="text-slate-500">{errMsg}</p>
            <button
                className={"text-white bg-[#EC2752]"}
              onClick={() => {
                setFailBox(false);
              }}
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {confBox && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className={`${styles.err_mod_box} ${failTextColor}`}>
            <h6 className={failTextColor}>Confirmation!</h6>
            <p className="text-slate-500">{`Do you want to delete liquidator ${selectedStr?.name} ?`}</p>
            <div className="flex flex-row gap-2">
              <button
                onClick={() => deleteHandler(selectedStr?._id)}
                className={"bg-[#EC2752] text-white"}
              >
                Okay
              </button>
              <button
                onClick={() => {
                  setConfBox(false);
                  setIsTableLoaded(false);
                }}
                className="bg-white text-[#EC2752]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {uploadBox && (
        <BulkUploadBox
          handleBulkSubmit={handleBulkSubmit}
          handleExcelFileChange={handleExcelFileChange}
          setUploadBox={setUploadBox}
          setIsTableLoaded={setIsTableLoaded}
        />
      )}
      {isTableLoaded && (
        <div className="fixed top-0 left-0 z-49 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <BeatLoader color={"#EC2752"} loading={isTableLoaded} size={15} />
        </div>
      )}
    </React.Fragment>
  );
};

const BulkUploadBox = ({
  handleBulkSubmit,
  handleExcelFileChange,
  setUploadBox,
  setIsTableLoaded,
}) => {
  return (
    <div className="fixed top-0 left-0 z-48 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
      <div className={`${styles.err_mod_box} ${failTextColor}`}>
        <h6 className={failTextColor}>Bulk Upload Liquidators Price</h6>
        <form className="flex flex-col gap-4" onSubmit={handleBulkSubmit}>
          <div className="flex flex-col">
            <p className="mb-1 text-lg items-start text-slate-500">
              Upload Liquidators Price Data Excel
            </p>
            <input
              type="file"
              name="excelFile"
              id="excelFile"
              accept=".xlsx, .xls"
              onChange={(e) => handleExcelFileChange(e)}
              required={true}
            />
          </div>
          <div className="flex flex-row gap-2">
            <button type="submit" className={"bg-[#EC2752] text-white"}>
              Upload
            </button>
            <button
              type="reset"
              onClick={() => {
                setUploadBox(false);
                setIsTableLoaded(false);
              }}
              className="bg-white text-[#EC2752]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LiquidatorTable = ({
  data,
  curPage,
  setCurPage,
  searchValue,
  editHandler,
  setIsTableLoaded,
  deleteConfHandler,
}) => {


  const prevHandler = () => {
    setIsTableLoaded(true);
    if (curPage !== 0 && searchValue === "") {
      const temp = curPage - 1;
      setCurPage(temp);
    } else {
      setIsTableLoaded(false);
    }
  };
  const nextHandler = () => {
    setIsTableLoaded(true);
    if (data.length >= 10 && searchValue === "") {
      const temp = curPage + 1;
      setCurPage(temp);
    } else {
      setIsTableLoaded(false);
    }
  };
  return (
    <div className={`${styles.pd_cont}`}>
      <div className="m-2 overflow-x-auto md:m-5">
        <table className=" border-[#EC2752] w-full border ">
          <thead className="bg-[#EC2752] text-white">
            <tr>
              <th className="text-sm p-2 md:text-base md:p-3">Action</th>
              <th className="text-sm p-2 md:text-base md:p-3">Company Name</th>
              <th className="text-sm p-2 md:text-base md:p-3">Unique Code</th>
              <th className="text-sm p-2 md:text-base md:p-3">Email</th>
              <th className="text-sm p-2 md:text-base md:p-3">Phone Number</th>
              <th className="text-sm p-2 md:text-base md:p-3">Address</th>
            </tr>
          </thead>
          <tbody>
            {data.map((val, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-200 " : ""}>
                <td className=" text-center  text-sm p-2 md:p-3 md:text-base">
                  <div className="flex flex-col  gap-1">
                    <button
                        className={`${styles.view_btn}`}
                      onClick={() => {
                        editHandler(val);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className={`${styles.acpt_btn}`}
                      onClick={() => {
                        deleteConfHandler(val);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
                <td className="p-2 text-sm  md:text-base text-center md:p-3">
                  {val?.name}
                </td>
                <td className="p-2 text-sm  md:text-base text-center md:p-3">
                  {val?.uniqueCode}
                </td>
                <td className="p-2 text-sm  md:text-base text-center md:p-3">
                  {val?.email}
                </td>
                <td className="p-2 text-sm  md:text-base text-center md:p-3">
                  {val?.phoneNumber}
                </td>
                <td className="p-2 text-sm  md:text-base text-center md:p-3">
                  {val?.address}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-row justify-center items-center gap-2 mb-5">
        <button
          className={` py-2 ${styles.view_btn} text-lg px-6`}
          onClick={prevHandler}
        >
          Previous
        </button>
        <button
          onClick={nextHandler}
          className={`${styles.acpt_btn} text-lg px-6 py-2`}
        >
          Next
        </button>
      </div>
    </div>
  );
};
