import React, { useState } from "react";
import axios from "axios";
import Logo from "../../assets/Logo.png";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/register",
        {
          username,
          email,
          password,
        }
      );
      // Checking if the response contains data and displaying success
      if (response.data) {
        Swal.fire({
          icon: "success",
          title: "Registration Successful",
          text: "You will be redirected to login.",
          timer: 2000,
          showConfirmButton: false,
        });

        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: error.response?.data || "Something went wrong",
      });
    }
  };

  return (
    <div className="h-screen flex">
      {/* Left side with Logo (can add logo if needed) */}
      <div className="w-1/2 flex justify-center items-center bg-gray-100">
        {/* Add logo here if you want */}
        <img src={Logo} alt="Logo" className="w-full h-auto object-contain" />
      </div>

      {/* Right side with Sign Up Form */}
      <div className="w-1/2 flex justify-center items-center bg-gray-100">
        <div className="w-96 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center">Sign Up</h2>
          <form onSubmit={handleRegister}>
            {/* Username Field */}
            <div className="mb-4">
              <label htmlFor="username" className="block text-lg font-medium">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email Field */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-lg font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-lg font-medium">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition duration-300"
            >
              Sign Up
            </button>
            <p>{message}</p>
          </form>

          {/* Already have an account? Login Link */}
          <div className="mt-4 text-center">
            <p>
              Already have an account?{" "}
              <a href="/login" className="text-blue-500 hover:text-blue-600">
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
