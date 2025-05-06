import React, { useState, useEffect } from "react";
import { FaThumbsUp, FaComment } from "react-icons/fa";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import axios from "axios";

const MyLearningPlanCard = ({ learningPlan, onDelete, onUpdate, currentUser }) => {
    const [likes, setLikes] = useState(learningPlan.likedUsers?.length || 0);
    const [comments, setComments] = useState(learningPlan.comments || []);
    const [userLiked, setUserLiked] = useState(false);
    const [userCommented, setUserCommented] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({
        title: learningPlan.title,
        description: learningPlan.description,
        startDate: learningPlan.startDate,
        endDate: learningPlan.endDate,
        file: null,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false); // for delete
    const [actionLoading, setActionLoading] = useState(false); // for like
    const [updateLoading, setUpdateLoading] = useState(false); // for update

    useEffect(() => {
        if (learningPlan.likedUsers && currentUser) {
            const liked = learningPlan.likedUsers.some((u) => u.email === currentUser.email);
            setUserLiked(liked);
        }
        setLikes(learningPlan.likedUsers?.length || 0);
        setComments(learningPlan.comments || []);
    }, [learningPlan.likedUsers, currentUser, learningPlan.comments]);

    const handleLike = async () => {
        setActionLoading(true);
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

            // Ensure loader is visible for at least 1 second
            setTimeout(() => {
                setActionLoading(false);
            }, 1000);
        } catch (err) {
            console.error("Failed to update like", err);
            alert("Failed to like post.");
            setActionLoading(false); // In case of error, hide loader immediately
        }
    };

    const handleComment = async () => {
        if (!newComment.trim()) return;
        const newCommentData = {
            text: newComment,
            user: currentUser,
            createdAt: new Date().toISOString(),
        };

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                `http://localhost:8080/api/learning-plans/${learningPlan.id}/comments`,
                newCommentData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setComments([...comments, res.data]);
            setNewComment(""); // Clear the input field
        } catch (err) {
            console.error("Failed to add comment", err);
            alert("Failed to add comment.");
        }
    };

    const handleDelete = async () => {
        const result = window.confirm("Are you sure you want to delete this post?");
        if (!result) return;

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8080/api/learning-plans/${learningPlan.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Post deleted.");
            onDelete(learningPlan.id);
        } catch (error) {
            console.error("Delete error:", error);
            alert("Could not delete post.");
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = () => setIsEditModalOpen(true);
    const closeEditModal = () => setIsEditModalOpen(false);

    const handleEditChange = (e) => {
        const { name, value, files } = e.target;
        setEditData((prev) => ({
            ...prev,
            [name]: name === "file" ? files[0] : value,
        }));
    };

    return (
        <div className="flex justify-center">
            {/* Comment Section */}
            <div className="mt-4">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full p-2 border rounded mb-2"
                />
                <button
                    onClick={handleComment}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Add Comment
                </button>

                <div className="mt-4">
                    {comments.map((comment, idx) => (
                        <div key={idx} className="flex items-center space-x-2 mb-2">
                            <img
                                src={`http://localhost:8080/${comment.user.profilePic || 'default.jpg'}`}
                                alt={comment.user.username}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                                <div className="font-semibold">{comment.user.username}</div>
                                <p className="text-gray-600 text-sm">{comment.text}</p>
                                <p className="text-xs text-gray-400">{comment.createdAt}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Like Section */}
            <div className="flex justify-between items-center mt-4">
                <div className="flex items-center cursor-pointer" onClick={handleLike}>
                    <FaThumbsUp className={`mr-2 text-2xl ${userLiked ? "text-blue-500" : "text-gray-500"}`} />
                    <span>{likes}</span>
                    {learningPlan.likedUsers && learningPlan.likedUsers.length > 0 && (
                        <div className="flex ml-2">
                            {learningPlan.likedUsers.slice(0, 3).map((user, index) => (
                                <img
                                    key={index}
                                    src={`http://localhost:8080/${user.profilePic || 'default.jpg'}`} // Correct path to profile picture
                                    alt={user.username}
                                    className="w-6 h-6 rounded-full border-2 border-white -ml-2"
                                />
                            ))}
                            {learningPlan.likedUsers.length > 3 && (
                                <span className="ml-2 text-sm">+{learningPlan.likedUsers.length - 3} more</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyLearningPlanCard;
