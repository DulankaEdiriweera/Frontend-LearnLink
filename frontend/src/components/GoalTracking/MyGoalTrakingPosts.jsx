import React, { useEffect, useState } from "react";
import MyGoalTrackingCard from "./MyGoalTrackingCard";
import axios from "axios";
import Swal from "sweetalert2";

const MyGoalTrackingPosts = () => {
  const token = localStorage.getItem("token"); // Get the saved JWT token
  console.log(token);
  const [goals, setGoals] = useState([]);
  const email = localStorage.getItem("email");

  useEffect(() => {
    // Fetch the goals from the backend
    const fetchGoals = async () => {
      if (!token) {
        Swal.fire({
          icon: "warning",
          title: "Not Logged In",
          text: "Please log in to view your goals.",
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

  // Filter goals to only show the current user's goals
  const userGoals = goals.filter((goal) => goal.user?.email === email);

  // Delete a goal
  const handleDeleteGoal = (id) => {
    setGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== id));
  };

  return (
    <div>
      <div className="pt-10 pr-10">
        {[...userGoals].reverse().map((goal) => (
          <MyGoalTrackingCard
            key={goal.id}
            goal={goal}
            onDelete={handleDeleteGoal}
          />
        ))}
      </div>
    </div>
  );
};

export default MyGoalTrackingPosts;