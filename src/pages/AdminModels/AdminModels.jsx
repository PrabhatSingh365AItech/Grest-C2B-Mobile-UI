import React, { useEffect, useState } from "react";
import styles from "./AdminModels.module.css";
import axios from "axios";
import { BeatLoader } from "react-spinners";
import {
  IoIosCheckmarkCircle,
  IoIosCloseCircle,
  IoMdSearch,
} from "react-icons/io";
import { IoRefresh } from "react-icons/io5";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaDownload } from "react-icons/fa6";
import AdminNavbar from "../../components/Admin_Navbar";
import SideMenu from "../../components/SideMenu";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  setMobileID,
  setRam,
  setStorage,
  resetAdminAnswer
} from "../../store/slices/newAdminGrade";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

const getEvenRowClass = (index, selectmodel, selectstorage, selectram, val) => {
  if (index % 2 === 0) {
    if (
      selectmodel === val.modelId &&
      selectstorage === val?.storage &&
      selectram === val?.RAM
    ) {
      return "bg-[#eb869c]";
    }
    return "bg-gray-200";
  }
  return "";
};

const downloadExcel = (data) => {
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";

  const formattedData = data.map((item) => {
    return {
      "Brand Id": item.brandId,
      "Brand Name": item.brandName,
      "Model Id": item?.modelId,
      "Model Name": item.modelName,
      RAM: item.RAM,
      Storage: item.storage,
      Price: item.price,
    };
  });

  const ws = XLSX.utils.json_to_sheet(formattedData);
  const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const dataFile = new Blob([excelBuffer], { type: fileType });
  saveAs(dataFile, "All_Models_Data" + fileExtension);
};

const getRowClass = (selectmodel, selectstorage, selectram, val) => {
  if (
    selectmodel === val.modelId &&
    selectstorage === val?.storage &&
    selectram === val?.RAM
  ) {
    return "bg-[#eb869c]";
  }
  return "";
};

const getTextColorClass = (isSuccess) =>
  isSuccess ? "text-green-500" : "text-primary";
const grestTheme = "bg-primary text-white";
const errMsg = "";
const selectedModel = "";

