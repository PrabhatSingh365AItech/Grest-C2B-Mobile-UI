import React, { useEffect, useRef, useState } from "react";
import NavigateTable from "../../components/NavigateTable/NavigateTable";
import axios from "axios";
import styles from "./OutStandingDevices.module.css";
import ProfileBox from "../../components/ProfileBox/ProfileBox";
const currentDomain = window.location.origin;
const DEFAULT_LOGO = "/Grest_Logo.jpg";
const BUYBACK_LOGO = "/Grest_Logo_2.jpg"; // Use your actual buyback logo

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL;
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO;
import ViewPickupTable from "../../components/ViewPickupTable/ViewPickupTable";
import { BeatLoader } from "react-spinners";
import {
  IoIosCheckmarkCircle,
  IoIosCloseCircle,
  IoMdSearch,
} from "react-icons/io";
import { IoRefresh } from "react-icons/io5";
import { BsCalendarDate } from "react-icons/bs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaAngleDown, FaDownload } from "react-icons/fa6";
import AdminNavbar from "../../components/Admin_Navbar";
import SideMenu from "../../components/SideMenu";
import { useDispatch, useSelector } from "react-redux";
import { setStoreFilter } from "../../store/slices/userSlice";

const succTextColor = "text-green-500";
const failTextColor = "text-primary";
const PayrollRej = "Payroll Approval Rejected";

const downloadExcel = (dataDown) => {
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";
  const formattedData = dataDown.map((item) => {
    return {
      "Lot Id": item._id,
      "Date Created": new Date(item.createdAt).toLocaleDateString("en-GB"),
      "Last Update": new Date(item.updatedAt).toLocaleDateString("en-GB"),
      Status: item.status,
      "Requested Status": item.request,
      "Total Amount": item.totalAmount,
      "Total Devices": item.totalDevice,
    };
  });

  const ws = XLSX.utils.json_to_sheet(formattedData);
  const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const dataFile = new Blob([excelBuffer], { type: fileType });
  saveAs(dataFile, "Outstanding_Devices_Lots_Data" + fileExtension);
};

