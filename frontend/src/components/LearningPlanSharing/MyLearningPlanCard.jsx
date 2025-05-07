import React, { useState, useEffect } from "react";
import { FaThumbsUp, FaComment } from "react-icons/fa";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

// Helper to format date for input[type="date"]
const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
};

const MyLearningPlanCard = ({ learningPlan, onDelete, onUpdate, currentUser }) => {
    const [likes, setLikes] = useState(learningPlan.likedUsers?.length || 0);
    const [likedUsers, setLikedUsers] = useState(learningPlan.likedUsers || []);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState(learningPlan.comments || []);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(learningPlan);
    const [editData, setEditData] = useState({
        title: learningPlan.title,
        description: learningPlan.description,
        startDate: formatDateForInput(learningPlan.startDate),
        endDate: formatDateForInput(learningPlan.endDate),
        file: null,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [showLikedByModal, setShowLikedByModal] = useState(false);

    useEffect(() => {
        setCurrentPlan(learningPlan);
        setLikes(learningPlan.likedUsers?.length || 0);
        setLikedUsers(learningPlan.likedUsers || []);
        setComments(learningPlan.comments || []);
        setEditData({
            title: learningPlan.title,
            description: learningPlan.description,
            startDate: formatDateForInput(learningPlan.startDate),
            endDate: formatDateForInput(learningPlan.endDate),
            file: null,
        });
    }, [learningPlan]);

    const openCommentModal = () => setShowComments(true);
    const closeCommentModal = () => setShowComments(false);
    const openLikedByModal = () => setShowLikedByModal(true);
    const closeLikedByModal = () => setShowLikedByModal(false);

    const handleDelete = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this post?");
        if (!confirmed) return;

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8080/api/learning-plans/${currentPlan.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Post deleted.");
            onDelete(currentPlan.id);
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

    const validateForm = () => {
        const tempErrors = {};
        if (!editData.title) tempErrors.title = "Title is required!";
        if (!editData.description) tempErrors.description = "Description is required!";
        if (!editData.startDate) tempErrors.startDate = "Start Date is required!";
        if (!editData.endDate) tempErrors.endDate = "End Date is required!";
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleEditSubmit = async () => {
        if (!validateForm()) return;
        setUpdateLoading(true);
        const token = localStorage.getItem("token");

        try {
            const formData = new FormData();
            formData.append("title", editData.title);
            formData.append("description", editData.description);
            formData.append("startDate", editData.startDate);
            formData.append("endDate", editData.endDate);
            if (editData.file) {
                formData.append("file", editData.file);
            }

            const response = await axios.put(
                `http://localhost:8080/api/learning-plans/${currentPlan.id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert("Updated successfully");

            const updatedPlan = response.data;
            setCurrentPlan(updatedPlan);
            setEditData({
                title: updatedPlan.title,
                description: updatedPlan.description,
                startDate: formatDateForInput(updatedPlan.startDate),
                endDate: formatDateForInput(updatedPlan.endDate),
                file: null,
            });
            if (onUpdate) onUpdate(updatedPlan);
        } catch (error) {
            console.error("Update error:", error);
            alert("Update failed.");
        } finally {
            setUpdateLoading(false);
            closeEditModal();
        }
    };

    return (
        <div className="flex justify-center py-4">
            {(loading || updateLoading) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-5 rounded-lg flex flex-col items-center shadow-lg">
                        <div className="w-12 h-12 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-3 text-gray-700 text-lg">
                            {loading ? "Deleting..." : "Updating..."}
                        </p>
                    </div>
                </div>
            )}

            <div className="bg-white shadow-xl rounded-xl p-6 mb-4 w-full max-w-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <img
                            src={`http://localhost:8080/${currentPlan.user.profilePic}`}
                            alt={currentPlan.user.username}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <div className="font-semibold text-lg text-gray-900">
                                {currentPlan.user ? currentPlan.user.username : "Unknown User"}
                            </div>
                            {currentPlan.createdAt && (
                                <p className="text-sm text-gray-500">
                                    {formatDistanceToNow(new Date(currentPlan.createdAt), { addSuffix: true })}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex space-x-3 text-2xl ml-auto">
                        <MdEdit onClick={openEditModal} className="cursor-pointer text-blue-600 hover:text-blue-800 transition duration-300" />
                        <MdDeleteForever onClick={handleDelete} className="cursor-pointer text-red-600 hover:text-red-800 transition duration-300" />
                    </div>
                </div>

                <div className="text-2xl font-semibold text-gray-900 mb-2">{currentPlan.title}</div>
                <p className="text-gray-700 mb-3">{currentPlan.description}</p>
                <div className="text-gray-600 text-sm">
                    <p>Start Date: {formatDateForInput(currentPlan.startDate)}</p>
                    <p>End Date: {formatDateForInput(currentPlan.endDate)}</p>
                </div>

                {currentPlan.imageUrl && (
                    <div className="mt-4 rounded-lg overflow-hidden shadow-md">
                        <img
                            src={`http://localhost:8080/${currentPlan.imageUrl}`}
                            alt="learningPlan"
                            className="w-full h-auto object-cover"
                        />
                    </div>
                )}

                <div className="flex justify-between items-center mt-4">
                    <div
                        className="flex items-center cursor-pointer text-blue-600 hover:text-blue-800"
                        onClick={openLikedByModal}
                    >
                        <FaThumbsUp className="mr-2 text-xl" />
                        <span>{likedUsers.length}</span>
                    </div>

                    <div
                        className={`flex items-center cursor-pointer ${showComments ? "text-blue-500" : "text-gray-500"}`}
                        onClick={openCommentModal}
                    >
                        <FaComment className="mr-2 text-xl" />
                        <span>{comments.length}</span>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={closeEditModal}>
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-semibold mb-4 text-gray-900">Edit Learning Plan</h2>

                        <input type="text" name="title" value={editData.title} onChange={handleEditChange} className="w-full border p-3 rounded-lg mb-4" placeholder="Title" />
                        {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}

                        <textarea name="description" value={editData.description} onChange={handleEditChange} className="w-full border p-3 rounded-lg mb-4" rows="3" placeholder="Description" />
                        {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}

                        <input type="date" name="startDate" value={editData.startDate} onChange={handleEditChange} className="w-full border p-3 rounded-lg mb-4" />
                        {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate}</p>}

                        <input type="date" name="endDate" value={editData.endDate} onChange={handleEditChange} className="w-full border p-3 rounded-lg mb-4" />
                        {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate}</p>}

                        {currentPlan.imageUrl && (
                            <img src={`http://localhost:8080/${currentPlan.imageUrl}`} alt="learningPlan" className="w-full h-auto mb-3 rounded-lg shadow-md" />
                        )}

                        <input type="file" name="file" onChange={handleEditChange} className="w-full border p-3 rounded-lg mb-4" />

                        <div className="flex justify-between mt-4">
                            <button onClick={handleEditSubmit} className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition duration-300">
                                Save Changes
                            </button>
                            <button onClick={closeEditModal} className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition duration-300">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Liked By Modal */}
            {showLikedByModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={closeLikedByModal}>
                    <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-semibold text-gray-900">Liked By</h2>
                        <ul className="mt-4 space-y-2">
                            {likedUsers.map((user) => (
                                <li key={user.id} className="flex items-center">
                                    <img src={`http://localhost:8080/${user.profilePic}`} alt={user.username} className="w-8 h-8 rounded-full mr-3" />
                                    <span>{user.username}</span>
                                </li>
                            ))}
                        </ul>
                        <button onClick={closeLikedByModal} className="mt-4 bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition duration-300">
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Comments Modal */}
            {showComments && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={closeCommentModal}>
                    <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl overflow-y-auto max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
                        <div className="mt-4 space-y-4">
                            {comments.length === 0 ? (
                                <p className="text-gray-500">No comments yet.</p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex items-start gap-3 border-b pb-2">
                                        <img
                                            src={`http://localhost:8080/${comment.user?.profilePic}`}
                                            alt={comment.user?.username}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{comment.user?.username}</p>
                                            <p className="text-gray-700">{comment.text}</p>
                                            <p className="text-xs text-gray-400">
                                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <button onClick={closeCommentModal} className="mt-4 bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition duration-300">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyLearningPlanCard;
