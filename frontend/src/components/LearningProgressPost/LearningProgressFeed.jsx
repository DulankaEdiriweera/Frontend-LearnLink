import React, { useEffect, useState, useRef } from "react";
import Navigation from "../Navigation/Navigation.jsx";
import LearningProgressCard from "./LearningProgressCard.jsx";
import axios from "axios";
import LearningProgressRightPart from "./LearningProgressRightPart.jsx";
import Swal from "sweetalert2";

const LearningProgressFeed = () => {
  // Refs for API endpoints and form reset
  const apiRef = useRef("http://localhost:8080/api/learning-progress");
  const formRef = useRef(null);
  
  // User authentication data
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");
  const username = localStorage.getItem("username") || email?.split('@')[0] || "User";
  
  // Component states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    media: null,
    template: "default"
  });
  const [preview, setPreview] = useState(null);
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFormExpanded, setIsFormExpanded] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    type: "all",
    sortBy: "newest"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({});

  // Template options with descriptions
  const templateOptions = [
    { 
      value: "default", 
      label: "Learning Update", 
      description: "Share what you've recently learned"
    },
    { 
      value: "milestone", 
      label: "Milestone", 
      description: "Celebrate completing a significant learning goal"
    },
    { 
      value: "question", 
      label: "Question", 
      description: "Ask the community for help with your learning"
    },
    { 
      value: "reflection", 
      label: "Reflection", 
      description: "Share your thoughts on what you've learned"
    }
  ];

  // Current user object for passing to the card component
  const currentUser = {
    email: email,
    username: username
  };

  // Form validation
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

    // Media validation
    if (formData.media) {
      // Size check (10MB max)
      if (formData.media.size > 10 * 1024 * 1024) {
        newErrors.media = "File size should be less than 10MB";
      }
      
      // Type check (only images and videos)
      if (!formData.media.type.startsWith("image/") && !formData.media.type.startsWith("video/")) {
        newErrors.media = "Only image and video files are allowed";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for the field being changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        setErrors(prev => ({
          ...prev,
          media: "Only image and video files are allowed"
        }));
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          media: "File size should be less than 10MB"
        }));
        return;
      }

      setFormData({
        ...formData,
        media: file,
      });

      // Create a preview URL for the selected file
      const filePreview = URL.createObjectURL(file);
      setPreview(filePreview);
      
      // Clear any previous errors
      setErrors(prev => ({
        ...prev,
        media: null
      }));
    }
  };

  // Remove selected media
  const handleRemoveMedia = () => {
    setFormData({
      ...formData,
      media: null,
    });
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      if (!token) {
        Swal.fire({
          icon: "warning",
          title: "Not Logged In",
          text: "Please log in to create a learning progress update.",
        });
        setSubmitting(false);
        return;
      }

      // Prepare form data for submission
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("template", formData.template);
      if (formData.media) {
        formDataToSend.append("media", formData.media);
      }

      const response = await axios.post(
        apiRef.current,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Learning Progress Created:", response.data);
      Swal.fire({
        icon: "success",
        title: "Post Created!",
        text: "Your learning progress post has been successfully uploaded.",
        timer: 2000,
        showConfirmButton: false,
      });
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        media: null,
        template: "default"
      });
      setPreview(null);
      
      // Refresh the feed
      fetchLearningProgressUpdates();
    } catch (error) {
      console.error("Error creating learning progress post:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || error.response?.data || "Failed to create learning progress post",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterOptions({
      ...filterOptions,
      [name]: value,
    });
  };

  // Fetch all learning progress updates
  const fetchLearningProgressUpdates = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await axios.get(apiRef.current, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          sort: filterOptions.sortBy === "newest" ? "createdAt,desc" : "createdAt,asc"
        }
      });
      setProgressList(response.data);
    } catch (error) {
      console.error("Error fetching learning progress updates:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch learning progress updates",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch learning progress updates on component mount, token changes, or filter changes
  useEffect(() => {
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Not Logged In",
        text: "Please log in to view learning progress updates.",
      });
      return;
    }
    
    fetchLearningProgressUpdates();
  }, [token, filterOptions.sortBy]);

  // Get filtered and searched progress updates
  const getFilteredProgressList = () => {
    // First filter out the current user's progress updates
    let filtered = progressList.filter(
      (progress) => progress.user?.email !== email
    );
    
    // Then apply template filter if not "all"
    if (filterOptions.type !== "all") {
      filtered = filtered.filter(
        (progress) => progress.template === filterOptions.type
      );
    }
    
    // Then apply search filter if there's a search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (progress) => 
          progress.title.toLowerCase().includes(term) || 
          progress.description.toLowerCase().includes(term) ||
          (progress.user?.username && progress.user.username.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  };

  const filteredProgressList = getFilteredProgressList();

  return (
    <div className="flex">
      {/* Navigation Sidebar */}
      <div className="w-1/6">
        <Navigation />
      </div>

      {/* Main Content */}
      <div className="h-screen bg-slate-100 p-4 flex-grow shadow-lg rounded-2xl mt-2 mb-2 ml-2 overflow-y-scroll scrollbar-hidden w-4/6">
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-700 font-medium">Loading updates...</p>
            </div>
          </div>
        )}

        {/* Create Post Form */}
        <div className="mb-8">
          <div 
            className="flex justify-between items-center p-4 bg-white rounded-t-xl shadow-md cursor-pointer"
            onClick={() => setIsFormExpanded(!isFormExpanded)}
          >
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              Share Your Learning Progress
              <span className="ml-2 text-sm text-blue-600 font-normal">
                {isFormExpanded ? "Click to collapse" : "Click to expand"}
              </span>
            </h2>
            <span className="text-xl text-gray-600">
              {isFormExpanded ? "▲" : "▼"}
            </span>
          </div>
          
          {isFormExpanded && (
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="space-y-4 p-6 bg-white rounded-b-xl shadow-md transition-all duration-300"
            >
              <div>
                <label htmlFor="title" className="block text-lg font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full p-3 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200`}
                  placeholder="What did you learn?"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div>
                <label htmlFor="template" className="block text-lg font-medium text-gray-700">
                  Update Type
                </label>
                <div className="relative">
                  <select
                    id="template"
                    name="template"
                    value={formData.template}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  >
                    {templateOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <span className="text-gray-500">▼</span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {templateOptions.find(o => o.value === formData.template)?.description}
                </p>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-lg font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full p-3 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200`}
                  placeholder="Share details about your learning journey..."
                  rows="4"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div>
                <label htmlFor="media" className="block text-lg font-medium text-gray-700">
                  Attach Media (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    {!formData.media ? (
                      <>
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="media"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="media"
                              name="media"
                              type="file"
                              className="sr-only"
                              onChange={handleFileChange}
                              accept="image/*,video/*"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF, MP4 up to 10MB
                        </p>
                      </>
                    ) : (
                      <div className="flex items-center justify-center flex-col">
                        <div className="flex items-center mb-2">
                          <span className="text-gray-700">{formData.media.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveMedia}
                          className="text-sm text-red-600 hover:text-red-800 flex items-center"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {errors.media && (
                  <p className="mt-1 text-sm text-red-500">{errors.media}</p>
                )}
              </div>
              
              {/* Media Preview */}
              {preview && (
                <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="text-md font-medium text-gray-700 mb-2">Preview</h3>
                  {formData.media && formData.media.type.startsWith("image") ? (
                    <img
                      src={preview}
                      alt="Selected Preview"
                      className="max-w-md h-auto rounded-lg border border-gray-300 mx-auto"
                    />
                  ) : formData.media && formData.media.type.startsWith("video") ? (
                    <video controls className="max-w-md h-auto rounded-lg border border-gray-300 mx-auto">
                      <source src={preview} type={formData.media.type} />
                      Your browser does not support the video tag.
                    </video>
                  ) : null}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      title: "",
                      description: "",
                      media: null,
                      template: "default"
                    });
                    setPreview(null);
                    setErrors({});
                  }}
                  className="mr-3 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`py-2 px-6 ${submitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-lg transition-all duration-300 flex items-center`}
                >
                  {submitting ? (
                    <>
                      <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Sharing...
                    </>
                  ) : (
                    "Share Progress"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl p-4 shadow-md mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:w-1/2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Search updates..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Filter & Sort
              <span className="ml-2">{showFilters ? "▲" : "▼"}</span>
            </button>
          </div>
          
          {/* Expanded Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Template Type Filter */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={filterOptions.type}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  {templateOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Sort Order */}
              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  id="sortBy"
                  name="sortBy"
                  value={filterOptions.sortBy}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          )}
        </div>
        
        {/* Learning Progress Feed List */}
        <div className="space-y-6">
          {filteredProgressList.length > 0 ? (
            filteredProgressList.map((progress) => (
              <LearningProgressCard
                key={progress.id}
                progress={progress}
                currentUser={currentUser}
              />
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-md">
              {searchTerm || filterOptions.type !== "all" ? (
                <>
                  <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No matching updates found</h3>
                  <p className="mt-1 text-gray-500">
                    Try changing your search term or filters
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterOptions({
                        type: "all",
                        sortBy: "newest"
                      });
                    }}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    Clear all filters
                  </button>
                </>
              ) : (
                <>
                  <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No learning progress updates yet</h3>
                  <p className="mt-1 text-gray-500">
                    Be the first to share your learning journey with the community!
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Right Sidebar */}
      <div className="w-1/6">
        <LearningProgressRightPart />
      </div>
    </div>
  );
};

export default LearningProgressFeed;