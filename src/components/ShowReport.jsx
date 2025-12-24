import React, { useEffect, useState } from "react";
import axios from "axios";
import { IoCloseOutline } from "react-icons/io5";

const ShowReport = ({ id, setShowReportModel }) => {
  const userToken = sessionStorage.getItem("authToken");
  const [QNAData, setQNAData] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    const payload = {
      id: id,
    };
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/questionnaires/getSubmitedData`,
        payload,
        {
          headers: {
            Authorization: `${userToken}`,
          },
        }
      )
      .then((res) => {
        console.log("rsponse is", res.data.data.QNA);
        setQNAData(res.data.data.QNA);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    const flatQNA = [];
    QNAData.forEach((category) => {
      for (const group in category) {
        flatQNA.push(...category[group]);
      }
    });

    setData(flatQNA);
  }, [QNAData]);

  return data.length === 0 ? (
    <p>loading</p>
  ) : (
    <div className="fixed top-0 left-0 px-2 w-full h-full flex items-center justify-center z-50 bg-black   bg-opacity-50">
      <div className="p-4 rounded-lg bg-[#F5F4F9] shadow-md w-full md:max-w-lg  overflow-y-auto max-h-96 md:max-h-[90%]  relative">
        <IoCloseOutline
          onClick={() => setShowReportModel(false)}
          className="cursor-pointer sticky top-0 left-[700px] text-gray-500 hover:text-gray-700"
          size={24}
        />
        <h2 className="text-2xl font-semibold mb-4">Details</h2>
        <div className="my-4">
          <form>
            {data &&
              data.map((question, index) => (
                <div className="flex flex-col gap-4 mb-4" key={index}>
                  <div className="flex gap-1">
                    <p className="text-xl">{index + 1}.</p>
                    <p className="text-xl">{question.quetion}</p>
                  </div>
                  <div className="max-w-[200px] flex gap-20 ml-3">
                    <label className="text-primary font-medium">
                      <input
                        type="radio"
                        value="yes"
                        checked={question.key === "yes"}
                        readOnly
                      />{" "}
                      Yes
                    </label>
                    <label className="text-primary font-medium">
                      <input
                        type="radio"
                        value="no"
                        checked={question.key === "no"}
                        readOnly
                      />{" "}
                      No
                    </label>
                  </div>
                  <div className="border-b-2 opacity-10 border-[#9C9C9C] max-w-[500px]"></div>
                </div>
              ))}
          </form>
        </div>

        <button
          onClick={() => setShowReportModel(false)}
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-tertiary focus:outline-none"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ShowReport;
