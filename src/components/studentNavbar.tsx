import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Trophy, Sword } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Text, Small } from './Typography';
import { cn } from './cn';

function StudentNavbar({ className = "" }: { className?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
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
    <nav className={cn("bg-white shadow-lg", className)}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/studentHome" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-indigo-600" />
              <Text className="text-2xl font-bold text-indigo-600">Tugon</Text>
            </Link>
          </div>

          {/* Hamburger menu button (mobile) */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-indigo-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Navigation Links (desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/studentDashboard" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                <Link to="/tugonSense" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">TugonSense</Link>
                <Link to="/challenge" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"><Sword className="h-4 w-4 mr-1" />Challenge</Link>
                <Link to="/leaderboards" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"><Trophy className="h-4 w-4 mr-1" />Leaderboards</Link>
                <button onClick={handleSignOut} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">Sign Out</button>
              </>
            ) : (
              <button onClick={handleSignIn} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">Sign In</button>
            )}
          </div>
        </div>
        {/* Mobile menu, show/hide based on menuOpen */}
        {menuOpen && (
          <div className="md:hidden mt-2 space-y-1 pb-4">
            {user ? (
              <>
                <Link to="/studentDashboard" className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium">Dashboard</Link>
                <Link to="/tugonSense" className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium">TugonSense</Link>
                <Link to="/challenge" className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium flex items-center"><Sword className="h-4 w-4 mr-1" />Challenge</Link>
                <Link to="/leaderboards" className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium flex items-center"><Trophy className="h-4 w-4 mr-1" />Leaderboards</Link>
                <button onClick={handleSignOut} className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-indigo-700 mt-2">Sign Out</button>
              </>
            ) : (
              <button onClick={handleSignIn} className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-indigo-700">Sign In</button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default StudentNavbar;
