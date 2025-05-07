import React from "react";
import { CiSearch } from "react-icons/ci";

const LearningProgressRightPart = () => {
  // Sample data for trending topics and learning streaks
  const trendingTopics = [
    { id: 1, name: "JavaScript", count: 3250 },
    { id: 2, name: "React Hooks", count: 1890 },
    { id: 3, name: "UI Design", count: 1456 },
    { id: 4, name: "Python Data Science", count: 1345 },
    { id: 5, name: "AWS Certification", count: 982 },
  ];

  const topLearners = [
    { id: 1, name: "CodeMaster", handle: "@codemaster", streak: 65, avatar: "CM" },
    { id: 2, name: "TechLearner", handle: "@techlearner", streak: 42, avatar: "TL" },
    { id: 3, name: "DevGuru", handle: "@devguru", streak: 37, avatar: "DG" },
  ];

  return (
    <div className="py-5 h-screen sticky top-0 p-5 space-y-5">
      {/* Search Bar */}
      <div className="flex items-center bg-white shadow-md px-4 py-2 rounded-full w-full mt-10">
        <div className="relative flex items-center w-full">
          <CiSearch className="absolute left-3 text-gray-500 text-xl" />
          <input
            type="text"
            placeholder="Search learning updates..."
            className="w-full py-2 pl-10 pr-4 text-gray-700 rounded-full outline-none"
          />
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <h3 className="font-bold text-xl mb-4">Trending Learning Topics</h3>
        <div className="space-y-3">
          {trendingTopics.map((topic) => (
            <div key={topic.id} className="flex justify-between items-center">
              <span className="font-medium hover:text-blue-600 cursor-pointer">{topic.name}</span>
              <span className="text-gray-500 text-sm">{topic.count} updates</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Learners */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <h3 className="font-bold text-xl mb-4">Top Learning Streaks</h3>
        <div className="space-y-4">
          {topLearners.map((learner) => (
            <div key={learner.id} className="flex items-center space-x-3">
              <div className="flex-shrink-0 h-10 w-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                {learner.avatar}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{learner.name}</p>
                    <p className="text-gray-500 text-sm">{learner.handle}</p>
                  </div>
                  <div className="flex items-center text-orange-500">
                    <span className="font-bold">{learner.streak}</span>
                    <span className="ml-1">🔥</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Resources */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <h3 className="font-bold text-xl mb-3">Featured Resources</h3>
        <div className="space-y-2">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 cursor-pointer">
            <p className="font-medium text-blue-700">How to Track Your Learning Effectively</p>
            <p className="text-sm text-gray-600">10 min read • Learning Tips</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 cursor-pointer">
            <p className="font-medium text-green-700">Build a Learning Habit in 30 Days</p>
            <p className="text-sm text-gray-600">15 min read • Productivity</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningProgressRightPart;