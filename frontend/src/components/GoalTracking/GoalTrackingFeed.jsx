import React, { useEffect, useState } from "react";
import Navigation from "../Navigation/Navigation.jsx";
import GoalCard from "./GoalTrackingCard.jsx";
import axios from "axios";
import GoalTrackingRightPart from "./GoalTrackingRightPart.jsx";
import Swal from "sweetalert2";

const GoalTrackingFeed = () => {
  const token = localStorage.getItem("token"); // Get the saved JWT token

  console.log(token);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!token) {
        alert("User not logged in");
        return;
      }

      // Prepare form data
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("startDate", formData.startDate);
      formDataToSend.append("dueDate", formData.dueDate);
      if (formData.file) {
        formDataToSend.append("file", formData.file);
      }

      const response = await axios.post(
        "http://localhost:8080/api/Goals",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Goal Created:", response.data);
      Swal.fire({
        icon: "success",
        title: "Goal Created!",
        text: "Your goal tracking post has been successfully uploaded.",
        timer: 2000,
        showConfirmButton: false,
      });
      

      // Reset form
      setFormData({
        title: "",
        description: "",
        startDate: "",
        dueDate: "",
        file: null,
      });
      setPreview(null);
    } catch (error) {
      console.error("Error creating goal:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data || "Failed to create goal",
      });
    }
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    dueDate: "",
    file: null,
  });

  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    setFormData({
      ...formData,
      file: file,
    });

    // Create a preview URL for the selected file
    if (file) {
      const filePreview = URL.createObjectURL(file);
      setPreview(filePreview);
    }
  };

  //get all goals
  const [goals, setGoals] = useState([]);
  const email = localStorage.getItem("email");

  useEffect(() => {
    // Fetch the goals from the backend
    const fetchGoals = async () => {
      if (!token) {
        Swal.fire({
          icon: "warning",
          title: "Not Logged In",
          text: "Please log in to create a goal.",
        });
        return;
      }

      try {
        const response = await axios.get("http://localhost:8080/api/Goals", {
          headers: {
            Authorization: `Bearer ${token}`, // Attach the token
          },
        });
        setGoals(response.data); // Set the fetched goals in state
      } catch (error) {
        console.error("Error fetching goals:", error);
        alert("Failed to fetch goals");
      }
    };

    fetchGoals();
  }, [token]);

  const userGoals = goals.filter((goal) => goal.user?.email !== email);


// Optional: If you also have user ID and username saved
const currentUser = {
  email: email,
};


  return (
    <div className="flex">
      <div className="mr-2">
        <Navigation />
      </div>
      <div className="h-screen bg-slate-100 p-4 flex-grow shadow-lg rounded-2xl mt-2 mb-2 ml-2 overflow-y-scroll scrollbar-hidden">
        <div>
          <form
            onSubmit={handleSubmit}
            className="max-w-2xl w-full mx-auto bg-white shadow-xl rounded-xl p-8 border border-gray-200 mb-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-blue-800 border-b pb-3">Create a Goal</h2>
            
            <div className="mb-5">
              <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter goal title"
                required
              />
            </div>

            <div className="mb-5">
              <label
                htmlFor="description"
                className="block text-gray-700 font-medium mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter goal description"
                rows="4"
                required
              />
            </div>

            <div className="flex flex-wrap gap-6 mb-5">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="startDate" className="block text-gray-700 font-medium mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="dueDate" className="block text-gray-700 font-medium mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="file" className="block text-gray-700 font-medium mb-2">
                Attach Image
              </label>
              <input
                type="file"
                id="file"
                name="file"
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                accept="image/*,video/*"
              />
            </div>
            
            {/* Display the image/video preview */}
            {preview && (
              <div className="mb-6 mt-2">
                {formData.file && formData.file.type.startsWith("image") ? (
                  <div className="border border-gray-200 rounded-lg p-2 inline-block">
                    <img
                      src={preview}
                      alt="Selected Preview"
                      className="max-w-full h-auto rounded-lg max-h-60 object-contain"
                    />
                  </div>
                ) : formData.file && formData.file.type.startsWith("video") ? (
                  <video controls className="w-full h-auto rounded-lg max-h-60">
                    <source src={preview} type={formData.file.type} />
                    Your browser does not support the video tag.
                  </video>
                ) : null}
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Post Goal
            </button>
          </form>
        </div>
        <div className="pt-10 pr-10">
          {[...userGoals].reverse().map((goal) => (
            <GoalCard key={goal.id} goal={goal} currentUser={currentUser}/>
          ))}
        </div>
      </div>
      <div>
        <GoalTrackingRightPart/>
      </div>
    </div>
  );
};

export default GoalTrackingFeed;