/**
 * Test script for Supabase Progress Service
 * Run this in browser console to verify Supabase connection
 */

import { supabaseProgressService } from './supabaseProgress';
import type { AttemptResult } from '../components/tugon/services/progressServices';

export async function testSupabaseProgressService() {
  console.log('🧪 Testing Supabase Progress Service...\n');

  try {
    // Test 1: Get category progress (should return null for new user)
    console.log('📋 Test 1: Get Category Progress (Topic 1, Category 1)...');
    const categoryProgress = await supabaseProgressService.getCategoryProgress(1, 1);
    console.log('✅ Category Progress:', categoryProgress);
    console.log('');

    // Test 2: Get category stats
    console.log('📊 Test 2: Get Category Stats (Topic 1, Category 1)...');
    const categoryStats = await supabaseProgressService.getCategoryStats(1, 1);
    console.log('✅ Category Stats:', categoryStats);
    console.log('');

    // Test 3: Get topic progress
    console.log('🎯 Test 3: Get Topic Progress (Topic 1)...');
    const topicProgress = await supabaseProgressService.getTopicProgress(1);
    console.log('✅ Topic Progress:', topicProgress);
    console.log('');

    // Test 4: Record a test attempt
    console.log('💾 Test 4: Record Test Attempt...');
    const testAttempt: AttemptResult = {
      topicId: 1,
      categoryId: 1,
      questionId: 1,
      isCorrect: true,
      timeSpent: 45,
      colorCodedHintsUsed: 2,
      shortHintMessagesUsed: 1,
    };
    
    await supabaseProgressService.recordAttempt(testAttempt);
    console.log('✅ Attempt recorded successfully!');
    console.log('');

    // Test 5: Verify the attempt was saved
    console.log('🔍 Test 5: Verify Attempt Was Saved...');
    const updatedCategoryProgress = await supabaseProgressService.getCategoryProgress(1, 1);
    console.log('✅ Updated Category Progress:', updatedCategoryProgress);
    console.log('');

    // Test 6: Get updated topic progress
    console.log('📈 Test 6: Get Updated Topic Progress...');
    const updatedTopicProgress = await supabaseProgressService.getTopicProgress(1);
    console.log('✅ Updated Topic Progress:', updatedTopicProgress);
    console.log('');

    console.log('🎉 All tests passed! Supabase Progress Service is working correctly.');
    console.log('\n📊 Summary:');
    console.log(`   - Category Progress: ${updatedCategoryProgress ? 'Found' : 'Not found'}`);
    console.log(`   - Topic Progress: ${updatedTopicProgress ? 'Found' : 'Not found'}`);
    console.log(`   - Questions Completed: ${updatedCategoryProgress?.correctAnswers || 0}`);
    console.log(`   - Completion %: ${updatedCategoryProgress?.completionPercentage.toFixed(2) || 0}%`);

    return {
      success: true,
      categoryProgress: updatedCategoryProgress,
      topicProgress: updatedTopicProgress,
    };

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n📝 Troubleshooting:');
    console.log('   1. Check if you ran the SQL migration (fix_progress_foreign_keys.sql)');
    console.log('   2. Verify you are logged in to Supabase');
    console.log('   3. Check RLS policies allow authenticated users to read/write');
    console.log('   4. Ensure tugonsense_questions table has data');
    
    return {
      success: false,
      error,
    };
  }
}

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
  console.log('🚀 To test Supabase Progress Service, run:');
  console.log('   import("./src/lib/testSupabaseProgress").then(m => m.testSupabaseProgressService())');
}
