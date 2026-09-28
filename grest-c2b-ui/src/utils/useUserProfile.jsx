import React, { useEffect, useState } from "react";

const useUserProfile = () => {
  const [profile, setProfile] = useState({});

  useEffect(() => {
    const userDetails = sessionStorage.getItem("profile");
    setProfile(JSON.parse(userDetails));
  }, []);

  return profile;
};

export default useUserProfile;
