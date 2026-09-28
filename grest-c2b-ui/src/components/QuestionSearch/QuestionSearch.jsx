import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import {
  updateCoreObject,
  updateCosmeticsObject,
  updateDisplayObject,
  updateFunctionalMajorObject,
  updateFunctionalMinorObject,
  updateWarrantyObject,
} from "../../store/slices/QNAslice";
import { useSelector } from "react-redux";
import store from "../../store/store";
const whiteText = "text-white";
const blackText = "text-black";
const pinkBg = "bg-primary";
const whiteBg = "bg-white";

const QuestionSearch = ({ setIsSearchOpen, state, imageMap }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const qnaAnswer = useSelector((AnsState) => AnsState.qna);
  const handleSearch = () => {
    const uniqueCaptions = new Set();

    const filtered = Object.entries(state)
      .flatMap(([groupKey, group], groupIndex) =>
        group.flatMap((question, questionIndex) =>
          question.options
            .filter((option) => {
              const isMatch =
                option.caption
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                question.quetion
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                groupKey.toLowerCase().includes(searchQuery.toLowerCase());
              if (
                isMatch &&
                !uniqueCaptions.has(option.caption.toLowerCase())
              ) {
                uniqueCaptions.add(option.caption.toLowerCase());
                return true;
              }
              return false;
            })
            .map((option, optionIndex) => ({
              ...option,
              yes: question.yes,
              no: question.no,
              questionTxt: question.quetion,
              originalOptionIndex: optionIndex,
              originalQuestionIndex: questionIndex,
              groupKey: groupKey,
            }))
        )
      )
      .slice(0, 6);
    setFilteredQuestions(filtered);
  };

  const handleChange = (event, index, group, optionIndex, yesKey, noKey) => {
    if (group === "Core") {
      store.dispatch(
        updateCoreObject({
          index: index,
          yesKey: yesKey,
          noKey: noKey,
          newKey: "yes",
          selectedIndex: optionIndex,
        })
      );
    } else if (group === "Cosmetics") {
      store.dispatch(
        updateCosmeticsObject({
          index: index,
          yesKey: yesKey,
          noKey: noKey,
          newKey: "yes",
          selectedIndex: optionIndex,
        })
      );
    } else if (group === "Display") {
      store.dispatch(
        updateDisplayObject({
          index: index,
          yesKey: yesKey,
          noKey: noKey,
          newKey: "yes",
          selectedIndex: optionIndex,
        })
      );
    } else if (group === "Functional_major") {
      store.dispatch(
        updateFunctionalMajorObject({
          index: index,
          yesKey: yesKey,
          noKey: noKey,
          newKey: "yes",
          selectedIndex: optionIndex,
        })
      );
    } else if (group === "Functional_minor") {
      store.dispatch(
        updateFunctionalMinorObject({
          index: index,
          yesKey: yesKey,
          noKey: noKey,
          newKey: "yes",
          selectedIndex: optionIndex,
        })
      );
    } else if (group === "Warranty") {
      store.dispatch(
        updateWarrantyObject({
          index: index,
          newAnswer: yesKey,
          newKey: "yes",
        })
      );
    }
  };
  useEffect(() => {
    if (searchQuery && searchQuery.length > 2) {
      handleSearch();
    }
  }, [searchQuery]);
  return (
    <>
      <div className="fixed top-0 left-0 w-full min-h-full bg-white z-50">
        <div className="bg-white py-4 px-8 rounded">
          <div
            className="flex items-center rounded-lg"
            style={{
              boxShadow:
                "1px 1px 2px 0px rgba(0, 0, 0, 0.158), 0px 0px 0px 0px rgba(0, 0, 0, 0.034)",
            }}
          >
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-1 bg-primary text-white rounded"
            >
              <IoClose size={30} />
            </button>
            <input
              type="text"
              name="Question"
              value={searchQuery}
              placeholder="Search Question..."
              autoFocus
              className="rounded-[.55rem] outline-none mx-auto"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={(e) => setSearchQuery("")}
              className="py-[7px] px-2 flex flex-col items-center justify-center bg-primary text-white rounded"
            >
              <p className="">Clear</p>
            </button>
          </div>
          <div className="w-[90%] mx-auto mt-4 flex flex-wrap gap-y-3 gap-x-[4%] justify-start flex-row">
            {filteredQuestions.map((data, index) => (
              <React.Fragment key={data._id}>
                <div
                  onClick={(e) => {
                    console.log(data);
                    console.log(
                      qnaAnswer[data.groupKey][data.originalQuestionIndex]
                        .selected[data.originalOptionIndex]
                    );
                    handleChange(
                      "xyz",
                      data.originalQuestionIndex,
                      data.groupKey,
                      data.originalOptionIndex,
                      data.yes,
                      data.no
                    );
                  }}
                  className={`flex flex-col items-center px-3 w-[48%] min-h-[150px] shadow-lg rounded-lg ${
                    !qnaAnswer[data.groupKey][data.originalQuestionIndex]
                      .selected[data.originalOptionIndex]
                      ? whiteBg
                      : pinkBg
                  }`}
                >
                  <div className="mt-3 mb-1 rounded-md overflow-hidden">
                    <img className="scale-[1.2]" src={imageMap[data.img]} />
                  </div>
                  <div className="border-t-[1.5px] w-full py-2">
                    <p
                      className={`text-xs font-medium text-center ${
                        !qnaAnswer[data.groupKey][data.originalQuestionIndex]
                          .selected[data.originalOptionIndex]
                          ? blackText
                          : whiteText
                      }`}
                    >
                      {data.caption}
                    </p>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default QuestionSearch;
