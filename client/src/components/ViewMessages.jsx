import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

const ViewMessages = () => {
  const [messages, setMessages] = useState([]);
  const [admin, setAdmin] = useState(null); // State for storing admin details
  const [sortConfig, setSortConfig] = useState({
    key: "timestamp",
    order: "desc",
  }); // Sorting configuration
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/messages");
        if (response.ok) {
          const data = await response.json();
          setMessages(data); // Initially set messages without sorting
        } else {
          console.error("Failed to fetch messages.");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    // Fetch admin details from session or API
    const loggedInUser = sessionStorage.getItem("loggedInUser");
    if (loggedInUser) {
      fetch(`http://localhost:5000/api/user/${loggedInUser}`)
        .then((res) => res.json())
        .then((data) => {
          setAdmin(data);
        })
        .catch((err) => console.error("Failed to fetch admin data", err));
    }

    fetchMessages();
  }, []);

  // Sorting logic
  const handleSort = (key) => {
    const newSortOrder =
      sortConfig.key === key && sortConfig.order === "asc" ? "desc" : "asc";

    const sortedMessages = [...messages].sort((a, b) => {
      if (key === "timestamp") {
        return newSortOrder === "asc"
          ? new Date(a.timestamp) - new Date(b.timestamp)
          : new Date(b.timestamp) - new Date(a.timestamp);
      } else if (key === "sender") {
        const senderA = a.sender.toLowerCase();
        const senderB = b.sender.toLowerCase();
        if (senderA < senderB) return newSortOrder === "asc" ? -1 : 1;
        if (senderA > senderB) return newSortOrder === "asc" ? 1 : -1;
        return 0;
      }
      return 0;
    });

    setMessages(sortedMessages);
    setSortConfig({ key, order: newSortOrder });
  };

  const handleViewDashboard = () => {
    navigate("/dashboard");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("loggedInUser");
    navigate("/");
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
        <h2>Messages from Students</h2>

        {/* Display the admin's name and role */}
        {admin && (
          <p>
            Hi there, {admin.firstName} ({admin.role}) 👋🏼
          </p>
        )}
        <div className="mt-20px">
          {messages.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                    onClick={() => handleSort("sender")} // Sort by Sender
                  >
                    Name{" "}
                    {sortConfig.key === "sender" &&
                      (sortConfig.order === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    ID
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    Message
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                    onClick={() => handleSort("timestamp")} // Sort by Date Sent
                  >
                    Date Sent{" "}
                    {sortConfig.key === "timestamp" &&
                      (sortConfig.order === "asc" ? "▲" : "▼")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg._id}>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {msg.sender}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {msg.studentID}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {msg.message}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {msg.timestamp
                        ? new Date(msg.timestamp).toLocaleString()
                        : "No date available"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No messages available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewMessages;
