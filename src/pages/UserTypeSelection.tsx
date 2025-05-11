import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, GraduationCap } from "lucide-react"; // Icons for Teacher and Student
import { motion } from "framer-motion";

function UserTypeSelection() {
  const navigate = useNavigate();

  useEffect(() => {
    // Ensure the Navbar is hidden by adding a class to the body or root element
    document.body.classList.add("hide-navbar");

    // Cleanup to remove the class when the component unmounts
    return () => {
      document.body.classList.remove("hide-navbar");
    };
  }, []);

  const handleUserTypeSelection = (userType: string) => {
    localStorage.setItem("userType", userType); // Save userType in localStorage
    if (userType === "student") {
      navigate("/studentDashboard");
    } else if (userType === "teacher") {
      navigate("/teacherDashboard");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <motion.div
          className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">Who are you?</h1>
          <p className="text-gray-600">Please select to continue.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Teacher Option */}
            <button
              onClick={() => handleUserTypeSelection("teacher")} // Redirect to Teacher Dashboard
              className="flex flex-col items-center justify-center space-y-4 px-6 py-8 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl shadow-md transition-all"
            >
              <User className="h-12 w-12" />
              <span className="text-lg font-semibold">Teacher</span>
            </button>

            {/* Student Option */}
            <button
              onClick={() => handleUserTypeSelection("student")} // Redirect to Student Dashboard
              className="flex flex-col items-center justify-center space-y-4 px-6 py-8 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl shadow-md transition-all"
            >
              <GraduationCap className="h-12 w-12" />
              <span className="text-lg font-semibold">Student</span>
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default UserTypeSelection;