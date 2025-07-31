import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, Play, Users } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

function TeacherNavbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/");
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/teacherHome" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-white" />
              <span className="text-2xl font-bold">Tugon</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Dashboard Link */}
                <Link
                  to="/teacherDashboard"
                  className="hover:underline px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>

                {/* TugonSense Link */}
                <Link
                  to="/tugonSense"
                  className="hover:underline px-3 py-2 rounded-md text-sm font-medium"
                >
                  TugonSense
                </Link>

                {/* Create Quiz */}
                <Link
                  to="/create-quiz"
                  className="hover:underline px-3 py-2 rounded-md text-sm font-medium"
                >
                  Create Quiz
                </Link>

                {/* Host Game */}
                <Link
                  to="/host"
                  className="hover:underline px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Host Game
                </Link>

                {/* Join Game */}
                <Link
                  to="/join"
                  className="hover:underline px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <Users className="h-4 w-4 mr-1" />
                  Join Game
                </Link>

                {/* Logout Button */}
                <button
                  onClick={async () => {
                    await signOut();
                    localStorage.removeItem("userType");
                    navigate("/");
                  }}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              // Sign In Button (if user is not logged in)
              <button
                onClick={handleSignIn}
                className="bg-white text-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default TeacherNavbar;