import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Lock, UserPlus, LogIn } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-tr from-indigo-50 to-indigo-100">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl"
      >
        <div className="text-center">
          <motion.div
            initial={{ rotate: -15 }}
            animate={{ rotate: 15 }}
            transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
            className="flex justify-center mb-4"
          >
            {isSignUp ? (
              <UserPlus className="h-12 w-12 text-indigo-600" />
            ) : (
              <Lock className="h-12 w-12 text-indigo-600" />
            )}
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-800">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-400"
            />

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2 px-4 text-white bg-indigo-600 rounded-md shadow-md hover:bg-indigo-700"
          >
            {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            {isSignUp ? 'Sign up' : 'Sign in'}
          </motion.button>

          <div className="text-center">
            <button
              type="button"
              className="text-indigo-600 hover:text-indigo-500 text-sm"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;
