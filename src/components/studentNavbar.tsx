import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Trophy, Sword } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

function StudentNavbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    localStorage.removeItem('userType');
    navigate('/');
  };

  const handleSignIn = () => {
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/studentHome" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-indigo-600" />
              <span className="text-2xl font-bold text-indigo-600">Tugon</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Dashboard Link */}
                <Link
                  to="/studentDashboard"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>

                {/* TugonSense Link */}
                <Link
                  to="/tugonSense"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  TugonSense
                </Link>

                {/* Challenge */}
                <Link
                  to="/challenge"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <Sword className="h-4 w-4 mr-1" />
                  Challenge
                </Link>

                {/* Leaderboards */}
                <Link
                  to="/leaderboards"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <Trophy className="h-4 w-4 mr-1" />
                  Leaderboards
                </Link>

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              // Sign In Button (if user is not logged in)
              <button
                onClick={handleSignIn}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
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

export default StudentNavbar;