const OutStandingDevices = () => {
  const token = sessionStorage.getItem("authToken");
  const userProfile = useSelector((state) => state.user);
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [data, setData] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [errorMsg, setErrorMsg] = useState("successfully updated status");
  const [tempId, setTempId] = useState();
  const [failMod, setFailMode] = useState(false);
  const [successMod, setSuccessMod] = useState(false);
  const [storeName, setStoreName] = useState(userProfile.selStore);
  const [confMod, setConfMod] = useState(false);
  const [storeData, setStoreData] = useState([]);
  const [region, setRegion] = useState(userProfile.selRegion);
  const [allStore, setAllStore] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const firsttime = useRef(true);

  const getData = () => {
    setIsTableLoaded(true);
    const conf = {
      method: "get",
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/outstanding/all?region=${region}&storeName=${storeName}`,
      headers: { Authorization: token },
    };
    axios
      .request(conf)
      .then((res) => {
        setData(res.data.data);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        setErrorMsg("Failed to load data");
        setFailMode(true);
        setIsTableLoaded(false);
      });
  };

  const getStore = () => {
    setIsTableLoaded(true);
    const conf = {
      method: "get",
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/store/findAll?page=0&limit=9999`,
      headers: { Authorization: token },
    };
    axios
      .request(conf)
      .then((res) => {
        const allData = res.data.result;
        const storeNames = res.data.result.map((store) => store.storeName);
        const uniqueRegions = [
          ...new Set(res.data.result.map((store) => store.region)),
        ];
        setStoreData(storeNames);
        setRegionData(uniqueRegions);
        setAllStore(allData);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        setIsTableLoaded(false);
      });
  };

  const getDataBySearch = () => {
    setIsTableLoaded(true);
    const conf = {
      method: "get",
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/outstanding/search?rid=${searchValue}&date=${dateValue}&region=${region}&storeName=${storeName}`,
      headers: { Authorization: token },
    };
    axios
      .request(conf)
      .then((res) => {
        setData(res.data.data);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        setErrorMsg(`Failed to load data -> ${error}`);
        setIsTableLoaded(false);
        setFailMode(true);
      });
  };

  useEffect(() => {
    if (!firsttime.current && !!storeName && !!region) {
      getDataBySearch();
    } else if (firsttime.current && !!storeName && !!region) {
      getStore();
      firsttime.current = false;
      getData();
    }
  }, [dateValue, storeName, region]);

  const confHandler = (id) => {
    setIsTableLoaded(true);
    setTempId(id);
    setConfMod(true);
  };

  return (
    <div className={`${styles.pickedup_page}`}>
      <ExtComps
        errorMsg={errorMsg}
        successMod={successMod}
        isTableLoaded={isTableLoaded}
        setSuccessMod={setSuccessMod}
        failMod={failMod}
        setIsTableLoaded={setIsTableLoaded}
        confMod={confMod}
        setFailMode={setFailMode}
        setErrorMsg={setErrorMsg}
        setConfMod={setConfMod}
        tempId={tempId}
        getData={getData}
        setTempId={setTempId}
      />
      <div className="flex flex-row m-2 gap-4"></div>
      <NavigateTable />
      <OutstandingFilter
        setSearchValue={setSearchValue}
        searchValue={searchValue}
        getDataBySearch={getDataBySearch}
        setDateValue={setDateValue}
        dateValue={dateValue}
        setRegion={setRegion}
        region={region}
        regionData={regionData}
        storeName={storeName}
        setStoreName={setStoreName}
        allStore={allStore}
        setStoreData={setStoreData}
        storeData={storeData}
        getData={getData}
        data={data}
      />
      <OutstandingTable
        data={data}
        confHandler={confHandler}
        setIsTableLoaded={setIsTableLoaded}
        getData={getData}
        setErrorMsg={setErrorMsg}
        setSuccessMod={setSuccessMod}
        setFailMode={setFailMode}
      />
    </div>
  );
};

export default OutStandingDevices;

const ExtComps = ({
  successMod,
  errorMsg,
  setSuccessMod,
  isTableLoaded,
  setIsTableLoaded,
  failMod,
  setFailMode,
  confMod,
  setConfMod,
  setErrorMsg,
  getData,
  tempId,
  setTempId,
}) => {
  const LoggedInUser = JSON.parse(sessionStorage.getItem("profile"));
  const userRole = LoggedInUser?.role || "";
  const [sideMenu, setsideMenu] = useState(false);
  const token1 = sessionStorage.getItem("authToken");
  const forwardReqHandler = (refID, newStatus) => {
    setIsTableLoaded(true);
    setConfMod(false);
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/outstanding/forwardreq`,
      headers: {
        Authorization: token1,
      },
      data: {
        refIDs: refID,
        newStatus: newStatus,
      },
    };
    axios
      .request(config)
      .then((response) => {
        setTempId();
        getData();
        setErrorMsg(`Successfully forwarded lot ${refID} to pending devices`);
        setIsTableLoaded(false);
        setSuccessMod(true);
      })
      .catch((error) => {
        setIsTableLoaded(false);
        setErrorMsg(`Failed to forward the request`);
        setFailMode(true);
      });
  };

  return (
    <React.Fragment>
      <div className="flex items-center w-screen border-b-2 py-4 h-16 bg-white HEADER ">
        {userRole === "Technician" ? (
          <div className="w-full flex items-center justify-between">
            <ProfileBox />
            <img src={GREST_LOGO} className="w-40" alt="app logo" />
          </div>
        ) : (
          <div className="navbar">
            <AdminNavbar sideMenu={sideMenu} setsideMenu={setsideMenu} />
            <SideMenu sideMenu={sideMenu} setsideMenu={setsideMenu} />
          </div>
        )}
      </div>
      {successMod && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center h-full w-full bg-black bg-opacity-50">
          <div className={`${styles.err_mod_box} ${succTextColor}`}>
            <IoIosCheckmarkCircle size={90} className={succTextColor} />
            <h6 className={succTextColor}>Success!</h6>
            <p className="text-slate-500">{errorMsg}</p>
            <button
              className={"bg-green-500 text-white"}
              onClick={() => {
                setSuccessMod(false);
              }}
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {failMod && (
        <div className="bg-black bg-opacity-50 fixed top-0 left-0 z-50 flex items-center justify-center h-full w-full ">
          <div className={`${failTextColor} ${styles.err_mod_box}`}>
            <IoIosCloseCircle className={failTextColor} size={90} />
            <h6 className={failTextColor}>Error!</h6>
            <p className="text-slate-500">{errorMsg}</p>
            <button
              className={"text-white bg-primary "}
              onClick={() => {
                setFailMode(false);
              }}
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {confMod && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center h-full w-full bg-black bg-opacity-50">
          <div className={`${failTextColor} ${styles.err_mod_box}`}>
            <h6 className={failTextColor}>Confirmation!</h6>
            <p className="text-slate-500">
              {`Do you want to update status of Lot - ${tempId} ?`}
            </p>
            <div className="flex flex-row gap-2">
              <button
                onClick={() => forwardReqHandler(tempId, "Request Forwarded")}
                className={"text-white bg-primary"}
              >
                Okay
              </button>
              <button
                className="bg-white text-primary"
                onClick={() => {
                  setConfMod(false);
                  setIsTableLoaded(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isTableLoaded && (
        <div className="fixed top-0 left-0 z-49 flex items-center justify-center h-full w-full bg-black bg-opacity-50">
          <BeatLoader color="var(--primary-color)" size={15} loading={isTableLoaded} />
        </div>
      )}
    </React.Fragment>
  );
};

const OutstandingFilter = ({
  setSearchValue,
  searchValue,
  getDataBySearch,
  setDateValue,
  dateValue,
  setRegion,
  region,
  regionData,
  storeName,
  setStoreName,
  allStore,
  setStoreData,
  storeData,
  getData,
  data,
}) => {
  const [regionDrop, setRegionDrop] = useState(false);
  const [storeDrop, setStoreDrop] = useState(false);
  const dispatch = useDispatch();
  const handleRegionChange = (val) => {
    setRegionDrop(false);
    setStoreName("");
    const filterStores = allStore.filter((store) => store.region === val);
    const storeNames = filterStores.map((store) => store.storeName);
    setStoreData(storeNames);
    setRegion(val);
    dispatch(setStoreFilter({ selStore: "", selRegion: val }));
  };

  const handleStoreChange = (val) => {
    setStoreDrop(false);
    const filterStores = allStore.filter((store) => store.storeName === val);
    const bRnewRegion = filterStores[0].region;
    setRegion(bRnewRegion);
    setStoreName(val);
    dispatch(setStoreFilter({ selStore: val, selRegion: bRnewRegion }));
  };

  const handleSearchClear = () => {
    setDateValue("");
    setSearchValue("");
    getData();
  };

  const dateChangeHandler = (event) => {
    const formattedDate = new Date(event.target.value).toLocaleDateString(
      "en-GB"
    );
    setDateValue(formattedDate);
  };

  return (
    <React.Fragment>
      <button
        className={`${styles.bulkdown_button}`}
        onClick={() => downloadExcel(data)}
      >
        <FaDownload /> Bulk Download
      </button>
      <div className="m-2 flex flex-col gap-2">
        <div className="outline-none flex gap-2 items-center">
          <div className={`${styles.search_bar_wrap}`}>
            <input
              className="text-sm"
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search"
              type="text"
              value={searchValue}
            />
            <IoMdSearch size={34} onClick={() => getDataBySearch()} />
          </div>
          <div className={styles.icons_box}>
            <IoRefresh size={25} onClick={handleSearchClear} className="" />
          </div>
          <div
            className={`flex flex-row items-center justify-center ${styles.date_picker_wrap}`}
          >
            <input
              id="datepicker"
              type="date"
              className=""
              style={{ color: "var(--primary-color)" }}
              onChange={dateChangeHandler}
              value={dateValue}
            />
            <div
              onClick={() => document.getElementById("datepicker").showPicker()}
              className={styles.date_box}
            >
              <p>{dateValue ? dateValue : "DD/MM/YYYY"}</p>
              <BsCalendarDate size={25} />
            </div>
          </div>
        </div>
      </div>
      <div className="m-2 flex items-center gap-2 w-100 outline-none">
        <div className="w-[45%] relative">
          <div
            onClick={() => {
              setRegionDrop(!regionDrop);
            }}
            className={`${styles.filter_button}`}
          >
            <p className="truncate">
              {region === "" ? "Select Region" : region}
            </p>
            <FaAngleDown
              className={`${regionDrop && "rotate-180"}`}
              size={17}
            />
          </div>
          {regionDrop && (
            <div className={`${styles.filter_drop}`}>
              {regionData.map((element) => (
                <div
                  key={element}
                  onClick={() => handleRegionChange(element)}
                  className={`${styles.filter_option}`}
                >
                  <p className="truncate">{element}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className=" relative w-[70%] ">
          <div
            onClick={() => {
              setStoreDrop(!storeDrop);
            }}
            className={`${styles.filter_button}`}
          >
            <p className="truncate">
              {storeName === "" ? "Select Store" : storeName}
            </p>
            <FaAngleDown size={17} className={`${storeDrop && "rotate-180"}`} />
          </div>
          {storeDrop && (
            <div className={`${styles.filter_drop}`}>
              {storeData.map((elem, index) => (
                <div
                  className={`${styles.filter_option}`}
                  key={index}
                  onClick={() => handleStoreChange(elem)}
                >
                  <p className="truncate">{elem}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

const OutstandingTable = ({
  data,
  confHandler,
  setIsTableLoaded,
  getData,
  setErrorMsg,
  setSuccessMod,
  setFailMode,
}) => {
  const LoggedInUser = JSON.parse(sessionStorage.getItem("profile"));
  const userRole = LoggedInUser?.role || "";
  const [showView, setShowView] = useState(false);
  const [viewRef, setViewRef] = useState("");
  const token2 = sessionStorage.getItem("authToken");
  const viewHandler = (refID) => {
    setViewRef(refID);
    setShowView(true);
  };

  const statusUpdateHandler = (refID, newStatus) => {
    setIsTableLoaded(true);
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/outstanding/update`,
      headers: {
        Authorization: token2,
        "Content-Type": "application/json",
      },
      data: {
        refIDs: [refID],
        newStatus: newStatus,
      },
    };
    axios
      .request(config)
      .then((response) => {
        getData();
        setErrorMsg(
          `Successfully updated the status of lot ${refID} to ${newStatus}`
        );
        setSuccessMod(true);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        setErrorMsg(
          `Failed to updated the status of lot ${refID} to ${newStatus}`
        );
        setFailMode(true);
        setIsTableLoaded(false);
      });
  };

  return (
    <div className={`${styles.pd_cont}`}>
      <div className="m-2 overflow-x-auto md:m-5">
        {showView && (
          <div className={styles.view_wrap}>
            <ViewPickupTable
              refNo={viewRef}
              setShowView={setShowView}
              fromOutStand={true}
            />
          </div>
        )}
        <table className="w-full border border-primary">
          <thead className="bg-primary text-white">
            <tr>
              <th className="p-2 text-sm md:p-3 md:text-base">Action</th>
              <th className="p-2 text-sm md:p-3 md:text-base">Status</th>
              <th className="p-2 text-sm md:p-3 md:text-base">Request</th>
              <th className="p-2 text-sm md:p-3 md:text-base">Date</th>
              <th className="p-2 text-sm md:p-3 md:text-base">Lot No</th>
              <th className="p-2 text-sm md:p-3 md:text-base">
                Number Of Device
              </th>
              <th className="p-2 text-sm md:p-3 md:text-base">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.map((val, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-200" : ""}>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {(userRole === "Super Admin" ||
                    userRole === "Admin Manager" ||
                    userRole === "Super_Admin_Unicorn" ||
                    userRole === "Admin_Manager_Unicorn") && (
                    <div className="flex flex-col gap-1">
                      <button
                        className={`${styles.view_btn}`}
                        onClick={() => viewHandler(val?._id)}
                      >
                        View
                      </button>
                      {val?.status === "Pending Payroll Approval" && (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => confHandler(val?._id)}
                            className={`${styles.acpt_btn}`}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              statusUpdateHandler(val?._id, PayrollRej)
                            }
                            className={`${styles.rjct_btn}`}
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {val?.status === PayrollRej && (
                        <button
                          onClick={() => confHandler(val?._id)}
                          className={`${styles.acpt_btn}`}
                        >
                          Accept
                        </button>
                      )}

                      {val?.status === "Pending Pickup Confirmation" && (
                        <button
                          onClick={() =>
                            statusUpdateHandler(val?._id, PayrollRej)
                          }
                          className={`${styles.rjct_btn}`}
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  )}
                  {userRole === "Technician" && (
                    <div className="flex flex-col gap-1">
                      <button
                        className={`${styles.view_btn}`}
                        onClick={() => viewHandler(val?._id)}
                      >
                        View
                      </button>
                    </div>
                  )}
                </td>
                <td className="p-2 text-center text-sm md:p-3 md:text-base">
                  {val?.status}
                </td>
                <td className="p-2 text-center text-sm md:p-3 md:text-base">
                  {val?.request}
                </td>
                <td className="p-2 text-center text-sm md:p-3 md:text-base">
                  {new Date(val.createdAt).toLocaleDateString("en-GB")}
                </td>
                <td className="p-2 text-center text-sm md:p-3 md:text-base">
                  {val?._id}
                </td>
                <td className="p-2 text-center text-sm md:p-3 md:text-base">
                  {val?.totalDevice}
                </td>
                <td className="p-2 text-center text-sm md:p-3 md:text-base">
                  {val?.totalAmount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
