import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const viewPrograms = () => {
    navigate("/programs");
  };

  return (
    <div className="landing-page">
      <h1>Welcome to Bow Course Registration System</h1>
      <p>
        Your gateway to the best courses, personalized learning experiences, a
        wide variety of programs, tailored to help you succeed in your career
        and academic goals.
      </p>
      <div className="landing-actions">
        <button onClick={handleSignup}>Sign Up</button>
        <button onClick={handleLogin}>Login</button>
        <button onClick={viewPrograms}>View Programs and Courses</button>
      </div>
    </div>
  );
};

export default LandingPage;
