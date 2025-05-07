import React, { useEffect, useState } from "react";
import { FaThumbsUp, FaComment } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

const LearningProgressCard = ({ progress, currentUser }) => {
  // State to keep track of like and comment counts
  const [likes, setLikes] = useState(progress.likedUsers?.length || 0);
  const [comments, setComments] = useState(0);

  // State to track if the logged-in user has liked or commented
  const [userLiked, setUserLiked] = useState(false);
  const [userCommented, setUserCommented] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (progress.likedUsers && currentUser) {
      const liked = progress.likedUsers.some((u) => u.email === currentUser.email);
      setUserLiked(liked);
    }
    console.log("likedUsers", progress.likedUsers);
    console.log("currentUser", currentUser.email);
  }, [progress.likedUsers, currentUser]);

  // Handle like button click
  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token"); // or from context
      const res = await axios.put(
        `http://localhost:8080/api/learning-progress/${progress.id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLikes(res.data.likeCount);
      setUserLiked(res.data.liked);
      localStorage.setItem(
        `liked_progress_${progress.id}`,
        res.data.liked ? "true" : "false"
      );
    } catch (error) {
      Swal.fire("Error", "Failed to update like", "error");
    }
  };

  // Handle comment button click - placeholder for future functionality
  const handleComment = () => {
    // This is a placeholder - actual implementation would connect to backend
    if (userCommented) {
      setComments(comments - 1);
    } else {
      setComments(comments + 1);
    }
    setUserCommented(!userCommented);
  };

  const handleMediaPreview = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const fetchLikedUsers = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/learning-progress/${progress.id}/liked-users`
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

  // Format the date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to render different templates
  const renderTemplate = (template) => {
    switch(template) {
      case 'milestone':
        return (
          <div className="bg-blue-50 dark:bg-blue-900 p-3 mt-2 rounded-lg border-l-4 border-blue-500">
            <span className="font-bold text-blue-700 dark:text-blue-300">🏆 Learning Milestone</span>
          </div>
        );
      case 'question':
        return (
          <div className="bg-yellow-50 dark:bg-yellow-900 p-3 mt-2 rounded-lg border-l-4 border-yellow-500">
            <span className="font-bold text-yellow-700 dark:text-yellow-300">❓ Question</span>
          </div>
        );
      case 'reflection':
        return (
          <div className="bg-purple-50 dark:bg-purple-900 p-3 mt-2 rounded-lg border-l-4 border-purple-500">
            <span className="font-bold text-purple-700 dark:text-purple-300">🤔 Reflection</span>
          </div>
        );
      default:
        return (
          <div className="bg-gray-50 dark:bg-gray-700 p-3 mt-2 rounded-lg border-l-4 border-gray-500">
            <span className="font-bold text-gray-700 dark:text-gray-300">📝 Learning Update</span>
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 mb-4">
      {/* Progress Owner and Date */}
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-lg text-gray-800 dark:text-white">
          {progress.user ? progress.user.username : "Unknown User"}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {progress.createdAt && formatDate(progress.createdAt)}
        </div>
      </div>

      {/* Template Type Indicator */}
      {renderTemplate(progress.template)}

      {/* Progress Title */}
      <div className="text-xl font-semibold my-2 text-gray-800 dark:text-white">{progress.title}</div>

      {/* Progress Description */}
      <p className="text-gray-700 dark:text-gray-300">{progress.description}</p>

      {/* Progress Media (if available) */}
      {progress.mediaUrl && (
        <div className="mt-4">
          {progress.mediaUrl.endsWith(".mp4") ? (
            <video controls width="70%" height="auto" className="rounded-lg">
              <source
                src={`http://localhost:8080/${progress.mediaUrl}`}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          ) : progress.mediaUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
            <img
              src={`http://localhost:8080/${progress.mediaUrl}`}
              alt="Learning Progress"
              className="cursor-pointer rounded-lg"
              style={{ maxWidth: "70%", height: "auto" }}
              onClick={handleMediaPreview}
            />
          ) : (
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              <a 
                href={`http://localhost:8080/${progress.mediaUrl}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View attached document
              </a>
            </div>
          )}
        </div>
      )}

      {/* Like and Comment Icons with Counts */}
      <div className="flex justify-between items-center mt-4">
        {/* Like Button */}
        <div className="flex">
          <div
            className={`flex items-center cursor-pointer ${
              userLiked ? "text-blue-500" : "text-gray-500 dark:text-gray-400"
            } hover:text-blue-600 transition`}
            onClick={handleLike}
          >
            <FaThumbsUp className="mr-2 text-2xl" />
            <span>{likes}</span>
          </div>
          {likes > 0 && (
            <div className="items-center">
              <button
                className="text-sm text-blue-500 ml-2 hover:text-blue-600"
                onClick={fetchLikedUsers}
              >
                View Likes
              </button>
            </div>
          )}
        </div>

        {/* Comment Button (placeholder for future functionality) */}
        <div
          className={`flex items-center cursor-pointer ${
            userCommented ? "text-blue-500" : "text-gray-500 dark:text-gray-400"
          } hover:text-blue-600 transition`}
          onClick={handleComment}
        >
          <FaComment className="mr-2 text-2xl" />
          <span>{comments}</span>
        </div>
      </div>

      {/* Modal Preview for Images Only */}
      {isModalOpen && progress.mediaUrl && progress.mediaUrl.match(/\.(jpeg|jpg|gif|png)$/i) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg max-w-screen-xl max-h-screen overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`http://localhost:8080/${progress.mediaUrl}`}
              alt="Learning Progress Preview"
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningProgressCard;