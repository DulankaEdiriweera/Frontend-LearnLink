import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaRegUserCircle, FaPen, FaTimesCircle } from "react-icons/fa";
import profileBackground from "../../assets/profilebackground.png"; // default background
import axios from "axios";
import Navigation from "../Navigation/Navigation.jsx";

const EditProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(location.state || {});
  const [profileData, setProfileData] = useState({
    username: user.username || "",
    handle: user.handle || "",
    bio: user.bio || "",
    work: user.work || "",
    studied: user.studied || "",
  });

  const [profilePic, setProfilePic] = useState(null);
  const [backgroundImg, setBackgroundImg] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image upload
  // Store actual File object instead of blob URL
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file); // Store File object
    }
  };

  const handleBackgroundImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackgroundImg(file); // Store File object
    }
  };

  // Handle Clear image (reset to default)
  const handleClearProfilePic = () => {
    setProfilePic(null); // Reset to no profile pic
  };

  const handleClearBackgroundImg = () => {
    setBackgroundImg(null); // Reset to default background image
  };

  // Save changes
  const handleSave = async () => {
    const token = localStorage.getItem("token");

    // Prepare the form data
    const data = new FormData();
    data.append("username", profileData.username);
    data.append("handle", profileData.handle);
    data.append("bio", profileData.bio);
    data.append("work", profileData.work);
    data.append("studied", profileData.studied);

    // Check if the user selected a profile picture, and append it if so
    if (profilePic) {
      data.append("profilePic", profilePic);
    }

    // Check if the user selected a background image, and append it if so
    if (backgroundImg) {
      data.append("backgroundImg", backgroundImg);
    }

    try {
      // Send the data to the backend via PUT request
      const response = await axios.post(
        "http://localhost:8080/api/users/update",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // This is necessary for handling file uploads
          },
        }
      );

      // Debugging: Log the response to check if the update is successful
      console.log("Backend response:", response.data);

      // Handle response from the backend
      if (response.status === 200) {
        alert("Profile updated successfully!");
        navigate("/profile");
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("An error occurred while updating the profile.");
    }
  };

  // Cancel changes
  const handleCancel = () => {
    navigate("/profile"); // Redirect back to profile page without saving
  };

  return (
    <div className="flex">
      <div className="mr-2">
        <Navigation />
      </div>
      <div className="h-screen bg-slate-100 p-4 flex-grow shadow-lg rounded-2xl mt-2 mb-2 ml-2 overflow-y-scroll scrollbar-hidden">
        <div className="min-h-screen bg-gray-50">
          {/* Banner */}
          <div className="relative w-full">
            <img
              src={
                backgroundImg
                  ? URL.createObjectURL(backgroundImg)
                  : `http://localhost:8080/${user.backgroundImg}`
              }
              alt="Profile Banner"
              className="w-full h-52 object-cover"
            />

            <div className="absolute top-36 left-6">
              <div className="w-28 h-28 bg-white rounded-full border-4 border-white shadow flex items-center justify-center relative">
                {profilePic ? (
                  <img
                    src={
                      profilePic
                        ? URL.createObjectURL(profilePic)
                        : `http://localhost:8080/${user.profilePic}`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <FaRegUserCircle className="text-6xl text-gray-700" />
                )}

                {/* Edit icon on profile picture */}
                <label
                  htmlFor="profilePic"
                  className="absolute bottom-0 right-0 bg-white border-2 border-black text-black rounded-full p-2 cursor-pointer hover:bg-gray-200"
                >
                  <FaPen />
                </label>
                {/* Clear icon on profile picture */}
                {profilePic && (
                  <button
                    onClick={handleClearProfilePic}
                    className="absolute top-0 right-0 text-red-600 bg-white rounded-full p-1 cursor-pointer hover:bg-red-100"
                  >
                    <FaTimesCircle />
                  </button>
                )}
              </div>
              {/* Profile Picture Upload */}
              <input
                type="file"
                id="profilePic"
                name="profilePic"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="hidden"
              />
            </div>

            {/* Edit Icon for Background Image */}
            <div className="absolute top-4 right-6">
              <label
                htmlFor="backgroundImg"
                className="bg-white border-2 border-black text-black rounded-full p-2 cursor-pointer hover:bg-gray-200 flex justify-center items-center"
                style={{
                  width: "40px",
                  height: "40px",
                  boxSizing: "border-box",
                  padding: "6px",
                }}
              >
                <FaPen />
              </label>
              {/* Clear Icon for Background Image */}
              {backgroundImg && (
                <button
                  onClick={handleClearBackgroundImg}
                  className="absolute top-0 left-0 text-red-600 bg-white rounded-full p-1 cursor-pointer hover:bg-red-100"
                >
                  <FaTimesCircle />
                </button>
              )}
            </div>

            {/* Background Image Upload */}
            <input
              type="file"
              id="backgroundImg"
              name="backgroundImg"
              accept="image/*"
              onChange={handleBackgroundImgChange}
              className="hidden"
            />
          </div>

          {/* Edit Profile Form */}
          <div className="mt-16 px-6 lg:px-16 py-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Edit Profile
            </h1>
            <form className="space-y-6">
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-gray-700 font-medium"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={profileData.username || ""}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Handle */}
              <div>
                <label
                  htmlFor="handle"
                  className="block text-gray-700 font-medium"
                >
                  Handle
                </label>
                <input
                  type="text"
                  id="handle"
                  name="handle"
                  value={profileData.handle || ""}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Bio */}
              <div>
                <label
                  htmlFor="bio"
                  className="block text-gray-700 font-medium"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profileData.bio || ""}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  rows="4"
                />
              </div>

              {/* Work */}
              <div>
                <label
                  htmlFor="work"
                  className="block text-gray-700 font-medium"
                >
                  Work
                </label>
                <input
                  type="text"
                  id="work"
                  name="work"
                  value={profileData.work || ""}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Education */}
              <div>
                <label
                  htmlFor="studied"
                  className="block text-gray-700 font-medium"
                >
                  Studied At
                </label>
                <input
                  type="text"
                  id="studied"
                  name="studied"
                  value={profileData.studied || ""}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Save & Cancel Buttons */}
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-full shadow hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full shadow hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
