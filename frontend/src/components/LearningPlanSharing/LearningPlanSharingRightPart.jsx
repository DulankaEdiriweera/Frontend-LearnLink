import React from "react";
import { CiSearch } from "react-icons/ci";
import PLAN from "../../assets/PLAN.mp4"; // Correct import statement

const LearningPlanSharingRightPart = () => {
    return (
        <div className="flex flex-col py-5 sticky top-0 justify-between p-3 space-y-6">

            {/* Video Section */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white p-4 mb-2">Suggestions</h2>
                <div className="relative p-4">
                    <video
                        className="w-full rounded-lg shadow-md hover:scale-105 transition duration-300 ease-in-out"
                        controls
                        src={PLAN} // Correct reference to the imported video file
                        autoPlay
                        muted
                        loop
                    >
                    </video>
                </div>
            </div>
        </div>
    );
};

export default LearningPlanSharingRightPart;
