import React, { useState, useEffect } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { FaThumbsUp, FaComment } from "react-icons/fa";
import Navigation from "../Navigation/Navigation.jsx";
import NotificationRightPart from "./NotificationRightPart.jsx";
//import LearningPlanSharingRightPart from "./LearningPlanSharingRightPart.jsx";
const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        const tokenPayload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserEmail(tokenPayload.sub);

        const allNotifications = [];

        // === Fetch Learning Plans ===
        const plansResponse = await axios.get(
          "http://localhost:8080/api/learning-plans",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const myPlans = plansResponse.data.filter(
          (plan) => plan.user && plan.user.email === tokenPayload.sub
        );

        for (const plan of myPlans) {
          // Likes
          const likedUsersResponse = await axios.get(
            `http://localhost:8080/api/learning-plans/${plan.id}/liked-users`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const likedUsers = likedUsersResponse.data;

          likedUsers.forEach((user) => {
            if (user.email !== tokenPayload.sub) {
              allNotifications.push({
                id: `like-plan-${plan.id}-${user.id}`,
                type: "like",
                context: "plan",
                username: user.username || user.email,
                profilePic: user.profilePic || "default-profile.jpg",
                time: user.likedAt || new Date().toISOString(),
                title: plan.title,
                idRef: plan.id,
              });
            }
          });

          // Comments
          const commentsResponse = await axios.get(
            `http://localhost:8080/api/learning-plans/${plan.id}/comments`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          commentsResponse.data.forEach((comment) => {
            if (comment.user && comment.user.email !== tokenPayload.sub) {
              allNotifications.push({
                id: `comment-plan-${comment.id}`,
                type: "comment",
                context: "plan",
                username: comment.user.username || comment.user.email,
                profilePic: comment.user.profilePic || "default-profile.jpg",
                time: comment.createdAt,
                title: plan.title,
                idRef: plan.id,
                commentText: comment.text,
              });
            }
          });
        }

        // === Fetch Skill Posts ===
        const skillsResponse = await axios.get(
          "http://localhost:8080/api/skills",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const mySkills = skillsResponse.data.filter(
          (skill) => skill.user && skill.user.email === tokenPayload.sub
        );

        for (const skill of mySkills) {
          // Likes
          const likedUsersResponse = await axios.get(
            `http://localhost:8080/api/skills/${skill.id}/liked-users`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const likedUsers = likedUsersResponse.data;

          likedUsers.forEach((user) => {
            if (user.email !== tokenPayload.sub) {
              allNotifications.push({
                id: `like-skill-${skill.id}-${user.id}`,
                type: "like",
                context: "skill",
                username: user.username || user.email,
                profilePic: user.profilePic || "default-profile.jpg",
                time: user.likedAt || new Date().toISOString(),
                title: skill.title,
                idRef: skill.id,
              });
            }
          });

          // Comments
          const commentsResponse = await axios.get(
            `http://localhost:8080/api/skills/${skill.id}/comments`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          commentsResponse.data.forEach((comment) => {
            if (comment.user && comment.user.email !== tokenPayload.sub) {
              allNotifications.push({
                id: `comment-skill-${comment.id}`,
                type: "comment",
                context: "skill",
                username: comment.user.username || comment.user.email,
                profilePic: comment.user.profilePic || "default-profile.jpg",
                time: comment.createdAt,
                title: skill.title,
                idRef: skill.id,
                commentText: comment.text,
              });
            }
          });
        }

        allNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));
        setNotifications(allNotifications);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const navigateToPlan = (context, idRef) => {
    if (context === "plan") {
      window.location.href = `/learning-plan/${idRef}`;
    } else {
      window.location.href = `/skill-sharing/${idRef}`;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Fixed Left Sidebar */}
      <div className="w-1/6 h-full fixed top-0 left-0 bg-white border-r">
        <Navigation />
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 ml-[16.666667%] mr-[16.666667%] h-screen overflow-y-auto bg-gray-100 px-4 py-6">
        <div className="bg-white shadow-xl rounded-xl p-6 max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Notifications
          </h2>

          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          {!loading && !error && notifications.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No notifications yet.</p>
            </div>
          )}

          {!loading && !error && notifications.length > 0 && (
            <ul className="space-y-4">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className="flex items-start p-4 rounded-lg hover:bg-gray-50 transition duration-200 cursor-pointer"
                  onClick={() =>
                    navigateToPlan(notification.context, notification.idRef)
                  }
                >
                  <div className="shrink-0 mr-4">
                    <img
                      src={`http://localhost:8080/${notification.profilePic}`}
                      alt={notification.username}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/40";
                      }}
                    />
                  </div>

                  <div className="flex-1">
                    {notification.type === "like" ? (
                      <div className="flex items-center mb-1">
                        <FaThumbsUp className="text-blue-600 mr-2" />
                        <p className="text-gray-800">
                          <span className="font-semibold">
                            {notification.username}
                          </span>{" "}
                          liked your{" "}
                          {notification.context === "plan"
                            ? "learning plan"
                            : "skill post"}{" "}
                          <span className="font-semibold text-blue-600">
                            {notification.title}
                          </span>
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center mb-1">
                          <FaComment className="text-green-600 mr-2" />
                          <p className="text-gray-800">
                            <span className="font-semibold">
                              {notification.username}
                            </span>{" "}
                            commented on your{" "}
                            {notification.context === "plan"
                              ? "learning plan"
                              : "skill post"}{" "}
                            <span className="font-semibold text-blue-600">
                              {notification.title}
                            </span>
                          </p>
                        </div>
                        <p className="text-gray-700 bg-gray-50 p-2 rounded-lg mt-1 italic">
                          "{notification.commentText}"
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.time), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Fixed Right Sidebar */}
      <div className="w-1/6 h-full fixed top-0 right-0 bg-white border-l">
        <NotificationRightPart />
      </div>
    </div>
  );
};

export default Notification;
