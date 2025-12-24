import styles from "./RegisterUserDetails.module.css";
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
import RegisterUserEdit from "../../components/RegisterUserEdit/RegisterUserEdit";
import { useNavigate } from "react-router-dom";

const succTextColor = "text-green-500";
const failTextColor = "text-primary";

const downloadExcel = (dataDown) => {
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";

  const formattedData = dataDown.map((item) => {
    return {
      "User Id": item._id,
      "Date Created": new Date(item.createdAt).toLocaleDateString("en-GB"),
      "User Name": `${item?.firstName} ${item?.lastName}`,
      "User Email": item.email,
      "Phone Number": item.phoneNumber,
      [`${import.meta.env.VITE_WEBSITE_TITLE} Member`]: item.grestMember,
      "Company Name": item.companyName,
      Role: item.role,
      "Store Name": item.stores?.storeName,
      Region: item.stores?.region,
      Address: item.address,
    };
  });

  const ws = XLSX.utils.json_to_sheet(formattedData);
  const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  const dataFile = new Blob([excelBuffer], { type: fileType });
  saveAs(dataFile, "Users_Data" + fileExtension);
};

const RegisterUserDetails = () => {
  const token = sessionStorage.getItem("authToken");
  const [data, setData] = useState([]);
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [sideMenu, setsideMenu] = useState(false);
  const [userEditData, setUserEditData] = useState();
  const [searchValue, setSearchValue] = useState("");
  const [storeValue, setStoreValue] = useState("");
  const [roleValue, setRoleValue] = useState("");
  const [editBoxOpen, setEditBoxOpen] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [selectedUser, setSelectedUser] = useState();
  const [selectedEmail, setSelectedEmail] = useState();
  const [errMsg, setErrMsg] = useState("");
  const [sucBox, setSucBox] = useState(false);
  const [failBox, setFailBox] = useState(false);
  const [confBox, setConfBox] = useState(false);

  const getData = () => {
    setIsTableLoaded(true);
    const config = {
      method: "get",
      url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/userregistry/all`,
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
  const getDataBySearch = () => {
    setIsTableLoaded(true);
    const config = {
      method: "get",
      url: `${import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/userregistry/search?uid=${searchValue}&storeName=${storeValue}&role=${roleValue}`,
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
    if (editSuccess) {
      getData();
      setErrMsg("Succesfully updated user details");
      setSucBox(true);
      setEditSuccess(false);
      setEditBoxOpen(false);
    }
  }, [editSuccess]);
  const editHandler = (userData) => {
    console.log(userData);
    setUserEditData(userData);
    setEditBoxOpen(true);
  };
  const deleteConfHandler = (userID, userEmail) => {
    setSelectedUser(userID);
    setSelectedEmail(userEmail);
    setConfBox(true);
  };
  const deleteHandler = (userID) => {
    setIsTableLoaded(true);
    setConfBox(false);
    const config = {
      method: "delete",
      maxBodyLength: Infinity,
      url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/userregistry/delete`,
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      data: {
        userID: userID,
      },
    };
    axios
      .request(config)
      .then((response) => {
        getDataBySearch();
        setErrMsg(`Succesfully deleted user with email - ${selectedEmail}`);
        setSucBox(true);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        setErrMsg("Failed to deleted user with email - " + selectedEmail);
        setFailBox(true);
        setIsTableLoaded(false);
      });
  };

  useEffect(() => {
    getData();
  }, []);

  const handleSearchClick = () => {
    getDataBySearch();
  };

  useEffect(() => {
    if (editBoxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }
  }, [editBoxOpen]);

  return (
    <div>
      {editBoxOpen && (
        <div className={`${styles.edit_page}`}>
          <RegisterUserEdit
            userData={userEditData}
            setEditBoxOpen={setEditBoxOpen}
            setEditSuccess={setEditSuccess}
          />
        </div>
      )}
      <div className="flex items-center border-b-2 w-screen h-16 py-4 bg-white HEADER ">
        <div className="navbar">
          <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
          <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
        </div>
      </div>
      {sucBox && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className={`${styles.err_mod_box} ${succTextColor}`}>
            <IoIosCheckmarkCircle className={succTextColor} size={90} />
            <h6 className={succTextColor}>Success!</h6>
            <p className="text-slate-500">{errMsg}</p>
            <button
              onClick={() => {
                setSucBox(false);
              }}
              className={"text-white bg-green-500"}
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {failBox && <FailBox errMsg={errMsg} setFailBox={setFailBox} />}
      {confBox && (
        <ConfBox
          selectedEmail={selectedEmail}
          deleteHandler={deleteHandler}
          selectedUser={selectedUser}
          setIsTableLoaded={setIsTableLoaded}
          setConfBox={setConfBox}
        />
      )}
      {isTableLoaded && (
        <div className="fixed top-0 left-0 z-49 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <BeatLoader color="var(--primary-color)" loading={isTableLoaded} size={15} />
        </div>
      )}
      <TableFilters
        setSearchValue={setSearchValue}
        searchValue={searchValue}
        handleSearchClick={handleSearchClick}
        getData={getData}
        storeValue={storeValue}
        setRoleValue={setRoleValue}
        roleValue={roleValue}
        setStoreValue={setStoreValue}
        data={data}
      />
      <RegisterUserTable
        data={data}
        editHandler={editHandler}
        deleteConfHandler={deleteConfHandler}
      />
    </div>
  );
};

export default RegisterUserDetails;

const FailBox = ({ errMsg, setFailBox }) => {
  return (
    <div className="fixed top-0 left-0 z-50 justify-center flex items-center w-full h-full bg-black bg-opacity-50">
      <div className={`${styles.err_mod_box} ${failTextColor}`}>
        <IoIosCloseCircle size={90} className={failTextColor} />
        <h6 className={failTextColor}>Error!</h6>
        <p className="text-slate-500">{errMsg}</p>
        <button
          onClick={() => {
            setFailBox(false);
          }}
          className={"bg-primary text-white"}
        >
          Okay
        </button>
      </div>
    </div>
  );
};
const ConfBox = ({
  selectedEmail,
  deleteHandler,
  selectedUser,
  setIsTableLoaded,
  setConfBox,
}) => {
  return (
    <div className="fixed z-50 top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
      <div className={`${styles.err_mod_box} ${failTextColor}`}>
        <h6 className={failTextColor}>Confirmation!</h6>
        <p className="text-slate-500">
          {`Do you want to delete user with email - ${selectedEmail} ?`}
        </p>
        <div className="flex flex-row gap-2">
          <button
            onClick={() => deleteHandler(selectedUser)}
            className={"bg-primary text-white"}
          >
            Okay
          </button>
          <button
            onClick={() => {
              setConfBox(false);
              setIsTableLoaded(false);
            }}
            className="bg-white text-primary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const TableFilters = ({
  setSearchValue,
  searchValue,
  handleSearchClick,
  setRoleValue,
  roleValue,
  storeValue,
  setStoreValue,
  getData,
  data,
}) => {
  const LoggedInUser = JSON.parse(sessionStorage.getItem("profile"));
  const isSuperAdmin = LoggedInUser?.role === 'Super Admin';
  const navigate = useNavigate();
  const handleSearchClear = () => {
    setSearchValue("");
    setStoreValue("");
    setRoleValue("");
    getData();
  };

  return (
    <div className="m-2 flex flex-col gap-2 items-center w-[100%]">
      <div className="flex gap-2 items-center justify-center outline-none mt-5 w-[100%]">
        <button
          className={`${styles.bulkdown_button}`}
          onClick={() => {
            navigate("/registeruser");
          }}
        >
          <IoMdAdd /> Add User
        </button>
        <div className={`${styles.search_bar_wrap}`}>
          <input
            onChange={(e) => setSearchValue(e.target.value)}
            className="text-sm"
            type="text"
            placeholder="Search Name/Email/Number/UserId"
            value={searchValue}
          />
          <IoMdSearch onClick={handleSearchClick} size={25} />
        </div>
        <div className={`${styles.search_bar_wrap}`}>
          <input
            onChange={(e) => setRoleValue(e.target.value)}
            className="text-sm"
            type="text"
            placeholder="Search role"
            value={roleValue}
          />
          <IoMdSearch onClick={handleSearchClick} size={25} />
        </div>
        {isSuperAdmin && (
          <div className={`${styles.search_bar_wrap}`}>
            <input
              onChange={(e) => setStoreValue(e.target.value)}
              className="text-sm"
              type="text"
              placeholder="Search Store"
              value={storeValue}
            />
            <IoMdSearch onClick={handleSearchClick} size={25} />
          </div>
        )}
        <div className={styles.icons_box}>
          <IoRefresh onClick={handleSearchClear} className="" size={25} />
        </div>
        <button
          className={`${styles.bulkdown_button}`}
          onClick={() => downloadExcel(data)}
        >
          <FaDownload /> Bulk Download
        </button>
      </div>
    </div>
  );
};

const RegisterUserTable = ({ data, editHandler, deleteConfHandler }) => {
  return (
    <div className="m-2 overflow-x-auto md:m-5">
      <table className="w-full border border-primary">
        <thead className="bg-primary text-white">
          <tr>
            <th className="p-2 text-sm md:p-3 md:text-base">Action</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Name</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Email</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Phone Number</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Company</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Role</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Store</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Region</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Address</th>
          </tr>
        </thead>
        <tbody>
          {data.map((val, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-gray-200" : ""}>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                <div className="flex flex-col gap-1">
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
                      deleteConfHandler(val?._id, val?.email);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {`${val?.firstName} ${val?.lastName ? val?.lastName : ""}`}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {val?.email}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {val?.phoneNumber}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {val?.companyName}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {val?.role}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {val?.stores?.storeName}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {val?.stores?.region}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {val?.address}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
