import React, { useEffect, useState } from "react";
import MySkillingSharingCard from "./MySkillingSharingCard";
import axios from "axios";
import Swal from "sweetalert2";

const MySkillSharingPosts = () => {
  const token = localStorage.getItem("token"); // Get the saved JWT token

  console.log(token);
  const [skills, setSkills] = useState([]);
  const email = localStorage.getItem("email");

  useEffect(() => {
    // Fetch the skills from the backend
    const fetchSkills = async () => {
      if (!token) {
        Swal.fire({
          icon: "warning",
          title: "Not Logged In",
          text: "Please log in to create a post.",
        });
        return;
      }

      try {
        const response = await axios.get("http://localhost:8080/api/skills", {
          headers: {
            Authorization: `Bearer ${token}`, // Attach the token
          },
        });
        setSkills(response.data); // Set the fetched skills in state
      } catch (error) {
        console.error("Error fetching skills:", error);
        alert("Failed to fetch skills");
      }
    };

    fetchSkills();
  }, [token]);

  const userSkills = skills.filter((skill) => skill.user?.email === email);

  //delete a post
  const handleDeleteSkill = (id) => {
    setSkills((prevSkills) => prevSkills.filter((skill) => skill.id !== id));
  };

  return (
    <div>
      <div className="pt-10 pr-10">
        {[...userSkills].reverse().map((skill) => (
          <MySkillingSharingCard
            key={skill.id}
            skill={skill}
            onDelete={handleDeleteSkill}
          />
        ))}
      </div>
    </div>
  );
};

export default MySkillSharingPosts;
