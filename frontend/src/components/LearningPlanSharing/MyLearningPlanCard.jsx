import React, { useState } from "react";
import { FaThumbsUp, FaComment } from "react-icons/fa";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import axios from "axios";
import Swal from "sweetalert2";

const MyLearningPlanCard = ({ learningPlan, onDelete }) => {
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
    const [loading, setLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleLike = () => {
        setLikes(userLiked ? likes - 1 : likes + 1);
        setUserLiked(!userLiked);
    };

    const handleComment = () => {
        setComments(userCommented ? comments - 1 : comments + 1);
        setUserCommented(!userCommented);
    };

    const handleImagePreview = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

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
            await axios.delete(`http://localhost:8080/api/learning-plans/${learningPlan.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            Swal.fire("Deleted!", "Your learning plan has been deleted.", "success");
            onDelete(learningPlan.id);
        } catch (error) {
            console.error("Error deleting learning plan:", error);
            Swal.fire("Failed!", "Learning plan could not be deleted.", "error");
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

        setLoading(true);
        setIsUpdating(true);

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

            await axios.put(
                `http://localhost:8080/api/learning-plans/${learningPlan.id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            Swal.fire("Success!", "Learning plan updated successfully", "success");
            onDelete(learningPlan.id); // Refresh the list after update
        } catch (error) {
            console.error("Error updating learning plan:", error);
            Swal.fire("Error!", "Failed to update the learning plan", "error");
        } finally {
            setLoading(false);
            setIsUpdating(false);
        }

        closeEditModal();
    };

    return (
        <div className="flex justify-center">
            <div className="bg-white shadow-lg rounded-lg p-6 mb-4 w-full max-w-lg">
                {loading && !isUpdating && (
                    <div className="absolute inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="loader"></div>
                    </div>
                )}

                <div className="flex items-center justify-between mb-2 w-full">
                    <div className="font-semibold text-lg text-gray-800">
                        {learningPlan.user ? learningPlan.user.username : "Unknown User"}
                    </div>
                    <div className="flex space-x-4 text-2xl ml-auto">
                        <div className="cursor-pointer text-blue-600 flex items-center">
                            <MdEdit onClick={openEditModal} className="mr-1" />
                        </div>
                        <div onClick={handleDelete} className="cursor-pointer text-red-600 flex items-center">
                            <MdDeleteForever className="mr-1" />
                        </div>
                    </div>
                </div>

                <div className="text-xl font-semibold mb-2">{learningPlan.title}</div>
                <p className="text-gray-700">{learningPlan.description}</p>
                <div className="text-gray-600 text-sm">
                    <p>Start Date: {learningPlan.startDate}</p>
                    <p>End Date: {learningPlan.endDate}</p>
                </div>

                <div className="mt-4">
                    {learningPlan.imageUrl && (
                        <img
                            src={`http://localhost:8080/${learningPlan.imageUrl}`}
                            alt="learningPlan"
                            className="cursor-pointer"
                            style={{ maxWidth: "60%", height: "auto" }}
                            onClick={handleImagePreview}
                        />
                    )}
                </div>

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
