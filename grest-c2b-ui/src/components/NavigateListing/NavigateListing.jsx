import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../NavigateTable/NavigateTable.module.css";

const NavigateListing = () => {
  const [selected, setSelected] = useState("leadscreated");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/customertable") {
      setSelected("leadscreated");
    } else if (location.pathname === "/leadscompleted") {
      setSelected("leadscompleted");
    } else if (location.pathname === "/quotescreated") {
      setSelected("quotescreated");
    }
  }, []);

  const handleTable = (tableName) => {
    setSelected(tableName);
    if (tableName === "leadscreated") {
      navigate("/customertable");
    } else if (tableName === "leadscompleted") {
      navigate("/leadscompleted");
    } else if (tableName === "quotescreated") {
      navigate("/quotescreated");
    }
  };

  return (
    <div className={`${styles.navigation_wrap}`}>
      <button
        onClick={() => handleTable("leadscreated")}
        className={`${
          selected === "leadscreated" ? styles.button_sel : styles.button_unsel
        }`}
      >
        Leads Created
      </button>
      <button
        onClick={() => handleTable("leadscompleted")}
        className={`${
          selected === "leadscompleted"
            ? styles.button_sel
            : styles.button_unsel
        }`}
      >
        Leads Completed
      </button>
      <button
        onClick={() => handleTable("quotescreated")}
        className={`${
          selected === "quotescreated" ? styles.button_sel : styles.button_unsel
        }`}
      >
        Quotes Created
      </button>
    </div>
  );
};

export default NavigateListing;
