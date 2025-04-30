import React, { useEffect, useState } from "react";
import { FaThumbsUp, FaComment } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

const SkillSharingCard = ({ skill, currentUser }) => {
  // State to keep track of like and comment counts
  const [likes, setLikes] = useState(skill.likedUsers?.length || 0);
  const [comments, setComments] = useState(45);

  // State to track if the logged-in user has liked or commented
  const [userLiked, setUserLiked] = useState(false); // Change to true if user liked
  const [userCommented, setUserCommented] = useState(false); // Change to true if user commented

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (skill.likedUsers && currentUser) {
      const liked = skill.likedUsers.some((u) => u.email === currentUser.email);
      setUserLiked(liked);
    }
    console.log("likedUsers", skill.likedUsers);
    console.log("currentUser", currentUser.email);
  }, [skill.likedUsers, currentUser]);

  // Handle like button click
  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token"); // or from context
      const res = await axios.put(
        `http://localhost:8080/api/skills/${skill.id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLikes(res.data.likeCount);
      setUserLiked(res.data.liked);
      localStorage.setItem(
        `liked_skill_${skill.id}`,
        res.data.liked ? "true" : "false"
      );
    } catch (error) {
      Swal.fire("Error", "Failed to update like", "error");
    }
  };

  // Handle comment button click
  const handleComment = () => {
    if (userCommented) {
      setComments(comments - 1); // Decrease comment count if the user has already commented
    } else {
      setComments(comments + 1); // Increase comment count if the user comments
    }
    setUserCommented(!userCommented); // Toggle comment state
  };

  const handleImagePreview = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const fetchLikedUsers = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/skills/${skill.id}/liked-users`
      );
      console.log("Liked Users:", res.data);
      Swal.fire({
        title: `<div style="font-size: 24px;">👍 Liked by</div>`,
        html: `<div style="text-align: left;">
                ${res.data
                  .map((u) => `<p>${u.username} (${u.email})</p>`)
                  .join("")}
              </div>`,
        icon: "info",
      });
    } catch (err) {
      Swal.fire("Error", "Failed to load liked users", "error");
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 mb-4">
      {/* Post Owner */}
      <div className="flex items-center mb-2">
        <div className="font-semibold text-lg text-gray-800">
          {skill.user ? skill.user.username : "Unknown User"}
        </div>
      </div>

      {/* Post Title */}
      <div className="text-xl font-semibold mb-2">{skill.title}</div>

      {/* Post Description */}
      <p className="text-gray-700">{skill.description}</p>

      {/* Post Image or Video */}
      <div className="mt-4">
        {skill.imageUrl && skill.imageUrl.endsWith(".mp4") ? (
          <video controls width="70%" height="auto">
            <source
              src={`http://localhost:8080/${skill.imageUrl}`}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={`http://localhost:8080/${skill.imageUrl}`}
            alt="Skill"
            className="cursor-pointer"
            style={{ maxWidth: "70%", height: "auto" }}
            onClick={handleImagePreview}
          />
        )}
      </div>

      {/* Like and Comment Icons with Counts */}
      <div className="flex justify-between items-center mt-4">
        {/* Like Button */}
        <div className="flex">
          <div
            className={`flex items-center cursor-pointer ${
              userLiked ? "text-blue-500" : "text-gray-500"
            }`}
            onClick={handleLike}
          >
            <FaThumbsUp className="mr-2 text-2xl" />
            <span>{likes}</span>
          </div>
          <div className="items-center">
            <button
              className="text-sm text-blue-500 ml-2"
              onClick={fetchLikedUsers}
            >
              View Likes
            </button>
          </div>
        </div>

        {/* Comment Button */}
        <div
          className={`flex items-center cursor-pointer ${
            userCommented ? "text-blue-500" : "text-gray-500"
          }`}
          onClick={handleComment}
        >
          <FaComment className="mr-2 text-2xl" />
          <span>{comments}</span>
        </div>
      </div>
      {/* Modal Preview for Images Only */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-4 rounded shadow-lg max-w-screen-xl max-h-screen overflow-auto"
            onClick={(e) => e.stopPropagation()} // Prevent closing modal on click inside
          >
            <img
              src={`http://localhost:8080/${skill.imageUrl}`}
              alt="Skill Preview"
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillSharingCard;
