import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const StoryManager = () => {
  const [mediaType, setMediaType] = useState("");
  const [file, setFile] = useState(null);
  const [stories, setStories] = useState([]);
  const [viewers, setViewers] = useState([]);
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null); // State to hold the clicked image preview

  const token = localStorage.getItem("token");

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleMediaTypeChange = (e) => setMediaType(e.target.value);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("mediaType", mediaType);
    formData.append("file", file);

    try {
      await axios.post("http://localhost:8080/api/stories", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      //alert("Story uploaded successfully!");
      // SweetAlert for success
      Swal.fire({
        title: "Success!",
        text: "Story uploaded successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
      fetchStories();
    } catch (error) {
      console.error("Error uploading story", error);
      //alert("Failed to upload story");
      // SweetAlert for error
      Swal.fire({
        title: "Error!",
        text: "Failed to upload story",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
  };

  const fetchStories = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/stories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStories(response.data);
    } catch (error) {
      console.error("Error fetching stories", error);
    }
  };

  const handleViewStory = async (id) => {
    try {
      await axios.post(`http://localhost:8080/api/stories/${id}/view`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSelectedStoryId(id);
      fetchStoryViews(id);
    } catch (error) {
      console.error("Error viewing story", error);
    }
  };

  const fetchStoryViews = async (storyId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/stories/${storyId}/views`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setViewers(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching story views", error);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [token]);

  const handleImageClick = (imageUrl) => {
    setImagePreview(imageUrl); // Set the clicked image URL to state
  };

  return (
    <div className="mx-10 p-4">
      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Upload a Story</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Media Type</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              onChange={handleMediaTypeChange}
              value={mediaType}
            >
              <option value="">Select Media Type</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Upload File
            </label>
            <input type="file" className="w-full" onChange={handleFileChange} />
          </div>
        </div>
        <button
          onClick={handleUpload}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload Story
        </button>
      </div>

      {/* Active Stories */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Active Stories</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div
              key={story.id}
              className="bg-white shadow rounded-lg p-4 text-center"
            >
              <div className="flex items-center justify-center mb-2">
                <img
                  src={`http://localhost:8080/${story.profilePicUrl}`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover mr-2"
                />
                <p className="font-semibold">{story.username}</p>
              </div>

              {story.mediaType === "image" ? (
                <img
                  src={`http://localhost:8080/${story.mediaUrl}`}
                  alt="Story"
                  className="w-full h-40 object-cover rounded mb-2"
                  onClick={() =>
                    handleImageClick(`http://localhost:8080/${story.mediaUrl}`)
                  } // Set image preview on click
                />
              ) : (
                <video className="w-full rounded mb-2" controls>
                  <source
                    src={`http://localhost:8080/${story.mediaUrl}`}
                    type="video/mp4"
                  />
                </video>
              )}
              <button
                onClick={() => handleViewStory(story.id)}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Viewers
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Viewers Modal */}
      {/* Viewers Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white w-96 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Viewers</h3>
            <ul className="list-disc pl-5 space-y-2 max-h-60 overflow-y-auto">
              {viewers.length === 0 ? (
                <li>No viewers yet.</li>
              ) : (
                viewers.map((viewer, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <img
                      src={`http://localhost:8080/${viewer.profilePic}`}
                      alt="Viewer Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span>{viewer.username}</span>
                  </li>
                ))
              )}
            </ul>
            <div className="mt-4 text-right">
              <button
                onClick={() => setShowModal(false)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {imagePreview && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white w-auto max-w-3xl rounded-lg shadow-lg p-6">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-auto object-cover mb-4"
            />
            <div className="mt-4 text-right">
              <button
                onClick={() => setImagePreview(null)} // Close the preview
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryManager;
