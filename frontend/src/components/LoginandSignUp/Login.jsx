import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/Logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // To show loading state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setIsLoading(true); // Start loading

    try {
      // Make a POST request to the backend API for login
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email,
          password,
        }
      );

      // On success, store the JWT token (you can use localStorage or context)
      const { token, username, email: userEmail } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      localStorage.setItem("email", userEmail);

      setMessage("Login successful!");

      // Redirect to a different page after successful login (e.g., dashboard)
      navigate("/");
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data || "Login failed");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div className="h-screen flex">
      {/* Left side with Logo */}
      <div className="w-1/2 flex justify-center items-center">
        <img src={Logo} alt="Logo" className="w-full h-full object-contain" />
      </div>

      {/* Right side with Login Form */}
      <div className="w-1/2 flex justify-center items-center bg-gray-100">
        <div className="w-96 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>
          <form onSubmit={handleLogin}>
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
                required
                placeholder="Enter your email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

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
                required
                placeholder="Enter your password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition duration-300"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
            <p>{message}</p>
            {/* Sign Up Link */}
            <div className="mt-4 text-center">
              <p>
                If you don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-blue-500  hover:text-blue-600"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
