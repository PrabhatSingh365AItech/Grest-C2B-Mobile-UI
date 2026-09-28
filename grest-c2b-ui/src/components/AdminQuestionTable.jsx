import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setSelectedOptions } from "../store/slices/newAdminGrade";
import styles from "../pages/RegisterUserDetails/RegisterUserDetails.module.css";

import { MdEdit, MdDelete } from "react-icons/md";
import axios from "axios";
import { IoIosCheckmarkCircle, IoIosCloseCircle } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { toast } from "react-hot-toast";

const options = {
  Functional_major: ["F1.1", "F1.2", "F1.3"],
  Core: ["C1", "C2"],
  Display: ["D1", "D2", "D3"],
  Functional_minor: ["F2.1", "F2.2", "F2.3"],
  Cosmetics: ["A1", "A2", "A3", "A4"],
  Warranty: ["W1", "W2"],
  Accessories: ["A1.1", "A1.2", "A1.3"],
  Functional: ["F", "F1.1"],
  Physical: ["A1", "A2", "A3", "A0"],
};

  const questypes = [
    "Functional_major",
    "Core",
    "Display",
    "Functional_minor",
    "Cosmetics",
    "Warranty",
    "Accessories",
    "Functional",
    "Physical",
  ];
const successColorClass = "text-green-500";
const errorColorClass = "text-primary";

function sortQuestionnaires(data) {
  return data.sort((a, b) => {
    if (a._id < b._id) {
      return -1;
    }
    if (a._id > b._id) {
      return 1;
    }
    return 0;
  });
}

function filterQuestionnairesByType(data, typeList) {
  return data.filter((obj) => typeList.includes(obj._id));
}

