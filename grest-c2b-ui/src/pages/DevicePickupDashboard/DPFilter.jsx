import React, { useEffect, useState } from "react";
import { IoRefresh } from "react-icons/io5";
import { BsCalendarDate } from "react-icons/bs";
import { IoMdSearch } from "react-icons/io";
import styles from "./DevicePickupDashboard.module.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaAngleDown, FaDownload } from "react-icons/fa6";
import { useDispatch } from "react-redux";
import { setStoreFilter } from "../../store/slices/userSlice";

const PickupAvail = "Available For Pickup";
const RotateCss = "rotate-180";

const downloadExcel = (pendDataDown) => {
  if (!pendDataDown || !Array.isArray(pendDataDown)) {
    console.error("Invalid data provided for Excel download");
    return;
  }

  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";
  const formattedData = pendDataDown.map((item) => {
    return {
      "Lead Id": item._id,
      Date: new Date(item.createdAt).toLocaleDateString("en-GB"),
      "Device Name": item.modelName,
      "IMEI No": item.modelId,
      "Model Id": item.modelId,
      Storage: item.storage,
      Price: item.price,
      Status: item.status,
      Location: item.location,
    };
  });
  const ws = XLSX.utils.json_to_sheet(formattedData);
  const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const dataFile = new Blob([excelBuffer], { type: fileType });
  saveAs(dataFile, "Pending_Devices_Data" + fileExtension);
};

const DPFilter = ({
  setSearchValue,
  searchValue,
  getDataBySearch,
  dateValue,
  statusValue,
  selectedStatus,
  setStatusValue,
  setDateValue,
  setRegion,
  region,
  regionData,
  storeName,
  setStoreName,
  allStore,
  setStoreData,
  storeData,
  pendingTableData,
  setSelectedStatus,
  getData,
}) => {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [regionDrop, setRegionDrop] = useState(false);
  const [storeDrop, setStoreDrop] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStores, setFilteredStores] = useState(storeData);
  const LoggedInUser = JSON.parse(sessionStorage.getItem("profile"));
  const isSuperAdmin = LoggedInUser?.role === "Super Admin";
  const dispatch = useDispatch();

  const handleRegionChange = (value) => {
    setRegionDrop(false);
    setStoreName("");

    if (value === "") {
      // Logic for "All": Reset region and show all stores
      setRegion("");
      const allStoreNames = allStore.map((store) => store.storeName);
      setStoreData(allStoreNames);
      dispatch(setStoreFilter({ selStore: "", selRegion: "" }));
    } else {
      // Logic for Specific Region
      const filteredStores1 = allStore.filter(
        (store) => store.region === value
      );
      const storeNamesArray = filteredStores1.map((store) => store.storeName);
      setStoreData(storeNamesArray);
      setRegion(value);
      dispatch(setStoreFilter({ selStore: "", selRegion: value }));
    }
  };

  const handleStoreChange = (value) => {
    setStoreDrop(false);

    if (value === "") {
      // Logic for "All": Reset store, region, and refill store list
      setRegion("");
      setStoreName("");
      const allStoreNames = allStore.map((store) => store.storeName);
      setStoreData(allStoreNames);
      dispatch(setStoreFilter({ selStore: "", selRegion: "" }));
    } else {
      // Logic for Specific Store
      const filteredStores2 = allStore?.filter(
        (store) => store.storeName === value
      );
      if (filteredStores2?.length > 0) {
        const newRegion = filteredStores2[0].region;
        setRegion(newRegion);
        setStoreName(value);
        dispatch(setStoreFilter({ selStore: value, selRegion: newRegion }));
      }
    }
  };

  const handleSearchClear = () => {
    setSearchValue("");
    setSelectedStatus("");
    setDateValue("");
    setRegion("chandigarh");
    setStoreName(import.meta.env.VITE_USER_STORE_NAME);
    setSearchTerm("");
  };

  useEffect(() => {
    if (selectedStatus === "" && dateValue === "" && searchValue === "") {
      getData();
    }
  }, [dateValue, selectedStatus, searchValue]);

  useEffect(() => {
    if (storeDrop && searchTerm.trim() === "") {
      setFilteredStores(storeData);
    }
  }, [storeDrop, searchTerm, storeData]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value === "") {
      setFilteredStores(storeData);
    } else {
      const filtered = storeData.filter((store) =>
        store.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredStores(filtered);
    }
  };

  const handleFilterClick = () => {
    setShowFilterDropdown(!showFilterDropdown);
  };

  const dateChangeHandler = (event) => {
    const formattedDate = new Date(event.target.value).toLocaleDateString(
      "en-GB"
    );
    setDateValue(formattedDate);
  };
  return (
    <div className="px-2 flex flex-col gap-2">
      <div className="flex gap-2 items-center outline-none">
        <div className={`${styles.search_bar_wrap}`}>
          <input
            onChange={(e) => setSearchValue(e.target.value)}
            className="text-sm"
            type="text"
            placeholder="Search"
            value={searchValue}
          />
          <IoMdSearch onClick={() => getDataBySearch()} size={34} />
        </div>
        <div className={styles.icons_box}>
          <IoRefresh onClick={handleSearchClear} className="" size={25} />
        </div>
        <div
          className={`flex flex-row justify-center items-center ${styles.date_picker_wrap}`}
        >
          <input
            type="date"
            id="datepicker"
            style={{ color: "var(--primary-color)" }}
            className=""
            value={dateValue}
            onChange={dateChangeHandler}
          />
          <div
            className={styles.date_box}
            onClick={() => document.getElementById("datepicker").showPicker()}
          >
            <p>{dateValue ? dateValue : "DD/MM/YYYY"}</p>
            <BsCalendarDate size={25} />
          </div>
        </div>
      </div>
      <DPFilterSub
        handleFilterClick={handleFilterClick}
        statusValue={statusValue}
        showFilterDropdown={showFilterDropdown}
        setStatusValue={setStatusValue}
        pendingTableData={pendingTableData}
      />
      {isSuperAdmin && (
        <SuperAdminFilters
          region={region}
          regionDrop={regionDrop}
          setRegionDrop={setRegionDrop}
          regionData={regionData}
          handleRegionChange={handleRegionChange}
          searchTerm={searchTerm}
          storeDrop={storeDrop}
          setStoreDrop={setStoreDrop}
          handleSearch={handleSearch}
          filteredStores={filteredStores}
          handleStoreChange={handleStoreChange}
          setSearchTerm={setSearchTerm}
        />
      )}
    </div>
  );
};
export default DPFilter;

