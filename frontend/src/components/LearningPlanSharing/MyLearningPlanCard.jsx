import React, { useState, useEffect } from "react";
import { FaThumbsUp, FaComment } from "react-icons/fa";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import axios from "axios";

const MyLearningPlanCard = ({ learningPlan, onDelete, onUpdate, currentUser }) => {
    const [likes, setLikes] = useState(learningPlan.likedUsers?.length || 0);
    const [comments, setComments] = useState(0);
    const [userLiked, setUserLiked] = useState(false);
    const [userCommented, setUserCommented] = useState(false);
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
    }, [learningPlan.likedUsers, currentUser]);

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

    const handleComment = () => {
        setComments(userCommented ? comments - 1 : comments + 1);
        setUserCommented(!userCommented);
    };

    const handleImagePreview = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

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

    const validateForm = () => {
        let tempErrors = {};
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
                `http://localhost:8080/api/learning-plans/${learningPlan.id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert("Updated successfully");
            if (onUpdate) onUpdate(response.data);
        } catch (error) {
            console.error("Update error:", error);
            alert("Update failed.");
        } finally {
            setUpdateLoading(false);
            closeEditModal();
        }
    };

    return (
        <div className="flex justify-center">
            {/* Delete Loader */}
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-5 rounded-lg flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-3 text-gray-700">Deleting...</p>
                    </div>
                </div>
            )}

            {/* Update Loader */}
            {updateLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-5 rounded-lg flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-3 text-gray-700">Updating...</p>
                    </div>
                </div>
            )}

            <div className="bg-white shadow-lg rounded-lg p-6 mb-4 w-full max-w-lg relative">
                <div className="flex items-center justify-between mb-2 w-full">
                    <div className="font-semibold text-lg text-gray-800">
                        {learningPlan.user ? learningPlan.user.username : "Unknown User"}
                    </div>
                    <div className="flex space-x-4 text-2xl ml-auto">
                        <MdEdit onClick={openEditModal} className="cursor-pointer text-blue-600" />
                        <MdDeleteForever onClick={handleDelete} className="cursor-pointer text-red-600" />
                    </div>
                </div>

                <div className="text-xl font-semibold mb-2">{learningPlan.title}</div>
                <p className="text-gray-700">{learningPlan.description}</p>
                <div className="text-gray-600 text-sm">
                    <p>Start Date: {learningPlan.startDate}</p>
                    <p>End Date: {learningPlan.endDate}</p>
                </div>

                {learningPlan.imageUrl && (
                    <div className="mt-4">
                        <img
                            src={`http://localhost:8080/${learningPlan.imageUrl}`}
                            alt="learningPlan"
                            className="cursor-pointer max-w-full h-auto"
                            onClick={handleImagePreview}
                        />
                    </div>
                )}

                <div className="flex justify-between items-center mt-4">
                    <div
                        className={`flex items-center cursor-pointer ${userLiked ? "text-blue-500" : "text-gray-500"}`}
                        onClick={handleLike}
                    >
                        <FaThumbsUp className="mr-2 text-2xl" />
                        <span>{likes}</span>
                    </div>
                    <div
                        className={`flex items-center cursor-pointer ${userCommented ? "text-blue-500" : "text-gray-500"}`}
                        onClick={handleComment}
                    >
                        <FaComment className="mr-2 text-2xl" />
                        <span>{comments}</span>
                    </div>
                </div>
            </div>

            {/* Action Loading (like/comment) */}
            {actionLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-5 rounded-lg flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-3 text-gray-700">Action in progress...</p>
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
                        <h2 className="text-xl font-semibold mb-4">Edit Learning Plan</h2>

                        <input
                            type="text"
                            name="title"
                            value={editData.title}
                            onChange={handleEditChange}
                            className="w-full border p-2 rounded mb-3"
                            placeholder="Title"
                        />
                        {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}

                        <textarea
                            name="description"
                            value={editData.description}
                            onChange={handleEditChange}
                            className="w-full border p-2 rounded mb-3"
                            rows="3"
                            placeholder="Description"
                        ></textarea>
                        {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}

                        <input
                            type="date"
                            name="startDate"
                            value={editData.startDate}
                            onChange={handleEditChange}
                            className="w-full border p-2 rounded mb-3"
                        />
                        {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate}</p>}

                        <input
                            type="date"
                            name="endDate"
                            value={editData.endDate}
                            onChange={handleEditChange}
                            className="w-full border p-2 rounded mb-3"
                        />
                        {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate}</p>}

                        {learningPlan.imageUrl && (
                            <img
                                src={`http://localhost:8080/${learningPlan.imageUrl}`}
                                alt="learningPlan"
                                className="w-full h-auto mb-3"
                            />
                        )}

                        <input
                            type="file"
                            name="file"
                            onChange={handleEditChange}
                            className="w-full border p-2 rounded mb-3"
                        />

                        <div className="flex justify-between items-center">
                            <button
                                onClick={handleEditSubmit}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={closeEditModal}
                                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyLearningPlanCard;
