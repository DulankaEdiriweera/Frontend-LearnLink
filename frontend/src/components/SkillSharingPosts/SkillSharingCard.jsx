import React, { useEffect, useState } from "react";
import { FaThumbsUp, FaComment, FaCommentAlt } from "react-icons/fa";
import { FaUserCircle, FaEdit, FaTrash } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import axios from "axios";
import Swal from "sweetalert2";

const SkillSharingCard = ({ skill, currentUser }) => {
  // State to keep track of like and comment counts
  const [likes, setLikes] = useState(skill.likedUsers?.length || 0);

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
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(0);

  // Function to open comment modal
  const openCommentModal = () => {
    setIsCommentModalOpen(true);
    fetchComments();
  };

  // Function to close comment modal
  const closeCommentModal = () => {
    setIsCommentModalOpen(false);
    setNewComment("");
  };

  // Submit new comment
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem("token");
      console.log({ text: newComment });
      await axios.post(
        `http://localhost:8080/api/skills/${skill.id}/comments`,
        { text: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setComments(comments + 1); // Optimistically increase count
      setUserCommented(true);
      closeCommentModal();
      Swal.fire("Success", "Comment added", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to submit comment", "error");
    }
  };

  const [commentList, setCommentList] = useState([]);
  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/skills/${skill.id}/comments`
      );
      const commentData = res.data;
      setCommentList(commentData);

      const uniqueUserEmails = new Set(
        commentData.map((comment) => comment.user?.email)
      );
      setComments(uniqueUserEmails.size);

      if (currentUser) {
        setUserCommented(uniqueUserEmails.has(currentUser.email));
      }
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };

  //Follow
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (currentUser && skill.user) {
      // Fetch follow status from the backend or set it based on existing data
      const fetchFollowStatus = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8080/api/users/${currentUser.id}/follow-status/${skill.user.id}`
          );
          setIsFollowing(response.data.isFollowing);
        } catch (error) {
          console.error("Failed to fetch follow status", error);
        }
      };

      fetchFollowStatus();
    }
  }, [currentUser, skill.user]);

  const handleFollow = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/users/${currentUser.id}/follow/${skill.user.id}`,
        {}
      );
      setIsFollowing(true); // Update the follow status
      Swal.fire("Success", "You are now following this user.", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to follow the user.", "error");
    }
  };

  const handleUnfollow = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:8080/api/users/${currentUser.id}/unfollow/${skill.user.id}`
      );
      setIsFollowing(false); // Update the follow status
      Swal.fire("Success", "You have unfollowed this user.", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to unfollow the user.", "error");
    }
  };

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
  };

  const handleUpdateComment = async () => {
    if (!editingText.trim()) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8080/api/skills/comments/${editingCommentId}`,
        { text: editingText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      Swal.fire("Success", "Comment updated", "success");
      setEditingCommentId(null);
      setEditingText("");
      fetchComments(); // refresh comment list
    } catch (error) {
      // Check if the error is an AxiosError and if the backend sent a message
      const errorMessage =
        error.response?.data?.message || "Failed to update comment";
      Swal.fire("Error", errorMessage, "error");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:8080/api/skills/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Swal.fire("Deleted!", "Your comment has been deleted.", "success");
      fetchComments(); // Refresh comment list
    } catch (error) {
      console.error(error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to delete comment",
        "error"
      );
    }
  };

  //console.log(currentUser.id); // Check if

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 mb-4">
      {/* Post Owner */}
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

        <div className="font-semibold">
          <button
            onClick={isFollowing ? handleUnfollow : handleFollow}
            className="w-full p-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-all duration-300"
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
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
          onClick={openCommentModal}
        >
          {userCommented ? (
            <FaCommentAlt className="mr-2 text-2xl" />
          ) : (
            <FaCommentAlt className="mr-2 text-2xl" />
          )}
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
            <h2 className="text-xl font-bold mb-4">Add a Comment</h2>

            {/* If editing, show the comment editor, otherwise show the textarea to add a new comment */}
            {editingCommentId ? (
              <>
                <textarea
                  className="w-full border p-2 rounded mb-2"
                  rows={2}
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                    onClick={handleUpdateComment} // Handle update
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-300 text-black px-2 py-1 rounded"
                    onClick={() => {
                      setEditingCommentId(null);
                      setEditingText("");
                    }} // Cancel editing
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <textarea
                  className="w-full border border-gray-300 rounded p-2 mb-4"
                  rows={4}
                  placeholder="Type your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </>
            )}

            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Comments:</h3>
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {commentList.map((comment, index) => (
                  <li
                    key={index}
                    className="border border-gray-200 p-2 rounded"
                  >
                    <div className="text-sm text-gray-700">
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
                        </strong>
                      </div>
                      <div className="flex gap-5">
                        {editingCommentId === comment.id ? (
                          <div>
                            {/* Comment being edited */}
                            <textarea
                              className="w-full border p-2 rounded mb-2"
                              rows={2}
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                            />
                            <button
                              className="bg-blue-500 text-white px-2 py-1 rounded"
                              onClick={handleUpdateComment} // Save comment update
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <p>{comment.text}</p>
                        )}

                        {/* Show edit icon only for the logged-in user's comments */}

                        {comment.user?.id == currentUser.id && (
                          <div className="flex gap-2">
                            <MdEdit
                              className="text-blue-500 cursor-pointer hover:text-blue-700"
                              onClick={() => startEditing(comment)}
                              title="Edit Comment"
                            />
                            <FaTrash
                              className="text-red-500 cursor-pointer hover:text-red-700"
                              onClick={() =>
                                Swal.fire({
                                  title: "Are you sure?",
                                  text: "You won't be able to revert this!",
                                  icon: "warning",
                                  showCancelButton: true,
                                  confirmButtonColor: "#d33",
                                  cancelButtonColor: "#3085d6",
                                  confirmButtonText: "Yes, delete it!",
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    handleDeleteComment(comment.id);
                                  }
                                })
                              }
                              title="Delete Comment"
                            />
                          </div>
                        )}
                      </div>
                    </div>
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
                Cancel
              </button>
              {!editingCommentId && (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={handleCommentSubmit} // Submit new comment
                >
                  Comment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillSharingCard;
