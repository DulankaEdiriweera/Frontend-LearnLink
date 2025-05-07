import React, { useState, useEffect } from "react";
import { FaThumbsUp, FaComment, FaUserCircle } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

const LearningPlanSharingCard = ({ learningPlan, currentUser }) => {
    // State to keep track of like and comment counts
    const [likes, setLikes] = useState(learningPlan.likedUsers?.length || 0);
    const [comments, setComments] = useState(0);
    const [userLiked, setUserLiked] = useState(false);
    const [userCommented, setUserCommented] = useState(false);
    const [timeDisplay, setTimeDisplay] = useState("");
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [commentList, setCommentList] = useState([]);
    const [likedUsers, setLikedUsers] = useState([]);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingText, setEditingText] = useState("");
    const [isFollowing, setIsFollowing] = useState(false);

    // API base URL - centralized for easier maintenance
    const API_BASE_URL = "http://localhost:8080/api";

    // Get auth token
    const getAuthToken = () => localStorage.getItem("token");

    useEffect(() => {
        if (learningPlan.likedUsers && currentUser) {
            const liked = learningPlan.likedUsers.some((u) => u.email === currentUser.email);
            setUserLiked(liked);
        }
        fetchComments();
    }, [learningPlan.likedUsers, learningPlan.comments, currentUser]);

    useEffect(() => {
        if (currentUser && learningPlan.user) {
            // Fetch follow status from the backend
            const fetchFollowStatus = async () => {
                try {
                    const response = await axios.get(
                        `${API_BASE_URL}/users/${currentUser.id}/follow-status/${learningPlan.user.id}`,
                        {
                            headers: { Authorization: `Bearer ${getAuthToken()}` }
                        }
                    );
                    setIsFollowing(response.data.isFollowing);
                } catch (error) {
                    console.error("Failed to fetch follow status", error);
                }
            };

            fetchFollowStatus();
        }
    }, [currentUser, learningPlan.user]);

    useEffect(() => {
        if (learningPlan.createdAt) {
            const parsedDate = new Date(learningPlan.createdAt);
            if (!isNaN(parsedDate.getTime())) {
                setTimeDisplay(getRelativeTime(parsedDate));
            } else {
                console.warn("Invalid createdAt:", learningPlan.createdAt);
            }
        }
        const intervalId = setInterval(() => {
            if (learningPlan.createdAt) {
                const parsedDate = new Date(learningPlan.createdAt);
                if (!isNaN(parsedDate.getTime())) {
                    setTimeDisplay(getRelativeTime(parsedDate));
                }
            }
        }, 60000); // update every minute

        return () => clearInterval(intervalId);
    }, [learningPlan.createdAt]);

    const handleLike = async () => {
        try {
            const token = getAuthToken();

            // Make the request to like or unlike
            const res = await axios.put(
                `${API_BASE_URL}/learning-plans/${learningPlan.id}/like`,
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
                    text: 'You successfully liked this learning plan!',
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                // Show a confirmation alert for unliking
                Swal.fire({
                    icon: 'warning',
                    title: 'Unliked',
                    text: 'You have unliked this learning plan.',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        } catch (error) {
            console.error("Like error:", error);
            Swal.fire("Error", "Failed to update like", "error");
        }
    };

    const fetchLikedUsers = async () => {
        try {
            const res = await axios.get(
                `${API_BASE_URL}/learning-plans/${learningPlan.id}/liked-users`,
                {
                    headers: { Authorization: `Bearer ${getAuthToken()}` }
                }
            );
            setLikedUsers(res.data);
            Swal.fire({
                title: `<div style="font-size: 24px;">👍 Liked by</div>`,
                html: `<div style="text-align: left;">
                        ${res.data.map((u) => `
                          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                            <img src="${API_BASE_URL.replace('/api', '')}/${u.profilePic}" alt="${u.username}" class="w-8 h-8 rounded-full object-cover" />
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

    const fetchComments = async () => {
        try {
            const token = getAuthToken();
            const res = await axios.get(
                `${API_BASE_URL}/learning-plans/${learningPlan.id}/comments`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setCommentList(res.data);

            const uniqueUserEmails = new Set(res.data.map((comment) => comment.user?.email));
            setComments(uniqueUserEmails.size);

            if (currentUser) {
                setUserCommented(uniqueUserEmails.has(currentUser.email));
            }
        } catch (err) {
            console.error("Failed to fetch comments", err);
        }
    };

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;

        try {
            const token = getAuthToken();
            await axios.post(
                `${API_BASE_URL}/learning-plans/${learningPlan.id}/comments`,
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

    const startEditing = (comment) => {
        setEditingCommentId(comment.id);
        setEditingText(comment.text);
    };

    const handleUpdateComment = async () => {
        if (!editingText.trim()) return;

        try {
            const token = getAuthToken();

            // Debug log
            console.log("Updating comment:", {
                commentId: editingCommentId,
                text: editingText,
                token: token ? "Present" : "Missing"
            });

            const response = await axios.put(
                `${API_BASE_URL}/learning-plans/comments/${editingCommentId}`,
                { text: editingText },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("Update comment response:", response.data);

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

            // Detailed error logging
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

            console.log("Deleting comment:", {
                commentId: commentId,
                token: token ? "Present" : "Missing"
            });

            await axios.delete(
                `${API_BASE_URL}/learning-plans/comments/${commentId}`,
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

    const handleFollow = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.post(
                `${API_BASE_URL}/users/${currentUser.id}/follow/${learningPlan.user.id}`,
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
            Swal.fire("Error", "Failed to follow the user.", "error");
        }
    };

    const handleUnfollow = async () => {
        try {
            const token = getAuthToken();
            const response = await axios.delete(
                `${API_BASE_URL}/users/${currentUser.id}/unfollow/${learningPlan.user.id}`,
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
            Swal.fire("Error", "Failed to unfollow the user.", "error");
        }
    };

    const getRelativeTime = (dateString) => {
        if (!dateString) return "Just now";
        const now = new Date();
        const taskDate = new Date(dateString);
        if (isNaN(taskDate.getTime())) return "Just now";

        const seconds = Math.floor((now - taskDate) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 5) return "Just now";
        if (seconds < 60) return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
        return `${days} day${days > 1 ? "s" : ""} ago`;
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 w-full max-w-xl mx-auto">
            <div className="flex items-center mb-4">
                {/* Profile Picture */}
                <div className="mr-4">
                    {learningPlan.user?.profilePic ? (
                        <img
                            src={`http://localhost:8080/${learningPlan.user.profilePic}`}
                            alt="Profile"
                            className="w-14 h-14 rounded-full object-cover border-2 border-gray-300"
                        />
                    ) : (
                        <FaUserCircle className="text-gray-500 text-4xl" />
                    )}
                </div>
                <div>
                    <p className="font-semibold text-gray-800">{learningPlan.user?.username || "Unknown User"}</p>
                    <p className="text-xs text-gray-500">{timeDisplay}</p>
                </div>
                <div className="font-semibold ml-auto">
                    {/* Check if the current user is the owner */}
                    {String(learningPlan.user?.id) !== String(currentUser.id) ? (
                        <button
                            onClick={isFollowing ? handleUnfollow : handleFollow}
                            className="w-full p-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-all duration-300"
                        >
                            {isFollowing ? "Unfollow" : "Follow"}
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                window.location.href = `/profile`;
                            }}
                            className="w-full p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
                        >
                            View Profile
                        </button>
                    )}
                </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">{learningPlan.title}</h2>
            <p className="text-gray-700 text-sm mb-4">{learningPlan.description}</p>

            <p className="text-xs text-gray-500 mb-4">
                📅 <strong>Start:</strong> {learningPlan.startDate ? new Date(learningPlan.startDate).toLocaleDateString() : "N/A"} |
                <strong> End:</strong> {learningPlan.endDate ? new Date(learningPlan.endDate).toLocaleDateString() : "N/A"}
            </p>

            {learningPlan.imageUrl && (
                <div className="mb-4">
                    <img
                        src={`http://localhost:8080/${learningPlan.imageUrl}`}
                        alt="Learning Plan"
                        className="w-full max-h-64 object-cover rounded-xl shadow-md"
                    />
                </div>
            )}

            <div className="flex justify-between border-t pt-3 mt-2 text-sm text-gray-600">
                <div className="flex gap-3 items-center">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 hover:text-blue-500 ${userLiked ? "text-blue-600 font-semibold" : "text-gray-500"}`}
                    >
                        <FaThumbsUp />
                        <span>{likes}</span>
                    </button>
                    <button onClick={fetchLikedUsers} className="text-blue-500 text-xs hover:underline">
                        View Likes
                    </button>
                </div>
                <button
                    onClick={() => setIsCommentModalOpen(true)}
                    className={`flex items-center gap-2 hover:text-blue-500 ${userCommented ? "text-blue-600 font-semibold" : ""}`}
                >
                    <FaComment />
                    <span>{comments}</span>
                </button>
            </div>

            {/* Comment Modal */}
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

                        {/* Comment Input */}
                        <div className="flex gap-3 mb-6 items-start">
                            <FaUserCircle className="text-3xl text-gray-400 mt-1" />
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
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
                                        onClick={handleCommentSubmit}
                                    >
                                        Post Comment
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Comment List */}
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
                                            <FaUserCircle className="text-2xl text-gray-400 mt-1" />
                                        )}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {comment.user?.username || "Anonymous"}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {getRelativeTime(comment.createdAt)}
                                                </p>
                                            </div>

                                            {/* Comment editing input */}
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
                                                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingCommentId(null);
                                                                setEditingText("");
                                                            }}
                                                            className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                                            )}

                                            {/* Action buttons for the comment owner */}
                                            {comment.user?.email === currentUser.email && editingCommentId !== comment.id && (
                                                <div className="flex gap-3 text-xs text-blue-600 mt-2">
                                                    <button
                                                        onClick={() => startEditing(comment)}
                                                        className="hover:underline"
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
                                <p className="text-gray-500 text-sm text-center">No comments yet.</p>
                            )}
                        </div>

                        {/* Modal Actions */}
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

export default LearningPlanSharingCard;