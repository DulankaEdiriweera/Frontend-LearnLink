import React, { useEffect, useState } from "react";
import Navigation from "../Navigation/Navigation.jsx";
import LearningPlanSharingCard from "./LearningPlanSharingCard.jsx";
import LearningPlanSharingRightPart from "./LearningPlanSharingRightPart.jsx";
import axios from "axios";

const LearningPlanFeed = () => {
    const token = localStorage.getItem("token");

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({
            ...formData,
            file: file,
        });

        if (file) {
            const filePreview = URL.createObjectURL(file);
            setPreview(filePreview);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!token) {
                alert("User not logged in");
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
                "http://localhost:8080/api/learning-plans",
                formDataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
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
        } catch (error) {
            console.error("Error creating learning plan:", error);
            alert("Failed to create learning plan");
        }
    };

    useEffect(() => {
        console.log("Component mounted, token value:", token);

        const fetchLearningPlans = async () => {
            if (!token) {
                console.log("Token not available yet or user not logged in");
                return;
            }

            try {
                console.log("Fetching learning plans with token:", token);
                const response = await axios.get("http://localhost:8080/api/learning-plans", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        sort: "createdAt,desc" // Request sorting from server if your API supports it
                    }
                });
                console.log("Learning plans fetched:", response.data);
                setLearningPlans(response.data);
            } catch (error) {
                console.error("Error fetching learning plans:", error.response || error);
                alert("Failed to fetch learning plans");
            }
        };

        fetchLearningPlans();
    }, [token]);

    return (
        <div className="flex">
            <div className="w-1/6">
                <Navigation />
            </div>

            <div className="h-screen bg-slate-100 p-4 flex-grow shadow-lg rounded-2xl mt-2 mb-2 ml-2 overflow-y-scroll scrollbar-hidden w-4/6">
                <div className="flex justify-center">
                    <form onSubmit={handleSubmit} className="space-y-4 p-4 w-3/4 shadow-xl rounded-xl bg-white transition-all duration-300">
                        <h2 className="text-2xl font-semibold mb-4">Share a Learning Plan</h2>

                        {/* Title - Always visible */}
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
                                className="w-full p-2 border rounded-lg"
                                placeholder="Enter learning plan title"
                                required
                            />
                        </div>

                        {/* Conditional rendering for the rest of the form */}
                        {isFormExpanded && (
                            <>
                                {/* Description */}
                                <div>
                                    <label htmlFor="description" className="block text-lg font-medium">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-lg"
                                        placeholder="Enter learning plan description"
                                        rows="4"
                                        required
                                    />
                                </div>

                                {/* Start Date */}
                                <div>
                                    <label htmlFor="startDate" className="block text-lg font-medium">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-lg"
                                        required
                                    />
                                </div>

                                {/* End Date */}
                                <div>
                                    <label htmlFor="endDate" className="block text-lg font-medium">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-lg"
                                        required
                                    />
                                </div>

                                {/* File Upload */}
                                <div>
                                    <label htmlFor="file" className="block text-lg font-medium">
                                        Attach an Image
                                    </label>
                                    <input
                                        type="file"
                                        id="file"
                                        name="file"
                                        onChange={handleFileChange}
                                        className="w-full p-2 border rounded-lg"
                                        accept="image/*"
                                    />
                                </div>

                                {/* Preview */}
                                {preview && (
                                    <div className="mt-4">
                                        <img src={preview} alt="Selected Preview" className="w-1/2 h-1/2 rounded-lg" />
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-1/6 py-2 mt-4 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-all duration-300"
                                >
                                    Share
                                </button>
                            </>
                        )}
                    </form>
                </div>

                <div className="pt-10 px-5">
                    {[...learningPlans].reverse().map((learningPlan) => (
                        <LearningPlanSharingCard key={learningPlan.id} learningPlan={learningPlan} />
                    ))}
                </div>
            </div>

            {/* Right side panel */}
            <div className="w-1/3">
                <LearningPlanSharingRightPart />
            </div>
        </div>
    );
};

export default LearningPlanFeed;