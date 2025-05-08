/**
 * LearningProgressCard Component
 * Displays a single learning progress entry with user interactions like likes, comments, and follows.
 * Provides functionality for viewing media, managing comments, and following users.
 */
import React, { useState, useEffect } from "react";
import { FaThumbsUp, FaComment, FaUserCircle } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

const LearningProgressCard = ({ progress, currentUser }) => {
  // ===== STATE MANAGEMENT =====
  // Interaction states
  const [likes, setLikes] = useState(progress.likedUsers?.length || 0);
  const [comments, setComments] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [commentList, setCommentList] = useState([]);
  const [userCommented, setUserCommented] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // UI control states
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [timeDisplay, setTimeDisplay] = useState("");

  // API configuration
  const API_BASE_URL = "http://localhost:8080/api";
  
  /**
   * Helper function to retrieve authentication token from localStorage
   * @returns {string} JWT authentication token
   */
  const getAuthToken = () => localStorage.getItem("token");

  // ===== EFFECTS =====
  
  /**
   * Check if current user has liked this progress entry
   * Sets userLiked state based on whether current user's email is in likedUsers array
   */
  useEffect(() => {
    if (progress.likedUsers && currentUser) {
      const liked = progress.likedUsers.some((u) => u.email === currentUser.email);
      setUserLiked(liked);
    }
  }, [progress.likedUsers, currentUser]);

  /**
   * Check if current user is following the progress entry author
   * Fetches follow status from the backend if users are different
   */
  useEffect(() => {
    // Only proceed if we have both user IDs and they're different
    const currentUserId = currentUser?.id || localStorage.getItem("id");
    const progressUserId = progress.user?.id;
    
    if (currentUserId && progressUserId && currentUserId !== progressUserId) {
      // Fetch follow status from the backend
      const fetchFollowStatus = async () => {
        try {
          console.log("Fetching follow status with IDs:", currentUserId, progressUserId);
          
          const response = await axios.get(
            `${API_BASE_URL}/users/${currentUserId}/follow-status/${progressUserId}`,
            {
              headers: { Authorization: `Bearer ${getAuthToken()}` }
            }
          );
          
          console.log("Follow status response:", response.data);
          setIsFollowing(response.data.isFollowing);
        } catch (error) {
          console.error("Failed to fetch follow status", error);
          
          // Set to false as a fallback
          setIsFollowing(false);
          
          // Only show the error once in development environment
          if (process.env.NODE_ENV === 'development') {
            console.log("API URL attempted:", `${API_BASE_URL}/users/${currentUserId}/follow-status/${progressUserId}`);
            console.log("Error response:", error.response?.data);
          }
        }
      };

      fetchFollowStatus();
    } else {
      // Reset following state if we're viewing our own content
      setIsFollowing(false);
    }
  }, [currentUser, progress.user]);

  /**
   * Fetch comments for this progress entry when component mounts
   * or when progress.id changes
   */
  useEffect(() => {
    fetchComments();
  }, [progress.id]);

  /**
   * Update relative time display every minute
   * Converts timestamp to human-readable format (e.g., "5 minutes ago")
   */
  useEffect(() => {
    if (progress.createdAt) {
      const parsedDate = new Date(progress.createdAt);
      if (!isNaN(parsedDate.getTime())) {
        setTimeDisplay(getRelativeTime(parsedDate));
      }
    }
    const intervalId = setInterval(() => {
      if (progress.createdAt) {
        const parsedDate = new Date(progress.createdAt);
        if (!isNaN(parsedDate.getTime())) {
          setTimeDisplay(getRelativeTime(parsedDate));
        }
      }
    }, 60000); // update every minute

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [progress.createdAt]);

  // ===== USER INTERACTION HANDLERS =====
  
  /**
   * Handle follow functionality
   * Sends API request to follow the progress author and shows success notification
   */
  const handleFollow = async () => {
    try {
      const token = getAuthToken();
      const currentUserId = currentUser?.id || localStorage.getItem("id");
      const progressUserId = progress.user?.id;
      
      if (!currentUserId || !progressUserId) {
        Swal.fire("Error", "User information is missing", "error");
        return;
      }
      
      await axios.post(
        `${API_BASE_URL}/users/${currentUserId}/follow/${progressUserId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setIsFollowing(true);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "You are now following this user!",
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error("Follow error:", error);
      Swal.fire("Error", error.response?.data?.message || "Failed to follow the user.", "error");
    }
  };

  /**
   * Handle unfollow functionality
   * Sends API request to unfollow the progress author and shows success notification
   */
  const handleUnfollow = async () => {
    try {
      const token = getAuthToken();
      const currentUserId = currentUser?.id || localStorage.getItem("id");
      const progressUserId = progress.user?.id;
      
      if (!currentUserId || !progressUserId) {
        Swal.fire("Error", "User information is missing", "error");
        return;
      }
      
      await axios.delete(
        `${API_BASE_URL}/users/${currentUserId}/unfollow/${progressUserId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setIsFollowing(false);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "You have unfollowed this user.",
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error("Unfollow error:", error);
      Swal.fire("Error", error.response?.data?.message || "Failed to unfollow the user.", "error");
    }
  };

  /**
   * Handle like/unlike functionality
   * Toggles like status for current user and updates UI accordingly
   */
  const handleLike = async () => {
    try {
      const token = getAuthToken();
      
      // Make the request to like or unlike
      const res = await axios.put(
        `${API_BASE_URL}/learning-progress/${progress.id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLikes(res.data.likeCount);
      setUserLiked(res.data.liked);

      if (res.data.liked) {
        // Show a success alert for liking
        Swal.fire({
          icon: 'success',
          title: 'Liked!',
          text: 'You successfully liked this learning progress update!',
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        // Show a confirmation alert for unliking
        Swal.fire({
          icon: 'warning',
          title: 'Unliked',
          text: 'You have unliked this learning progress update.',
          showConfirmButton: false,
          timer: 1500
        });
      }
    } catch (error) {
      console.error("Like error:", error);
      Swal.fire("Error", "Failed to update like", "error");
    }
  };

  /**
   * Fetch and display a list of users who liked this progress entry
   * Shows modal with user profile pictures and names
   */
  const fetchLikedUsers = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/learning-progress/${progress.id}/liked-users`,
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` }
        }
      );
      
      Swal.fire({
        title: `<div style="font-size: 24px;">👍 Liked by</div>`,
        html: `<div style="text-align: left;">
                ${res.data.map((u) => `
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
    } catch (err) {
      console.error("Fetch liked users error:", err);
      Swal.fire("Error", "Failed to load liked users", "error");
    }
  };

  // ===== COMMENT OPERATIONS =====
  
  /**
   * Fetch comments for the current learning progress entry
   * Updates state with comments and checks if current user has commented
   */
  const fetchComments = async () => {
    try {
      const token = getAuthToken();
      const res = await axios.get(
        `${API_BASE_URL}/learning-progress/${progress.id}/comments`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCommentList(res.data);
      setComments(res.data.length);

      // Check if current user has commented
      if (currentUser) {
        const userHasCommented = res.data.some(comment => 
          comment.user?.email === currentUser.email
        );
        setUserCommented(userHasCommented);
      }
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };

  /**
   * Handle comment submission
   * Validates input, submits to API and refreshes comment list
   */
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      const token = getAuthToken();
      await axios.post(
        `${API_BASE_URL}/learning-progress/${progress.id}/comments`,
        { text: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setNewComment("");
      setIsCommentModalOpen(false);
      await fetchComments();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Comment added successfully!",
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err) {
      console.error("Comment submission error:", err);
      Swal.fire("Error", "Failed to submit comment", "error");
    }
  };

  /**
   * Start editing a comment
   * Sets the editing state and populates the edit field with comment text
   */
  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
  };

  /**
   * Handle comment update
   * Sends updated comment text to API and refreshes comment list
   */
  const handleUpdateComment = async () => {
    if (!editingText.trim()) return;

    try {
      const token = getAuthToken();

      const response = await axios.put(
        `${API_BASE_URL}/learning-progress/comments/${editingCommentId}`,
        { text: editingText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Comment updated successfully!",
        showConfirmButton: false,
        timer: 1500
      });

      setEditingCommentId(null);
      setEditingText("");
      await fetchComments(); // refresh comment list
    } catch (error) {
      console.error("Update comment error:", error);

      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }

      // Check if the error is an AxiosError and if the backend sent a message
      const errorMessage =
        error.response?.data?.message || "Failed to update comment";
      Swal.fire("Error", errorMessage, "error");
    }
  };

  /**
   * Handle comment deletion
   * Confirms with user before deleting and refreshes comment list
   */
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

      const token = getAuthToken();

      await axios.delete(
        `${API_BASE_URL}/learning-progress/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Your comment has been deleted.",
        showConfirmButton: false,
        timer: 1500
      });

      await fetchComments(); // Refresh comment list
    } catch (error) {
      console.error("Delete comment error:", error);

      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }

      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to delete comment",
        "error"
      );
    }
  };

  // ===== UTILITY FUNCTIONS =====
  
  /**
   * Convert timestamp to human-readable relative time
   * @param {Date} date - The date to convert
   * @returns {string} Human readable string (e.g., "5 minutes ago")
   */
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
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  /**
   * Render different template styles based on template type
   * @param {string} template - The template type
   * @returns {JSX.Element} Styled template container
   */
  const renderTemplate = (template) => {
    switch(template) {
      case 'milestone':
        return (
          <div className="bg-blue-50 p-3 mt-2 rounded-lg border-l-4 border-blue-500">
            <span className="font-bold text-blue-700">🏆 Learning Milestone</span>
          </div>
        );
      case 'question':
        return (
          <div className="bg-yellow-50 p-3 mt-2 rounded-lg border-l-4 border-yellow-500">
            <span className="font-bold text-yellow-700">❓ Question</span>
          </div>
        );
      case 'reflection':
        return (
          <div className="bg-purple-50 p-3 mt-2 rounded-lg border-l-4 border-purple-500">
            <span className="font-bold text-purple-700">🤔 Reflection</span>
          </div>
        );
      default:
        return (
          <div className="bg-gray-50 p-3 mt-2 rounded-lg border-l-4 border-gray-500">
            <span className="font-bold text-gray-700">📝 Learning Update</span>
          </div>
        );
    }
  };

  // ===== COMPONENT RENDER =====
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
      {/* Header: User Profile, Timestamp and Follow/Unfollow Button */}
      <div className="flex items-center mb-4">
        {/* Profile Picture */}
        <div className="mr-4">
          {progress.user?.profilePic ? (
            <img
              src={`http://localhost:8080/${progress.user.profilePic}`}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
            />
          ) : (
            <FaUserCircle className="text-gray-500 text-4xl" />
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-800">
            {progress.user?.username || "Unknown User"}
          </p>
          <p className="text-xs text-gray-500">{timeDisplay}</p>
        </div>
        
        {/* Follow/Unfollow Button - Only show if we have the necessary user IDs */}
        {progress.user?.id && (currentUser?.id || localStorage.getItem("id")) && (
          <div className="font-semibold ml-auto">
            {String(progress.user?.id) !== String(currentUser?.id || localStorage.getItem("id")) ? (
              <button
                onClick={isFollowing ? handleUnfollow : handleFollow}
                className={`px-3 py-1 rounded-lg text-white transition-all duration-300 ${
                  isFollowing ? "bg-gray-600 hover:bg-gray-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            ) : (
              <button
                onClick={() => {
                  window.location.href = `/profile`;
                }}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
              >
                View Profile
              </button>
            )}
          </div>
        )}
      </div>

      {/* Template Type Indicator */}
      {renderTemplate(progress.template)}

      {/* Progress Content: Title and Description */}
      <h2 className="text-xl font-semibold my-3 text-gray-800">{progress.title}</h2>
      <p className="text-gray-700 mb-4">{progress.description}</p>

      {/* Media Content - Image or Video with Preview Support */}
      {progress.mediaUrl && (
        <div className="mb-4">
          {progress.mediaUrl.endsWith(".mp4") ? (
            <video 
              controls 
              className="w-full max-h-80 object-contain rounded-lg shadow-md"
            >
              <source src={`http://localhost:8080/${progress.mediaUrl}`} type="video/mp4" />
              Your browser does not support video playback.
            </video>
          ) : progress.mediaUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
            <img
              src={`http://localhost:8080/${progress.mediaUrl}`}
              alt="Learning Progress"
              className="w-full max-h-80 object-contain rounded-lg shadow-md cursor-pointer"
              onClick={() => setIsMediaModalOpen(true)}
            />
          ) : (
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-center text-gray-600">
                <span className="text-lg mr-2">⚠️</span>
                Only images and videos are supported
              </p>
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
            }`}
          >
            <FaThumbsUp />
            <span>{likes}</span>
          </button>
          {likes > 0 && (
            <button onClick={fetchLikedUsers} className="text-blue-500 text-xs hover:underline">
              View Likes
            </button>
          )}
        </div>
        <button
          onClick={() => setIsCommentModalOpen(true)}
          className={`flex items-center gap-2 hover:text-gray-700 ${
            userCommented ? "font-semibold" : "text-gray-500"
          }`}
        >
          <FaComment />
          <span>{comments}</span>
        </button>
      </div>

      {/* Media Modal: Enlarged View for Images */}
      {isMediaModalOpen && progress.mediaUrl && progress.mediaUrl.match(/\.(jpeg|jpg|gif|png)$/i) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
          onClick={() => setIsMediaModalOpen(false)}
        >
          <div
            className="bg-white p-4 rounded-lg shadow-lg max-w-4xl max-h-screen overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`http://localhost:8080/${progress.mediaUrl}`}
              alt="Learning Progress Preview"
              className="w-full h-auto"
            />
            <button
              className="absolute top-4 right-4 text-white bg-gray-800 bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
              onClick={() => setIsMediaModalOpen(false)}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Comments Modal: View, Add, Edit and Delete Comments */}
      {isCommentModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsCommentModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">🗨️ Comments</h2>

            {/* Comment Input Area */}
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
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  rows={3}
                  placeholder="Write your comment here..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="text-right mt-2">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
                    onClick={handleCommentSubmit}
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            </div>

            {/* Comment List with Edit/Delete Controls */}
            <div className="max-h-64 overflow-y-auto space-y-4">
              {commentList.length > 0 ? (
                commentList.map((comment) => (
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

                      {/* Comment editing mode */}
                      {editingCommentId === comment.id ? (
                        <div className="mt-2">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            rows={2}
                          />
                          <div className="flex gap-2 mt-2 text-sm">
                            <button
                              onClick={handleUpdateComment}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditingText("");
                              }}
                              className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                      )}

                      {/* Comment owner controls */}
                      {comment.user?.email === currentUser?.email && editingCommentId !== comment.id && (
                        <div className="flex gap-3 text-xs mt-2">
                          <button
                            onClick={() => startEditing(comment)}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
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
              onClick={() => setIsCommentModalOpen(false)}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningProgressCard;