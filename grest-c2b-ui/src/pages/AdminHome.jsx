import React, { useState } from "react";
import AdminQuestionTable from "../components/AdminQuestionTable";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AdminNavbar from "../components/Admin_Navbar";
import SideMenu from "../components/SideMenu";
import Footer from "../components/Footer";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaDownload } from "react-icons/fa";
import styless from "../pages/AdminModels/AdminModels.module.css";
import { IoMdAddCircle } from "react-icons/io";
import * as XLSX from "xlsx";
const navAdminFnlGrd = "/adminfinalgrade";

const options = {
  Functional_major: ["F1.1", "F1.2", "F1.3"],
  Core: ["C1", "C2"],
  Display: ["D1", "D2", "D3"],
  Functional_minor: ["F2.1", "F2.2", "F2.3"],
  Cosmetics: ["A1", "A2", "A3", "A4"],
  Warranty: ["W1", "W2"],
};

const AdminHome = () => {
  const [sideMenu, setsideMenu] = useState(false);
  const [qsModel, setQsmodel] = useState(false);
  const storedCategory = sessionStorage.getItem("admincategory");
  const navigate = useNavigate();
  const adminAnswer = useSelector((state) => state.adminGradePrice);
  const [group, setGroup] = useState("");
  const [question, setQuestion] = useState("");
  const [yes, setYes] = useState("");
  const [no, setNo] = useState("");
  const [defaultOption, setDefault] = useState("");
  const [updateTable, steUpdatetable] = useState(false);

  const handleNext = () => {
      const userToken = sessionStorage.getItem("authToken");
      axios
        .post(
          `${
            import.meta.env.VITE_REACT_APP_ENDPOINT
          }/api/prospects/Admincalculate`,
          { adminAnswer: adminAnswer, deviceType: storedCategory },
          {
            headers: {
              Authorization: `${userToken}`,
            },
          }
        )
        .then((res) => {
          console.log("res is ", res.data.data);
          sessionStorage.setItem(
            "combinationOutput",
            JSON.stringify(res.data.data)
          );
          navigate(navAdminFnlGrd);
        })
        .catch((err) => {
          console.log(err);
          toast.error("error occur");
          navigate(navAdminFnlGrd);
        });
  };

  function handleEdit() {
    setQsmodel(true);
    console.log(qsModel);
  }

  const downloadExcel = async () => {
    const authToken = sessionStorage.getItem("authToken");
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/questionnaires/questionnaireList?deviceType=${storedCategory}`,
        {
          headers: {
            authorization: `${authToken}`,
          },
        }
      );

      const sortedData = response.data.data;

      const formattedData = sortedData
        .map((item) => {
          return item.data.map((subItem) => {
            return {
              Group: subItem.group,
              Question: subItem.quetion,
              Yes: subItem.yes,
              No: subItem.no,
              Default: subItem.default,
            };
          });
        })
        .flat();
      const fileType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
      const fileExtension = ".xlsx";

      const formattedDataa = formattedData;

      const ws = XLSX.utils.json_to_sheet(formattedDataa);
      const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

      const dataFile = new Blob([excelBuffer], { type: fileType });
      saveAs(dataFile, "question code data" + fileExtension);
    } catch (err) {
      console.error(err);
    }
  };

  function handleSubmit(e) {
    e.preventDefault();
    console.log("hello");
    const data = {
      group: group,
      quetion: question,
      yes: yes,
      no: no,
      default: defaultOption,
    };

    const userToken = sessionStorage.getItem("authToken");
    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/questionnaires/add`,
        data,
        {
          headers: {
            Authorization: `${userToken}`,
          },
        }
      )
      .then((res) => {
        toast.success("question added successfully");
        setQsmodel(false);
        steUpdatetable(!updateTable);
      })
      .catch((err) => {
        console.log(err);
        toast.error("error question creation failed ");
      });
  }

  function closeHandler() {
    setQsmodel(false);
  }
  return (
    <>
      {qsModel && (
        <div
          style={{
            boxShadow:
              "rgba(0, 0, 0, 0.3) 0px 0px 10px, rgba(0, 0, 0, 0.1) 0px 5px 12px",
          }}
          className="fixed top-0 left-0 z-49 flex items-center justify-center w-full h-full bg-white z-[1000]"
        >
          <CreateQuestion
            closeHandler={closeHandler}
            setGroup={setGroup}
            question={question}
            setQuestion={setQuestion}
            setYes={setYes}
            group={group}
            setNo={setNo}
            setDefault={setDefault}
            handleSubmit={handleSubmit}
          />
        </div>
      )}

      <div className="flex flex-col mainconatiner">
        <div className="navbar">
          <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
          <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
        </div>

        <div className="flex justify-start mx-auto flex-wrap gap-2 mb-2 w-[90%] mt-2">
          <button className={`${styless.bulkdown_button}`} onClick={handleEdit}>
            <IoMdAddCircle />
            Add New Question
          </button>

          <button
            className={`${styless.bulkdown_button}`}
            onClick={downloadExcel}
          >
            <FaDownload /> Bulk Download
          </button>
        </div>

        <div className="flex items-center justify-center tableconatiner">
          <AdminQuestionTable
            updateTable={updateTable}
            steUpdatetable={steUpdatetable}
          />
        </div>
        <div className="flex justify-center mb-2">
          <button
            onClick={handleNext}
            className="text-center  mx-2 px-4 py-2 rounded-lg bg-primary text-white cursor-pointer"
          >
            Next
          </button>
        </div>
        <Footer />
      </div>
    </>
  );
};

const CreateQuestion = ({
  closeHandler,
  setGroup,
  question,
  setQuestion,
  setYes,
  group,
  setNo,
  setDefault,
  handleSubmit,
}) => {
  return (
    <div className="flex flex-col  w-[900px]">
      <div className="relative flex flex-col gap-2 pb-2 mb-6 ml-10 mr-10 border-b-2">
        <IoClose
          size={35}
          className="absolute right-0 text-primary transition ease hover:rotate-[360deg] duration-500 cursor-pointer"
          onClick={closeHandler}
        />
        <p className="text-4xl font-bold">Add New Question</p>
        <p className="text-lg">All fields marked with * are required</p>
      </div>

      <div className="flex flex-col gap-4 ml-10">
        {/* //group */}
        <div>
          <p className="block text-xl font-medium">Select Question Group*</p>
          <select
            className="mt-1 p-2 w-[150px] sm:w-[250px] border rounded-md"
            name=""
            id=""
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
          <span className="text-xl font-medium">Enter your question? *</span>
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
            onChange={(e) => {
              setYes(e.target.value);
            }}
          >
            <option value="">Select Yes key</option>
            {group &&
              options[group].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
          </select>
        </div>
        <div>
          <p className="block text-xl font-medium">Select No key*</p>
          <select
            className="mt-1 p-2 w-[150px] sm:w-[250px] border rounded-md"
            name=""
            id=""
            onChange={(e) => {
              setNo(e.target.value);
            }}
          >
            <option value="">Select No key</option>
            {group &&
              options[group].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
          </select>
        </div>
        <div>
          <p className="block text-xl font-medium">Select Default key*</p>
          <select
            className="mt-1 p-2 w-[150px] sm:w-[250px] border rounded-md"
            name=""
            id=""
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
            onClick={handleSubmit}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
