import React, { useState } from "react";
import { FaThumbsUp, FaComment } from "react-icons/fa";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import axios from "axios";

const MyLearningPlanCard = ({ learningPlan, onDelete, onUpdate }) => {
    const [likes, setLikes] = useState(120);
    const [comments, setComments] = useState(45);
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
    const [loading, setLoading] = useState(false);  // To track loading state
    const [actionLoading, setActionLoading] = useState(false);  // For other actions like like and comment

    const handleLike = () => {
        setActionLoading(true);
        setLikes(userLiked ? likes - 1 : likes + 1);
        setUserLiked(!userLiked);
        setActionLoading(false);
    };

    const handleComment = () => {
        setActionLoading(true);
        setComments(userCommented ? comments - 1 : comments + 1);
        setUserCommented(!userCommented);
        setActionLoading(false);
    };

    const handleImagePreview = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleDelete = async () => {
        const result = window.confirm("Are you sure you want to delete this post? This action cannot be undone.");

        if (!result) return;

        try {
            setLoading(true);  // Start loading during delete operation
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8080/api/learning-plans/${learningPlan.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            alert("Your learning plan has been deleted.");
            onDelete(learningPlan.id);
        } catch (error) {
            console.error("Error deleting learning plan:", error);
            alert("Learning plan could not be deleted.");
        } finally {
            setLoading(false);  // End loading after the operation
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

        setLoading(true);  // Show loading spinner
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

            alert("Learning plan updated successfully");

            // Call onUpdate with new data to update the UI dynamically without page reload
            if (onUpdate) {
                onUpdate(response.data);
            }
        } catch (error) {
            console.error("Error updating learning plan:", error);
            alert("Failed to update the learning plan.");
        } finally {
            setLoading(false);  // Hide loading spinner
            closeEditModal();
        }
    };

    return (
        <div className="flex justify-center">
            {loading && (
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

            {actionLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-5 rounded-lg flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-3 text-gray-700">Action in progress...</p>
                    </div>
                </div>
            )}

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
                            min={new Date().toISOString().split("T")[0]}
                        />
                        {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate}</p>}

                        <input
                            type="date"
                            name="endDate"
                            value={editData.endDate}
                            onChange={handleEditChange}
                            className="w-full border p-2 rounded mb-3"
                            min={new Date().toISOString().split("T")[0]}
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
