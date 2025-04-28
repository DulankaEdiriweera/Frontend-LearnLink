import React, { useEffect, useState } from "react";
import { navigation } from "./Navigation.js";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../../assets/Logo.png";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
const [username, setUsername] = useState("");
const [email, setEmail] = useState("");
useEffect(() => {
      const user = localStorage.getItem("username");
      if (user) {
        
        setUsername(user);
      }
      console.log(user)
    }, []);
 
    useEffect(() => {
        const email = localStorage.getItem("email");
        if (email) {
          
            setEmail(email);
        }
        console.log(email)
      }, []);


  const handleLogout = () => {
    // Clear user-related data
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    // Redirect to login page
    navigate("/login");
  };

  return (
    <div className="h-screen w-64 bg-slate-400 flex flex-col p-4 shadow-lg rounded-2xl mt-2 mb-2 ml-2">
      <div className="flex justify-center mb-6">
        <img src={Logo} alt="LearnLink Logo" className="h-auto w-auto" />
      </div>

      <nav className="flex flex-col gap-4 flex-grow">
        {navigation.map((item, index) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={index}
              to={item.path || "#"}
              className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
                isActive ? "bg-slate-300" : "hover:bg-slate-300"
              }`}
            >
              <div className="text-2xl">{item.icon}</div>
              <span className="text-lg">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="mt-6 p-4  text-left">
        <p className="font-semibold">{username}</p>
        <p className="text-sm text-gray-600">{email}</p>
        <button
          onClick={handleLogout}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navigation;
