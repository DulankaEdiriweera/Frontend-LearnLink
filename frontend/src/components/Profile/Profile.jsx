import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegUserCircle, FaCalendarAlt } from "react-icons/fa";
import { MdBusinessCenter, MdSchool } from "react-icons/md";
import profileBackground from "../../assets/profilebackground.png";
import Navigation from "../Navigation/Navigation.jsx";
import MySkillSharingPosts from "../SkillSharingPosts/MySkillSharingPosts.jsx";
import MyGoalTrackingPosts from "../GoalTracking/MyGoalTrakingPosts.jsx";

const UserProfile = () => {
  const [tab, setTab] = useState("mySkillSharingPosts");
  const navigate = useNavigate();

  const handleTabChange = (newTab) => {
    setTab(newTab);
  };

  const user = {
    username: "John Doe",
    handle: "@johndoe",
    bio: "Hello! I'm John, a passionate software engineer and lifelong learner.",
    work: "Working at ABC Company",
    studied: "Studied at XYZ University",
    joined: "Joined March 2023",
    followers: 1234,
    following: 567,
  };

  return (
    <div className="flex">
      <div className="mr-2">
        <Navigation />
      </div>
      <div className="h-screen bg-slate-100 p-4 flex-grow shadow-lg rounded-2xl mt-2 mb-2 ml-2 overflow-y-scroll scrollbar-hidden">
        {/* Banner with Back Icon */}
        <div className="relative w-full">
          <img
            src={profileBackground}
            alt="Profile Banner"
            className="w-full h-52 object-cover"
          />
          <div className="absolute top-36 left-6">
            <div className="w-28 h-28 bg-white rounded-full border-4 border-white shadow flex items-center justify-center">
              <FaRegUserCircle className="text-6xl text-gray-700" />
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="mt-16 px-6 lg:px-16">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {user.username}
              </h1>
              <p className="text-gray-500">{user.handle}</p>
            </div>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-full shadow hover:bg-blue-700 transition"
              onClick={() => navigate("/edit-profile", { state: user })}
            >
              Edit Profile
            </button>
          </div>

          {/* Bio */}
          <div className="mt-4 text-gray-700">
            <p>{user.bio}</p>
          </div>

          {/* Details */}
          <div className="mt-3 text-gray-600 space-y-2">
            <div className="flex items-center space-x-4">
              <MdBusinessCenter />
              <span>{user.work}</span>
            </div>
            <div className="flex items-center space-x-4">
              <MdSchool />
              <span>{user.studied}</span>
            </div>
            <div className="flex items-center space-x-4">
              <FaCalendarAlt />
              <span>{user.joined}</span>
            </div>
          </div>

          {/* Followers & Following */}
          <div className="mt-4 flex space-x-8 font-semibold text-gray-700">
            <span>
              {user.followers} <span className="text-gray-500">Followers</span>
            </span>
            <span>
              {user.following} <span className="text-gray-500">Following</span>
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex space-x-6 border-b border-gray-200">
            {[
              "mySkillSharingPosts",
              "learningPlan",
              "goalTracking",
              "learningProgress",
            ].map((item) => (
              <button
                key={item}
                onClick={() => handleTabChange(item)}
                className={`pb-2 capitalize ${
                  tab === item
                    ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                    : "text-gray-500"
                }`}
              >
                {item.replace(/([A-Z])/g, " $1")}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {tab === "mySkillSharingPosts" && <div><MySkillSharingPosts/></div>}
            {tab === "learningPlan" && <div>Learning Plan Content</div>}
            {tab === "goalTracking" && <div><MyGoalTrackingPosts/></div>}
            {tab === "learningProgress" && <div>Learning Progress Content</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
