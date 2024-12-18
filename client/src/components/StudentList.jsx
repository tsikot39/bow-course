import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [admin, setAdmin] = useState(null); // State for storing admin details
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    order: "desc",
  }); // Sorting configuration
  const navigate = useNavigate();

  // Fetch admin details and students list from the server
  useEffect(() => {
    const fetchAdminAndStudents = async () => {
      try {
        const loggedInUser = sessionStorage.getItem("loggedInUser");

        // Fetch admin details
        if (loggedInUser) {
          const adminResponse = await fetch(
            `http://localhost:5000/api/user/${loggedInUser}`
          );
          if (adminResponse.ok) {
            const adminData = await adminResponse.json();
            setAdmin(adminData);
          } else {
            console.error("Failed to fetch admin data.");
          }
        }

        // Fetch students list
        const studentsResponse = await fetch(
          "http://localhost:5000/api/students"
        );
        if (studentsResponse.ok) {
          let studentData = await studentsResponse.json();
          setStudents(studentData); // Initially set students without sorting
        } else {
          console.error("Failed to fetch students.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAdminAndStudents();
  }, []);

  // Sorting logic
  const handleSort = (key) => {
    const newSortOrder =
      sortConfig.key === key && sortConfig.order === "asc" ? "desc" : "asc";

    const sortedStudents = [...students].sort((a, b) => {
      if (key === "createdAt") {
        return newSortOrder === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      } else if (key === "name") {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        if (nameA < nameB) return newSortOrder === "asc" ? -1 : 1;
        if (nameA > nameB) return newSortOrder === "asc" ? 1 : -1;
        return 0;
      } else if (key === "program") {
        const programA = a.program.toLowerCase();
        const programB = b.program.toLowerCase();
        if (programA < programB) return newSortOrder === "asc" ? -1 : 1;
        if (programA > programB) return newSortOrder === "asc" ? 1 : -1;
        return 0;
      }
      return 0;
    });

    setStudents(sortedStudents);
    setSortConfig({ key, order: newSortOrder });
  };

  const handleViewDashboard = () => {
    navigate("/dashboard"); // Navigate to the dashboard
  };

  const handleLogout = () => {
    sessionStorage.removeItem("loggedInUser"); // Clear session
    navigate("/login"); // Navigate to home or login page after logout
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

        <h2>Registered Students</h2>

        {/* Display admin welcome message */}
        {admin && (
          <p>
            Hi there, {admin.firstName} ({admin.role}) 👋🏼
          </p>
        )}
        <div className="mt-20px">
          {students.length > 0 ? (
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
                    onClick={() => handleSort("name")} // Sort by Name
                  >
                    Name{" "}
                    {sortConfig.key === "name" &&
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
                      cursor: "pointer",
                    }}
                    onClick={() => handleSort("program")} // Sort by Program
                  >
                    Program{" "}
                    {sortConfig.key === "program" &&
                      (sortConfig.order === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                    onClick={() => handleSort("createdAt")} // Sort by Date Registered
                  >
                    Date Registered{" "}
                    {sortConfig.key === "createdAt" &&
                      (sortConfig.order === "asc" ? "▲" : "▼")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.userID}>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {student.firstName} {student.lastName}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {student.userID}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {student.program}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {new Date(student.createdAt).toLocaleDateString()}{" "}
                      {new Date(student.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No students registered yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentList;
