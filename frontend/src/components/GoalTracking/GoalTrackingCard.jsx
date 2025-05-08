import React, { useEffect, useState, useRef } from "react";
import {
  FaThumbsUp,
  FaComment,
  FaEdit,
  FaTrashAlt,
  FaUserCircle,
} from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

const GoalCard = ({ goal, currentUser }) => {
  // Refs
  const commentInputRef = useRef(null);
  
  // State management
  const [likes, setLikes] = useState(goal.likedUsers?.length || 0);
  const [comments, setComments] = useState([]);
  const [userLiked, setUserLiked] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState({
    likes: false,
    comments: false
  });
  const [newCommentText, setNewCommentText] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [timeDisplay, setTimeDisplay] = useState("");

  // API base URL - centralized for easier maintenance
  const API_BASE_URL = "http://localhost:8080/api";

  // Get auth token helper function
  const getAuthToken = () => localStorage.getItem("token");

  // Effect to check if user has liked the goal
  useEffect(() => {
    if (goal.likedUsers && currentUser) {
      const liked = goal.likedUsers.some((u) => u.email === currentUser.email);
      setUserLiked(liked);
    }
    
    fetchComments();
    
    // Set time display if created date is available
    if (goal.createdAt) {
      const parsedDate = new Date(goal.createdAt);
      if (!isNaN(parsedDate.getTime())) {
        setTimeDisplay(getRelativeTime(parsedDate));
      }
    }
  }, [goal.likedUsers, currentUser, goal.id, goal.createdAt]); // eslint-disable-line react-hooks/exhaustive-deps

  // Format relative time helper function
  const getRelativeTime = (date) => {
    if (!date) return "Just now";
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 5) return "Just now";
    if (seconds < 60) return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    
    // For older posts, show actual date
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Helper for API requests with error handling
  const apiRequest = async (method, url, data = null, configOptions = {}) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication required. Please log in.");
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...configOptions.headers
        },
        ...configOptions
      };
      
      let response;
      if (method === 'get') {
        response = await axios.get(url, config);
      } else if (method === 'post') {
        response = await axios.post(url, data, config);
      } else if (method === 'put') {
        response = await axios.put(url, data, config);
      } else if (method === 'delete') {
        response = await axios.delete(url, config);
      }
      
      return response.data;
    } catch (error) {
      // Get most specific error message available
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data || 
        error.message || 
        "Something went wrong. Please try again.";
        
      throw new Error(errorMessage);
    }
  };

  // Fetch comments for the goal
  const fetchComments = async () => {
    try {
      setIsLoading(prev => ({ ...prev, comments: true }));
      
      const res = await apiRequest(
        'get',
        `${API_BASE_URL}/Goals/${goal.id}/comments`
      );
      
      setComments(res);
    } catch (error) {
      console.error("Failed to fetch comments", error);
      Swal.fire("Error", "Failed to load comments", "error");
    } finally {
      setIsLoading(prev => ({ ...prev, comments: false }));
    }
  };

  // Handle like functionality
  const handleLike = async () => {
    try {
      setIsLoading(prev => ({ ...prev, likes: true }));
      
      const res = await apiRequest(
        'put',
        `${API_BASE_URL}/Goals/${goal.id}/like`
      );

      setLikes(res.likeCount);
      setUserLiked(res.liked);

      if (res.liked) {
        Swal.fire({
          icon: 'success',
          title: 'Liked!',
          text: 'You successfully liked this goal!',
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Unliked',
          text: 'You have unliked this goal.',
          showConfirmButton: false,
          timer: 1500
        });
      }
    } catch (error) {
      console.error("Like error:", error);
      Swal.fire("Error", error.message, "error");
    } finally {
      setIsLoading(prev => ({ ...prev, likes: false }));
    }
  };

  // Fetch users who liked the goal
  const fetchLikedUsers = async () => {
    try {
      setIsLoading(prev => ({ ...prev, likes: true }));
      
      const res = await apiRequest(
        'get',
        `${API_BASE_URL}/Goals/${goal.id}/liked-users`
      );
      
      if (res.length === 0) {
        Swal.fire({
          title: "No Likes Yet",
          text: "Be the first to like this goal!",
          icon: "info"
        });
        return;
      }
      
      Swal.fire({
        title: '👍 Liked by',
        html: `<div style="text-align: left;">
                ${res.map((u) => `
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    ${u.profilePic ? 
                      `<img src="${API_BASE_URL.replace('/api', '')}/${u.profilePic}" alt="${u.username}" class="w-8 h-8 rounded-full object-cover" />` : 
                      '<div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">?</div>'
                    }
                    <p>${u.username} (${u.email})</p>
                  </div>
                `).join("")}
              </div>`,
        icon: "info",
        confirmButtonText: 'Close',
        confirmButtonColor: '#4CAF50'
      });
    } catch (error) {
      console.error("Fetch liked users error:", error);
      Swal.fire("Error", error.message, "error");
    } finally {
      setIsLoading(prev => ({ ...prev, likes: false }));
    }
  };

  // Handle comment submission
  const handleComment = async () => {
    if (!newCommentText.trim()) {
      Swal.fire("Error", "Comment cannot be empty", "error");
      return;
    }

    try {
      setIsLoading(prev => ({ ...prev, comments: true }));
      
      const res = await apiRequest(
        'post',
        `${API_BASE_URL}/Goals/${goal.id}/comments`,
        { text: newCommentText }
      );

      setComments(prevComments => [res, ...prevComments]);
      setNewCommentText("");
      
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Comment added successfully!",
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error("Comment submission error:", error);
      Swal.fire("Error", error.message, "error");
    } finally {
      setIsLoading(prev => ({ ...prev, comments: false }));
    }
  };

  // Start editing a comment
  const handleEditComment = (comment) => {
    setEditCommentId(comment.id);
    setEditCommentText(comment.text);
  };

  // Handle comment update
  const handleUpdateComment = async () => {
    if (!editCommentText.trim()) {
      Swal.fire("Error", "Comment cannot be empty", "error");
      return;
    }

    try {
      setIsLoading(prev => ({ ...prev, comments: true }));
      
      const res = await apiRequest(
        'put',
        `${API_BASE_URL}/Goals/comments/${editCommentId}`,
        { text: editCommentText }
      );

      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === editCommentId ? res : comment
        )
      );

      setEditCommentId(null);
      setEditCommentText("");
      
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Comment updated successfully!",
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error("Update comment error:", error);
      Swal.fire("Error", error.message, "error");
    } finally {
      setIsLoading(prev => ({ ...prev, comments: false }));
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId) => {
    try {
      // Ask for confirmation before deleting
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      });

      if (!result.isConfirmed) {
        return;
      }

      setIsLoading(prev => ({ ...prev, comments: true }));
      
      await apiRequest(
        'delete',
        `${API_BASE_URL}/Goals/comments/${commentId}`
      );

      setComments(prevComments =>
        prevComments.filter(comment => comment.id !== commentId)
      );
      
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Your comment has been deleted.",
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error("Delete comment error:", error);
      Swal.fire("Error", error.message, "error");
    } finally {
      setIsLoading(prev => ({ ...prev, comments: false }));
    }
  };

  // Handle opening comment modal
  const handleOpenCommentModal = () => {
    setIsCommentModalOpen(true);
  };

  // Handle closing comment modal
  const handleCloseCommentModal = () => {
    setIsCommentModalOpen(false);
    setEditCommentId(null);
    setEditCommentText("");
  };

  // Handle image preview
  const handleImagePreview = () => {
    setIsImageModalOpen(true);
  };

  // Close image modal
  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6 transition-all duration-200 hover:shadow-xl">
      {/* Header: User and Time */}
      <div className="flex items-center mb-4">
        {/* Profile Picture */}
        <div className="mr-4">
          {goal.user?.profilePic ? (
            <img
              src={`http://localhost:8080/${goal.user.profilePic}`}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
            />
          ) : (
            <FaUserCircle className="text-gray-500 text-4xl" />
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-800">
            {goal.user?.username || "Unknown User"}
          </p>
          <p className="text-xs text-gray-500">{timeDisplay}</p>
        </div>
      </div>

      {/* Goal Title */}
      <h2 className="text-xl font-semibold my-3 text-gray-800">{goal.title}</h2>

      {/* Goal Description */}
      <p className="text-gray-700 mb-4">{goal.description}</p>

      {/* Goal Dates */}
      <div className="flex justify-between text-sm text-gray-600 mb-4">
        <div><b>Start:</b> {goal.startDate}</div>
        <div><b>Due:</b> {goal.dueDate}</div>
      </div>

      {/* Media Content */}
      {goal.imageUrl && (
        <div className="mb-4">
          {goal.imageUrl.endsWith(".mp4") ? (
            <video 
              controls 
              className="w-full max-h-80 object-contain rounded-lg shadow-md"
            >
              <source src={`http://localhost:8080/${goal.imageUrl}`} type="video/mp4" />
              Your browser does not support video playback.
            </video>
          ) : goal.imageUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
            <img
              src={`http://localhost:8080/${goal.imageUrl}`}
              alt="Goal"
              className="w-full max-h-80 object-contain rounded-lg shadow-md cursor-pointer"
              onClick={handleImagePreview}
            />
          ) : (
            <div className="bg-gray-100 p-4 rounded-lg">
              <a
                href={`http://localhost:8080/${goal.imageUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center text-blue-600 hover:underline"
              >
                <span className="text-lg mr-2">📄</span>
                View Attached Document
              </a>
            </div>
          )}
        </div>
      )}

      {/* Interaction Bar: Likes and Comments */}
      <div className="flex justify-between border-t pt-3 mt-2 text-sm text-gray-600">
        <div className="flex gap-3 items-center">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 hover:text-blue-500 ${
              userLiked ? "text-blue-600 font-semibold" : "text-gray-500"
            } ${isLoading.likes ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
            disabled={isLoading.likes}
            aria-label={userLiked ? "Unlike this goal" : "Like this goal"}
          >
            <FaThumbsUp />
            <span>{likes}</span>
          </button>
          {likes > 0 && (
            <button 
              onClick={fetchLikedUsers} 
              className="text-blue-500 text-xs hover:underline"
              disabled={isLoading.likes}
              aria-label="View users who liked this goal"
            >
              View Likes
            </button>
          )}
        </div>
        <button
          onClick={handleOpenCommentModal}
          className="flex items-center gap-2 hover:text-blue-500 text-gray-500"
          aria-label="View and add comments"
        >
          <FaComment />
          <span>{comments.length}</span>
        </button>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && goal.imageUrl && goal.imageUrl.match(/\.(jpeg|jpg|gif|png)$/i) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
          onClick={closeImageModal}
        >
          <div
            className="bg-white p-4 rounded-lg shadow-lg max-w-4xl max-h-screen overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`http://localhost:8080/${goal.imageUrl}`}
              alt="Goal Preview"
              className="w-full h-auto"
            />
            <button
              className="absolute top-4 right-4 text-white bg-gray-800 bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
              onClick={closeImageModal}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {isCommentModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCloseCommentModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">🗨 Comments</h2>

            {/* Comment Input */}
            <div className="flex gap-3 mb-6 items-start">
              <div className="flex-shrink-0">
                {currentUser?.profilePic ? (
                  <img
                    src={`http://localhost:8080/${currentUser.profilePic}`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="text-3xl text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <textarea
                  ref={commentInputRef}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  rows={3}
                  placeholder="Write your comment..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                />
                <div className="text-right mt-2">
                  <button
                    className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition ${
                      isLoading.comments ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    onClick={handleComment}
                    disabled={isLoading.comments || !newCommentText.trim()}
                  >
                    {isLoading.comments ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </div>
            </div>

            {/* Comment Count */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-medium text-gray-700">
                {comments.length === 0 ? "No comments yet" : 
                  `${comments.length} Comment${comments.length !== 1 ? 's' : ''}`}
              </h3>
            </div>

            {/* Comment List */}
            <div className="max-h-64 overflow-y-auto space-y-4">
              {isLoading.comments && comments.length === 0 ? (
                <div className="flex justify-center items-center py-4">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  <p className="text-gray-500">Loading comments...</p>
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-3 items-start bg-gray-50 p-4 rounded-xl shadow-sm"
                  >
                    {comment.user?.profilePic ? (
                      <img
                        src={`http://localhost:8080/${comment.user.profilePic}`}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <FaUserCircle className="text-2xl text-gray-400" />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-gray-800">
                          {comment.user?.username || "Anonymous"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getRelativeTime(new Date(comment.createdAt))}
                        </p>
                      </div>

                      {/* Comment editing input */}
                      {editCommentId === comment.id ? (
                        <div className="mt-2">
                          <textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            rows={2}
                          />
                          <div className="flex gap-2 mt-2 text-sm">
                            <button
                              onClick={handleUpdateComment}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                              disabled={isLoading.comments}
                            >
                              {isLoading.comments ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={() => {
                                setEditCommentId(null);
                                setEditCommentText("");
                              }}
                              className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                              disabled={isLoading.comments}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                      )}

                      {/* Action buttons for comment owner */}
                      {(comment.user?.id === currentUser?.id || comment.user?.email === currentUser?.email) && editCommentId !== comment.id && (
                        <div className="flex flex-wrap gap-3 text-xs mt-2">
                          <button
                            onClick={() => handleEditComment(comment)}
                            className="text-blue-600 hover:underline flex items-center"
                            disabled={isLoading.comments}
                          >
                            <FaEdit className="mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-600 hover:underline flex items-center"
                            disabled={isLoading.comments}
                          >
                            <FaTrashAlt className="mr-1" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>

            {/* Modal Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl font-bold"
              onClick={handleCloseCommentModal}
              aria-label="Close comments"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalCard;