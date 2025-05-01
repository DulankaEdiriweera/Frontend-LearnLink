import React, { useState, useEffect } from "react";
import { FaThumbsUp, FaComment, FaUserCircle } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

const LearningPlanSharingCard = ({ learningPlan, currentUser }) => {
    const [likes, setLikes] = useState(learningPlan.likedUsers?.length || 0);
    const [comments, setComments] = useState(0);
    const [userLiked, setUserLiked] = useState(false);
    const [userCommented, setUserCommented] = useState(false);
    const [timeDisplay, setTimeDisplay] = useState("");

    useEffect(() => {
        if (learningPlan.likedUsers && currentUser) {
            const liked = learningPlan.likedUsers.some((u) => u.email === currentUser.email);
            setUserLiked(liked);
        }
    }, [learningPlan.likedUsers, currentUser]);

    const handleLike = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.put(
                `http://localhost:8080/api/learning-plans/${learningPlan.id}/like`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setLikes(res.data.likeCount);
            setUserLiked(res.data.liked);
        } catch (error) {
            Swal.fire("Error", "Failed to update like", "error");
        }
    };

    const fetchLikedUsers = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/learning-plans/${learningPlan.id}/liked-users`);
            Swal.fire({
                title: `<div style="font-size: 24px;">👍 Liked by</div>`,
                html: `<div style="text-align: left;">
                        ${res.data.map((u) => `<p>${u.username} (${u.email})</p>`).join("")}
                      </div>`,
                icon: "info",
            });
        } catch (err) {
            Swal.fire("Error", "Failed to load liked users", "error");
        }
    };

    const handleComment = () => {
        setComments(userCommented ? comments - 1 : comments + 1);
        setUserCommented(!userCommented);
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

    useEffect(() => {
        setTimeDisplay(getRelativeTime(learningPlan.createdAt));
        const intervalId = setInterval(() => {
            setTimeDisplay(getRelativeTime(learningPlan.createdAt));
        }, 1000);
        return () => clearInterval(intervalId);
    }, [learningPlan.createdAt]);

    return (
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 w-full max-w-xl mx-auto">
            <div className="flex items-center mb-4">
                <FaUserCircle className="text-gray-500 text-4xl mr-3" />
                <div>
                    <p className="font-semibold text-gray-800">{learningPlan.user?.username || "Unknown User"}</p>
                    <p className="text-xs text-gray-500">{timeDisplay}</p>
                </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-1">{learningPlan.title}</h2>
            <p className="text-gray-700 text-sm mb-3">{learningPlan.description}</p>

            <p className="text-xs text-gray-500 mb-3">
                📅 <strong>Start:</strong> {learningPlan.startDate ? new Date(learningPlan.startDate).toLocaleDateString() : "N/A"} |
                <strong> End:</strong> {learningPlan.endDate ? new Date(learningPlan.endDate).toLocaleDateString() : "N/A"}
            </p>

            {learningPlan.imageUrl && (
                <div className="mb-3">
                    <img
                        src={`http://localhost:8080/${learningPlan.imageUrl}`}
                        alt="Learning Plan"
                        className="w-full max-h-64 object-cover rounded-lg"
                    />
                </div>
            )}

            <div className="flex justify-between border-t pt-3 mt-2 text-sm text-gray-600">
                <div className="flex gap-2 items-center">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-1 hover:text-blue-500 ${userLiked ? "text-blue-600 font-medium" : ""}`}
                    >
                        <FaThumbsUp />
                        <span>{likes}</span>
                    </button>
                    <button onClick={fetchLikedUsers} className="text-blue-500 text-xs hover:underline">
                        View Likes
                    </button>
                </div>
                <button
                    onClick={handleComment}
                    className={`flex items-center gap-2 hover:text-blue-500 ${userCommented ? "text-blue-600 font-medium" : ""}`}
                >
                    <FaComment />
                    <span>{comments}</span>
                </button>
            </div>
        </div>
    );
};

export default LearningPlanSharingCard;
