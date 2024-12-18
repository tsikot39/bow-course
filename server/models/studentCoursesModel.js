const mongoose = require("mongoose");

const studentCoursesSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming the student references a User model
    required: true,
  },
  courses: [
    {
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course", // Assuming the course references a Course model
        required: true,
      },
      name: { type: String, required: true },
      code: { type: String, required: true },
      term: { type: String, required: true },
      startDate: { type: Date },
      endDate: { type: Date },
    },
  ],
});

const StudentCourses = mongoose.model("StudentCourses", studentCoursesSchema);

module.exports = StudentCourses;
