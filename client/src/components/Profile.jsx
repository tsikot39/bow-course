import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar"; // Import the Sidebar component

function Profile() {
  const [user, setUser] = useState(null); // State to hold user data
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch the user data based on the logged-in user
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Get the username from the route state (sent from login or dashboard)
        const { username } = location.state || {};

        if (username) {
          // Fetch the user data from the backend
          const response = await fetch(
            `http://localhost:5000/api/user/${username}`
          );
          if (response.ok) {
            const userData = await response.json();
            setUser(userData); // Set the fetched user data to state
          } else {
            console.error("Failed to fetch user profile.");
          }
        } else {
          console.error("No username found for fetching profile data.");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [location.state]);

  const handleViewDashboard = () => {
    navigate("/dashboard"); // Navigate to Dashboard
  };

  const handleLogout = () => {
    navigate("/"); // Redirect to the Welcome component
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        onViewDashboard={handleViewDashboard}
        onLogout={handleLogout}
        showRegister={false} // Hide the Register button
        showProfile={false} // Hide the View Profile button
        showMessage={false} // Hide the Send Message button
        showDashboard={true} // Show the Dashboard button
        showLogout={true} // Show the Logout button
        dashboardLabel="Dashboard" // Label for the Dashboard button
        logoutLabel="Logout" // Label for the Logout button
      />

      <div className="dashboard-content">
        <h1>Bow Course Registration System</h1>
        <h2>User Profile</h2>
        {user ? (
          <div>
            <p>First Name: {user.firstName}</p>
            <p>Last Name: {user.lastName}</p>
            <p>Email: {user.email}</p>
            <p>Phone: {user.phone}</p>
            <p>Birthday: {new Date(user.birthday).toLocaleDateString()}</p>
            {/* Conditionally render the program field only for students */}
            {user.role === "student" && <p>Program: {user.program}</p>}
            <p>Username: {user.username}</p>
            {/* Display "Student ID" for students and "Admin ID" for admins */}
            <p>
              {user.role === "student" ? "Student ID" : "Admin ID"}:{" "}
              {user.userID}
            </p>
          </div>
        ) : (
          <p>Loading profile data...</p>
        )}
      </div>
    </div>
  );
}

export default Profile;
