import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    state: "",
    city: "",
    password: "",
  });
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const userRegister = () => {
    setError(null);
    axios
      .post(
        "https://phone-server-eosin.vercel.app/api/users/signUp",
        userDetails
      )
      .then((response) => {
        navigate("/");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "An error occurred.");
      });
  };
  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserDetails({ ...userDetails, [name]: value });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="p-10 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold">Login</h1>
        {error && <p className="text-red-500">{error}</p>}
        <form id="registerForm" className="space-y-5">
          <label htmlFor="name" className="block">
            Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={userDetails.name}
            onChange={handleChange}
            required
            className="block w-60 h-10 border rounded-lg focus:ring focus:ring-primary focus:outline-none pl-1"
          />
          <label htmlFor="email" className="block">
            Email:
          </label>
          <input
            type="text"
            id="email"
            name="email"
            value={userDetails.email}
            onChange={handleChange}
            required
            className="block w-60 h-10 border rounded-lg focus:ring focus:ring-primary focus:outline-none pl-1"
          />

          <label htmlFor="phoneNumber" className="block">
            Phone Number:
          </label>
          <input
            type="number"
            id="phoneNumber"
            name="phoneNumber"
            required
            value={userDetails.phoneNumber}
            onChange={handleChange}
            className="block w-60 h-10 border rounded-lg focus:ring focus:ring-primary focus:outline-none pl-1"
          />

          <label htmlFor="state" className="block">
            State:
          </label>
          <input
            type="text"
            id="state"
            name="state"
            required
            value={userDetails.state}
            onChange={handleChange}
            className="block w-60 h-10 border rounded-lg focus:ring focus:ring-primary focus:outline-none pl-1"
          />
          <label htmlFor="city" className="block">
            City:
          </label>
          <input
            type="text"
            id="city"
            name="city"
            required
            value={userDetails.city}
            onChange={handleChange}
            className="block w-60 h-10 border rounded-lg focus:ring focus:ring-primary focus:outline-none pl-1"
          />

          <label htmlFor="password" className="block">
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={userDetails.password}
            onChange={handleChange}
            className="block w-60 h-10 border rounded-lg focus:ring focus:ring-primary focus:outline-none pl-1"
          />

          <button
            onClick={userRegister}
            type="button"
            className="block w-60 h-12 bg-primary text-white rounded-lg mt-1"
          >
            Register
          </button>

          <span>
            Already have an account.{" "}
            <Link className="cursor-pointer text-primary" to="/">
              Login
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Register;
