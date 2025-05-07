import React, { useState, useEffect } from "react";
import SkillSharing from "../../assets/SkillSharing.jpg";
import LearningProgress from "../../assets/LearningProgress.jpg";
import LearningPlaning from "../../assets/LearningPlaning.jpg";
import GoalTracking from "../../assets/GoalTracking.jpg";
import Logo from "../../assets/Logo.png";
import SkillSharingHomeImg from "../../assets/SkillSharingHomeImg.jpg";
import LearningProgressHomeImg from "../../assets/LearningProgressHomeImg.jpg";
import LearningPlaningHomeImg from "../../assets/LearningPlaningHomeImg.jpg";
import GoalTrackingHomeImg from "../../assets/GoalTrackingHomeImg.jpg";
import { FiArrowRight } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");


  const navigate = useNavigate();


  // Mock authentication check
  useEffect(() => {
    const user = localStorage.getItem("username");
    if (user) {
      setIsLoggedIn(true);
      setUsername(user);
    }
    console.log(user)
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUsername(null);
    navigate("/login"); // Redirect to login page
  };

  // Slideshow state and functionality
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    {
      id: 1,
      title: "Skill Sharing Post",
      description:
        "Share your knowledge and expertise with others by creating skill-sharing posts.",
      image: SkillSharing,
    },
    {
      id: 2,
      title: "Learning Plan Sharing",
      description:
        "Create and share structured learning plans to help others achieve their goals.",
      image: LearningPlaning,
    },
    {
      id: 3,
      title: "Goal Tracking",
      description:
        "Set personal or collaborative learning goals and track progress over time.",
      image: GoalTracking,
    },
    {
      id: 4,
      title: "Learning Progress Updates",
      description:
        "Keep your peers and mentors updated on your learning journey with regular progress updates.",
      image: LearningProgress,
    },
  ];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="home-container flex flex-col w-full overflow-x-hidden pt-10">
      {/* ======== Two-column Layout ======== */}
      <div className="flex w-full">
        {/* ======== Slideshow Section ======== */}
        <div className="w-1/2 relative overflow-hidden bg-gray-100">
          <div className="w-full h-[70vh] relative">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === activeSlide ? "opacity-100" : "opacity-0"
                  }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
                  <h2 className="text-2xl font-bold">{slide.title}</h2>
                  <p>{slide.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full ${index === activeSlide ? "bg-white" : "bg-gray-400"
                  }`}
                onClick={() => setActiveSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
        {/* ======== Banner Section ======== */}
        <div className="relative w-1/2 bg-white text-black py-8 text-center flex flex-col items-center justify-center">
          {/* Login & Signup Buttons*/}
          {/* Conditional rendering for Login/Sign Up vs Username & Logout */}
          <div className="absolute top-4 right-4 flex space-x-4">
            {!isLoggedIn ? (
              <>
                <Link to="/login" className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-900">
                  Login
                </Link>
                <Link to="/signup" className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-900">
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <span className="text-xl font-semibold">Hello!, {username}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            Welcome to
            <img src={Logo} alt="LearnLink" className="w-30 h-auto" />
          </h1>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="main-content w-full max-w-full mx-auto px-4 py-10">
        <div className="header-section text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Empowering <span className="text-blue-500">Skill Sharing</span> &
            Learning for Everyone
          </h1>
          <p className="text-xl text-gray-600">
            LearnLink is a web-based platform designed to facilitate the
            exchange of knowledge and skills among users. Whether it's coding,
            cooking, photography, or DIY crafts, users can share their expertise
            and learn new skills in a collaborative space. 🚀
          </p>
        </div>

        <div className="features-section pt-5">
          {/* Skill Sharing Section */}
          <div className="feature-block flex flex-col md:flex-row items-center mb-12">
            <div className="feature-image md:w-1/3 mb-4 md:mb-0">
              <img
                src={SkillSharingHomeImg}
                alt="Skill Sharing"
                className="rounded-lg"
              />
            </div>
            <div className="feature-content md:w-2/3 md:pl-40">
              <h2 className="text-4xl font-bold mb-4">Share Skills</h2>
              <p className="text-2xl mb-9">
                Share your skills and experiences with others through engaging
                posts.
              </p>
              <div className="text-xl text-gray-600">
                <p>Upload photos or short videos</p>
                <p>Add a description to your post</p>
                <p>View, like, and comment on posts</p>
                <p>Edit descriptions or replace media</p>
                <p>Delete posts if no longer needed</p>
              </div>
              {/* Arrow Link to Other Pages */}
              <div className="mt-6">
                <button
                  onClick={() => (window.location.href = "/skillSharingFeed")}
                  className="flex items-center bg-blue-900 text-white text-xl font-semibold rounded-3xl p-3"
                  disabled={!isLoggedIn}
                >
                  Try Now
                  <FiArrowRight className="ml-2" size={24} />{" "}
                  {/* React Arrow Icon */}
                </button>
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="feature-block flex flex-col md:flex-row-reverse items-center mb-12">
            <div className="feature-image md:w-1/3 mb-4 md:mb-0">
              <img
                src={LearningPlaningHomeImg}
                alt="Learning Planning"
                className="rounded-lg"
              />
            </div>
            <div className="feature-content md:w-2/3 md:pl-40">
              <h2 className="text-4xl font-bold mb-4">Learning Plans</h2>
              <p className="text-2xl mb-9">
                Create structured learning plans to stay on track and achieve
                your goals.
              </p>
              <div className="text-xl text-gray-600">
                <p>Add learning plans with topics and resources</p>
                <p>View and track progress on learning plans</p>
                <p>Set completion timelines for each plan</p>
                <p>Edit, update, or remove plans as needed</p>
              </div>
              {/* Arrow Link to Other Pages */}
              <div className="mt-6">
                <button
                  onClick={() => (window.location.href = "/learningPlanSharingFeed")}
                  className="flex items-center bg-blue-900 text-white text-xl font-semibold rounded-3xl p-3"
                  disabled={!isLoggedIn}
                >
                  Try Now
                  <FiArrowRight className="ml-2" size={24} />{" "}
                  {/* React Arrow Icon */}
                </button>
              </div>
            </div>
          </div>

          {/* Expenses Section */}
          <div className="feature-block flex flex-col md:flex-row items-center mb-12">
            <div className="feature-image md:w-1/3 mb-4 md:mb-0">
              <img
                src={GoalTrackingHomeImg}
                alt="Expense tracking"
                className="rounded-lg"
              />
            </div>
            <div className="feature-content md:w-2/3 md:pl-40">
              <h2 className="text-4xl font-bold mb-4">Goal Tracking</h2>
              <p className="text-2xl mb-9">
                Stay focused and achieve your short-term and medium-term goals
                effectively.
              </p>
              <div className="text-xl text-gray-600">
                <p>Set specific goals for tasks, skills, or exams</p>
                <p>Track progress and milestones</p>
                <p>Receive reminders and notifications for deadlines</p>
                <p>Update or mark goals as completed</p>
              </div>
              {/* Arrow Link to Other Pages */}
              <div className="mt-6">
                <button
                  onClick={() => (window.location.href = "/GoalTrackingFeed")}
                  className="flex items-center bg-blue-900 text-white text-xl font-semibold rounded-3xl p-3"
                  disabled={!isLoggedIn}
                >
                  Try Now
                  <FiArrowRight className="ml-2" size={24} />{" "}
                  {/* React Arrow Icon */}
                </button>
              </div>
            </div>
          </div>

          {/* Shopping List Section */}
          <div className="feature-block flex flex-col md:flex-row-reverse items-center mb-12">
            <div className="feature-image md:w-1/3 mb-4 md:mb-0">
              <img
                src={LearningProgressHomeImg}
                alt="Shopping list"
                className="rounded-lg"
              />
            </div>
            <div className="feature-content md:w-2/3 md:pl-40">
              <h2 className="text-4xl font-bold mb-4">
                Learning Progress Updates
              </h2>
              <p className="text-2xl mb-9">
                Share and track your learning journey with structured updates.
              </p>
              <div className="text-xl text-gray-600">
                <p>Use predefined templates to post progress updates</p>
                <p>
                  Share completed tutorials, new concepts, or skills practiced
                </p>
                <p>Attach text descriptions and visual media</p>
                <p>
                  Edit or delete previous updates for an accurate learning
                  timeline
                </p>
              </div>
              {/* Arrow Link to Other Pages */}
              <div className="mt-6">
                <button
                  onClick={() => (window.location.href = "/learningProgressFeed")}
                  className="flex items-center bg-blue-900 text-white text-xl font-semibold rounded-3xl p-3"
                  disabled={!isLoggedIn}
                >
                  Try Now
                  <FiArrowRight className="ml-2" size={24} />{" "}
                  {/* React Arrow Icon */}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="cta-section text-center py-8 bg-gray-100">
          <h2 className="text-4xl font-bold mb-4">
            Try <span className="text-blue-500">LearnLink</span>
          </h2>
          <p className="text-2xl mb-9">
            Share your skills, learn from others, and track your progress—all in
            one collaborative platform designed for interactive learning and
            growth.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home
