import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [program, setProgram] = useState(""); // Store selected program
  const [term, setTerm] = useState(""); // Store selected term
  const [filteredCourses, setFilteredCourses] = useState([]); // Filtered courses based on program and term
  const [editingCourse, setEditingCourse] = useState(null); // Store the course being edited
  const [editedFields, setEditedFields] = useState({}); // Store edited fields
  const navigate = useNavigate();

  // Fetch user data from session
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const loggedInUser = sessionStorage.getItem("loggedInUser");

        if (loggedInUser) {
          const response = await fetch(
            `http://localhost:5000/api/user/${loggedInUser}`
          );
          if (response.ok) {
            const data = await response.json();
            setUser(data);

            // If student, fetch their selected courses
            if (data.role === "student") {
              fetchStudentCourses(data._id);
            }
          } else {
            console.error("Failed to fetch user data.");
          }
        } else {
          console.error("No user logged in.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Fetch courses selected by the student
  const fetchStudentCourses = async (studentId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/studentCourses/${studentId}`
      );
      if (response.ok) {
        const data = await response.json();
        setFilteredCourses(data); // Update the courses with the fetched data
      } else {
        console.error("Failed to fetch student courses.");
      }
    } catch (error) {
      console.error("Error fetching student courses:", error);
    }
  };

  // Fetch courses based on selected program and term
  const fetchCourses = async (selectedProgram, selectedTerm) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/courses?program=${selectedProgram}&term=${selectedTerm}`
      );
      if (response.ok) {
        const data = await response.json();
        setFilteredCourses(data); // Update filtered courses based on response
      } else {
        console.error("Failed to fetch courses.");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleProgramChange = (e) => {
    setProgram(e.target.value);
    setTerm(""); // Reset term when a new program is selected
    setFilteredCourses([]); // Clear filtered courses
  };

  const handleTermChange = (e) => {
    const selectedTerm = e.target.value;
    setTerm(selectedTerm);

    // Fetch courses based on selected program and term
    if (program && selectedTerm) {
      fetchCourses(program, selectedTerm);
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course); // Set the course being edited

    // Pre-fill the form with course data, including formatted startDate and endDate
    setEditedFields({
      ...course,
      startDate: new Date(course.startDate).toISOString().split("T")[0],
      endDate: new Date(course.endDate).toISOString().split("T")[0],
    });
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setEditedFields({ ...editedFields, [name]: value }); // Update the fields with the edited values
  };

  const handleUpdateCourse = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/courses/${editingCourse._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedFields),
        }
      );
      if (response.ok) {
        setEditingCourse(null); // Clear the editing state
        fetchCourses(program, term); // Refresh the courses after editing
      } else {
        console.error("Failed to update course.");
      }
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

  const handleRemoveCourse = async (courseId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/courses/${courseId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        console.log("Course removed successfully from student's list.");

        // Update the local state to reflect the removal of the course
        setFilteredCourses(
          filteredCourses.filter((course) => course._id !== courseId)
        );
      } else {
        console.error("Failed to remove course.");
        const errorText = await response.text();
        console.error("Error details:", errorText); // Log any error messages from the server
      }
    } catch (error) {
      console.error("Error removing course:", error);
    }
  };

  const handleStudentRemoveCourse = async (courseId) => {
    console.log(
      `Attempting to remove course with courseId: ${courseId} for studentId: ${user._id}`
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/studentCourses/${user._id}/${courseId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        console.log("Course removed successfully from student's list.");

        // Re-fetch the updated list of courses to ensure the UI reflects the current data
        await fetchStudentCourses(user._id);
      } else {
        const errorText = await response.text();
        console.error("Failed to remove course:", errorText);
      }
    } catch (error) {
      console.error("Error removing course:", error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        onViewDashboard={() => navigate("/dashboard")}
        onCreateCourse={
          user && user.role === "admin"
            ? () => navigate("/create-course")
            : null
        }
        onViewStudents={
          user && user.role === "admin" ? () => navigate("/students") : null
        }
        onViewMessages={
          user && user.role === "admin" ? () => navigate("/messages") : null
        }
        onRegister={
          user && user.role === "student" ? () => navigate("/courses") : null
        }
        onViewProfile={() =>
          navigate("/profile", { state: { username: user.username } })
        }
        onSendMessage={
          user && user.role === "student" ? () => navigate("/message") : null
        }
        showCreateCourse={user && user.role === "admin"}
        showViewStudents={user && user.role === "admin"}
        showViewMessages={user && user.role === "admin"}
        showRegister={user && user.role === "student"}
        showMessage={user && user.role === "student"}
        showProfile={true}
        showLogout={true}
        onLogout={handleLogout}
      />

      <div className="dashboard-content">
        <h1>Bow Course Registration System</h1>
        <h2>Dashboard</h2>
        {user ? (
          user.role === "student" ? (
            <div>
              <p>
                Hi there, {user.firstName} ({user.role}) 👋🏼
              </p>
              <p>Student ID: {user.userID}</p>
              <p>Program: {user.program}</p>
              <p>Department: Software Development</p>

              <div className="mt-20px">
                <label>Registered Courses</label>
                {filteredCourses.length > 0 ? (
                  <ul>
                    {filteredCourses.map((course) => (
                      <li key={course.courseId}>
                        <div>
                          <strong>
                            {course.name} ({course.code}) - {course.term}
                          </strong>
                          <br />
                          <small>
                            Start Date:{" "}
                            {new Date(course.startDate).toLocaleDateString(
                              "en-GB"
                            )}{" "}
                            {"-"} End Date:{" "}
                            {new Date(course.endDate).toLocaleDateString(
                              "en-GB"
                            )}
                          </small>
                        </div>
                        <div className="button-group">
                          <button
                            onClick={() =>
                              handleStudentRemoveCourse(
                                course.courseId?._id?.toString() ||
                                  course.courseId.toString()
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No courses registered.</p>
                )}
              </div>
            </div>
          ) : user.role === "admin" ? (
            <>
              <p>
                Hi there, {user.firstName} ({user.role}) 👋🏼
              </p>
              <div className="mt-20px">
                <select value={program} onChange={handleProgramChange} required>
                  <option value="" disabled>
                    Select Program
                  </option>
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
              </div>

              {program && (
                <div>
                  <select value={term} onChange={handleTermChange} required>
                    <option value="" disabled>
                      Select Term
                    </option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Fall">Fall</option>
                    <option value="Winter">Winter</option>
                  </select>
                </div>
              )}

              {term && filteredCourses.length > 0 ? (
                <ul>
                  {filteredCourses.map((course) => (
                    <li key={course._id}>
                      <div>
                        <strong>
                          {course.name} ({course.code}) - {course.term}
                        </strong>
                        <br />
                        <small>
                          Start Date:{" "}
                          {new Date(course.startDate).toLocaleDateString(
                            "en-GB"
                          )}{" "}
                          {"-"} End Date:{" "}
                          {new Date(course.endDate).toLocaleDateString("en-GB")}
                        </small>
                      </div>
                      <div className="button-group">
                        <button onClick={() => handleEditCourse(course)}>
                          Edit
                        </button>
                        <button onClick={() => handleRemoveCourse(course._id)}>
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                term && (
                  <p>No courses available for the selected program and term.</p>
                )
              )}

              {/* Show edit form if a course is being edited */}
              {editingCourse && (
                <div className="edit-course-section">
                  <h3>Edit Course: {editingCourse.name}</h3>
                  <form>
                    <label>Course Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editedFields.name}
                      onChange={handleFieldChange}
                      required
                    />
                    <label>Course Code</label>
                    <input
                      type="text"
                      name="code"
                      value={editedFields.code}
                      onChange={handleFieldChange}
                      required
                    />
                    <select
                      name="program"
                      value={editedFields.program}
                      onChange={handleFieldChange}
                      required
                    >
                      <option value="Diploma">Diploma</option>
                      <option value="Post-Diploma">Post-Diploma</option>
                      <option value="Certificate">Certificate</option>
                    </select>
                    <select
                      name="term"
                      value={editedFields.term}
                      onChange={handleFieldChange}
                      required
                    >
                      <option value="Spring">Spring</option>
                      <option value="Summer">Summer</option>
                      <option value="Fall">Fall</option>
                      <option value="Winter">Winter</option>
                    </select>
                    <label>Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={editedFields.startDate}
                      onChange={handleFieldChange}
                      required
                    />
                    <label>End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={editedFields.endDate}
                      onChange={handleFieldChange}
                      required
                    />
                    <button type="button" onClick={handleUpdateCourse}>
                      Update Course
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCourse(null)}
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <p>User role not recognized.</p>
          )
        ) : (
          <p>Loading user data...</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
