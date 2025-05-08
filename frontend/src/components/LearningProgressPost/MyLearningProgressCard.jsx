import React, { useState, useEffect } from "react";
import { FaThumbsUp, FaComment } from "react-icons/fa";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import axios from "axios";
import Swal from "sweetalert2";
import { formatDistanceToNow } from "date-fns";

const MyLearningProgressCard = ({ progress, onDelete, currentUser }) => {
  // State to keep track of likes
  const [likes, setLikes] = useState(progress.likedUsers ? progress.likedUsers.length : 0);
  
  // State to track if the logged-in user has liked this progress
  const [userLiked, setUserLiked] = useState(false);

  // State for comments
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

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

  // Check if user has already liked the post
  useEffect(() => {
    if (progress.likedUsers && currentUser) {
      const hasLiked = progress.likedUsers.some(user => user.email === currentUser.email);
      setUserLiked(hasLiked);
    }
  }, [progress.likedUsers, currentUser]);

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
  
  // Comments functionality
  const fetchComments = async () => {
    try {
      setCommentLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/learning-progress/${progress.id}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      Swal.fire("Error!", "Failed to fetch comments", "error");
    } finally {
      setCommentLoading(false);
    }
  };
  
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    try {
      setCommentLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8080/api/learning-progress/${progress.id}/comments`,
        { text: commentText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      setCommentText("");
      await fetchComments(); // Refresh comments after posting
      
      Swal.fire({
        icon: "success",
        title: "Comment Added!",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      Swal.fire("Error!", "Failed to add comment", "error");
    } finally {
      setCommentLoading(false);
    }
  };
  
  const openCommentModal = () => {
    fetchComments();
    setShowComments(true);
  };
  
  const closeCommentModal = () => {
    setShowComments(false);
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

  // Check if media is video or image by file extension
  const isVideo = (url) => {
    if (!url) return false;
    return url.toLowerCase().endsWith(".mp4") || 
           url.toLowerCase().endsWith(".webm") || 
           url.toLowerCase().endsWith(".mov");
  };

  // Template options for dropdown
  const templateOptions = [
    { value: "default", label: "Learning Update" },
    { value: "milestone", label: "Milestone" },
    { value: "question", label: "Question" },
    { value: "reflection", label: "Reflection" }
  ];

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 mb-4">
      <div className="flex items-center mb-4">
        {/* Profile Picture and User Info */}
        <div className="flex items-center flex-1">
          {progress.user?.profilePic ? (
            <img
              src={`http://localhost:8080/${progress.user.profilePic}`}
              alt={progress.user.username}
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mr-3">
              {progress.user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          
          <div>
            <div className="font-semibold text-lg text-gray-800">
              {progress.user ? progress.user.username : "Unknown User"}
            </div>
            <div className="text-sm text-gray-500">
              {progress.createdAt && formatDistanceToNow(new Date(progress.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>

        {/* Edit and Delete Buttons */}
        <div className="flex space-x-4 text-2xl">
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

      {/* Like and Comment buttons */}
      <div className="flex justify-between items-center mt-4 border-t pt-3">
        <div
          className={`flex items-center cursor-pointer ${
            userLiked ? "text-blue-500" : "text-gray-500"
          } hover:text-blue-700 transition-colors`}
          onClick={handleLike}
        >
          <FaThumbsUp className="mr-2 text-xl" />
          <span>{likes}</span>
        </div>
        
        <div
          className="flex items-center cursor-pointer text-gray-500 hover:text-blue-700 transition-colors"
          onClick={openCommentModal}
        >
          <FaComment className="mr-2 text-xl" />
          <span>{comments.length}</span>
        </div>
      </div>

      {/* Media Preview Modal */}
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

      {/* Comments Modal */}
      {showComments && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
          onClick={closeCommentModal}
        >
          <div
            className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Comments</h2>
            
            {/* Add comment form */}
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              ></textarea>
              <button
                type="submit"
                disabled={commentLoading || !commentText.trim()}
                className={`mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg ${
                  commentLoading || !commentText.trim() 
                    ? "opacity-50 cursor-not-allowed" 
                    : "hover:bg-blue-700"
                }`}
              >
                {commentLoading ? "Posting..." : "Post Comment"}
              </button>
            </form>
            
            {/* Comments list */}
            <div className="max-h-60 overflow-y-auto">
              {commentLoading && comments.length === 0 ? (
                <div className="flex justify-center items-center py-4">
                  <div className="w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mr-2"></div>
                  <p>Loading comments...</p>
                </div>
              ) : comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No comments yet</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3 border-b pb-3">
                      {comment.user?.profilePic ? (
                        <img
                          src={`http://localhost:8080/${comment.user.profilePic}`}
                          alt={comment.user.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                          {comment.user?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{comment.user?.username}</p>
                        <p className="text-gray-700 text-sm">{comment.text}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={closeCommentModal}
              className="mt-6 w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300"
            >
              Close
            </button>
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
            
            <div className="mb-3">
              <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">Template Type</label>
              <select
                id="template"
                name="template"
                value={editData.template}
                onChange={handleEditChange}
                className="w-full border border-gray-300 p-2 rounded bg-white"
              >
                {templateOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
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