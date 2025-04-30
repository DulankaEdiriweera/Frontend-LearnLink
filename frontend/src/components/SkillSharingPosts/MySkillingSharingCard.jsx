import React, { useState } from 'react'
import { FaThumbsUp, FaComment } from "react-icons/fa";

const MySkillingSharingCard = ({ skill }) => {
    // State to keep track of like and comment counts
      const [likes, setLikes] = useState(120);
      const [comments, setComments] = useState(45);
    
      // State to track if the logged-in user has liked or commented
      const [userLiked, setUserLiked] = useState(false); // Change to true if user liked
      const [userCommented, setUserCommented] = useState(false); // Change to true if user commented
    
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
  return (
    
    <div>
      <div className="bg-white shadow-lg rounded-lg p-4 mb-4">
            {/* Post Owner */}
            <div className="flex items-center mb-2">
              <div className="font-semibold text-lg text-gray-800">{skill.user ? skill.user.username : 'Unknown User'}</div>
            </div>
      
            {/* Post Title */}
            <div className="text-xl font-semibold mb-2">{skill.title}</div>
      
            {/* Post Description */}
            <p className="text-gray-700">
            {skill.description}
            </p>
      
            {/* Post Image or Video */}
            <div className="mt-4">
              {skill.imageUrl && (
                <img
                  src={`http://localhost:8080/${skill.imageUrl}`}
                  alt="Post Media"
                  className="w-2/3 h-auto object-cover rounded-lg"
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
    </div>
  )
}

export default MySkillingSharingCard
