import React, { useEffect, useState, useRef } from "react";
import Navigation from "../Navigation/Navigation.jsx";
import LearningPlanSharingCard from "./LearningPlanSharingCard.jsx";
import axios from "axios";
import LearningPlanSharingRightPart from "./LearningPlanSharingRightPart";

const LearningPlanFeed = () => {
    const token = localStorage.getItem("token");

    const formRef = useRef(null);
    const [showRestFields, setShowRestFields] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        file: null,
    });

    const [preview, setPreview] = useState(null);
    const [learningPlans, setLearningPlans] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData((prev) => ({ ...prev, file: file }));

        if (file) {
            const filePreview = URL.createObjectURL(file);
            setPreview(filePreview);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            alert("User not logged in");
            return;
        }

        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("startDate", formData.startDate);
        data.append("endDate", formData.endDate);
        if (formData.file) {
            data.append("file", formData.file);
        }

        try {
            const response = await axios.post(
                "http://localhost:8080/api/learning-plans",
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert("Learning Plan created successfully!");
            setFormData({
                title: "",
                description: "",
                startDate: "",
                endDate: "",
                file: null,
            });
            setPreview(null);
            setShowRestFields(false);
        } catch (error) {
            console.error("Error creating learning plan:", error);
            alert("Failed to create learning plan");
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (formRef.current && !formRef.current.contains(event.target)) {
                setShowRestFields(false);
                setFormData({
                    title: "",
                    description: "",
                    startDate: "",
                    endDate: "",
                    file: null,
                });
                setPreview(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchLearningPlans = async () => {
            if (!token) return;

            try {
                const response = await axios.get("http://localhost:8080/api/learning-plans", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setLearningPlans(response.data);
            } catch (error) {
                console.error("Error fetching learning plans:", error);
            }
        };

        fetchLearningPlans();
    }, [token]);

    return (
        <div className="flex">
            <div className="mr-2">
                <Navigation />
            </div>
            <div className="h-screen bg-slate-100 p-4 flex-grow shadow-lg rounded-2xl mt-2 mb-2 ml-2 overflow-y-scroll scrollbar-hidden flex flex-row">
                {/* Left */}
                <div className="w-full md:w-2/3 pr-4">
                    <form
                        ref={formRef}
                        onSubmit={handleSubmit}
                        className="space-y-4 p-4 w-full shadow-xl rounded-xl bg-white"
                    >
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
                                onFocus={() => setShowRestFields(true)}
                                className="w-full p-2 border rounded-lg"
                                placeholder="Enter learning plan title"
                                required
                            />
                        </div>

                        {showRestFields && (
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
                                        className="w-full p-2 border rounded-lg"
                                        placeholder="Enter learning plan description"
                                        rows="4"
                                        required
                                    />
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
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-lg"
                                        required
                                    />
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
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-lg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="file" className="block text-lg font-medium">
                                        Attach Image or Video
                                    </label>
                                    <input
                                        type="file"
                                        id="file"
                                        name="file"
                                        onChange={handleFileChange}
                                        className="w-full p-2 border rounded-lg"
                                        accept="image/*,video/*"
                                    />
                                </div>

                                {preview && (
                                    <div className="mt-4">
                                        {formData.file && formData.file.type.startsWith("image") ? (
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="w-1/2 h-1/2 rounded-lg"
                                            />
                                        ) : (
                                            <video controls className="w-full h-auto rounded-lg">
                                                <source src={preview} type={formData.file.type} />
                                                Your browser does not support the video tag.
                                            </video>
                                        )}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-1/6 py-2 mt-4 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-all duration-300"
                                >
                                    Share
                                </button>
                            </>
                        )}
                    </form>

                    <div className="pt-10 pr-10">
                        {learningPlans.map((plan) => (
                            <LearningPlanSharingCard key={plan.id} learningPlan={plan} />
                        ))}
                    </div>
                </div>

                {/* Right */}
                <div className="w-1/3">
                    <LearningPlanSharingRightPart />
                </div>
            </div>
        </div>
    );
};

export default LearningPlanFeed;
