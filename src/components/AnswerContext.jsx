import React, { createContext, useContext, useState } from "react";

const AnswerContext = createContext();

export function useAnswerContext() {
  return useContext(AnswerContext);
}

export function AnswerProvider({ children }) {
  const [filteredAnswers, setFormAnswers] = useState([]);

  return (
    <AnswerContext.Provider value={{ filteredAnswers, setFormAnswers }}>
      {children}
    </AnswerContext.Provider>
  );
}
