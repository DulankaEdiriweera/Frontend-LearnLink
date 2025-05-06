import React, { useEffect, useState } from "react";
import MyLearningProgressCard from "./MyLearningProgressCard";
import axios from "axios";
import Swal from "sweetalert2";

const MyLearningProgressPosts = () => {
  const token = localStorage.getItem("token"); // Get the saved JWT token
  const [progressPosts, setProgressPosts] = useState([]);
  const email = localStorage.getItem("email");

  useEffect(() => {
    // Fetch the learning progress posts from the backend
    const fetchLearningProgress = async () => {
      if (!token) {
        Swal.fire({
          icon: "warning",
          title: "Not Logged In",
          text: "Please log in to view your learning progress.",
        });
        return;
      }

      try {
        // Using the specific user endpoint from the backend
        const response = await axios.get("http://localhost:8080/api/learning-progress/user", {
          headers: {
            Authorization: `Bearer ${token}`, // Attach the token
          },
        });
        setProgressPosts(response.data); // Set the fetched progress posts in state
      } catch (error) {
        console.error("Error fetching learning progress:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch learning progress posts.",
        });
      }
    };

    fetchLearningProgress();
  }, [token]);

  // Handle deletion of a progress post
  const handleDeleteProgress = (id) => {
    setProgressPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
  };

  // If no posts are found
  if (progressPosts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Learning Progress Posts Yet</h2>
          <p className="text-gray-500">Start documenting your learning journey today!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="pt-10 pr-10">
        {/* The backend already returns posts in descending order by createdAt */}
        {progressPosts.map((post) => (
          <MyLearningProgressCard
            key={post.id}
            progress={post}
            onDelete={handleDeleteProgress}
          />
        ))}
      </div>
    </div>
  );
};

export default MyLearningProgressPosts;