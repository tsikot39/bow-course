import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

function Courses() {
  const [term, setTerm] = useState(""); // Term selection
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // For showing success message
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term
  const [availableCourses, setAvailableCourses] = useState([]); // Store the courses that are available
  const [registeredCourses, setRegisteredCourses] = useState([]); // Store courses that are already registered
  const [student, setStudent] = useState(null); // Store student data
  const navigate = useNavigate();

  // Fetch student data on component mount
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const loggedInUser = sessionStorage.getItem("loggedInUser");
        if (loggedInUser) {
          const response = await fetch(
            `http://localhost:5000/api/user/${loggedInUser}`
          );
          if (response.ok) {
            const studentData = await response.json();
            setStudent(studentData);
            fetchRegisteredCourses(studentData._id); // Fetch registered courses after fetching student data
          } else {
            console.error("Failed to fetch student data.");
          }
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchStudentData();
  }, []);

  // Fetch courses that the student is already registered for
  const fetchRegisteredCourses = async (studentId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/studentCourses/${studentId}`
      );
      if (response.ok) {
        const studentCoursesData = await response.json();
        // Extract the `courseId` from the nested `courses` array in the `studentCourses` document
        const registeredCourseIds = studentCoursesData
          .map((studentCourse) =>
            studentCourse.courses.map((course) => course.courseId.toString())
          )
          .flat(); // Flatten the array
        setRegisteredCourses(registeredCourseIds); // Store the array of registered course IDs
      } else {
        console.error("Failed to fetch registered courses.");
      }
    } catch (error) {
      console.error("Error fetching registered courses:", error);
    }
  };

  // Fetch courses dynamically based on program and term
  useEffect(() => {
    const fetchCourses = async () => {
      if (student && term) {
        try {
          const response = await fetch(
            `http://localhost:5000/api/courses?program=${student.program}&term=${term}`
          );
          if (response.ok) {
            const coursesData = await response.json();
            setAvailableCourses(coursesData); // Store courses in availableCourses
          } else {
            console.error("Failed to fetch courses.");
          }
        } catch (error) {
          console.error("Error fetching courses:", error);
        }
      }
    };

    fetchCourses();
  }, [student, term]);

  // Check if the course is already registered for the student
  const isCourseAlreadyRegistered = (course) => {
    // Compare the available course _id with the registered courseIds
    return registeredCourses.includes(course._id);
  };

  // Handle course registration
  const handleCourseRegister = async (course) => {
    if (isCourseAlreadyRegistered(course)) {
      setErrorMessage("You are already registered to this course.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/studentCourses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: student._id,
          selectedCourses: course, // Send the single course
        }),
      });

      if (response.ok) {
        setSuccessMessage(
          `Successfully registered to ${course.name} (${course.code}).`
        );
        setErrorMessage("");
        fetchRegisteredCourses(student._id); // Refresh the registered courses list
      } else {
        setErrorMessage(`You are already registered to ${course.name}.`);
      }
    } catch (error) {
      setErrorMessage("Error occurred while registering for the course.");
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        onViewDashboard={handleBackToDashboard}
        onLogout={handleLogout}
        showRegister={false}
        showProfile={false}
        showMessage={false}
        showDashboard={true}
        showLogout={true}
        dashboardLabel="Dashboard"
        logoutLabel="Logout"
      />

      <div className="dashboard-content">
        <h1>Bow Course Registration System</h1>
        <h2>Manage Courses</h2>

        {student && (
          <p>
            Hi there, {student.firstName} ({student.role}) 👋🏼
          </p>
        )}

        {successMessage && <p className="error-message">{successMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <div className="mt-20px">
          <select
            value={term}
            onChange={(e) => {
              setTerm(e.target.value);
              if (e.target.value) {
                setErrorMessage("");
              }
            }}
            required
          >
            <option value="" disabled>
              Select Term
            </option>
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
            <option value="Fall">Fall</option>
            <option value="Winter">Winter</option>
          </select>
        </div>

        {term && (
          <div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by course name or code"
            />
          </div>
        )}

        {term && availableCourses.length > 0 && (
          <label>Available courses</label>
        )}

        {term && (
          <ul>
            {availableCourses.length > 0 ? (
              availableCourses
                .filter((course) =>
                  searchTerm === ""
                    ? true
                    : course.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      course.code
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                )
                .map((course) => (
                  <li key={course._id}>
                    <div>
                      <strong>
                        {course.name} ({course.code}) - {course.term}
                      </strong>
                      <br />
                      <small>
                        Start Date:{" "}
                        {new Date(course.startDate).toLocaleDateString("en-GB")}{" "}
                        {"-"} End Date:{" "}
                        {new Date(course.endDate).toLocaleDateString("en-GB")}
                      </small>
                    </div>
                    <div className="button-group">
                      <button
                        onClick={() => handleCourseRegister(course)}
                        disabled={isCourseAlreadyRegistered(course)}
                      >
                        {isCourseAlreadyRegistered(course)
                          ? "Registered"
                          : "Register"}
                      </button>
                    </div>
                  </li>
                ))
            ) : (
              <p>
                No courses available for the selected term or search criteria.
              </p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Courses;
