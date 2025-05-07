import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import MyLearningPlanCard from "./MyLearningPlanCard";

const MyLearningPlanPosts = () => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");

    const [learningPlans, setLearningPlans] = useState([]);

    useEffect(() => {
        const fetchLearningPlans = async () => {
            if (!token) {
                Swal.fire({
                    icon: "warning",
                    title: "Not Logged In",
                    text: "Please log in to view your posts.",
                });
                return;
            }

            try {
                const response = await axios.get("http://localhost:8080/api/learning-plans", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Filter posts only created by current user
                const userPlans = response.data.filter(
                    (plan) => plan.user?.email === email
                );

                setLearningPlans(userPlans);
            } catch (error) {
                console.error("Error fetching learning plans:", error);
                alert("Failed to fetch learning plans");
            }
        };

        fetchLearningPlans();
    }, [token, email]);

    const handleDeletePlan = (id) => {
        setLearningPlans((prevPlans) => prevPlans.filter((plan) => plan.id !== id));
    };

    return (
        <div className="pt-10 pr-10">
            {learningPlans.length > 0 ? (
                [...learningPlans].reverse().map((plan) => (
                    <MyLearningPlanCard
                        key={plan.id}
                        learningPlan={plan}
                        onDelete={handleDeletePlan}
                    />
                ))
            ) : (
                <p className="text-center text-gray-600">You haven't shared any learning plans yet.</p>
            )}
        </div>
    );
};

export default MyLearningPlanPosts;
