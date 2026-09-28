import React, { useEffect, useState } from "react";
import User_Logo from "../../assets/User_Logo.jpg";
import AdminNavbar from "../../components/Admin_Navbar";
import SideMenu from "../../components/SideMenu";
import { MdModeEditOutline } from "react-icons/md";
import axios from "axios";
import styles from "./Profile.module.css";
import { BeatLoader } from "react-spinners";

const Profile = () => {
  const storedProfile = JSON.parse(sessionStorage.getItem("profile")) || {};
  const authToken = sessionStorage.getItem("authToken");
  const [sideMenu, setsideMenu] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    website: "",
    companyName: "",
    address: "",
    managerName: "",
    pincode: "",
    email: "",
    phoneNumber: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setProfile({
      firstName: storedProfile?.firstName || "",
      lastName: storedProfile?.lastName || "",
      website: storedProfile?.website || "",
      companyName: storedProfile?.companyName || "",
      address: storedProfile?.address || "",
      managerName: storedProfile?.managerName || "",
      pincode: storedProfile?.pincode || "",
      email: storedProfile?.email || "",
      phoneNumber: storedProfile?.phoneNumber || "",
    });
    console.log(storedProfile?.profileImage);
    setProfileImage(storedProfile?.profileImage || "");
  }, []);

  useEffect(() => {
    if (errorMsg !== "") {
      const timeoutId = setTimeout(() => {
        setErrorMsg("");
      }, 5000);
      return () => clearTimeout(timeoutId);
    } else {
      return () => {};
    }
  }, [errorMsg]);

  const handleUploadButtonClick = (e) => {
    e.preventDefault();
    document.getElementById("fileInput").click();
  };

  //upload image
  const handleFileInputChange = async (e) => {
    setIsTableLoaded(true);
    const file = e.target.files[0];
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("File size must be less than 2MB");
      setIsTableLoaded(false);
      return;
    }
    const formData = new FormData();
    formData.append("Profileimage", file);
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/profile/user/upload/Profile_image`,
        formData,
        {
          headers: {
            authorization: `${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        storedProfile.profileImage = response.data.profileImageLink;
        sessionStorage.setItem("profile", JSON.stringify(storedProfile));
        setProfileImage(response.data.profileImageLink);
        setIsTableLoaded(false);
        setErrorMsg("Successfully uploaded profile image");
        handleEditClick();
      }
    } catch (error) {
      console.error(
        "An error occurred while uploading the profile image:",
        error
      );
      setIsTableLoaded(false);
      setErrorMsg("Failed to upload profile image");
    }
  };

  // delte image
  const Deleteimage = async (e) => {
    e.preventDefault();
    setIsTableLoaded(true);
    try {
      const response = await axios.delete(
        `${
          import.meta.env.VITE_REACT_APP_ENDPOINT
        }/api/profile/user/delete/Profile_image`,
        {
          headers: {
            authorization: `${authToken}`,
          },
        }
      );
      if (response.status === 200) {
        storedProfile.profileImage = null;
        sessionStorage.setItem("profile", JSON.stringify(storedProfile));

        setProfileImage(null);
        setIsTableLoaded(false);
        setErrorMsg("Successfully deleted profile image");
        handleEditClick();
      } else {
        console.log("Failed to upload profile image");
        setIsTableLoaded(false);
        setErrorMsg("Failed to delete profile image");
      }
    } catch (error) {
      console.error(
        "An error occurred while uploading the profile image:",
        error
      );
      setIsTableLoaded(false);
      setErrorMsg("Failed to delete profile image");
    }
  };

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (event) => {
    setProfile({
      ...profile,
      [event.target.name]: event.target.value,
    });
  };

  const handleSaveClick = async (event) => {
    setIsTableLoaded(true);
    event.preventDefault();
    for (const key in profile) {
      if (profile[key].trim().length === 0) {
        setIsTableLoaded(false);
        setErrorMsg("Please fill all the fields.");
        return;
      }
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/profile/user/edit`,
        profile,
        {
          headers: {
            authorization: `${authToken}`,
          },
        }
      );
      if (response.status === 200) {
        console.log("Profile updated successfully");
        sessionStorage.setItem("profile", JSON.stringify(response.data.user));
        setIsEditing(false);
        setIsTableLoaded(false);
        setErrorMsg("Profile updated successfully");
      }
    } catch (error) {
      console.error("An error occurred while updating the profile:", error);
      setIsTableLoaded(false);
      setErrorMsg("Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen  pb-8 bg-[#F5F4F9] ">
      {isTableLoaded && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <BeatLoader color="var(--primary-color)" loading={isTableLoaded} size={15} />
        </div>
      )}
      <div className="navbar">
        <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      </div>
      <ProfileDetail
        errorMsg={errorMsg}
        profileImage={profileImage}
        isEditing={isEditing}
        handleUploadButtonClick={handleUploadButtonClick}
        handleFileInputChange={handleFileInputChange}
        Deleteimage={Deleteimage}
        handleEditClick={handleEditClick}
        profile={profile}
        handleInputChange={handleInputChange}
        handleSaveClick={handleSaveClick}
      />
    </div>
  );
};

const ProfileDetail = ({
  errorMsg,
  profileImage,
  isEditing,
  handleUploadButtonClick,
  handleFileInputChange,
  Deleteimage,
  handleEditClick,
  profile,
  handleInputChange,
  handleSaveClick,
}) => {
  return (
    <div
      style={{
        boxShadow:
          "rgba(0, 0, 0, 0.3) 0px 0px 10px, rgba(0, 0, 0, 0.1) 0px 5px 12px",
      }}
      className="items-center bg-white w-[900px] flex py-4 mx-auto mt-4 justify-center flex-col"
    >
      <div>
        <div className="flex flex-col justify-center items-center">
          <p className="text-4xl font-bold">Profile</p>
          <p className="font-medium text-primary">{errorMsg}</p>
        </div>
        <form className="w-[800px]  flex flex-col gap-2">
          <div className="flex justify-between ">
            <div className="right flex ">
              <div className="w-[100px] h-[100px] flex items-center justify-center">
                <img
                  className="w-[90%] h-[90%] rounded-full"
                  src={profileImage ? profileImage : User_Logo}
                  alt="img"
                />
              </div>
              {isEditing && (
                <div className="flex flex-col gap-2 items-baseline justify-end pb-2">
                  <button
                    onClick={handleUploadButtonClick}
                    className={styles.prof_button}
                  >
                    Upload New Picture
                  </button>
                  <input
                    id="fileInput"
                    type="file"
                    style={{ display: "none" }}
                    accept=".jpg, .jpeg, .png"
                    onChange={handleFileInputChange}
                  />
                  {profileImage && (
                    <button
                      onClick={Deleteimage}
                      className={styles.prof_button2}
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="left">
              {!isEditing && (
                <button
                  onClick={handleEditClick}
                  className={styles.prof_button}
                >
                  <MdModeEditOutline />
                  Edit
                </button>
              )}
            </div>
          </div>
          <div className="w-full flex gap-4">
            <ProfileDetailLabel
              spanText={"First Name"}
              profileValue={profile.firstName}
              inputName={"firstName"}
              handleInputChange={handleInputChange}
              isEditing={isEditing}
            />
            <ProfileDetailLabel
              spanText={"Last Name"}
              profileValue={profile.lastName}
              inputName={"lastName"}
              handleInputChange={handleInputChange}
              isEditing={isEditing}
            />
          </div>
          <div className="w-full flex gap-4">
            <ProfileDetailLabel
              spanText={"Email"}
              profileValue={profile.email}
              inputName={"email"}
              handleInputChange={handleInputChange}
              isEditing={isEditing}
            />
            <ProfileDetailLabel
              spanText={"Website"}
              profileValue={profile.website}
              inputName={"website"}
              handleInputChange={handleInputChange}
              isEditing={isEditing}
            />
          </div>
          <div className="w-full flex gap-4">
            <ProfileDetailLabel
              spanText={"Contact Number"}
              profileValue={profile.phoneNumber}
              inputName={"phoneNumber"}
              handleInputChange={handleInputChange}
              isEditing={isEditing}
            />
            <ProfileDetailLabel
              spanText={"Company Name"}
              profileValue={profile.companyName}
              inputName={"companyName"}
              handleInputChange={handleInputChange}
              isEditing={isEditing}
            />
          </div>
          <div className="w-full flex gap-4">
            <ProfileDetailLabel
              spanText={"Address"}
              profileValue={profile.address}
              inputName={"address"}
              handleInputChange={handleInputChange}
              isEditing={isEditing}
            />
            <ProfileDetailLabel
              spanText={"Manager Name"}
              profileValue={profile.managerName}
              inputName={"managerName"}
              handleInputChange={handleInputChange}
              isEditing={isEditing}
            />
          </div>
          <div className="w-full flex gap-4 items-center">
            <ProfileDetailLabel
              spanText={"Pin Code"}
              profileValue={profile.pincode}
              inputName={"pincode"}
              handleInputChange={handleInputChange}
              isEditing={isEditing}
            />
            {isEditing && (
              <div className={`flex flex-row gap-2 mt-8`}>
                <button
                  className={styles.prof_button}
                  onClick={handleSaveClick}
                >
                  Save Changes
                </button>
                <button
                  className={styles.prof_button2}
                  onClick={handleEditClick}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const ProfileDetailLabel = ({
  spanText,
  profileValue,
  inputName,
  handleInputChange,
  isEditing,
}) => {
  return (
    <label className="flex flex-col w-1/2 gap-2">
      <span className="font-medium text-xl">{spanText}</span>
      <input
        className="border-2 px-2 py-2 rounded-lg outline-none"
        type="text"
        name={inputName}
        value={profileValue}
        onChange={handleInputChange}
        disabled={!isEditing}
        required
      />
    </label>
  );
};

export default Profile;