const DPFilterSub = ({
  handleFilterClick,
  statusValue,
  showFilterDropdown,
  setStatusValue,
  pendingTableData,
}) => {
  return (
    <div className="flex gap-2 items-center outline-none">
      <div className="relative">
        <div className={`${styles.filter_button}`} onClick={handleFilterClick}>
          <p className="truncate">
            {statusValue === "" ? "Select Status" : statusValue}
          </p>
          <FaAngleDown
            size={17}
            className={`${showFilterDropdown && RotateCss}`}
          />
        </div>
        {showFilterDropdown && (
          <div className={`${styles.filter_drop}`}>
            <div
              onClick={() => {
                setStatusValue(PickupAvail);
                handleFilterClick();
              }}
              className={`${styles.filter_option}`}
            >
              <p>Available for Pickup</p>
            </div>
            <div
              onClick={() => {
                setStatusValue("Pending in QC");
                handleFilterClick();
              }}
              className={`${styles.filter_option}`}
            >
              <p>Pending in QC</p>
            </div>
            <div
              onClick={() => {
                setStatusValue("On Hold");
                handleFilterClick();
              }}
              className={`${styles.filter_option}`}
            >
              <p>On Hold</p>
            </div>
            <div
              onClick={() => {
                setStatusValue("Cancelled");
                handleFilterClick();
              }}
              className={`${styles.filter_option}`}
            >
              <p>Cancelled</p>
            </div>
            <div
              onClick={() => {
                setStatusValue("");
                handleFilterClick();
              }}
              className={`${styles.filter_option}`}
            >
              <p>Show All</p>
            </div>
          </div>
        )}
      </div>
      <button
        className={`${styles.bulkdown_button}`}
        onClick={() => downloadExcel(pendingTableData)}
      >
        <FaDownload /> Bulk Download
      </button>
    </div>
  );
};

const SuperAdminFilters = ({
  region,
  regionDrop,
  setRegionDrop,
  regionData,
  handleRegionChange,
  searchTerm,
  storeDrop,
  setStoreDrop,
  handleSearch,
  filteredStores,
  handleStoreChange,
  setSearchTerm,
}) => {
  return (
    <div className="flex gap-2 w-100 items-center outline-none">
      <div className="relative w-[45%]">
        <div
          className={`w-[100%] ${styles.filter_button}`}
          onClick={() => setRegionDrop(!regionDrop)}
        >
          {/* Label shows "All" if region is empty */}
          <p className="truncate">{region === "" ? "All Region" : region}</p>
          <FaAngleDown size={17} className={`${regionDrop && RotateCss}`} />
        </div>
        {regionDrop && (
          <div className={`w-[100%] ${styles.filter_drop}`}>
            {/* Added All option at the top */}
            <div
              onClick={() => handleRegionChange("")}
              className={`${styles.filter_option}`}
            >
              <p className="truncate">All</p>
            </div>
            {regionData.map((item) => (
              <div
                key={item}
                onClick={() => handleRegionChange(item)}
                className={`${styles.filter_option}`}
              >
                <p className="truncate">{item}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="relative w-[70%]">
        <div
          className={`${styles.filter_button} w-full`}
          onClick={() => setStoreDrop(!storeDrop)}
        >
          {/* Label shows "All" if searchTerm/storeName is empty */}
          <p className="truncate">{searchTerm === "" ? "All Store" : searchTerm}</p>
          <FaAngleDown size={17} className={`${storeDrop && RotateCss}`} />
        </div>
        {storeDrop && (
          <div className="absolute w-full bg-white shadow-md">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full p-2 border-b border-gray-300"
              placeholder="Search store..."
            />
            <div
              className={`overflow-y-scroll max-h-[200px] ${styles.filter_drop} w-full`}
            >
              {/* Added All option at the top */}
              <div
                onClick={() => {
                  handleStoreChange("");
                  setSearchTerm("");
                  setStoreDrop(false);
                }}
                className={`${styles.filter_option}`}
              >
                <p className="truncate">All</p>
              </div>

              {filteredStores.length > 0 ? (
                filteredStores.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      handleStoreChange(item);
                      setSearchTerm(item);
                      setStoreDrop(false);
                    }}
                    className={`${styles.filter_option}`}
                  >
                    <p className="truncate">{item}</p>
                  </div>
                ))
              ) : (
                <p className="p-2 text-gray-500">No stores found</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
