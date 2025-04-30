import React, { useState } from "react";
import { FaThumbsUp, FaComment } from "react-icons/fa";

const LearningPlanSharingCard = ({ learningPlan }) => {
    // State to keep track of like and comment counts
    const [likes, setLikes] = useState(0);
    const [comments, setComments] = useState(0);

    // State to track if the logged-in user has liked or commented
    const [userLiked, setUserLiked] = useState(false);
    const [userCommented, setUserCommented] = useState(false);

    // Handle like button click
    const handleLike = () => {
        if (userLiked) {
            setLikes(likes - 1);
        } else {
            setLikes(likes + 1);
        }
        setUserLiked(!userLiked);
    };

    // Handle comment button click
    const handleComment = () => {
        if (userCommented) {
            setComments(comments - 1);
        } else {
            setComments(comments + 1);
        }
        setUserCommented(!userCommented);
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-4 mb-4">
            {/* Plan Owner */}
            <div className="flex items-center mb-2">
                <div className="font-semibold text-lg text-gray-800">
                    {learningPlan.user ? learningPlan.user.username : 'Unknown User'}
                </div>
            </div>

            {/* Plan Title */}
            <div className="text-xl font-semibold mb-2">{learningPlan.title}</div>

            {/* Plan Description */}
            <p className="text-gray-700 mb-2">{learningPlan.description}</p>

            {/* Plan Dates */}
            <div className="text-sm text-gray-500 mb-4">
                Start: {learningPlan.startDate ? new Date(learningPlan.startDate).toLocaleDateString() : 'N/A'} |
                End: {learningPlan.endDate ? new Date(learningPlan.endDate).toLocaleDateString() : 'N/A'}
            </div>

            {/* Plan Image */}
            {learningPlan.imageUrl && (
                <div className="mt-4">
                    <img
                        src={learningPlan.imageUrl}
                        alt="Plan Media"
                        className="w-full h-auto object-cover rounded-lg"
                    />
                </div>
            )}

            {/* Like and Comment Buttons */}
            <div className="flex justify-between items-center mt-4">
                <div
                    className={`flex items-center cursor-pointer ${userLiked ? "text-blue-500" : "text-gray-500"
                        }`}
                    onClick={handleLike}
                >
                    <FaThumbsUp className="mr-2 text-2xl" />
                    <span>{likes}</span>
                </div>

                <div
                    className={`flex items-center cursor-pointer ${userCommented ? "text-blue-500" : "text-gray-500"
                        }`}
                    onClick={handleComment}
                >
                    <FaComment className="mr-2 text-2xl" />
                    <span>{comments}</span>
                </div>
            </div>
        </div>
    );
};

export default LearningPlanSharingCard;
