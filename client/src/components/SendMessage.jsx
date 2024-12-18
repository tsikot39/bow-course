import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

const SendMessage = () => {
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState(""); // State for confirmation message
  const [student, setStudent] = useState(null); // State to store student details
  const navigate = useNavigate();

  // Fetch student data when the component mounts
  useEffect(() => {
    const loggedInUser = sessionStorage.getItem("loggedInUser");

    if (loggedInUser) {
      // Fetch student details from the server
      const fetchStudentData = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/api/user/${loggedInUser}`
          );
          if (response.ok) {
            const data = await response.json();
            setStudent(data); // Set the student data
          }
        } catch (error) {
          console.error("Failed to fetch student data", error);
        }
      };

      fetchStudentData();
    }
  }, []);

  // Function to handle message submission
  const handleSendMessage = async () => {
    if (!message.trim()) {
      setConfirmation("Please enter a message.");
      return;
    }

    try {
      // Send the message to the server with studentID included
      const response = await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: student
            ? `${student.firstName} ${student.lastName}`
            : "Unknown",
          studentID: student ? student.userID : "Unknown", // Include studentID in the message
          message,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(""); // Clear the textarea
        setConfirmation("Message sent to admin.");
      } else {
        setConfirmation(result.message);
      }
    } catch (error) {
      setConfirmation("Failed to send the message.");
    }
  };

  const handleViewDashboard = () => {
    navigate("/dashboard"); // Navigate to the dashboard
  };

  const handleLogout = () => {
    sessionStorage.removeItem("loggedInUser"); // Clear session or role
    navigate("/"); // Navigate to home or login page after logout
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        showDashboard={true}
        onViewDashboard={handleViewDashboard}
        showLogout={true}
        onLogout={handleLogout}
        dashboardLabel="Dashboard"
      />
      <div className="dashboard-content">
        <h1>Bow Course Registration System</h1>
        <h2>Send Message to Admin</h2>

        <div>
          {student && (
            <p>
              Hi there, {student.firstName} ({student.role}) 👋🏼
            </p>
          )}
        </div>

        {confirmation && <p className="error-message">{confirmation}</p>}
        <div className="mt-20px">
          <textarea
            rows="5"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
            }}
          />
          <button
            onClick={handleSendMessage}
            style={{
              padding: "10px 20px",
              backgroundColor: "#3498db",
              color: "white",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Send to Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendMessage;
