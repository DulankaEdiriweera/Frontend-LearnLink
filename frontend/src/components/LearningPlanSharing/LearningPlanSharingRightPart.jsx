import React from "react";
import { CiSearch } from "react-icons/ci";
import PLAN from "../../assets/PLAN.mp4"; // Correct import statement

const LearningPlanSharingRightPart = () => {
    return (
        <div className="flex flex-col py-5 sticky top-0 justify-between p-3 space-y-6">
            {/* Search Bar */}
            <div className="flex items-center bg-white dark:bg-gray-800 shadow-md px-4 py-2 rounded-full w-full mt-10">
                <div className="relative flex items-center w-full">
                    <CiSearch className="absolute right-3 text-gray-500 dark:text-gray-300 text-xl" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full py-2 pl-10 pr-4 text-gray-700 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-full outline-none"
                    />
                </div>
            </div>

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
