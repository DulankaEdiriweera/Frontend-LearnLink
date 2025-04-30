import React, { useState } from "react";
import { FaThumbsUp, FaComment } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import axios from "axios";
import Swal from "sweetalert2";

const MySkillingSharingCard = ({ skill, onDelete }) => {
  // State to keep track of like and comment counts
  const [likes, setLikes] = useState(120);
  const [comments, setComments] = useState(45);

  // State to track if the logged-in user has liked or commented
  const [userLiked, setUserLiked] = useState(false); // Change to true if user liked
  const [userCommented, setUserCommented] = useState(false); // Change to true if user commented

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle like button click
  const handleLike = () => {
    if (userLiked) {
      setLikes(likes - 1); // Decrease like count if the user has already liked
    } else {
      setLikes(likes + 1); // Increase like count if the user likes the post
    }
    setUserLiked(!userLiked); // Toggle like state
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

  //delete a post
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
      await axios.delete(`http://localhost:8080/api/skills/${skill.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      Swal.fire("Deleted!", "Your Skill Post has been deleted.", "success");
      onDelete(skill.id); // Notify parent to remove the deleted card
    } catch (error) {
      console.error("Error deleting skill:", error);
      Swal.fire("Failed!", "Skill Post could not be deleted.", "error");
    }
  };

  //edit a post
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    title: skill.title,
    description: skill.description,
    file: null,
  });

  const openEditModal = () => {
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setEditData((prev) => ({ ...prev, file: files[0] }));
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
      if (editData.file) {
        formData.append("file", editData.file);
      }

      await axios.put(
        `http://localhost:8080/api/skills/${skill.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Swal.fire("Success!", "Skill Post updated successfully", "success");
      closeEditModal();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      //window.location.reload(); // or trigger parent update
    } catch (error) {
      console.error("Error updating skill:", error);
      Swal.fire("Error!", "Failed to update the  Skill Post", "error");
    }
  };

  return (
    <div>
      <div className="bg-white shadow-lg rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2 w-full">
          <div className="font-semibold text-lg text-gray-800">
            {skill.user ? skill.user.username : "Unknown User"}
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

        {/* Post Title */}
        <div className="text-xl font-semibold mb-2">{skill.title}</div>

        {/* Post Description */}
        <p className="text-gray-700">{skill.description}</p>

        {/* Post Image or Video */}
        <div className="mt-4">
          {skill.imageUrl && skill.imageUrl.endsWith(".mp4") ? (
            <video controls width="60%" height="auto">
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
              style={{ maxWidth: "60%", height: "auto" }}
              onClick={handleImagePreview}
            />
          )}
        </div>

        {/* Like and Comment Icons with Counts */}
        <div className="flex justify-between items-center mt-4">
          {/* Like Button */}
          <div
            className={`flex items-center cursor-pointer ${
              userLiked ? "text-blue-500" : "text-gray-500"
            }`}
            onClick={handleLike}
          >
            <FaThumbsUp className="mr-2 text-2xl" />
            <span>{likes}</span>
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
      </div>
      {/* Modal Preview for Images Only */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
          onClick={closeModal}
        >
          <div
            className=" bg-white p-4 rounded shadow-lg max-w-screen-xl max-h-screen overflow-auto"
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
            <h2 className="text-xl font-semibold mb-4">Edit Skill Post</h2>
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
            {skill.imageUrl && (
              <div className="mb-3">
                {skill.imageUrl.endsWith(".mp4") ? (
                  <video controls className="w-full h-auto">
                    <source
                      src={`http://localhost:8080/${skill.imageUrl}`}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={`http://localhost:8080/${skill.imageUrl}`}
                    alt="Current Preview"
                    className="w-full h-auto rounded"
                  />
                )}
              </div>
            )}
            <input
              type="file"
              name="file"
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

export default MySkillingSharingCard;
