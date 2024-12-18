import "./App.css";

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Courses from "./components/Courses";
import Profile from "./components/Profile";
import Welcome from "./components/Welcome";
import NonStudents from "./components/NonStudents";
import Login from "./components/Login";
import CreateCourse from "./components/CreateCourse";
import StudentList from "./components/StudentList";
import SendMessage from "./components/SendMessage";
import ViewMessages from "./components/ViewMessages";

function App() {
  return (
    <Router>
      <div>
        <div className="container">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/programs" element={<NonStudents />} />
            <Route path="/create-course" element={<CreateCourse />} />
            <Route path="/students" element={<StudentList />} />
            <Route path="/message" element={<SendMessage />} />
            <Route path="/messages" element={<ViewMessages />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
