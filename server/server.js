require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const User = require("./models/userModel");
const Message = require("./models/messageModel");
const Course = require("./models/courseModel");
const StudentCourses = require("./models/studentCoursesModel");

const app = express();
app.use(express.json());
app.use(cors());

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error(
    "Error: MONGO_URI is not defined in the environment variables."
  );
  process.exit(1);
}

// MongoDB connection
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected to 'BowCourseDB'"))
  .catch((err) => console.error("MongoDB connection error:", err));

// API endpoint to remove a course from the student's list of registered courses
app.delete("/api/studentCourses/:studentId/:courseId", async (req, res) => {
  const { studentId, courseId } = req.params;
  console.log(
    `Received delete request for courseId: ${courseId} and studentId: ${studentId}`
  );

  try {
    console.log(
      `Received delete request for courseId: ${courseId} and studentId: ${studentId}`
    );

    // Find the student's document by studentId
    const studentCourses = await StudentCourses.findOne({ studentId });

    if (!studentCourses) {
      console.log("No document found for this student.");
      return res.status(404).json({ message: "Student courses not found." });
    }

    // Filter out the course to be removed
    const initialCourseCount = studentCourses.courses.length;
    studentCourses.courses = studentCourses.courses.filter(
      (course) => course.courseId.toString() !== courseId
    );

    if (studentCourses.courses.length === initialCourseCount) {
      console.log("Course not found in student's registered courses.");
      return res
        .status(404)
        .json({ message: "Course not found in student's registered courses." });
    }

    await studentCourses.save();
    console.log("Course successfully removed.");
    res.status(200).json({ message: "Course removed successfully!" });
  } catch (error) {
    console.error("Error removing course:", error);
    res.status(500).json({ message: "Failed to remove the course." });
  }
});

// API to get registered courses for a student by studentId
app.get("/api/studentCourses/:studentId", async (req, res) => {
  const { studentId } = req.params;

  try {
    // Fetch student courses and populate the User and Course details
    const studentCourses = await StudentCourses.findOne({ studentId })
      .populate("studentId", "firstName lastName email") // Populate the student's details
      .populate("courses.courseId", "name code term startDate endDate"); // Populate course details

    if (!studentCourses) {
      return res
        .status(404)
        .json({ message: "No courses found for this student." });
    }

    // Return the populated studentCourses data to the frontend
    res.status(200).json(studentCourses.courses);
  } catch (error) {
    console.error("Error fetching student courses:", error);
    res.status(500).json({ message: "Failed to fetch saved courses." });
  }
});

// API to save selected courses for a student
app.post("/api/studentCourses", async (req, res) => {
  const { studentId, selectedCourses } = req.body;

  if (!studentId || !selectedCourses || selectedCourses.length === 0) {
    return res
      .status(400)
      .json({ message: "Student ID and selected courses are required." });
  }

  try {
    // Find the student's existing courses
    let studentCourses = await StudentCourses.findOne({ studentId });

    if (!studentCourses) {
      // Create a new document if none exists
      studentCourses = new StudentCourses({
        studentId,
        courses: [],
      });
    }

    // Handle if only one course is sent
    const coursesToCheck = Array.isArray(selectedCourses)
      ? selectedCourses
      : [selectedCourses];

    // Filter out courses already registered in the same term
    const newCourses = coursesToCheck.filter((course) => {
      return !studentCourses.courses.some(
        (savedCourse) =>
          savedCourse.courseId.toString() === course._id &&
          savedCourse.term === course.term
      );
    });

    // If all selected courses are already registered
    if (newCourses.length === 0) {
      return res.status(400).json({
        message:
          "You have already registered for these courses in the same term.",
      });
    }

    // Add new courses to the student's courses
    newCourses.forEach((course) => {
      studentCourses.courses.push({
        courseId: course._id,
        name: course.name,
        code: course.code,
        term: course.term,
        startDate: course.startDate,
        endDate: course.endDate,
      });
    });

    await studentCourses.save();
    res.status(201).json({ message: "Courses successfully saved!" });
  } catch (error) {
    console.error("Error saving courses:", error);
    res.status(500).json({ message: "Failed to save courses." });
  }
});

// API endpoint to delete a course by ID by admin
app.delete("/api/courses/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCourse = await Course.findByIdAndDelete(id);
    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found." });
    }
    res.status(200).json({ message: "Course deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete course." });
  }
});

// API endpoint to update a course by ID
app.put("/api/courses/:id", async (req, res) => {
  const { id } = req.params;
  const { name, code, program, term, startDate, endDate } = req.body;

  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { name, code, program, term, startDate, endDate },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found." });
    }

    res
      .status(200)
      .json({ message: "Course updated successfully!", updatedCourse });
  } catch (error) {
    res.status(500).json({ message: "Failed to update course." });
  }
});

// API endpoint to create a new course
app.post("/api/courses", async (req, res) => {
  const { name, code, term, startDate, endDate, program } = req.body;

  if (!name || !code || !term || !startDate || !endDate || !program) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const newCourse = new Course({
      name,
      code,
      term,
      startDate,
      endDate,
      program, // Include program in course creation
    });

    await newCourse.save();
    res.status(201).json({ message: "Course created successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to create course." });
  }
});

// API endpoint to fetch courses by program and term
app.get("/api/courses", async (req, res) => {
  const { program, term } = req.query;

  try {
    const query = {};
    if (program) query.program = program;
    if (term) query.term = term;

    const courses = await Course.find(query); // Retrieve courses based on query
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courses." });
  }
});

// API endpoint to fetch all messages
app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find(); // Retrieve all messages from the collection
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages." });
  }
});

// API endpoint to fetch all students
app.get("/api/students", async (req, res) => {
  try {
    // Find all users with role = 'student'
    const students = await User.find({ role: "student" }); // Use role instead of status
    res.status(200).json(students); // Return the list of students
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students." });
  }
});

// API endpoint for sending a message to admin
app.post("/api/messages", async (req, res) => {
  const { sender, studentID, message } = req.body;

  try {
    const newMessage = new Message({
      sender,
      studentID,
      message,
    });

    await newMessage.save();
    res.status(201).json({ message: "Message sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send message." });
  }
});

// API endpoint for signing up a user
app.post("/api/signup", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    birthday,
    program,
    username,
    password,
    role, // Only use role
  } = req.body;

  try {
    // Generate userID based on role
    const userID =
      role === "student"
        ? "SD" + Math.floor(Math.random() * 10000)
        : "AD" + Math.floor(Math.random() * 10000);

    // Create the user without status or programCode
    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      birthday,
      program: role === "student" ? program : null, // Only insert program for students
      username,
      password,
      role, // Keep role as the user identifier
      userID,
      createdAt: new Date(), // Add the createdAt field
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to register user." });
  }
});

// API endpoint for logging in a user
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    // Return success message along with the user data
    res.status(200).json({
      message: "Login successful",
      user, // Send the entire user object to the frontend
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

// API endpoint to fetch user data by username
app.get("/api/user/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user data." });
  }
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
