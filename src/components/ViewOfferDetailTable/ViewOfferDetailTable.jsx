import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import styles from "./ViewOfferDetailTable.module.css";
import { IoIosCheckmarkCircle, IoIosCloseCircle } from "react-icons/io";
import { BeatLoader } from "react-spinners";
const successColorClass = "text-green-500";
const errorColorClass = "text-primary";

const ViewOfferDetailTable = ({ searchValue }) => {
  const token = sessionStorage.getItem("authToken");
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [update, SetUpdate] = useState(false);
  const navigate = useNavigate();
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [sucBox, setSucBox] = useState(false);
  const [failBox, setFailBox] = useState(false);
  const [confBox, setConfBox] = useState(false);
  const [selectedOffId, setSelectedOffId] = useState();
  const [selectedOffName, setSelectedOffName] = useState();

  const handleEdit = (item, user) => {
    item.editoffer = true;
    sessionStorage.setItem("rowData", JSON.stringify(item));
    sessionStorage.setItem(
      "offerUserName",
      `${user.firstName} ${user.lastName}`
    );
    console.log("hello");
    navigate("/offers");
  };

  const deleteConfHandler = (offerID, offerName) => {
    setSelectedOffId(offerID);
    setSelectedOffName(offerName);
    setConfBox(true);
  };

  const handleDelete = (id) => {
    setIsTableLoaded(true);
    setConfBox(false);
    const userToken = sessionStorage.getItem("authToken");
    axios
      .delete(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/offer/delete/${id}`,
        {
          headers: {
            authorization: `${userToken}`,
          },
        }
      )
      .then((response) => {
        SetUpdate(!update);
        setErrMsg("Succesfully deleted offer - " + selectedOffName);
        setSucBox(true);
        setIsTableLoaded(false);
      })
      .catch(() => {
        setErrMsg("Failed to delete offer");
        setFailBox(true);
        setIsTableLoaded(false);
      });
  };

  useEffect(() => {
    const userToken = sessionStorage.getItem("authToken");
    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/offer/getOfferList?search=${searchValue}`,
        {
          headers: {
            authorization: `${userToken}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    const getData = () => {
      const config = {
        method: "get",
        url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/userregistry/all`,
        headers: { Authorization: token },
      };
      axios
        .request(config)
        .then((response) => {
          setUsers(response.data.data);
        })
        .catch((error) => {
          setErrMsg("Failed to load data");
        });
    };

    getData();
  }, [update, searchValue]);

  return (
    <div>
      {(sucBox || failBox) && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div
            className={`${styles.err_mod_box} ${
              sucBox ? successColorClass : errorColorClass
            }`}
          >
            {sucBox ? (
              <IoIosCheckmarkCircle
                className={sucBox ? successColorClass : errorColorClass}
                size={90}
              />
            ) : (
              <IoIosCloseCircle
                className={sucBox ? successColorClass : errorColorClass}
                size={90}
              />
            )}
            <h6 className={sucBox ? successColorClass : errorColorClass}>
              {sucBox ? "Success!" : "Error!"}
            </h6>
            <p className="text-slate-500">{errMsg}</p>
            <button
              onClick={() => {
                setSucBox(false);
                setFailBox(false);
              }}
              className={
                sucBox ? "bg-green-500 text-white" : "bg-primary text-white"
              }
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
            <p className="text-slate-500">
              {`Do you want to delete offer - ${selectedOffName} ?`}
            </p>
            <div className="flex flex-row gap-2">
              <button
                onClick={() => handleDelete(selectedOffId)}
                className={"bg-primary text-white"}
              >
                Okay
              </button>
              <button
                onClick={() => {
                  setConfBox(false);
                  setIsTableLoaded(false);
                }}
                className="bg-white text-primary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isTableLoaded && (
        <div className="fixed top-0 left-0 z-49 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <BeatLoader color="var(--primary-color)" loading={isTableLoaded} size={15} />
        </div>
      )}
      <ViewOfferDetailTableSub
        data={data}
        users={users}
        handleEdit={handleEdit}
        deleteConfHandler={deleteConfHandler}
      />
    </div>
  );
};

const ViewOfferDetailTableSub = ({
  data,
  users,
  handleEdit,
  deleteConfHandler,
}) => {
  return (
    <div className="m-2 overflow-x-auto md:m-5">
      <table className="w-full border border-primary">
        <thead className="bg-primary text-white">
          <tr>
            <th className="p-2 text-sm md:p-3 md:text-base">Offer Name</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Price</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Valid From</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Valid To</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Created By</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Warranty</th>
            <th className="p-2 text-sm md:p-3 md:text-base">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const user = users.find((val) => val._id === item.createdBy);

            return (
              <tr key={item._id}>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {item.offerName}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {item.price}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {new Date(item.validFrom).toLocaleDateString("en-GB")}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {new Date(item.validTo).toLocaleDateString("en-GB")}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {`${user?.firstName} ${user?.lastName}`}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  {item.warranty === true ? "True" : "False"}
                </td>
                <td className="p-2 text-sm text-center md:p-3 md:text-base">
                  <select
                    className=" bg-[#F5F4F9] font-medium rounded-lg w-[100px] outline-none"
                    onChange={(e) => {
                      if (e.target.value === "Edit") {
                        handleEdit(item, user);
                      }
                      if (e.target.value === "Delete") {
                        deleteConfHandler(item._id, item.offerName);
                      }
                    }}
                  >
                    <option value="">Choose Action</option>
                    <option value="Edit">Edit</option>
                    <option value="Delete">Delete</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ViewOfferDetailTable;
