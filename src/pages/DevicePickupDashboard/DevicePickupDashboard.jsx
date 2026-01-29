import React, { useEffect, useRef, useState } from "react";
import NavigateTable from "../../components/NavigateTable/NavigateTable";
import { useSelector } from "react-redux";
import DPFilter from "./DPFilter";
import ExtComps from "./components/ExtComps";
import PDTable from "./components/PDTable";
import { useDevicePickupData, useStoreData } from "./hooks/useDevicePickupData";
import axios from "axios";

const DevicePickupDashboard = () => {
  const LoggedInUser = JSON.parse(sessionStorage.getItem("profile"));

  const token = sessionStorage.getItem("authToken");
  const userProfile = useSelector((state) => state.user);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [dateValue, setDateValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [errorMsg, setErrorMsg] = useState("successfully updated status");
  const [errorMsg1, setErrorMsg1] = useState(null);
  const [errorMsg2, setErrorMsg2] = useState(null);
  const [successMod, setSuccessMod] = useState(false);
  const [failMod, setFailMode] = useState(false);
  const [confMod, setConfMod] = useState(false);
  const [storeName, setStoreName] = useState(userProfile.selStore);
  const [region, setRegion] = useState(userProfile.selRegion);
  const firsttime = useRef(true);
  const isSuperAdmin = LoggedInUser?.role === "Super Admin";

  // Extract role for passing down
  const userRole = LoggedInUser?.role;

  const {
    pendingTableData,
    isTableLoaded,
    devicesCount,
    devicesPrice,
    getData,
    setPendingTableData,
    setDevicesCount,
    setDevicesPrice,
    setIsTableLoaded,
  } = useDevicePickupData(token, region, storeName);
  const { storeData, regionData, allStore, getStore, setStoreData } =
    useStoreData(token);

  const getDataBySearch = () => {
    setIsTableLoaded(true);
    const config = {
      method: "get",
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/pendingDevices/search?rid=${searchValue}&date=${dateValue}&status=${statusValue}&region=${region}&storeName=${storeName}`,
      headers: { Authorization: token },
    };
    axios
      .request(config)
      .then((response) => {
        setPendingTableData([]);
        if (response?.data?.data?.length === 0) {
          setDevicesPrice("0");
          setDevicesCount(0);
        } else {
          setPendingTableData(response.data.data[0]?.documents || []);
          setDevicesPrice(
            response.data.data[0]?.totalPrices?.toString() || "0"
          );
          setDevicesCount(response.data.data[0]?.count || 0);
        }
        setIsTableLoaded(false);
      })
      .catch((error) => {
        setErrorMsg(`Failed to load data`);
        setFailMode(true);
        setIsTableLoaded(false);
      });
  };

  useEffect(() => {
    if (firsttime.current) {
      getData();
      getStore();
      firsttime.current = false;
    } else {
      getDataBySearch();
    }
  }, [statusValue, dateValue, storeName, region, searchValue]);

  return (
    <div className="min-h-screen bg-white pb-8">
      <ExtComps
        successMod={successMod}
        errorMsg={errorMsg}
        errorMsg1={errorMsg1}
        errorMsg2={errorMsg2}
        setSuccessMod={setSuccessMod}
        isTableLoaded={isTableLoaded}
        setIsTableLoaded={setIsTableLoaded}
        failMod={failMod}
        setFailMode={setFailMode}
        confMod={confMod}
        setConfMod={setConfMod}
        setErrorMsg={setErrorMsg}
        setErrorMsg1={setErrorMsg1}
        setErrorMsg2={setErrorMsg2}
        getData={getData}
        selectedIds={selectedIds}
        pendingTableData={pendingTableData}
        allStore={allStore}
        storeName={storeName}
        setSelectedIds={setSelectedIds}
        setSelectedData={setSelectedData}
        setSelectedRows={setSelectedRows}
      />
      <NavigateTable />
      <div className="flex flex-row justify-end items-center py-1 px-2 font-medium text-sm text-primary">
        Total Device : {devicesCount} | Total Amount :{" "}
        {new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(devicesPrice)}
      </div>
      <DPFilter
        setSearchValue={setSearchValue}
        searchValue={searchValue}
        getDataBySearch={getDataBySearch}
        dateValue={dateValue}
        statusValue={statusValue}
        selectedStatus={selectedStatus}
        setStatusValue={setStatusValue}
        setDateValue={setDateValue}
        setRegion={setRegion}
        region={region}
        regionData={regionData}
        storeName={storeName}
        setStoreName={setStoreName}
        allStore={allStore}
        setStoreData={setStoreData}
        storeData={storeData}
        pendingTableData={pendingTableData}
        setSelectedStatus={setSelectedStatus}
        getData={getData}
        isSuperAdmin={isSuperAdmin}
      />
      <PDTable
        pendingTableData={pendingTableData}
        setSelectedData={setSelectedData}
        setSelectedIds={setSelectedIds}
        setSelectedRows={setSelectedRows}
        selectedData={selectedData}
        selectedRows={selectedRows}
        selectedStatus={selectedStatus}
        selectedIds={selectedIds}
        setConfMod={setConfMod}
        setErrorMsg={setErrorMsg}
        setErrorMsg1={setErrorMsg1}
        setErrorMsg2={setErrorMsg2}
        setFailMode={setFailMode}
        setSelectedStatus={setSelectedStatus}
        setIsTableLoaded={setIsTableLoaded}
        setSuccessMod={setSuccessMod}
        getData={getData}
        userRole={userRole}
      />
    </div>
  );
};

export default DevicePickupDashboard;
