import React, { useEffect, useState } from "react";
import Navigation from "../Navigation/Navigation.jsx";
import SkillSharingCard from "./SkillSharingCard.jsx";
import axios from "axios";
import SkillSharingRightPart from "./SkillSharingRightPart.jsx";
import Swal from "sweetalert2";

const SkillSharingFeed = () => {
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
      if (formData.file) {
        formDataToSend.append("file", formData.file);
      }

      const response = await axios.post(
        "http://localhost:8080/api/skills",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Post Created:", response.data);
      Swal.fire({
        icon: "success",
        title: "Post Created!",
        text: "Your skill-sharing post has been successfully uploaded.",
        timer: 2000,
        showConfirmButton: false,
      });
      

      // Reset form
      setFormData({
        title: "",
        description: "",
        file: null,
      });
      setPreview(null);
    } catch (error) {
      console.error("Error creating post:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data || "Failed to create post",
      });
    }
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
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

  //get all skills
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

  const userSkills = skills.filter((skill) => skill.user?.email !== email);

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
            <h2 className="text-2xl font-semibold mb-4">Create a Post</h2>
            <div>
              <label htmlFor="title" className="block text-lg font-medium">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-1/2 p-2 border rounded-lg"
                placeholder="Enter post title"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-lg font-medium"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-1/2 p-2 border rounded-lg"
                placeholder="Enter post description"
                rows="4"
                required
              />
            </div>

            <div>
              <label htmlFor="file" className="block text-lg font-medium">
                Attach Image or Video
              </label>
              <input
                type="file"
                id="file"
                name="file"
                onChange={handleFileChange}
                className="w-1/2 p-2 border rounded-lg"
                accept="image/*,video/*"
              />
            </div>
            {/* Display the image/video preview */}
            {preview && (
              <div className="mt-4">
                {formData.file && formData.file.type.startsWith("image") ? (
                  <img
                    src={preview}
                    alt="Selected Preview"
                    className="w-1/2 h-1/2 rounded-lg"
                  />
                ) : formData.file && formData.file.type.startsWith("video") ? (
                  <video controls className="w-full h-auto rounded-lg">
                    <source src={preview} type={formData.file.type} />
                    Your browser does not support the video tag.
                  </video>
                ) : null}
              </div>
            )}

            <button
              type="submit"
              className="w-1/6 py-2 mt-4 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-all duration-300"
            >
              Post
            </button>
          </form>
        </div>
        <div className="pt-10 pr-10">
          {[...userSkills].reverse().map((skill) => (
            <SkillSharingCard key={skill.id} skill={skill} />
          ))}
        </div>
      </div>
      <div>
        <SkillSharingRightPart/>
      </div>
    </div>
  );
};

export default SkillSharingFeed;
