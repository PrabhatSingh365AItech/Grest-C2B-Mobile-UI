import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const AdminFinalGradeTable = () => {
  const [questionnaireGroups, setQuestionnaireGroups] = useState([]);
  const adminAnswer = useSelector((state) => state.adminGradePrice);
  const result = JSON.parse(sessionStorage.getItem("combinationOutput"));
  const adminModelName = sessionStorage.getItem("adminModelName");
  const category = sessionStorage.getItem("admincategory");

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
        // Extract the `group` field from the questionnaire data
        setQuestionnaireGroups(response.data.data.map((q) => q._id));
      } catch (err) {
        setQuestionnaireGroups([]); // Fallback to an empty array on error
      }
    }
    getQuestionnaires();
  }, [category]);

  const rows = [
    { label: "Model Name", value: adminModelName, key: "ModelName" },
    { label: "Warranty", value: adminAnswer?.Warranty, key: "Warranty" },
    { label: "Core", value: adminAnswer?.Core, key: "Core" },
    { label: "Display", value: adminAnswer?.Display, key: "Display" },
    {
      label: "Major Functions",
      value: adminAnswer?.Functional_major,
      key: "Functional_major",
    },
    {
      label: "Minor Functions",
      value: adminAnswer?.Functional_minor,
      key: "Functional_minor",
    },
    { label: "Cosmetics", value: adminAnswer?.Cosmetics, key: "Cosmetics" },
    { label: "Physical", value: adminAnswer?.Physical, key: "Physical" },
    {
      label: "Accessories",
      value: adminAnswer?.Accessories,
      key: "Accessories",
    },
    { label: "Functional", value: adminAnswer?.Functional, key: "Functional" },
  ];

  return (
    <div className="m-2  w-[90%] overflow-x-auto md:m-5 ">
      <table className="w-full border-2 border-primary  ">
        <thead className="text-white bg-primary">
          <tr>
            <th className="p-2 text-sm md:p-3 md:text-base">Groups</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Values</th>
          </tr>
        </thead>
        <tbody>
          {rows
            .filter(
              (row) =>
                questionnaireGroups.includes(row.key) || row.key === "ModelName"
            )
            .map((row, index) => (
              <tr
                key={row.key}
                className={index % 2 === 0 ? "bg-gray-200" : ""}
              >
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {row.label}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {row.value}
                </td>
              </tr>
            ))}
          <tr className="bg-gray-200">
            <td className="p-2 text-sm text-center md:p-3 md:text-base">
              Final Grade
            </td>
            <td className="p-2 text-sm text-center md:p-3 md:text-base">
              {result?.grade}
            </td>
          </tr>
          <tr className="">
            <td className="p-2 text-sm text-center md:p-3 md:text-base">
              Pricing
            </td>
            <td className="p-2 text-sm text-center md:p-3 md:text-base">
              {result?.price}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AdminFinalGradeTable;
