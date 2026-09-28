import React,{ useState, useEffect } from "react";
import downArrow from "../assets/down.png";
import axios from "axios";
import { useDataContext } from "./dataContext";
import { useDispatch } from "react-redux";
import { BeatLoader } from "react-spinners";
import { setBrandID } from "../store/slices/adminAnswerSlice";
import { setMobileID, setStorage } from "../store/slices/newAdminGrade";

export default function AdminPhone_list() {
  const [data, setData] = useState([]);
  const [selectedPhone, setselectedPhone] = useState(null);
  const { dataModel, setdataModel } = useDataContext();
  const [selectedphone, setSelectedphone] = useState(null);

  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  function handlebrandClick(index) {
    if (selectedPhone === index) {
      setselectedPhone(null);
    } else {
      setselectedPhone(index);
    }
    const shallowCopy = { ...data[index] };
    setdataModel(shallowCopy);
    dispatch(setBrandID(shallowCopy?._id));
  }
  function handlemodel(index) {
    if (selectedphone === index) {
      setSelectedphone(null);
    } else {
      setSelectedphone(index);
    }

    const updatedDataModel = { ...dataModel };
    updatedDataModel.models = { ...data[selectedPhone].models[index] };


    setdataModel(updatedDataModel);
    dispatch(setMobileID(updatedDataModel?.models?._id));
  }

  // where we fetch data
  function handleData(index) {
    const updatedDataModel = { ...dataModel };
    updatedDataModel.models.config = {
      ...data[selectedPhone].models[selectedphone].config[index],
    };

    dispatch(setStorage(updatedDataModel?.models?.config?.storage));
    setdataModel(updatedDataModel);

    setSelectedphone(null);
    setselectedPhone(null);
  }

  useEffect(() => {
    const userToken = sessionStorage.getItem("authToken");
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/brands/getAllBrandsModels`, {
          headers: {
            authorization: `${userToken}`,
          },
        });
        setLoading(false);
        setData(response.data.data);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col w-auto h-auto overflow-auto MAIN_CONTAINER max-h-screen-4 ">
      {loading && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <BeatLoader color="var(--primary-color)" loading={loading} size={15} />
        </div>
      )}

      <div className="relative w-auto md:w-[80%] md:mx-auto h-screen  LIST_MODELS max-h-screen-4 transition ease-in-out duration-500">
        {data.map((brandData, index) => (
          <div
            key={brandData.brand._id}
            className="relative flex flex-col h-auto mx-6 model mt-7"
          >
            <div
              className={`flex  items-center justify-between p-3  bg-white rounded-lg  h-21 px-22 model  ${
                selectedPhone === index ? "bg-blue-300 " : ""
              }  `}
              onClick={() => {
                handlebrandClick(index);
              }}
            >
              <img
                src={brandData.brand.logo}
                alt="logo"
                className="w-24 h-12"
              />

              <p className="text-2xl ">{brandData.brand.name}</p>
            </div>
            {selectedPhone === index && (
              <div className="z-10 flex flex-col items-center justify-between text-xl h-21 px-22 top-20 md:text-3xl">
                {brandData.models.map((modelData, modelIndex) => (
                  <div
                    key={modelData._id}
                    className="flex flex-col items-center justify-between w-full gap-2 p-3 bg-white border-t-2 rounded h-21 px-22"
                  >
                    <div className="flex justify-between w-11/12 ">
                      <p className="">{modelData.name}</p>
                      <img
                        src={downArrow}
                        alt="arrow"
                        className={`h-5 w-12.5 transform -rotate-90 transition ease-in-out duration-500 ${
                          selectedphone === modelIndex ? "rotate-[-180]" : ""
                        }`}
                        onClick={() => {
                          handlemodel(modelIndex);
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap justify-between w-11/12 gap-2">
                      {selectedphone === modelIndex &&
                        Array.isArray(modelData.config) &&
                        modelData.config.map((option, i) => (
                          <div
                            key={i}
                            className="flex items-center"
                            onClick={() => {
                              handleData(i);
                            }}
                          >
                            <input
                              type="radio"
                              name="storage "
                              value={option.storage}
                              id={i}
                              className="w-4 h-5 border rounded-full outline-none sm:w-5 "
                            />
                            <label
                              htmlFor={i}
                              className="ml-1 text-xl cursor-pointer sm:ml-3 sm:text-xl md:text-3x"
                            >
                              {option.RAM}/{option.storage}
                            </label>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
