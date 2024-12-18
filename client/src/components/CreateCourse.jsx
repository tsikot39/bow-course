import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar"; // Import the Sidebar component

const CreateCourse = () => {
  const [course, setCourse] = useState({
    program: "", // New field for program selection
    term: "",
    name: "",
    code: "",
    startDate: "",
    endDate: "",
  });
  const [confirmation, setConfirmation] = useState(""); // State for confirmation message
  const [admin, setAdmin] = useState(null); // Store admin data
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = sessionStorage.getItem("loggedInUser");

    if (loggedInUser) {
      fetch(`http://localhost:5000/api/user/${loggedInUser}`)
        .then((res) => res.json())
        .then((data) => {
          setAdmin(data);
        })
        .catch((err) => console.error("Failed to fetch admin data", err));
    }
  }, []);

  const handleChange = (e) => {
    setCourse({
      ...course,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(course), // Send the course data to the backend
      });

      const result = await response.json();

      if (response.ok) {
        setConfirmation("Course created successfully!"); // Set the confirmation message
        setCourse({
          program: "",
          name: "",
          code: "",
          term: "",
          startDate: "",
          endDate: "",
        }); // Reset the form fields
      } else {
        setConfirmation(result.message); // Show error message if any
      }
    } catch (error) {
      setConfirmation("Failed to create the course.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("loggedInUser"); // Clear the current user session on logout
    navigate("/"); // Redirect to the home page after logout
  };

  const handleViewDashboard = () => {
    navigate("/dashboard"); // Navigate to the Dashboard
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        onViewDashboard={handleViewDashboard}
        onLogout={handleLogout}
        showDashboard={true}
        showLogout={true}
        dashboardLabel="Dashboard"
      />

      <div className="dashboard-content">
        <h1>Bow Course Registration System</h1>
        <h2>Create New Course</h2>

        {/* Correct display of the admin role */}
        {admin && (
          <p>
            Hi there, {admin.firstName} ({admin.role}) 👋🏼
          </p>
        )}

        {/* Display confirmation message */}
        {confirmation && <p className="error-message">{confirmation}</p>}
        <div className="mt-20px">
          <form onSubmit={handleSubmit}>
            {/* New order: Program first */}
            <select
              name="program"
              value={course.program}
              onChange={handleChange}
              required
            >
              <option value="">Select Program</option>
              <option value="Diploma">Diploma</option>
              <option value="Post-Diploma">Post-Diploma</option>
              <option value="Certificate">Certificate</option>
            </select>

            <select
              name="term"
              value={course.term}
              onChange={handleChange}
              required
            >
              <option value="">Select Term</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Fall">Fall</option>
              <option value="Winter">Winter</option>
            </select>

            <input
              type="text"
              name="name"
              placeholder="Course Name"
              value={course.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="code"
              placeholder="Course Code"
              value={course.code}
              onChange={handleChange}
              required
            />
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={course.startDate}
              onChange={handleChange}
              required
            />
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={course.endDate}
              onChange={handleChange}
              required
            />
            <button type="submit">Create Course</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
