import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
const currentDomain = window.location.origin;
const DEFAULT_LOGO = "/Grest_Logo.jpg";
const BUYBACK_LOGO = "/Grest_Logo_2.jpg"; // Use your actual buyback logo

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL;
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO;
import { useDispatch } from "react-redux";
import { setUserProfile } from "../store/slices/userSlice";
import "../styles/login.scss";
import { RiLockPasswordLine } from "react-icons/ri";
import {
  MdOutlineMailLock,
  MdOutlineLocationOn,
  MdOutlineStorefront,
} from "react-icons/md";
import LoadingSpinner from "../components/LoadingSpinner";
import { FaRegUser } from "react-icons/fa";
const iconStyles = { margin: "0px 10px", color: "var(--primary-color)" };
const AdminLogin = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [location, setLocation] = useState("");
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.clear();
    localStorage.clear();
  }, []);

  const userLogin = () => {
    setIsLoading(true);
    setError(null);
    axios
      .post(`${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/users/login`, {
        email: userEmail,
        password: userPassword,
      })
      .then((response) => {
        const { profile, authToken } = response.data;
        sessionStorage.setItem("authToken", authToken);
        sessionStorage.setItem("profile", JSON.stringify(profile));
        localStorage.removeItem("formData");
        dispatch(setUserProfile(profile));
        navigate("/adminhome");
      })
      .catch((err) => {
        setIsLoading(false);
        setError(
          err.response?.data?.error || "Please enter correct login credentials"
        );
      });
  };

  return (
    <div className="SuperContainer">
      <div className="flex items-center justify-center  bg-white Container">
        <div className=" flex flex-col items-center h-[95%]    justify-center px-10 pt-10  secondContainer">
          <img
            className="w-32 absolute top-6 "
            src={GREST_LOGO}
            alt="app logo"
          />
          {error && (
            <p className="text-sm text-red-500 sm:text-base">{error}</p>
          )}
          <div
            id="loginForm"
            className="flex flex-col  pb-6 gap-4 w-[32vw] formOuter"
          >
            <div>
              <label htmlFor="location">Location</label>
              <div className="input">
                <MdOutlineLocationOn
                  size={25}
                  style={iconStyles}
                />
                <input
                  type="text"
                  id="location"
                  name="location"
                  placeholder="Enter Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="relative block w-full px-2 py-1 rounded-none appearance-none rounded-b-md focus:outline-none focus:z-10 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="store">Store</label>
              <div className="input">
                <MdOutlineStorefront
                  size={25}
                  style={iconStyles}
                />
                <select
                  id="store"
                  name="store"
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className={` ${
                    selectedStore == null ? "text-[#9CA3BF]" : "text-black"
                  }  bg-[#f5f5f5] relative block w-full px-2 py-1 rounded-none appearance-none rounded-b-md focus:outline-none focus:z-10 sm:text-sm`}
                >
                  <option className="" value="">
                    Select Store
                  </option>
                  <option className="text-black" value="store1">
                    Store 1
                  </option>
                  <option className="text-black" value="store2">
                    Store 2
                  </option>
                  <option className="text-black" value="store3">
                    Store 3
                  </option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="user">User</label>
              <div className="input">
                <FaRegUser
                  size={25}
                  style={iconStyles}
                />
                <select
                  id="user"
                  name="user"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className={` ${
                    selectedUser == null ? "text-[#9CA3BF]" : "text-black"
                  } bg-[#f5f5f5]   relative block w-full px-2 py-1 rounded-none appearance-none rounded-b-md focus:outline-none focus:z-10 sm:text-sm`}
                >
                  <option className="text-black" value="">
                    Select User
                  </option>
                  <option className="text-black" value="admin">
                    Admin
                  </option>
                  <option className="text-black" value="superadmin">
                    Super Admin 2
                  </option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="userEmail">Email</label>
              <div className="input">
                <MdOutlineMailLock
                  size={25}
                  style={iconStyles}
                />
                <input
                  type="text"
                  id="userEmail"
                  name="userEmail"
                  placeholder="Enter email address"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                  className="relative block w-full px-2 py-1 rounded-none appearance-none rounded-b-md focus:outline-none focus:z-10 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <div className="input">
                <RiLockPasswordLine
                  size={25}
                  style={iconStyles}
                />
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter password"
                  required
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="relative block w-full px-2 py-1 rounded-none appearance-none rounded-b-md focus:outline-none focus:z-10 sm:text-sm"
                />
              </div>
            </div>
            <Link to="/PasswordRecovery">
              <span className="text-right text-sm font-medium block text-[rgb(236,39,82)] forgetpass">
                Forget Password?
              </span>
            </Link>
            <Link to="/adminlogin" className="login_button_holder">
              <button
                onClick={userLogin}
                className={`login_button ${isLoading && "opacity-[.9]"}`}
                type="button"
                disabled={isLoading}
              >
                {isLoading && (
                  <div className="spinner">
                    <LoadingSpinner />
                  </div>
                )}
                {isLoading ? (
                  <span className="-ml-4">Loading</span>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