const AdminQuestionTable = ({ updateTable, steUpdatetable }) => {
  const category = sessionStorage.getItem("admincategory");
  const [confBox, setConfBox] = useState(false);
  const [selectedUser, setSelectedUser] = useState();
  const [selectedUserqs, setSelectedUserqs] = useState();
  const [mobiledata, setMobile] = useState([]);
  const dispatch = useDispatch();
  const [group, setGroup] = useState("");
  const [question, setQuestion] = useState("");
  const [yes, setYes] = useState("");
  const [no, setNo] = useState("");
  const [defaultOption, setDefault] = useState("");
  const [idofqs, setIdofqs] = useState("");
  const [qsModel, setQsmodel] = useState(false);

  const deleteConfHandler = (userID, Quest) => {
    setSelectedUserqs(Quest);
    setSelectedUser(userID);
    setConfBox(true);
  };

  async function handleEdit(val) {
    setQsmodel(true);
    setGroup(val.group);
    setQuestion(val.quetion);
    setYes(val.yes);
    setNo(val.no);
    setDefault(val.default);
    setIdofqs(val._id);
  }

  useEffect(() => {
    async function getQuestionnaires() {
      const userToken = sessionStorage.getItem("authToken");
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_ENDPOINT
          }/api/questionnaires/questionnaireList?deviceType=${category}`,
          { headers: { authorization: userToken } }
        );
        return response.data.data;
      } catch (err) {
        return [];
      }
    }
    async function handleQuestionnaires() {
      const data = await getQuestionnaires();
      const sortedData = sortQuestionnaires(data);
      setMobile(sortedData);
    }
    handleQuestionnaires();
  }, [updateTable]);

  return (
    <>
      <ExtComps
        confBox={confBox}
        setConfBox={setConfBox}
        selectedUserqs={selectedUserqs}
        selectedUser={selectedUser}
        steUpdatetable={steUpdatetable}
        updateTable
      />
      <QSComp
        qsModel={qsModel}
        setQsmodel={setQsmodel}
        group={group}
        setGroup={setGroup}
        yes={yes}
        setYes={setYes}
        no={no}
        setNo={setNo}
        question={question}
        setQuestion={setQuestion}
        defaultOption={defaultOption}
        setDefault={setDefault}
        updateTable={updateTable}
        steUpdatetable={steUpdatetable}
        idofqs={idofqs}
      />
      <div className="m-2  w-[90%] overflow-x-auto md:m-5">
        <div className="min-w-max">
          <table className="w-full border border-primary">
            <thead className="bg-primary text-white">
              <tr>
                <th className="p-2 text-sm md:p-3 md:text-base w-[20%]">
                  Groups
                </th>
                <th className="text-left p-2 text-sm md:p-3 md:text-base w-[60%]">
                  Parameter
                </th>
                <th className="p-2 text-sm md:p-3 md:text-base w-[20%]">
                  Output
                </th>
              </tr>
            </thead>
            <tbody>
              {mobiledata.map((item, index) => (
                <tr
                  className={index % 2 === 0 ? "bg-gray-200" : ""}
                  key={index}
                >
                  <td className="p-2 text-sm text-center md:p-3 md:text-base">
                    {item._id}
                  </td>

                  <td className="w-1/3 p-2 text-sm md:p-3 md:text-base">
                    {item.data.map((value, index2) => (
                      <React.Fragment key={index2}>
                        <div className="di flex w-[full]" key={value?._id}>
                          <span className="mr-1">{index2 + 1}</span>
                          <p style={{ flexBasis: "70%" }}>-{value.quetion}</p>
                          <MdEdit
                            size={17}
                            className="mr-[8px]"
                            onClick={() => {
                              handleEdit(value);
                            }}
                          />{" "}
                          <MdDelete
                            size={17}
                            onClick={() => {
                              deleteConfHandler(value?._id, value?.quetion);
                            }}
                          />
                        </div>
                        <div className="mx-1 my-4 border-b-2 border-gray-400 border-dashed "></div>
                      </React.Fragment>
                    ))}
                  </td>
                  <td className="p-2 text-sm text-center md:p-3 md:text-base">
                    <select
                      onChange={(e) => {
                        dispatch(
                          setSelectedOptions({
                            id: item._id,
                            value: e.target.value,
                          })
                        );
                      }}
                      className="bg-[#F5F4F9]"
                    >
                      <option >
                        Select Code
                      </option>
                      {options[item._id]?.map((value, indexV) => (
                        <option key={indexV} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminQuestionTable;

const ExtComps = ({
  confBox,
  setConfBox,
  selectedUserqs,
  selectedUser,
  steUpdatetable,
  updateTable,
}) => {
  const [sucBox, setSucBox] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [failBox, setFailBox] = useState(false);

  function deleteHandler(qsid) {
    setConfBox(false);
    const userToken = sessionStorage.getItem("authToken");
    axios
      .delete(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/questionnaires/deleteById?id=${qsid}`,
        { headers: { Authorization: userToken } }
      )
      .then((res) => {
        setSucBox(true);
        steUpdatetable(!updateTable);
      })
      .catch((err) => {
        setFailBox(true);
        setErrMsg("Failed to delete Question");
      });
  }

  return (
    <React.Fragment>
      {sucBox && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className={`${styles.err_mod_box} ${successColorClass}`}>
            <IoIosCheckmarkCircle className={successColorClass} size={90} />
            <h6 className={successColorClass}>Success!</h6>
            <p className="text-slate-500">{errMsg}</p>
            <button
              onClick={() => {
                setSucBox(false);
              }}
              className={"bg-green-500 text-white"}
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {failBox && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className={`${styles.err_mod_box} ${errorColorClass}`}>
            <IoIosCloseCircle className={errorColorClass} size={90} />
            <h6 className={errorColorClass}>Error!</h6>
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
      )}
      {confBox && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className={`${styles.err_mod_box} ${errorColorClass}`}>
            <h6 className={errorColorClass}>Confirmation!</h6>
            <p className="block text-slate-500">
              Do you want to delete Question -
              <span className="block">{selectedUserqs}</span>
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
                }}
                className="bg-white text-primary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

const QSComp = ({
  qsModel,
  setQsmodel,
  group,
  setGroup,
  yes,
  setYes,
  no,
  setNo,
  question,
  setQuestion,
  defaultOption,
  setDefault,
  updateTable,
  steUpdatetable,
  idofqs,
}) => {
  function handleSubmitedit() {
    const data = {
      id: idofqs,
      group: group,
      quetion: question,
      yes: yes,
      no: no,
      default: defaultOption,
    };
    const userToken = sessionStorage.getItem("authToken");
    axios
      .put(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/questionnaires/edit`,
        data,
        { headers: { Authorization: userToken } }
      )
      .then((res) => {
        toast.success("question edit successfully");
        setQsmodel(false);
        steUpdatetable(!updateTable);
      })
      .catch((err) => {
        console.log(err);
        toast.error("error on question edit");
      });
  }
  return (
    <React.Fragment>
      {qsModel && (
        <div
          style={{
            boxShadow:
              "rgba(0, 0, 0, 0.3) 0px 0px 10px, rgba(0, 0, 0, 0.1) 0px 5px 12px",
          }}
          className="fixed top-0 left-0 z-49 flex items-center justify-center w-full h-full bg-white z-[1000]"
        >
          <div className="flex flex-col  w-[900px]">
            <div className="relative flex flex-col gap-2 pb-2 mb-6 ml-10 mr-10 border-b-2">
              <IoClose
                size={35}
                className="absolute right-0 text-primary transition ease hover:rotate-[360deg] duration-500 cursor-pointer"
                onClick={() => setQsmodel(false)}
              />
              <p className="text-4xl font-bold">Edit Question</p>
              <p className="text-lg">All fields marked with * are required</p>
            </div>
            <div className="flex flex-col gap-4 ml-10">
              <div>
                <p className="block text-xl font-medium">
                  Select Question Group*
                </p>
                <select
                  className="mt-1 p-2 w-[150px] sm:w-[250px] border rounded-md"
                  name=""
                  id=""
                  value={group}
                  onChange={(e) => {
                    setGroup(e.target.value);
                  }}
                >
                  <option value="">Select Group</option>
                  {Object.keys(options).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col w-[70%] gap-2">
                <span className="text-xl font-medium">Unique Id*</span>
                <input
                  className="px-2 py-2 mt-1 border-2 rounded-lg outline-none "
                  type="text"
                  name="uniqueId"
                  value={question}
                  required={true}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>
              <div>
                <p className="block text-xl font-medium">Select Yes key*</p>
                <select
                  className="mt-1 p-2 w-[150px] sm:w-[250px] border rounded-md"
                  name=""
                  id=""
                  value={yes}
                  onChange={(e) => setYes(e.target.value)}
                >
                  <option value="">Select Yes key</option>
                  {group &&
                    options[group].map((option, optionkey) => (
                      <option value={option} key={optionkey}>
                        {option}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <p className="block font-medium text-xl">Select No Key*</p>
                <select
                  className="rounded-md mt-1 p-2 w-[150px] sm:w-[250px] border"
                  id=""
                  name=""
                  value={no}
                  onChange={(e) => setNo(e.target.value)}
                >
                  <option value="">Select No Key</option>
                  {group &&
                    options[group].map((option, optionkey) => (
                      <option value={option} key={optionkey}>
                        {option}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <p className="block text-xl font-medium">Select Default Key*</p>
                <select
                  className="mt-1 p-2 w-[150px] rounded-md sm:w-[250px] border"
                  name=""
                  id=""
                  value={defaultOption}
                  onChange={(e) => {
                    setDefault(e.target.value);
                  }}
                >
                  <option value="">Select Default key</option>
                  {group &&
                    options[group].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                </select>
              </div>

              <div className="mt-8">
                <button
                  className="font-medium text-sm text-white p-3 rounded bg-primary"
                  onClick={handleSubmitedit}
                >
                  Update Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

const WatchComp = ({ watchdata, handleEdit, deleteConfHandler }) => {
  const dispatch = useDispatch();
  const category1 = sessionStorage.getItem("admincategory");
  return (
    <React.Fragment>
      {category1 === "CTG2" && (
        <table className="w-full border border-primary">
          <thead className="bg-primary text-white">
            <tr>
              <th className="p-2 text-sm md:p-3 md:text-base w-[20%]">
                Groups
              </th>
              <th className="text-left p-2 text-sm md:p-3 md:text-base w-[60%]">
                Parameter
              </th>
              <th className="p-2 text-sm md:p-3 md:text-base w-[20%]">
                Output
              </th>
            </tr>
          </thead>
          <tbody>
            {watchdata.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-200" : ""}>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {item._id}
                </td>
                <td className="w-1/3 p-2 text-sm md:p-3 md:text-base">
                  {item.data.map((value, itemindex) => (
                    <React.Fragment key={itemindex}>
                      <div className="di flex w-[full]" key={value?._id}>
                        <span className="mr-1">{itemindex + 1}</span>
                        <p style={{ flexBasis: "70%" }}>-{value.quetion}</p>
                        <MdEdit
                          className="mr-[8px]"
                          size={17}
                          onClick={() => {
                            handleEdit(value);
                          }}
                        />{" "}
                        <MdDelete
                          onClick={() => {
                            deleteConfHandler(value?._id, value?.quetion);
                          }}
                          size={17}
                        />
                      </div>
                      <div className="mx-1 my-4 border-b-2 border-gray-400 border-dashed "></div>
                    </React.Fragment>
                  ))}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  <select
                    className="bg-[#F5F4F9]"
                    onChange={(e) => {
                      dispatch(
                        setSelectedOptions({
                          value: e.target.value,
                          id: item._id,
                        })
                      );
                    }}
                  >
                    {options[item._id]?.map((value, vIndex) => (
                      <option key={vIndex} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </React.Fragment>
  );
};
