import React, { useEffect, useState } from "react";
import Navigation from "../Navigation/Navigation.jsx";
import LearningProgressCard from "./LearningProgressCard.jsx";
import axios from "axios";
import LearningProgressRightPart from "./LearningProgressRightPart.jsx";
import Swal from "sweetalert2";

const LearningProgressFeed = () => {
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");
  
  // Log the token to console when component mounts
  useEffect(() => {
    console.log("Authentication token:", token);
  }, [token]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    media: null,
    template: "default" // Default template type
  });

  const [preview, setPreview] = useState(null);
  const [progressList, setProgressList] = useState([]);

  // Template options for the dropdown
  const templateOptions = [
    { value: "default", label: "Learning Update" },
    { value: "milestone", label: "Milestone" },
    { value: "question", label: "Question" },
    { value: "reflection", label: "Reflection" }
  ];

  // Current user object for passing to the card component
  const currentUser = {
    email: email
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    setFormData({
      ...formData,
      media: file,
    });

    // Create a preview URL for the selected file
    if (file) {
      const filePreview = URL.createObjectURL(file);
      setPreview(filePreview);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!token) {
        Swal.fire({
          icon: "warning",
          title: "Not Logged In",
          text: "Please log in to create a learning progress update.",
        });
        return;
      }

      // Log token before API call
      console.log("Token being used for API call:", token);

      // Prepare form data for submission
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("template", formData.template);
      if (formData.media) {
        formDataToSend.append("media", formData.media);
      }

      const response = await axios.post(
        "http://localhost:8080/api/learning-progress",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Learning Progress Created:", response.data);
      Swal.fire({
        icon: "success",
        title: "Post Created!",
        text: "Your learning progress post has been successfully uploaded.",
        timer: 2000,
        showConfirmButton: false,
      });
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        media: null,
        template: "default"
      });
      setPreview(null);
      
      // Refresh the feed
      fetchLearningProgressUpdates();
    } catch (error) {
      console.error("Error creating learning progress post:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data || "Failed to create learning progress post",
      });
    }
  };

  // Fetch all learning progress updates
  const fetchLearningProgressUpdates = async () => {
    if (!token) {
      return;
    }

    try {
      // Log token before fetching data
      console.log("Token being used for fetching data:", token);
      
      const response = await axios.get("http://localhost:8080/api/learning-progress", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProgressList(response.data);
    } catch (error) {
      console.error("Error fetching learning progress updates:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch learning progress updates",
      });
    }
  };

  // Fetch learning progress updates on component mount and when token changes
  useEffect(() => {
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Not Logged In",
        text: "Please log in to view learning progress updates.",
      });
      return;
    }
    
    fetchLearningProgressUpdates();
  }, [token]);

  // Filter out the current user's learning progress updates
  const otherUsersProgress = progressList.filter(
    (progress) => progress.user?.email !== email
  );

  return (
    <div className="flex">
      <div className="mr-2">
        <Navigation />
      </div>
      <div className="h-screen bg-slate-100 p-4 flex-grow shadow-lg rounded-2xl mt-2 mb-2 ml-2 overflow-y-scroll scrollbar-hidden">
        <div>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 p-4 w-1/2 shadow-xl rounded-xl bg-white"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Share Your Learning Progress
            </h2>
            
            <div>
              <label htmlFor="title" className="block text-lg font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg bg-white text-gray-800"
                placeholder="What did you learn?"
                required
              />
            </div>

            <div>
              <label htmlFor="template" className="block text-lg font-medium text-gray-700">
                Update Type
              </label>
              <select
                id="template"
                name="template"
                value={formData.template}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg bg-white text-gray-800"
                required
              >
                {templateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-lg font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg bg-white text-gray-800"
                placeholder="Share details about your learning journey..."
                rows="4"
                required
              />
            </div>

            <div>
              <label htmlFor="media" className="block text-lg font-medium text-gray-700">
                Attach Media (Optional)
              </label>
              <input
                type="file"
                id="media"
                name="media"
                onChange={handleFileChange}
                className="w-full p-2 border rounded-lg bg-white text-gray-800"
                accept="image/*,video/*,application/pdf"
              />
              <p className="text-sm text-gray-500 mt-1">
                You can upload images, videos, or PDF files
              </p>
            </div>
            
            {/* Display the media preview */}
            {preview && (
              <div className="mt-4">
                {formData.media && formData.media.type.startsWith("image") ? (
                  <img
                    src={preview}
                    alt="Selected Preview"
                    className="w-1/2 h-auto rounded-lg border border-gray-300"
                  />
                ) : formData.media && formData.media.type.startsWith("video") ? (
                  <video controls className="w-1/2 h-auto rounded-lg border border-gray-300">
                    <source src={preview} type={formData.media.type} />
                    Your browser does not support the video tag.
                  </video>
                ) : formData.media ? (
                  <div className="w-1/2 p-4 rounded-lg border border-gray-300 bg-gray-50">
                    <p className="text-gray-700">
                      {formData.media.name} selected
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            <button
              type="submit"
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-300"
            >
              Share Progress
            </button>
          </form>
        </div>
        
        <div className="pt-10 pr-10">
          {[...otherUsersProgress].reverse().map((progress) => (
            <LearningProgressCard
              key={progress.id}
              progress={progress}
              currentUser={currentUser}
            />
          ))}
          
          {otherUsersProgress.length === 0 && (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-gray-600 text-lg">
                No learning progress updates from other users yet. Be the first to share!
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <LearningProgressRightPart />
      </div>
    </div>
  );
};

export default LearningProgressFeed;