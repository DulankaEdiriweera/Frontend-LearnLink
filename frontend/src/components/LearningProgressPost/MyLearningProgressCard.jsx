import React, { useState } from "react";
import { FaThumbsUp, FaComment } from "react-icons/fa";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import axios from "axios";
import Swal from "sweetalert2";

const MyLearningProgressCard = ({ progress, onDelete }) => {
  // State to keep track of likes
  const [likes, setLikes] = useState(progress.likedUsers ? progress.likedUsers.length : 0);
  
  // State to track if the logged-in user has liked this progress
  const [userLiked, setUserLiked] = useState(false); // Set to true if user already liked

  // State for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // State for edit form data
  const [editData, setEditData] = useState({
    title: progress.title,
    description: progress.description,
    template: progress.template,
    media: null,
  });

  // Handle like button click
  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:8080/api/learning-progress/${progress.id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update likes count based on the response
      setLikes(response.data.likeCount);
      setUserLiked(response.data.liked);
    } catch (error) {
      console.error("Error liking learning progress:", error);
      Swal.fire("Error!", "Failed to update like status", "error");
    }
  };

  // Handle media preview
  const handleMediaPreview = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Delete a learning progress post
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
  
    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/learning-progress/${progress.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      Swal.fire("Deleted!", "Your Learning Progress has been deleted.", "success");
      onDelete(progress.id); // Notify parent to remove the deleted card
    } catch (error) {
      console.error("Error deleting learning progress:", error);
      Swal.fire("Failed!", "Learning Progress could not be deleted.", "error");
    }
  };

  // Edit modal functions
  const openEditModal = () => {
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "media") {
      setEditData((prev) => ({ ...prev, media: files[0] }));
    } else {
      setEditData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSubmit = async () => {
    const token = localStorage.getItem("token");

    try {
      const formData = new FormData();
      formData.append("title", editData.title);
      formData.append("description", editData.description);
      formData.append("template", editData.template);
      if (editData.media) {
        formData.append("media", editData.media);
      }

      await axios.put(
        `http://localhost:8080/api/learning-progress/${progress.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Swal.fire("Success!", "Learning Progress updated successfully", "success");
      closeEditModal();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error updating learning progress:", error);
      Swal.fire("Error!", "Failed to update the Learning Progress", "error");
    }
  };

  // Format the date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if media is video or image by file extension
  const isVideo = (url) => {
    if (!url) return false;
    return url.toLowerCase().endsWith(".mp4") || 
           url.toLowerCase().endsWith(".webm") || 
           url.toLowerCase().endsWith(".mov");
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2 w-full">
        <div className="font-semibold text-lg text-gray-800">
          {progress.user ? progress.user.username : "Unknown User"}
        </div>
        
        <div className="text-sm text-gray-500">
          {formatDate(progress.createdAt)}
        </div>

        <div className="flex space-x-4 text-2xl ml-auto">
          <div className="cursor-pointer text-blue-600 flex items-center">
            <MdEdit onClick={openEditModal} className="mr-1" />
          </div>
          <div
            onClick={handleDelete}
            className="cursor-pointer text-red-600 flex items-center"
          >
            <MdDeleteForever className="mr-1" />
          </div>
        </div>
      </div>

      {/* Progress Title */}
      <div className="text-xl font-semibold mb-2">{progress.title}</div>

      {/* Progress Description */}
      <p className="text-gray-700 mb-3">{progress.description}</p>

      {/* Template Information */}
      <div className="mb-3 p-3 bg-gray-50 rounded">
        <div className="font-medium text-gray-700 mb-1">Template:</div>
        <p className="text-gray-600">{progress.template}</p>
      </div>

      {/* Media (if any) */}
      {progress.mediaUrl && (
        <div className="mt-4">
          {isVideo(progress.mediaUrl) ? (
            <video controls width="60%" height="auto">
              <source
                src={`http://localhost:8080/${progress.mediaUrl}`}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={`http://localhost:8080/${progress.mediaUrl}`}
              alt="Learning Progress"
              className="cursor-pointer"
              style={{ maxWidth: "60%", height: "auto" }}
              onClick={handleMediaPreview}
            />
          )}
        </div>
      )}

      {/* Like button with count */}
      <div className="flex justify-between items-center mt-4">
        <div
          className={`flex items-center cursor-pointer ${
            userLiked ? "text-blue-500" : "text-gray-500"
          }`}
          onClick={handleLike}
        >
          <FaThumbsUp className="mr-2 text-2xl" />
          <span>{likes}</span>
        </div>
      </div>

      {/* Modal Preview for Images Only */}
      {isModalOpen && progress.mediaUrl && !isVideo(progress.mediaUrl) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-4 rounded shadow-lg max-w-screen-xl max-h-screen overflow-auto"
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

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
          onClick={closeEditModal}
        >
          <div
            className="bg-white p-6 rounded-md w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Edit Learning Progress</h2>
            <input
              type="text"
              name="title"
              value={editData.title}
              onChange={handleEditChange}
              className="w-full border p-2 rounded mb-3"
              placeholder="Title"
            />
            <textarea
              name="description"
              value={editData.description}
              onChange={handleEditChange}
              className="w-full border p-2 rounded mb-3"
              rows="3"
              placeholder="Description"
            ></textarea>
            <textarea
              name="template"
              value={editData.template}
              onChange={handleEditChange}
              className="w-full border p-2 rounded mb-3"
              rows="3"
              placeholder="Template"
            ></textarea>
            
            {progress.mediaUrl && (
              <div className="mb-3">
                {isVideo(progress.mediaUrl) ? (
                  <video controls className="w-full h-auto">
                    <source
                      src={`http://localhost:8080/${progress.mediaUrl}`}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={`http://localhost:8080/${progress.mediaUrl}`}
                    alt="Current Preview"
                    className="w-full h-auto rounded"
                  />
                )}
              </div>
            )}
            
            <input
              type="file"
              name="media"
              onChange={handleEditChange}
              className="w-full border p-2 rounded mb-3"
            />

            <div className="flex justify-end">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
                onClick={closeEditModal}
              >
                Cancel
              </button>
              <button
                className="bg-blue-800 text-white px-4 py-2 rounded"
                onClick={handleEditSubmit}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLearningProgressCard;