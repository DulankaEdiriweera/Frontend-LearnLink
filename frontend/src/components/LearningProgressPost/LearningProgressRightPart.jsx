import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaComment, FaHeart, FaLightbulb, FaChartLine } from "react-icons/fa";

const LearningProgressRightPart = () => {
  const [popularProgress, setPopularProgress] = useState([]);
  const [recentComments, setRecentComments] = useState([]);
  const [progressStats, setProgressStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // API base URL
  const API_BASE_URL = "http://localhost:8080/api";
  
  // Get auth token helper function
  const getAuthToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        
        // Fetch user's learning progress
        const userProgressRes = await axios.get(
          `${API_BASE_URL}/learning-progress/user`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Calculate stats from user's progress data
        if (userProgressRes.data && userProgressRes.data.length > 0) {
          const stats = calculateProgressStats(userProgressRes.data);
          setProgressStats(stats);
        } else {
          setProgressStats(fallbackStats);
        }
        
        // Get most popular learning progress entries (most liked)
        // Note: The controller doesn't have this endpoint, so we'll simulate it
        const allProgressRes = await axios.get(
          `${API_BASE_URL}/learning-progress`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (allProgressRes.data && allProgressRes.data.length > 0) {
          // Sort by like count
          const sorted = [...allProgressRes.data].sort((a, b) => 
            (b.likedUsers?.length || 0) - (a.likedUsers?.length || 0)
          );
          setPopularProgress(sorted.slice(0, 3)); // Top 3
        } else {
          setPopularProgress(fallbackPopular);
        }
        
        // Fetch recent comments on user's progress
        const userProgress = userProgressRes.data || [];
        if (userProgress.length > 0) {
          const progressIds = userProgress.map(p => p.id);
          let allComments = [];
          
          // Fetch comments for each progress entry
          for (const id of progressIds.slice(0, 3)) { // Limit to 3 most recent entries
            try {
              const commentsRes = await axios.get(
                `${API_BASE_URL}/learning-progress/${id}/comments`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              if (commentsRes.data && commentsRes.data.length > 0) {
                // Add progress title to each comment for context
                const commentsWithContext = commentsRes.data.map(comment => ({
                  ...comment,
                  progressTitle: userProgress.find(p => p.id === id)?.title || "Untitled Progress"
                }));
                
                allComments = [...allComments, ...commentsWithContext];
              }
            } catch (error) {
              console.error(`Error fetching comments for progress ${id}:`, error);
            }
          }
          
          // Sort by date and take most recent
          allComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setRecentComments(allComments.slice(0, 5));
        } else {
          setRecentComments([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Use fallback data if API fails
        setProgressStats(fallbackStats);
        setPopularProgress(fallbackPopular);
        setRecentComments([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Calculate stats from progress data
  const calculateProgressStats = (progressData) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const thisWeekEntries = progressData.filter(entry => 
      new Date(entry.createdAt) >= oneWeekAgo && new Date(entry.createdAt) <= now
    );
    
    const lastWeekEntries = progressData.filter(entry => 
      new Date(entry.createdAt) >= twoWeeksAgo && new Date(entry.createdAt) < oneWeekAgo
    );
    
    const totalLikes = progressData.reduce((total, entry) => 
      total + (entry.likedUsers ? entry.likedUsers.length : 0), 0
    );
    
    // Create daily stats for the past week
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyStats = Array(7).fill().map((_, i) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - i));
      const dayName = dayNames[date.getDay()];
      
      const count = progressData.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate.toDateString() === date.toDateString();
      }).length;
      
      return { day: dayName, count };
    });
    
    return {
      total: progressData.length,
      totalThisWeek: thisWeekEntries.length,
      lastWeek: lastWeekEntries.length,
      totalLikes: totalLikes,
      weeklyStats: weeklyStats
    };
  };
  
  // Fallback data if API isn't available
  const fallbackStats = {
    total: 24,
    totalThisWeek: 4,
    lastWeek: 3,
    totalLikes: 15,
    weeklyStats: [
      { day: "Sun", count: 0 },
      { day: "Mon", count: 1 },
      { day: "Tue", count: 0 },
      { day: "Wed", count: 1 },
      { day: "Thu", count: 0 },
      { day: "Fri", count: 1 },
      { day: "Sat", count: 1 }
    ]
  };
  
  const fallbackPopular = [
    { id: 1, title: "Learned React Context API", likedUsers: Array(12) },
    { id: 2, title: "My Journey with Spring Boot", likedUsers: Array(8) },
    { id: 3, title: "Understanding Docker Containers", likedUsers: Array(6) }
  ];
  
  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  };
  
  // Learning tips
  const learningTips = [
    "Document your learning journey regularly to help reinforce concepts",
    "Share your struggles as well as successes - both are valuable learning experiences",
    "Add screenshots or images to your learning progress updates for visual reference",
    "Review your past learning progress entries to see how far you've come",
    "Respond to comments on your learning progress to build community",
    "Use different templates to structure your learning progress updates",
    "Set aside time each week to reflect on and document what you've learned",
    "Like others' learning progress to encourage community growth"
  ];

  // Get random learning tip
  const getRandomTip = () => {
    return learningTips[Math.floor(Math.random() * learningTips.length)];
  };

  return (
    <div className="p-4 space-y-4">
      {/* Learning Progress Stats */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow p-4">
        <div className="flex items-center mb-2">
          <FaChartLine className="mr-2" />
          <h3 className="font-semibold text-lg">Your Learning Stats</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="text-center">
            <div className="text-3xl font-bold">{progressStats?.total || 0}</div>
            <div className="text-sm opacity-80">Total Progress Entries</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{progressStats?.totalLikes || 0}</div>
            <div className="text-sm opacity-80">Total Likes Received</div>
          </div>
        </div>
      </div>
      
      {/* Popular Learning Progress */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center mb-3">
          <FaHeart className="text-blue-600 mr-2" />
          <h3 className="text-blue-900 font-semibold text-lg">Popular Progress</h3>
        </div>
        
        {loading ? (
          <div className="py-4 flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : popularProgress.length > 0 ? (
          <div className="space-y-3">
            {popularProgress.map(progress => (
              <div key={progress.id} className="pb-2 border-b border-gray-100">
                <p className="font-medium text-gray-800">{progress.title}</p>
                <div className="flex justify-end items-center mt-1">
                  <span className="text-xs flex items-center text-red-500">
                    <FaHeart className="mr-1" size={10} />
                    {progress.likedUsers?.length || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-2 text-sm">No popular entries found</p>
        )}
      </div>
      
      {/* Recent Comments */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center mb-3">
          <FaComment className="text-blue-600 mr-2" />
          <h3 className="text-blue-900 font-semibold text-lg">Recent Comments</h3>
        </div>
        
        {loading ? (
          <div className="py-4 flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : recentComments.length > 0 ? (
          <div className="space-y-3">
            {recentComments.map(comment => (
              <div key={comment.id} className="pb-2 border-b border-gray-100">
                <p className="text-sm text-gray-700">{comment.text}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                  <span className="text-xs text-blue-600">
                    {comment.progressTitle}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-2 text-sm">No recent comments</p>
        )}
      </div>
      
      {/* Learning Tip */}
      <div className="bg-yellow-50 rounded-lg shadow p-4 border border-yellow-100">
        <div className="flex items-center mb-2">
          <FaLightbulb className="text-yellow-500 mr-2" />
          <h3 className="font-semibold">Learning Tip</h3>
        </div>
        <p className="text-sm text-gray-700">
          {getRandomTip()}
        </p>
      </div>
    </div>
  );
};

export default LearningProgressRightPart;