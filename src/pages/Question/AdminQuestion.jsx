import React, { useEffect, useState } from "react";
import styles from "./question.module.css";
import axios from "axios";
import { BeatLoader } from "react-spinners";
import {
  IoIosCheckmarkCircle,
  IoIosCloseCircle,
} from "react-icons/io";
import AdminNavbar from "../../components/Admin_Navbar";
import SideMenu from "../../components/SideMenu";
import { useNavigate } from "react-router-dom";
import { FaUpload } from "react-icons/fa";
import { toast } from "react-toastify";
import useUserProfile from "../../utils/useUserProfile";

const getTextColorClass = (isSuccess) =>
  isSuccess ? "text-green-500" : "text-[#EC2752]";
const grestTheme = "bg-[#EC2752] text-white";
const errMsg = "";
const selectedModel = "";

const AdminQuestion = () => {
  const [questions, setQuestions] = useState([]);
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [category, setCategory] = useState("CTG1");
  const token = sessionStorage.getItem("authToken");
  const [sucBox, setSucBox] = useState(false);
  const [failBox, setFailBox] = useState(false);
  const [confBox, setConfBox] = useState(false);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [maxPages, setMaxPage] = useState(0);
  const [brandList, setBrandList] = useState([]);
  const [deviceList, setDeviceList] = useState([]);
  const [brandID, setBrandID] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const getData = async () => {
    const slectedBrandID = selectedBrand?._id;
    if (!slectedBrandID) {
      return;
    } else {
      setIsTableLoaded(true);
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_ENDPOINT
          }/api/questionnaires/getQNA?page=${page}&limit=10&brandId=${slectedBrandID}`,
          { headers: { Authorization: token } }
        );
        setQuestions(response.data.data);
        setMaxPage(Math.ceil(response.data.totalCounts / 10));
      } catch (error) {
        toast.error("Failed to fetch data. Please try again.");
      } finally {
        setIsTableLoaded(false);
      }
    }
  };

  useEffect(() => {
    getData();
  }, [page, selectedBrand]);

  const deleteHandler = () => {
    setIsTableLoaded(true);
    setIsTableLoaded(false);
  };

  function handleNext() {
    // Check if all questions are answered
    if (
      questions.every((question) =>
        answers.some((answer) => answer.question === question.question)
      )
    ) {
      // All questions answered
      setPage(page + 1);
    } else {
      // Show toast if not all questions are answered
      toast.warning("Please answer all the questions!!");
    }
  }

  function handlePrev() {
    if (page > 1) {
      setPage(page - 1);
    }
  }
  const [uploadBox, setUploadBox] = useState(false);
  const [file, setFile] = useState(null);

  // Add this useEffect to call getData whenever the selected brand changes
  useEffect(() => {
    if (selectedBrand) {
      getData();
    }
  }, [selectedBrand]);

  const handleExcelFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  // State to track the selected answers
  const [answers, setAnswers] = useState([]);

  const handleChange = (questionId, answer, per, questionText) => {
    setAnswers((prev) => {
      const existingAnswerIndex = prev.findIndex(
        (item) => item.question === questionText
      );

      if (existingAnswerIndex >= 0) {
        const updatedAnswers = [...prev];
        updatedAnswers[existingAnswerIndex] = {
          question: questionText,
          answer: {
            answer,
            per,
          },
        };
        return updatedAnswers;
      } else {
        return [
          ...prev,
          {
            question: questionText,
            answer: {
              answer,
              per,
            },
          },
        ];
      }
    });
  };

  const profile = useUserProfile();

  const handleSubmit = async () => {
    console.log(selectedDevice, "arijit");

    const payload = {
      price: selectedDevice?.selectedConfig?.price,
      data: answers,
      phoneNumber: "123456789",
      aadharNumber: "123456789012",
      modelId: selectedDevice?._id,
      storage: selectedDevice?.selectedConfig?.storage,
      ram: selectedDevice?.selectedConfig?.RAM,
      name: profile?.name,
    };
    const response = await axios.post(
      `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/questionnaires/calcuatleModelPrice`,
      payload,
      { headers: { Authorization: token } }
    );
    toast.success(response?.data?.message);

    sessionStorage.setItem("selectedDevice", JSON.stringify(selectedDevice));
    sessionStorage.setItem("calculatedAdminPrice", response?.data?.data?.price);
    navigate("/adminfinalprice");
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
      />
      <BrandList
        brandList={brandList}
        setBrandList={setBrandList}
        setUploadBox={setUploadBox}
        deviceList={deviceList}
        selectedDevice={selectedDevice}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        setSelectedDevice={setSelectedDevice}
        setDeviceList={setDeviceList}
        setAnswers={setAnswers}
      />

      <UploadBox
        setUploadBox={setUploadBox}
        uploadBox={uploadBox}
        handleExcelFileChange={handleExcelFileChange}
        brandList={brandList}
        setBrandID={setBrandID}
        file={file}
        brandID={brandID}
        getData={getData}
      />
     <SelectBrand
      selectedBrand={selectedBrand}
      selectedDevice={selectedDevice}
      questions={questions}
      answers={answers}
      handleChange={handleChange}
      page={page}
      handlePrev={handlePrev}
      maxPages={maxPages}
      handleSubmit={handleSubmit}
      handleNext={handleNext}
     />
    </div>
  );
};
const SelectBrand = ({ selectedBrand, selectedDevice, questions, answers, handleChange, page, handlePrev, maxPages, handleSubmit, handleNext }) => {
  return(
    <React.Fragment>
       {selectedBrand && selectedDevice ? (
        <div className={`${styles.pd_cont}`}>
          {questions?.length > 0 ? (
            <div className="flex flex-col gap-2 mt-4 px-2 md:flex-row justify-between space-y-4 md:space-y-0">
              <div className="md:w-2/3 p-4 bg-white shadow-2xl">
                <h1 className="text-2xl text-center font-semibold mb-2">
                  Tell us more about your device?
                </h1>
                <p className="text-base text-gray-500 text-center font-semibold mb-4">
                  Please answer a few questions about your device.
                </p>
                {questions.map((item, index) => (
                  <div
                    key={item._id}
                    className="mb-3 p-3 bg-gray-100 rounded-lg"
                  >
                    <h2 className="text-lg font-medium mb-2">
                      {index + 1}.{item.question}
                    </h2>
                    <div className="flex space-x-4">
                      {item.options.map((option) => (
                        <label
                          key={option.answer}
                          className="flex items-center"
                        >
                          <input
                            type="radio"
                            name={item.question}
                            value={option.answer}
                            checked={
                              answers?.find(
                                (ans) => ans.question === item.question
                              )?.answer.answer === option.answer
                            }
                            onChange={() =>
                              handleChange(
                                item._id,
                                option.answer,
                                option.per,
                                item.question
                              )
                            }
                            className="mr-2"
                          />
                          <span>{option.answer}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="mt-0 mb-4 flex justify-center ">
                  {page > 0 && (
                    <button
                      className={`mx-2 px-6 py-2 rounded-lg ${"bg-[#EC2752]  cursor-pointer text-white"}`}
                      onClick={handlePrev}
                    >
                      Back
                    </button>
                  )}

                  {page === maxPages - 1 ? (
                    <button
                      className="mx-2 px-4 py-2 rounded-lg bg-[#EC2752]  cursor-pointer text-white"
                      onClick={handleSubmit}
                    >
                      Submit
                    </button>
                  ) : (
                    <button
                      className="mx-2 px-4 py-2 rounded-lg bg-[#EC2752]  cursor-pointer text-white"
                      onClick={handleNext}
                    >
                      Continue
                    </button>
                  )}
                </div>
              </div>
              <div className="md:w-1/3 p-4 bg-blue-50 rounded-lg shadow-md">
                <div className="flex gap-2 items-center justify-center border-b-2 pb-2">
                  <img src={selectedBrand?.logo} alt="" className="h-10 w-10" />
                  <h2 className="text-2xl text-center font-semibold">
                    {selectedBrand?.name}
                  </h2>
                </div>
                <div className="pt-2">
                  {answers.map((answerData, index) => (
                    <div key={index} className="mb-4 text-sm">
                      <p>Q. {answerData?.question}</p>
                      <p>
                        A. {answerData?.answer.answer} (Percentage:{" "}
                        {answerData?.answer.per}%)
                      </p>
                      <hr className="my-4 border-gray-300" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <h3 className="text-center text-xl font-semibold">
              No question uploaded for this brand!!
            </h3>
          )}
        </div>
      ) : (
        <h3 className="text-center text-xl font-semibold">
          Please select a brand and a device
        </h3>
      )}
      </React.Fragment>
  )
}
const BrandList = ({ brandList, setBrandList,setUploadBox, deviceList, selectedDevice, selectedBrand, setSelectedBrand, setSelectedDevice, setDeviceList, setAnswers }) => {
  const token = sessionStorage.getItem("authToken");
  const fetchModels = () => {
    const config = {
      method: "post",
      url: `${
        import.meta.env.VITE_REACT_APP_ENDPOINT
      }/api/brands/getNewSelectedBrandModels`,
      headers: {
        Authorization: `${token}`,
      },
      data: {
        brandId: selectedBrand?._id,
        deviceType: "CTG1",
        series: "",
        search: "",
      },
    };
    axios
      .request(config)
      .then((res) => {
        console.log("asd", res?.data);
        setDeviceList(res.data.models);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    if (selectedBrand) {
      fetchModels();
    }
  }, [selectedBrand]);
  useEffect(() => {
    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/brands/getBrands?deviceType=CTG1`,
        {
          headers: {
            authorization: `${token}`,
          },
        }
      )
      .then((res) => {
        const brands = res.data.data;
        setBrandList(brands);

        // Check if there are any brands and set the first one as selected
        if (brands.length > 0) {
          setSelectedBrand(brands[0]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  const handleBrandChange = (e) => {
    const selectedId = e.target.value;
    const selectedObject = brandList.find((item) => item._id === selectedId);
    setSelectedBrand(selectedObject);
    setSelectedDevice(null);
    setDeviceList([]);
    setAnswers([]);
  };

  const handleModelChange = (e) => {
    const [deviceId, configId] = e.target.value.split("|"); // Split the value to get both device and config ID

    const selectDevices = deviceList.find((item) => item._id === deviceId); // Find the device by _id
    const selectedConfig = selectDevices?.config.find(
      (conf) => conf._id === configId
    ); // Find the config by its ID

    if (selectDevices && selectedConfig) {
      setSelectedDevice({
        ...selectDevices,
        selectedConfig, // Add the selected config to the selected device object
      });
    }
    setAnswers([]); // Clear answers
  };
  return (
    <div className="m-2 flex flex-col gap-2 items-center w-[100%]">
    <div className="flex gap-2 items-center justify-between px-8 outline-none mt-5 w-[100%]">
      <div className="flex gap-2 my-4">
        <p className="font-medium">Select Brand</p>
        <select
          name=""
          id=""
          className="bg-[#EC2752] text-white rounded-lg outline-none px-2 py-1"
          onChange={handleBrandChange}
          value={selectedBrand?._id || ""}
        >
          <option value="" className="bg-white text-[#EC2752] font-medium">
            Choose Brand
          </option>
          {brandList?.map((item, index) => (
            <option
              key={index}
              className="bg-white text-[#EC2752] font-medium"
              value={item._id}
            >
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 my-4">
        <p className="font-medium">Select Device</p>
        <select
          className="bg-[#EC2752] text-white rounded-lg outline-none px-2 py-1"
          onChange={handleModelChange}
          value={
            selectedDevice?._id
              ? `${selectedDevice._id}|${selectedDevice.selectedConfig?._id}`
              : ""
          }
        >
          <option value="" className="bg-white text-[#EC2752] font-medium">
            Choose Device
          </option>
          {deviceList?.map((device) =>
            device.config.map((config) => (
              <option
                key={config._id}
                className="bg-white text-[#EC2752] font-medium"
                value={`${device._id}|${config._id}`} // Pass both device and config IDs
              >
                {`${device.name} (${config.storage} , ${config.RAM})`}
              </option>
            ))
          )}
        </select>
      </div>

      <button
        className={`${styles.bulkdown_button}`}
        onClick={() => {
          setUploadBox(true);
        }}
      >
        <FaUpload /> Bulk Upload
      </button>
    </div>
  </div>
  )
}

const UploadBox = ({ setUploadBox, uploadBox,handleExcelFileChange, brandList,setBrandID, file, brandID, getData}) => {
  const token = sessionStorage.getItem("authToken");
  const handleBulkSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("brandId", brandID);

    const url = `${
      import.meta.env.VITE_REACT_APP_ENDPOINT
    }/api/questionnaires/uploadQNA`;

    axios
      .post(url, formData, {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then(() => {
        toast.success("Succussfully Uploaded");
        setUploadBox(false);
        getData();
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to submit");
        setUploadBox(false);
      })
  };
  return (
    <React.Fragment>
    {uploadBox && (
      <div className="fixed top-0 left-0 z-48 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
        <div
          className={`${styles.err_mod_box} w-full max-w-lg p-6 bg-white rounded-lg shadow-lg`}
        >
          <form className="flex flex-col gap-4" onSubmit={handleBulkSubmit}>
            <div className="flex flex-col">
              <p className="mb-1 text-lg text-center text-slate-500">
                Upload QNA Sheet
              </p>
              <div className="flex gap-2 my-4">
                <p className="font-medium">Select Brand</p>
                <select
                  name=""
                  id=""
                  className="bg-[#EC2752] text-white rounded-lg outline-none px-2 py-1"
                  onChange={(e) => setBrandID(e.target.value)}
                >
                  <option
                    value=""
                    className="bg-white text-[#EC2752] font-medium"
                  >
                    Choose Brand
                  </option>
                  {brandList?.map((item, index) => (
                    <option
                      key={index}
                      className="bg-white text-[#EC2752] font-medium"
                      value={item._id}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
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
              <button
                type="submit"
                className="bg-[#EC2752] text-white px-4 py-2 rounded"
              >
                Upload
              </button>
              <button
                type="reset"
                onClick={() => {
                  setUploadBox(false);
                }}
                className="bg-white text-[#EC2752] px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
        </ React.Fragment>
  )
}
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
          <BeatLoader color={"#EC2752"} loading={isTableLoaded} size={15} />
        </div>
      )}
      {(sucBox || failBox) && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className={`${styles.err_mod_box} ${getTextColorClass(sucBox)}`}>
            {sucBox ? (
              <IoIosCheckmarkCircle
                className={`${getTextColorClass(sucBox)}`}
                size={90}
              />
            ) : (
              <IoIosCloseCircle
                className={`${getTextColorClass(sucBox)}`}
                size={90}
              />
            )}
            <h6 className={`${getTextColorClass(sucBox)}`}>
              {sucBox ? "Success!" : "Error!"}
            </h6>
            <p className="text-slate-500">{errMsg}</p>
            <button
              onClick={() => {
                setSucBox(false);
                setFailBox(false);
              }}
              className={sucBox ? "bg-green-500 text-white" : grestTheme}
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {confBox && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className={`${styles.err_mod_box} ${getTextColorClass(sucBox)}`}>
            <h6 className={`${getTextColorClass(sucBox)}`}>Confirmation!</h6>
            <p className="text-slate-500">
              {`Do you want to delete store - ${selectedModel} ?`} ?
            </p>
            <div className="flex flex-row gap-2">
              <button
                onClick={() => deleteHandler()}
                className={grestTheme}
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
      {/* <div className="m-2 flex  gap-2 items-center w-[100%]">
        <div className="flex gap-2">
          <p className="font-medium">Select Category</p>
          <select
            className="bg-[#EC2752] text-white rounded-lg outline-none px-2 py-1"
            onChange={(e) => setCategory(e.target.value)}
            value={category}
          >
            <option
              className="bg-white text-[#EC2752] font-medium"
              value="Mobile"
            >
              Mobile
            </option>
            <option
              className="bg-white text-[#EC2752] font-medium"
              value="Watch"
            >
              Watch
            </option>
          </select>
        </div>
      </div> */}
    </React.Fragment>
  );
};

export default AdminQuestion;
