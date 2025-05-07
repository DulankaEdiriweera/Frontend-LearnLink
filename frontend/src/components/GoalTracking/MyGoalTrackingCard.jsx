import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
// Import icons for edit and delete
import { FaEdit, FaTrash } from "react-icons/fa";

const MyGoalTrackingCard = ({ goal, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description);
  const [startDate, setStartDate] = useState(goal.startDate);
  const [dueDate, setDueDate] = useState(goal.dueDate);
  const [file, setFile] = useState(null);

  const token = localStorage.getItem("token");

  // Update form data when entering edit mode to ensure latest data
  useEffect(() => {
    if (isEditing) {
      setTitle(goal.title);
      setDescription(goal.description);
      setStartDate(goal.startDate);
      setDueDate(goal.dueDate);
    }
  }, [isEditing, goal]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("startDate", startDate);
    formData.append("dueDate", dueDate);
    if (file) {
      formData.append("file", file);
    }

    try {
      await axios.put(
        `http://localhost:8080/api/Goals/${goal.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire("Success", "Goal updated successfully!", "success");
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      console.error("Update failed", error);
      Swal.fire("Error", "Failed to update goal", "error");
    }
  };

  const handleDelete = async () => {
    // Show confirmation dialog before deleting
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8080/api/Goals/${goal.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        Swal.fire("Deleted!", "Your goal has been deleted.", "success");
        onDelete(goal.id); // Call onDelete callback to remove the goal from the UI
      } catch (error) {
        console.error("Delete failed", error);
        Swal.fire("Error", "Failed to delete goal", "error");
      }
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 mb-4 relative">
      {!isEditing ? (
        <>
          {/* Action Icons in upper right corner */}
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-yellow-500 hover:text-yellow-600 p-1"
              title="Edit"
            >
              <FaEdit size={18} />
            </button>
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-600 p-1"
              title="Delete"
            >
              <FaTrash size={18} />
            </button>
          </div>

          {/* Goal Owner */}
          <div className="flex items-center mb-2">
            <div className="font-semibold text-lg text-gray-800">
              {goal.user?.email}
            </div>
          </div>

          {/* Goal Title */}
          <div className="text-xl font-semibold mb-2">{goal.title}</div>

          {/* Goal Description */}
          <p className="text-gray-700">{goal.description}</p>

          {/* Goal Dates */}
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <div>
              <span className="font-semibold">Start Date:</span> {goal.startDate}
            </div>
            <div>
              <span className="font-semibold">Due Date:</span> {goal.dueDate}
            </div>
          </div>

          {/* Goal Image with reduced size */}
          {goal.imageUrl && (
            <div className="mt-4">
              <img
                src={`http://localhost:8080/${goal.imageUrl}`}
                alt="Goal Preview"
                className="w-1/2 h-auto rounded mx-auto"
              />
            </div>
          )}
        </>
      ) : (
        // Edit Form
        <form onSubmit={handleUpdate}>
          <div className="mb-2">
            <label className="block text-sm font-semibold">Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded px-2 py-1"
              required
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-semibold">Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded px-2 py-1"
              required
            />
          </div>
          <div className="flex justify-between gap-4 mb-2">
            <div className="w-full">
              <label className="block text-sm font-semibold">Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border rounded px-2 py-1"
                required
              />
            </div>
            <div className="w-full">
              <label className="block text-sm font-semibold">Due Date:</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border rounded px-2 py-1"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold">File (optional):</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full"
            />
          </div>

          {/* Preview Existing Image with reduced size */}
          {goal.imageUrl && (
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-1">Current Image:</label>
              <img
                src={`http://localhost:8080/${goal.imageUrl}`}
                alt="Current Goal"
                className="w-1/2 h-auto rounded mx-auto"
              />
            </div>
          )}

          {/* Form Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default MyGoalTrackingCard;