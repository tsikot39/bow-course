import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar"; // Import the Sidebar component

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }), // Send the username and password to the backend
      });

      const result = await response.json();

      if (response.ok) {
        // Store logged-in user information in sessionStorage
        sessionStorage.setItem("loggedInUser", result.user.username);

        // Check user role and redirect to the dashboard
        if (result.user.role === "student") {
          navigate("/dashboard", { state: { role: "student" } });
        } else if (result.user.role === "admin") {
          navigate("/dashboard", { state: { role: "admin" } });
        }
      } else {
        setError(result.message); // Display the error message from the backend
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  const goHome = () => {
    navigate("/"); // Navigate back to home page
  };

  const goToProgramsCourses = () => {
    navigate("/programs"); // Navigate to the programs and courses component
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar with Home and Programs & Courses buttons */}
      <Sidebar
        onViewDashboard={goHome}
        onViewProfile={goToProgramsCourses} // Programs & Courses Button
        showRegister={false} // Hide the Register button
        showProfile={true} // Show Programs & Courses button
        showMessage={false} // Hide the Send Message button
        showDashboard={true} // Show Home button
        showLogout={false} // Hide the Logout button
        dashboardLabel="Home" // Updated label for the Home button
        profileLabel="Programs & Courses" // Label for Programs & Courses button
      />

      <div className="dashboard-content">
        <h1>Bow Course Registration System</h1>
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
