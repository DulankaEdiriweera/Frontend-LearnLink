import React, { useState, useEffect } from "react";
import { FaThumbsUp, FaComment, FaUserCircle } from "react-icons/fa";

const LearningPlanSharingCard = ({ learningPlan }) => {
    const [likes, setLikes] = useState(0);
    const [comments, setComments] = useState(0);
    const [userLiked, setUserLiked] = useState(false);
    const [userCommented, setUserCommented] = useState(false);
    const [timeDisplay, setTimeDisplay] = useState("");

    const handleLike = () => {
        setLikes(userLiked ? likes - 1 : likes + 1);
        setUserLiked(!userLiked);
    };

    const handleComment = () => {
        setComments(userCommented ? comments - 1 : comments + 1);
        setUserCommented(!userCommented);
    };

    // Function to format the time as "time ago"
    const getRelativeTime = (dateString) => {
        // If no date string is provided, use the current time
        if (!dateString) {
            return "Just now";
        }

        const now = new Date();
        let taskDate;

        try {
            // Try to parse the date string
            taskDate = new Date(dateString);

            // Check if the date is valid
            if (isNaN(taskDate.getTime())) {
                return "Just now";
            }
        } catch (error) {
            console.error("Error parsing date:", error);
            return "Just now";
        }

        const differenceInSeconds = Math.floor((now - taskDate) / 1000);
        const differenceInMinutes = Math.floor(differenceInSeconds / 60);
        const differenceInHours = Math.floor(differenceInMinutes / 60);
        const differenceInDays = Math.floor(differenceInHours / 24);

        // Just now (less than 5 seconds)
        if (differenceInSeconds < 5) {
            return "Just now";
        }

        if (differenceInSeconds < 60) {
            return `${differenceInSeconds} second${differenceInSeconds > 1 ? "s" : ""} ago`;
        } else if (differenceInMinutes < 60) {
            return `${differenceInMinutes} minute${differenceInMinutes > 1 ? "s" : ""} ago`;
        } else if (differenceInHours < 24) {
            return `${differenceInHours} hour${differenceInHours > 1 ? "s" : ""} ago`;
        } else {
            return `${differenceInDays} day${differenceInDays > 1 ? "s" : ""} ago`;
        }
    };

    // Update the time display every second
    useEffect(() => {
        // Set initial time display
        setTimeDisplay(getRelativeTime(learningPlan.createdAt));

        // Update the time display every second
        const intervalId = setInterval(() => {
            setTimeDisplay(getRelativeTime(learningPlan.createdAt));
        }, 1000);

        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, [learningPlan.createdAt]);

    return (
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 w-full max-w-xl mx-auto">
            {/* Header */}
            <div className="flex items-center mb-4">
                <FaUserCircle className="text-gray-500 text-4xl mr-3" />
                <div>
                    <p className="font-semibold text-gray-800">
                        {learningPlan.user?.username || "Unknown User"}
                    </p>
                    <p className="text-xs text-gray-500">
                        {timeDisplay}
                    </p>
                </div>
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold text-gray-900 mb-1">{learningPlan.title}</h2>

            {/* Description */}
            <p className="text-gray-700 text-sm mb-3">{learningPlan.description}</p>

            {/* Dates */}
            <p className="text-xs text-gray-500 mb-3">
                📅 <strong>Start:</strong> {learningPlan.startDate ? new Date(learningPlan.startDate).toLocaleDateString() : "N/A"}
                {" | "}
                <strong>End:</strong> {learningPlan.endDate ? new Date(learningPlan.endDate).toLocaleDateString() : "N/A"}
            </p>

            {/* Image */}
            {learningPlan.imageUrl && (
                <div className="mb-3">
                    <img
                        src={`http://localhost:8080/${learningPlan.imageUrl}`}
                        alt="Learning Plan"
                        className="w-full max-h-64 object-cover rounded-lg"
                    />
                </div>
            )}

            {/* Footer - Like and Comment */}
            <div className="flex justify-around border-t pt-3 mt-2 text-sm text-gray-600">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 hover:text-blue-500 ${userLiked ? "text-blue-600 font-medium" : ""}`}
                >
                    <FaThumbsUp />
                    <span>{likes}</span>
                </button>
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