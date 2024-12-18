import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar"; // Import the Sidebar component

const ProgramsCourses = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate("/"); // Navigate to the home page
  };

  const goToLogin = () => {
    navigate("/login"); // Navigate to the login page
  };

  const goToSignUp = () => {
    navigate("/signup"); // Navigate to the signup page
  };

  const programsData = [
    {
      programCode: "SD-Diploma",
      name: "Software Development - Diploma",
      term: "Winter",
      description:
        "A comprehensive two-year software development diploma program.",
      startDate: "September 5, 2024",
      endDate: "June 15, 2026",
      fees: "$9,254 domestic / $27,735 international",
    },
    {
      programCode: "SD-PostDiploma",
      name: "Software Development - Post-Diploma",
      term: "Winter",
      description:
        "Jumpstart your tech career with our one-year post-diploma program.",
      startDate: "September 5, 2024",
      endDate: "June 15, 2025",
      fees: "$7,895 domestic / $23,675 international",
    },
    {
      programCode: "SD-Certificate",
      name: "Software Development - Certificate",
      term: "Spring",
      description:
        "A six-month intensive certificate program in software development.",
      startDate: "March 1, 2024",
      endDate: "August 31, 2024",
      fees: "$4,500 domestic / $13,500 international",
    },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar
        onViewDashboard={goHome} // Home button
        onLogout={goToSignUp} // Signup button
        onLogin={goToLogin} // Login button
        showDashboard={true} // Show Home button
        showLogout={true} // Show Signup button
        showLogin={true} // Show Login button
        dashboardLabel="Home" // Label for Home
        logoutLabel="Signup" // Label for Signup
        loginLabel="Login" // Label for Login
      />

      <div className="dashboard-content">
        <h1>Bow Course Registration System</h1>
        <h2>Programs and Courses</h2>
        {programsData.map((program, index) => (
          <div key={index} className="program-card">
            <h3>{program.name}</h3>
            <p>{program.description}</p>
            <p>
              <strong>Term:</strong> {program.term}
            </p>
            <p>
              <strong>Start Date:</strong> {program.startDate} |{" "}
              <strong>End Date:</strong> {program.endDate}
            </p>
            <p>
              <strong>Fees:</strong> {program.fees}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgramsCourses;
