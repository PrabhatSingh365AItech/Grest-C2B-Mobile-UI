import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDataContext } from "../components/dataContext";
const currentDomain = window.location.origin;
const DEFAULT_LOGO = "/Grest_Logo.jpg";
const BUYBACK_LOGO = "/Grest_Logo_2.jpg"; // Use your actual buyback logo

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL;
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO;
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";

export default function SelectBrand() {
  const [selectedPhone, setselectedPhone] = useState(null);
  const [data, setData] = useState([]);
  const [selectedphone, setSelectedphone] = useState(null);
  const { dataModel, setdataModel } = useDataContext();
  const [modelArrow, setModelArrow] = useState([]);
  const [brandArrows, setBrandArrows] = useState(Array(data.length).fill(true));
  const Navigate = useNavigate();

  function handlebrandClick(index) {
    const len = data[index].models.length;
    setModelArrow(Array(len).fill(true));

    const updatedBrandArrows = [...brandArrows];
    updatedBrandArrows[index] = !updatedBrandArrows[index];
    setBrandArrows(updatedBrandArrows);

    if (selectedPhone === index) {
      setselectedPhone(null);
    } else {
      setselectedPhone(index);
    }

    const shallowCopy = { ...data[index] };

    setdataModel(shallowCopy);
  }

  function handlemodel(index) {
    const updateModelArrows = [...modelArrow];
    updateModelArrows[index] = !updateModelArrows[index];
    setModelArrow(updateModelArrows);

    if (selectedphone === index) {
      setSelectedphone(null);
    } else {
      setSelectedphone(index);
    }

    const updatedDataModel = { ...dataModel };
    sessionStorage.setItem(
      "brandSelected",
      JSON.stringify(data[selectedPhone].models[index])
    );
    updatedDataModel.models = data[selectedPhone].models[index];
    setdataModel(updatedDataModel);
  }
  // where we fetch data
  function handleData(index) {
    const updatedDataModel = { ...dataModel };

    updatedDataModel.models.config =
      data[selectedPhone].models[selectedphone].config[index];
    setdataModel(updatedDataModel);
    localStorage.setItem("dataModel", JSON.stringify(dataModel));
    Navigate("/devicedetail");
  }

  useEffect(() => {
    const userToken = sessionStorage.getItem("authToken");
    const fetchData = async () => {
      try {
        const response = await axios.get(`${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/brands/getAllBrandsModels`, {
          headers: {
            authorization: `${userToken}`,
          },
        });
        setData(response.data.data);
        console.log("mobile data", response.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col w-screen h-screen overflow-auto MAIN_CONTAINER max-h-screen-4">
      <div className="flex items-center w-screen py-4 h-24 bg-white">
        <div className="flex items-center justify-between w-full ">
          <span className="w-4/5 text-xl md:text-3xl ml-4">
            Select Brand/Model
          </span>
          <img className="w-36 sm:w-40" src={GREST_LOGO} alt="" />
        </div>
      </div>

      <div></div>

      <div className="relative w-screen md:w-[80%] md:mx-auto h-screen  LIST_MODELS max-h-screen-4 ">
        {data.map((dataItem, dataIndex) => (
          <div
            key={dataItem.brand._id}
            className="relative flex flex-col h-auto mx-6  model mt-7"
          >
            <div
              className={`flex  items-center justify-between p-3  bg-white rounded-lg  h-21 px-22 model  ${
                selectedPhone === dataIndex ? "bg-blue-300 " : ""
              }  `}
              onClick={() => {
                handlebrandClick(dataIndex);
              }}
            >
              <img src={dataItem.brand.logo} alt="logo" className="w-24 h-12" />

              {!brandArrows[dataIndex] ? (
                <RiArrowDownSLine size={30} />
              ) : (
                <RiArrowUpSLine size={30} />
              )}
            </div>
            {selectedPhone === dataIndex && (
              <div className=" z-10 flex flex-col items-center justify-between h-21 px-22 top-20 text-xl md:text-3xl">
                {dataItem.models.map((dataInItem, dataInIndex) => (
                  <div
                    key={dataInItem._id}
                    className="flex flex-col items-center justify-between w-full p-3 gap-2 bg-white border-t-2 rounded h-21 px-22"
                  >
                    <div
                      onClick={() => {
                        handlemodel(dataInIndex);
                      }}
                      className="flex items-center justify-between w-11/12 "
                    >
                      <p className="">{dataInItem.name}</p>
                      {modelArrow[dataInIndex] ? (
                        <RiArrowDownSLine size={30} />
                      ) : (
                        <RiArrowUpSLine size={30} />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 w-11/12 justify-between">
                      {selectedphone === dataInIndex &&
                        dataInItem.config.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex  items-center"
                            onClick={() => {
                              handleData(optionIndex);
                            }}
                          >
                            <input
                              type="radio"
                              name="storage "
                              value={option.storage}
                              id={optionIndex}
                              className="w-4 sm:w-5 h-5 border rounded-full outline-none "
                            />
                            <label
                              htmlFor={optionIndex}
                              className="cursor-pointer ml-1 sm:ml-3 text-xl sm:text-xl md:text-3x"
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
