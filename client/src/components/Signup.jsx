import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar"; // Import the Sidebar component

function Signup() {
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthday: "",
    program: "",
    username: "",
    password: "",
    role: "",
  });

  const [successMessage, setSuccessMessage] = useState(""); // Add success message state
  const [errorMessage, setErrorMessage] = useState(""); // Add error message state
  const [countdown, setCountdown] = useState(10); // Countdown state for 10 seconds
  const navigate = useNavigate();

  // Update the countdown effect
  useEffect(() => {
    if (countdown > 0 && successMessage) {
      const countdownInterval = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      return () => clearInterval(countdownInterval); // Cleanup on unmount or countdown end
    } else if (countdown === 0) {
      navigate("/login"); // Redirect to login when countdown ends
    }
  }, [countdown, successMessage, navigate]);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user), // Send the user data to the backend
      });

      if (response.ok) {
        const result = await response.json();
        setSuccessMessage(
          `${result.message}. Redirecting to Login page in ${countdown} seconds...`
        );
      } else {
        const error = await response.json();
        setErrorMessage(error.message);
      }
    } catch (err) {
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  const goHome = () => {
    navigate("/"); // Navigate back to home page
  };

  const goToProgramsCourses = () => {
    navigate("/programs"); // Navigate to programs and courses page
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        onViewDashboard={goHome} // Home button
        onViewProfile={goToProgramsCourses} // Programs & Courses button
        showRegister={false} // Hide the Register button
        showProfile={true} // Show Programs & Courses button
        showDashboard={true} // Show Home button
        showLogout={false} // Hide the Signup button
        showLogin={false} // Hide the Login button
        dashboardLabel="Home" // Label for Home button
        profileLabel="Programs & Courses" // Label for Programs & Courses button
      />

      <div className="dashboard-content">
        <h1>Bow Course Registration System</h1>
        <h2>Signup</h2>

        {/* Success Message */}
        {successMessage && (
          <p className="success-message">
            {successMessage.replace(/\d+ seconds/, `${countdown} seconds`)}
            {/* Dynamically update countdown in the success message */}
          </p>
        )}
        {/* Error Message */}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <form onSubmit={handleSubmit}>
          <input
            name="firstName"
            placeholder="First Name"
            onChange={handleChange}
            required
          />
          <input
            name="lastName"
            placeholder="Last Name"
            onChange={handleChange}
            required
          />
          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <input
            name="phone"
            placeholder="Phone"
            onChange={handleChange}
            required
          />
          <input
            name="birthday"
            type="date"
            placeholder="Birthday"
            onChange={handleChange}
            required
          />

          {user.role === "student" && (
            <select name="program" onChange={handleChange} required>
              <option value="">Select Program</option>
              <option value="Diploma">
                Software Development - Diploma (2 years)
              </option>
              <option value="Post-Diploma">
                Software Development - Post-Diploma (1 year)
              </option>
              <option value="Certificate">
                Software Development - Certificate (6 months)
              </option>
            </select>
          )}

          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <select
            name="role"
            value={user.role}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select Role
            </option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit">Signup</button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
