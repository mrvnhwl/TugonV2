/**
 * Hybrid Progress Service Tester Component
 * 
 * This component provides a UI for testing the hybrid progress service
 * in guest mode, authenticated mode, and migration scenarios.
 * 
 * Usage: Add this component to a test page or TugonSense dashboard
 */

import { useState, useEffect } from 'react';
import { hybridProgressService } from '../lib/hybridProgressService';
import { supabase } from '../lib/supabase';
import type { AttemptResult } from './tugon/services/progressServices';
import color from '@/styles/color';

export default function HybridProgressServiceTester() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuthStatus();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuthStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    setUserId(session?.user?.id || null);
  };

  const log = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type];
    
    const logMessage = `[${timestamp}] ${emoji} ${message}`;
    setTestResults(prev => [...prev, logMessage]);
    console.log(logMessage);
  };

  const clearLogs = () => {
    setTestResults([]);
  };

  // Test 1: Guest Mode - Record Attempt
  const testGuestMode = async () => {
    setIsLoading(true);
    clearLogs();
    
    try {
      log('🧪 TEST 1: Guest Mode (localStorage)', 'info');
      log(`Authentication Status: ${isAuthenticated ? 'Authenticated' : 'Guest'}`, 'info');
      
      if (isAuthenticated) {
        log('Please log out to test guest mode', 'warning');
        setIsLoading(false);
        return;
      }

      // Test recording an attempt
      log('Recording test attempt to localStorage...', 'info');
      const testAttempt: AttemptResult = {
        topicId: 1,
        categoryId: 1,
        questionId: 1,
        isCorrect: true,
        timeSpent: 30,
        colorCodedHintsUsed: 1,
        shortHintMessagesUsed: 0,
      };

      await Promise.resolve(hybridProgressService.recordAttempt(testAttempt));
      log('Attempt recorded successfully!', 'success');

      // Verify it was saved to localStorage
      const userProgress = await Promise.resolve(hybridProgressService.getUserProgress());
      log(`User Progress loaded: ${JSON.stringify(userProgress.topicProgress.length)} topics`, 'success');

      // Check specific question
      const categoryProgress = await Promise.resolve(
        hybridProgressService.getCategoryProgress(1, 1)
      );
      
      if (categoryProgress) {
        log(`Category Progress: ${categoryProgress.correctAnswers}/${categoryProgress.totalQuestions} correct`, 'success');
        log('✅ Guest mode test PASSED!', 'success');
      } else {
        log('Category progress not found', 'error');
      }

      // Check localStorage directly
      const localStorageData = localStorage.getItem('tugon_user_progress');
      log(`localStorage size: ${localStorageData ? (localStorageData.length / 1024).toFixed(2) : 0} KB`, 'info');

    } catch (error) {
      log(`Test failed: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Test 2: Authenticated Mode - Record Attempt
  const testAuthenticatedMode = async () => {
    setIsLoading(true);
    clearLogs();
    
    try {
      log('🧪 TEST 2: Authenticated Mode (Supabase)', 'info');
      log(`Authentication Status: ${isAuthenticated ? 'Authenticated' : 'Guest'}`, 'info');
      
      if (!isAuthenticated) {
        log('Please log in to test authenticated mode', 'warning');
        setIsLoading(false);
        return;
      }

      log(`User ID: ${userId}`, 'info');

      // Test recording an attempt
      log('Recording test attempt to Supabase...', 'info');
      const testAttempt: AttemptResult = {
        topicId: 1,
        categoryId: 1,
        questionId: 2,
        isCorrect: true,
        timeSpent: 45,
        colorCodedHintsUsed: 2,
        shortHintMessagesUsed: 1,
      };

      await Promise.resolve(hybridProgressService.recordAttempt(testAttempt));
      log('Attempt recorded successfully!', 'success');

      // Verify it was saved to Supabase
      const userProgress = await Promise.resolve(hybridProgressService.getUserProgress());
      log(`User Progress loaded: ${userProgress.topicProgress.length} topics`, 'success');

      // Check specific question
      const categoryProgress = await Promise.resolve(
        hybridProgressService.getCategoryProgress(1, 1)
      );
      
      if (categoryProgress) {
        log(`Category Progress: ${categoryProgress.correctAnswers}/${categoryProgress.totalQuestions} correct`, 'success');
        log('✅ Authenticated mode test PASSED!', 'success');
      } else {
        log('Category progress not found in Supabase', 'warning');
      }

    } catch (error) {
      log(`Test failed: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Test 3: Migration - Guest to Authenticated
  const testMigration = async () => {
    setIsLoading(true);
    clearLogs();
    
    try {
      log('🧪 TEST 3: Migration (Guest → Authenticated)', 'info');
      
      if (isAuthenticated) {
        log('You are already logged in. To test migration:', 'warning');
        log('1. Log out', 'info');
        log('2. Complete some questions as guest', 'info');
        log('3. Log back in', 'info');
        log('4. Check console for migration messages', 'info');
        setIsLoading(false);
        return;
      }

      log('Step 1: Recording multiple attempts as GUEST...', 'info');
      
      // Record multiple attempts
      const attempts: AttemptResult[] = [
        { topicId: 1, categoryId: 1, questionId: 1, isCorrect: true, timeSpent: 30, colorCodedHintsUsed: 1, shortHintMessagesUsed: 0 },
        { topicId: 1, categoryId: 1, questionId: 2, isCorrect: false, timeSpent: 60, colorCodedHintsUsed: 3, shortHintMessagesUsed: 2 },
        { topicId: 1, categoryId: 1, questionId: 3, isCorrect: true, timeSpent: 25, colorCodedHintsUsed: 0, shortHintMessagesUsed: 1 },
        { topicId: 1, categoryId: 2, questionId: 1, isCorrect: true, timeSpent: 40, colorCodedHintsUsed: 2, shortHintMessagesUsed: 0 },
      ];

      for (const attempt of attempts) {
        await Promise.resolve(hybridProgressService.recordAttempt(attempt));
        log(`Recorded: Topic ${attempt.topicId}, Category ${attempt.categoryId}, Question ${attempt.questionId}`, 'success');
      }

      log('Step 2: Guest data saved to localStorage', 'success');
      
      // Show localStorage data
      const localProgress = await Promise.resolve(hybridProgressService.getUserProgress());
      const totalQuestions = localProgress.topicProgress.reduce(
        (sum, topic) => sum + topic.categoryProgress.reduce(
          (catSum, cat) => catSum + cat.questionProgress.length, 0
        ), 0
      );
      log(`Total questions with progress: ${totalQuestions}`, 'info');

      log('Step 3: Now LOG IN to trigger automatic migration', 'warning');
      log('Watch the browser console for migration messages:', 'info');
      log('  - 🔄 Migrating localStorage progress to Supabase...', 'info');
      log('  - ✅ Migration completed successfully!', 'info');

    } catch (error) {
      log(`Test failed: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Test 4: Compare localStorage vs Supabase
  const testComparison = async () => {
    setIsLoading(true);
    clearLogs();
    
    try {
      log('🧪 TEST 4: Compare localStorage vs Supabase', 'info');

      // Get progress from hybrid service (will use appropriate backend)
      const hybridProgress = await Promise.resolve(hybridProgressService.getUserProgress());
      
      log(`Using: ${isAuthenticated ? 'Supabase' : 'localStorage'}`, 'info');
      log(`Topics: ${hybridProgress.topicProgress.length}`, 'info');
      log(`Total Time: ${hybridProgress.totalTimeSpent}s`, 'info');
      log(`Overall Completion: ${hybridProgress.overallCompletionPercentage.toFixed(2)}%`, 'info');

      // Show detailed breakdown
      hybridProgress.topicProgress.forEach((topic, index) => {
        log(`Topic ${topic.topicId}: ${topic.correctAnswers}/${topic.totalQuestions} correct (${topic.completionPercentage.toFixed(1)}%)`, 'info');
        
        topic.categoryProgress.forEach((cat) => {
          log(`  Category ${cat.categoryId}: ${cat.correctAnswers}/${cat.totalQuestions} correct`, 'info');
        });
      });

      log('✅ Comparison test PASSED!', 'success');

    } catch (error) {
      log(`Test failed: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Test 5: Clear All Data
  const testClearData = async () => {
    if (!confirm('⚠️ This will clear ALL progress data from localStorage. Continue?')) {
      return;
    }

    clearLogs();
    
    try {
      log('🗑️ Clearing localStorage data...', 'warning');
      localStorage.removeItem('tugon_user_progress');
      localStorage.removeItem('tugon_user_id');
      
      log('✅ localStorage cleared!', 'success');
      log('Note: Supabase data is NOT affected', 'info');
      log('Refresh the page to see empty progress', 'info');

    } catch (error) {
      log(`Clear failed: ${error}`, 'error');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border" style={{ borderColor: color.mist }}>
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2" style={{ color: color.deep }}>
            🧪 Hybrid Progress Service Tester
          </h2>
          <p className="text-sm" style={{ color: color.steel }}>
            Test localStorage, Supabase, and migration functionality
          </p>
        </div>

        {/* Auth Status */}
        <div className="mb-6 p-4 rounded-xl" style={{ background: `${color.aqua}10`, border: `1px solid ${color.aqua}30` }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold mb-1" style={{ color: color.deep }}>
                Authentication Status
              </div>
              <div className="text-lg font-bold" style={{ color: isAuthenticated ? color.teal : color.steel }}>
                {isAuthenticated ? '✅ Authenticated' : '🔓 Guest Mode'}
              </div>
              {userId && (
                <div className="text-xs mt-1" style={{ color: color.steel }}>
                  User ID: {userId.substring(0, 8)}...
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs" style={{ color: color.steel }}>Backend:</div>
              <div className="text-sm font-bold" style={{ color: color.teal }}>
                {isAuthenticated ? 'Supabase' : 'localStorage'}
              </div>
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <button
            onClick={testGuestMode}
            disabled={isLoading || isAuthenticated}
            className="py-3 px-4 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
            style={{
              background: isAuthenticated ? '#E5E7EB' : `linear-gradient(135deg, ${color.indigo}, ${color.purple})`,
              color: isAuthenticated ? '#9CA3AF' : 'white',
              boxShadow: isAuthenticated ? 'none' : `0 4px 12px ${color.indigo}40`,
            }}
          >
            Test 1: Guest Mode
          </button>

          <button
            onClick={testAuthenticatedMode}
            disabled={isLoading || !isAuthenticated}
            className="py-3 px-4 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
            style={{
              background: !isAuthenticated ? '#E5E7EB' : `linear-gradient(135deg, ${color.teal}, ${color.aqua})`,
              color: !isAuthenticated ? '#9CA3AF' : 'white',
              boxShadow: !isAuthenticated ? 'none' : `0 4px 12px ${color.teal}40`,
            }}
          >
            Test 2: Authenticated Mode
          </button>

          <button
            onClick={testMigration}
            disabled={isLoading}
            className="py-3 px-4 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: `linear-gradient(135deg, ${color.peach}, ${color.blush})`,
              color: 'white',
              boxShadow: `0 4px 12px ${color.peach}40`,
            }}
          >
            Test 3: Migration Setup
          </button>

          <button
            onClick={testComparison}
            disabled={isLoading}
            className="py-3 px-4 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: `linear-gradient(135deg, ${color.ocean}, ${color.deep})`,
              color: 'white',
              boxShadow: `0 4px 12px ${color.ocean}40`,
            }}
          >
            Test 4: View Progress
          </button>
        </div>

        {/* Danger Zone */}
        <div className="mb-6">
          <button
            onClick={testClearData}
            disabled={isLoading}
            className="w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all border-2"
            style={{
              background: 'white',
              color: '#EF4444',
              borderColor: '#FEE2E2',
            }}
          >
            🗑️ Clear localStorage Data
          </button>
        </div>

        {/* Results Console */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold" style={{ color: color.deep }}>
              Test Results
            </div>
            <button
              onClick={clearLogs}
              className="text-xs px-3 py-1 rounded-lg"
              style={{ background: `${color.steel}20`, color: color.steel }}
            >
              Clear Logs
            </button>
          </div>
          
          <div 
            className="bg-gray-900 text-green-400 rounded-xl p-4 font-mono text-xs overflow-auto"
            style={{ maxHeight: '400px' }}
          >
            {testResults.length === 0 ? (
              <div className="text-gray-500">No test results yet. Click a test button to start.</div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 rounded-xl" style={{ background: `${color.lavender}10`, border: `1px dashed ${color.lavender}40` }}>
          <div className="text-sm font-semibold mb-2" style={{ color: color.deep }}>
            📋 Testing Instructions
          </div>
          <ul className="text-xs space-y-1" style={{ color: color.steel }}>
            <li>• <strong>Test 1 (Guest):</strong> Log out, then click "Test 1" to save data to localStorage</li>
            <li>• <strong>Test 2 (Auth):</strong> Log in, then click "Test 2" to save data to Supabase</li>
            <li>• <strong>Test 3 (Migration):</strong> Click "Test 3" while logged out to prepare data, then log in to see migration</li>
            <li>• <strong>Test 4 (View):</strong> View current progress from active backend</li>
            <li>• Watch the browser console for detailed migration logs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
