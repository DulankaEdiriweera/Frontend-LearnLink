import React, { useEffect, useState, useRef } from "react";
import Navigation from "../Navigation/Navigation.jsx";
import LearningPlanSharingCard from "./LearningPlanSharingCard.jsx";
import LearningPlanSharingRightPart from "./LearningPlanSharingRightPart.jsx";
import axios from "axios";

const LearningPlanFeed = () => {
    const token = localStorage.getItem("token");
    const apiRef = useRef("http://localhost:8080/api/learning-plans");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        file: null,
    });

    const [preview, setPreview] = useState(null);
    const [learningPlans, setLearningPlans] = useState([]);
    const [isFormExpanded, setIsFormExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState(null);

    const today = new Date().toISOString().split('T')[0];

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        } else if (formData.title.length < 3) {
            newErrors.title = "Title must be at least 3 characters";
        }

        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
        } else if (formData.description.length < 10) {
            newErrors.description = "Description must be at least 10 characters";
        }

        if (!formData.startDate) {
            newErrors.startDate = "Start date is required";
        }

        if (!formData.endDate) {
            newErrors.endDate = "End date is required";
        }

        if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
            newErrors.endDate = "End date must be after start date";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            if (!file.type.match('image.*')) {
                setErrors(prev => ({
                    ...prev,
                    file: "Please select an image file"
                }));
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    file: "File size should be less than 5MB"
                }));
                return;
            }

            setFormData({
                ...formData,
                file: file,
            });

            const filePreview = URL.createObjectURL(file);
            setPreview(filePreview);

            setErrors(prev => ({
                ...prev,
                file: null
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setLoading(true);
        setServerError(null);

        try {
            if (!token) {
                alert("User not logged in. Please log in again.");
                setServerError("User not logged in. Please log in again.");
                setIsSubmitting(false);
                setLoading(false);
                return;
            }

            const formDataToSend = new FormData();
            formDataToSend.append("title", formData.title);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("startDate", formData.startDate);
            formDataToSend.append("endDate", formData.endDate);
            if (formData.file) {
                formDataToSend.append("file", formData.file);
            }

            const response = await axios.post(
                apiRef.current,
                formDataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    }
                }
            );

            console.log("Learning Plan Created:", response.data);
            alert("Learning Plan created successfully!");

            setFormData({
                title: "",
                description: "",
                startDate: "",
                endDate: "",
                file: null,
            });
            setPreview(null);
            setIsFormExpanded(false);

            // Add new plan to top of list
            if (response.data) {
                setLearningPlans(prevPlans => [response.data, ...prevPlans]);
            } else {
                await fetchLearningPlans(); // fallback
            }

        } catch (error) {
            console.error("Error creating learning plan:", error);
            alert("Failed to create learning plan");
            setServerError("Failed to create learning plan. Please try again.");
        } finally {
            setIsSubmitting(false);
            setTimeout(() => {
                setLoading(false);
            }, 500);
        }
    };
    const email = localStorage.getItem("email");
    const id = localStorage.getItem("id");

    const fetchLearningPlans = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(apiRef.current, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    sort: "createdAt,desc"
                }
            });

            const sortedPlans = response.data.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );

            setLearningPlans(sortedPlans);
        } catch (error) {
            console.error("Failed to fetch learning plans:", error);
            alert("Failed to fetch learning plans");
            setServerError("Failed to fetch learning plans");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchLearningPlans();
    }, [token]);
    // Optional: If you also have user ID and username saved
    const currentUser = {
        email: email,
        id: id
    };
    return (
        <div className="flex">
            <div className="w-1/6">
                <Navigation />
            </div>

            <div className="h-screen bg-slate-100 p-4 flex-grow shadow-lg rounded-2xl mt-2 mb-2 ml-2 overflow-y-scroll scrollbar-hidden w-4/6">
                {loading && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-5 rounded-lg flex flex-col items-center">
                            <div className="w-12 h-12 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-3 text-gray-700">Loading...</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-center">
                    <form onSubmit={handleSubmit} className="space-y-4 p-4 w-3/4 shadow-xl rounded-xl bg-white transition-all duration-300">
                        <h2 className="text-2xl font-semibold mb-4">Share a Learning Plan</h2>

                        <div>
                            <label htmlFor="title" className="block text-lg font-medium">
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                onClick={() => setIsFormExpanded(true)}
                                className={`w-full p-2 border rounded-lg ${errors.title ? 'border-red-500' : ''}`}
                                placeholder="Enter learning plan title"
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>

                        {isFormExpanded && (
                            <>
                                <div>
                                    <label htmlFor="description" className="block text-lg font-medium">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className={`w-full p-2 border rounded-lg ${errors.description ? 'border-red-500' : ''}`}
                                        placeholder="Enter learning plan description"
                                        rows="4"
                                    />
                                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                                </div>

                                <div>
                                    <label htmlFor="startDate" className="block text-lg font-medium">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        name="startDate"
                                        value={formData.startDate}
                                        min={today}
                                        onChange={handleChange}
                                        className={`w-full p-2 border rounded-lg ${errors.startDate ? 'border-red-500' : ''}`}
                                    />
                                    {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                                </div>

                                <div>
                                    <label htmlFor="endDate" className="block text-lg font-medium">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        name="endDate"
                                        value={formData.endDate}
                                        min={formData.startDate || today}
                                        onChange={handleChange}
                                        className={`w-full p-2 border rounded-lg ${errors.endDate ? 'border-red-500' : ''}`}
                                    />
                                    {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                                </div>

                                <div>
                                    <label htmlFor="file" className="block text-lg font-medium">
                                        Attach an Image
                                    </label>
                                    <input
                                        type="file"
                                        id="file"
                                        name="file"
                                        onChange={handleFileChange}
                                        className={`w-full p-2 border rounded-lg ${errors.file ? 'border-red-500' : ''}`}
                                        accept="image/*"
                                    />
                                    {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
                                </div>

                                {preview && (
                                    <div className="mt-4">
                                        <img src={preview} alt="Selected Preview" className="w-1/2 h-auto rounded-lg" />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-1/6 py-2 mt-4 ${isSubmitting ? 'bg-gray-500' : 'bg-blue-800 hover:bg-blue-900'} text-white rounded-lg transition-all duration-300 flex justify-center items-center`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            <span>Sharing...</span>
                                        </>
                                    ) : (
                                        "Share"
                                    )}
                                </button>
                            </>
                        )}
                    </form>
                </div>

                {serverError && !isFormExpanded && (
                    <div className="mt-4 mx-auto w-3/4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        <div className="flex justify-between">
                            <p className="font-medium">Error:</p>
                            <button
                                onClick={() => setServerError(null)}
                                className="text-red-700 hover:text-red-900"
                            >
                                ✕
                            </button>
                        </div>
                        <p>{serverError}</p>
                        <div className="mt-2 text-sm">
                            <button
                                onClick={() => {
                                    setServerError(null);
                                    setLoading(true);
                                    fetchLearningPlans();
                                }}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                Retry Loading
                            </button>
                        </div>
                    </div>
                )}

                <div className="pt-10 px-5">
                    {learningPlans.length > 0 ? (
                        [...learningPlans].map((learningPlan) => (
                            <LearningPlanSharingCard key={learningPlan.id} learningPlan={learningPlan} currentUser={currentUser} />
                        ))
                    ) : !loading ? (
                        <div className="text-center py-10 text-gray-500">
                            No learning plans found. Create your first one!
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="w-1/6">
                <LearningPlanSharingRightPart />
            </div>
        </div>
    );
};

export default LearningPlanFeed;