const AdminModels = () => {
  const [admincategory, setAdminCategory] = useState(
    sessionStorage.getItem("admincategory") === "CTG2" ? "CTG2" : "CTG1"
  );
  const [data, setData] = useState([]);
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectmodel, setSelectModel] = useState("");
  const [selectstorage, setSelectstorage] = useState("");
  const [selectram, setSelectram] = useState("");
  const [category, setCategory] = useState("CTG1");
  const [categories, setCategories] = useState([]);
  const token = sessionStorage.getItem("authToken");
  const [sucBox, setSucBox] = useState(false);
  const [failBox, setFailBox] = useState(false);
  const [confBox, setConfBox] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    sessionStorage.setItem("admincategory", category);
    getData();
    setAdminCategory(sessionStorage.getItem("admincategory"));
  }, [category]);
  useEffect(() => {
    dispatch(resetAdminAnswer());
    sessionStorage.setItem("admincategory", "CTG1");
    getCategories();
  }, []);

  const getData = () => {
    setIsTableLoaded(true);
    const config = {
      method: "get",
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/brands/getAllBrandsModels?type=${category}`,
      headers: { Authorization: token },
    };
    axios
      .request(config)
      .then((response) => {
        const responseData = response.data.data;
        const allConfigurations = [];
        responseData.forEach((brand) => {
          brand.models.forEach((model) => {
            model.config.forEach((conf) => {
              const newConfig = {
                brandId: brand.brand._id,
                brandName: brand.brand.name,
                modelId: model._id,
                modelName: model.name,
                storage: conf.storage,
                RAM: conf.RAM,
                price: conf.price,
              };
              allConfigurations.push(newConfig);
            });
          });
        });
        setData(allConfigurations);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        setIsTableLoaded(false);
      });
  };
  const getDataBySearch = () => {
    setIsTableLoaded(true);
    const config = {
      method: "post",
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/user/Dashboard/search/phones`,
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      data: {
        name: searchValue,
        deviceType: admincategory,
      },
    };
    axios
      .request(config)
      .then((response) => {
        const responseData = response.data;
        const allConfigurations = [];
        responseData.forEach((model) => {
          const brandName = model.name.split(" ")[0];
          model.config.forEach((conf) => {
            const newConfig = {
              brandId: model.brandId,
              modelId: model._id,
              brandName: brandName,
              modelName: model.name,
              storage: conf.storage,
              RAM: conf.RAM,
              price: conf.price,
            };
            allConfigurations.push(newConfig);
          });
        });
        setData(allConfigurations);
        setIsTableLoaded(false);
      })
      .catch((error) => {
        setIsTableLoaded(false);
      });
  };
  const getCategories = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/category/getAll`,
        {
          headers: { Authorization: token },
        }
      );
      setCategories(response.data.data);
    } catch (err) {
      console.log(err)
    }
  }
  const selectHandler = (modelId, modelStorage, ram, modelName) => {
    sessionStorage.setItem(
      "adminModelName",
      `${modelName} (${ram}/${modelStorage})`
    );
    if (category === "CTG2") {
      sessionStorage.setItem("adminModelName", modelName);
    }
    setSelectModel(modelId);
    setSelectstorage(modelStorage);
    setSelectram(ram);
    dispatch(setMobileID(modelId));
    dispatch(setStorage(modelStorage));
    dispatch(setRam(ram));
  };
  const deleteHandler = (userID) => {
    setIsTableLoaded(true);
    setIsTableLoaded(false);
  };

  const handleSearchClear = () => {
    setSearchValue("");
    getData();
  };

  return (
    <div className={`${styles.pickedup_page}`}>
      <ExtComps
        isTableLoaded={isTableLoaded}
        setIsTableLoaded={setIsTableLoaded}
        sucBox={sucBox}
        setSucBox={setSucBox}
        setFailBox={setFailBox}
        failBox={failBox}
        confBox={confBox}
        deleteHandler={deleteHandler}
        category={category}
        setConfBox={setConfBox}
        setCategory={setCategory}
        categories={categories}
      />
      <div className="m-2 flex flex-col gap-2 items-center w-[100%]">
        <div className="flex gap-2 items-center justify-center outline-none mt-5 w-[100%]">
          <div className={`${styles.search_bar_wrap}`}>
            <input
              onChange={(e) => setSearchValue(e.target.value)}
              className="text-sm"
              type="text"
              placeholder="Search Model"
              value={searchValue}
            />
            <IoMdSearch onClick={() => getDataBySearch()} />
          </div>
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
      <div className={`${styles.pd_cont}`}>
        <AdminModelsTable
          grestTheme1={grestTheme}
          data={data}
          selectmodel={selectmodel}
          selectstorage={selectstorage}
          selectram={selectram}
          selectHandler={selectHandler}
          deleteHandler={deleteHandler}
          category={category}
        />
      </div>
    </div>
  );
};

const ExtComps = ({
  isTableLoaded,
  setIsTableLoaded,
  sucBox,
  setSucBox,
  setFailBox,
  failBox,
  confBox,
  deleteHandler,
  setConfBox,
  category,
  setCategory,
  categories,
}) => {
  const [sideMenu, setsideMenu] = useState(false);
  return (
    <React.Fragment>
      <div className="flex items-center w-[99%] h-16 py-4 bg-white border-b-2 HEADER ">
        <div className="navbar">
          <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
          <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
        </div>
      </div>
      {isTableLoaded && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <BeatLoader
            color="var(--primary-color)"
            loading={isTableLoaded}
            size={15}
          />
        </div>
      )}
      {(failBox || sucBox ) && (
        <div className="fixed z-50  top-0 left-0 flex items-center justify-center h-full w-full  bg-black bg-opacity-50">
          <div className={`${styles.err_mod_box} ${getTextColorClass(sucBox)}`}>
            {sucBox ? (
              <IoIosCheckmarkCircle
              size={90}
              className={`${getTextColorClass(sucBox)}`}
              />
            ) : (
              <IoIosCloseCircle
                className={`${getTextColorClass(sucBox)}`}
                size={90}
              />
            )}
            <h6 className={`${getTextColorClass(sucBox)} `}>
              {sucBox ? "Success!" : "Error!"}
            </h6>
            <p className="text-slate-500">{errMsg}</p>
            <button
              onClick={() => {
                setFailBox(false);
                setSucBox(false);
              }}
              className={sucBox ? "text-white bg-green-500 " : grestTheme}
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {confBox && (
        <div className="fixed top-0 left-0 z-50 flex  justify-center items-center w-full h-full bg-black bg-opacity-50">
          <div className={`${styles.err_mod_box}  ${getTextColorClass(sucBox)}`}>
            <h6 className={`${getTextColorClass(sucBox)} `}>Confirmation!</h6>
            <p className="text-slate-500 ">
              {`Do you want to delete store - ${selectedModel} ?`} ?
            </p>
            <div className="flex flex-row  gap-2">
              <button
                className={grestTheme}
                onClick={() => deleteHandler(selectedModel)}
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
      )}
      <div className="m-2 flex  gap-2 items-center w-[100%]">
        <div className="flex gap-2">
          <p className="font-medium">Select Category</p>
          <select
            className="bg-primary text-white rounded-lg outline-none px-2 py-1"
            onChange={(e) => setCategory(e.target.value)}
            value={category}
          >
            {categories.map((cat) => (
              <option
                className="bg-white text-primary font-medium"
                key={cat?._id}
                value={cat?.categoryCode}
              >
                {cat?.categoryName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </React.Fragment>
  );
};

const AdminModelsTable = ({
  grestTheme1,
  data,
  selectmodel,
  selectstorage,
  selectram,
  selectHandler,
  deleteHandler,
}) => {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteHandler(itemToDelete); // Make sure deleteHandler is defined
      setIsDeleteModalOpen(false);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };
  function handleNext() {
    navigate("/adminhome");
  }
  return (
    <div className="m-2 overflow-x-auto md:m-5">
      <table className="w-full border border-primary">
        <thead className={grestTheme1}>
          <tr>
            <th className="p-2 text-sm md:p-3 md:text-base">Action</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Brand</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Model Name</th>
            <th className="p-2 text-sm md:p-3 md:text-base">RAM</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Storage</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Price</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((val, index) => (
            <tr
              key={index}
              className={`${getEvenRowClass(
                index,
                selectmodel,
                selectstorage,
                selectram,
                val
              )} ${getRowClass(selectmodel, selectstorage, selectram, val)}`}
            >
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                <div className="flex flex-col gap-1">
                  <button
                    className={`${styles.view_btn}`}
                    onClick={() => {
                      selectHandler(
                        val.modelId,
                        val.storage,
                        val?.RAM,
                        val.modelName
                      );
                    }}
                  >
                    Select
                  </button>
                  <button
                    className={`${styles.acpt_btn}`}
                    onClick={() => openDeleteModal(val)}
                  >
                    Delete
                  </button>
                </div>
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {val?.brandName}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {val?.modelName}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {val?.RAM ? val?.RAM : "-"}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {val?.RAM ? val?.storage : "-"}
              </td>
              <td className="p-2 text-sm text-center md:p-3 md:text-base">
                {val?.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center mb-2">
        <button
          onClick={handleNext}
          className="text-center  mx-2 px-4 py-2 rounded-lg bg-primary text-white cursor-pointer mt-3"
        >
          Next
        </button>
      </div>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
};
export default AdminModels;
