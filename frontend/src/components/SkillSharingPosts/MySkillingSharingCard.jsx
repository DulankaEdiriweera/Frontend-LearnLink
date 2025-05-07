import React, { useEffect, useState } from "react";
import { FaThumbsUp, FaComment } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import axios from "axios";
import Swal from "sweetalert2";
import { FaUserCircle } from "react-icons/fa";

const MySkillingSharingCard = ({ skill, onDelete, currentUser }) => {
  // State to keep track of like and comment counts
  const [likes, setLikes] = useState(skill.likedUsers?.length || 0);
  //const [comments, setComments] = useState(45);

  // State to track if the logged-in user has liked or commented
  const [userLiked, setUserLiked] = useState(false); // Change to true if user liked
  const [userCommented, setUserCommented] = useState(false); // Change to true if user commented

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (skill.likedUsers && currentUser) {
      const liked = skill.likedUsers.some((u) => u.email === currentUser.email);
      setUserLiked(liked);
    }

    if (skill.comments && currentUser) {
      const hasCommented = skill.comments.some(
        (c) => c.user?.email === currentUser.email
      );
      setUserCommented(hasCommented);
      setComments(new Set(skill.comments.map((c) => c.user?.email)).size); // Unique comment users count
    }
  }, [skill.likedUsers, skill.comments, currentUser]);

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

  //Likes
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
                          .map(
                            (u) => `
                          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                            <img src="http://localhost:8080/${u.profilePic}" alt="${u.username}" class="w-8 h-8 rounded-full object-cover" />
                            <p>${u.username} (${u.email})</p>
                          </div>
                        `
                          )
                          .join("")}
                      </div>`,
        icon: "info",
      });
    } catch (err) {
      Swal.fire("Error", "Failed to load liked users", "error");
    }
  };

  //Comments
  // Add these states at the top
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [comments, setComments] = useState(0);

  // Function to open comment modal
  const openCommentModal = () => {
    fetchComments();
  };

  // Function to close comment modal
  const closeCommentModal = () => {
    setIsCommentModalOpen(false);
  };

  const [commentList, setCommentList] = useState([]);
  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/skills/${skill.id}/comments`
      );
      setCommentList(res.data);
      setIsCommentModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };

  return (
    <div>
      <div className="bg-white shadow-lg rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2 w-full">
          <div className="flex items-center mb-2 gap-4">
            <div className="font-semibold text-lg text-gray-800">
              {skill.user?.profilePic ? (
                <img
                  src={`http://localhost:8080/${skill.user.profilePic}`}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover border"
                />
              ) : (
                <FaUserCircle className="text-gray-400 text-3xl" />
              )}
            </div>
            <div className="font-semibold text-lg text-gray-800">
              {skill.user ? skill.user.username : "Unknown User"}
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <p>Posted on</p>
              <p>{new Date(skill.createdAt).toLocaleString()}</p>
            </div>
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
            <video controls width="30%" height="auto">
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
              style={{ maxWidth: "30%", height: "auto" }}
              onClick={handleImagePreview}
            />
          )}
        </div>

        {/* Like and Comment Icons with Counts */}
        <div className="flex justify-between items-center mt-4">
          {/* Like Button */}
          <div
            className={`flex items-center cursor-pointer`}
            onClick={fetchLikedUsers}
          >
            <FaThumbsUp className="mr-2 text-2xl" />
            <span>{likes}</span>
          </div>

          {/* Comment Button */}
          <div
            className={`flex items-center cursor-pointer `}
            onClick={openCommentModal}
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

      {/* Modal for Adding Comment */}
      {isCommentModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
          onClick={closeCommentModal}
        >
          <div
            className="bg-white p-6 rounded shadow-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Comments:</h3>
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {commentList.map((comment, index) => (
                  <li
                    key={index}
                    className="border border-gray-200 p-2 rounded"
                  >
                    <p className="text-sm text-gray-700">
                      <div className="flex items-center mb-2 gap-4">
                        <div className="font-semibold text-lg text-gray-800">
                          {comment.user?.profilePic ? (
                            <img
                              src={`http://localhost:8080/${comment.user.profilePic}`}
                              alt="Profile"
                              className="w-12 h-12 rounded-full object-cover border"
                            />
                          ) : (
                            <FaUserCircle className="text-gray-400 text-3xl" />
                          )}
                        </div>
                        <strong>
                          {comment.user?.username || "Anonymous"}:
                        </strong>{" "}
                      </div>
                      {comment.text}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end mt-2">
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
                onClick={closeCommentModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySkillingSharingCard;
