import React from "react";

function Sidebar({
  onRegister, // Function for Register for Courses
  onViewProfile, // Function for View Profile
  onSendMessage, // Function for Send Message to Admin
  onLogout, // Function for Logout
  onViewDashboard, // Function for Home
  onCreateCourse, // Function for Create Course (admin only)
  onViewStudents, // Function for View Students (admin only)
  onViewMessages, // Function for View Messages (admin only)
  showRegister = false, // Control visibility of Register for Courses button
  showProfile = false, // Control visibility of View Profile button
  showMessage = false, // Control visibility of Send Message to Admin button
  showLogout = false, // Control visibility of Logout button
  showDashboard = false, // Control visibility of Home button
  showCreateCourse = false, // Control visibility of Create Course button (admin only)
  showViewStudents = false, // Control visibility of View Students button (admin only)
  showViewMessages = false, // Control visibility of View Messages button (admin only)
  dashboardLabel = "Home", // Custom label for Home button
  profileLabel = "View Profile", // Custom label for View Profile button
  logoutLabel = "Logout", // Custom label for Logout button
}) {
  return (
    <div className="sidebar">
      {/* Home button */}
      {showDashboard && (
        <button onClick={onViewDashboard}>{dashboardLabel}</button>
      )}

      {/* Register for Courses button */}
      {showRegister && <button onClick={onRegister}>Manage Courses</button>}

      {/* Send Message to Admin button */}
      {showMessage && (
        <button onClick={onSendMessage}>Send Message to Admin</button>
      )}

      {/* Create Course button (admin only) */}
      {showCreateCourse && (
        <button onClick={onCreateCourse}>Create Course</button>
      )}

      {/* View Students button (admin only) */}
      {showViewStudents && (
        <button onClick={onViewStudents}>View Students</button>
      )}

      {/* View Messages button (admin only) */}
      {showViewMessages && (
        <button onClick={onViewMessages}>View Messages</button>
      )}

      {/* View Profile button */}
      {showProfile && <button onClick={onViewProfile}>{profileLabel}</button>}

      {/* Logout button */}
      {showLogout && <button onClick={onLogout}>{logoutLabel}</button>}
    </div>
  );
}

export default Sidebar;
