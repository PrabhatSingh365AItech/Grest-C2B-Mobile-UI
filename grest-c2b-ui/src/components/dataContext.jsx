import React, { createContext, useContext, useState } from "react";


// Create the context
const DataContext = createContext();

export const useDataContext = () => {
  return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
  const [dataModel, setdataModel] = useState({});

  return (
    <DataContext.Provider value={{ dataModel, setdataModel }}>
      {children}
    </DataContext.Provider>
  );
};
