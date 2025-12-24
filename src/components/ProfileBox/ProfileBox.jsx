import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import User_Logo from "../../assets/User_Logo.jpg";
import { IoClose } from "react-icons/io5";
import styles from "./ProfileBox.module.css";
import { GiHamburgerMenu } from "react-icons/gi";
import axiosInstance from "../../utils/axiosInterceptor";

function setName(firstName, lastName) {
  if (!firstName && !lastName) {
      return "Sale User";
  }

  const fullName = lastName ? `${firstName} ${lastName}` : firstName;

  if (fullName.length > 20) {
      if (firstName.length > 20) {
          return lastName ? `${firstName.charAt(0)}. ${lastName}` : `${firstName.charAt(0)}.`;
      } else {
          return lastName ? `${firstName} ${lastName.charAt(0)}.` : firstName;
      }
  } else {
      return fullName;
  }
}

const ProfileBox = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState();
  const [userEmail, setUserEmail] = useState();
  const [userRole, setUserRole] = useState();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggenIn, setIsLoggedIn] = useState(false);
  const currentDomain = window.location.origin;


  useEffect(() => {
    const LoggedInUser = JSON.parse(sessionStorage.getItem("profile"));
    setUserName(setName(LoggedInUser?.firstName, LoggedInUser?.lastName));
    setUserEmail(LoggedInUser?.email);
    setUserRole(LoggedInUser?.role);
    if (LoggedInUser?.name) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [isLoggenIn]);

  const profileHandler = () => {
    setProfileOpen(!profileOpen);
  };

  const logoutHandler = async () => {
    setProfileOpen(false);

    try {
      // Call backend logout endpoint to invalidate session
      await axiosInstance.post('/api/userregistry/logout');
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear all client-side data
      localStorage.clear();
      sessionStorage.clear();
      setIsLoggedIn(false);
      navigate("/");
    }
  };

  const handlePwdChange = () => {
    navigate("/changepassword");
  };
  if (currentDomain === import.meta.env.VITE_BUYBACK_URL) {
    return     <div className="select-none flex ml-4 z-40 gap-2  flex-row-reverse items-center">
          </div>
  }

  return (
    <div className="select-none flex ml-4 z-40 gap-2 flex-row-reverse items-center">
      <GiHamburgerMenu size={24} className="w-[60px]" onClick={profileHandler}/>
      <p className=" text-base  md:text-xl">{userName}</p>
      <img
        className="w-[30px]"
        src={User_Logo}
        alt=""
      />
      {isLoggenIn && (
        <div
          className={`${styles.prof_box_wrap} ${
            !profileOpen && styles.prof_box_hide
          }`}
        >
          <div className={`${styles.prof_box}  w-full`}>
            <div className={`${styles.prof_head}`}>
              <img className="w-[30px]" src={User_Logo} />
              <p className="text-lg ml-3 font-medium opacity-70">
                {`${userName}, ${userRole}`}
              </p>
              <IoClose
                onClick={profileHandler}
                size={30}
                className="absolute right-0 text-primary"
              />
            </div>
            <p className="font-medium underline text-primary">{userEmail}</p>
            <div className={`${styles.button_wrap}`}>
              <button onClick={handlePwdChange}>Change Password</button>
            </div>
            <div className={`${styles.button_wrap}`}>
              <button onClick={logoutHandler}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileBox;
