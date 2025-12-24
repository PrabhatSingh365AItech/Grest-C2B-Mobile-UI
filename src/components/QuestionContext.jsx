import React, { createContext, useContext, useState } from "react";

const QuestionContext = createContext();

export const useQuestionContext = () => {
  return useContext(QuestionContext);
};

export const QuestionProvider = ({ children }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [answersQuick, setAnswersQUICK] = useState([]);
  const [fromDateDup, setFromDateDup] = useState("");
  const [toDateDup, setToDateDup] = useState("");

  // Function to reset state
  const resetState = () => {
    setQuestions([]);
    setAnswers([]);
    setAnswersQUICK([]);
  };

  const Emptydate = () => {
    setFromDateDup("");
    setToDateDup("");
  };

  return (
    <QuestionContext.Provider
      value={{
        questions,
        setQuestions,
        answers,
        setAnswers,
        answersQuick,
        setAnswersQUICK,
        resetState,
        fromDateDup,
        setFromDateDup,
        toDateDup,
        setToDateDup,
        Emptydate,
      }}
    >
      {children}
    </QuestionContext.Provider>
  );
};
